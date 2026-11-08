import { beforeEach, describe, expect, it } from 'vitest';
import { storageService } from '../src/services/storageService';
import { restTimerStorage } from '../src/utils/restTimerStorage';
import {
  cancelActiveWorkoutSession,
  persistActiveWorkoutSession,
  resolveInitialWorkoutState
} from '../src/utils/activeWorkoutSession';
import type { ActiveWorkout, CompletedWorkout } from '../src/types';

class MemoryStorage implements Storage {
  private store = new Map<string, string>();
  get length() { return this.store.size; }
  clear() { this.store.clear(); }
  getItem(key: string) { return this.store.has(key) ? this.store.get(key)! : null; }
  key(index: number) { return Array.from(this.store.keys())[index] ?? null; }
  removeItem(key: string) { this.store.delete(key); }
  setItem(key: string, value: string) { this.store.set(key, String(value)); }
}

const mockWorkout: ActiveWorkout = {
  templateId: 't1',
  templateName: 'День А',
  startTime: Date.now() - 600000,
  exercises: []
};

const mockCompleted: CompletedWorkout = {
  id: 'cw-1',
  templateId: 't1',
  templateName: 'День А',
  startTime: Date.now() - 600000,
  endTime: Date.now(),
  durationMinutes: 10,
  totalVolumeKg: 0,
  totalSets: 0,
  exercises: []
};

describe('K1: Active workout cancel and persistence cleanup', () => {
  beforeEach(() => {
    Object.defineProperty(globalThis, 'localStorage', {
      value: new MemoryStorage(),
      configurable: true,
      writable: true
    });
    Object.defineProperty(globalThis, 'sessionStorage', {
      value: new MemoryStorage(),
      configurable: true,
      writable: true
    });
  });

  it('cancelActiveWorkoutSession removes ironforge_active_session_v1 and rest timer keys (after cancel the key is gone)', () => {
    storageService.saveActiveWorkout(mockWorkout);
    restTimerStorage.setEndsAt(Date.now() + 60000);
    restTimerStorage.markPendingFocusResume();

    expect(storageService.getActiveWorkout()).not.toBeNull();
    expect(localStorage.getItem('ironforge_active_session_v1')).not.toBeNull();
    expect(restTimerStorage.getEndsAt()).not.toBeNull();
    expect(restTimerStorage.hasPendingFocusResume()).toBe(true);

    cancelActiveWorkoutSession();

    expect(storageService.getActiveWorkout()).toBeNull();
    expect(localStorage.getItem('ironforge_active_session_v1')).toBeNull();
    expect(restTimerStorage.getEndsAt()).toBeNull();
    expect(restTimerStorage.hasPendingFocusResume()).toBe(false);
  });

  it('finish still clears active workout and rest-timer / pending-focus keys', () => {
    storageService.saveActiveWorkout(mockWorkout);
    restTimerStorage.setEndsAt(Date.now() + 30000);
    restTimerStorage.markPendingFocusResume();

    // Simulating finish flow
    storageService.saveCompletedWorkout(mockCompleted);
    cancelActiveWorkoutSession();

    expect(storageService.getActiveWorkout()).toBeNull();
    expect(localStorage.getItem('ironforge_active_session_v1')).toBeNull();
    expect(restTimerStorage.getEndsAt()).toBeNull();
    expect(restTimerStorage.hasPendingFocusResume()).toBe(false);
  });

  it('reload with no session starts on Home', () => {
    // 1. Start workout
    storageService.saveActiveWorkout(mockWorkout);
    // 2. Cancel workout
    cancelActiveWorkoutSession();
    // 3. Reload simulation
    const state = resolveInitialWorkoutState();
    expect(state.activeWorkout).toBeNull();
    expect(state.isViewActiveWorkout).toBe(false);
  });

  it('does not change resume-after-reload for genuinely unfinished workouts', () => {
    // Workout was started and NOT cancelled/finished
    storageService.saveActiveWorkout(mockWorkout);
    restTimerStorage.setEndsAt(Date.now() + 45000);

    const state = resolveInitialWorkoutState();
    expect(state.activeWorkout?.templateName).toBe('День А');
    expect(state.isViewActiveWorkout).toBe(true);
    expect(restTimerStorage.getEndsAt()).not.toBeNull();
  });

  it('persistActiveWorkoutSession persists non-null session and clears all keys on null', () => {
    persistActiveWorkoutSession(mockWorkout);
    expect(storageService.getActiveWorkout()?.templateId).toBe('t1');

    restTimerStorage.setEndsAt(Date.now() + 30000);
    restTimerStorage.markPendingFocusResume();

    persistActiveWorkoutSession(null);
    expect(storageService.getActiveWorkout()).toBeNull();
    expect(localStorage.getItem('ironforge_active_session_v1')).toBeNull();
    expect(restTimerStorage.getEndsAt()).toBeNull();
    expect(restTimerStorage.hasPendingFocusResume()).toBe(false);
  });
});
