import { beforeEach, describe, expect, it } from 'vitest';
import { storageService, partitionRawHistory } from '../src/services/storageService';
import type { CompletedWorkout, WorkoutTemplate } from '../src/types';

class MemoryStorage implements Storage {
  protected values = new Map<string, string>();
  get length() { return this.values.size; }
  clear() { this.values.clear(); }
  getItem(key: string) { return this.values.get(key) ?? null; }
  key(index: number) { return [...this.values.keys()][index] ?? null; }
  removeItem(key: string) { this.values.delete(key); }
  setItem(key: string, value: string) { this.values.set(key, String(value)); }
}

class QuotaThrowingStorage extends MemoryStorage {
  public failOnKey: string | null = null;
  override setItem(key: string, value: string) {
    if (this.failOnKey && this.failOnKey === key) {
      throw new Error('QuotaExceededError: LocalStorage quota exceeded');
    }
    super.setItem(key, value);
  }
}

const sampleWorkout = (id: string, endTime = Date.now()): CompletedWorkout => ({
  id,
  templateId: 'tpl-1',
  templateName: 'День А',
  startTime: endTime - 3600000,
  endTime,
  durationMinutes: 60,
  totalVolumeKg: 1000,
  totalSets: 3,
  exercises: [
    {
      exerciseId: 'bench-press',
      name: 'Жим штанги лёжа',
      category: 'Chest',
      targetSets: 3,
      minReps: 8,
      maxReps: 12,
      workingWeight: 60,
      sets: [
        { setNumber: 1, weight: 60, reps: 10, completed: true, type: 'working' },
        { setNumber: 2, weight: 60, reps: 10, completed: true, type: 'working' },
        { setNumber: 3, weight: 60, reps: 10, completed: true, type: 'working' }
      ],
      progression: {
        decision: 'INCREASE_REPS',
        nextWeight: 60,
        targetRepRange: '8-12',
        badgeText: 'В процессе',
        badgeColor: 'blue',
        analysis: '',
        suggestedAction: '',
        consecutivePlateauCount: 0
      }
    }
  ]
});

const sampleTemplate: WorkoutTemplate = {
  id: 'tpl-1',
  name: 'День А',
  description: '',
  exercises: [
    {
      id: 'bench-press',
      name: 'Жим штанги лёжа',
      category: 'Chest',
      targetSets: 3,
      minReps: 8,
      maxReps: 12,
      weightStep: 2.5,
      currentWeight: 60,
      restSeconds: 90,
      history: []
    }
  ]
};

beforeEach(() => {
  Object.defineProperty(globalThis, 'localStorage', {
    value: new MemoryStorage(),
    configurable: true
  });
  localStorage.setItem('ironforge_templates_v1', JSON.stringify([sampleTemplate]));
});

describe('I1: Malformed history records preservation on writes', () => {
  const rejectedRecord1 = { id: 'broken-1', exercises: [{ exerciseId: 'bench-press' }] }; // missing endTime
  const rejectedRecord2 = { id: 12345, endTime: 1234567, exercises: [] }; // id is number, not string
  const rejectedRecord3 = null;

  it('partitionRawHistory splits valid CompletedWorkouts and rejected items', () => {
    const valid1 = sampleWorkout('v-1');
    const raw = JSON.stringify([valid1, rejectedRecord1, rejectedRecord2, rejectedRecord3]);
    const { valid, rejected } = partitionRawHistory(raw);

    expect(valid).toHaveLength(1);
    expect(valid[0].id).toBe('v-1');
    expect(rejected).toEqual([rejectedRecord1, rejectedRecord2, rejectedRecord3]);
  });

  it('saveCompletedWorkout preserves rejected history items in raw storage', () => {
    const existingValid = sampleWorkout('w-1', 1000);
    localStorage.setItem(
      'ironforge_history_v1',
      JSON.stringify([existingValid, rejectedRecord1, rejectedRecord2])
    );

    const newWorkout = sampleWorkout('w-2', 2000);
    storageService.saveCompletedWorkout(newWorkout);

    const rawAfter = localStorage.getItem('ironforge_history_v1')!;
    const parsedAfter = JSON.parse(rawAfter);

    // Raw array contains the 2 valid workouts AND the 2 rejected items
    expect(parsedAfter).toHaveLength(4);
    const brokenFound = parsedAfter.find((item: any) => item && item.id === 'broken-1');
    expect(brokenFound).toEqual(rejectedRecord1);
    const numberIdFound = parsedAfter.find((item: any) => item && item.id === 12345);
    expect(numberIdFound).toEqual(rejectedRecord2);

    // Public getHistory() returns only valid workouts
    const validHistory = storageService.getHistory();
    expect(validHistory).toHaveLength(2);
    expect(validHistory.map(w => w.id)).toEqual(['w-2', 'w-1']);
  });

  it('deleteCompletedWorkout preserves rejected history items in raw storage', () => {
    const valid1 = sampleWorkout('w-1', 1000);
    const valid2 = sampleWorkout('w-2', 2000);
    localStorage.setItem(
      'ironforge_history_v1',
      JSON.stringify([valid2, rejectedRecord1, valid1, rejectedRecord2])
    );

    const deleted = storageService.deleteCompletedWorkout('w-1');
    expect(deleted).toBe(true);

    const rawAfter = localStorage.getItem('ironforge_history_v1')!;
    const parsedAfter = JSON.parse(rawAfter);

    expect(parsedAfter).toHaveLength(3); // valid2, rejected1, rejected2
    expect(parsedAfter.find((item: any) => item && item.id === 'broken-1')).toEqual(rejectedRecord1);
    expect(parsedAfter.find((item: any) => item && item.id === 12345)).toEqual(rejectedRecord2);
    expect(storageService.getHistory().map(w => w.id)).toEqual(['w-2']);
  });

  it('updateCompletedWorkout preserves rejected history items in raw storage', () => {
    const valid1 = sampleWorkout('w-1', 1000);
    localStorage.setItem(
      'ironforge_history_v1',
      JSON.stringify([valid1, rejectedRecord1, rejectedRecord2])
    );

    const updated = {
      ...valid1,
      exercises: [
        {
          ...valid1.exercises[0],
          sets: valid1.exercises[0].sets.map(s => ({ ...s, weight: 65 }))
        }
      ]
    };

    const success = storageService.updateCompletedWorkout('w-1', updated);
    expect(success).toBe(true);

    const rawAfter = localStorage.getItem('ironforge_history_v1')!;
    const parsedAfter = JSON.parse(rawAfter);

    expect(parsedAfter).toHaveLength(3);
    expect(parsedAfter.find((item: any) => item && item.id === 'broken-1')).toEqual(rejectedRecord1);
    expect(parsedAfter.find((item: any) => item && item.id === 12345)).toEqual(rejectedRecord2);
    expect(storageService.getHistory()[0].exercises[0].workingWeight).toBe(65);
  });

  it('deleting or updating an unknown id writes nothing and leaves storage byte-identical', () => {
    const raw = JSON.stringify([sampleWorkout('w-1', 1000), rejectedRecord1]);
    localStorage.setItem('ironforge_history_v1', raw);

    expect(storageService.deleteCompletedWorkout('unknown-id')).toBe(false);
    expect(localStorage.getItem('ironforge_history_v1')).toBe(raw);

    expect(storageService.updateCompletedWorkout('unknown-id', sampleWorkout('w-1'))).toBe(false);
    expect(localStorage.getItem('ironforge_history_v1')).toBe(raw);
  });

  it('quota failure restores byte-identical strings including rejected items', () => {
    const throwingStorage = new QuotaThrowingStorage();
    Object.defineProperty(globalThis, 'localStorage', {
      value: throwingStorage,
      configurable: true
    });

    const initialHistoryRaw = JSON.stringify([sampleWorkout('w-1', 1000), rejectedRecord1]);
    throwingStorage.setItem('ironforge_templates_v1', JSON.stringify([sampleTemplate]));
    throwingStorage.setItem('ironforge_history_v1', initialHistoryRaw);

    // Fail when writing history
    throwingStorage.failOnKey = 'ironforge_history_v1';

    expect(() => storageService.deleteCompletedWorkout('w-1')).toThrow(/QuotaExceededError/);
    expect(throwingStorage.getItem('ironforge_history_v1')).toBe(initialHistoryRaw);

    expect(() => storageService.saveCompletedWorkout(sampleWorkout('w-new'))).toThrow(/QuotaExceededError/);
    expect(throwingStorage.getItem('ironforge_history_v1')).toBe(initialHistoryRaw);
  });

  it('archives raw templates when non-object entries were filtered on next write', () => {
    const rawTemplatesWithCorrupt = JSON.stringify([
      sampleTemplate,
      'corrupt-string-entry',
      null,
      1234
    ]);
    localStorage.setItem('ironforge_templates_v1', rawTemplatesWithCorrupt);

    // Read templates (filters corrupt entries in memory and marks corruptKeys)
    const templates = storageService.getTemplates();
    expect(templates).toHaveLength(1);

    // Now write templates
    storageService.saveTemplates(templates);

    // Check that ironforge_corrupt_ironforge_templates_v1_* was created with exact raw value
    let archivedKey: string | null = null;
    for (let i = 0; i < localStorage.length; i += 1) {
      const key = localStorage.key(i);
      if (key?.startsWith('ironforge_corrupt_ironforge_templates_v1_')) {
        archivedKey = key;
        break;
      }
    }
    expect(archivedKey).not.toBeNull();
    expect(localStorage.getItem(archivedKey!)).toBe(rawTemplatesWithCorrupt);
  });
});
