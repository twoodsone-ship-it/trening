import React, { Suspense, lazy, useEffect, useState } from 'react';
import { CheckCircle2, Clock, Focus, Link2, Plus } from 'lucide-react';
import confetti from 'canvas-confetti';
import type {
  ActiveExerciseSession,
  AppSettings,
  CompletedWorkout,
  ReadinessLevel,
  WorkoutSet
} from '../types';
import { soundService, wakeLockService } from '../services/audioService';
import { calculateVolume, evaluateDoubleProgression } from '../services/progressionEngine';
import type { CatalogExerciseItem } from '../data/exerciseCatalog';
import { ActiveExerciseCard } from './workout/ActiveExerciseCard';
import { WorkoutProgressRing } from './workout/WorkoutProgressRing';
import { RpePickerModal } from './RpePickerModal';
import { FocusSetOverlay } from './FocusSetOverlay';
import { isWarmupSet, nextSetType, renumberSets, workoutProgress, previousSetFor } from '../utils/workoutHelpers';
import { findFocusTarget, groupBySuperset, newSupersetGroupId } from '../utils/superset';
import { restTimerStorage } from '../utils/restTimerStorage';
import { cn } from '../utils/cn';

const PlateCalculatorModal = lazy(() =>
  import('./PlateCalculatorModal').then(m => ({ default: m.PlateCalculatorModal }))
);
const ExerciseTechniqueModal = lazy(() =>
  import('./ExerciseTechniqueModal').then(m => ({ default: m.ExerciseTechniqueModal }))
);
const ExerciseSwapModal = lazy(() =>
  import('./ExerciseSwapModal').then(m => ({ default: m.ExerciseSwapModal }))
);

interface ActiveWorkoutViewProps {
  workoutName: string;
  templateId: string;
  readiness?: ReadinessLevel;
  cycleWeek?: number;
  cyclePhase?: 'base' | 'progress' | 'overload' | 'deload';
  startTime: number;
  exercises: ActiveExerciseSession[];
  settings: AppSettings;
  onUpdateExercises: (exercises: ActiveExerciseSession[]) => void;
  onFinishWorkout: (completed: CompletedWorkout) => void;
  onCancelWorkout: () => void;
  onTriggerRestTimer: (seconds: number) => void;
  /** Bumps when rest timer hits 0 — reopen focus for next set */
  restResumeNonce?: number;
  /** Register imperative resume so App can open focus after rest (incl. unlock) */
  onRegisterFocusResume?: (resume: (() => void) | null) => void;
}

function patchExercise(
  exercises: ActiveExerciseSession[],
  exIdx: number,
  patch: (ex: ActiveExerciseSession) => ActiveExerciseSession
): ActiveExerciseSession[] {
  return exercises.map((ex, i) => (i === exIdx ? patch(ex) : ex));
}

function patchSet(
  exercises: ActiveExerciseSession[],
  exIdx: number,
  setIdx: number,
  patch: (set: WorkoutSet) => WorkoutSet
): ActiveExerciseSession[] {
  return patchExercise(exercises, exIdx, ex => ({
    ...ex,
    sets: renumberSets(ex.sets.map((s, i) => (i === setIdx ? patch(s) : s)))
  }));
}

export const ActiveWorkoutView: React.FC<ActiveWorkoutViewProps> = ({
  workoutName,
  templateId,
  readiness = 'optimal',
  cycleWeek,
  cyclePhase,
  startTime,
  exercises,
  settings,
  onUpdateExercises,
  onFinishWorkout,
  onCancelWorkout,
  onTriggerRestTimer,
  restResumeNonce = 0,
  onRegisterFocusResume
}) => {
  const [selectedPlateCalcWeight, setSelectedPlateCalcWeight] = useState<number | null>(null);
  const [viewingTechniqueEx, setViewingTechniqueEx] = useState<ActiveExerciseSession | null>(null);
  const [swappingExIndex, setSwappingExIndex] = useState<number | null>(null);
  const [isAddingExercise, setIsAddingExercise] = useState(false);
  const [focusMode, setFocusMode] = useState(settings.focusModeDefault !== false);
  const [forcedFocus, setForcedFocus] = useState<{ exIdx: number; setIdx: number } | null>(null);
  const [expandedExIdx, setExpandedExIdx] = useState(-1);
  const [introducedExercises, setIntroducedExercises] = useState<Set<string>>(() => new Set());
  const [rpeTarget, setRpeTarget] = useState<{ exIdx: number; setIdx: number } | null>(null);
  const [elapsedMinutes, setElapsedMinutes] = useState(
    Math.max(1, Math.round((Date.now() - startTime) / 60000))
  );

  useEffect(() => {
    const timer = setInterval(() => {
      setElapsedMinutes(Math.max(1, Math.round((Date.now() - startTime) / 60000)));
    }, 30000);
    return () => clearInterval(timer);
  }, [startTime]);

  useEffect(() => {
    wakeLockService.requestWakeLock();
    const handleVisibility = () => {
      if (document.visibilityState === 'visible') wakeLockService.requestWakeLock();
    };
    document.addEventListener('visibilitychange', handleVisibility);
    return () => {
      document.removeEventListener('visibilitychange', handleVisibility);
      wakeLockService.releaseWakeLock();
    };
  }, []);

  const completeSetWithRpe = (exIdx: number, setIdx: number, rpe?: number) => {
    const warmup = isWarmupSet(exercises[exIdx].sets[setIdx]);
    let next = patchSet(exercises, exIdx, setIdx, s => ({
      ...s,
      completed: true,
      rpe: warmup ? undefined : rpe ?? s.rpe
    }));
    onUpdateExercises(next);
    soundService.haptic('setComplete', settings.vibrationEnabled);
    soundService.playCountdownBeep();
    onTriggerRestTimer(warmup ? 30 : exercises[exIdx].restSeconds || settings.defaultRestSeconds || 90);
  };

  const toggleSetComplete = (exIdx: number, setIdx: number) => {
    const targetSet = exercises[exIdx].sets[setIdx];
    if (targetSet.completed) {
      onUpdateExercises(patchSet(exercises, exIdx, setIdx, s => ({ ...s, completed: false })));
      return;
    }
    if (isWarmupSet(targetSet)) {
      completeSetWithRpe(exIdx, setIdx);
      return;
    }
    setRpeTarget({ exIdx, setIdx });
  };

  const updateSetWeight = (exIdx: number, setIdx: number, delta: number) => {
    onUpdateExercises(
      patchSet(exercises, exIdx, setIdx, s => ({
        ...s,
        weight: Math.max(0, Math.round((s.weight + delta) * 10) / 10)
      }))
    );
  };

  const updateSetReps = (exIdx: number, setIdx: number, delta: number) => {
    onUpdateExercises(
      patchSet(exercises, exIdx, setIdx, s => ({
        ...s,
        reps: Math.max(0, s.reps + delta)
      }))
    );
  };

  const updateSetDuration = (exIdx: number, setIdx: number, deltaSeconds: number) => {
    onUpdateExercises(
      patchSet(exercises, exIdx, setIdx, s => ({
        ...s,
        durationSeconds: Math.max(0, (s.durationSeconds ?? exercises[exIdx].defaultDurationSeconds ?? 60) + deltaSeconds),
        reps: 0
      }))
    );
  };

  const copyPreviousSet = (exIdx: number, setIdx: number) => {
    const prev = previousSetFor(exercises[exIdx].sets[setIdx], exercises[exIdx].previousPerformance?.sets);
    if (!prev) return;
    onUpdateExercises(
      patchSet(exercises, exIdx, setIdx, s => ({
        ...s,
        weight: prev.weight,
        reps: prev.reps,
        durationSeconds: prev.durationSeconds,
        rpe: prev.rpe ?? s.rpe
      }))
    );
    soundService.haptic('copyPrevious', settings.vibrationEnabled);
  };

  const cycleSetType = (exIdx: number, setIdx: number) => {
    onUpdateExercises(
      patchSet(exercises, exIdx, setIdx, s => {
        const nextType = nextSetType(s.type, s.isWarmup);
        return { ...s, type: nextType, isWarmup: nextType === 'warmup' };
      })
    );
  };

  const addWarmupSet = (exIdx: number) => {
    onUpdateExercises(
      patchExercise(exercises, exIdx, ex => {
        const warmupWeight = Math.max(0, Math.round((ex.targetWeight * 0.5) / 2.5) * 2.5);
        const warmupSet: WorkoutSet = {
          id: 'warmup-' + Date.now() + '-' + Math.random().toString(36).substring(2, 5),
          setNumber: 0,
          weight: warmupWeight,
          reps: Math.min(ex.maxReps, 12),
          rpe: 6,
          completed: false,
          type: 'warmup',
          isWarmup: true
        };
        const firstWorkingIdx = ex.sets.findIndex(s => !isWarmupSet(s));
        const sets = [...ex.sets];
        if (firstWorkingIdx !== -1) sets.splice(firstWorkingIdx, 0, warmupSet);
        else sets.unshift(warmupSet);
        return { ...ex, sets: renumberSets(sets) };
      })
    );
  };

  const addSet = (exIdx: number) => {
    onUpdateExercises(
      patchExercise(exercises, exIdx, ex => {
        const workingSets = ex.sets.filter(s => !isWarmupSet(s));
        const lastWorking = workingSets[workingSets.length - 1] || ex.sets[ex.sets.length - 1];
        const newSet: WorkoutSet = {
          id: 'set-' + Date.now() + '-' + Math.random().toString(36).substring(2, 5),
          setNumber: workingSets.length + 1,
          weight: lastWorking ? lastWorking.weight : ex.targetWeight,
          reps: lastWorking ? lastWorking.reps : ex.minReps,
          rpe: undefined,
          completed: false,
          type: 'working',
          isWarmup: false
        };
        return { ...ex, sets: renumberSets([...ex.sets, newSet]) };
      })
    );
  };

  const removeSet = (exIdx: number, setIdx: number) => {
    if (exercises[exIdx].sets.length <= 1) return;
    onUpdateExercises(
      patchExercise(exercises, exIdx, ex => ({
        ...ex,
        sets: renumberSets(ex.sets.filter((_, i) => i !== setIdx))
      }))
    );
  };

  const toggleSupersetPair = (exIdx: number) => {
    if (exIdx >= exercises.length - 1) return;
    const a = exercises[exIdx];
    const b = exercises[exIdx + 1];
    if (a.supersetGroupId && a.supersetGroupId === b.supersetGroupId) {
      onUpdateExercises(
        exercises.map((ex, i) =>
          i === exIdx || i === exIdx + 1 ? { ...ex, supersetGroupId: undefined } : ex
        )
      );
      return;
    }
    const gid = newSupersetGroupId();
    onUpdateExercises(
      exercises.map((ex, i) =>
        i === exIdx || i === exIdx + 1 ? { ...ex, supersetGroupId: gid } : ex
      )
    );
  };

  const handleSwapExercise = (newCatalogEx: CatalogExerciseItem) => {
    if (swappingExIndex === null) return;
    const oldEx = exercises[swappingExIndex];
    const recommendation = evaluateDoubleProgression(
      newCatalogEx.defaultSets,
      newCatalogEx.minReps,
      newCatalogEx.maxReps,
      newCatalogEx.weightStep,
      newCatalogEx.defaultWeight,
      []
    );

    const targetSetCount = Math.max(newCatalogEx.defaultSets, oldEx.sets.length);
    const newSets: WorkoutSet[] = Array.from({ length: targetSetCount }).map((_, i) => {
      const existing = oldEx.sets[i];
      if (existing) {
        return {
          id: existing.id || ('swap-' + Date.now() + '-' + i),
          setNumber: i + 1,
          weight: existing.completed ? existing.weight : newCatalogEx.defaultWeight,
          reps: existing.completed ? existing.reps : newCatalogEx.minReps,
          durationSeconds: existing.completed ? existing.durationSeconds : newCatalogEx.defaultDurationSeconds,
          rpe: existing.rpe,
          completed: existing.completed,
          type: existing.type || 'working',
          isWarmup: existing.isWarmup
        };
      }
      return {
        id: 'swap-' + Date.now() + '-' + i,
        setNumber: i + 1,
        weight: newCatalogEx.defaultWeight,
        reps: newCatalogEx.minReps,
        rpe: undefined,
        completed: false,
        type: 'working' as const
      };
    });

    onUpdateExercises(
      patchExercise(exercises, swappingExIndex, () => ({
        exerciseId: newCatalogEx.id,
        name: newCatalogEx.name,
        category: newCatalogEx.category,
        equipment: newCatalogEx.equipment,
        animationType: newCatalogEx.animationType,
        gifUrl: newCatalogEx.gifUrl,
        technique: newCatalogEx.technique,
        alternatives: newCatalogEx.alternatives,
        supersetGroupId: oldEx.supersetGroupId,
        targetSets: newCatalogEx.defaultSets,
        minReps: newCatalogEx.minReps,
        maxReps: newCatalogEx.maxReps,
        weightStep: newCatalogEx.weightStep,
        targetWeight: newCatalogEx.defaultWeight,
        restSeconds: newCatalogEx.restSeconds,
        trackingMode: newCatalogEx.trackingMode || 'reps',
        defaultDurationSeconds: newCatalogEx.defaultDurationSeconds,
        cardioIntensity: newCatalogEx.cardioIntensity,
        sets: renumberSets(newSets),
        recommendation
      }))
    );
    setSwappingExIndex(null);
  };

  const handleAddNewExercise = (newCatalogEx: CatalogExerciseItem) => {
    const recommendation = evaluateDoubleProgression(
      newCatalogEx.defaultSets,
      newCatalogEx.minReps,
      newCatalogEx.maxReps,
      newCatalogEx.weightStep,
      newCatalogEx.defaultWeight,
      []
    );

    const newSessionEx: ActiveExerciseSession = {
      exerciseId: newCatalogEx.id,
      name: newCatalogEx.name,
      category: newCatalogEx.category,
      equipment: newCatalogEx.equipment,
      animationType: newCatalogEx.animationType,
      gifUrl: newCatalogEx.gifUrl,
      technique: newCatalogEx.technique,
      alternatives: newCatalogEx.alternatives,
      targetSets: newCatalogEx.defaultSets,
      minReps: newCatalogEx.minReps,
      maxReps: newCatalogEx.maxReps,
      weightStep: newCatalogEx.weightStep,
      targetWeight: newCatalogEx.defaultWeight,
      restSeconds: newCatalogEx.restSeconds,
      trackingMode: newCatalogEx.trackingMode || 'reps',
      defaultDurationSeconds: newCatalogEx.defaultDurationSeconds,
      cardioIntensity: newCatalogEx.cardioIntensity,
      sets: Array.from({ length: newCatalogEx.defaultSets }).map((_, i) => ({
        id: 's-' + Date.now() + '-' + i,
        setNumber: i + 1,
        weight: newCatalogEx.defaultWeight,
        reps: newCatalogEx.minReps,
        durationSeconds: newCatalogEx.trackingMode === 'duration' ? newCatalogEx.defaultDurationSeconds : undefined,
        rpe: undefined,
        completed: false,
        type: 'working' as const
      })),
      recommendation
    };

    onUpdateExercises([...exercises, newSessionEx]);
    setIsAddingExercise(false);
  };

  const handleFinish = () => {
    const endTime = Date.now();
    const duration = Math.max(1, Math.round((endTime - startTime) / 60000));
    let totalVolume = 0;
    let totalSetsCount = 0;
    let totalCardioSeconds = 0;

    const completedExercises = exercises.map(ex => {
      const completedSets = ex.sets.filter(s => s.completed);
      const workingSets = completedSets.filter(s => !isWarmupSet(s));
      const actualWorkingSets = workingSets.filter(s => s.reps > 0 && s.type !== 'dropset');
      const topWorkingWeight = actualWorkingSets.reduce((top, set) => Math.max(top, set.weight), 0);
      const workingWeight = actualWorkingSets.filter(s => s.weight >= topWorkingWeight - 0.01).at(-1)?.weight ?? ex.targetWeight;
      totalVolume += calculateVolume(workingSets);
      totalSetsCount += workingSets.length;
      if (ex.category === 'Cardio' && ex.trackingMode === 'duration') {
        totalCardioSeconds += workingSets.reduce((sum, s) => sum + (s.durationSeconds || 0), 0);
      }
      return {
        exerciseId: ex.exerciseId,
        name: ex.name,
        category: ex.category,
        targetSets: ex.targetSets,
        minReps: ex.minReps,
        maxReps: ex.maxReps,
        workingWeight,
        trackingMode: ex.trackingMode || 'reps',
        sets: completedSets.map(s => ({
          setNumber: s.setNumber,
          weight: s.weight,
          reps: s.reps,
          durationSeconds: s.durationSeconds,
          distanceMeters: s.distanceMeters,
          rpe: s.rpe,
          type: s.type || (s.isWarmup ? 'warmup' as const : 'working' as const),
          isWarmup: isWarmupSet(s)
        })),
        progression: ex.recommendation
      };
    });

    try {
      confetti({ particleCount: 120, spread: 80, origin: { y: 0.6 } });
      soundService.playPrFanfare();
      soundService.haptic('pr', settings.vibrationEnabled);
    } catch {
      //
    }

    onFinishWorkout({
      id: 'w-' + Date.now(),
      templateId,
      templateName: workoutName,
      readiness,
      cycleWeek,
      cyclePhase,
      startTime,
      endTime,
      durationMinutes: duration,
      totalVolumeKg: Math.round(totalVolume),
      totalSets: totalSetsCount,
      totalCardioSeconds,
      exercises: completedExercises
    });
  };

  const progress = workoutProgress(exercises);
  const autoFocus = findFocusTarget(exercises);
  const focusTarget =
    forcedFocus &&
    exercises[forcedFocus.exIdx]?.sets[forcedFocus.setIdx] &&
    !exercises[forcedFocus.exIdx].sets[forcedFocus.setIdx].completed
      ? forcedFocus
      : autoFocus;
  const currentExIdx = focusTarget?.exIdx ?? expandedExIdx;

  useEffect(() => {
    if (forcedFocus) {
      const set = exercises[forcedFocus.exIdx]?.sets[forcedFocus.setIdx];
      if (!set || set.completed) setForcedFocus(null);
    }
  }, [exercises, forcedFocus]);

  useEffect(() => {
    if (focusTarget) setExpandedExIdx(focusTarget.exIdx);
  }, [focusTarget?.exIdx]);

  const exercisesRef = React.useRef(exercises);
  exercisesRef.current = exercises;

  const openFocusForSet = (exIdx: number, setIdx: number) => {
    setRpeTarget(null);
    setForcedFocus({ exIdx, setIdx });
    setExpandedExIdx(exIdx);
    setFocusMode(true);
  };

  const resumeFocusAfterRest = React.useCallback(() => {
    const next = findFocusTarget(exercisesRef.current);
    if (!next) return false;
    openFocusForSet(next.exIdx, next.setIdx);
    restTimerStorage.consumePendingFocusResume();
    return true;
  }, []);

  useEffect(() => {
    onRegisterFocusResume?.(() => {
      resumeFocusAfterRest();
    });
    return () => onRegisterFocusResume?.(null);
  }, [onRegisterFocusResume, resumeFocusAfterRest]);

  useEffect(() => {
    if (!restResumeNonce) return;
    // Double rAF: wait until RestTimer unmount paints, then open focus above everything
    const id = requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        resumeFocusAfterRest();
      });
    });
    return () => cancelAnimationFrame(id);
  }, [restResumeNonce, resumeFocusAfterRest]);

  // After unlock / return to app with pending rest-done flag
  useEffect(() => {
    const tryPending = () => {
      if (document.visibilityState !== 'visible') return;
      if (!restTimerStorage.hasPendingFocusResume()) return;
      resumeFocusAfterRest();
    };
    tryPending();
    document.addEventListener('visibilitychange', tryPending);
    window.addEventListener('pageshow', tryPending);
    window.addEventListener('focus', tryPending);
    return () => {
      document.removeEventListener('visibilitychange', tryPending);
      window.removeEventListener('pageshow', tryPending);
      window.removeEventListener('focus', tryPending);
    };
  }, [resumeFocusAfterRest]);

  useEffect(() => {
    if (typeof Notification !== 'undefined' && Notification.permission === 'default') {
      Notification.requestPermission().catch(() => undefined);
    }
  }, []);

  const blocks = groupBySuperset(
    exercises.map((ex) => ({ ...ex, id: ex.exerciseId }))
  );

  let cursor = 0;
  const indexedBlocks = blocks.map(block => {
    if (block.kind === 'single') {
      const exIdx = cursor;
      cursor += 1;
      return { kind: 'single' as const, exIdx, item: exercises[exIdx] };
    }
    const start = cursor;
    const indices = block.items.map((_, i) => start + i);
    cursor += block.items.length;
    return {
      kind: 'superset' as const,
      groupId: block.groupId,
      indices,
      items: indices.map(i => exercises[i])
    };
  });

  const renderCard = (ex: ActiveExerciseSession, exIdx: number) => (
    <ActiveExerciseCard
      exercise={ex}
      expanded={expandedExIdx === exIdx}
      onToggleExpand={() => setExpandedExIdx(prev => (prev === exIdx ? -1 : exIdx))}
      historySessions={ex.historySessions}
      onOpenTechnique={() => setViewingTechniqueEx(ex)}
      onOpenSwap={() => setSwappingExIndex(exIdx)}
      onOpenPlateCalc={() => setSelectedPlateCalcWeight(ex.targetWeight)}
      onCycleSetType={(setIdx) => cycleSetType(exIdx, setIdx)}
      onCopyPrevious={(setIdx) => copyPreviousSet(exIdx, setIdx)}
      onWeightDelta={(setIdx, delta) => updateSetWeight(exIdx, setIdx, delta)}
      onRepsDelta={(setIdx, delta) => updateSetReps(exIdx, setIdx, delta)}
      onDurationDelta={(setIdx, delta) => updateSetDuration(exIdx, setIdx, delta)}
      onToggleComplete={(setIdx) => toggleSetComplete(exIdx, setIdx)}
      onStartFocus={(setIdx) => openFocusForSet(exIdx, setIdx)}
      focusSetIdx={focusMode && focusTarget?.exIdx === exIdx ? focusTarget.setIdx : null}
      onAddSet={() => addSet(exIdx)}
      onAddWarmup={() => addWarmupSet(exIdx)}
      onRemoveLastSet={() => removeSet(exIdx, ex.sets.length - 1)}
    />
  );

  return (
    <div className="min-h-screen bg-app-atmosphere pb-[calc(6.5rem+env(safe-area-inset-bottom))] text-white">
      <div className="sticky top-0 z-40 bg-ink/90 backdrop-blur-md border-b border-white/10 px-3 sm:px-4 pt-[max(0.75rem,env(safe-area-inset-top))] pb-3">
        <div className="max-w-2xl mx-auto flex items-center justify-between gap-2">
          <div className="min-w-0 flex-1 flex items-center gap-3">
            <div className="relative shrink-0">
              <WorkoutProgressRing percent={progress.percent} />
              <span className="absolute inset-0 flex items-center justify-center text-[9px] font-bold font-mono text-lime">
                {progress.percent}
              </span>
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <h1 className="font-bold text-sm sm:text-base truncate" title={workoutName}>{workoutName}</h1>
              </div>
              <div className="flex items-center gap-2 text-[11px] sm:text-xs text-muted mt-0.5">
                <span className="flex items-center gap-1 font-mono">
                  <Clock className="w-3.5 h-3.5 text-lime" /> {elapsedMinutes} мин
                </span>
                <span>•</span>
                <span className="font-mono text-lime font-bold">
                  {progress.completed}/{progress.total}
                </span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-1.5 shrink-0">
            <button
              type="button"
              onClick={() => setFocusMode(v => !v)}
              className={cn(
                'p-2.5 rounded-xl border transition min-h-[48px] min-w-[48px] flex items-center justify-center',
                focusMode ? 'bg-lime text-ink border-lime' : 'bg-white/5 text-muted border-white/10'
              )}
              title="Фокус-режим"
            >
              <Focus className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={onCancelWorkout}
              className="px-3 py-2.5 min-h-[48px] text-xs text-muted hover:text-rose-400 rounded-xl"
            >
              Отмена
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-2xl mx-auto p-3 sm:p-4 space-y-3">
        {indexedBlocks.map((block, blockIdx) => {
          if (block.kind === 'single') {
            const exIdx = block.exIdx;
            return (
              <div key={block.item.exerciseId + '-' + exIdx} className="space-y-2">
                {renderCard(block.item, exIdx)}
                {expandedExIdx === exIdx && exIdx < exercises.length - 1 && (
                  <button
                    type="button"
                    onClick={() => toggleSupersetPair(exIdx)}
                    className="w-full text-[11px] font-semibold text-sky-400 py-1.5 flex items-center justify-center gap-1"
                  >
                    <Link2 className="w-3.5 h-3.5" /> Суперсет со следующим
                  </button>
                )}
              </div>
            );
          }

          return (
            <div key={block.groupId + '-' + blockIdx} className="rounded-[1.75rem] border border-sky-400/40 bg-sky-500/5 p-2 space-y-2">
              <div className="px-2 pt-1 flex items-center justify-between">
                <span className="text-[11px] font-bold uppercase tracking-wider text-sky-400 flex items-center gap-1">
                  <Link2 className="w-3.5 h-3.5" /> Суперсет
                </span>
                <button type="button" onClick={() => toggleSupersetPair(block.indices[0])} className="text-[10px] text-muted">
                  Развязать
                </button>
              </div>
              {block.indices.map(exIdx => renderCard(exercises[exIdx], exIdx))}
            </div>
          );
        })}

        <button
          type="button"
          onClick={() => setIsAddingExercise(true)}
          className="w-full py-4 min-h-[52px] border border-dashed border-white/15 hover:border-lime/50 rounded-3xl text-xs font-bold text-muted hover:text-lime transition flex items-center justify-center gap-2"
        >
          <Plus className="w-4 h-4" /> Добавить упражнение
        </button>
      </div>

      {/* Sticky bottom CTAs — Navigation hidden during active workout; pad for safe-area only */}
      <div className="fixed inset-x-0 bottom-0 z-40 border-t border-white/10 bg-ink/95 backdrop-blur-xl px-3 pt-2.5 pb-[max(0.75rem,env(safe-area-inset-bottom))]">
        <div className="max-w-2xl mx-auto flex items-center gap-2">
          {focusTarget && (
            <button
              type="button"
              onClick={() => openFocusForSet(focusTarget.exIdx, focusTarget.setIdx)}
              className="flex-1 min-h-[52px] btn-lime rounded-2xl text-sm flex items-center justify-center gap-2"
            >
              <Focus className="w-4 h-4" /> Начать сет
            </button>
          )}
          <button
            type="button"
            onClick={handleFinish}
            className={cn(
              'min-h-[52px] rounded-2xl text-sm font-bold flex items-center justify-center gap-1.5 px-4 border',
              focusTarget
                ? 'bg-white/5 text-white border-white/15'
                : 'flex-1 btn-lime border-lime'
            )}
          >
            <CheckCircle2 className="w-4 h-4" /> Завершить
          </button>
        </div>
      </div>

      {focusMode && focusTarget && (
        <FocusSetOverlay
          key={`${focusTarget.exIdx}:${exercises[focusTarget.exIdx].sets[focusTarget.setIdx].id}`}
          exerciseNumber={focusTarget.exIdx + 1}
          exerciseCount={exercises.length}
          showIntroduction={focusTarget.exIdx > 0 && !introducedExercises.has(`${focusTarget.exIdx}:${exercises[focusTarget.exIdx].exerciseId}`)}
          onConfirmIntroduction={() => setIntroducedExercises(previous => new Set(previous).add(`${focusTarget.exIdx}:${exercises[focusTarget.exIdx].exerciseId}`))}
          exercise={exercises[focusTarget.exIdx]}
          set={exercises[focusTarget.exIdx].sets[focusTarget.setIdx]}
          setIndex={focusTarget.setIdx}
          onClose={() => setFocusMode(false)}
          onWeightDelta={(delta) => updateSetWeight(focusTarget.exIdx, focusTarget.setIdx, delta)}
          onRepsDelta={(delta) => updateSetReps(focusTarget.exIdx, focusTarget.setIdx, delta)}
          onDurationDelta={(delta) => updateSetDuration(focusTarget.exIdx, focusTarget.setIdx, delta)}
          onComplete={() => {
            toggleSetComplete(focusTarget.exIdx, focusTarget.setIdx);
            setFocusMode(false);
            setForcedFocus(null);
          }}
        />
      )}

      {rpeTarget && (
        <RpePickerModal
          isOpen={true}
          initialRpe={exercises[rpeTarget.exIdx].sets[rpeTarget.setIdx].rpe || 8}
          exerciseName={exercises[rpeTarget.exIdx].name}
          setLabel={`Сет ${exercises[rpeTarget.exIdx].sets[rpeTarget.setIdx].setNumber || rpeTarget.setIdx + 1}`}
          vibrationEnabled={settings.vibrationEnabled}
          onConfirm={(rpe) => {
            completeSetWithRpe(rpeTarget.exIdx, rpeTarget.setIdx, rpe);
            setRpeTarget(null);
          }}
          onSkip={() => {
            completeSetWithRpe(rpeTarget.exIdx, rpeTarget.setIdx);
            setRpeTarget(null);
          }}
        />
      )}

      <Suspense fallback={null}>
        {viewingTechniqueEx && (
          <ExerciseTechniqueModal
            exerciseId={viewingTechniqueEx.exerciseId}
            exerciseName={viewingTechniqueEx.name}
            category={viewingTechniqueEx.category}
            equipment={viewingTechniqueEx.equipment}
            animationType={viewingTechniqueEx.animationType || 'bench-press'}
            gifUrl={viewingTechniqueEx.gifUrl}
            technique={viewingTechniqueEx.technique}
            isOpen={true}
            onClose={() => setViewingTechniqueEx(null)}
            onOpenSwapModal={() => {
              const idx = exercises.findIndex(e => e.exerciseId === viewingTechniqueEx.exerciseId);
              if (idx !== -1) setSwappingExIndex(idx);
            }}
          />
        )}

        {swappingExIndex !== null && exercises[swappingExIndex] && (
          <ExerciseSwapModal
            currentExercise={{
              id: exercises[swappingExIndex].exerciseId,
              name: exercises[swappingExIndex].name,
              category: exercises[swappingExIndex].category,
              equipment: exercises[swappingExIndex].equipment,
              alternatives: exercises[swappingExIndex].alternatives
            }}
            isOpen={true}
            onClose={() => setSwappingExIndex(null)}
            onSelectAlternative={handleSwapExercise}
          />
        )}

        {isAddingExercise && (
          <ExerciseSwapModal
            currentExercise={{
              id: '',
              name: 'Новое упражнение',
              category: 'Chest',
              alternatives: []
            }}
            isOpen={true}
            onClose={() => setIsAddingExercise(false)}
            onSelectAlternative={handleAddNewExercise}
          />
        )}

        {selectedPlateCalcWeight !== null && (
          <PlateCalculatorModal
            initialWeight={selectedPlateCalcWeight}
            isOpen={true}
            onClose={() => setSelectedPlateCalcWeight(null)}
          />
        )}
      </Suspense>
    </div>
  );
};
