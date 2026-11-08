import type { ActiveWorkout } from '../types';
import { storageService } from '../services/storageService';
import { restTimerStorage } from './restTimerStorage';

export interface ActiveWorkoutStorageLike {
  saveActiveWorkout: (workout: ActiveWorkout | null) => void;
  getActiveWorkout?: () => ActiveWorkout | null;
}

export interface RestTimerStorageLike {
  clearAll?: () => void;
  clearEndsAt?: () => void;
  clearPendingFocusResume?: () => void;
}

export function cancelActiveWorkoutSession(
  storage: ActiveWorkoutStorageLike = storageService,
  timer: RestTimerStorageLike = restTimerStorage
): void {
  storage.saveActiveWorkout(null);
  if (typeof timer.clearAll === 'function') {
    timer.clearAll();
  } else {
    timer.clearEndsAt?.();
    timer.clearPendingFocusResume?.();
  }
}

export function persistActiveWorkoutSession(
  workout: ActiveWorkout | null,
  storage: ActiveWorkoutStorageLike = storageService,
  timer: RestTimerStorageLike = restTimerStorage
): void {
  if (workout) {
    storage.saveActiveWorkout(workout);
  } else {
    cancelActiveWorkoutSession(storage, timer);
  }
}

export function resolveInitialWorkoutState(
  storage: Pick<typeof storageService, 'getActiveWorkout'> = storageService
): { activeWorkout: ActiveWorkout | null; isViewActiveWorkout: boolean } {
  const activeWorkout = storage.getActiveWorkout();
  return {
    activeWorkout,
    isViewActiveWorkout: activeWorkout !== null
  };
}
