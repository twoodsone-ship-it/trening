import React from 'react';
import { Check, Minus, Plus, X } from 'lucide-react';
import type { ActiveExerciseSession, WorkoutSet } from '../types';
import { cn } from '../utils/cn';

interface FocusSetOverlayProps {
  exercise: ActiveExerciseSession;
  set: WorkoutSet;
  setIndex: number;
  onClose: () => void;
  onWeightDelta: (delta: number) => void;
  onRepsDelta: (delta: number) => void;
  onComplete: () => void;
}

export const FocusSetOverlay: React.FC<FocusSetOverlayProps> = ({
  exercise,
  set,
  setIndex,
  onClose,
  onWeightDelta,
  onRepsDelta,
  onComplete
}) => {
  const prev = exercise.previousPerformance?.sets[setIndex];

  return (
    <div className="fixed inset-0 z-[55] bg-app-atmosphere flex flex-col animate-fade-in">
      <div className="flex items-center justify-between px-4 pt-[max(1rem,env(safe-area-inset-top))] pb-2">
        <button
          type="button"
          onClick={onClose}
          className="p-2.5 rounded-xl bg-white/80 dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 min-h-[44px] min-w-[44px] flex items-center justify-center"
          aria-label="Закрыть фокус-режим"
        >
          <X className="w-5 h-5" />
        </button>
        <span className="text-xs font-bold uppercase tracking-wider text-muted">Фокус-сет</span>
        <div className="w-11" />
      </div>

      <div className="flex-1 flex flex-col items-center justify-center px-6 gap-6 pb-8">
        <div className="text-center space-y-1">
          <p className="text-xs font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
            {exercise.category} · сет {set.setNumber || setIndex + 1}
          </p>
          <h2 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white leading-tight">
            {exercise.name}
          </h2>
          {prev && (
            <p className="text-sm text-muted font-mono">Прошлый: {prev.weight}×{prev.reps}</p>
          )}
        </div>

        <div className="w-full max-w-sm space-y-4">
          <FocusStepper
            label="Вес, кг"
            value={set.weight}
            onMinus={() => onWeightDelta(-exercise.weightStep)}
            onPlus={() => onWeightDelta(+exercise.weightStep)}
          />
          <FocusStepper
            label="Повторения"
            value={set.reps}
            onMinus={() => onRepsDelta(-1)}
            onPlus={() => onRepsDelta(+1)}
          />
        </div>

        <button
          type="button"
          onClick={onComplete}
          className={cn(
            'w-full max-w-sm py-5 rounded-3xl font-black text-lg flex items-center justify-center gap-2 min-h-[64px] active:scale-95 transition shadow-xl',
            set.completed
              ? 'bg-slate-200 dark:bg-zinc-800 text-slate-600 dark:text-zinc-300'
              : 'bg-emerald-500 text-black shadow-emerald-500/30 animate-pulse-ring'
          )}
        >
          <Check className="w-6 h-6" />
          {set.completed ? 'Сет отмечен' : 'Готово'}
        </button>
      </div>
    </div>
  );
};

function FocusStepper({
  label,
  value,
  onMinus,
  onPlus
}: {
  label: string;
  value: number;
  onMinus: () => void;
  onPlus: () => void;
}) {
  return (
    <div className="surface-card p-3 flex items-center justify-between gap-3">
      <button
        type="button"
        onClick={onMinus}
        className="w-14 h-14 rounded-2xl bg-slate-100 dark:bg-zinc-800 flex items-center justify-center active:scale-90 transition"
        aria-label={`Уменьшить ${label}`}
      >
        <Minus className="w-6 h-6" />
      </button>
      <div className="text-center">
        <p className="text-[11px] font-bold uppercase tracking-wider text-muted">{label}</p>
        <p className="font-mono text-4xl font-black text-slate-900 dark:text-white">{value}</p>
      </div>
      <button
        type="button"
        onClick={onPlus}
        className="w-14 h-14 rounded-2xl bg-slate-100 dark:bg-zinc-800 flex items-center justify-center active:scale-90 transition"
        aria-label={`Увеличить ${label}`}
      >
        <Plus className="w-6 h-6" />
      </button>
    </div>
  );
}
