import { AppSettings, CompletedWorkout, WorkoutTemplate, ActiveExerciseSession } from '../types';
import { DEFAULT_TEMPLATES } from '../data/defaultTemplates';

const STORAGE_KEYS = {
  TEMPLATES: 'ironforge_templates_v1',
  HISTORY: 'ironforge_history_v1',
  SETTINGS: 'ironforge_settings_v1',
  ACTIVE_WORKOUT: 'ironforge_active_session_v1',
};

const DEFAULT_SETTINGS: AppSettings = {
  soundEnabled: true,
  vibrationEnabled: true,
  defaultRestSeconds: 90,
  barbellWeightKg: 20,
  unit: 'kg'
};

export const storageService = {
  getTemplates(): WorkoutTemplate[] {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.TEMPLATES);
      if (data) {
        return JSON.parse(data);
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
        return JSON.parse(data);
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

  exportBackupJson(): string {
    const backup = {
      version: '1.0',
      exportDate: new Date().toISOString(),
      templates: this.getTemplates(),
      history: this.getHistory(),
      settings: this.getSettings()
    };
    return JSON.stringify(backup, null, 2);
  },

  importBackupJson(jsonString: string): boolean {
    try {
      const data = JSON.parse(jsonString);
      if (data.templates && Array.isArray(data.templates)) {
        localStorage.setItem(STORAGE_KEYS.TEMPLATES, JSON.stringify(data.templates));
      }
      if (data.history && Array.isArray(data.history)) {
        localStorage.setItem(STORAGE_KEYS.HISTORY, JSON.stringify(data.history));
      }
      if (data.settings) {
        localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(data.settings));
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
  }
};
