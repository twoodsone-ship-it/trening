import { beforeEach, describe, expect, it } from 'vitest';
import { storageService } from '../src/services/storageService';
import { evaluateDoubleProgression } from '../src/services/progressionEngine';
import { deriveExerciseHistoryFromCompletedWorkouts } from '../src/services/storageService';
import type { CompletedWorkout, WorkoutTemplate } from '../src/types';

class MemoryStorage implements Storage {
  private store = new Map<string, string>();
  get length() { return this.store.size; }
  clear() { this.store.clear(); }
  getItem(key: string) { return this.store.has(key) ? this.store.get(key)! : null; }
  key(index: number) { return Array.from(this.store.keys())[index] ?? null; }
  removeItem(key: string) { this.store.delete(key); }
  setItem(key: string, value: string) { this.store.set(key, String(value)); }
}

describe('K4a: Skipped exercise handling in saveCompletedWorkout and templates', () => {
  beforeEach(() => {
    Object.defineProperty(globalThis, 'localStorage', {
      value: new MemoryStorage(),
      configurable: true,
      writable: true
    });
  });

  it('saveCompletedWorkout does not append template session or update currentWeight for skipped exercise', () => {
    const template: WorkoutTemplate = {
      id: 't1',
      name: 'День А',
      description: 'Тестовая программа',
      exercises: [
        {
          id: 'bench-press',
          name: 'Жим лёжа',
          category: 'Chest',
          targetSets: 3,
          minReps: 8,
          maxReps: 12,
          weightStep: 2.5,
          currentWeight: 60,
          restSeconds: 90,
          history: []
        }
      ]
    };

    localStorage.setItem('ironforge_templates_v1', JSON.stringify([template]));

    // Workout 1: Bench 3x12 @ 60kg RPE 8 -> earns INCREASE_WEIGHT, next 62.5
    const workout1: CompletedWorkout = {
      id: 'w1',
      templateId: 't1',
      templateName: 'День А',
      startTime: 1000,
      endTime: 2000,
      durationMinutes: 45,
      totalVolumeKg: 2160,
      totalSets: 3,
      exercises: [
        {
          exerciseId: 'bench-press',
          name: 'Жим лёжа',
          category: 'Chest',
          targetSets: 3,
          minReps: 8,
          maxReps: 12,
          workingWeight: 60,
          sets: [
            { setNumber: 1, weight: 60, reps: 12, rpe: 8, completed: true, type: 'working' },
            { setNumber: 2, weight: 60, reps: 12, rpe: 8, completed: true, type: 'working' },
            { setNumber: 3, weight: 60, reps: 12, rpe: 8, completed: true, type: 'working' }
          ],
          progression: {
            decision: 'INCREASE_WEIGHT',
            nextWeight: 62.5,
            targetRepRange: '8-10',
            badgeText: '⚡ +2.5 кг Повышение!',
            badgeColor: 'emerald',
            analysis: 'Отличная работа!',
            suggestedAction: 'Увеличьте вес до 62.5 кг.',
            consecutivePlateauCount: 0
          }
        }
      ]
    };

    storageService.saveCompletedWorkout(workout1);

    const afterW1 = storageService.getTemplates()[0].exercises[0];
    expect(afterW1.history).toHaveLength(1);
    expect(afterW1.currentWeight).toBe(60);

    // Workout 2: Bench is skipped (zero completed working sets)
    const workout2: CompletedWorkout = {
      id: 'w2',
      templateId: 't1',
      templateName: 'День А',
      startTime: 3000,
      endTime: 4000,
      durationMinutes: 45,
      totalVolumeKg: 0,
      totalSets: 0,
      exercises: [
        {
          exerciseId: 'bench-press',
          name: 'Жим лёжа',
          category: 'Chest',
          targetSets: 3,
          minReps: 8,
          maxReps: 12,
          workingWeight: 60,
          sets: [
            { setNumber: 1, weight: 60, reps: 8, completed: false, type: 'working' },
            { setNumber: 2, weight: 60, reps: 8, completed: false, type: 'working' },
            { setNumber: 3, weight: 60, reps: 8, completed: false, type: 'working' }
          ],
          progression: {
            decision: 'INCREASE_REPS',
            nextWeight: 60,
            targetRepRange: '8-12',
            badgeText: '🎯 Цель: рабочие сеты',
            badgeColor: 'blue',
            analysis: 'В прошлой тренировке зафиксированы неполные данные.',
            suggestedAction: 'Работайте с весом 60 кг.',
            consecutivePlateauCount: 0
          }
        }
      ]
    };

    storageService.saveCompletedWorkout(workout2);

    // Exercise stays in CompletedWorkout in history
    const history = storageService.getHistory();
    expect(history).toHaveLength(2);
    expect(history[0].exercises[0].exerciseId).toBe('bench-press');

    // BUT template exercise.history must NOT have an empty session appended
    const afterW2 = storageService.getTemplates()[0].exercises[0];
    expect(afterW2.history).toHaveLength(1); // Still only the 1 valid session from workout1!
    expect(afterW2.history[0].workoutId).toBe('w1');
    expect(afterW2.currentWeight).toBe(60);

    // Next progression recommendation must still be INCREASE_WEIGHT 62.5, NOT INCREASE_REPS 60!
    const nextRec = evaluateDoubleProgression(
      afterW2.targetSets,
      afterW2.minReps,
      afterW2.maxReps,
      afterW2.weightStep,
      afterW2.currentWeight,
      afterW2.history,
      'optimal',
      new Date(5000)
    );
    expect(nextRec.decision).toBe('INCREASE_WEIGHT');
    expect(nextRec.nextWeight).toBe(62.5);
  });

  it('cardio duration session with durationSeconds > 0 is considered valid and saved', () => {
    const template: WorkoutTemplate = {
      id: 't-cardio',
      name: 'Кардио день',
      description: 'Кардио',
      exercises: [
        {
          id: 'treadmill',
          name: 'Беговая дорожка',
          category: 'Cardio',
          trackingMode: 'duration',
          targetSets: 1,
          minReps: 1,
          maxReps: 1,
          weightStep: 0,
          currentWeight: 0,
          restSeconds: 60,
          defaultDurationSeconds: 1200,
          history: []
        }
      ]
    };

    localStorage.setItem('ironforge_templates_v1', JSON.stringify([template]));

    const cardioWorkout: CompletedWorkout = {
      id: 'w-cardio',
      templateId: 't-cardio',
      templateName: 'Кардио день',
      startTime: 1000,
      endTime: 2200,
      durationMinutes: 20,
      totalVolumeKg: 0,
      totalSets: 1,
      exercises: [
        {
          exerciseId: 'treadmill',
          name: 'Беговая дорожка',
          category: 'Cardio',
          trackingMode: 'duration',
          targetSets: 1,
          minReps: 1,
          maxReps: 1,
          workingWeight: 0,
          sets: [
            { setNumber: 1, weight: 0, reps: 0, durationSeconds: 1200, completed: true, type: 'working' }
          ],
          progression: {
            decision: 'FIRST_SESSION',
            nextWeight: 0,
            targetRepRange: 'по времени',
            badgeText: 'Работа по времени',
            badgeColor: 'blue',
            analysis: '',
            suggestedAction: '',
            consecutivePlateauCount: 0
          }
        }
      ]
    };

    storageService.saveCompletedWorkout(cardioWorkout);

    const savedEx = storageService.getTemplates()[0].exercises[0];
    expect(savedEx.history).toHaveLength(1);
    expect(savedEx.history[0].workoutId).toBe('w-cardio');
    expect(savedEx.history[0].totalDurationSeconds).toBe(1200);
  });

  it('deriveExerciseHistoryFromCompletedWorkouts skips empty exercise entries', () => {
    const workouts: CompletedWorkout[] = [
      {
        id: 'w-valid',
        templateId: 't1',
        templateName: 'День',
        startTime: 1000,
        endTime: 2000,
        durationMinutes: 45,
        totalVolumeKg: 1000,
        totalSets: 1,
        exercises: [
          {
            exerciseId: 'squat',
            name: 'Присед',
            category: 'Legs',
            targetSets: 3,
            minReps: 8,
            maxReps: 12,
            workingWeight: 100,
            sets: [{ setNumber: 1, weight: 100, reps: 10, completed: true, type: 'working' }],
            progression: { decision: 'FIRST_SESSION', nextWeight: 100, targetRepRange: '8-12', badgeText: '', badgeColor: 'blue', analysis: '', suggestedAction: '', consecutivePlateauCount: 0 }
          }
        ]
      },
      {
        id: 'w-skipped',
        templateId: 't1',
        templateName: 'День',
        startTime: 3000,
        endTime: 4000,
        durationMinutes: 45,
        totalVolumeKg: 0,
        totalSets: 0,
        exercises: [
          {
            exerciseId: 'squat',
            name: 'Присед',
            category: 'Legs',
            targetSets: 3,
            minReps: 8,
            maxReps: 12,
            workingWeight: 100,
            sets: [{ setNumber: 1, weight: 100, reps: 0, completed: false, type: 'working' }],
            progression: { decision: 'FIRST_SESSION', nextWeight: 100, targetRepRange: '8-12', badgeText: '', badgeColor: 'blue', analysis: '', suggestedAction: '', consecutivePlateauCount: 0 }
          }
        ]
      }
    ];

    const derived = deriveExerciseHistoryFromCompletedWorkouts('squat', workouts);
    expect(derived).toHaveLength(1);
    expect(derived[0].workoutId).toBe('w-valid');
  });

  it('deleteCompletedWorkout and updateCompletedWorkout work correctly when a workout has no matching template session', () => {
    const template: WorkoutTemplate = {
      id: 't1',
      name: 'День',
      description: 'Тест',
      exercises: [
        {
          id: 'bench-press',
          name: 'Жим',
          category: 'Chest',
          targetSets: 3,
          minReps: 8,
          maxReps: 12,
          weightStep: 2.5,
          currentWeight: 60,
          restSeconds: 90,
          history: []
        }
      ]
    };

    localStorage.setItem('ironforge_templates_v1', JSON.stringify([template]));

    // Workout where bench was skipped
    const emptyWorkout: CompletedWorkout = {
      id: 'w-empty-1',
      templateId: 't1',
      templateName: 'День',
      startTime: 1000,
      endTime: 2000,
      durationMinutes: 10,
      totalVolumeKg: 0,
      totalSets: 0,
      exercises: [
        {
          exerciseId: 'bench-press',
          name: 'Жим',
          category: 'Chest',
          targetSets: 3,
          minReps: 8,
          maxReps: 12,
          workingWeight: 60,
          sets: [],
          progression: { decision: 'FIRST_SESSION', nextWeight: 60, targetRepRange: '8-12', badgeText: '', badgeColor: 'blue', analysis: '', suggestedAction: '', consecutivePlateauCount: 0 }
        }
      ]
    };

    storageService.saveCompletedWorkout(emptyWorkout);
    expect(storageService.getHistory()).toHaveLength(1);
    expect(storageService.getTemplates()[0].exercises[0].history).toHaveLength(0);

    // Update the workout
    const okUpdate = storageService.updateCompletedWorkout('w-empty-1', {
      ...emptyWorkout,
      exercises: emptyWorkout.exercises
    });
    expect(okUpdate).toBe(true);
    expect(storageService.getTemplates()[0].exercises[0].history).toHaveLength(0);

    // Delete the workout
    const okDelete = storageService.deleteCompletedWorkout('w-empty-1');
    expect(okDelete).toBe(true);
    expect(storageService.getHistory()).toHaveLength(0);
    expect(storageService.getTemplates()[0].exercises[0].history).toHaveLength(0);
    expect(storageService.getTemplates()[0].exercises[0].currentWeight).toBe(60);
  });
});

describe('K4b: Engine safety net for already-polluted legacy history', () => {
  it('legacy history containing an empty session still recommends from the last valid one', () => {
    const legacyHistory: any[] = [
      {
        id: 'h1',
        workoutId: 'w1',
        date: new Date(Date.now() - 2 * 86400000).toISOString(),
        targetSets: 3,
        minReps: 8,
        maxReps: 12,
        weight: 60,
        sets: [
          { setNumber: 1, weight: 60, reps: 12, rpe: 8, completed: true, type: 'working' },
          { setNumber: 2, weight: 60, reps: 12, rpe: 8, completed: true, type: 'working' },
          { setNumber: 3, weight: 60, reps: 12, rpe: 8, completed: true, type: 'working' }
        ],
        totalVolume: 2160,
        estimated1RM: 84
      },
      // Polluted legacy empty session recorded yesterday
      {
        id: 'h2-empty',
        workoutId: 'w2',
        date: new Date(Date.now() - 1 * 86400000).toISOString(),
        targetSets: 3,
        minReps: 8,
        maxReps: 12,
        weight: 60,
        sets: [
          { setNumber: 1, weight: 60, reps: 0, completed: false, type: 'working' },
          { setNumber: 2, weight: 60, reps: 0, completed: false, type: 'working' },
          { setNumber: 3, weight: 60, reps: 0, completed: false, type: 'working' }
        ],
        totalVolume: 0,
        estimated1RM: 0
      }
    ];

    const recommendation = evaluateDoubleProgression(
      3, 8, 12, 2.5, 60, legacyHistory, 'optimal'
    );

    // Must ignore h2-empty and recommend INCREASE_WEIGHT 62.5 based on h1!
    expect(recommendation.decision).toBe('INCREASE_WEIGHT');
    expect(recommendation.nextWeight).toBe(62.5);
  });

  it('break check ignores invalid sessions and calculates elapsed days from the last valid session', () => {
    const legacyHistory: any[] = [
      // Valid session 30 days ago
      {
        id: 'h1',
        workoutId: 'w1',
        date: new Date(Date.now() - 30 * 86400000).toISOString(),
        targetSets: 3,
        minReps: 8,
        maxReps: 12,
        weight: 60,
        sets: [
          { setNumber: 1, weight: 60, reps: 10, rpe: 8, completed: true, type: 'working' }
        ],
        totalVolume: 600,
        estimated1RM: 80
      },
      // Empty session 1 day ago
      {
        id: 'h2-empty',
        workoutId: 'w2',
        date: new Date(Date.now() - 1 * 86400000).toISOString(),
        targetSets: 3,
        minReps: 8,
        maxReps: 12,
        weight: 60,
        sets: [],
        totalVolume: 0
      }
    ];

    const recommendation = evaluateDoubleProgression(
      3, 8, 12, 2.5, 60, legacyHistory, 'optimal'
    );

    // Because 30 days elapsed since last valid session (> 21 days), should trigger returning after break
    expect(recommendation.badgeText).toContain('Возвращение после перерыва');
  });

  it('falls back to all sessions if no valid session exists at all', () => {
    const onlyEmptyHistory: any[] = [
      {
        id: 'h-empty-only',
        workoutId: 'w-only',
        date: new Date().toISOString(),
        targetSets: 3,
        minReps: 8,
        maxReps: 12,
        weight: 50,
        sets: [],
        totalVolume: 0
      }
    ];

    const recommendation = evaluateDoubleProgression(
      3, 8, 12, 2.5, 50, onlyEmptyHistory, 'optimal'
    );

    expect(recommendation).toBeDefined();
    expect(recommendation.decision).toBe('INCREASE_REPS');
    expect(recommendation.badgeText).toBe('🎯 Цель: рабочие сеты');
  });
});
