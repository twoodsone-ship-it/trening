import React, { useState } from 'react';
import { Calculator, ChevronDown, Plus, RefreshCw, Sparkles, Trash2 } from 'lucide-react';
import type { ActiveExerciseSession, SetHistoryEntry } from '../../types';
import { cn } from '../../utils/cn';
import { WorkoutSetRow } from './WorkoutSetRow';
import { ExerciseHistoryChart } from '../ExerciseHistoryChart';

interface ActiveExerciseCardProps {
  exercise: ActiveExerciseSession;
  expanded: boolean;
  onToggleExpand: () => void;
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
  /** Optional history sessions for chart (from template exercise) */
  historySessions?: { date: string; weight: number; totalVolume: number }[];
}

const badgeStyles: Record<string, string> = {
  emerald: 'bg-lime/10 border-lime/30 text-lime',
  amber: 'bg-amber-500/10 border-amber-400/30 text-amber-300',
  purple: 'bg-violet-500/10 border-violet-400/30 text-violet-300',
  red: 'bg-rose-500/10 border-rose-400/30 text-rose-300',
  blue: 'bg-white/5 border-white/10 text-muted'
};

export const ActiveExerciseCard: React.FC<ActiveExerciseCardProps> = ({
  exercise: ex,
  expanded,
  onToggleExpand,
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
  onRemoveLastSet,
  historySessions
}) => {
  const [showChart, setShowChart] = useState(false);
  const completedCount = ex.sets.filter(s => s.completed).length;
  const badgeClass = badgeStyles[ex.recommendation.badgeColor] || badgeStyles.blue;

  return (
    <div
      className={cn(
        'rounded-3xl border transition overflow-hidden',
        expanded ? 'border-lime/35 bg-ink-2' : 'border-white/8 bg-white/[0.03]'
      )}
    >
      <button
        type="button"
        onClick={onToggleExpand}
        className="w-full text-left p-4 flex items-center justify-between gap-3"
      >
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-bold uppercase tracking-wider text-lime/90">{ex.category}</span>
            <span className="text-xs font-mono text-muted">{completedCount}/{ex.sets.length}</span>
          </div>
          <h2 className="font-bold text-base text-white mt-0.5 truncate">{ex.name}</h2>
          {!expanded && (
            <p className="text-xs text-muted mt-0.5 font-mono">
              {ex.targetWeight} кг · {ex.minReps}–{ex.maxReps}
            </p>
          )}
        </div>
        <ChevronDown className={cn('w-5 h-5 text-muted transition', expanded && 'rotate-180 text-lime')} />
      </button>

      {expanded && (
        <div className="px-4 pb-4 space-y-3 border-t border-white/8 pt-3">
          <div className="flex items-center gap-1.5">
            <button onClick={onOpenTechnique} className="p-2 rounded-xl bg-lime/10 text-lime border border-lime/20 text-xs font-semibold flex items-center gap-1">
              <Sparkles className="w-3.5 h-3.5" /> Техника
            </button>
            <button onClick={onOpenSwap} className="p-2 rounded-xl bg-white/5 text-white/70 border border-white/10 text-xs font-semibold flex items-center gap-1">
              <RefreshCw className="w-3.5 h-3.5" /> Замена
            </button>
            <button onClick={onOpenPlateCalc} className="p-2 rounded-xl bg-white/5 text-white/70 border border-white/10">
              <Calculator className="w-4 h-4" />
            </button>
            {historySessions && historySessions.length > 0 && (
              <button
                type="button"
                onClick={() => setShowChart(v => !v)}
                className="ml-auto text-[11px] font-bold text-lime px-2 py-1"
              >
                {showChart ? 'Скрыть график' : 'График'}
              </button>
            )}
          </div>

          {showChart && historySessions && (
            <div className="surface-panel p-3">
              <ExerciseHistoryChart
                history={historySessions.map((h, i) => ({
                  id: String(i),
                  workoutId: '',
                  date: h.date,
                  targetSets: 0,
                  minReps: 0,
                  maxReps: 0,
                  weight: h.weight,
                  sets: [],
                  totalVolume: h.totalVolume,
                  estimated1RM: 0
                }))}
              />
            </div>
          )}

          <div className={cn('p-2.5 rounded-2xl border text-xs flex items-center justify-between gap-2', badgeClass)}>
            <div className="min-w-0">
              <span className="font-bold text-white block truncate">{ex.recommendation.badgeText}</span>
              <span className="text-[11px] opacity-80 block truncate">
                Цель: {ex.targetWeight} кг × {ex.minReps}-{ex.maxReps}
              </span>
            </div>
            <span className="text-[10px] px-2 py-1 bg-black/30 rounded-lg font-mono font-bold shrink-0">
              +{ex.weightStep}кг
            </span>
          </div>

          <div className="space-y-2">
            <div className="grid grid-cols-[28px_56px_1fr_1fr_44px] gap-1.5 text-[11px] font-bold uppercase tracking-wider text-muted px-1 text-center">
              <span>Сет</span>
              <span>Пред.</span>
              <span>Вес</span>
              <span>Повт.</span>
              <span>✓</span>
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

          <div className="flex items-center justify-between pt-2">
            <div className="flex gap-1.5">
              <button onClick={onAddSet} className="text-xs font-semibold text-lime px-2.5 py-1.5 rounded-lg hover:bg-lime/10 flex items-center gap-1">
                <Plus className="w-3.5 h-3.5" /> Сет
              </button>
              <button onClick={onAddWarmup} className="text-xs font-semibold text-amber-400 px-2.5 py-1.5 rounded-lg hover:bg-amber-500/10 flex items-center gap-1">
                <Plus className="w-3.5 h-3.5" /> Разминка
              </button>
            </div>
            {ex.sets.length > 1 && (
              <button onClick={onRemoveLastSet} className="text-xs text-muted hover:text-rose-400 flex items-center gap-1 px-2 py-1">
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
