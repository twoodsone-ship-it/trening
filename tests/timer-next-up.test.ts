import { describe, expect, it } from 'vitest';
import { getNextUpText, formatWeightComma } from '../src/utils/timerNextUp';
import type { ActiveExerciseSession } from '../src/types';

describe('timer next up calculations', () => {
  it('formats decimals with comma', () => {
    expect(formatWeightComma(62.5)).toBe('62,5');
    expect(formatWeightComma(20)).toBe('20');
  });

  it('shows next working set in current exercise', () => {
    const exercises: ActiveExerciseSession[] = [
      {
        exerciseId: 'bench-press',
        name: 'Жим лёжа',
        category: 'Chest',
        targetSets: 4,
        minReps: 8,
        maxReps: 12,
        weightStep: 2.5,
        targetWeight: 62.5,
        restSeconds: 90,
        sets: [
          { id: '1', setNumber: 1, weight: 62.5, reps: 10, completed: true },
          { id: '2', setNumber: 2, weight: 62.5, reps: 10, completed: true },
          { id: '3', setNumber: 3, weight: 62.5, reps: 10, completed: false },
          { id: '4', setNumber: 4, weight: 62.5, reps: 10, completed: false }
        ],
        recommendation: {} as any
      }
    ];

    const result = getNextUpText(exercises, 0, 1);
    expect(result).toBe('Дальше: подход 3 из 4 · 62,5 кг × 10');
  });

  it('shows next exercise and start weight when current exercise finishes', () => {
    const exercises: ActiveExerciseSession[] = [
      {
        exerciseId: 'bench-press',
        name: 'Жим лёжа',
        category: 'Chest',
        targetSets: 2,
        minReps: 8,
        maxReps: 12,
        weightStep: 2.5,
        targetWeight: 62.5,
        restSeconds: 90,
        sets: [
          { id: '1', setNumber: 1, weight: 62.5, reps: 10, completed: true },
          { id: '2', setNumber: 2, weight: 62.5, reps: 10, completed: true }
        ],
        recommendation: {} as any
      },
      {
        exerciseId: 'db-row',
        name: 'Тяга гантели',
        category: 'Back',
        targetSets: 3,
        minReps: 8,
        maxReps: 12,
        weightStep: 2.5,
        targetWeight: 30,
        restSeconds: 75,
        sets: [
          { id: '3', setNumber: 1, weight: 30, reps: 10, completed: false }
        ],
        recommendation: {} as any
      }
    ];

    const result = getNextUpText(exercises, 0, 1);
    expect(result).toBe('Дальше: Тяга гантели · 30 кг');
  });

  it('rotates to next exercise in superset cycle', () => {
    const gid = 'ss-1';
    const exercises: ActiveExerciseSession[] = [
      {
        exerciseId: 'bicep-curl',
        name: 'Подъём на бицепс',
        category: 'Arms',
        supersetGroupId: gid,
        targetSets: 3,
        minReps: 10,
        maxReps: 12,
        weightStep: 2.5,
        targetWeight: 15,
        restSeconds: 60,
        sets: [
          { id: '1', setNumber: 1, weight: 15, reps: 12, completed: true },
          { id: '2', setNumber: 2, weight: 15, reps: 12, completed: false }
        ],
        recommendation: {} as any
      },
      {
        exerciseId: 'tricep-pushdown',
        name: 'Разгибания на трицепс',
        category: 'Arms',
        supersetGroupId: gid,
        targetSets: 3,
        minReps: 10,
        maxReps: 15,
        weightStep: 4.5,
        targetWeight: 22.5,
        restSeconds: 60,
        sets: [
          { id: '3', setNumber: 1, weight: 22.5, reps: 12, completed: false },
          { id: '4', setNumber: 2, weight: 22.5, reps: 12, completed: false }
        ],
        recommendation: {} as any
      }
    ];

    // Finished set 1 on exercise 0 (bicep-curl) -> superset rotates to exercise 1 (tricep-pushdown)
    const result = getNextUpText(exercises, 0, 0);
    expect(result).toBe('Дальше: Разгибания на трицепс · подход 1 из 2 · 22,5 кг × 12');
  });

  it('announces final set when everything is done', () => {
    const exercises: ActiveExerciseSession[] = [
      {
        exerciseId: 'plank',
        name: 'Планка',
        category: 'Core',
        targetSets: 1,
        minReps: 0,
        maxReps: 0,
        weightStep: 0,
        targetWeight: 0,
        restSeconds: 60,
        sets: [
          { id: '1', setNumber: 1, weight: 0, reps: 0, durationSeconds: 60, completed: true }
        ],
        recommendation: {} as any
      }
    ];

    const result = getNextUpText(exercises, 0, 0);
    expect(result).toBe('Это был последний подход');
  });
});
