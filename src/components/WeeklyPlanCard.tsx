import React from 'react';
import { Flame, CalendarDays } from 'lucide-react';
import type { CompletedWorkout, WorkoutTemplate } from '../types';
import { calculateStreak, workoutsThisWeek, WEEKDAY_LABELS_RU } from '../utils/streak';
import { cn } from '../utils/cn';

interface WeeklyPlanCardProps {
  templates: WorkoutTemplate[];
  history: CompletedWorkout[];
  currentWeek: 'A' | 'B';
  onStartSuggested?: (template: WorkoutTemplate) => void;
}

export const WeeklyPlanCard: React.FC<WeeklyPlanCardProps> = ({
  templates,
  history,
  currentWeek,
  onStartSuggested
}) => {
  const streak = calculateStreak(history);
  const weekCount = workoutsThisWeek(history);
  const today = new Date().getDay();

  const filtered = templates.filter(
    t => !t.weekVariant || t.weekVariant === currentWeek || t.weekVariant === 'all'
  );

  const suggested =
    filtered.find(t => t.scheduledDays?.includes(today)) ||
    filtered[weekCount % Math.max(filtered.length, 1)] ||
    null;

  const trainedDays = new Set(
    history
      .filter(w => {
        const d = new Date(w.endTime);
        const start = new Date();
        start.setHours(0, 0, 0, 0);
        start.setDate(start.getDate() - ((start.getDay() + 6) % 7));
        return w.endTime >= start.getTime();
      })
      .map(w => new Date(w.endTime).getDay())
  );

  return (
    <div className="surface-card p-4 space-y-3">
      <div className="flex items-start justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <CalendarDays className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
            <h2 className="font-bold text-sm text-slate-900 dark:text-white">Недельный план</h2>
          </div>
          <p className="text-xs text-muted mt-0.5">
            Неделя {currentWeek} · сегодня {WEEKDAY_LABELS_RU[today]}
          </p>
        </div>
        <div className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-full bg-orange-500/10 border border-orange-500/30 text-orange-600 dark:text-orange-400">
          <Flame className="w-3.5 h-3.5" />
          <span className="text-xs font-black font-mono">{streak}</span>
          <span className="text-[10px] font-semibold">дней</span>
        </div>
      </div>

      <div className="flex justify-between gap-1">
        {[1, 2, 3, 4, 5, 6, 0].map(dow => {
          const isToday = dow === today;
          const done = trainedDays.has(dow);
          return (
            <div
              key={dow}
              className={cn(
                'flex-1 text-center py-2 rounded-xl text-[10px] font-bold transition',
                isToday && 'ring-2 ring-emerald-500/60',
                done
                  ? 'bg-emerald-500/20 text-emerald-700 dark:text-emerald-300'
                  : 'bg-slate-100 dark:bg-zinc-950 text-muted'
              )}
            >
              {WEEKDAY_LABELS_RU[dow]}
            </div>
          );
        })}
      </div>

      <div className="flex items-center justify-between gap-2 pt-1">
        <div className="min-w-0">
          <p className="text-[11px] text-muted">Сегодня рекомендовано</p>
          <p className="font-semibold text-sm text-slate-900 dark:text-white truncate">
            {suggested?.name || 'Отдых / свободный день'}
          </p>
          <p className="text-[11px] text-muted">{weekCount} тренировок на этой неделе</p>
        </div>
        {suggested && onStartSuggested && (
          <button
            type="button"
            onClick={() => onStartSuggested(suggested)}
            className="shrink-0 px-3 py-2 rounded-xl bg-emerald-500 text-black text-xs font-bold active:scale-95 transition min-h-[40px]"
          >
            Старт
          </button>
        )}
      </div>
    </div>
  );
};
