import React, { useMemo } from 'react';
import { Activity, Award, Clock, Dumbbell, Share2, TrendingUp, Zap } from 'lucide-react';
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
    <div className="min-h-screen bg-app-atmosphere text-white pb-[calc(2rem+env(safe-area-inset-bottom))] animate-fade-in">
      <div className="max-w-lg mx-auto px-5 pt-[max(1.5rem,env(safe-area-inset-top))] space-y-5">
        <div className="text-center space-y-2 pt-4">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-lime/15 border border-lime/40 animate-pulse-ring">
            <Award className="w-8 h-8 text-lime" />
          </div>
          <p className="text-xs font-bold uppercase tracking-[0.18em] text-lime">Готово</p>
          <h1 className="text-2xl font-extrabold text-white">Тренировка завершена</h1>
          <p className="text-sm text-muted">{workout.templateName}</p>
        </div>

        {workout.cycleWeek && <p className="text-center text-xs text-muted">Месячный цикл · неделя {workout.cycleWeek} из 4</p>}

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
          <Stat icon={<Clock className="w-4 h-4" />} label="Время" value={`${workout.durationMinutes}`} unit="мин" />
          <Stat icon={<Dumbbell className="w-4 h-4" />} label="Объём" value={`${workout.totalVolumeKg}`} unit="кг" />
          <Stat icon={<Zap className="w-4 h-4" />} label="Сеты" value={`${workout.totalSets}`} unit="" />
          <Stat icon={<Activity className="w-4 h-4" />} label="Кардио" value={`${Math.round((workout.totalCardioSeconds || 0) / 60)}`} unit="мин" />
        </div>

        {volumeDelta != null && (
          <div className={cn(
            'surface-panel p-3.5 flex items-center gap-3',
            volumeDelta >= 0 ? 'border-lime/40' : 'border-amber-500/40'
          )}>
            <TrendingUp className={cn('w-5 h-5', volumeDelta >= 0 ? 'text-lime' : 'text-amber-400')} />
            <div>
              <p className="text-sm font-bold text-white">
                Объём {volumeDelta >= 0 ? '+' : ''}{volumeDelta}% к прошлой
              </p>
              <p className="text-xs text-muted">Сравнение с предыдущей сессией этой программы</p>
            </div>
          </div>
        )}

        <div className="space-y-2">
          <h2 className="text-xs font-bold uppercase tracking-wider text-muted px-1">Прогрессия</h2>
          {workout.exercises.map(ex => (
            <div key={ex.exerciseId} className="surface-panel p-3.5 flex items-center justify-between gap-2">
              <div className="min-w-0">
                <p className="font-semibold text-sm text-white truncate">{ex.name}</p>
                <p className="text-xs text-muted truncate">{ex.progression.suggestedAction}</p>
              </div>
              <span className="shrink-0 text-xs font-bold px-2 py-1 rounded-lg bg-lime/10 text-lime border border-lime/30">
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
                <div key={pr.name} className="surface-panel p-3">
                  <p className="text-xs text-muted truncate">{pr.name}</p>
                  <p className="font-mono font-bold text-lime">
                    {pr.weight}×{pr.reps}
                  </p>
                  <p className="text-xs text-muted">≈ {pr.est1RM} кг 1RM</p>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="flex gap-2 pt-2">
          <button
            type="button"
            onClick={handleShare}
            className="flex-1 py-3.5 rounded-2xl border border-white/15 font-bold text-sm flex items-center justify-center gap-2 min-h-[52px] active:scale-95 transition text-white"
          >
            <Share2 className="w-4 h-4" /> Поделиться
          </button>
          <button
            type="button"
            onClick={onDone}
            className="flex-[1.4] py-3.5 rounded-2xl btn-lime font-bold text-sm min-h-[52px] active:scale-95 transition"
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
    <div className="surface-panel p-3 flex flex-col gap-1">
      <span className="text-lime">{icon}</span>
      <span className="text-xs font-bold uppercase tracking-wider text-muted">{label}</span>
      <span className="font-mono font-black text-xl text-white">
        {value}
        {unit && <span className="text-xs font-semibold text-muted ml-0.5">{unit}</span>}
      </span>
    </div>
  );
}
