import React from 'react';
import { renderToString } from 'react-dom/server';
import { beforeEach, describe, expect, it } from 'vitest';
import { storageService } from '../src/services/storageService';
import { evaluateDoubleProgression } from '../src/services/progressionEngine';
import { AnalyticsView } from '../src/components/AnalyticsView';
import type { CompletedWorkout, WorkoutTemplate } from '../src/types';

class MemoryStorage implements Storage {
  protected values = new Map<string, string>();
  get length() { return this.values.size; }
  clear() { this.values.clear(); }
  getItem(key: string) { return this.values.get(key) ?? null; }
  key(index: number) { return [...this.values.keys()][index] ?? null; }
  removeItem(key: string) { this.values.delete(key); }
  setItem(key: string, value: string) { this.values.set(key, String(value)); }
}

class QuotaThrowingStorage extends MemoryStorage {
  public failOnKey: string | null = null;
  override setItem(key: string, value: string) {
    if (this.failOnKey && this.failOnKey === key) {
      throw new Error('QuotaExceededError: LocalStorage quota exceeded');
    }
    super.setItem(key, value);
  }
}

beforeEach(() => {
  Object.defineProperty(globalThis, 'localStorage', {
    value: new MemoryStorage(),
    configurable: true
  });
});

describe('F1a: deleteCompletedWorkout', () => {
  it('delete removes the workout from both ironforge_history_v1 and templates exercise.history', () => {
    const template: WorkoutTemplate = {
      id: 't-push',
      name: 'Push Day',
      description: '',
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
    storageService.saveTemplates([template]);

    const workout1: CompletedWorkout = {
      id: 'w-1',
      templateId: 't-push',
      templateName: 'Push Day',
      startTime: Date.now() - 3600000,
      endTime: Date.now() - 1800000,
      durationMinutes: 16,
      totalVolumeKg: 1800,
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
            { setNumber: 1, weight: 60, reps: 10, completed: true, type: 'working' },
            { setNumber: 2, weight: 60, reps: 10, completed: true, type: 'working' },
            { setNumber: 3, weight: 60, reps: 10, completed: true, type: 'working' }
          ],
          progression: {
            decision: 'INCREASE_REPS',
            nextWeight: 60,
            targetRepRange: '8-12',
            badgeText: 'В плане',
            badgeColor: 'blue',
            analysis: '',
            suggestedAction: '',
            consecutivePlateauCount: 0
          }
        }
      ]
    };
    storageService.saveCompletedWorkout(workout1);

    expect(storageService.getHistory()).toHaveLength(1);
    expect(storageService.getTemplates()[0].exercises[0].history).toHaveLength(1);

    const deleted = storageService.deleteCompletedWorkout('w-1');
    expect(deleted).toBe(true);
    expect(storageService.getHistory()).toHaveLength(0);
    expect(storageService.getTemplates()[0].exercises[0].history).toHaveLength(0);
  });

  it('next recommendation after deleting a bogus 600 kg session is based on the previous real session', () => {
    const template: WorkoutTemplate = {
      id: 't-push',
      name: 'Push Day',
      description: '',
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
    storageService.saveTemplates([template]);

    // Session 1: 60 kg x 10, 10, 10
    const workout1: CompletedWorkout = {
      id: 'w-real',
      templateId: 't-push',
      templateName: 'Push Day',
      startTime: 1000,
      endTime: Date.now() - 3600000,
      durationMinutes: 16,
      totalVolumeKg: 1800,
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
            { setNumber: 1, weight: 60, reps: 10, completed: true, type: 'working' },
            { setNumber: 2, weight: 60, reps: 10, completed: true, type: 'working' },
            { setNumber: 3, weight: 60, reps: 10, completed: true, type: 'working' }
          ],
          progression: {
            decision: 'INCREASE_REPS',
            nextWeight: 60,
            targetRepRange: '8-12',
            badgeText: 'В плане',
            badgeColor: 'blue',
            analysis: '',
            suggestedAction: '',
            consecutivePlateauCount: 0
          }
        }
      ]
    };
    storageService.saveCompletedWorkout(workout1);

    // Session 2 (typo): 600 kg instead of 60 kg
    const workoutTypo: CompletedWorkout = {
      id: 'w-typo',
      templateId: 't-push',
      templateName: 'Push Day',
      startTime: Date.now() - 1000000,
      endTime: Date.now() - 500000,
      durationMinutes: 16,
      totalVolumeKg: 18000,
      totalSets: 3,
      exercises: [
        {
          exerciseId: 'bench-press',
          name: 'Жим лёжа',
          category: 'Chest',
          targetSets: 3,
          minReps: 8,
          maxReps: 12,
          workingWeight: 600,
          sets: [
            { setNumber: 1, weight: 600, reps: 10, completed: true, type: 'working' },
            { setNumber: 2, weight: 600, reps: 10, completed: true, type: 'working' },
            { setNumber: 3, weight: 600, reps: 10, completed: true, type: 'working' }
          ],
          progression: {
            decision: 'INCREASE_REPS',
            nextWeight: 600,
            targetRepRange: '8-12',
            badgeText: 'В плане',
            badgeColor: 'blue',
            analysis: '',
            suggestedAction: '',
            consecutivePlateauCount: 0
          }
        }
      ]
    };
    storageService.saveCompletedWorkout(workoutTypo);

    // After typo, currentWeight is 600
    expect(storageService.getTemplates()[0].exercises[0].currentWeight).toBe(600);

    // Delete the typo workout
    const deleted = storageService.deleteCompletedWorkout('w-typo');
    expect(deleted).toBe(true);

    const exAfter = storageService.getTemplates()[0].exercises[0];
    expect(exAfter.currentWeight).toBe(60);
    expect(exAfter.history).toHaveLength(1);

    // Evaluate progression
    const rec = evaluateDoubleProgression(
      exAfter.targetSets,
      exAfter.minReps,
      exAfter.maxReps,
      exAfter.weightStep,
      exAfter.currentWeight,
      exAfter.history
    );
    expect(rec.nextWeight).toBe(60);
  });

  it('delete of unknown id returns false and writes nothing', () => {
    localStorage.setItem('ironforge_history_v1', JSON.stringify([{ id: 'w-keep', endTime: Date.now() - 1800000, exercises: [] }]));
    const initialRawHistory = localStorage.getItem('ironforge_history_v1');
    const initialRawTemplates = localStorage.getItem('ironforge_templates_v1');

    const result = storageService.deleteCompletedWorkout('non-existent-id');
    expect(result).toBe(false);
    expect(localStorage.getItem('ironforge_history_v1')).toBe(initialRawHistory);
    expect(localStorage.getItem('ironforge_templates_v1')).toBe(initialRawTemplates);
  });

  it('quota failure leaves storage byte-identical on delete', () => {
    const rawTemplates = JSON.stringify([{ id: 't1', name: 'T1', exercises: [{ id: 'e1', name: 'E1', currentWeight: 50, history: [{ workoutId: 'w-del' }] }] }]);
    const rawHistory = JSON.stringify([{ id: 'w-del', endTime: 10, exercises: [] }]);

    const storage = new QuotaThrowingStorage();
    storage.setItem('ironforge_templates_v1', rawTemplates);
    storage.setItem('ironforge_history_v1', rawHistory);
    // Make next setItem throw on ironforge_history_v1
    storage.failOnKey = 'ironforge_history_v1';

    Object.defineProperty(globalThis, 'localStorage', {
      value: storage,
      configurable: true
    });

    expect(() => storageService.deleteCompletedWorkout('w-del')).toThrow();
    expect(localStorage.getItem('ironforge_templates_v1')).toBe(rawTemplates);
    expect(localStorage.getItem('ironforge_history_v1')).toBe(rawHistory);
  });

  it('old fixture data survives delete of another workout', () => {
    const oldFixtureWorkout = {
      id: 'fixture-old',
      templateId: 'old-template',
      templateName: 'Old Workout',
      startTime: 100,
      endTime: 200,
      durationMinutes: 10,
      totalVolumeKg: 1000,
      totalSets: 2,
      exercises: []
    };
    const workoutToDelete = {
      id: 'w-to-delete',
      templateId: 'old-template',
      templateName: 'Old Workout',
      startTime: 300,
      endTime: 400,
      durationMinutes: 10,
      totalVolumeKg: 1000,
      totalSets: 2,
      exercises: []
    };
    localStorage.setItem('ironforge_history_v1', JSON.stringify([workoutToDelete, oldFixtureWorkout]));
    localStorage.setItem('ironforge_templates_v1', JSON.stringify([{ id: 'old-template', name: 'Old', exercises: [] }]));

    storageService.deleteCompletedWorkout('w-to-delete');

    const history = storageService.getHistory();
    expect(history).toHaveLength(1);
    expect(history[0].id).toBe('fixture-old');
  });
});


describe('F1b: updateCompletedWorkout', () => {
  it('edit recomputes totalVolumeKg, totalSets, exercise workingWeight and estimated1RM', () => {
    const template: WorkoutTemplate = {
      id: 't-edit',
      name: 'Leg Day',
      description: '',
      exercises: [
        {
          id: 'squat',
          name: 'Приседания',
          category: 'Legs',
          targetSets: 3,
          minReps: 8,
          maxReps: 12,
          weightStep: 2.5,
          currentWeight: 100,
          restSeconds: 90,
          history: []
        }
      ]
    };
    storageService.saveTemplates([template]);

    const workout: CompletedWorkout = {
      id: 'w-edit-1',
      templateId: 't-edit',
      templateName: 'Leg Day',
      startTime: Date.now() - 3600000,
      endTime: Date.now() - 1800000,
      durationMinutes: 30,
      totalVolumeKg: 3000,
      totalSets: 3,
      exercises: [
        {
          exerciseId: 'squat',
          name: 'Приседания',
          category: 'Legs',
          targetSets: 3,
          minReps: 8,
          maxReps: 12,
          workingWeight: 100,
          sets: [
            { setNumber: 1, weight: 100, reps: 10, completed: true, type: 'working' },
            { setNumber: 2, weight: 100, reps: 10, completed: true, type: 'working' },
            { setNumber: 3, weight: 100, reps: 10, completed: true, type: 'working' }
          ],
          progression: {
            decision: 'INCREASE_WEIGHT',
            nextWeight: 102.5,
            targetRepRange: '8-12',
            badgeText: 'Отлично',
            badgeColor: 'emerald',
            analysis: '',
            suggestedAction: '',
            consecutivePlateauCount: 0
          }
        }
      ]
    };
    storageService.saveCompletedWorkout(workout);

    // Initial check
    expect(storageService.getTemplates()[0].exercises[0].currentWeight).toBe(100);

    // Edit: change weight from 100 to 110 kg and reps to 12
    const updatedWorkout: CompletedWorkout = {
      ...workout,
      exercises: [
        {
          ...workout.exercises[0],
          sets: [
            { setNumber: 1, weight: 110, reps: 12, completed: true, type: 'working' },
            { setNumber: 2, weight: 110, reps: 12, completed: true, type: 'working' },
            { setNumber: 3, weight: 110, reps: 12, completed: true, type: 'working' }
          ]
        }
      ]
    };

    const res = storageService.updateCompletedWorkout('w-edit-1', updatedWorkout);
    expect(res).toBe(true);

    const savedWorkout = storageService.getHistory()[0];
    // Volume: 3 * 110 * 12 = 3960
    expect(savedWorkout.totalVolumeKg).toBe(3960);
    expect(savedWorkout.totalSets).toBe(3);
    expect(savedWorkout.exercises[0].workingWeight).toBe(110);
    // Progression note preserved
    expect(savedWorkout.exercises[0].progression.badgeText).toBe('Отлично');

    const savedTemplate = storageService.getTemplates()[0];
    const savedEx = savedTemplate.exercises[0];
    expect(savedEx.currentWeight).toBe(110);
    expect(savedEx.history[0].totalVolume).toBe(3960);
    // Estimated 1RM for 110 kg x 12 reps: 110 * (1 + 12/30) = 110 * 1.4 = 154
    expect(savedEx.history[0].estimated1RM).toBe(154);
  });

  it('edit refuses adding/removing exercises or sets', () => {
    const workout: CompletedWorkout = {
      id: 'w-struct',
      templateId: 't',
      templateName: 'T',
      startTime: 100,
      endTime: 200,
      durationMinutes: 10,
      totalVolumeKg: 100,
      totalSets: 1,
      exercises: [
        {
          exerciseId: 'e1',
          name: 'E1',
          category: 'Chest',
          targetSets: 1,
          minReps: 8,
          maxReps: 12,
          workingWeight: 50,
          sets: [{ setNumber: 1, weight: 50, reps: 10, completed: true }],
          progression: { decision: 'FIRST_SESSION', nextWeight: 50, targetRepRange: '8-12', badgeText: '', badgeColor: 'blue', analysis: '', suggestedAction: '', consecutivePlateauCount: 0 }
        }
      ]
    };
    storageService.saveCompletedWorkout(workout);

    // Try adding a set
    const withExtraSet: CompletedWorkout = {
      ...workout,
      exercises: [
        {
          ...workout.exercises[0],
          sets: [
            { setNumber: 1, weight: 50, reps: 10, completed: true },
            { setNumber: 2, weight: 50, reps: 10, completed: true }
          ]
        }
      ]
    };
    expect(storageService.updateCompletedWorkout('w-struct', withExtraSet)).toBe(false);

    // Try adding an exercise
    const withExtraExercise: CompletedWorkout = {
      ...workout,
      exercises: [
        ...workout.exercises,
        { ...workout.exercises[0], exerciseId: 'e2', name: 'E2' }
      ]
    };
    expect(storageService.updateCompletedWorkout('w-struct', withExtraExercise)).toBe(false);
  });

  it('quota failure leaves storage byte-identical on edit', () => {
    const rawTemplates = JSON.stringify([{ id: 't1', name: 'T1', exercises: [{ id: 'e1', name: 'E1', currentWeight: 50, history: [{ workoutId: 'w-edit-fail', sets: [{ setNumber: 1, weight: 50, reps: 5 }] }] }] }]);
    const rawHistory = JSON.stringify([{
      id: 'w-edit-fail',
      templateId: 't1',
      templateName: 'T1',
      startTime: 100,
      endTime: 200,
      durationMinutes: 10,
      totalVolumeKg: 250,
      totalSets: 1,
      exercises: [{
        exerciseId: 'e1',
        name: 'E1',
        category: 'Chest',
        targetSets: 1,
        minReps: 8,
        maxReps: 12,
        workingWeight: 50,
        sets: [{ setNumber: 1, weight: 50, reps: 5, completed: true }],
        progression: { decision: 'FIRST_SESSION', nextWeight: 50, targetRepRange: '8-12', badgeText: '', badgeColor: 'blue', analysis: '', suggestedAction: '', consecutivePlateauCount: 0 }
      }]
    }]);

    const storage = new QuotaThrowingStorage();
    storage.setItem('ironforge_templates_v1', rawTemplates);
    storage.setItem('ironforge_history_v1', rawHistory);
    storage.failOnKey = 'ironforge_history_v1';

    Object.defineProperty(globalThis, 'localStorage', {
      value: storage,
      configurable: true
    });

    const nextWorkout = JSON.parse(rawHistory)[0];
    nextWorkout.exercises[0].sets[0].weight = 60;

    expect(() => storageService.updateCompletedWorkout('w-edit-fail', nextWorkout)).toThrow();
    expect(localStorage.getItem('ironforge_templates_v1')).toBe(rawTemplates);
    expect(localStorage.getItem('ironforge_history_v1')).toBe(rawHistory);
  });
});


describe('F2a: delete & undo logic', () => {
  it('undo restores byte-identical strings when storage was not modified in between', () => {
    const rawTemplates = JSON.stringify([{ id: 't-undo', name: 'T', exercises: [{ id: 'e1', name: 'E1', currentWeight: 50, history: [{ workoutId: 'w-undo', sets: [{ setNumber: 1, weight: 50, reps: 5 }] }] }] }]);
    const rawHistory = JSON.stringify([{
      id: 'w-undo',
      templateId: 't-undo',
      templateName: 'T',
      startTime: 100,
      endTime: 200,
      durationMinutes: 10,
      totalVolumeKg: 250,
      totalSets: 1,
      exercises: [{
        exerciseId: 'e1',
        name: 'E1',
        category: 'Chest',
        targetSets: 1,
        minReps: 8,
        maxReps: 12,
        workingWeight: 50,
        sets: [{ setNumber: 1, weight: 50, reps: 5, completed: true }],
        progression: { decision: 'FIRST_SESSION', nextWeight: 50, targetRepRange: '8-12', badgeText: '', badgeColor: 'blue', analysis: '', suggestedAction: '', consecutivePlateauCount: 0 }
      }]
    }]);

    localStorage.setItem('ironforge_templates_v1', rawTemplates);
    localStorage.setItem('ironforge_history_v1', rawHistory);

    // Snapshot pre-delete
    const preTemplates = localStorage.getItem('ironforge_templates_v1');
    const preHistory = localStorage.getItem('ironforge_history_v1');

    // Delete
    const deleted = storageService.deleteCompletedWorkout('w-undo');
    expect(deleted).toBe(true);

    const postTemplates = localStorage.getItem('ironforge_templates_v1');
    const postHistory = localStorage.getItem('ironforge_history_v1');

    // Undo validation: current values equal post-delete values
    const currentTemplates = localStorage.getItem('ironforge_templates_v1');
    const currentHistory = localStorage.getItem('ironforge_history_v1');
    const canUndo = currentTemplates === postTemplates && currentHistory === postHistory;
    expect(canUndo).toBe(true);

    // Restore
    if (canUndo) {
      if (preTemplates != null) localStorage.setItem('ironforge_templates_v1', preTemplates);
      if (preHistory != null) localStorage.setItem('ironforge_history_v1', preHistory);
    }

    expect(localStorage.getItem('ironforge_templates_v1')).toBe(rawTemplates);
    expect(localStorage.getItem('ironforge_history_v1')).toBe(rawHistory);
  });

  it('undo is refused after another save occurs', () => {
    const rawTemplates = JSON.stringify([{ id: 't-undo2', name: 'T', exercises: [{ id: 'e1', name: 'E1', currentWeight: 50, history: [{ workoutId: 'w-undo2', sets: [] }] }] }]);
    const rawHistory = JSON.stringify([{
      id: 'w-undo2',
      templateId: 't-undo2',
      templateName: 'T',
      startTime: 100,
      endTime: 200,
      durationMinutes: 10,
      totalVolumeKg: 0,
      totalSets: 0,
      exercises: []
    }]);

    localStorage.setItem('ironforge_templates_v1', rawTemplates);
    localStorage.setItem('ironforge_history_v1', rawHistory);

    storageService.deleteCompletedWorkout('w-undo2');

    const postTemplates = localStorage.getItem('ironforge_templates_v1');
    const postHistory = localStorage.getItem('ironforge_history_v1');

    // Another workout is saved in the meantime
    storageService.saveCompletedWorkout({
      id: 'w-new-session',
      templateId: 't-undo2',
      templateName: 'T',
      startTime: 300,
      endTime: 400,
      durationMinutes: 10,
      totalVolumeKg: 0,
      totalSets: 0,
      exercises: []
    });

    // Check undo condition
    const currentTemplates = localStorage.getItem('ironforge_templates_v1');
    const currentHistory = localStorage.getItem('ironforge_history_v1');
    const canUndo = currentTemplates === postTemplates && currentHistory === postHistory;

    expect(canUndo).toBe(false);
  });
});

describe('F2a UI rendering', () => {
  it('renders history list with delete buttons and handles empty state', () => {
    const html = renderToString(React.createElement(AnalyticsView, { history: [], templates: [] }));
    expect(html).toContain('История тренировок');
    expect(html).toContain('Журнал пуст');
  });

  it('renders workout card with delete action in expanded state', () => {
    const workout: CompletedWorkout = {
      id: 'w-render-1',
      templateId: 't1',
      templateName: 'День рук',
      startTime: Date.now() - 3600000,
      endTime: Date.now() - 1800000,
      durationMinutes: 45,
      totalVolumeKg: 1500,
      totalSets: 3,
      exercises: [
        {
          exerciseId: 'curl',
          name: 'Подъём штанги',
          category: 'Arms',
          targetSets: 3,
          minReps: 8,
          maxReps: 12,
          workingWeight: 30,
          sets: [{ setNumber: 1, weight: 30, reps: 10, completed: true }],
          progression: { decision: 'FIRST_SESSION', nextWeight: 30, targetRepRange: '8-12', badgeText: '', badgeColor: 'blue', analysis: '', suggestedAction: '', consecutivePlateauCount: 0 }
        }
      ]
    };

    const html = renderToString(React.createElement(AnalyticsView, { history: [workout], templates: [], initialExpandedWorkoutId: workout.id }));
    expect(html).toContain('День рук');
    expect(html).toContain('1500');
    expect(html).toContain('Удалить');
  });
});
