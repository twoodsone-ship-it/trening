import { describe, expect, it } from 'vitest';
import { evaluateDoubleProgression } from '../src/services/progressionEngine';
import type { ExerciseSession } from '../src/types';

function session(sets: ExerciseSession['sets'], date: string = '2026-11-06T12:00:00.000Z', decision?: ExerciseSession['decision']): ExerciseSession {
  return { id: 's', workoutId: 'w', date, targetSets: 3, minReps: 8, maxReps: 12, weight: 82.5, sets, decision, totalVolume: 0, estimated1RM: 0 };
}
const setsAt = (weight: number, reps: number, rpe?: number): ExerciseSession['sets'] => [1, 2, 3].map(setNumber => ({ setNumber, weight, reps, rpe }));

describe('progression regressions', () => {
  const now = new Date('2026-11-07T12:00:00.000Z');
  it('uses the actual 70 kg working weight instead of suggesting 85 kg from an 82.5 kg target', () => {
    const result = evaluateDoubleProgression(3, 8, 12, 2.5, 82.5, [session(setsAt(70, 12, 8))], 'optimal', now);
    expect(result.decision).not.toBe('INCREASE_WEIGHT');
    expect(result.nextWeight).toBe(70);
  });
  it('does not count dropsets or back-off sets as progression sets', () => {
    const result = evaluateDoubleProgression(3, 8, 12, 2.5, 80, [session([
      ...setsAt(80, 12, 8), { setNumber: 4, weight: 60, reps: 20, type: 'dropset' }
    ])], 'optimal', now);
    expect(result.decision).toBe('INCREASE_WEIGHT');
    const backoff = evaluateDoubleProgression(3, 8, 12, 2.5, 80, [session([
      { setNumber: 1, weight: 80, reps: 10 }, { setNumber: 2, weight: 70, reps: 12 }, { setNumber: 3, weight: 70, reps: 12 }
    ])], 'optimal', now);
    expect(backoff.decision).not.toBe('INCREASE_WEIGHT');
  });
  it('uses the minimum weight step for light exercise deloads', () => {
    const base = session(setsAt(10, 8, 9.5));
    const result = evaluateDoubleProgression(3, 8, 12, 2, 10, [base, { ...base, id: 's2' }, { ...base, id: 's3' }], 'optimal', now);
    expect(result.decision).toBe('PLATEAU_WARNING');
    expect(result.suggestedAction).toContain('Делоад: 10 кг');
  });
  it('escalates after a previously applied consolidation decision', () => {
    const result = evaluateDoubleProgression(3, 8, 12, 2.5, 80, [session(setsAt(80, 12, 10), undefined, 'CONSOLIDATE_WEIGHT')], 'optimal', now);
    expect(result.decision).toBe('INCREASE_WEIGHT');
    expect(result.nextWeight).toBe(82.5);
  });
  it('shows the actual doubled increase in the badge and analysis', () => {
    const result = evaluateDoubleProgression(3, 8, 12, 2.5, 60, [{ ...session(setsAt(60, 14)), weight: 60 }], 'optimal', now);
    expect(result.nextWeight).toBe(65);
    expect(result.badgeText).toContain('+5 кг');
    expect(result.analysis).toMatch(/удвоен|двойн/i);
  });
  it('names the actual working load when consolidating', () => {
    const result = evaluateDoubleProgression(3, 8, 12, 2.5, 77.5, [{ ...session(setsAt(80, 12, 10)), weight: 80 }], 'optimal', now);
    expect(result.decision).toBe('CONSOLIDATE_WEIGHT');
    expect(result.suggestedAction).toContain('80 кг');
  });
  it('treats missing RPE as unknown instead of as a grind', () => {
    const result = evaluateDoubleProgression(3, 8, 12, 2.5, 80, [session(setsAt(80, 12))], 'optimal', now);
    expect(result.decision).toBe('INCREASE_WEIGHT');
  });
  it('returns at the last weight after 21 days and reduces it after 42 days', () => {
    const old = session(setsAt(80, 12, 8), '2026-09-08T12:00:00.000Z');
    const result = evaluateDoubleProgression(3, 8, 12, 2.5, 82.5, [old], 'optimal', now);
    expect(result.decision).not.toBe('INCREASE_WEIGHT');
    expect(result.nextWeight).toBe(72.5);
  });
  it('keeps FIRST_SESSION unchanged', () => {
    expect(evaluateDoubleProgression(3, 8, 12, 2.5, 80, [], 'optimal', now).decision).toBe('FIRST_SESSION');
  });
});
