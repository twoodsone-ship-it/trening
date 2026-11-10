import React, { useState } from 'react';
import { Check, Minus, Plus, Play, Pencil } from 'lucide-react';
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
  const [editing, setEditing] = useState(false);
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
    <div className={cn('border-b border-white/10 py-1', set.completed && 'opacity-65')}>
      <div className="grid grid-cols-[48px_minmax(0,1fr)_48px] gap-2 items-center">
        <button type="button" onClick={onCycleType} aria-label={`Тип подхода: ${setTypeLabel(set)}. Изменить`} className={cn('w-12 h-12 rounded-lg font-mono font-bold text-sm', isWarmup ? 'text-amber-300 bg-amber-500/10' : 'text-muted bg-white/[0.03]')}>
          {isWarmup ? 'Проба' : setTypeLabel(set)}
        </button>
        <button type="button" onClick={() => setEditing(v => !v)} aria-expanded={editing} aria-label="Изменить вес и повторения" className="min-w-0 min-h-[56px] text-left py-2">
          <span className="flex items-center gap-2 font-mono text-base font-bold tabular-nums break-words">
            {isTimed ? durationLabel : `${hasWeight ? `${set.weight} кг × ` : ''}${set.reps} повт.`}
            {set.autoAdjusted && !set.completed && (
              <span className="text-[10px] px-1.5 py-0.5 rounded bg-lime/10 text-lime font-mono font-bold tracking-tight">авто</span>
            )}
            <Pencil className="w-3 h-3 text-muted shrink-0" />
          </span>
          {previousSet && <span className="block text-xs text-muted mt-0.5">Прошлый: {previousLabel}</span>}
        </button>
        <button type="button" onClick={handleComplete} className={cn('w-12 h-12 rounded-xl flex items-center justify-center', set.completed ? 'bg-lime/15 text-lime' : 'bg-white/5 text-lime')} aria-label={set.completed ? 'Снять отметку с подхода' : isWarmup ? 'Начать пробный подход' : `Начать подход ${set.setNumber}`}>
          {set.completed ? <Check className="w-5 h-5" /> : <Play className="w-5 h-5" />}
        </button>
      </div>
      {editing && <div className="space-y-2 pb-3 pt-1">
        {hasWeight && <InlineStepper label="Вес · кг" value={set.weight} onMinus={() => onWeightDelta(-weightStep)} onPlus={() => onWeightDelta(weightStep)} />}
        {isTimed ? <InlineStepper label="Время" value={durationLabel} onMinus={() => onDurationDelta(-15)} onPlus={() => onDurationDelta(15)} /> : <InlineStepper label="Повторы" value={set.reps} onMinus={() => onRepsDelta(-1)} onPlus={() => onRepsDelta(1)} />}
        {previousSet && <button type="button" onClick={onCopyPrevious} className="min-h-[44px] w-full text-xs text-muted">Повторить прошлый результат</button>}
      </div>}
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
        <span className="block text-xs font-semibold uppercase tracking-wider text-muted truncate">{label}</span>
        <span className="block font-mono font-bold text-sm tabular-nums text-white truncate">{value}</span>
      </span>
      <button type="button" onClick={onPlus} className="w-12 h-12 min-w-[48px] min-h-[48px] flex items-center justify-center rounded-lg bg-white/[0.04] hover:bg-white/[0.08] active:scale-95 transition" aria-label={`Увеличить: ${label}`}>
        <Plus className="w-4 h-4" />
      </button>
    </div>
  );
}
