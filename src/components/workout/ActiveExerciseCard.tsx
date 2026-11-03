import React from 'react';
import { Calculator, Plus, RefreshCw, Sparkles, Trash2 } from 'lucide-react';
import type { ActiveExerciseSession, SetHistoryEntry } from '../../types';
import { cn } from '../../utils/cn';
import { WorkoutSetRow } from './WorkoutSetRow';

interface ActiveExerciseCardProps {
  exercise: ActiveExerciseSession;
  onOpenTechnique: () => void;
  onOpenSwap: () => void;
  onOpenPlateCalc: () => void;
  onCycleSetType: (setIdx: number) => void;
  onCopyPrevious: (setIdx: number) => void;
  onWeightDelta: (setIdx: number, delta: number) => void;
  onRepsDelta: (setIdx: number, delta: number) => void;
  onToggleComplete: (setIdx: number) => void;
  onAddSet: () => void;
  onAddWarmup: () => void;
  onRemoveLastSet: () => void;
}

const badgeStyles: Record<string, string> = {
  emerald: 'bg-emerald-50 dark:bg-emerald-950/30 border-emerald-200 dark:border-emerald-500/40 text-emerald-900 dark:text-emerald-200',
  amber: 'bg-amber-50 dark:bg-amber-950/30 border-amber-200 dark:border-amber-500/40 text-amber-900 dark:text-amber-200',
  purple: 'bg-violet-50 dark:bg-violet-950/30 border-violet-200 dark:border-violet-500/40 text-violet-900 dark:text-violet-200',
  red: 'bg-rose-50 dark:bg-rose-950/30 border-rose-200 dark:border-rose-500/40 text-rose-900 dark:text-rose-200',
  blue: 'bg-slate-50 dark:bg-zinc-950/80 border-slate-200 dark:border-zinc-800 text-slate-700 dark:text-zinc-300'
};

export const ActiveExerciseCard: React.FC<ActiveExerciseCardProps> = ({
  exercise: ex,
  onOpenTechnique,
  onOpenSwap,
  onOpenPlateCalc,
  onCycleSetType,
  onCopyPrevious,
  onWeightDelta,
  onRepsDelta,
  onToggleComplete,
  onAddSet,
  onAddWarmup,
  onRemoveLastSet
}) => {
  const completedCount = ex.sets.filter(s => s.completed).length;
  const badgeClass = badgeStyles[ex.recommendation.badgeColor] || badgeStyles.blue;

  return (
    <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-3xl p-3.5 sm:p-5 shadow-sm dark:shadow-xl transition">
      <div className="flex items-start justify-between gap-2 pb-3 border-b border-slate-100 dark:border-zinc-800/80">
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-700 dark:text-emerald-400 bg-emerald-100 dark:bg-emerald-950/60 border border-emerald-300 dark:border-emerald-800/40 px-2 py-0.5 rounded-full">
              {ex.category}
            </span>
            <span className="text-xs text-slate-500 dark:text-zinc-400 font-mono">
              {completedCount}/{ex.sets.length}
            </span>
          </div>
          <h2 className="font-bold text-sm sm:text-lg text-slate-900 dark:text-white mt-1 leading-snug">{ex.name}</h2>
        </div>

        <div className="flex items-center gap-1.5 shrink-0">
          <button
            onClick={onOpenTechnique}
            title="Техника и анимация"
            className="p-2 text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-zinc-800 hover:bg-emerald-100 dark:hover:bg-zinc-700 border border-emerald-200 dark:border-zinc-700 rounded-xl transition flex items-center gap-1 text-xs font-semibold"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Техника</span>
          </button>
          <button
            onClick={onOpenSwap}
            title="Заменить упражнение (тренажер занят / нет в зале)"
            className="p-2 text-blue-700 dark:text-blue-400 bg-blue-50 dark:bg-zinc-800 hover:bg-blue-100 dark:hover:bg-zinc-700 border border-blue-200 dark:border-zinc-700 rounded-xl transition flex items-center gap-1 text-xs font-semibold"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Замена</span>
          </button>
          <button
            onClick={onOpenPlateCalc}
            title="Калькулятор блинов"
            className="p-2 text-slate-600 dark:text-zinc-400 hover:text-emerald-600 dark:hover:text-emerald-400 bg-slate-100 dark:bg-zinc-800 hover:bg-slate-200 border border-slate-200 dark:border-zinc-700 rounded-xl transition"
          >
            <Calculator className="w-4 h-4" />
          </button>
        </div>
      </div>

      <div className={cn('mt-3 p-2.5 sm:p-3 rounded-2xl border text-xs flex items-center justify-between gap-2', badgeClass)}>
        <div className="flex items-center gap-2 min-w-0">
          <span className="text-base shrink-0">⚡</span>
          <div className="min-w-0">
            <span className="font-bold text-slate-900 dark:text-white block truncate">
              {ex.recommendation.badgeText}
            </span>
            <span className="text-[11px] opacity-80 block truncate">
              Цель: {ex.targetWeight} кг × {ex.minReps}-{ex.maxReps} повт.
            </span>
          </div>
        </div>
        <span className="text-[10px] px-2 py-1 bg-white/80 dark:bg-black/40 rounded-lg font-mono font-bold shadow-xs shrink-0 whitespace-nowrap">
          +{ex.weightStep}кг
        </span>
      </div>

      <div className="mt-3.5 space-y-2">
        <div className="grid grid-cols-[28px_56px_1fr_1fr_44px] gap-1.5 text-[11px] font-bold uppercase tracking-wider text-slate-400 dark:text-zinc-500 px-1 text-center items-center">
          <span>Сет</span>
          <span title="Нажмите на прошлое значение, чтобы скопировать">Пред.</span>
          <span>Вес, кг</span>
          <span>Повторы</span>
          <span>Готово</span>
        </div>

        {ex.sets.map((set, setIdx) => {
          const prevSet: SetHistoryEntry | undefined = ex.previousPerformance?.sets[setIdx];
          return (
            <WorkoutSetRow
              key={set.id}
              set={set}
              previousSet={prevSet}
              weightStep={ex.weightStep}
              onCycleType={() => onCycleSetType(setIdx)}
              onCopyPrevious={() => onCopyPrevious(setIdx)}
              onWeightDelta={(delta) => onWeightDelta(setIdx, delta)}
              onRepsDelta={(delta) => onRepsDelta(setIdx, delta)}
              onToggleComplete={() => onToggleComplete(setIdx)}
            />
          );
        })}
      </div>

      <div className="flex items-center justify-between pt-3 mt-2 border-t border-slate-100 dark:border-zinc-800/60">
        <div className="flex items-center gap-1.5 flex-wrap">
          <button
            onClick={onAddSet}
            className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 hover:text-emerald-700 flex items-center gap-1 px-2.5 py-1.5 rounded-lg hover:bg-emerald-50 dark:hover:bg-emerald-950/30 transition"
          >
            <Plus className="w-3.5 h-3.5" /> Сет
          </button>
          <button
            onClick={onAddWarmup}
            className="text-xs font-semibold text-amber-600 dark:text-amber-400 hover:text-amber-700 flex items-center gap-1 px-2.5 py-1.5 rounded-lg hover:bg-amber-50 dark:hover:bg-amber-950/30 transition"
          >
            <Plus className="w-3.5 h-3.5" /> Разминка
          </button>
        </div>

        {ex.sets.length > 1 && (
          <button
            onClick={onRemoveLastSet}
            className="text-xs text-slate-400 hover:text-red-500 flex items-center gap-1 px-2 py-1 transition"
          >
            <Trash2 className="w-3.5 h-3.5" /> Удалить последний
          </button>
        )}
      </div>
    </div>
  );
};
