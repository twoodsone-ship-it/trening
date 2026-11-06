import React from 'react';
import { Check, Minus, Plus } from 'lucide-react';
import type { SetHistoryEntry, WorkoutSet } from '../../types';
import { cn } from '../../utils/cn';
import { setTypeLabel } from '../../utils/workoutHelpers';

interface WorkoutSetRowProps {
  set: WorkoutSet;
  previousSet?: SetHistoryEntry;
  weightStep: number;
  trackingMode: 'reps' | 'duration' | 'distance';
  onCycleType: () => void;
  onCopyPrevious: () => void;
  onWeightDelta: (delta: number) => void;
  onRepsDelta: (delta: number) => void;
  onDurationDelta: (deltaSeconds: number) => void;
  onToggleComplete: () => void;
  onStartFocus?: () => void;
  isFocusTarget?: boolean;
}

export const WorkoutSetRow: React.FC<WorkoutSetRowProps> = ({
  set,
  previousSet,
  weightStep,
  trackingMode,
  onCycleType,
  onCopyPrevious,
  onWeightDelta,
  onRepsDelta,
  onDurationDelta,
  onToggleComplete,
  onStartFocus,
  isFocusTarget
}) => {
  const isWarmup = set.type === 'warmup' || set.isWarmup;
  const isTimed = trackingMode === 'duration';
  const hasWeight = !isTimed && weightStep > 0;
  const duration = set.durationSeconds || 0;
  const durationLabel = `${Math.floor(duration / 60).toString().padStart(2, '0')}:${(duration % 60).toString().padStart(2, '0')}`;

  return (
    <div
      className={cn(
        'grid grid-cols-[36px_64px_1fr_1fr_48px] gap-1.5 items-center p-1.5 rounded-2xl border transition',
        set.completed
          ? 'bg-lime/10 border-lime/40'
          : isFocusTarget
          ? 'bg-lime/5 border-lime/50 ring-1 ring-lime/30'
          : 'bg-white/[0.03] border-white/10'
      )}
    >
      <div className="flex justify-center">
        <button
          type="button"
          onClick={onCycleType}
          className={cn(
            'w-9 h-9 min-h-[36px] rounded-xl flex items-center justify-center font-mono font-bold text-xs border',
            isWarmup
              ? 'bg-amber-500/15 text-amber-400 border-amber-500/30'
              : set.type === 'failure'
              ? 'bg-rose-500/15 text-rose-400 border-rose-500/30'
              : set.type === 'dropset'
              ? 'bg-violet-500/15 text-violet-300 border-violet-500/30'
              : 'bg-white/5 text-white/80 border-white/10'
          )}
        >
          {setTypeLabel(set)}
        </button>
      </div>

      <button
        type="button"
        onClick={previousSet ? onCopyPrevious : undefined}
        disabled={!previousSet}
        className={cn(
          'text-center text-[11px] font-mono truncate rounded-xl py-2 min-h-[40px]',
          previousSet ? 'text-muted hover:text-lime hover:bg-lime/5' : 'text-white/25'
        )}
        title={previousSet ? 'Скопировать прошлый сет' : undefined}
      >
        {previousSet ? isTimed ? `${Math.floor((previousSet.durationSeconds || 0) / 60).toString().padStart(2, '0')}:${((previousSet.durationSeconds || 0) % 60).toString().padStart(2, '0')}` : `${previousSet.weight}×${previousSet.reps}` : '—'}
      </button>

      {hasWeight ? <div className="flex items-center justify-between bg-ink border border-white/10 rounded-xl p-0.5">
        <button
          type="button"
          onClick={() => onWeightDelta(-weightStep)}
          className="w-10 h-10 min-h-[40px] flex items-center justify-center bg-white/5 rounded-lg"
          aria-label="− вес"
        >
          <Minus className="w-4 h-4" />
        </button>
        <span className="font-mono font-bold text-sm text-white px-0.5">{set.weight}</span>
        <button
          type="button"
          onClick={() => onWeightDelta(+weightStep)}
          className="w-10 h-10 min-h-[40px] flex items-center justify-center bg-white/5 rounded-lg"
          aria-label="+ вес"
        >
          <Plus className="w-4 h-4" />
        </button>
      </div> : <div className="text-center text-muted">—</div>}

      {!isTimed ? <div className="flex items-center justify-between bg-ink border border-white/10 rounded-xl p-0.5">
        <button
          type="button"
          onClick={() => onRepsDelta(-1)}
          className="w-10 h-10 min-h-[40px] flex items-center justify-center bg-white/5 rounded-lg"
          aria-label="− повт"
        >
          <Minus className="w-4 h-4" />
        </button>
        <span className="font-mono font-bold text-sm text-white px-0.5">{set.reps}</span>
        <button
          type="button"
          onClick={() => onRepsDelta(+1)}
          className="w-10 h-10 min-h-[40px] flex items-center justify-center bg-white/5 rounded-lg"
          aria-label="+ повт"
        >
          <Plus className="w-4 h-4" />
        </button>
      </div> : <div className="flex items-center justify-between bg-ink border border-white/10 rounded-xl p-0.5">
        <button type="button" onClick={() => onDurationDelta(-15)} className="w-10 h-10 min-h-[40px] flex items-center justify-center bg-white/5 rounded-lg" aria-label="Уменьшить время"><Minus className="w-4 h-4" /></button>
        <span className="font-mono font-bold text-sm text-white px-0.5">{durationLabel}</span>
        <button type="button" onClick={() => onDurationDelta(15)} className="w-10 h-10 min-h-[40px] flex items-center justify-center bg-white/5 rounded-lg" aria-label="Увеличить время"><Plus className="w-4 h-4" /></button>
      </div>}

      <div className="flex justify-center">
        <button
          type="button"
          onClick={() => {
            if (!set.completed && onStartFocus && !isFocusTarget) {
              onStartFocus();
              return;
            }
            onToggleComplete();
          }}
          className={cn(
            'w-12 h-12 min-h-[48px] min-w-[48px] rounded-xl flex items-center justify-center transition active:scale-90',
            set.completed ? 'bg-lime text-ink' : 'bg-white/5 text-muted border border-white/10'
          )}
          aria-label={set.completed ? 'Снять отметку' : 'Начать / готово'}
        >
          <Check className={cn('w-5 h-5', set.completed && 'stroke-[3]')} />
        </button>
      </div>
    </div>
  );
};
