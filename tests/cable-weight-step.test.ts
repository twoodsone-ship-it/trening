import { describe, expect, it } from 'vitest';
import { EXERCISE_CATALOG } from '../src/data/exerciseCatalog';
import { evaluateDoubleProgression } from '../src/services/progressionEngine';
import { buildActiveExercises } from '../src/hooks/useWorkoutSession';
import type { ExerciseSession, WorkoutTemplate } from '../src/types';

describe('cable exercises weight step and progression', () => {
  it('has weightStep = 4.5 and defaultWeight as a multiple of 4.5 for all cable exercises in catalog', () => {
    const cableExercises = Object.values(EXERCISE_CATALOG).filter(ex => ex.equipment === 'cable');
    expect(cableExercises.length).toBeGreaterThan(0);

    cableExercises.forEach(ex => {
      expect(ex.weightStep).toBe(4.5);
      expect(ex.defaultWeight % 4.5).toBeCloseTo(0, 5);
    });
  });

  it('progresses cable exercise through 18, 22.5, 27, 31.5 kg', () => {
    const targetSets = 3;
    const minReps = 10;
    const maxReps = 15;
    const weightStep = 4.5;

    const makeSession = (weight: number): ExerciseSession => ({
      id: `s-${weight}`,
      workoutId: `w-${weight}`,
      date: new Date().toISOString(),
      targetSets,
      minReps,
      maxReps,
      weight,
      totalVolume: weight * targetSets * maxReps,
      estimated1RM: weight * 1.5,
      sets: [
        { setNumber: 1, weight, reps: 15, rpe: 8, completed: true },
        { setNumber: 2, weight, reps: 15, rpe: 8, completed: true },
        { setNumber: 3, weight, reps: 15, rpe: 8, completed: true }
      ]
    });

    // Session 1: Started at 18kg, hit max reps (15, 15, 15) with low RPE
    const history1: ExerciseSession[] = [makeSession(18)];

    const rec1 = evaluateDoubleProgression(targetSets, minReps, maxReps, weightStep, 18, history1);
    expect(rec1.decision).toBe('INCREASE_WEIGHT');
    expect(rec1.nextWeight).toBe(22.5);

    // Session 2: Worked at 22.5kg, hit max reps again
    const history2: ExerciseSession[] = [...history1, makeSession(22.5)];

    const rec2 = evaluateDoubleProgression(targetSets, minReps, maxReps, weightStep, 22.5, history2);
    expect(rec2.decision).toBe('INCREASE_WEIGHT');
    expect(rec2.nextWeight).toBe(27);

    // Session 3: Worked at 27kg, hit max reps again
    const history3: ExerciseSession[] = [...history2, makeSession(27)];

    const rec3 = evaluateDoubleProgression(targetSets, minReps, maxReps, weightStep, 27, history3);
    expect(rec3.decision).toBe('INCREASE_WEIGHT');
    expect(rec3.nextWeight).toBe(31.5);
  });

  it('snaps unaligned legacy starting weight to closest multiple of 4.5 on next workout', () => {
    // Template has unaligned weight 20 kg
    const template: WorkoutTemplate = {
      id: 'cable-t',
      name: 'Cable workout',
      description: '',
      exercises: [
        {
          id: 'cable-crossover',
          name: 'Сведение рук в кроссовере',
          category: 'Chest',
          equipment: 'cable',
          targetSets: 3,
          minReps: 12,
          maxReps: 15,
          weightStep: 4.5,
          currentWeight: 20,
          restSeconds: 60,
          history: []
        }
      ]
    };

    const activeSessions = buildActiveExercises(template, 'optimal', 'base');
    // 20 kg snaps to nearest 4.5 multiple: 18 kg (20 / 4.5 = 4.44 -> 18)
    expect(activeSessions[0].sets[1].weight).toBe(18);
  });
});
