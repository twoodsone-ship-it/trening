import type { MuscleCategory } from '../types';
import { muscleCategoryLabel } from './uiLabels';

export interface MuscleBalanceWarning {
  category: MuscleCategory | string;
  categoryLabel: string;
  count: number;
  startIndex: number;
  endIndex: number;
  exerciseNames: string[];
  message: string;
}

export interface ExerciseItemForBalance {
  name: string;
  category: string;
  supersetGroupId?: string;
}

/**
 * Detects 3 or more consecutive exercises targeting the same muscle category outside of supersets.
 */
export function checkMuscleBalance(
  exercises: ExerciseItemForBalance[]
): MuscleBalanceWarning[] {
  if (!exercises || exercises.length < 3) return [];

  const warnings: MuscleBalanceWarning[] = [];
  let i = 0;

  while (i < exercises.length) {
    const current = exercises[i];
    const category = current.category;
    const run: ExerciseItemForBalance[] = [current];
    let j = i + 1;

    while (j < exercises.length) {
      const next = exercises[j];
      if (next.category !== category) break;
      run.push(next);
      j++;
    }

    const isSharedSuperset =
      run.length > 1 &&
      run.every(e => Boolean(e.supersetGroupId) && e.supersetGroupId === run[0].supersetGroupId);

    if (run.length >= 3 && !isSharedSuperset) {
      const label = muscleCategoryLabel(category as MuscleCategory);
      const names = run.map(e => e.name);
      warnings.push({
        category,
        categoryLabel: label,
        count: run.length,
        startIndex: i,
        endIndex: j - 1,
        exerciseNames: names,
        message: `Подряд ${run.length} упражнения на группу «${label}»: ${names.join(', ')}`
      });
    }

    i = j;
  }

  return warnings;
}
