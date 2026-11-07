import { describe, expect, it } from 'vitest';
import { buildActiveExercises } from '../src/hooks/useWorkoutSession';
import { migrateActiveSession } from '../src/services/storageService';
import type { Exercise, WorkoutTemplate } from '../src/types';

const exercise = (id: string, overrides: Partial<Exercise> = {}): Exercise => ({
  id,
  name: id,
  category: 'Chest',
  equipment: 'dumbbell',
  targetSets: 2,
  minReps: 8,
  maxReps: 12,
  weightStep: 2.5,
  currentWeight: 40,
  restSeconds: 90,
  history: [],
  ...overrides
});

describe('default trial sets', () => {
  it('starts every exercise with a trial, including bodyweight and timed work', () => {
    const template: WorkoutTemplate = {
      id: 't', name: 'Тренировка', description: '',
      exercises: [
        exercise('press'),
        exercise('row', { currentWeight: 30 }),
        exercise('pushup', { equipment: 'bodyweight', weightStep: 0, currentWeight: 0 }),
        exercise('plank', { trackingMode: 'duration', minReps: 0, maxReps: 0, weightStep: 0, currentWeight: 0, defaultDurationSeconds: 90 })
      ]
    };
    const sessions = buildActiveExercises(template, 'optimal', 'base');

    expect(sessions.map(ex => ex.sets[0].type)).toEqual(['warmup', 'warmup', 'warmup', 'warmup']);
    expect(sessions.map(ex => ex.sets[0].setNumber)).toEqual([0, 0, 0, 0]);
    expect(sessions.map(ex => ex.sets.length)).toEqual([3, 3, 3, 3]);
    expect(sessions[2].sets[0].weight).toBe(0);
    expect(sessions[3].sets[0].durationSeconds).toBe(45);
    expect(new Set(sessions.map(ex => ex.sets[0].id)).size).toBe(4);
  });

  it('fills missing trials in a saved workout without changing exercises already started', () => {
    const workout = {
      templateId: 't', startTime: 123,
      exercises: [
        { exerciseId: 'press', name: 'press', targetWeight: 40, weightStep: 2.5, sets: [{ id: 'done', setNumber: 1, weight: 40, reps: 8, completed: true }] },
        { exerciseId: 'row', name: 'row', targetWeight: 30, weightStep: 2.5, sets: [{ id: 'pending', setNumber: 1, weight: 30, reps: 8, completed: false }] }
      ]
    };
    const migrated = migrateActiveSession(workout)!;
    expect(migrated.exercises[0].sets.map(set => set.id)).toEqual(['done']);
    expect(migrated.exercises[1].sets.map(set => set.id)).toEqual(['trial-123-1', 'pending']);
    expect(migrateActiveSession(migrated)?.exercises[1].sets).toHaveLength(2);
  });
});
