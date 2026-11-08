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

  it('keeps load and history invariants with random skipped exercises across 60 sessions', () => {
    vi.useFakeTimers();
    Object.defineProperty(globalThis, 'localStorage', { value: new MemoryStorage(), configurable: true });
    localStorage.setItem(
      'ironforge_templates_v1',
      JSON.stringify([
        {
          id: 't-multi',
          name: 'Фуллбоди',
          exercises: [
            { id: 'bench-press', name: 'Жим', category: 'Chest', targetSets: 3, minReps: 8, maxReps: 12, weightStep: 2.5, currentWeight: 60, restSeconds: 90, history: [] },
            { id: 'squat', name: 'Присед', category: 'Legs', targetSets: 3, minReps: 8, maxReps: 12, weightStep: 5, currentWeight: 80, restSeconds: 120, history: [] }
          ]
        }
      ])
    );

    let benchValidCount = 0;
    let squatValidCount = 0;
    let previousBenchWeight = 60;
    let previousSquatWeight = 80;

    // Deterministic pseudo-random sequence for repeatability
    const isSkippedBench = (i: number) => (i * 7 + 3) % 5 === 0;
    const isSkippedSquat = (i: number) => (i * 11 + 1) % 6 === 0;

    for (let index = 0; index < 60; index += 1) {
      const date = new Date(Date.UTC(2026, 0, 1 + index * 3));
      vi.setSystemTime(date);
      const phase = index === 15 || index === 30 ? 'deload' : 'base';
      const template = storageService.getTemplates()[0];
      const activeExercises = buildActiveExercises(template, 'optimal', phase);
      const activeBench = activeExercises.find(e => e.exerciseId === 'bench-press')!;
      const activeSquat = activeExercises.find(e => e.exerciseId === 'squat')!;

      // Invariants: weights are valid finite numbers rounded to 0.25
      expect(Number.isFinite(activeBench.targetWeight)).toBe(true);
      expect(Number.isFinite(activeSquat.targetWeight)).toBe(true);
      expect(activeBench.targetWeight * 4).toBe(Math.round(activeBench.targetWeight * 4));
      expect(activeSquat.targetWeight * 4).toBe(Math.round(activeSquat.targetWeight * 4));

      // Weight should never jump erratically
      expect(Math.abs(activeBench.targetWeight - previousBenchWeight)).toBeLessThanOrEqual(10);
      expect(Math.abs(activeSquat.targetWeight - previousSquatWeight)).toBeLessThanOrEqual(15);

      const benchSkipped = isSkippedBench(index);
      const squatSkipped = isSkippedSquat(index);

      if (!benchSkipped) benchValidCount += 1;
      if (!squatSkipped) squatValidCount += 1;

      const reps = 8 + (index % 5);
      const completed: CompletedWorkout = {
        id: `w-${index}`,
        templateId: 't-multi',
        templateName: 'Фуллбоди',
        startTime: date.getTime() - 3600000,
        endTime: date.getTime(),
        durationMinutes: 60,
        totalVolumeKg: 0,
        totalSets: (benchSkipped ? 0 : 3) + (squatSkipped ? 0 : 3),
        cyclePhase: phase,
        exercises: [
          {
            exerciseId: activeBench.exerciseId,
            name: activeBench.name,
            category: activeBench.category,
            targetSets: activeBench.targetSets,
            minReps: 8,
            maxReps: 12,
            workingWeight: activeBench.targetWeight,
            progression: activeBench.recommendation,
            sets: benchSkipped
              ? [
                  { setNumber: 1, weight: activeBench.targetWeight, reps: 0, completed: false, type: 'working' },
                  { setNumber: 2, weight: activeBench.targetWeight, reps: 0, completed: false, type: 'working' },
                  { setNumber: 3, weight: activeBench.targetWeight, reps: 0, completed: false, type: 'working' }
                ]
              : [1, 2, 3].map(setNumber => ({ setNumber, weight: activeBench.targetWeight, reps, completed: true, type: 'working' }))
          },
          {
            exerciseId: activeSquat.exerciseId,
            name: activeSquat.name,
            category: activeSquat.category,
            targetSets: activeSquat.targetSets,
            minReps: 8,
            maxReps: 12,
            workingWeight: activeSquat.targetWeight,
            progression: activeSquat.recommendation,
            sets: squatSkipped
              ? []
              : [1, 2, 3].map(setNumber => ({ setNumber, weight: activeSquat.targetWeight, reps, completed: true, type: 'working' }))
          }
        ]
      };

      storageService.saveCompletedWorkout(completed);

      if (phase === 'base') {
        if (!benchSkipped) previousBenchWeight = activeBench.targetWeight;
        if (!squatSkipped) previousSquatWeight = activeSquat.targetWeight;
      }

      // History in ironforge_history_v1 always records every completed workout
      expect(storageService.getHistory()).toHaveLength(index + 1);

      // Template history only keeps valid non-skipped sessions up to TEMPLATE_HISTORY_KEEP
      const updatedTemplate = storageService.getTemplates()[0];
      const updatedBench = updatedTemplate.exercises.find(e => e.id === 'bench-press')!;
      const updatedSquat = updatedTemplate.exercises.find(e => e.id === 'squat')!;

      expect(updatedBench.history).toHaveLength(Math.min(benchValidCount, TEMPLATE_HISTORY_KEEP));
      expect(updatedSquat.history).toHaveLength(Math.min(squatValidCount, TEMPLATE_HISTORY_KEEP));
    }
  });
});
