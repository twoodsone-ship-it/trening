import { describe, expect, it } from 'vitest';
import { buildActiveExercises } from '../src/hooks/useWorkoutSession';
import { migrateActiveSession } from '../src/services/storageService';
import { shouldCreateTrialSet } from '../src/utils/trialSet';
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
  it('creates trial sets for standard weighted exercises, but skips bodyweight, cardio, and timed work', () => {
    const template: WorkoutTemplate = {
      id: 't', name: 'Тренировка', description: '',
      exercises: [
        exercise('press'),
        exercise('row', { currentWeight: 30 }),
        exercise('pushup', { equipment: 'bodyweight', weightStep: 0, currentWeight: 0 }),
        exercise('plank', { trackingMode: 'duration', minReps: 0, maxReps: 0, weightStep: 0, currentWeight: 0, defaultDurationSeconds: 90 }),
        exercise('burpees', { category: 'Cardio', equipment: 'bodyweight' })
      ]
    };
    const sessions = buildActiveExercises(template, 'optimal', 'base');

    // Only press and row get warmup/trial sets
    expect(sessions[0].sets[0].type).toBe('warmup');
    expect(sessions[0].sets[0].setNumber).toBe(0);
    expect(sessions[0].sets.length).toBe(3);

    expect(sessions[1].sets[0].type).toBe('warmup');
    expect(sessions[1].sets[0].setNumber).toBe(0);
    expect(sessions[1].sets.length).toBe(3);

    // pushup (bodyweight) has NO trial set
    expect(sessions[2].sets[0].type).toBe('working');
    expect(sessions[2].sets[0].setNumber).toBe(1);
    expect(sessions[2].sets.length).toBe(2);

    // plank (duration) has NO trial set
    expect(sessions[3].sets[0].type).toBe('working');
    expect(sessions[3].sets[0].setNumber).toBe(1);
    expect(sessions[3].sets.length).toBe(2);

    // burpees (cardio) has NO trial set
    expect(sessions[4].sets[0].type).toBe('working');
    expect(sessions[4].sets[0].setNumber).toBe(1);
    expect(sessions[4].sets.length).toBe(2);

    expect(shouldCreateTrialSet({ equipment: 'barbell', category: 'Chest', trackingMode: 'reps' })).toBe(true);
    expect(shouldCreateTrialSet({ equipment: 'bodyweight' })).toBe(false);
    expect(shouldCreateTrialSet({ category: 'Cardio' })).toBe(false);
    expect(shouldCreateTrialSet({ trackingMode: 'duration' })).toBe(false);
  });

  it('fills missing trials in a saved workout without changing exercises already started', () => {
    const workout = {
      templateId: 't', startTime: 123,
      exercises: [
        { exerciseId: 'press', name: 'press', equipment: 'dumbbell', targetWeight: 40, weightStep: 2.5, sets: [{ id: 'done', setNumber: 1, weight: 40, reps: 8, completed: true }] },
        { exerciseId: 'row', name: 'row', equipment: 'dumbbell', targetWeight: 30, weightStep: 2.5, sets: [{ id: 'pending', setNumber: 1, weight: 30, reps: 8, completed: false }] }
      ]
    };
    const migrated = migrateActiveSession(workout)!;
    expect(migrated.exercises[0].sets.map(set => set.id)).toEqual(['done']);
    expect(migrated.exercises[1].sets.map(set => set.id)).toEqual(['trial-123-1', 'pending']);
    expect(migrateActiveSession(migrated)?.exercises[1].sets).toHaveLength(2);
  });
});
