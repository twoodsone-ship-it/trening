import type {
  AppSettings,
  ActiveProgram,
  CompletedWorkout,
  WorkoutTemplate,
  ActiveWorkout,
  Exercise,
  ReadinessLevel
} from '../types/index.ts';
import { DEFAULT_TEMPLATES } from '../data/defaultTemplates';
import { EXERCISE_CATALOG, type CatalogExerciseItem } from '../data/exerciseCatalog';
import { workoutNameLabel } from '../utils/uiLabels';
import {
  normalizeMuscleCategory,
  normalizeEquipment,
  resolveAnimationType,
  resolveTechnique,
  resolveAlternatives
} from '../utils/catalogEnrichment';

export { normalizeMuscleCategory, normalizeEquipment };

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
  return templates.map(t => ({
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

  // Give an unfinished session created by an older version the same gentle start.
  if (migratedExercises.every((ex: any) => ex.sets.every((set: any) => !set.completed))) {
    const firstWeighted = migratedExercises.find((ex: any) => ex.trackingMode === 'reps' && ex.weightStep > 0 && ex.targetWeight > 0);
    if (firstWeighted && !firstWeighted.sets.some((set: any) => set.type === 'warmup' || set.isWarmup)) {
      const trialWeight = Math.min(firstWeighted.targetWeight * 0.5, firstWeighted.equipment === 'barbell' ? 20 : firstWeighted.targetWeight * 0.5);
      firstWeighted.sets.unshift({
        id: `trial-${workout.startTime || Date.now()}`,
        setNumber: 0,
        weight: Math.max(0, Math.round(trialWeight / firstWeighted.weightStep) * firstWeighted.weightStep),
        reps: Math.min(8, Math.max(5, firstWeighted.minReps)),
        completed: false,
        type: 'warmup',
        isWarmup: true
      });
    }
  }

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

export const storageService = {
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
      console.warn('Failed to parse templates from storage');
    }
    // Empty until user picks a program — return [] so Home shows setup wizard
    return [];
  },

  saveTemplates(templates: WorkoutTemplate[]) {
    try {
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
        return JSON.parse(data);
      }
    } catch {
      console.warn('Failed to load history');
    }
    return [];
  },

  saveCompletedWorkout(workout: CompletedWorkout) {
    const history = this.getHistory();
    if (history.some(existing => existing.id === workout.id)) return;
    this.createEmergencySnapshot();
    history.unshift(workout);
    const templates = this.getTemplates();
    const template = templates.find(t => t.id === workout.templateId);
    if (template) {
      workout.exercises.forEach(completedEx => {
        let exercise = template.exercises.find(e => e.id === completedEx.exerciseId);
        if (!exercise) {
          const prior = templates.flatMap(t => t.exercises).find(e => e.id === completedEx.exerciseId);
          if (prior) {
            exercise = { ...prior, history: [...prior.history] };
            template.exercises.push(exercise);
          }
        }
        if (!exercise) {
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
          template.exercises.push(exercise);
        }
        if (workout.cyclePhase !== 'deload' && completedEx.progression.decision === 'INCREASE_WEIGHT') {
          exercise.currentWeight = completedEx.progression.nextWeight;
        }

        const workingSets = completedEx.sets.filter(s => s.type !== 'warmup' && !s.isWarmup);
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
          weight: completedEx.workingWeight,
          sets: completedEx.sets,
          totalVolume: Math.round(totalVol),
          totalDurationSeconds: totalDuration || undefined,
          estimated1RM: Math.round(maxSet1RM * 10) / 10,
          progressionNote: completedEx.progression.badgeText
        });
      });
    }
    try {
      localStorage.setItem(STORAGE_KEYS.TEMPLATES, JSON.stringify(templates));
      localStorage.setItem('ironforge_templates_version', TEMPLATES_VERSION);
      localStorage.setItem(STORAGE_KEYS.HISTORY, JSON.stringify(history));
      this.clearEmergencySnapshot();
    } catch (error) {
      this.restoreEmergencySnapshot();
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
      const nextHistory = data.history ?? null;
      const nextActiveWorkout = data.activeWorkout === undefined ? undefined : migrateActiveSession(data.activeWorkout);
      this.createEmergencySnapshot();
      if (nextTemplates) {
        localStorage.setItem(STORAGE_KEYS.TEMPLATES, JSON.stringify(nextTemplates));
        localStorage.setItem('ironforge_templates_version', TEMPLATES_VERSION);
      }
      if (nextHistory) localStorage.setItem(STORAGE_KEYS.HISTORY, JSON.stringify(nextHistory));
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
