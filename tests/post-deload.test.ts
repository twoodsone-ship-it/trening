import { afterEach, expect, it, vi } from 'vitest';
import { buildActiveExercises } from '../src/hooks/useWorkoutSession';
import { storageService } from '../src/services/storageService';
import { evaluateDoubleProgression } from '../src/services/progressionEngine';
import type { CompletedWorkout } from '../src/types';

class MemoryStorage implements Storage {
  private entries = new Map<string, string>();
  get length() { return this.entries.size; }
  clear() { this.entries.clear(); }
  getItem(key: string) { return this.entries.get(key) ?? null; }
  key(index: number) { return [...this.entries.keys()][index] ?? null; }
  removeItem(key: string) { this.entries.delete(key); }
  setItem(key: string, value: string) { this.entries.set(key, value); }
}

afterEach(() => vi.useRealTimers());

it('returns to 60 kg after eight base and two 55 kg deload workouts', () => {
  vi.useFakeTimers();
  Object.defineProperty(globalThis, 'localStorage', { value: new MemoryStorage(), configurable: true });
  localStorage.setItem('ironforge_templates_v1', JSON.stringify([{ id: 't', name: 'Тренировка', exercises: [{ id: 'bench-press', name: 'Жим', category: 'Chest', equipment: 'barbell', targetSets: 3, minReps: 8, maxReps: 12, weightStep: 2.5, currentWeight: 60, restSeconds: 90, history: [] }] }]));
  for (let index = 0; index < 10; index += 1) {
    const date = new Date(Date.UTC(2026, 0, 1 + index * 3));
    vi.setSystemTime(date);
    const phase = index >= 8 ? 'deload' : 'base';
    const active = buildActiveExercises(storageService.getTemplates()[0], 'optimal', phase)[0];
    expect(active.targetWeight).toBe(phase === 'deload' ? 55 : 60);
    const workout: CompletedWorkout = {
      id: `w-${index}`, templateId: 't', templateName: 'Тренировка', startTime: date.getTime() - 3600000,
      endTime: date.getTime(), durationMinutes: 60, totalVolumeKg: 0, totalSets: 3, cyclePhase: phase,
      exercises: [{ exerciseId: 'bench-press', name: 'Жим', category: 'Chest', targetSets: 3, minReps: 8, maxReps: 12,
        workingWeight: active.targetWeight, progression: active.recommendation,
        sets: [1, 2, 3].map(setNumber => ({ setNumber, weight: active.targetWeight, reps: 10, type: 'working' })) }]
    };
    storageService.saveCompletedWorkout(workout);
  }
  vi.setSystemTime(new Date(Date.UTC(2026, 0, 31)));
  expect(buildActiveExercises(storageService.getTemplates()[0], 'optimal', 'base')[0].targetWeight).toBe(60);
  expect(storageService.getTemplates()[0].exercises[0].currentWeight).toBe(60);
});

it('ignores the legacy deload note without migrating history', () => {
  const sets = (weight: number) => [1, 2, 3].map(setNumber => ({ setNumber, weight, reps: 10, type: 'working' as const }));
  const base = { id: 'a', workoutId: 'a', date: '2026-01-01T00:00:00.000Z', targetSets: 3, minReps: 8, maxReps: 12, weight: 60, sets: sets(60), totalVolume: 0, estimated1RM: 0 };
  const deload = { ...base, id: 'b', date: '2026-01-04T00:00:00.000Z', weight: 55, sets: sets(55), progressionNote: 'Разгрузочная неделя' };
  expect(evaluateDoubleProgression(3, 8, 12, 2.5, 60, [base, deload], 'optimal', new Date('2026-01-07T00:00:00.000Z')).nextWeight).toBe(60);
});
