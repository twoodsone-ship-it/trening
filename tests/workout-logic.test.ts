import { describe, expect, it } from 'vitest';
import { calculate1RM, evaluateDoubleProgression } from '../src/services/progressionEngine';
import { calculateBodyweightVolume, calculatePlates, committedInputValue, remainingRestSeconds, sanitizeNumber, shiftRestDeadline } from '../src/utils/workoutMath';
import { pluralize } from '../src/utils/pluralize';
import type { ExerciseSession, SetHistoryEntry } from '../src/types';

const now = new Date('2026-11-07T12:00:00.000Z');
const set = (weight: number, reps: number, extra: Partial<SetHistoryEntry> = {}): SetHistoryEntry => ({ setNumber: 1, weight, reps, completed: true, ...extra });
const session = (sets: SetHistoryEntry[], id = 'one'): ExerciseSession => ({
  id, workoutId: id, date: '2026-11-06T12:00:00.000Z', targetSets: 3, minReps: 8, maxReps: 12,
  weight: 80, sets, totalVolume: 0, estimated1RM: 0
});
const recommend = (history: ExerciseSession[]) => evaluateDoubleProgression(3, 8, 12, 2.5, 80, history, 'optimal', now);

describe('Double Progression', () => {
  it('raises 80 to 82.5 kg after three sets of 12', () => {
    const result = recommend([session([set(80, 12), set(80, 12), set(80, 12)])]);
    expect(result.decision).toBe('INCREASE_WEIGHT');
    expect(result.nextWeight).toBe(82.5);
    expect(result.targetRepRange.startsWith('8')).toBe(true);
  });
  it('keeps 80 kg when one set reaches only 11', () => {
    expect(recommend([session([set(80, 12), set(80, 12), set(80, 11)])]).nextWeight).toBe(80);
  });
  it('ignores warmups and dropsets', () => {
    const result = recommend([session([
      set(40, 12, { type: 'warmup' }), set(60, 8, { isWarmup: true }),
      set(80, 12), set(80, 12), set(80, 12), set(60, 10, { type: 'dropset' })
    ])]);
    expect(result.nextWeight).toBe(82.5);
  });
  it('holds 80 kg at RIR 0 / RPE 10', () => {
    const result = recommend([session([set(80, 12), set(80, 12), set(80, 12, { rpe: 10 })])]);
    expect(result.decision).toBe('CONSOLIDATE_WEIGHT');
    expect(result.nextWeight).toBe(80);
  });
  it('raises by two steps after all sets exceed the range', () => {
    expect(recommend([session([set(80, 15), set(80, 15), set(80, 14)])]).nextWeight).toBe(85);
  });
  it('recommends a 5–10% deload after two below-minimum sessions', () => {
    const weak = [set(80, 6), set(80, 6), set(80, 5)];
    const result = recommend([session(weak), session(weak, 'two')]);
    expect(result.decision).toBe('DELOAD_RECOMMENDED');
    expect(result.nextWeight).toBeGreaterThanOrEqual(72);
    expect(result.nextWeight).toBeLessThanOrEqual(76);
  });
});

describe('Plate Calculator', () => {
  it('builds 100 kg with 25 and 15 kg per side', () => {
    const result = calculatePlates(100);
    expect(result.platesPerSide).toEqual([25, 15]);
    expect(result.exact).toBe(true);
  });
  it('returns an empty bar and warns for a target below bar weight', () => {
    expect(calculatePlates(20).platesPerSide).toEqual([]);
    expect(calculatePlates(15).error).toBeTruthy();
  });
  it('offers 60 and 62.5 kg for an unreachable 61 kg', () => {
    const result = calculatePlates(61);
    expect(result.exact).toBe(false);
    expect([result.lowerWeight, result.upperWeight]).toEqual([60, 62.5]);
  });
  it('respects a single pair of 25 kg plates', () => {
    expect(calculatePlates(140, 20, undefined, { 25: 1 }).platesPerSide).toEqual([25, 20, 15]);
  });
  it('builds 67.5 kg precisely without a float remainder', () => {
    const result = calculatePlates(67.5);
    expect(result.platesPerSide).toEqual([20, 2.5, 1.25]);
    expect(result.achievableWeight).toBe(67.5);
  });
});

describe('1RM & Tonnage', () => {
  it('returns exactly the lifted weight for one rep', () => expect(calculate1RM(100, 1)).toBe(100));
  it.each([37, 40])('keeps the estimate finite at %i reps', reps => {
    expect(calculate1RM(100, reps)).toBeGreaterThan(0);
    expect(Number.isFinite(calculate1RM(100, reps))).toBe(true);
  });
  it.each([[0, 5], [100, 0], [null, 8], [undefined, 8], ['', 8], [100, null], [100, undefined], [100, '']])('returns zero for invalid weight/reps %s × %s', (weight, reps) => {
    expect(calculate1RM(weight as number, reps as number)).toBe(0);
  });
  it('counts bodyweight plus 15 kg', () => expect(calculateBodyweightVolume(84, 15, 8)).toBe(792));
  it('subtracts Gravitron assistance and clamps excess assistance', () => {
    expect(calculateBodyweightVolume(84, -20, 10)).toBe(640);
    expect(calculateBodyweightVolume(84, -90, 10)).toBe(0);
  });
});

describe('Rest Timer', () => {
  it('reconciles after 50 seconds of sleep using the deadline', () => {
    expect(remainingRestSeconds(100000 + 90000, 150000)).toBe(40);
  });
  it('adds 15 seconds to the deadline', () => {
    expect(shiftRestDeadline(190000, 15, 150000)).toBe(205000);
  });
  it('clamps a -15 second adjustment when only 10 remain', () => {
    const end = shiftRestDeadline(160000, -15, 150000);
    expect(remainingRestSeconds(end, 150000)).toBe(0);
  });
});

describe('Input Sanitizer', () => {
  it.each([['22,5', 22.5], ['22.5', 22.5], ['.5', 0.5], ['22.5.5', 22.5]])('parses %s as %s', (input, expected) => {
    expect(sanitizeNumber(input, 1000)).toBe(expected);
  });
  it('clamps implausible weight and rep inputs', () => {
    expect(sanitizeNumber('99999', 1000)).toBe(1000);
    expect(sanitizeNumber('999', 300)).toBe(300);
  });
  it('commits the placeholder when the input is blank', () => {
    expect(committedInputValue('', '80', 1000)).toBe(80);
  });
});

describe('Pluralize helper', () => {
  it('inflects Russian nouns for 1, 2, 5, 11, 21, 22', () => {
    const forms: [string, string, string] = ['подход', 'подхода', 'подходов'];
    expect(pluralize(1, forms)).toBe('подход');
    expect(pluralize(2, forms)).toBe('подхода');
    expect(pluralize(5, forms)).toBe('подходов');
    expect(pluralize(11, forms)).toBe('подходов');
    expect(pluralize(21, forms)).toBe('подход');
    expect(pluralize(22, forms)).toBe('подхода');
  });
});
