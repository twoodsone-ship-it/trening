import type { WorkoutSet, WorkoutSetType, SetHistoryEntry } from '../types';

export function previousSetFor(set: WorkoutSet, history?: SetHistoryEntry[]): SetHistoryEntry | undefined {
  return history?.find(previous => isWarmupSet(previous) === isWarmupSet(set) && previous.setNumber === set.setNumber);
}

/** Re-number working sets; warmups stay at setNumber 0 */
export function renumberSets(sets: WorkoutSet[]): WorkoutSet[] {
  let workingNum = 1;
  return sets.map(s => {
    if (s.type === 'warmup' || s.isWarmup) {
      return { ...s, setNumber: 0 };
    }
    return { ...s, setNumber: workingNum++ };
  });
}

export function isWarmupSet(set: Pick<WorkoutSet, 'type' | 'isWarmup'>): boolean {
  return set.type === 'warmup' || !!set.isWarmup;
}

export const SET_TYPE_CYCLE: WorkoutSetType[] = ['working', 'warmup', 'failure', 'dropset'];

export function nextSetType(current: WorkoutSetType | undefined, isWarmup?: boolean): WorkoutSetType {
  const resolved = current || (isWarmup ? 'warmup' : 'working');
  const idx = SET_TYPE_CYCLE.indexOf(resolved);
  return SET_TYPE_CYCLE[(idx + 1) % SET_TYPE_CYCLE.length];
}

export function setTypeLabel(set: Pick<WorkoutSet, 'type' | 'isWarmup' | 'setNumber'>): string {
  if (set.type === 'warmup' || set.isWarmup) return 'Р';
  if (set.type === 'failure') return 'О';
  if (set.type === 'dropset') return 'Д';
  return String(set.setNumber);
}

export function workoutProgress(exercises: { sets: { completed: boolean }[] }[]): {
  completed: number;
  total: number;
  percent: number;
} {
  const completed = exercises.reduce((sum, ex) => sum + ex.sets.filter(s => s.completed).length, 0);
  const total = exercises.reduce((sum, ex) => sum + ex.sets.length, 0);
  return {
    completed,
    total,
    percent: total === 0 ? 0 : Math.round((completed / total) * 100)
  };
}
