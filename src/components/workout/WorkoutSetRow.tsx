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
        'grid grid-cols-[28px_56px_1fr_1fr_44px] gap-1.5 items-center p-1 sm:p-1.5 rounded-2xl border transition',
        set.completed
          ? 'bg-emerald-50/80 dark:bg-emerald-950/20 border-emerald-400 dark:border-emerald-500/40'
          : 'bg-slate-50/80 dark:bg-zinc-950/60 border-slate-200 dark:border-zinc-800/80'
      )}
    >
      <div className="flex justify-center">
        <button
          type="button"
          onClick={onCycleType}
          title="Нажмите для смены типа: Рабочий / Разминка (Р) / Отказ (О) / Дропсет (Д)"
          className={cn(
            'w-7 h-7 sm:w-8 sm:h-8 rounded-xl flex items-center justify-center font-mono font-bold text-xs transition active:scale-95 shadow-2xs border',
            isWarmup
              ? 'bg-amber-500/15 text-amber-600 dark:text-amber-400 border-amber-500/30'
              : set.type === 'failure'
              ? 'bg-rose-500/15 text-rose-600 dark:text-rose-400 border-rose-500/30'
              : set.type === 'dropset'
              ? 'bg-purple-500/15 text-purple-600 dark:text-purple-400 border-purple-500/30'
              : 'bg-slate-100 dark:bg-zinc-800 text-slate-700 dark:text-zinc-300 border-slate-200 dark:border-zinc-700'
          )}
        >
          {setTypeLabel(set)}
        </button>
      </div>

      <button
        type="button"
        onClick={previousSet ? onCopyPrevious : undefined}
        disabled={!previousSet}
        title={previousSet ? `Скопировать ${previousSet.weight}×${previousSet.reps}` : 'Нет данных'}
        className={cn(
          'text-center text-[11px] font-mono truncate rounded-lg py-1 transition',
          previousSet
            ? 'text-slate-500 dark:text-zinc-400 hover:text-emerald-600 dark:hover:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-950/40 active:scale-95'
            : 'text-slate-400 dark:text-zinc-600 cursor-default'
        )}
      >
        {previousSet ? `${previousSet.weight}×${previousSet.reps}` : '—'}
      </button>

      <div className="flex items-center justify-between bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-xl p-0.5 shadow-2xs">
        <button
          onClick={() => onWeightDelta(-weightStep)}
          className="w-7 h-7 sm:w-8 sm:h-8 flex items-center justify-center bg-slate-100 dark:bg-zinc-800 hover:bg-slate-200 text-slate-700 dark:text-zinc-300 rounded-lg text-xs active:scale-90 transition shrink-0"
          aria-label="Уменьшить вес"
        >
          <Minus className="w-3 h-3" />
        </button>
        <span className="font-mono font-bold text-xs sm:text-sm text-slate-900 dark:text-white px-0.5 text-center min-w-0 truncate">
          {set.weight}
        </span>
        <button
          onClick={() => onWeightDelta(+weightStep)}
          className="w-7 h-7 sm:w-8 sm:h-8 flex items-center justify-center bg-slate-100 dark:bg-zinc-800 hover:bg-slate-200 text-slate-700 dark:text-zinc-300 rounded-lg text-xs active:scale-90 transition shrink-0"
          aria-label="Увеличить вес"
        >
          <Plus className="w-3 h-3" />
        </button>
      </div>

      <div className="flex items-center justify-between bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-xl p-0.5 shadow-2xs">
        <button
          onClick={() => onRepsDelta(-1)}
          className="w-7 h-7 sm:w-8 sm:h-8 flex items-center justify-center bg-slate-100 dark:bg-zinc-800 hover:bg-slate-200 text-slate-700 dark:text-zinc-300 rounded-lg text-xs active:scale-90 transition shrink-0"
          aria-label="Уменьшить повторения"
        >
          <Minus className="w-3 h-3" />
        </button>
        <span className="font-mono font-bold text-xs sm:text-sm text-slate-900 dark:text-white px-0.5 text-center min-w-0 truncate">
          {set.reps}
        </span>
        <button
          onClick={() => onRepsDelta(+1)}
          className="w-7 h-7 sm:w-8 sm:h-8 flex items-center justify-center bg-slate-100 dark:bg-zinc-800 hover:bg-slate-200 text-slate-700 dark:text-zinc-300 rounded-lg text-xs active:scale-90 transition shrink-0"
          aria-label="Увеличить повторения"
        >
          <Plus className="w-3 h-3" />
        </button>
      </div>

      <div className="flex justify-center">
        <button
          onClick={onToggleComplete}
          className={cn(
            'w-9 h-9 sm:w-10 sm:h-10 rounded-xl flex items-center justify-center transition active:scale-90 shadow-sm',
            set.completed
              ? 'bg-emerald-500 text-white shadow-emerald-500/30'
              : 'bg-white dark:bg-zinc-800 hover:bg-slate-100 dark:hover:bg-zinc-700 text-slate-400 dark:text-zinc-400 border border-slate-200 dark:border-zinc-700'
          )}
          aria-label="Отметить подход выполненным"
        >
          <Check className={cn('w-4 h-4 sm:w-5 sm:h-5', set.completed && 'stroke-[3]')} />
        </button>
      </div>
    </div>
  );
};
