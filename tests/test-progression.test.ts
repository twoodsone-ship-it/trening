import assert from 'assert';
import { test } from 'vitest';
import { calculate1RM, calculateVolume, evaluateDoubleProgression } from '../src/services/progressionEngine.ts';
import type { ExerciseSession } from '../src/types/index.ts';

test('legacy progression assertions', () => {
console.log('--- Running Smart Double Progression Unit Tests ---');

// 1. Test 1RM Calculations (Epley & Brzycki)
{
  const oneRM1 = calculate1RM(100, 1);
  assert.strictEqual(oneRM1, 100, '1 rep max of 100x1 should be 100');

  const oneRM10 = calculate1RM(100, 10);
  assert.strictEqual(oneRM10, 133.3, '1 rep max of 100x10 should be ~133.3');
  console.log('✔ Test 1: 1RM calculation verified');
}

// 2. Test First Session
{
  const rec = evaluateDoubleProgression(3, 8, 12, 2.5, 80, []);
  assert.strictEqual(rec.decision, 'FIRST_SESSION');
  assert.strictEqual(rec.nextWeight, 80);
  console.log('✔ Test 2: First session initial state verified');
}

// 3. Test Hit Max Reps on All Sets with Low RPE -> INCREASE_WEIGHT
{
  const history: ExerciseSession[] = [
    {
      id: 'h1',
      workoutId: 'w1',
      date: '2026-11-06T10:00:00.000Z',
      targetSets: 3,
      minReps: 8,
      maxReps: 12,
      weight: 80,
      sets: [
        { setNumber: 1, weight: 80, reps: 12, rpe: 8 },
        { setNumber: 2, weight: 80, reps: 12, rpe: 8 },
        { setNumber: 3, weight: 80, reps: 12, rpe: 8.5 }
      ],
      totalVolume: 2880,
      estimated1RM: 106.7
    }
  ];

  const rec = evaluateDoubleProgression(3, 8, 12, 2.5, 80, history, 'optimal', new Date('2026-11-07T12:00:00.000Z'));
  assert.strictEqual(rec.decision, 'INCREASE_WEIGHT', 'Should trigger INCREASE_WEIGHT');
  assert.strictEqual(rec.nextWeight, 82.5, 'Next weight should be 80 + 2.5 = 82.5');
  assert.strictEqual(rec.badgeColor, 'emerald');
  console.log('✔ Test 3: Standard progression (+weight) verified');
}

// 4. Test Hit Max Reps but Max RPE 10 (Grind/Form failure) -> CONSOLIDATE_WEIGHT
{
  const history: ExerciseSession[] = [
    {
      id: 'h2',
      workoutId: 'w2',
      date: '2026-11-06T10:00:00.000Z',
      targetSets: 3,
      minReps: 8,
      maxReps: 12,
      weight: 80,
      sets: [
        { setNumber: 1, weight: 80, reps: 12, rpe: 8.5 },
        { setNumber: 2, weight: 80, reps: 12, rpe: 9.5 },
        { setNumber: 3, weight: 80, reps: 12, rpe: 10 }
      ],
      totalVolume: 2880,
      estimated1RM: 106.7
    }
  ];

  const rec = evaluateDoubleProgression(3, 8, 12, 2.5, 80, history, 'optimal', new Date('2026-11-07T12:00:00.000Z'));
  assert.strictEqual(rec.decision, 'CONSOLIDATE_WEIGHT', 'Should trigger CONSOLIDATE_WEIGHT on RPE 10');
  assert.strictEqual(rec.nextWeight, 80, 'Weight should remain 80 kg for consolidation');
  assert.strictEqual(rec.badgeColor, 'purple');
  console.log('✔ Test 4: RPE 10 consolidation rule verified');
}

// 5. Test Partial Reps (In-between progression) -> INCREASE_REPS
{
  const history: ExerciseSession[] = [
    {
      id: 'h3',
      workoutId: 'w3',
      date: '2026-11-06T10:00:00.000Z',
      targetSets: 3,
      minReps: 8,
      maxReps: 12,
      weight: 80,
      sets: [
        { setNumber: 1, weight: 80, reps: 11, rpe: 8 },
        { setNumber: 2, weight: 80, reps: 10, rpe: 8.5 },
        { setNumber: 3, weight: 80, reps: 9, rpe: 9 }
      ],
      totalVolume: 2400,
      estimated1RM: 104
    }
  ];

  const rec = evaluateDoubleProgression(3, 8, 12, 2.5, 80, history, 'optimal', new Date('2026-11-07T12:00:00.000Z'));
  assert.strictEqual(rec.decision, 'INCREASE_REPS');
  assert.strictEqual(rec.nextWeight, 80);
  console.log('✔ Test 5: Rep increase progression rule verified');
}

// 6. Test 3-Session Stagnation -> PLATEAU_WARNING
{
  const makeSession = (date: string, reps: number[]): ExerciseSession => ({
    id: 's-' + date,
    workoutId: 'w-' + date,
    date,
    targetSets: 3,
    minReps: 8,
    maxReps: 12,
    weight: 80,
    sets: [
      { setNumber: 1, weight: 80, reps: reps[0], rpe: 9 },
      { setNumber: 2, weight: 80, reps: reps[1], rpe: 9 },
      { setNumber: 3, weight: 80, reps: reps[2], rpe: 9.5 }
    ],
    totalVolume: 80 * (reps[0] + reps[1] + reps[2]),
    estimated1RM: 105
  });

  const history: ExerciseSession[] = [
    makeSession('2026-11-01', [10, 9, 8]),
    makeSession('2026-11-04', [10, 9, 8]),
    makeSession('2026-11-06', [10, 9, 8])
  ];

  const rec = evaluateDoubleProgression(3, 8, 12, 2.5, 80, history, 'optimal', new Date('2026-11-07T12:00:00.000Z'));
  assert.strictEqual(rec.decision, 'PLATEAU_WARNING', '3 stalled sessions should trigger plateau alert');
  assert.strictEqual(rec.badgeColor, 'amber');
  console.log('✔ Test 6: 3-session plateau detection verified');
}

// 7. Test 1RM Edge-Case Fix: High Reps & Division-by-Zero Guard (r >= 37)
{
  const oneRM20 = calculate1RM(60, 20); // 60 * (1 + 20/30) = 100
  assert.strictEqual(oneRM20, 100, '1 rep max for 60x20 should use Epley: 100');

  const oneRM37 = calculate1RM(60, 37); // Brzycki would divide by 0! Epley: 60 * (1 + 37/30) = 134
  assert.strictEqual(Number.isFinite(oneRM37), true, '37 reps must be finite');
  assert.strictEqual(oneRM37, 134, '1 rep max for 60x37 should be exactly 134 without division-by-zero');

  const oneRM50 = calculate1RM(50, 50);
  assert.strictEqual(Number.isFinite(oneRM50), true, '50 reps must be finite');
  assert.strictEqual(Number.isNaN(oneRM50), false, '50 reps must not be NaN');
  console.log('✔ Test 7: 1RM high-reps & Brzycki division-by-zero guard verified');
}

// 8. Test Warmup Isolation (Ignored in Double Progression and Volume)
{
  const setsWithWarmup = [
    { weight: 40, reps: 15, isWarmup: true, type: 'warmup' as const },
    { weight: 60, reps: 10, type: 'warmup' as const },
    { weight: 80, reps: 10, type: 'working' as const },
    { weight: 80, reps: 10, type: 'working' as const }
  ];

  const vol = calculateVolume(setsWithWarmup);
  assert.strictEqual(vol, 1600, 'Volume must only count working sets (80*10 + 80*10 = 1600)');

  // History with 1 warmup set and 3 max working sets
  const history: ExerciseSession[] = [
    {
      id: 'hw1',
      workoutId: 'w1',
      date: '2026-11-06T10:00:00.000Z',
      targetSets: 3,
      minReps: 8,
      maxReps: 12,
      weight: 80,
      sets: [
        { setNumber: 0, weight: 40, reps: 15, isWarmup: true, type: 'warmup' }, // Warmup with 15 reps
        { setNumber: 1, weight: 80, reps: 12, rpe: 8, type: 'working' },
        { setNumber: 2, weight: 80, reps: 12, rpe: 8, type: 'working' },
        { setNumber: 3, weight: 80, reps: 12, rpe: 8, type: 'working' }
      ],
      totalVolume: 3480,
      estimated1RM: 112
    }
  ];

  const rec = evaluateDoubleProgression(3, 8, 12, 2.5, 80, history, 'optimal', new Date('2026-11-07T12:00:00.000Z'));
  assert.strictEqual(rec.decision, 'INCREASE_WEIGHT', 'Should trigger weight increase based on working sets only');
  assert.strictEqual(rec.nextWeight, 82.5);
  console.log('✔ Test 8: Warmup set isolation from progression verified');
}

// 9. Test Auto-Regulation (Fatigue / Sleep Deprivation)
{
  const makeSession = (date: string, reps: number[]): ExerciseSession => ({
    id: 's-' + date,
    workoutId: 'w-' + date,
    date,
    targetSets: 3,
    minReps: 8,
    maxReps: 12,
    weight: 80,
    sets: [
      { setNumber: 1, weight: 80, reps: reps[0], rpe: 9 },
      { setNumber: 2, weight: 80, reps: reps[1], rpe: 9 },
      { setNumber: 3, weight: 80, reps: reps[2], rpe: 9.5 }
    ],
    totalVolume: 80 * (reps[0] + reps[1] + reps[2]),
    estimated1RM: 105
  });

  const history: ExerciseSession[] = [
    makeSession('2026-11-01', [10, 9, 8]),
    makeSession('2026-11-04', [10, 9, 8]),
    makeSession('2026-11-06', [10, 9, 8])
  ];

  // In optimal state, this triggers plateau warning
  const recOptimal = evaluateDoubleProgression(3, 8, 12, 2.5, 80, history, 'optimal', new Date('2026-11-07T12:00:00.000Z'));
  assert.strictEqual(recOptimal.decision, 'PLATEAU_WARNING');

  // In tired/sleep_deprived state, plateau warning MUST BE FROZEN
  const recTired = evaluateDoubleProgression(3, 8, 12, 2.5, 80, history, 'tired', new Date('2026-11-07T12:00:00.000Z'));
  assert.notStrictEqual(recTired.decision, 'PLATEAU_WARNING', 'Plateau warning must be frozen when tired');
  assert.strictEqual(recTired.decision, 'INCREASE_REPS');

  // Auto-regulation RPE threshold: max reps with RPE 9.0 triggers consolidation when fatigued
  const maxRepHistory: ExerciseSession[] = [
    {
      id: 'hm1',
      workoutId: 'w1',
      date: '2026-11-06T10:00:00.000Z',
      targetSets: 3,
      minReps: 8,
      maxReps: 12,
      weight: 80,
      sets: [
        { setNumber: 1, weight: 80, reps: 12, rpe: 9, type: 'working' },
        { setNumber: 2, weight: 80, reps: 12, rpe: 9, type: 'working' },
        { setNumber: 3, weight: 80, reps: 12, rpe: 9, type: 'working' }
      ],
      totalVolume: 2880,
      estimated1RM: 112
    }
  ];

  // In optimal state, RPE 9 allows INCREASE_WEIGHT (threshold is 9.5)
  const recOptMax = evaluateDoubleProgression(3, 8, 12, 2.5, 80, maxRepHistory, 'optimal', new Date('2026-11-07T12:00:00.000Z'));
  assert.strictEqual(recOptMax.decision, 'INCREASE_WEIGHT');

  // In tired state, threshold is reduced by 0.5 (to 9.0), so RPE 9 triggers CONSOLIDATE_WEIGHT
  const recTiredMax = evaluateDoubleProgression(3, 8, 12, 2.5, 80, maxRepHistory, 'tired', new Date('2026-11-07T12:00:00.000Z'));
  assert.strictEqual(recTiredMax.decision, 'CONSOLIDATE_WEIGHT', 'RPE 9 on tired state must trigger weight consolidation');
  console.log('✔ Test 9: Auto-regulation readiness fatigue & RPE threshold lowering verified');
}

console.log('ALL 9 ALGORITHMIC TESTS PASSED PERFECTLY!');
});
