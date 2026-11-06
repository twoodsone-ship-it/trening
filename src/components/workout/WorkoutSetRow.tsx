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
  const previousLabel = !previousSet
    ? '—'
    : isTimed
      ? `${Math.floor((previousSet.durationSeconds || 0) / 60).toString().padStart(2, '0')}:${((previousSet.durationSeconds || 0) % 60).toString().padStart(2, '0')}`
      : `${previousSet.weight} × ${previousSet.reps}`;

  const handleComplete = () => {
    if (!set.completed && onStartFocus && !isFocusTarget) {
      onStartFocus();
      return;
    }
    onToggleComplete();
  };

  return (
    <div
      className={cn(
        'p-2 rounded-xl border transition-colors',
        set.completed
          ? 'bg-lime/[0.08] border-lime/40'
          : isFocusTarget
            ? 'bg-lime/[0.05] border-lime/50 ring-1 ring-lime/25'
            : 'bg-white/[0.025] border-white/10'
      )}
    >
      <div className="grid grid-cols-[48px_minmax(0,1fr)_48px] gap-2 items-center">
        <button
          type="button"
          onClick={onCycleType}
          aria-label={`Тип подхода: ${setTypeLabel(set)}. Нажми, чтобы изменить`}
          className={cn(
            'w-12 h-12 min-h-[48px] rounded-lg flex items-center justify-center font-mono font-bold text-[11px] border active:scale-95 transition',
            isWarmup
              ? 'bg-amber-500/15 text-amber-300 border-amber-500/30'
              : set.type === 'failure'
                ? 'bg-rose-500/15 text-rose-300 border-rose-500/30'
                : set.type === 'dropset'
                  ? 'bg-violet-500/15 text-violet-300 border-violet-500/30'
                  : 'bg-white/[0.04] text-white/80 border-white/10'
          )}
        >
          {setTypeLabel(set)}
        </button>

        <button
          type="button"
          onClick={previousSet ? onCopyPrevious : undefined}
          disabled={!previousSet}
          className={cn(
            'min-w-0 min-h-[48px] px-2 rounded-lg flex items-center justify-between gap-2 text-left transition',
            previousSet ? 'text-white/80 hover:bg-white/[0.04]' : 'text-white/30'
          )}
          title={previousSet ? 'Скопировать прошлый подход' : undefined}
        >
          <span className="text-[10px] text-muted">Прошлый</span>
          <span className="font-mono text-xs font-bold truncate">{previousLabel}</span>
        </button>

        <button
          type="button"
          onClick={handleComplete}
          className={cn(
            'w-12 h-12 min-h-[48px] min-w-[48px] rounded-lg flex items-center justify-center transition active:scale-95',
            set.completed ? 'bg-lime text-ink' : 'bg-white/[0.05] text-muted border border-white/10 hover:border-lime/40 hover:text-lime'
          )}
          aria-label={set.completed ? 'Снять отметку с подхода' : `Открыть подход ${set.setNumber}`}
        >
          <Check className={cn('w-5 h-5', set.completed && 'stroke-[3]')} />
        </button>
      </div>

      <div className="grid grid-cols-2 gap-2 mt-2">
        {hasWeight ? (
          <InlineStepper label="Вес · кг" value={set.weight} onMinus={() => onWeightDelta(-weightStep)} onPlus={() => onWeightDelta(weightStep)} />
        ) : (
          <div className="min-h-[52px] rounded-lg border border-white/[0.07] bg-black/15 flex items-center justify-between px-3">
            <span className="text-[10px] font-semibold uppercase tracking-wider text-muted">Вес</span>
            <span className="text-xs text-white/50">Без веса</span>
          </div>
        )}
        {isTimed ? (
          <InlineStepper label="Время" value={durationLabel} onMinus={() => onDurationDelta(-15)} onPlus={() => onDurationDelta(15)} />
        ) : (
          <InlineStepper label="Повторы" value={set.reps} onMinus={() => onRepsDelta(-1)} onPlus={() => onRepsDelta(1)} />
        )}
      </div>
    </div>
  );
};

function InlineStepper({
  label,
  value,
  onMinus,
  onPlus
}: {
  label: string;
  value: number | string;
  onMinus: () => void;
  onPlus: () => void;
}) {
  return (
    <div className="min-w-0 min-h-[52px] rounded-lg border border-white/[0.07] bg-black/20 px-1 flex items-center justify-between gap-1">
      <button type="button" onClick={onMinus} className="w-12 h-12 min-w-[48px] min-h-[48px] flex items-center justify-center rounded-lg bg-white/[0.04] hover:bg-white/[0.08] active:scale-95 transition" aria-label={`Уменьшить: ${label}`}>
        <Minus className="w-4 h-4" />
      </button>
      <span className="min-w-0 flex-1 text-center">
        <span className="block text-[9px] font-semibold uppercase tracking-wider text-muted truncate">{label}</span>
        <span className="block font-mono font-bold text-sm tabular-nums text-white truncate">{value}</span>
      </span>
      <button type="button" onClick={onPlus} className="w-12 h-12 min-w-[48px] min-h-[48px] flex items-center justify-center rounded-lg bg-white/[0.04] hover:bg-white/[0.08] active:scale-95 transition" aria-label={`Увеличить: ${label}`}>
        <Plus className="w-4 h-4" />
      </button>
    </div>
  );
}
