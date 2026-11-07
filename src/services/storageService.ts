import type {
  AppSettings,
  ActiveProgram,
  CompletedWorkout,
  WorkoutTemplate,
  ActiveWorkout,
  Exercise,
  ExerciseSession,
  ReadinessLevel
} from '../types/index.ts';
import { DEFAULT_TEMPLATES } from '../data/defaultTemplates';
import { EXERCISE_CATALOG, type CatalogExerciseItem } from '../data/exerciseCatalog';
import { workoutNameLabel } from '../utils/uiLabels';
import { createTrialSet } from '../utils/trialSet';
import { roundWeight } from '../utils/roundWeight';
import { sanitizeNumber } from '../utils/workoutMath';
import {
  normalizeMuscleCategory,
  normalizeEquipment,
  resolveAnimationType,
  resolveTechnique,
  resolveAlternatives
} from '../utils/catalogEnrichment';

export { normalizeMuscleCategory, normalizeEquipment };

export const LOCALSTORAGE_BUDGET_BYTES = 5 * 1024 * 1024;


export function buildRawStorageDump(storage: Storage): string {
  const dump: Record<string, string | null> = {};
  const keys: string[] = [];
  for (let index = 0; index < storage.length; index += 1) {
    const key = storage.key(index);
    if (key?.startsWith('ironforge_')) {
      keys.push(key);
    }
  }
  keys.sort();
  for (const key of keys) {
    dump[key] = storage.getItem(key);
  }
  return JSON.stringify(dump, null, 2);
}

export function getLocalStorageUsage(storage: Storage): number {
  let bytes = 0;
  for (let index = 0; index < storage.length; index += 1) {
    const key = storage.key(index);
    if (key?.startsWith('ironforge_')) bytes += (key.length + (storage.getItem(key)?.length ?? 0)) * 2;
  }
  return bytes;
}

const STORAGE_KEYS = {
  TEMPLATES: 'ironforge_templates_v1',
  HISTORY: 'ironforge_history_v1',
  SETTINGS: 'ironforge_settings_v1',
  ACTIVE_WORKOUT: 'ironforge_active_session_v1',
  CUSTOM_EXERCISES: 'ironforge_custom_exercises_v1',
  EMERGENCY_SNAPSHOT: 'ironforge_emergency_snapshot_v1',
  ACTIVE_PROGRAM: 'ironforge_active_program_v1'
};

const TEMPLATES_VERSION = 'v4.0';

const DEFAULT_SETTINGS: AppSettings = {
  soundEnabled: true,
  vibrationEnabled: true,
  voiceEnabled: true,
  focusModeDefault: true,
  defaultRestSeconds: 90,
  barbellWeightKg: 20,
  unit: 'kg',
  theme: 'dark',
  currentWeek: 'A'
};
const corruptKeys = new Set<string>();

function preserveCorruptValue(key: string) {
  if (!corruptKeys.has(key)) return;
  const raw = localStorage.getItem(key);
  if (raw == null) return;
  const prefix = `ironforge_corrupt_${key}_`;
  for (let i = 0; i < localStorage.length; i += 1) if (localStorage.key(i)?.startsWith(prefix)) return;
  const archiveKey = `${prefix}${Date.now()}`;
  localStorage.setItem(archiveKey, raw);
  console.warn(`Preserved corrupt localStorage value: ${key}`);
}

function cloneDefaultTemplates(): WorkoutTemplate[] {
  return JSON.parse(JSON.stringify(DEFAULT_TEMPLATES));
}

export function migrateExercise(rawEx: any): Exercise {
  if (!rawEx || typeof rawEx !== 'object') {
    return {
      id: 'ex-' + Date.now(),
      name: 'Упражнение',
      category: 'Chest',
      equipment: 'barbell',
      animationType: 'bench-press',
      targetSets: 3,
      minReps: 8,
      maxReps: 12,
      weightStep: 2.5,
      currentWeight: 50,
      restSeconds: 90,
      alternatives: ['db-bench-press', 'hammer-chest-press'],
      history: []
    };
  }

  const catalogItem = EXERCISE_CATALOG[rawEx.id];
  const category = catalogItem?.category || normalizeMuscleCategory(rawEx.category);
  const equipment = catalogItem?.equipment || normalizeEquipment(rawEx.equipment, rawEx.name);
  const exerciseId = rawEx.id || ('ex-' + Date.now());

  return {
    id: exerciseId,
    name: rawEx.name || catalogItem?.name || 'Упражнение',
    category,
    equipment,
    animationType: resolveAnimationType(category, catalogItem?.animationType, rawEx.animationType),
    gifUrl: catalogItem?.gifUrl || rawEx.gifUrl,
    technique: resolveTechnique(category, catalogItem?.technique, rawEx.technique),
    alternatives: resolveAlternatives(exerciseId, category, catalogItem?.alternatives, rawEx.alternatives),
    weekVariant: rawEx.weekVariant || 'both',
    supersetGroupId: rawEx.supersetGroupId,
    targetSets: Number(rawEx.targetSets) || catalogItem?.defaultSets || 3,
    minReps: exerciseId === 'plank' ? 0 : Number(rawEx.minReps) || catalogItem?.minReps || 8,
    maxReps: exerciseId === 'plank' ? 0 : Number(rawEx.maxReps) || catalogItem?.maxReps || 12,
    weightStep: rawEx.weightStep !== undefined ? Number(rawEx.weightStep) : (catalogItem?.weightStep ?? 2.5),
    currentWeight: rawEx.currentWeight !== undefined
      ? Number(rawEx.currentWeight)
      : (catalogItem?.defaultWeight ?? 50),
    restSeconds: Number(rawEx.restSeconds) || catalogItem?.restSeconds || 90,
    trackingMode: exerciseId === 'plank' ? 'duration' : rawEx.trackingMode || catalogItem?.trackingMode || 'reps',
    defaultDurationSeconds: exerciseId === 'plank' ? (Number(rawEx.defaultDurationSeconds) || 45) : Number(rawEx.defaultDurationSeconds) || catalogItem?.defaultDurationSeconds,
    cardioIntensity: rawEx.cardioIntensity || catalogItem?.cardioIntensity,
    notes: rawEx.notes,
    history: Array.isArray(rawEx.history) ? rawEx.history : []
  };
}

export function migrateTemplatesList(templates: any[]): WorkoutTemplate[] {
  if (!Array.isArray(templates) || templates.length === 0) {
    return cloneDefaultTemplates();
  }
  const validTemplates = templates.filter(t => t && typeof t === 'object');
  if (validTemplates.length === 0) {
    return cloneDefaultTemplates();
  }
  return validTemplates.map(t => ({
    id: t.id || ('template-' + Date.now()),
    name: workoutNameLabel(t.name || 'Программа тренировок'),
    description: t.description || '',
    icon: t.icon || 'Flame',
    weekVariant: t.weekVariant || 'all',
    scheduledDays: Array.isArray(t.scheduledDays) ? t.scheduledDays : undefined,
    exercises: Array.isArray(t.exercises) ? t.exercises.map(migrateExercise) : []
  }));
}

export function migrateActiveSession(workout: any): ActiveWorkout | null {
  if (!workout || !Array.isArray(workout.exercises)) return null;

  const migratedExercises = workout.exercises.map((rawEx: any) => {
    const catalogItem = EXERCISE_CATALOG[rawEx.exerciseId || rawEx.id];
    const category = catalogItem?.category || normalizeMuscleCategory(rawEx.category);
    const equipment = catalogItem?.equipment || normalizeEquipment(rawEx.equipment, rawEx.name);
    const exerciseId = rawEx.exerciseId || rawEx.id || ('ex-' + Date.now());

    return {
      exerciseId,
      name: rawEx.name || catalogItem?.name || 'Упражнение',
      category,
      equipment,
      animationType: resolveAnimationType(category, catalogItem?.animationType, rawEx.animationType),
      gifUrl: catalogItem?.gifUrl || rawEx.gifUrl,
      technique: resolveTechnique(category, catalogItem?.technique, rawEx.technique),
      alternatives: resolveAlternatives(exerciseId, category, catalogItem?.alternatives, rawEx.alternatives),
      supersetGroupId: rawEx.supersetGroupId,
      targetSets: Number(rawEx.targetSets) || catalogItem?.defaultSets || 3,
      minReps: Number(rawEx.minReps) || catalogItem?.minReps || 8,
      maxReps: Number(rawEx.maxReps) || catalogItem?.maxReps || 12,
      weightStep: rawEx.weightStep !== undefined ? Number(rawEx.weightStep) : (catalogItem?.weightStep ?? 2.5),
      targetWeight: rawEx.targetWeight !== undefined ? Number(rawEx.targetWeight) : (catalogItem?.defaultWeight ?? 50),
      restSeconds: Number(rawEx.restSeconds) || catalogItem?.restSeconds || 90,
      trackingMode: rawEx.trackingMode || catalogItem?.trackingMode || 'reps',
      defaultDurationSeconds: Number(rawEx.defaultDurationSeconds) || catalogItem?.defaultDurationSeconds,
      cardioIntensity: rawEx.cardioIntensity || catalogItem?.cardioIntensity,
      sets: Array.isArray(rawEx.sets) ? rawEx.sets : [],
      recommendation: rawEx.recommendation || {
        decision: 'FIRST_SESSION',
        nextWeight: rawEx.targetWeight || 50,
        targetRepRange: `${rawEx.minReps || 8}-${rawEx.maxReps || 12}`,
        badgeText: '🏁 Базовый цикл',
        badgeColor: 'blue',
        analysis: 'Тренировка в штатном режиме прогрессии.',
        suggestedAction: 'Выполняйте подход с контролем техники.',
        consecutivePlateauCount: 0
      },
      previousPerformance: rawEx.previousPerformance
    };
  });

  // Add the default trial to exercises that have not yet started in saved sessions.
  migratedExercises.forEach((ex: any, index: number) => {
    if (ex.sets.some((set: any) => set.completed || set.type === 'warmup' || set.isWarmup)) return;
    ex.sets.unshift(createTrialSet(ex, `trial-${workout.startTime || Date.now()}-${index}`));
  });

  return {
    templateId: workout.templateId || 'custom',
    templateName: workoutNameLabel(workout.templateName || 'Тренировка'),
    readiness: (workout.readiness as ReadinessLevel) || 'optimal',
    startTime: Number(workout.startTime) || Date.now(),
    cycleWeek: workout.cycleWeek,
    cyclePhase: workout.cyclePhase,
    exercises: migratedExercises
  };
}

export function extractWorkingWeightFromSets(
  sets: { completed?: boolean; reps: number; type?: string; isWarmup?: boolean; weight: number }[]
): number | undefined {
  const workingSets = sets.filter(s => s.completed !== false && s.reps > 0 && s.type !== 'warmup' && !s.isWarmup && s.type !== 'dropset');
  const topWorkingWeight = workingSets.reduce((top, set) => Math.max(top, set.weight), 0);
  const actualWeight = workingSets.filter(s => s.weight >= topWorkingWeight - 0.01).at(-1)?.weight;
  if (actualWeight != null) return roundWeight(actualWeight);
  return undefined;
}

export function deriveExerciseHistoryFromCompletedWorkouts(
  exerciseId: string,
  history: CompletedWorkout[],
  templateSessions?: ExerciseSession[]
): ExerciseSession[] {
  const result: ExerciseSession[] = [];
  const historyWorkoutIds = new Set<string>();

  const sortedHistory = [...history].sort((a, b) => a.endTime - b.endTime);
  for (const workout of sortedHistory) {
    historyWorkoutIds.add(workout.id);
    const completedEx = workout.exercises.find(e => e.exerciseId === exerciseId);
    if (!completedEx) continue;

    const workingSets = completedEx.sets.filter(s => s.completed !== false && s.reps > 0 && s.type !== 'warmup' && !s.isWarmup && s.type !== 'dropset');
    const totalVol = workingSets.reduce((sum, s) => sum + s.weight * s.reps, 0);
    const totalDuration = workingSets.reduce((sum, s) => sum + (s.durationSeconds || 0), 0);
    const maxSet1RM = Math.max(...workingSets.map(s => (s.reps <= 0 || s.weight <= 0 ? 0 : s.weight * (1 + s.reps / 30))), 0);

    result.push({
      id: 'derived-' + workout.id + '-' + completedEx.exerciseId,
      workoutId: workout.id,
      date: new Date(workout.endTime).toISOString(),
      targetSets: completedEx.targetSets,
      minReps: completedEx.minReps,
      maxReps: completedEx.maxReps,
      weight: roundWeight(completedEx.workingWeight),
      sets: completedEx.sets.map(s => ({ ...s, weight: roundWeight(s.weight), completed: true })),
      totalVolume: Math.round(totalVol),
      totalDurationSeconds: totalDuration || undefined,
      estimated1RM: Math.round(maxSet1RM * 10) / 10,
      progressionNote: completedEx.progression.badgeText,
      phase: workout.cyclePhase === 'deload' ? 'deload' : undefined,
      decision: workout.cyclePhase === 'deload' ? undefined : completedEx.progression.decision
    });
  }

  if (templateSessions && templateSessions.length > 0) {
    for (const session of templateSessions) {
      if (!session.workoutId || !historyWorkoutIds.has(session.workoutId)) {
        result.push(session);
      }
    }
  }

  result.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  return result;
}

export const storageService = {
  deriveExerciseHistory(exerciseId: string, templateSessions?: ExerciseSession[]): ExerciseSession[] {
    return deriveExerciseHistoryFromCompletedWorkouts(exerciseId, this.getHistory(), templateSessions);
  },

  getTemplates(): WorkoutTemplate[] {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.TEMPLATES);
      if (data) {
        const parsed = JSON.parse(data);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return migrateTemplatesList(parsed);
        }
      }
    } catch {
      corruptKeys.add(STORAGE_KEYS.TEMPLATES);
      console.warn('Failed to parse templates from storage');
    }
    // Empty until user picks a program — return [] so Home shows setup wizard
    return [];
  },

  saveTemplates(templates: WorkoutTemplate[]) {
    try {
      preserveCorruptValue(STORAGE_KEYS.TEMPLATES);
      localStorage.setItem(STORAGE_KEYS.TEMPLATES, JSON.stringify(templates));
      localStorage.setItem('ironforge_templates_version', TEMPLATES_VERSION);
    } catch (e) {
      console.error('Failed to save templates', e);
    }
  },

  getHistory(): CompletedWorkout[] {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.HISTORY);
      if (data) {
        const parsed = JSON.parse(data);
        if (Array.isArray(parsed)) {
          return parsed.filter(
            (item: any) =>
              item &&
              typeof item.id === 'string' &&
              typeof item.endTime === 'number' &&
              Array.isArray(item.exercises)
          );
        }
      }
    } catch {
      corruptKeys.add(STORAGE_KEYS.HISTORY);
      console.warn('Failed to load history');
    }
    return [];
  },

  updateCompletedWorkout(id: string, next: CompletedWorkout): boolean {
    const rawHistory = localStorage.getItem(STORAGE_KEYS.HISTORY);
    if (!rawHistory) return false;
    let history: CompletedWorkout[] = [];
    try {
      const parsed = JSON.parse(rawHistory);
      if (Array.isArray(parsed)) {
        history = parsed.filter(
          (item: any) =>
            item &&
            typeof item.id === 'string' &&
            typeof item.endTime === 'number' &&
            Array.isArray(item.exercises)
        );
      }
    } catch {
      return false;
    }

    const workoutIndex = history.findIndex(w => w.id === id);
    if (workoutIndex === -1) return false;

    const existingWorkout = history[workoutIndex];
    if (!next || !Array.isArray(next.exercises)) return false;

    if (next.exercises.length !== existingWorkout.exercises.length) return false;
    for (let i = 0; i < next.exercises.length; i += 1) {
      if (next.exercises[i].exerciseId !== existingWorkout.exercises[i].exerciseId) return false;
      if (!Array.isArray(next.exercises[i].sets) || next.exercises[i].sets.length !== existingWorkout.exercises[i].sets.length) {
        return false;
      }
    }

    const previousTemplates = localStorage.getItem(STORAGE_KEYS.TEMPLATES);
    const previousHistory = rawHistory;

    let totalVolumeKg = 0;
    let totalSets = 0;
    let totalCardioSeconds = 0;

    const updatedExercises = next.exercises.map((nextEx, exIdx) => {
      const existingEx = existingWorkout.exercises[exIdx];
      const sanitizedSets = nextEx.sets.map((s, setIdx) => {
        const origSet = existingEx.sets[setIdx];
        const weight = roundWeight(sanitizeNumber(s.weight, 1000));
        const reps = Math.round(sanitizeNumber(s.reps, 500));
        const rpe = s.rpe != null ? Math.min(10, Math.max(6, sanitizeNumber(s.rpe, 10))) : undefined;
        return {
          ...origSet,
          weight,
          reps,
          rpe
        };
      });

      const actualWeight = extractWorkingWeightFromSets(sanitizedSets);
      const workingWeight = actualWeight ?? roundWeight(sanitizeNumber(nextEx.workingWeight ?? existingEx.workingWeight, 1000));

      const workingSets = sanitizedSets.filter(s => s.completed !== false && !s.isWarmup && s.type !== 'warmup');
      totalVolumeKg += workingSets.reduce((sum, s) => sum + s.weight * s.reps, 0);
      totalSets += workingSets.length;
      if (nextEx.category === 'Cardio' && nextEx.trackingMode === 'duration') {
        totalCardioSeconds += workingSets.reduce((sum, s) => sum + (s.durationSeconds || 0), 0);
      }

      return {
        ...existingEx,
        workingWeight,
        sets: sanitizedSets,
        progression: existingEx.progression
      };
    });

    const updatedWorkout: CompletedWorkout = {
      ...existingWorkout,
      totalVolumeKg: Math.round(totalVolumeKg),
      totalSets,
      totalCardioSeconds: existingWorkout.totalCardioSeconds !== undefined ? totalCardioSeconds : undefined,
      exercises: updatedExercises
    };

    const nextHistory = [...history];
    nextHistory[workoutIndex] = updatedWorkout;

    const templates = this.getTemplates();
    templates.forEach(template => {
      template.exercises.forEach(exercise => {
        const matchingSession = exercise.history.find(s => s.workoutId === id);
        if (matchingSession) {
          const updatedEx = updatedWorkout.exercises.find(e => e.exerciseId === exercise.id);
          if (updatedEx) {
            const workingSets = updatedEx.sets.filter(s => s.completed !== false && s.reps > 0 && s.type !== 'warmup' && !s.isWarmup && s.type !== 'dropset');
            const totalVol = workingSets.reduce((sum, s) => sum + s.weight * s.reps, 0);
            const totalDuration = workingSets.reduce((sum, s) => sum + (s.durationSeconds || 0), 0);
            const maxSet1RM = Math.max(...workingSets.map(s => {
              if (s.reps <= 0 || s.weight <= 0) return 0;
              return s.weight * (1 + s.reps / 30);
            }), 0);

            matchingSession.weight = roundWeight(updatedEx.workingWeight);
            matchingSession.sets = updatedEx.sets.map(s => ({ ...s, weight: roundWeight(s.weight), completed: true }));
            matchingSession.totalVolume = Math.round(totalVol);
            matchingSession.totalDurationSeconds = totalDuration || undefined;
            matchingSession.estimated1RM = Math.round(maxSet1RM * 10) / 10;
          }

          const nonDeloadSessions = exercise.history.filter(s => s.phase !== 'deload');
          const latestSession = nonDeloadSessions.at(-1);
          if (latestSession) {
            const recomputedWeight = extractWorkingWeightFromSets(latestSession.sets || []) ?? (latestSession.weight ? roundWeight(latestSession.weight) : undefined);
            if (recomputedWeight != null) {
              exercise.currentWeight = roundWeight(recomputedWeight);
            }
          }
        }
      });
    });

    try {
      preserveCorruptValue(STORAGE_KEYS.TEMPLATES);
      preserveCorruptValue(STORAGE_KEYS.HISTORY);
      localStorage.setItem(STORAGE_KEYS.TEMPLATES, JSON.stringify(templates));
      localStorage.setItem('ironforge_templates_version', TEMPLATES_VERSION);
      localStorage.setItem(STORAGE_KEYS.HISTORY, JSON.stringify(nextHistory));
      return true;
    } catch (error) {
      if (previousTemplates == null) localStorage.removeItem(STORAGE_KEYS.TEMPLATES);
      else localStorage.setItem(STORAGE_KEYS.TEMPLATES, previousTemplates);
      if (previousHistory == null) localStorage.removeItem(STORAGE_KEYS.HISTORY);
      else localStorage.setItem(STORAGE_KEYS.HISTORY, previousHistory);
      throw error;
    }
  },

  deleteCompletedWorkout(id: string): boolean {
    const rawHistory = localStorage.getItem(STORAGE_KEYS.HISTORY);
    if (!rawHistory) return false;
    let history: CompletedWorkout[] = [];
    try {
      const parsed = JSON.parse(rawHistory);
      if (Array.isArray(parsed)) {
        history = parsed.filter(
          (item: any) =>
            item &&
            typeof item.id === 'string' &&
            typeof item.endTime === 'number' &&
            Array.isArray(item.exercises)
        );
      }
    } catch {
      return false;
    }

    const workoutIndex = history.findIndex(w => w.id === id);
    if (workoutIndex === -1) return false;

    const previousTemplates = localStorage.getItem(STORAGE_KEYS.TEMPLATES);
    const previousHistory = rawHistory;

    const nextHistory = history.filter(w => w.id !== id);
    const templates = this.getTemplates();

    templates.forEach(template => {
      template.exercises.forEach(exercise => {
        const hasSession = exercise.history.some(s => s.workoutId === id);
        if (hasSession) {
          exercise.history = exercise.history.filter(s => s.workoutId !== id);
          const nonDeloadSessions = exercise.history.filter(s => s.phase !== 'deload');
          const latestSession = nonDeloadSessions.at(-1);
          if (latestSession) {
            const recomputedWeight = extractWorkingWeightFromSets(latestSession.sets || []) ?? (latestSession.weight ? roundWeight(latestSession.weight) : undefined);
            if (recomputedWeight != null) {
              exercise.currentWeight = roundWeight(recomputedWeight);
            }
          }
        }
      });
    });

    try {
      preserveCorruptValue(STORAGE_KEYS.TEMPLATES);
      preserveCorruptValue(STORAGE_KEYS.HISTORY);
      localStorage.setItem(STORAGE_KEYS.TEMPLATES, JSON.stringify(templates));
      localStorage.setItem('ironforge_templates_version', TEMPLATES_VERSION);
      localStorage.setItem(STORAGE_KEYS.HISTORY, JSON.stringify(nextHistory));
      return true;
    } catch (error) {
      if (previousTemplates == null) localStorage.removeItem(STORAGE_KEYS.TEMPLATES);
      else localStorage.setItem(STORAGE_KEYS.TEMPLATES, previousTemplates);
      if (previousHistory == null) localStorage.removeItem(STORAGE_KEYS.HISTORY);
      else localStorage.setItem(STORAGE_KEYS.HISTORY, previousHistory);
      throw error;
    }
  },

  saveCompletedWorkout(workout: CompletedWorkout) {
    const recordedWorkout: CompletedWorkout = {
      ...workout,
      exercises: workout.exercises.map(exercise => ({
        ...exercise,
        workingWeight: roundWeight(exercise.workingWeight),
        sets: exercise.sets.map(set => ({ ...set, weight: roundWeight(set.weight) }))
      }))
    };
    const history = this.getHistory();
    if (history.some(existing => existing.id === workout.id)) return;
    const previousTemplates = localStorage.getItem(STORAGE_KEYS.TEMPLATES);
    const previousHistory = localStorage.getItem(STORAGE_KEYS.HISTORY);
    history.unshift(recordedWorkout);
    const templates = this.getTemplates();
    const workoutTemplate = templates.find(t => t.id === workout.templateId);
    if (templates.length) {
      recordedWorkout.exercises.forEach(completedEx => {
        let owner = templates.find(t => t.exercises.some(e => e.id === completedEx.exerciseId));
        let exercise = owner?.exercises.find(e => e.id === completedEx.exerciseId);
        if (!exercise && workoutTemplate) {
          owner = workoutTemplate;
          const catalog = EXERCISE_CATALOG[completedEx.exerciseId];
          exercise = {
            id: completedEx.exerciseId,
            name: completedEx.name,
            category: completedEx.category,
            equipment: catalog?.equipment,
            animationType: catalog?.animationType,
            gifUrl: catalog?.gifUrl,
            technique: catalog?.technique,
            alternatives: catalog?.alternatives,
            targetSets: completedEx.targetSets,
            minReps: completedEx.minReps,
            maxReps: completedEx.maxReps,
            weightStep: catalog?.weightStep || 0,
            currentWeight: completedEx.workingWeight,
            restSeconds: catalog?.restSeconds || 60,
            trackingMode: completedEx.trackingMode || catalog?.trackingMode || 'reps',
            defaultDurationSeconds: catalog?.defaultDurationSeconds,
            cardioIntensity: catalog?.cardioIntensity,
            history: []
          };
          owner.exercises.push(exercise);
        }
        if (!exercise) return;
        const actualWeight = extractWorkingWeightFromSets(completedEx.sets);
        const workingSets = completedEx.sets.filter(s => s.completed !== false && s.reps > 0 && s.type !== 'warmup' && !s.isWarmup && s.type !== 'dropset');
        if (workout.cyclePhase !== 'deload' && actualWeight != null) {
          exercise.currentWeight = roundWeight(actualWeight);
        }

        const totalVol = workingSets.reduce((sum, s) => sum + s.weight * s.reps, 0);
        const totalDuration = workingSets.reduce((sum, s) => sum + (s.durationSeconds || 0), 0);
        const maxSet1RM = Math.max(...workingSets.map(s => {
          if (s.reps <= 0 || s.weight <= 0) return 0;
          return s.weight * (1 + s.reps / 30);
        }), 0);

        exercise.history.push({
          id: 'h-' + Date.now() + '-' + Math.random().toString(36).substring(2, 6),
          workoutId: workout.id,
          date: new Date(workout.endTime).toISOString(),
          targetSets: completedEx.targetSets,
          minReps: completedEx.minReps,
          maxReps: completedEx.maxReps,
          weight: roundWeight(completedEx.workingWeight),
          sets: completedEx.sets.map(s => ({ ...s, weight: roundWeight(s.weight), completed: true })),
          totalVolume: Math.round(totalVol),
          totalDurationSeconds: totalDuration || undefined,
          estimated1RM: Math.round(maxSet1RM * 10) / 10,
          progressionNote: completedEx.progression.badgeText,
          phase: workout.cyclePhase === 'deload' ? 'deload' : undefined,
          decision: workout.cyclePhase === 'deload' ? undefined : completedEx.progression.decision
        });
      });
    }
    try {
      preserveCorruptValue(STORAGE_KEYS.TEMPLATES);
      preserveCorruptValue(STORAGE_KEYS.HISTORY);
      localStorage.setItem(STORAGE_KEYS.TEMPLATES, JSON.stringify(templates));
      localStorage.setItem('ironforge_templates_version', TEMPLATES_VERSION);
      localStorage.setItem(STORAGE_KEYS.HISTORY, JSON.stringify(history));
      if (typeof navigator !== 'undefined' && navigator.storage?.persist) void navigator.storage.persist().catch(() => undefined);
    } catch (error) {
      if (previousTemplates == null) localStorage.removeItem(STORAGE_KEYS.TEMPLATES);
      else localStorage.setItem(STORAGE_KEYS.TEMPLATES, previousTemplates);
      if (previousHistory == null) localStorage.removeItem(STORAGE_KEYS.HISTORY);
      else localStorage.setItem(STORAGE_KEYS.HISTORY, previousHistory);
      throw error;
    }
  },

  getSettings(): AppSettings {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.SETTINGS);
      if (data) {
        return { ...DEFAULT_SETTINGS, ...JSON.parse(data) };
      }
    } catch {
      // fallback
    }
    return { ...DEFAULT_SETTINGS };
  },

  saveSettings(settings: AppSettings) {
    localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(settings));
  },

  getActiveWorkout(): ActiveWorkout | null {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.ACTIVE_WORKOUT);
      if (data) {
        return migrateActiveSession(JSON.parse(data));
      }
    } catch {
      //
    }
    return null;
  },

  saveActiveWorkout(workout: ActiveWorkout | null) {
    if (workout === null) {
      localStorage.removeItem(STORAGE_KEYS.ACTIVE_WORKOUT);
    } else {
      localStorage.setItem(STORAGE_KEYS.ACTIVE_WORKOUT, JSON.stringify(workout));
    }
  },

  getCustomExercises(): CatalogExerciseItem[] {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.CUSTOM_EXERCISES);
      if (data) {
        const parsed = JSON.parse(data);
        if (Array.isArray(parsed)) return parsed;
      }
    } catch {
      //
    }
    return [];
  },

  saveCustomExercise(item: CatalogExerciseItem) {
    try {
      const customs = this.getCustomExercises();
      const existingIdx = customs.findIndex(c => c.id === item.id);
      if (existingIdx !== -1) {
        customs[existingIdx] = item;
      } else {
        customs.push(item);
      }
      localStorage.setItem(STORAGE_KEYS.CUSTOM_EXERCISES, JSON.stringify(customs));
    } catch (e) {
      console.error('Failed to save custom exercise', e);
    }
  },

  exportBackupJson(): string {
    try {
      this.saveSettings({ ...this.getSettings(), lastBackupAt: Date.now() });
    } catch (error) {
      console.warn('Failed to save backup timestamp', error);
    }
    const backup = {
      version: '1.2',
      exportDate: new Date().toISOString(),
      templates: this.getTemplates(),
      history: this.getHistory(),
      settings: this.getSettings(),
      customExercises: this.getCustomExercises(),
      activeWorkout: this.getActiveWorkout()
    };
    return JSON.stringify(backup, null, 2);
  },

  createEmergencySnapshot(): void {
    try {
      const snapshot = {
        timestamp: Date.now(),
        date: new Date().toISOString(),
        templates: localStorage.getItem(STORAGE_KEYS.TEMPLATES),
        history: localStorage.getItem(STORAGE_KEYS.HISTORY),
        settings: localStorage.getItem(STORAGE_KEYS.SETTINGS),
        activeWorkout: localStorage.getItem(STORAGE_KEYS.ACTIVE_WORKOUT),
        customExercises: localStorage.getItem(STORAGE_KEYS.CUSTOM_EXERCISES),
        templatesVersion: localStorage.getItem('ironforge_templates_version')
      };
      localStorage.setItem(STORAGE_KEYS.EMERGENCY_SNAPSHOT, JSON.stringify(snapshot));
    } catch (e) {
      console.warn('Failed to create emergency snapshot', e);
    }
  },

  hasEmergencySnapshot(): boolean {
    try {
      return !!localStorage.getItem(STORAGE_KEYS.EMERGENCY_SNAPSHOT);
    } catch {
      return false;
    }
  },

  restoreEmergencySnapshot(): boolean {
    try {
      const raw = localStorage.getItem(STORAGE_KEYS.EMERGENCY_SNAPSHOT);
      if (!raw) return false;
      const snap = JSON.parse(raw);
      if (snap.templates != null) localStorage.setItem(STORAGE_KEYS.TEMPLATES, snap.templates);
      if (snap.history != null) localStorage.setItem(STORAGE_KEYS.HISTORY, snap.history);
      if (snap.settings != null) localStorage.setItem(STORAGE_KEYS.SETTINGS, snap.settings);
      if (snap.activeWorkout != null) localStorage.setItem(STORAGE_KEYS.ACTIVE_WORKOUT, snap.activeWorkout);
      if (snap.customExercises != null) localStorage.setItem(STORAGE_KEYS.CUSTOM_EXERCISES, snap.customExercises);
      if (snap.templatesVersion != null) {
        localStorage.setItem('ironforge_templates_version', snap.templatesVersion);
      }
      return true;
    } catch (e) {
      console.error('Failed to restore emergency snapshot', e);
      return false;
    }
  },

  clearEmergencySnapshot(): void {
    localStorage.removeItem(STORAGE_KEYS.EMERGENCY_SNAPSHOT);
  },

  importBackupJson(jsonString: string): boolean {
    try {
      const data = JSON.parse(jsonString);
      if (!data || typeof data !== 'object' || Array.isArray(data)) return false;
      if (data.templates !== undefined && !Array.isArray(data.templates)) return false;
      if (data.history !== undefined && !Array.isArray(data.history)) return false;
      if (data.customExercises !== undefined && !Array.isArray(data.customExercises)) return false;
      if (data.settings !== undefined && (!data.settings || typeof data.settings !== 'object' || Array.isArray(data.settings))) return false;
      const nextTemplates = data.templates ? migrateTemplatesList(data.templates) : null;
      const nextHistory = data.history == null ? null : data.history.filter((item: any) => item && typeof item.id === 'string' && typeof item.endTime === 'number' && Array.isArray(item.exercises));
      if (Array.isArray(data.history) && nextHistory.length !== data.history.length) console.warn(`Пропущено некорректных тренировок при импорте: ${data.history.length - nextHistory.length}`);
      const nextActiveWorkout = data.activeWorkout === undefined ? undefined : migrateActiveSession(data.activeWorkout);
      this.createEmergencySnapshot();
      if (nextTemplates) {
        preserveCorruptValue(STORAGE_KEYS.TEMPLATES);
        localStorage.setItem(STORAGE_KEYS.TEMPLATES, JSON.stringify(nextTemplates));
        localStorage.setItem('ironforge_templates_version', TEMPLATES_VERSION);
      }
      if (nextHistory) { preserveCorruptValue(STORAGE_KEYS.HISTORY); localStorage.setItem(STORAGE_KEYS.HISTORY, JSON.stringify(nextHistory)); }
      if (data.settings) localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(data.settings));
      if (data.customExercises) localStorage.setItem(STORAGE_KEYS.CUSTOM_EXERCISES, JSON.stringify(data.customExercises));
      if (nextActiveWorkout !== undefined) {
        if (nextActiveWorkout) localStorage.setItem(STORAGE_KEYS.ACTIVE_WORKOUT, JSON.stringify(nextActiveWorkout));
        else localStorage.removeItem(STORAGE_KEYS.ACTIVE_WORKOUT);
      }
      this.clearEmergencySnapshot();
      return true;
    } catch (e) {
      this.restoreEmergencySnapshot();
      console.error('Import failed', e);
      return false;
    }
  },

  resetAllData() {
    localStorage.removeItem(STORAGE_KEYS.TEMPLATES);
    localStorage.removeItem(STORAGE_KEYS.HISTORY);
    localStorage.removeItem(STORAGE_KEYS.ACTIVE_WORKOUT);
    localStorage.removeItem(STORAGE_KEYS.SETTINGS);
    localStorage.removeItem(STORAGE_KEYS.CUSTOM_EXERCISES);
    localStorage.setItem('ironforge_templates_version', TEMPLATES_VERSION);
    const freshTemplates = cloneDefaultTemplates();
    localStorage.setItem(STORAGE_KEYS.TEMPLATES, JSON.stringify(freshTemplates));
  },

  resetTemplates(): WorkoutTemplate[] {
    const freshTemplates = cloneDefaultTemplates();
    localStorage.setItem(STORAGE_KEYS.TEMPLATES, JSON.stringify(freshTemplates));
    return freshTemplates;
  },

  getActiveProgram(): ActiveProgram | null {
    try {
      const normalize = (p: ActiveProgram): ActiveProgram => ({
        ...p,
        gymProfile: p.gymProfile || this.getSettings().gymProfile || 'full',
        coreSessionsPerWeek: p.coreSessionsPerWeek ?? 2,
        cardioSessionsPerWeek: p.cardioSessionsPerWeek ?? (p.goal === 'cut' ? Math.min(3, p.daysPerWeek) : p.goal === 'recomp' ? Math.min(2, p.daysPerWeek) : 0)
      });
      const fromSettings = this.getSettings().activeProgram;
      if (fromSettings) return normalize(fromSettings);
      const raw = localStorage.getItem(STORAGE_KEYS.ACTIVE_PROGRAM);
      if (raw) return normalize(JSON.parse(raw) as ActiveProgram);
    } catch {
      //
    }
    return null;
  },

  saveActiveProgram(program: ActiveProgram | null) {
    if (program === null) {
      localStorage.removeItem(STORAGE_KEYS.ACTIVE_PROGRAM);
      this.saveSettings({ ...this.getSettings(), activeProgram: null });
      return;
    }
    localStorage.setItem(STORAGE_KEYS.ACTIVE_PROGRAM, JSON.stringify(program));
    this.saveSettings({ ...this.getSettings(), activeProgram: program });
  },

  applyGeneratedProgram(program: ActiveProgram, templates: WorkoutTemplate[]) {
    this.saveTemplates(templates);
    this.saveActiveProgram(program);
  }
};
