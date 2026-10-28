import assert from 'assert';
import { calculate1RM, calculateVolume, evaluateDoubleProgression } from './src/services/progressionEngine.ts';

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
      date: '2026-10-20T10:00:00.000Z',
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

  const rec = evaluateDoubleProgression(3, 8, 12, 2.5, 80, history);
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
      date: '2026-10-20T10:00:00.000Z',
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

  const rec = evaluateDoubleProgression(3, 8, 12, 2.5, 80, history);
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
      date: '2026-10-20T10:00:00.000Z',
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

  const rec = evaluateDoubleProgression(3, 8, 12, 2.5, 80, history);
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
    makeSession('2026-10-01', [10, 9, 8]),
    makeSession('2026-10-08', [10, 9, 8]),
    makeSession('2026-10-15', [10, 9, 8])
  ];

  const rec = evaluateDoubleProgression(3, 8, 12, 2.5, 80, history);
  assert.strictEqual(rec.decision, 'PLATEAU_WARNING', '3 stalled sessions should trigger plateau alert');
  assert.strictEqual(rec.badgeColor, 'amber');
  console.log('✔ Test 6: 3-session plateau detection verified');
}

console.log('ALL 6 ALGORITHMIC TESTS PASSED PERFECTLY!');
