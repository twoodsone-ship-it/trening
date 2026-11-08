export interface SetLike {
  completed?: boolean;
  type?: string;
  isWarmup?: boolean;
  reps?: number;
  durationSeconds?: number;
  distanceMeters?: number;
}

export interface ExerciseOrSessionLike {
  sets?: SetLike[];
  trackingMode?: 'reps' | 'duration' | 'distance';
  totalVolume?: number;
  totalDurationSeconds?: number;
}

/**
 * Checks if a set is a valid completed working set:
 * - Must be completed (completed !== false)
 * - Must NOT be a warmup set (type !== 'warmup' && !isWarmup)
 * - If trackingMode === 'duration': durationSeconds > 0
 * - If trackingMode === 'distance': distanceMeters > 0
 * - If trackingMode === 'reps': reps > 0
 * - Otherwise: reps > 0, OR durationSeconds > 0, OR distanceMeters > 0
 */
export function isValidCompletedSet(
  set: SetLike,
  trackingMode?: 'reps' | 'duration' | 'distance'
): boolean {
  if (set.completed === false) return false;
  if (set.type === 'warmup' || Boolean(set.isWarmup)) return false;

  const reps = typeof set.reps === 'number' && Number.isFinite(set.reps) ? set.reps : 0;
  const duration = typeof set.durationSeconds === 'number' && Number.isFinite(set.durationSeconds) ? set.durationSeconds : 0;
  const distance = typeof set.distanceMeters === 'number' && Number.isFinite(set.distanceMeters) ? set.distanceMeters : 0;

  if (trackingMode === 'duration') {
    return duration > 0;
  }
  if (trackingMode === 'distance') {
    return distance > 0;
  }
  if (trackingMode === 'reps') {
    return reps > 0;
  }

  return reps > 0 || duration > 0 || distance > 0;
}

/**
 * Checks whether an exercise has at least one valid completed set.
 */
export function hasValidCompletedSet(exercise: ExerciseOrSessionLike): boolean {
  if (!exercise || !Array.isArray(exercise.sets) || exercise.sets.length === 0) {
    return false;
  }
  return exercise.sets.some(s => isValidCompletedSet(s, exercise.trackingMode));
}

/**
 * Checks whether an exercise session in template or history is valid.
 * Used as a safety net for both live and legacy history records:
 * - Has at least one valid completed set, OR
 * - Legacy fallback: totalVolume > 0 OR totalDurationSeconds > 0
 */
export function isValidExerciseSession(session: ExerciseOrSessionLike): boolean {
  if (!session) return false;
  if (Array.isArray(session.sets) && session.sets.length > 0) {
    return session.sets.some(s => isValidCompletedSet(s, session.trackingMode));
  }
  if (typeof session.totalVolume === 'number' && session.totalVolume > 0) return true;
  if (typeof session.totalDurationSeconds === 'number' && session.totalDurationSeconds > 0) return true;
  return false;
}

/**
 * Checks if any exercise in an array has at least one valid completed set.
 */
export function hasAnyValidCompletedSets(exercises: ExerciseOrSessionLike[]): boolean {
  if (!Array.isArray(exercises) || exercises.length === 0) return false;
  return exercises.some(ex => hasValidCompletedSet(ex));
}
