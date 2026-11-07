import type { WorkoutSet } from '../types';

interface TrialExercise {
  equipment?: string;
  trackingMode?: 'reps' | 'duration' | 'distance';
  targetWeight: number;
  weightStep: number;
  minReps: number;
  defaultDurationSeconds?: number;
}

export function createTrialSet(exercise: TrialExercise, id: string): WorkoutSet {
  const step = exercise.weightStep > 0 ? exercise.weightStep : 0;
  const trialWeight = exercise.targetWeight > 0 && step > 0
    ? Math.min(exercise.targetWeight * 0.5, exercise.equipment === 'barbell' ? 20 : Infinity)
    : 0;
  const isTimed = exercise.trackingMode === 'duration';

  return {
    id,
    setNumber: 0,
    weight: step > 0 ? Math.max(0, Math.round(trialWeight / step) * step) : 0,
    reps: isTimed ? 0 : Math.min(8, Math.max(5, exercise.minReps)),
    durationSeconds: isTimed ? Math.min(60, Math.max(15, Math.round((exercise.defaultDurationSeconds || 60) / 2))) : undefined,
    rpe: undefined,
    completed: false,
    type: 'warmup',
    isWarmup: true
  };
}
