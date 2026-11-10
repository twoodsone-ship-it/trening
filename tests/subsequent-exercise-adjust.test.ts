import { describe, expect, it } from 'vitest';
import { adjustSubsequentCategoryExercises } from '../src/services/inSessionAdjust';
import type { ActiveExerciseSession } from '../src/types';

function createMockSession(
  exerciseId: string,
  category: any,
  setsCompleted: boolean,
  targetWeight: number,
  rpes: number[] = [],
  equipment: any = 'barbell'
): ActiveExerciseSession {
  return {
    exerciseId,
    name: exerciseId,
    category,
    equipment,
    targetSets: 2,
    minReps: 8,
    maxReps: 12,
    weightStep: 2.5,
    targetWeight,
    restSeconds: 90,
    sets: [
      { id: `${exerciseId}-1`, setNumber: 1, weight: targetWeight, reps: 10, rpe: rpes[0], completed: setsCompleted },
      { id: `${exerciseId}-2`, setNumber: 2, weight: targetWeight, reps: 10, rpe: rpes[1], completed: setsCompleted }
    ],
    recommendation: {} as any
  };
}

describe('subsequent exercises category auto-adjustment', () => {
  it('increases subsequent unstarted exercises of same category by +1 step when avg RPE <= 6.5', () => {
    const ex1 = createMockSession('bench-press', 'Chest', true, 80, [6, 6]); // avg 6 <= 6.5
    const ex2 = createMockSession('incline-db-press', 'Chest', false, 30); // same category, unstarted
    const ex3 = createMockSession('barbell-row', 'Back', false, 70); // different category

    const { updatedExercises, adjustedCount } = adjustSubsequentCategoryExercises([ex1, ex2, ex3], 0);

    expect(adjustedCount).toBe(1);
    expect(updatedExercises[1].targetWeight).toBe(32.5); // 30 + 2.5
    expect(updatedExercises[1].sets[0].weight).toBe(32.5);
    expect(updatedExercises[1].sets[0].autoAdjusted).toBe(true);
    expect(updatedExercises[1].sets[1].weight).toBe(32.5);
    expect(updatedExercises[1].categoryAdjusted).toBe(true);

    // Back exercise untouched
    expect(updatedExercises[2].targetWeight).toBe(70);
    expect(updatedExercises[2].sets[0].weight).toBe(70);
  });

  it('decreases subsequent unstarted exercises of same category by -1 step when avg RPE >= 9.5', () => {
    const ex1 = createMockSession('bench-press', 'Chest', true, 80, [9.5, 10]); // avg 9.75 >= 9.5
    const ex2 = createMockSession('incline-db-press', 'Chest', false, 30); // same category, unstarted

    const { updatedExercises, adjustedCount } = adjustSubsequentCategoryExercises([ex1, ex2], 0);

    expect(adjustedCount).toBe(1);
    expect(updatedExercises[1].targetWeight).toBe(27.5); // 30 - 2.5
    expect(updatedExercises[1].sets[0].weight).toBe(27.5);
    expect(updatedExercises[1].sets[0].autoAdjusted).toBe(true);
  });

  it('does nothing when avg RPE is moderate (between 6.5 and 9.5)', () => {
    const ex1 = createMockSession('bench-press', 'Chest', true, 80, [8, 8]); // avg 8
    const ex2 = createMockSession('incline-db-press', 'Chest', false, 30);

    const { updatedExercises, adjustedCount } = adjustSubsequentCategoryExercises([ex1, ex2], 0);

    expect(adjustedCount).toBe(0);
    expect(updatedExercises[1].targetWeight).toBe(30);
  });

  it('skips exercises that are already started', () => {
    const ex1 = createMockSession('bench-press', 'Chest', true, 80, [6, 6]);
    const ex2 = createMockSession('incline-db-press', 'Chest', true, 30); // already started

    const { updatedExercises, adjustedCount } = adjustSubsequentCategoryExercises([ex1, ex2], 0);

    expect(adjustedCount).toBe(0);
    expect(updatedExercises[1].targetWeight).toBe(30);
  });

  it('preserves manualWeight on sets', () => {
    const ex1 = createMockSession('bench-press', 'Chest', true, 80, [6, 6]);
    const ex2 = createMockSession('incline-db-press', 'Chest', false, 30);
    ex2.sets[0].manualWeight = true;
    ex2.sets[0].weight = 35;

    const { updatedExercises } = adjustSubsequentCategoryExercises([ex1, ex2], 0);

    expect(updatedExercises[1].targetWeight).toBe(32.5);
    expect(updatedExercises[1].sets[0].weight).toBe(35); // kept manual weight
    expect(updatedExercises[1].sets[1].weight).toBe(32.5); // auto-adjusted
  });

  it('adjusts only once per exercise', () => {
    const ex1 = createMockSession('bench-press', 'Chest', true, 80, [6, 6]);
    const ex2 = createMockSession('incline-db-press', 'Chest', false, 30);
    ex2.categoryAdjusted = true; // already adjusted previously

    const { adjustedCount } = adjustSubsequentCategoryExercises([ex1, ex2], 0);
    expect(adjustedCount).toBe(0);
  });

  it('supports fixed-barbell transitions', () => {
    const ex1 = createMockSession('bench-press', 'Shoulders', true, 80, [6, 6]);
    const ex2 = createMockSession('overhead-press', 'Shoulders', false, 20, [], 'fixed-barbell');

    const { updatedExercises, adjustedCount } = adjustSubsequentCategoryExercises([ex1, ex2], 0);

    expect(adjustedCount).toBe(1);
    expect(updatedExercises[1].targetWeight).toBe(22.5); // discrete jump 20 -> 22.5
    expect(updatedExercises[1].sets[0].weight).toBe(22.5);
  });
});
