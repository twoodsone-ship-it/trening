import type { ActiveExerciseSession, WorkoutSet } from '../types';
import { getAdjacentFixedBarbellWeight } from '../data/exerciseCatalog';
import { roundWeight } from '../utils/roundWeight';
import { formatWeightComma } from '../utils/timerNextUp';

export interface InSessionAdjustResult {
  updatedSets: WorkoutSet[];
  deltaWeight: number;
  restDeltaSeconds: number;
  nextWeight?: number;
  toastMessage?: string;
}

export interface SetCountRecommendation {
  type: 'remove' | 'add';
  message: string;
  buttonLabel: string;
}

/**
 * Recalculate weights of remaining uncompleted working sets after an RPE confirmation.
 */
export function calculateInSessionSetAdjustment(
  exercise: ActiveExerciseSession,
  completedSetIndex: number,
  rpe: number,
  completedReps: number
): InSessionAdjustResult {
  const completedSet = exercise.sets[completedSetIndex];
  if (!completedSet || completedSet.type === 'warmup' || completedSet.isWarmup) {
    return { updatedSets: exercise.sets, deltaWeight: 0, restDeltaSeconds: 0 };
  }

  const { minReps, maxReps, weightStep, targetWeight, equipment } = exercise;
  const isFixedBarbell = equipment === 'fixed-barbell';
  const effectiveStep = weightStep > 0 ? weightStep : 2.5;

  let direction: 0 | 1 | -1 = 0;
  let restDeltaSeconds = 0;

  if (rpe <= 6 && completedReps >= minReps) {
    direction = 1;
  } else if ((rpe === 7 || rpe === 8) && completedReps >= minReps) {
    direction = 0;
  } else if (rpe === 9) {
    direction = 0;
    restDeltaSeconds = 30;
  } else if (rpe === 10 || completedReps < minReps) {
    direction = -1;
    restDeltaSeconds = 45; // 30-60s
  }

  if (direction === 0) {
    return {
      updatedSets: exercise.sets,
      deltaWeight: 0,
      restDeltaSeconds
    };
  }

  // Calculate target candidate weight for remaining uncompleted sets
  // Max ±10% from starting weight (with 1-step tolerance for small start weights)
  const maxAllowedDelta = Math.max(effectiveStep, targetWeight * 0.10);
  const minAllowedWeight = Math.max(0, targetWeight - maxAllowedDelta);
  const maxAllowedWeight = targetWeight + maxAllowedDelta;

  let candidateWeight = completedSet.weight;
  if (isFixedBarbell) {
    candidateWeight = getAdjacentFixedBarbellWeight(candidateWeight, direction);
  } else {
    candidateWeight = roundWeight(candidateWeight + direction * effectiveStep);
  }

  // Clamp within ±10% of starting weight
  if (candidateWeight < minAllowedWeight - 0.001) {
    candidateWeight = completedSet.weight;
  } else if (candidateWeight > maxAllowedWeight + 0.001) {
    candidateWeight = completedSet.weight;
  }

  const actualDelta = roundWeight(candidateWeight - completedSet.weight);
  if (Math.abs(actualDelta) < 0.001) {
    return {
      updatedSets: exercise.sets,
      deltaWeight: 0,
      restDeltaSeconds
    };
  }

  let firstAdjustedWeight: number | undefined;

  const updatedSets = exercise.sets.map((set, idx) => {
    // Only adjust future uncompleted working sets that were NOT manually edited by the user
    if (idx > completedSetIndex && !set.completed && set.type !== 'warmup' && !set.isWarmup) {
      if (set.manualWeight) {
        return set;
      }
      if (firstAdjustedWeight === undefined) {
        firstAdjustedWeight = candidateWeight;
      }
      return {
        ...set,
        weight: candidateWeight,
        autoAdjusted: true
      };
    }
    return set;
  });

  const deltaSign = actualDelta > 0 ? `+${formatWeightComma(actualDelta)}` : `−${formatWeightComma(Math.abs(actualDelta))}`;
  const toastMessage = firstAdjustedWeight !== undefined
    ? `Следующий: ${formatWeightComma(firstAdjustedWeight)} кг (${deltaSign})`
    : undefined;

  return {
    updatedSets,
    deltaWeight: actualDelta,
    restDeltaSeconds,
    nextWeight: firstAdjustedWeight,
    toastMessage
  };
}

/**
 * Recommendations for set count adjustments.
 */
export function getSetCountRecommendation(
  exercise: ActiveExerciseSession,
  completedSetIndex: number,
  rpe: number,
  completedReps: number
): SetCountRecommendation | null {
  const completedSet = exercise.sets[completedSetIndex];
  if (!completedSet || completedSet.type === 'warmup' || completedSet.isWarmup) {
    return null;
  }

  const workingSets = exercise.sets.filter(s => s.type !== 'warmup' && !s.isWarmup);
  const completedWorkingSets = workingSets.filter(s => s.completed || s.id === completedSet.id);
  const remainingWorkingSets = workingSets.filter(s => !s.completed && s.id !== completedSet.id);
  const totalWorkingCount = workingSets.length;

  // Rule 1: After 1–2 working sets with RPE 10 or reps below minReps -> Recommend N-1 sets
  if (completedWorkingSets.length >= 1 && completedWorkingSets.length <= 2) {
    if (rpe === 10 || completedReps < exercise.minReps) {
      if (remainingWorkingSets.length > 0 && totalWorkingCount > 1) {
        const targetSetsCount = totalWorkingCount - 1;
        return {
          type: 'remove',
          message: `Рекомендую ${targetSetsCount} подхода`,
          buttonLabel: `Убрать подход (${targetSetsCount})`
        };
      }
    }
  }

  // Rule 2: On last scheduled set with RPE <= 7 and reps >= maxReps -> Can add a set
  const isLastWorkingSet = remainingWorkingSets.length === 0;
  if (isLastWorkingSet && rpe <= 7 && completedReps >= exercise.maxReps) {
    return {
      type: 'add',
      message: 'Можно добавить подход',
      buttonLabel: '+1 подход'
    };
  }

  return null;
}

/**
 * Adjust subsequent unstarted exercises of the same category after all working sets of an exercise are finished.
 * If average RPE <= 6.5 -> +1 step.
 * If average RPE >= 9.5 -> -1 step.
 * Max ±1 step, once per exercise, skipping sets with manualWeight.
 */
export function adjustSubsequentCategoryExercises(
  exercises: ActiveExerciseSession[],
  completedExIdx: number
): { updatedExercises: ActiveExerciseSession[]; adjustedCount: number } {
  const completedEx = exercises[completedExIdx];
  if (!completedEx) {
    return { updatedExercises: exercises, adjustedCount: 0 };
  }

  const workingSets = completedEx.sets.filter(s => s.type !== 'warmup' && !s.isWarmup);
  if (workingSets.length === 0 || !workingSets.every(s => s.completed)) {
    return { updatedExercises: exercises, adjustedCount: 0 };
  }

  const rpes = workingSets
    .map(s => s.rpe)
    .filter((r): r is number => typeof r === 'number');

  if (rpes.length === 0) {
    return { updatedExercises: exercises, adjustedCount: 0 };
  }

  const avgRpe = rpes.reduce((a, b) => a + b, 0) / rpes.length;
  let direction: 0 | 1 | -1 = 0;

  if (avgRpe <= 6.5) {
    direction = 1;
  } else if (avgRpe >= 9.5) {
    direction = -1;
  }

  if (direction === 0) {
    return { updatedExercises: exercises, adjustedCount: 0 };
  }

  let adjustedCount = 0;
  const updatedExercises = exercises.map((ex, idx) => {
    // Only check exercises appearing after the completed one
    if (idx <= completedExIdx) return ex;

    // Same category, not yet started, and not already categoryAdjusted
    if (ex.category === completedEx.category && !ex.categoryAdjusted) {
      const hasStarted = ex.sets.some(s => s.completed);
      if (!hasStarted) {
        adjustedCount++;
        const isFixedBarbell = ex.equipment === 'fixed-barbell';
        const step = ex.weightStep > 0 ? ex.weightStep : 2.5;

        let newTargetWeight = ex.targetWeight;
        if (isFixedBarbell) {
          newTargetWeight = getAdjacentFixedBarbellWeight(ex.targetWeight, direction);
        } else {
          newTargetWeight = Math.max(0, roundWeight(ex.targetWeight + direction * step));
        }

        const newSets = ex.sets.map(s => {
          if (s.manualWeight) return s;
          let newWeight = s.weight;
          if (isFixedBarbell) {
            newWeight = getAdjacentFixedBarbellWeight(s.weight, direction);
          } else {
            newWeight = Math.max(0, roundWeight(s.weight + direction * step));
          }
          return {
            ...s,
            weight: newWeight,
            autoAdjusted: true
          };
        });

        return {
          ...ex,
          targetWeight: newTargetWeight,
          sets: newSets,
          categoryAdjusted: true
        };
      }
    }

    return ex;
  });

  return { updatedExercises, adjustedCount };
}
