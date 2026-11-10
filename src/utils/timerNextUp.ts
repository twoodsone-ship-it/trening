import type { ActiveExerciseSession, WorkoutSet } from '../types';

export function formatWeightComma(weight: number): string {
  return String(weight).replace('.', ',');
}

export function formatSetLoad(set: WorkoutSet, trackingMode?: string, defaultDuration?: number): string {
  const weightStr = set.weight > 0 ? `${formatWeightComma(set.weight)} кг` : 'собственный вес';
  if (trackingMode === 'duration') {
    return `${weightStr} · ${set.durationSeconds ?? defaultDuration ?? 60} с`;
  }
  return `${weightStr} × ${set.reps}`;
}

export function getNextUpText(
  exercises: ActiveExerciseSession[],
  currentExIdx: number,
  _completedSetIdx?: number
): string {
  const hasAnyRemaining = exercises.some(ex => ex.sets.some(s => !s.completed));
  if (!hasAnyRemaining) {
    return 'Это был последний подход';
  }

  const currentEx = exercises[currentExIdx];
  const gid = currentEx?.supersetGroupId;

  // Superset circle logic
  if (gid) {
    const groupIndices: number[] = [];
    exercises.forEach((ex, idx) => {
      if (ex.supersetGroupId === gid) groupIndices.push(idx);
    });

    if (groupIndices.length > 1) {
      const currentPosInGroup = groupIndices.indexOf(currentExIdx);
      if (currentPosInGroup !== -1) {
        for (let step = 1; step <= groupIndices.length; step++) {
          const nextIdx = groupIndices[(currentPosInGroup + step) % groupIndices.length];
          const nextEx = exercises[nextIdx];
          const nextSet = nextEx.sets.find(s => !s.completed);
          if (nextSet) {
            const workingSets = nextEx.sets.filter(s => s.type !== 'warmup' && !s.isWarmup);
            const isWarmup = nextSet.type === 'warmup' || nextSet.isWarmup;
            if (nextIdx === currentExIdx) {
              if (isWarmup) {
                return `Дальше: разминка · ${formatSetLoad(nextSet, nextEx.trackingMode, nextEx.defaultDurationSeconds)}`;
              }
              const workingIdx = workingSets.findIndex(s => s.id === nextSet.id);
              const setNum = workingIdx !== -1 ? workingIdx + 1 : nextSet.setNumber;
              const totalSets = workingSets.length || nextEx.targetSets;
              return `Дальше: подход ${setNum} из ${totalSets} · ${formatSetLoad(nextSet, nextEx.trackingMode, nextEx.defaultDurationSeconds)}`;
            }
            if (isWarmup) {
              return `Дальше: ${nextEx.name} · разминка · ${formatSetLoad(nextSet, nextEx.trackingMode, nextEx.defaultDurationSeconds)}`;
            }
            const workingIdx = workingSets.findIndex(s => s.id === nextSet.id);
            const setNum = workingIdx !== -1 ? workingIdx + 1 : nextSet.setNumber;
            const totalSets = workingSets.length || nextEx.targetSets;
            return `Дальше: ${nextEx.name} · подход ${setNum} из ${totalSets} · ${formatSetLoad(nextSet, nextEx.trackingMode, nextEx.defaultDurationSeconds)}`;
          }
        }
      }
    }
  }

  // Same exercise has uncompleted set
  const nextSetInCurrent = currentEx?.sets.find(s => !s.completed);
  if (nextSetInCurrent) {
    const workingSets = currentEx.sets.filter(s => s.type !== 'warmup' && !s.isWarmup);
    const isWarmup = nextSetInCurrent.type === 'warmup' || nextSetInCurrent.isWarmup;
    if (isWarmup) {
      return `Дальше: разминка · ${formatSetLoad(nextSetInCurrent, currentEx.trackingMode, currentEx.defaultDurationSeconds)}`;
    }
    const workingIdx = workingSets.findIndex(s => s.id === nextSetInCurrent.id);
    const setNum = workingIdx !== -1 ? workingIdx + 1 : nextSetInCurrent.setNumber;
    const totalSets = workingSets.length || currentEx.targetSets;
    return `Дальше: подход ${setNum} из ${totalSets} · ${formatSetLoad(nextSetInCurrent, currentEx.trackingMode, currentEx.defaultDurationSeconds)}`;
  }

  // Current exercise finished -> next exercise
  const nextEx = exercises.slice(currentExIdx + 1).find(ex => ex.sets.some(s => !s.completed))
    || exercises.find(ex => ex.sets.some(s => !s.completed));

  if (nextEx) {
    const weightStr = nextEx.targetWeight > 0
      ? `${formatWeightComma(nextEx.targetWeight)} кг`
      : (nextEx.sets[0]?.weight > 0 ? `${formatWeightComma(nextEx.sets[0].weight)} кг` : 'собственный вес');
    return `Дальше: ${nextEx.name} · ${weightStr}`;
  }

  return 'Это был последний подход';
}
