import { afterEach, describe, expect, it, vi } from 'vitest';
import { buildActiveExercises } from '../src/hooks/useWorkoutSession';
import { storageService, TEMPLATE_HISTORY_KEEP } from '../src/services/storageService';
import type { CompletedWorkout } from '../src/types';

class MemoryStorage implements Storage {
  private data = new Map<string, string>();
  get length() { return this.data.size; }
  clear() { this.data.clear(); }
  getItem(key: string) { return this.data.get(key) ?? null; }
  key(index: number) { return [...this.data.keys()][index] ?? null; }
  removeItem(key: string) { this.data.delete(key); }
  setItem(key: string, value: string) { this.data.set(key, value); }
}

afterEach(() => vi.useRealTimers());

describe('60-session progression simulation', () => {
  for (const logRpe of [false, true]) {
    it(`keeps load and history invariants with RPE logging ${logRpe}`, () => {
      vi.useFakeTimers();
      Object.defineProperty(globalThis, 'localStorage', { value: new MemoryStorage(), configurable: true });
      localStorage.setItem('ironforge_templates_v1', JSON.stringify([{ id: 't', name: 'Тренировка', exercises: [{ id: 'bench-press', name: 'Жим', category: 'Chest', targetSets: 3, minReps: 8, maxReps: 12, weightStep: 2.5, currentWeight: 60, restSeconds: 90, history: [] }] }]));
      let previousWeight = 60;
      for (let index = 0; index < 60; index += 1) {
        const date = new Date(Date.UTC(2026, 0, 1 + index * 3 + (index >= 35 ? 45 : 0)));
        vi.setSystemTime(date);
        const phase = index === 8 || index === 9 ? 'deload' : 'base';
        const template = storageService.getTemplates()[0];
        const active = buildActiveExercises(template, 'optimal', phase)[0];
        expect(Number.isFinite(active.targetWeight)).toBe(true);
        expect(active.targetWeight * 4).toBe(Math.round(active.targetWeight * 4));
        if (index === 10) expect(active.targetWeight).toBe(60);
        if (phase === 'base' && index !== 10 && index !== 35 && active.recommendation.decision !== 'DELOAD_RECOMMENDED') {
          expect(active.targetWeight).toBeGreaterThanOrEqual(previousWeight);
        }
        expect(active.targetWeight - previousWeight).toBeLessThanOrEqual(5);
        const reps = index < 8 ? 10 : 8 + (index % 7);
        const completed: CompletedWorkout = {
          id: `w-${index}`, templateId: 't', templateName: 'Тренировка', startTime: date.getTime() - 3600000,
          endTime: date.getTime(), durationMinutes: 60, totalVolumeKg: 0, totalSets: 3, cyclePhase: phase,
          exercises: [{ exerciseId: active.exerciseId, name: active.name, category: active.category, targetSets: active.targetSets,
            minReps: 8, maxReps: 12, workingWeight: active.targetWeight, progression: active.recommendation,
            sets: [1, 2, 3].map(setNumber => ({ setNumber, weight: active.targetWeight, reps, rpe: logRpe ? 8 : undefined, type: 'working' })) }]
        };
        storageService.saveCompletedWorkout(completed);
        if (phase === 'base') previousWeight = active.targetWeight;
        expect(storageService.getHistory()).toHaveLength(index + 1);
        expect(storageService.getTemplates()[0].exercises[0].history).toHaveLength(Math.min(index + 1, TEMPLATE_HISTORY_KEEP));
      }
    });
  }
});
