import type {
  AppSettings,
  CompletedWorkout,
  WorkoutTemplate,
  ActiveWorkout,
  Exercise,
  ReadinessLevel
} from '../types/index.ts';
import { DEFAULT_TEMPLATES } from '../data/defaultTemplates';
import { EXERCISE_CATALOG, type CatalogExerciseItem } from '../data/exerciseCatalog';
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
  EMERGENCY_SNAPSHOT: 'ironforge_emergency_snapshot_v1'
};

const TEMPLATES_VERSION = 'v2.2';

const DEFAULT_SETTINGS: AppSettings = {
  soundEnabled: true,
  vibrationEnabled: true,
  voiceEnabled: true,
  focusModeDefault: false,
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
    minReps: Number(rawEx.minReps) || catalogItem?.minReps || 8,
    maxReps: Number(rawEx.maxReps) || catalogItem?.maxReps || 12,
    weightStep: Number(rawEx.weightStep) || catalogItem?.weightStep || 2.5,
    currentWeight: rawEx.currentWeight !== undefined
      ? Number(rawEx.currentWeight)
      : (catalogItem?.defaultWeight ?? 50),
    restSeconds: Number(rawEx.restSeconds) || catalogItem?.restSeconds || 90,
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
    name: t.name || 'Программа тренировок',
    description: t.description || '',
    icon: t.icon || 'Flame',
    weekVariant: t.weekVariant || 'all',
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
      weightStep: Number(rawEx.weightStep) || catalogItem?.weightStep || 2.5,
      targetWeight: Number(rawEx.targetWeight) || catalogItem?.defaultWeight || 50,
      restSeconds: Number(rawEx.restSeconds) || catalogItem?.restSeconds || 90,
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

  return {
    templateId: workout.templateId || 'custom',
    templateName: workout.templateName || 'Тренировка',
    readiness: (workout.readiness as ReadinessLevel) || 'optimal',
    startTime: Number(workout.startTime) || Date.now(),
    exercises: migratedExercises
  };
}

export const storageService = {
  getTemplates(): WorkoutTemplate[] {
    try {
      const version = localStorage.getItem('ironforge_templates_version');
      const data = localStorage.getItem(STORAGE_KEYS.TEMPLATES);
      if (data && version === TEMPLATES_VERSION) {
        const parsed = JSON.parse(data);
        if (Array.isArray(parsed) && parsed.length >= 8) {
          const migrated = migrateTemplatesList(parsed);
          if (migrated && migrated.length > 0) {
            return migrated;
          }
        }
      }
    } catch {
      console.warn('Failed to parse templates from storage');
    }
    const freshTemplates = cloneDefaultTemplates();
    try {
      localStorage.setItem(STORAGE_KEYS.TEMPLATES, JSON.stringify(freshTemplates));
      localStorage.setItem('ironforge_templates_version', TEMPLATES_VERSION);
    } catch (e) {
      console.error('Failed to persist fresh templates', e);
    }
    return freshTemplates;
  },

  saveTemplates(templates: WorkoutTemplate[]) {
    try {
      localStorage.setItem(STORAGE_KEYS.TEMPLATES, JSON.stringify(templates));
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
    history.unshift(workout);
    localStorage.setItem(STORAGE_KEYS.HISTORY, JSON.stringify(history));

    const templates = this.getTemplates();
    const template = templates.find(t => t.id === workout.templateId);
    if (template) {
      workout.exercises.forEach(completedEx => {
        const exercise = template.exercises.find(e => e.id === completedEx.exerciseId);
        if (exercise) {
          if (completedEx.progression.decision === 'INCREASE_WEIGHT') {
            exercise.currentWeight = completedEx.progression.nextWeight;
          }

          const totalVol = completedEx.sets.reduce((sum, s) => sum + (s.weight * s.reps), 0);
          const maxSet1RM = Math.max(...completedEx.sets.map(s => {
            if (s.reps <= 0) return 0;
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
            estimated1RM: Math.round(maxSet1RM * 10) / 10,
            progressionNote: completedEx.progression.badgeText
          });
        }
      });
      this.saveTemplates(templates);
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
      version: '1.1',
      exportDate: new Date().toISOString(),
      templates: this.getTemplates(),
      history: this.getHistory(),
      settings: this.getSettings(),
      customExercises: this.getCustomExercises()
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
      this.createEmergencySnapshot();

      if (data.templates && Array.isArray(data.templates)) {
        localStorage.setItem(STORAGE_KEYS.TEMPLATES, JSON.stringify(migrateTemplatesList(data.templates)));
      }
      if (data.history && Array.isArray(data.history)) {
        localStorage.setItem(STORAGE_KEYS.HISTORY, JSON.stringify(data.history));
      }
      if (data.settings) {
        localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(data.settings));
      }
      if (data.customExercises && Array.isArray(data.customExercises)) {
        localStorage.setItem(STORAGE_KEYS.CUSTOM_EXERCISES, JSON.stringify(data.customExercises));
      }
      return true;
    } catch (e) {
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
  }
};
