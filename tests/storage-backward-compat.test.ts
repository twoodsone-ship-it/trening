import { beforeEach, describe, expect, it } from 'vitest';
import { storageService } from '../src/services/storageService';

class MemoryStorage implements Storage {
  private values = new Map<string, string>();
  get length() { return this.values.size; }
  clear() { this.values.clear(); }
  getItem(key: string) { return this.values.get(key) ?? null; }
  key(index: number) { return [...this.values.keys()][index] ?? null; }
  removeItem(key: string) { this.values.delete(key); }
  setItem(key: string, value: string) { this.values.set(key, String(value)); }
}

beforeEach(() => { Object.defineProperty(globalThis, 'localStorage', { value: new MemoryStorage(), configurable: true }); });

describe('storage backward compatibility', () => {
  it('loads templates and history in the existing localStorage shape', () => {
    localStorage.setItem('ironforge_templates_v1', JSON.stringify([{ id: 'old-template', name: 'Старая программа', exercises: [{ id: 'bench-press', name: 'Жим', currentWeight: 40, history: [] }] }]));
    const oldWorkout = { id: 'w-old', templateId: 'old-template', templateName: 'Старая программа', startTime: 1, endTime: 2, durationMinutes: 1, totalVolumeKg: 80, totalSets: 2, exercises: [] };
    localStorage.setItem('ironforge_history_v1', JSON.stringify([oldWorkout]));
    expect(storageService.getTemplates()[0].id).toBe('old-template');
    expect(storageService.getHistory()[0].id).toBe('w-old');
  });

  it('imports an old JSON backup and skips invalid history entries', () => {
    const fixture = JSON.stringify({ version: '1.0', templates: [{ id: 'old-template', name: 'Старая программа', exercises: [] }], history: [
      { id: 'w-old', endTime: 2, exercises: [] }, { id: 5, endTime: 'yesterday', exercises: null }
    ] });
    expect(storageService.importBackupJson(fixture)).toBe(true);
    expect(storageService.getHistory().map(workout => workout.id)).toEqual(['w-old']);
  });

  it('keeps the existing exercise weight during a deload workout', () => {
    localStorage.setItem('ironforge_templates_v1', JSON.stringify([{ id: 't', name: 'Тренировка', exercises: [{ id: 'bench-press', name: 'Жим', currentWeight: 50, history: [] }] }]));
    const workout = {
      id: 'w-deload', templateId: 't', templateName: 'Тренировка', cyclePhase: 'deload', startTime: 1, endTime: 2,
      durationMinutes: 1, totalVolumeKg: 540, totalSets: 3,
      exercises: [{ exerciseId: 'bench-press', name: 'Жим', category: 'Chest', targetSets: 3, minReps: 8, maxReps: 12,
        workingWeight: 45, sets: [{ setNumber: 1, weight: 45, reps: 12, type: 'working' }],
        progression: { decision: 'INCREASE_WEIGHT', nextWeight: 55, targetRepRange: '8-10', badgeText: 'Тест', badgeColor: 'blue', analysis: '', suggestedAction: '', consecutivePlateauCount: 0 } }]
    } as any;
    storageService.saveCompletedWorkout(workout);
    expect(storageService.getTemplates()[0].exercises[0].currentWeight).toBe(50);
    expect(storageService.getTemplates()[0].exercises[0].history.at(-1)?.decision).toBeUndefined();
  });

  it('archives malformed history before replacing it', () => {
    const raw = '{ broken history';
    localStorage.setItem('ironforge_history_v1', raw);
    expect(storageService.getHistory()).toEqual([]);
    storageService.saveCompletedWorkout({ id: 'w-new', templateId: 't', templateName: 'Тренировка', startTime: 1, endTime: 2,
      durationMinutes: 1, totalVolumeKg: 0, totalSets: 0, exercises: [] } as any);
    const archivedKey = Array.from({ length: localStorage.length }, (_, index) => localStorage.key(index) || '').find(key => key.startsWith('ironforge_corrupt_ironforge_history_v1_'));
    expect(archivedKey && localStorage.getItem(archivedKey)).toBe(raw);
  });

  it('updates an exercise found outside the workout template and lowers its weight to the load used', () => {
    localStorage.setItem('ironforge_templates_v1', JSON.stringify([{ id: 'other', name: 'Другая', exercises: [{ id: 'bench-press', name: 'Жим', currentWeight: 82.5, history: [] }] }]));
    storageService.saveCompletedWorkout({ id: 'w-cross-template', templateId: 'regenerated', templateName: 'Новая программа', startTime: 1, endTime: 2,
      durationMinutes: 1, totalVolumeKg: 840, totalSets: 3,
      exercises: [{ exerciseId: 'bench-press', name: 'Жим', category: 'Chest', targetSets: 3, minReps: 8, maxReps: 12,
        workingWeight: 70, sets: [1, 2, 3].map(setNumber => ({ setNumber, weight: 70, reps: 4, type: 'working' })),
        progression: { decision: 'INCREASE_REPS', nextWeight: 82.5, targetRepRange: '8-12', badgeText: 'Тест', badgeColor: 'blue', analysis: '', suggestedAction: '', consecutivePlateauCount: 0 } }]
    } as any);
    const exercise = storageService.getTemplates()[0].exercises[0];
    expect(exercise.currentWeight).toBe(70);
    expect(exercise.history).toHaveLength(1);
  });
});
