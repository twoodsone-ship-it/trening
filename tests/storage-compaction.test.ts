import { beforeEach, describe, expect, it } from 'vitest';
import { storageService, deriveExerciseHistoryFromCompletedWorkouts } from '../src/services/storageService';
import { evaluateDoubleProgression } from '../src/services/progressionEngine';
import type { CompletedWorkout, WorkoutTemplate, ExerciseSession } from '../src/types';

class MemoryStorage implements Storage {
  private values = new Map<string, string>();
  get length() { return this.values.size; }
  clear() { this.values.clear(); }
  getItem(key: string) { return this.values.get(key) ?? null; }
  key(index: number) { return [...this.values.keys()][index] ?? null; }
  removeItem(key: string) { this.values.delete(key); }
  setItem(key: string, value: string) { this.values.set(key, String(value)); }
}

beforeEach(() => {
  Object.defineProperty(globalThis, 'localStorage', {
    value: new MemoryStorage(),
    configurable: true
  });
});

describe('G1: deriveExerciseHistoryFromCompletedWorkouts', () => {
  it('derives full exercise history from ironforge_history_v1 even beyond template keep window', () => {
    const workouts: CompletedWorkout[] = Array.from({ length: 45 }, (_, i) => ({
      id: `w-${i + 1}`,
      templateId: 't-main',
      templateName: 'Main',
      startTime: 1000 + i * 86400000,
      endTime: 1000 + i * 86400000 + 3600000,
      durationMinutes: 60,
      totalVolumeKg: 1000 + i * 10,
      totalSets: 3,
      exercises: [
        {
          exerciseId: 'squat',
          name: 'Приседания',
          category: 'Legs',
          targetSets: 3,
          minReps: 8,
          maxReps: 12,
          workingWeight: 100 + i,
          sets: [
            { setNumber: 1, weight: 100 + i, reps: 10, completed: true, type: 'working' },
            { setNumber: 2, weight: 100 + i, reps: 10, completed: true, type: 'working' },
            { setNumber: 3, weight: 100 + i, reps: 10, completed: true, type: 'working' }
          ],
          progression: {
            decision: 'INCREASE_REPS',
            nextWeight: 100 + i,
            targetRepRange: '8-12',
            badgeText: 'В плане',
            badgeColor: 'blue',
            analysis: '',
            suggestedAction: '',
            consecutivePlateauCount: 0
          }
        }
      ]
    }));

    // In template, only 5 sessions exist
    const templateSessions: ExerciseSession[] = workouts.slice(-5).map(w => ({
      id: `h-${w.id}`,
      workoutId: w.id,
      date: new Date(w.endTime).toISOString(),
      targetSets: 3,
      minReps: 8,
      maxReps: 12,
      weight: w.exercises[0].workingWeight,
      sets: w.exercises[0].sets,
      totalVolume: w.totalVolumeKg,
      estimated1RM: 130,
      progressionNote: 'В плане'
    }));

    // Plus one legacy session that has no matching workout in history
    const legacySession: ExerciseSession = {
      id: 'legacy-1',
      workoutId: 'w-legacy-orphan',
      date: new Date(500).toISOString(),
      targetSets: 3,
      minReps: 8,
      maxReps: 12,
      weight: 90,
      sets: [{ setNumber: 1, weight: 90, reps: 10, completed: true }],
      totalVolume: 900,
      estimated1RM: 120,
      progressionNote: 'Legacy'
    };

    const derived = deriveExerciseHistoryFromCompletedWorkouts('squat', workouts, [legacySession, ...templateSessions]);

    // 45 from history + 1 legacy orphan = 46 total
    expect(derived).toHaveLength(46);
    expect(derived[0].id).toBe('legacy-1');
    expect(derived[derived.length - 1].weight).toBe(144);
  });
});
