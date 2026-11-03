import React from 'react';
import { Check, Minus, Plus } from 'lucide-react';
import type { SetHistoryEntry, WorkoutSet } from '../../types';
import { cn } from '../../utils/cn';
import { setTypeLabel } from '../../utils/workoutHelpers';

interface WorkoutSetRowProps {
  set: WorkoutSet;
  previousSet?: SetHistoryEntry;
  weightStep: number;
  onCycleType: () => void;
  onCopyPrevious: () => void;
  onWeightDelta: (delta: number) => void;
  onRepsDelta: (delta: number) => void;
  onToggleComplete: () => void;
}

export const WorkoutSetRow: React.FC<WorkoutSetRowProps> = ({
  set,
  previousSet,
  weightStep,
  onCycleType,
  onCopyPrevious,
  onWeightDelta,
  onRepsDelta,
  onToggleComplete
}) => {
  const isWarmup = set.type === 'warmup' || set.isWarmup;

  return (
    <div
      className={cn(
        'grid grid-cols-[28px_56px_1fr_1fr_44px] gap-1.5 items-center p-1.5 rounded-2xl border transition',
        set.completed
          ? 'bg-lime/10 border-lime/40'
          : 'bg-white/[0.03] border-white/10'
      )}
    >
      <div className="flex justify-center">
        <button
          type="button"
          onClick={onCycleType}
          className={cn(
            'w-8 h-8 rounded-xl flex items-center justify-center font-mono font-bold text-xs border',
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
          'text-center text-[11px] font-mono truncate rounded-lg py-1',
          previousSet ? 'text-muted hover:text-lime' : 'text-white/25'
        )}
      >
        {previousSet ? `${previousSet.weight}×${previousSet.reps}` : '—'}
      </button>

      <div className="flex items-center justify-between bg-ink border border-white/10 rounded-xl p-0.5">
        <button onClick={() => onWeightDelta(-weightStep)} className="w-8 h-8 flex items-center justify-center bg-white/5 rounded-lg" aria-label="− вес">
          <Minus className="w-3 h-3" />
        </button>
        <span className="font-mono font-bold text-sm text-white px-0.5">{set.weight}</span>
        <button onClick={() => onWeightDelta(+weightStep)} className="w-8 h-8 flex items-center justify-center bg-white/5 rounded-lg" aria-label="+ вес">
          <Plus className="w-3 h-3" />
        </button>
      </div>

      <div className="flex items-center justify-between bg-ink border border-white/10 rounded-xl p-0.5">
        <button onClick={() => onRepsDelta(-1)} className="w-8 h-8 flex items-center justify-center bg-white/5 rounded-lg" aria-label="− повт">
          <Minus className="w-3 h-3" />
        </button>
        <span className="font-mono font-bold text-sm text-white px-0.5">{set.reps}</span>
        <button onClick={() => onRepsDelta(+1)} className="w-8 h-8 flex items-center justify-center bg-white/5 rounded-lg" aria-label="+ повт">
          <Plus className="w-3 h-3" />
        </button>
      </div>

      <div className="flex justify-center">
        <button
          onClick={onToggleComplete}
          className={cn(
            'w-10 h-10 rounded-xl flex items-center justify-center transition active:scale-90',
            set.completed ? 'bg-lime text-ink' : 'bg-white/5 text-muted border border-white/10'
          )}
          aria-label="Готово"
        >
          <Check className={cn('w-5 h-5', set.completed && 'stroke-[3]')} />
        </button>
      </div>
    </div>
  );
};
