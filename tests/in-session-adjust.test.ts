import { describe, expect, it } from 'vitest';
import {
  calculateInSessionSetAdjustment,
  getSetCountRecommendation
} from '../src/services/inSessionAdjust';
import type { ActiveExerciseSession } from '../src/types';

function createMockExercise(overrides: Partial<ActiveExerciseSession> = {}): ActiveExerciseSession {
  return {
    exerciseId: 'bench-press',
    name: 'Жим штанги лёжа',
    category: 'Chest',
    equipment: 'barbell',
    targetSets: 3,
    minReps: 8,
    maxReps: 12,
    weightStep: 2.5,
    targetWeight: 60,
    restSeconds: 90,
    sets: [
      { id: '1', setNumber: 1, weight: 60, reps: 10, completed: false },
      { id: '2', setNumber: 2, weight: 60, reps: 10, completed: false },
      { id: '3', setNumber: 3, weight: 60, reps: 10, completed: false }
    ],
    recommendation: {} as any,
    ...overrides
  };
}

describe('in-session set weight adjustment', () => {
  it('increases next sets by +1 weightStep when RPE <= 6 and reps >= minReps', () => {
    const ex = createMockExercise();
    const result = calculateInSessionSetAdjustment(ex, 0, 6, 10);

    expect(result.deltaWeight).toBe(2.5);
    expect(result.restDeltaSeconds).toBe(0);
    expect(result.updatedSets[1].weight).toBe(62.5);
    expect(result.updatedSets[1].autoAdjusted).toBe(true);
    expect(result.updatedSets[2].weight).toBe(62.5);
    expect(result.updatedSets[2].autoAdjusted).toBe(true);
    expect(result.toastMessage).toContain('62,5');
    expect(result.toastMessage).toContain('+2,5');
  });

  it('leaves weight unchanged when RPE is 7 or 8 and reps >= minReps', () => {
    const ex = createMockExercise();
    const result7 = calculateInSessionSetAdjustment(ex, 0, 7, 10);
    expect(result7.deltaWeight).toBe(0);
    expect(result7.restDeltaSeconds).toBe(0);

    const result8 = calculateInSessionSetAdjustment(ex, 0, 8, 10);
    expect(result8.deltaWeight).toBe(0);
    expect(result8.restDeltaSeconds).toBe(0);
  });

  it('keeps weight same and adds +30s rest when RPE is 9', () => {
    const ex = createMockExercise();
    const result = calculateInSessionSetAdjustment(ex, 0, 9, 10);

    expect(result.deltaWeight).toBe(0);
    expect(result.restDeltaSeconds).toBe(30);
    expect(result.updatedSets[1].weight).toBe(60);
  });

  it('decreases weight by 1 step and adds rest when RPE is 10 or reps < minReps', () => {
    const ex = createMockExercise();
    // RPE 10
    const res10 = calculateInSessionSetAdjustment(ex, 0, 10, 8);
    expect(res10.deltaWeight).toBe(-2.5);
    expect(res10.restDeltaSeconds).toBeGreaterThanOrEqual(30);
    expect(res10.updatedSets[1].weight).toBe(57.5);
    expect(res10.toastMessage).toContain('57,5');
    expect(res10.toastMessage).toContain('−2,5');

    // reps < minReps (7 < 8)
    const resUnder = calculateInSessionSetAdjustment(ex, 0, 8, 7);
    expect(resUnder.deltaWeight).toBe(-2.5);
    expect(resUnder.updatedSets[1].weight).toBe(57.5);
  });

  it('respects fixed-barbell discrete weights', () => {
    const ex = createMockExercise({
      equipment: 'fixed-barbell',
      weightStep: 5,
      targetWeight: 20,
      sets: [
        { id: '1', setNumber: 1, weight: 20, reps: 10, completed: false },
        { id: '2', setNumber: 2, weight: 20, reps: 10, completed: false }
      ]
    });

    const res = calculateInSessionSetAdjustment(ex, 0, 6, 10);
    expect(res.deltaWeight).toBe(5);
    expect(res.updatedSets[1].weight).toBe(25);
  });

  it('does not touch sets marked with manualWeight: true', () => {
    const ex = createMockExercise({
      sets: [
        { id: '1', setNumber: 1, weight: 60, reps: 10, completed: false },
        { id: '2', setNumber: 2, weight: 70, reps: 10, completed: false, manualWeight: true },
        { id: '3', setNumber: 3, weight: 60, reps: 10, completed: false }
      ]
    });

    const res = calculateInSessionSetAdjustment(ex, 0, 6, 10);
    expect(res.updatedSets[1].weight).toBe(70); // unchanged manualWeight
    expect(res.updatedSets[1].manualWeight).toBe(true);
    expect(res.updatedSets[2].weight).toBe(62.5); // adjusted
  });

  it('does not exceed 10% bounds from starting weight', () => {
    // Starting weight 60, 10% is 6kg.
    // If set weight was already 65 (delta +5kg), an attempt to add another 2.5kg would reach 67.5kg (>66kg), so it stops.
    const ex = createMockExercise({
      targetWeight: 60,
      sets: [
        { id: '1', setNumber: 1, weight: 65, reps: 12, completed: false },
        { id: '2', setNumber: 2, weight: 65, reps: 12, completed: false }
      ]
    });

    const res = calculateInSessionSetAdjustment(ex, 0, 6, 12);
    // Should not allow jump to 67.5 (> 66)
    expect(res.deltaWeight).toBe(0);
    expect(res.updatedSets[1].weight).toBe(65);
  });
});

describe('set count recommendations', () => {
  it('recommends N-1 sets after early failure (RPE 10 or reps below min)', () => {
    const ex = createMockExercise({
      targetSets: 3,
      minReps: 8,
      sets: [
        { id: '1', setNumber: 1, weight: 60, reps: 6, completed: true },
        { id: '2', setNumber: 2, weight: 60, reps: 8, completed: false },
        { id: '3', setNumber: 3, weight: 60, reps: 8, completed: false }
      ]
    });

    const rec = getSetCountRecommendation(ex, 0, 10, 6);
    expect(rec).not.toBeNull();
    expect(rec?.type).toBe('remove');
    expect(rec?.message).toContain('2 подхода');
  });

  it('recommends adding a set on last scheduled set if RPE <= 7 and reps >= maxReps', () => {
    const ex = createMockExercise({
      targetSets: 3,
      maxReps: 12,
      sets: [
        { id: '1', setNumber: 1, weight: 60, reps: 12, completed: true },
        { id: '2', setNumber: 2, weight: 60, reps: 12, completed: true },
        { id: '3', setNumber: 3, weight: 60, reps: 12, completed: true }
      ]
    });

    const rec = getSetCountRecommendation(ex, 2, 7, 12);
    expect(rec).not.toBeNull();
    expect(rec?.type).toBe('add');
    expect(rec?.message).toBe('Можно добавить подход');
  });
});
