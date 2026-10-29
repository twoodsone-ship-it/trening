import { AppSettings, CompletedWorkout, WorkoutTemplate, ActiveExerciseSession, Exercise, MuscleCategory, EquipmentType, ExerciseTechniqueGuide } from '../types';
import { DEFAULT_TEMPLATES } from '../data/defaultTemplates';
import { EXERCISE_CATALOG, CatalogExerciseItem } from '../data/exerciseCatalog';

const STORAGE_KEYS = {
  TEMPLATES: 'ironforge_templates_v1',
  HISTORY: 'ironforge_history_v1',
  SETTINGS: 'ironforge_settings_v1',
  ACTIVE_WORKOUT: 'ironforge_active_session_v1',
  CUSTOM_EXERCISES: 'ironforge_custom_exercises_v1'
};

const DEFAULT_SETTINGS: AppSettings = {
  soundEnabled: true,
  vibrationEnabled: true,
  defaultRestSeconds: 90,
  barbellWeightKg: 20,
  unit: 'kg',
  theme: 'light',
  currentWeek: 'A'
};

export function normalizeMuscleCategory(raw: unknown): MuscleCategory {
  if (typeof raw !== 'string') return 'Chest';
  const lower = raw.trim().toLowerCase();
  if (lower === 'chest' || lower.includes('груд')) return 'Chest';
  if (lower === 'back' || lower.includes('спин')) return 'Back';
  if (lower === 'legs' || lower.includes('ног') || lower.includes('бедр') || lower.includes('квадр') || lower.includes('ягодиц')) return 'Legs';
  if (lower === 'shoulders' || lower.includes('плеч') || lower.includes('дельт')) return 'Shoulders';
  if (lower === 'arms' || lower.includes('рук') || lower.includes('бицеп') || lower.includes('трицеп')) return 'Arms';
  if (lower === 'core' || lower.includes('кор') || lower.includes('пресс') || lower.includes('живот')) return 'Core';
  return 'Chest';
}

export function normalizeEquipment(raw: unknown, name?: string): EquipmentType {
  if (typeof raw === 'string') {
    const lower = raw.trim().toLowerCase();
    if (lower === 'barbell' || lower === 'штанга') return 'barbell';
    if (lower === 'dumbbell' || lower === 'гантели' || lower === 'гантель') return 'dumbbell';
    if (lower === 'cable' || lower === 'блок' || lower === 'кроссовер') return 'cable';
    if (lower === 'machine' || lower === 'тренажер' || lower === 'хаммер') return 'machine';
    if (lower === 'smith' || lower === 'смит') return 'smith';
    if (lower === 'bodyweight' || lower === 'свой вес' || lower === 'собственный вес') return 'bodyweight';
  }
  if (name) {
    const n = name.toLowerCase();
    if (n.includes('гантел')) return 'dumbbell';
    if (n.includes('блок') || n.includes('кроссовер')) return 'cable';
    if (n.includes('тренажер') || n.includes('хаммер')) return 'machine';
    if (n.includes('смит')) return 'smith';
    if (n.includes('турник') || n.includes('брусь') || n.includes('подтягиван') || n.includes('отжиман') || n.includes('планк') || n.includes('ролик')) return 'bodyweight';
  }
  return 'barbell';
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
  const category: MuscleCategory = catalogItem?.category || normalizeMuscleCategory(rawEx.category);
  const equipment: EquipmentType = catalogItem?.equipment || normalizeEquipment(rawEx.equipment, rawEx.name);

  const defaultAlternatives: string[] = (catalogItem?.alternatives && catalogItem.alternatives.length > 0)
    ? catalogItem.alternatives
    : Object.values(EXERCISE_CATALOG)
        .filter(c => c.category === category && c.id !== rawEx.id)
        .slice(0, 5)
        .map(c => c.id);

  const defaultTechnique: ExerciseTechniqueGuide = catalogItem?.technique || rawEx.technique || {
    primaryMuscles: `${category} целевые мышечные группы`,
    setup: 'Займите устойчивое исходное положение, сохраняя нейтральное положение позвоночника.',
    execution: 'Выполняйте движение подконтрольно в полной амплитуде, акцентируя сокращение мышц.',
    breathing: 'Вдох при опускании/растяжении, выдох на усилии.',
    mistakes: ['Чрезмерный читинг', 'Потеря контроля осанки']
  };

  const defaultAnimation = catalogItem?.animationType || rawEx.animationType || (
    category === 'Chest' ? 'bench-press' :
    category === 'Back' ? 'row' :
    category === 'Legs' ? 'squat' :
    category === 'Shoulders' ? 'overhead-press' :
    category === 'Arms' ? 'bicep-curl' : 'squat'
  );

  return {
    id: rawEx.id || ('ex-' + Date.now()),
    name: rawEx.name || catalogItem?.name || 'Упражнение',
    category,
    equipment,
    animationType: defaultAnimation,
    technique: defaultTechnique,
    alternatives: (Array.isArray(rawEx.alternatives) && rawEx.alternatives.length > 0)
      ? rawEx.alternatives
      : defaultAlternatives,
    weekVariant: rawEx.weekVariant || 'both',
    targetSets: Number(rawEx.targetSets) || catalogItem?.defaultSets || 3,
    minReps: Number(rawEx.minReps) || catalogItem?.minReps || 8,
    maxReps: Number(rawEx.maxReps) || catalogItem?.maxReps || 12,
    weightStep: Number(rawEx.weightStep) || catalogItem?.weightStep || 2.5,
    currentWeight: rawEx.currentWeight !== undefined ? Number(rawEx.currentWeight) : (catalogItem?.defaultWeight ?? 50),
    restSeconds: Number(rawEx.restSeconds) || catalogItem?.restSeconds || 90,
    notes: rawEx.notes,
    history: Array.isArray(rawEx.history) ? rawEx.history : []
  };
}

export function migrateTemplatesList(templates: any[]): WorkoutTemplate[] {
  if (!Array.isArray(templates)) return DEFAULT_TEMPLATES;
  return templates.map(t => ({
    id: t.id || ('template-' + Date.now()),
    name: t.name || 'Программа тренировок',
    description: t.description || '',
    icon: t.icon || 'Flame',
    weekVariant: t.weekVariant || 'all',
    exercises: Array.isArray(t.exercises) ? t.exercises.map(migrateExercise) : []
  }));
}

export function migrateActiveSession(workout: any): {
  templateId: string;
  templateName: string;
  startTime: number;
  exercises: ActiveExerciseSession[];
} | null {
  if (!workout || !Array.isArray(workout.exercises)) return null;

  const migratedExercises: ActiveExerciseSession[] = workout.exercises.map((rawEx: any) => {
    const catalogItem = EXERCISE_CATALOG[rawEx.exerciseId || rawEx.id];
    const category: MuscleCategory = catalogItem?.category || normalizeMuscleCategory(rawEx.category);
    const equipment: EquipmentType = catalogItem?.equipment || normalizeEquipment(rawEx.equipment, rawEx.name);
    const defaultAnimation = catalogItem?.animationType || rawEx.animationType || (
      category === 'Chest' ? 'bench-press' :
      category === 'Back' ? 'row' :
      category === 'Legs' ? 'squat' :
      category === 'Shoulders' ? 'overhead-press' :
      category === 'Arms' ? 'bicep-curl' : 'squat'
    );
    const defaultTechnique = catalogItem?.technique || rawEx.technique || {
      primaryMuscles: `${category} целевые мышцы`,
      setup: 'Исходное положение стабильное, позвоночник в нейтральном положении.',
      execution: 'Подконтрольное движение по полной амплитуде.',
      breathing: 'Вдох на спуске, выдох на усилии.',
      mistakes: ['Чрезмерный читинг']
    };
    const defaultAlternatives = (catalogItem?.alternatives && catalogItem.alternatives.length > 0)
      ? catalogItem.alternatives
      : (
        Array.isArray(rawEx.alternatives) && rawEx.alternatives.length > 0
          ? rawEx.alternatives
          : Object.values(EXERCISE_CATALOG).filter(c => c.category === category && c.id !== (rawEx.exerciseId || rawEx.id)).slice(0, 5).map(c => c.id)
      );

    return {
      exerciseId: rawEx.exerciseId || rawEx.id || ('ex-' + Date.now()),
      name: rawEx.name || catalogItem?.name || 'Упражнение',
      category,
      equipment,
      animationType: defaultAnimation,
      technique: defaultTechnique,
      alternatives: defaultAlternatives,
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
    startTime: Number(workout.startTime) || Date.now(),
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
          const migrated = migrateTemplatesList(parsed);
          return migrated;
        }
      }
    } catch {
      console.warn('Failed to parse templates from storage');
    }
    // Initial seed
    localStorage.setItem(STORAGE_KEYS.TEMPLATES, JSON.stringify(DEFAULT_TEMPLATES));
    return DEFAULT_TEMPLATES;
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

    // Also update exercise working weights and history inside templates
    const templates = this.getTemplates();
    const template = templates.find(t => t.id === workout.templateId);
    if (template) {
      workout.exercises.forEach(completedEx => {
        const exercise = template.exercises.find(e => e.id === completedEx.exerciseId);
        if (exercise) {
          // If progression recommends new weight, update current weight
          if (completedEx.progression.decision === 'INCREASE_WEIGHT') {
            exercise.currentWeight = completedEx.progression.nextWeight;
          }

          // Record session history
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
    return DEFAULT_SETTINGS;
  },

  saveSettings(settings: AppSettings) {
    localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(settings));
  },

  getActiveWorkout(): {
    templateId: string;
    templateName: string;
    startTime: number;
    exercises: ActiveExerciseSession[];
  } | null {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.ACTIVE_WORKOUT);
      if (data) {
        const parsed = JSON.parse(data);
        return migrateActiveSession(parsed);
      }
    } catch {
      //
    }
    return null;
  },

  saveActiveWorkout(workout: {
    templateId: string;
    templateName: string;
    startTime: number;
    exercises: ActiveExerciseSession[];
  } | null) {
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

  importBackupJson(jsonString: string): boolean {
    try {
      const data = JSON.parse(jsonString);
      if (data.templates && Array.isArray(data.templates)) {
        const migrated = migrateTemplatesList(data.templates);
        localStorage.setItem(STORAGE_KEYS.TEMPLATES, JSON.stringify(migrated));
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
  }
};
