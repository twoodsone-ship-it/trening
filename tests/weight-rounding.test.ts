import { expect, it } from 'vitest';
import { evaluateDoubleProgression } from '../src/services/progressionEngine';
import { roundWeight } from '../src/utils/roundWeight';
import type { ExerciseSession } from '../src/types';

it('uses regular loadable steps after consolidation and describes micro plates accurately', () => {
  const sets = (reps: number) => [1, 2, 3].map(setNumber => ({ setNumber, weight: 60, reps }));
  const session = (reps: number, decision?: ExerciseSession['decision']): ExerciseSession => ({
    id: 's', workoutId: 'w', date: '2026-11-06T12:00:00.000Z', targetSets: 3, minReps: 8, maxReps: 12,
    weight: 60, sets: sets(reps), decision, totalVolume: 0, estimated1RM: 0
  });
  const now = new Date('2026-11-07T12:00:00.000Z');
  for (const step of [1.25, 2.5]) {
    const next = evaluateDoubleProgression(3, 8, 12, step, 60, [session(12, 'CONSOLIDATE_WEIGHT')], 'optimal', now);
    expect(next.nextWeight).toBe(60 + step);
    expect(next.nextWeight * 4).toBe(Math.round(next.nextWeight * 4));
    const plateau = evaluateDoubleProgression(3, 8, 12, step, 60, [session(10), session(10), session(10)], 'optimal', now);
    expect(plateau.suggestedAction).toContain('если есть микродиски');
  }
  expect(roundWeight(61.3)).toBe(61.25);
  expect(roundWeight(62.6)).toBe(62.5);
});
