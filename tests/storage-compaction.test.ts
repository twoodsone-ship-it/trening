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


describe('G2: Compaction on write only', () => {
  it('templates blob size no longer grows beyond keep window (compare after 100 and 400 workouts)', () => {
    const exerciseIds = ['bench-press', 'incline-db-press', 'dips', 'triceps-pushdown'];
    const template: WorkoutTemplate = {
      id: 't-compaction',
      name: 'Push Day',
      description: '',
      exercises: exerciseIds.map(id => ({
        id,
        name: id,
        category: 'Chest',
        targetSets: 3,
        minReps: 8,
        maxReps: 12,
        weightStep: 2.5,
        currentWeight: 80,
        restSeconds: 90,
        history: []
      }))
    };
    storageService.saveTemplates([template]);

    let templatesLenAt100 = 0;
    for (let i = 1; i <= 400; i++) {
      const workout: CompletedWorkout = {
        id: `w-sim-${i}`,
        templateId: 't-compaction',
        templateName: 'Push Day',
        startTime: 1000 + i * 86400000,
        endTime: 1000 + i * 86400000 + 3600000,
        durationMinutes: 45,
        totalVolumeKg: 2400 * 4,
        totalSets: 12,
        exercises: exerciseIds.map(exerciseId => ({
          exerciseId,
          name: exerciseId,
          category: 'Chest',
          targetSets: 3,
          minReps: 8,
          maxReps: 12,
          workingWeight: 80,
          sets: [
            { setNumber: 1, weight: 80, reps: 10, completed: true, type: 'working' },
            { setNumber: 2, weight: 80, reps: 10, completed: true, type: 'working' },
            { setNumber: 3, weight: 80, reps: 10, completed: true, type: 'working' }
          ],
          progression: {
            decision: 'INCREASE_REPS',
            nextWeight: 80,
            targetRepRange: '8-12',
            badgeText: 'В плане',
            badgeColor: 'blue',
            analysis: '',
            suggestedAction: '',
            consecutivePlateauCount: 0
          }
        }))
      };
      storageService.saveCompletedWorkout(workout);

      if (i === 100) {
        templatesLenAt100 = (localStorage.getItem('ironforge_templates_v1') || '').length;
      }
    }

    const templatesLenAt400 = (localStorage.getItem('ironforge_templates_v1') || '').length;
    const exHistories = storageService.getTemplates()[0].exercises;

    expect(exHistories[0].history.length).toBe(30);
    expect(exHistories[1].history.length).toBe(30);
    // Difference between 100 and 400 workouts is minimal (bounded by session ID timestamp lengths)
    expect(Math.abs(templatesLenAt400 - templatesLenAt100)).toBeLessThan(300);

    // Total usage after 400 workouts is at most ~60% of pre-change figure:
    const history = storageService.getHistory();
    expect(history.length).toBe(400);

    const historyBytes = (localStorage.getItem('ironforge_history_v1') || '').length * 2;
    const compactedTemplatesBytes = (localStorage.getItem('ironforge_templates_v1') || '').length * 2;
    const compactedTotal = historyBytes + compactedTemplatesBytes;

    // Estimate pre-change templates size where all 400 sessions remained in templates across 4 exercises:
    const perSessionTemplatesBytes = compactedTemplatesBytes / 30;
    const uncompactedTemplatesBytes = perSessionTemplatesBytes * 400;
    const uncompactedTotal = historyBytes + uncompactedTemplatesBytes;

    const ratio = compactedTotal / uncompactedTotal;
    expect(ratio).toBeLessThanOrEqual(0.60);
  }, 20000);

  it('legacy template-only sessions survive compaction', () => {
    const legacySession: ExerciseSession = {
      id: 'legacy-orphan-session',
      workoutId: 'w-orphan-legacy',
      date: new Date(100).toISOString(),
      targetSets: 3,
      minReps: 8,
      maxReps: 12,
      weight: 60,
      sets: [{ setNumber: 1, weight: 60, reps: 10, completed: true }],
      totalVolume: 600,
      estimated1RM: 80,
      progressionNote: 'Legacy'
    };

    const template: WorkoutTemplate = {
      id: 't-legacy',
      name: 'Legacy Template',
      description: '',
      exercises: [
        {
          id: 'bench-press',
          name: 'Жим лёжа',
          category: 'Chest',
          targetSets: 3,
          minReps: 8,
          maxReps: 12,
          weightStep: 2.5,
          currentWeight: 60,
          restSeconds: 90,
          history: [legacySession]
        }
      ]
    };
    storageService.saveTemplates([template]);

    // Save 35 workouts
    for (let i = 1; i <= 35; i++) {
      storageService.saveCompletedWorkout({
        id: `w-legacy-test-${i}`,
        templateId: 't-legacy',
        templateName: 'Legacy Template',
        startTime: 1000 + i * 86400000,
        endTime: 1000 + i * 86400000 + 3600000,
        durationMinutes: 45,
        totalVolumeKg: 1800,
        totalSets: 3,
        exercises: [{
          exerciseId: 'bench-press',
          name: 'Жим лёжа',
          category: 'Chest',
          targetSets: 3,
          minReps: 8,
          maxReps: 12,
          workingWeight: 60,
          sets: [{ setNumber: 1, weight: 60, reps: 10, completed: true, type: 'working' }],
          progression: { decision: 'INCREASE_REPS', nextWeight: 60, targetRepRange: '8-12', badgeText: '', badgeColor: 'blue', analysis: '', suggestedAction: '', consecutivePlateauCount: 0 }
        }]
      });
    }

    const ex = storageService.getTemplates()[0].exercises[0];
    // 30 synced + 1 legacy orphan = 31
    expect(ex.history.length).toBe(31);
    expect(ex.history.some(s => s.id === 'legacy-orphan-session')).toBe(true);
  });

  it('old backup import does not compact templates on read or import', () => {
    // Backup has 50 sessions inside template
    const fiftySessions: ExerciseSession[] = Array.from({ length: 50 }, (_, i) => ({
      id: `h-import-${i}`,
      workoutId: `w-import-${i}`,
      date: new Date(1000 + i * 86400000).toISOString(),
      targetSets: 3,
      minReps: 8,
      maxReps: 12,
      weight: 50,
      sets: [{ setNumber: 1, weight: 50, reps: 10, completed: true }],
      totalVolume: 500,
      estimated1RM: 66,
      progressionNote: 'Import'
    }));

    const backup = JSON.stringify({
      version: '1.0',
      templates: [{
        id: 't-imported',
        name: 'Imported',
        exercises: [{
          id: 'bench-press',
          name: 'Жим',
          currentWeight: 50,
          history: fiftySessions
        }]
      }],
      history: fiftySessions.map(s => ({
        id: s.workoutId,
        endTime: 2000,
        exercises: []
      }))
    });

    expect(storageService.importBackupJson(backup)).toBe(true);

    // On read, getTemplates() returns all 50 sessions without compaction
    const loadedTemplates = storageService.getTemplates();
    expect(loadedTemplates[0].exercises[0].history.length).toBe(50);
  });

  it('progression engine output is identical with and without compaction across a 60-session scenario', () => {
    const uncompactedHistory: ExerciseSession[] = [];
    const compactedHistory: ExerciseSession[] = [];
    let currentWeight = 60;
    const baseDate = new Date('2026-01-01T10:00:00Z').getTime();

    for (let sessionIdx = 0; sessionIdx < 60; sessionIdx++) {
      let simDateMs = baseDate + sessionIdx * 2 * 86400000; // every 2 days
      let isDeload = false;

      // Deload week at session 20-22
      if (sessionIdx >= 20 && sessionIdx <= 22) {
        isDeload = true;
      }
      // 45-day break after session 40
      if (sessionIdx >= 41) {
        simDateMs += 45 * 86400000;
      }

      const simDate = new Date(simDateMs);

      // Evaluate recommendations on both
      const recUncompacted = evaluateDoubleProgression(3, 8, 12, 2.5, currentWeight, uncompactedHistory, 'optimal', simDate);
      const recCompacted = evaluateDoubleProgression(3, 8, 12, 2.5, currentWeight, compactedHistory, 'optimal', simDate);

      expect(recCompacted.decision).toBe(recUncompacted.decision);
      expect(recCompacted.nextWeight).toBe(recUncompacted.nextWeight);
      expect(recCompacted.targetRepRange).toBe(recUncompacted.targetRepRange);
      expect(recCompacted.badgeText).toBe(recUncompacted.badgeText);

      // Perform session
      const reps = isDeload ? 8 : (10 + (sessionIdx % 3));
      const session: ExerciseSession = {
        id: `h-step-${sessionIdx}`,
        workoutId: `w-step-${sessionIdx}`,
        date: simDate.toISOString(),
        targetSets: 3,
        minReps: 8,
        maxReps: 12,
        weight: currentWeight,
        sets: [1, 2, 3].map(setNumber => ({ setNumber, weight: currentWeight, reps, completed: true, type: 'working' })),
        totalVolume: 3 * currentWeight * reps,
        estimated1RM: Math.round(currentWeight * (1 + reps / 30) * 10) / 10,
        progressionNote: recCompacted.badgeText,
        phase: isDeload ? 'deload' : undefined,
        decision: isDeload ? undefined : recCompacted.decision
      };

      uncompactedHistory.push(session);
      compactedHistory.push(session);
      if (compactedHistory.length > 30) {
        compactedHistory.shift();
      }

      currentWeight = recCompacted.nextWeight;
    }
  });
});
