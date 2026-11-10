import type { WorkoutSet } from '../types';
import { getTrialFixedBarbellWeight } from '../data/exerciseCatalog';

interface TrialExercise {
  equipment?: string;
  category?: string;
  trackingMode?: 'reps' | 'duration' | 'distance';
  targetWeight: number;
  weightStep: number;
  minReps: number;
  defaultDurationSeconds?: number;
}

export function shouldCreateTrialSet(exercise: {
  equipment?: string;
  category?: string;
  trackingMode?: string;
}): boolean {
  if (exercise.equipment === 'bodyweight') return false;
  if (exercise.category === 'Cardio' || exercise.category?.toLowerCase() === 'cardio') return false;
  if (exercise.trackingMode && exercise.trackingMode !== 'reps') return false;
  return true;
}

export function createTrialSet(exercise: TrialExercise, id: string): WorkoutSet {
  const step = exercise.weightStep > 0 ? exercise.weightStep : 0;
  let weight = 0;
  if (exercise.equipment === 'fixed-barbell') {
    weight = getTrialFixedBarbellWeight(exercise.targetWeight);
  } else {
    const trialWeight = exercise.targetWeight > 0 && step > 0
      ? Math.min(exercise.targetWeight * 0.5, exercise.equipment === 'barbell' ? 20 : Infinity)
      : 0;
    weight = step > 0 ? Math.max(0, Math.round(trialWeight / step) * step) : 0;
  }
  const isTimed = exercise.trackingMode === 'duration';

  return {
    id,
    setNumber: 0,
    weight,
    reps: isTimed ? 0 : Math.min(8, Math.max(5, exercise.minReps)),
    durationSeconds: isTimed ? Math.min(60, Math.max(15, Math.round((exercise.defaultDurationSeconds || 60) / 2))) : undefined,
    rpe: undefined,
    completed: false,
    type: 'warmup',
    isWarmup: true
  };
}
