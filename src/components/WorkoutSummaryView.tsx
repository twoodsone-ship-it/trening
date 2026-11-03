import React, { useMemo } from 'react';
import { Award, Clock, Dumbbell, Share2, TrendingUp, Zap } from 'lucide-react';
import type { CompletedWorkout } from '../types';
import { calculate1RM } from '../services/progressionEngine';
import { shareWorkoutSummary } from '../utils/healthExport';
import { soundService } from '../services/audioService';
import { cn } from '../utils/cn';

interface WorkoutSummaryViewProps {
  workout: CompletedWorkout;
  previousVolumeKg?: number;
  onDone: () => void;
}

export const WorkoutSummaryView: React.FC<WorkoutSummaryViewProps> = ({
  workout,
  previousVolumeKg,
  onDone
}) => {
  const volumeDelta = previousVolumeKg != null && previousVolumeKg > 0
    ? Math.round(((workout.totalVolumeKg - previousVolumeKg) / previousVolumeKg) * 100)
    : null;

  const prs = useMemo(() => {
    const hits: { name: string; est1RM: number; weight: number; reps: number }[] = [];
    workout.exercises.forEach(ex => {
      ex.sets.forEach(s => {
        if (s.reps <= 0 || s.weight <= 0 || s.isWarmup || s.type === 'warmup') return;
        const est = calculate1RM(s.weight, s.reps);
        const best = hits.find(h => h.name === ex.name);
        if (!best || est > best.est1RM) {
          const entry = { name: ex.name, est1RM: est, weight: s.weight, reps: s.reps };
          if (best) Object.assign(best, entry);
          else hits.push(entry);
        }
      });
    });
    return hits.slice(0, 4);
  }, [workout]);

  const handleShare = async () => {
    const ok = await shareWorkoutSummary(workout);
    if (ok) soundService.haptic('button');
  };

  return (
    <div className="min-h-screen bg-app-atmosphere pb-[calc(2rem+env(safe-area-inset-bottom))] animate-fade-in">
      <div className="max-w-2xl mx-auto p-4 pt-[max(1.5rem,env(safe-area-inset-top))] space-y-5">
        <div className="text-center space-y-2 pt-4">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-emerald-500/15 border border-emerald-500/40 animate-pulse-ring">
            <Award className="w-8 h-8 text-emerald-500" />
          </div>
          <h1 className="text-2xl font-black text-slate-900 dark:text-white">Тренировка завершена</h1>
          <p className="text-sm text-muted">{workout.templateName}</p>
        </div>

        <div className="grid grid-cols-3 gap-2">
          <Stat icon={<Clock className="w-4 h-4" />} label="Время" value={`${workout.durationMinutes}`} unit="мин" />
          <Stat icon={<Dumbbell className="w-4 h-4" />} label="Объём" value={`${workout.totalVolumeKg}`} unit="кг" />
          <Stat icon={<Zap className="w-4 h-4" />} label="Сеты" value={`${workout.totalSets}`} unit="" />
        </div>

        {volumeDelta != null && (
          <div className={cn(
            'surface-card p-3.5 flex items-center gap-3',
            volumeDelta >= 0 ? 'border-emerald-500/40' : 'border-amber-500/40'
          )}>
            <TrendingUp className={cn('w-5 h-5', volumeDelta >= 0 ? 'text-emerald-500' : 'text-amber-500')} />
            <div>
              <p className="text-sm font-bold text-slate-900 dark:text-white">
                Объём {volumeDelta >= 0 ? '+' : ''}{volumeDelta}% к прошлой
              </p>
              <p className="text-xs text-muted">Сравнение с предыдущей сессией этой программы</p>
            </div>
          </div>
        )}

        <div className="space-y-2">
          <h2 className="text-xs font-bold uppercase tracking-wider text-muted px-1">Прогрессия</h2>
          {workout.exercises.map(ex => (
            <div key={ex.exerciseId} className="surface-card p-3.5 flex items-center justify-between gap-2">
              <div className="min-w-0">
                <p className="font-semibold text-sm text-slate-900 dark:text-white truncate">{ex.name}</p>
                <p className="text-[11px] text-muted truncate">{ex.progression.suggestedAction}</p>
              </div>
              <span className="shrink-0 text-[10px] font-bold px-2 py-1 rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30">
                {ex.progression.badgeText}
              </span>
            </div>
          ))}
        </div>

        {prs.length > 0 && (
          <div className="space-y-2">
            <h2 className="text-xs font-bold uppercase tracking-wider text-muted px-1">Лучшие подходы (e1RM)</h2>
            <div className="grid grid-cols-2 gap-2">
              {prs.map(pr => (
                <div key={pr.name} className="surface-card p-3">
                  <p className="text-[11px] text-muted truncate">{pr.name}</p>
                  <p className="font-mono font-bold text-emerald-600 dark:text-emerald-400">
                    {pr.weight}×{pr.reps}
                  </p>
                  <p className="text-[10px] text-muted">≈ {pr.est1RM} кг 1RM</p>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="flex gap-2 pt-2">
          <button
            type="button"
            onClick={handleShare}
            className="flex-1 py-3.5 rounded-2xl border border-slate-200 dark:border-zinc-700 font-bold text-sm flex items-center justify-center gap-2 min-h-[52px] active:scale-95 transition"
          >
            <Share2 className="w-4 h-4" /> Поделиться
          </button>
          <button
            type="button"
            onClick={onDone}
            className="flex-[1.4] py-3.5 rounded-2xl bg-emerald-500 text-black font-bold text-sm min-h-[52px] active:scale-95 transition"
          >
            К аналитике
          </button>
        </div>
      </div>
    </div>
  );
};

function Stat({
  icon,
  label,
  value,
  unit
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  unit: string;
}) {
  return (
    <div className="surface-card p-3 flex flex-col gap-1">
      <span className="text-emerald-600 dark:text-emerald-400">{icon}</span>
      <span className="text-[10px] font-bold uppercase tracking-wider text-muted">{label}</span>
      <span className="font-mono font-black text-xl text-slate-900 dark:text-white">
        {value}
        {unit && <span className="text-xs font-semibold text-muted ml-0.5">{unit}</span>}
      </span>
    </div>
  );
}
