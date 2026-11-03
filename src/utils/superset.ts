import type { ActiveExerciseSession, Exercise } from '../types';

export type ExerciseBlock<T extends { id?: string; exerciseId?: string; name: string; supersetGroupId?: string }> =
  | { kind: 'single'; item: T }
  | { kind: 'superset'; groupId: string; items: T[] };

/** Group consecutive exercises that share the same supersetGroupId */
export function groupBySuperset<T extends { id?: string; exerciseId?: string; name: string; supersetGroupId?: string }>(
  exercises: T[]
): ExerciseBlock<T>[] {
  const blocks: ExerciseBlock<T>[] = [];
  let i = 0;
  while (i < exercises.length) {
    const current = exercises[i];
    const gid = current.supersetGroupId;
    if (!gid) {
      blocks.push({ kind: 'single', item: current });
      i += 1;
      continue;
    }
    const items: T[] = [current];
    let j = i + 1;
    while (j < exercises.length && exercises[j].supersetGroupId === gid) {
      items.push(exercises[j]);
      j += 1;
    }
    if (items.length === 1) {
      blocks.push({ kind: 'single', item: current });
    } else {
      blocks.push({ kind: 'superset', groupId: gid, items });
    }
    i = j;
  }
  return blocks;
}

export function newSupersetGroupId(): string {
  return 'ss-' + Date.now().toString(36) + '-' + Math.random().toString(36).slice(2, 6);
}

export function linkAsSuperset(exercises: Exercise[], indices: number[]): Exercise[] {
  if (indices.length < 2) return exercises;
  const gid = newSupersetGroupId();
  return exercises.map((ex, i) =>
    indices.includes(i) ? { ...ex, supersetGroupId: gid } : ex
  );
}

export function unlinkSuperset(exercises: Exercise[], groupId: string): Exercise[] {
  return exercises.map(ex =>
    ex.supersetGroupId === groupId ? { ...ex, supersetGroupId: undefined } : ex
  );
}

export function findFocusTarget(
  exercises: ActiveExerciseSession[]
): { exIdx: number; setIdx: number } | null {
  for (let exIdx = 0; exIdx < exercises.length; exIdx++) {
    const setIdx = exercises[exIdx].sets.findIndex(s => !s.completed);
    if (setIdx !== -1) return { exIdx, setIdx };
  }
  return null;
}
