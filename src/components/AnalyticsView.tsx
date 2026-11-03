import React, { useState } from 'react';
import { 
  Trophy, 
  Flame, 
  Calendar, 
  ChevronDown, 
  ChevronUp
} from 'lucide-react';
import { CompletedWorkout, WorkoutTemplate } from '../types';
import { calculate1RM } from '../services/progressionEngine';
import { calculateStreak, workoutsThisWeek } from '../utils/streak';

interface AnalyticsViewProps {
  history: CompletedWorkout[];
  templates: WorkoutTemplate[];
}

export const AnalyticsView: React.FC<AnalyticsViewProps> = ({ history, templates }) => {
  const [expandedWorkoutId, setExpandedWorkoutId] = useState<string | null>(null);

  // Compute aggregated stats
  const totalWorkouts = history.length;
  const totalVolumeKg = history.reduce((sum, w) => sum + w.totalVolumeKg, 0);
  const totalSets = history.reduce((sum, w) => sum + w.totalSets, 0);
  const totalVolumeTons = (totalVolumeKg / 1000).toFixed(1);
  const streak = calculateStreak(history);
  const weekCount = workoutsThisWeek(history);

  // Find Personal Records (Max 1RM per exercise across history)
  const prMap = new Map<string, { exerciseName: string; category: string; maxWeight: number; max1RM: number; date: string }>();

  // Check history records
  history.forEach(workout => {
    workout.exercises.forEach(ex => {
      ex.sets.forEach(set => {
        if (set.reps <= 0 || set.weight <= 0) return;
        const est1RM = calculate1RM(set.weight, set.reps);
        const existing = prMap.get(ex.name);

        if (!existing || est1RM > existing.max1RM) {
          prMap.set(ex.name, {
            exerciseName: ex.name,
            category: ex.category,
            maxWeight: set.weight,
            max1RM: est1RM,
            date: new Date(workout.endTime).toLocaleDateString('ru-RU', { day: 'numeric', month: 'short' })
          });
        }
      });
    });
  });

  // Also seed with template current weights if history empty
  if (prMap.size === 0) {
    templates.forEach(t => {
      t.exercises.forEach(e => {
        if (!prMap.has(e.name)) {
          const est1RM = calculate1RM(e.currentWeight, e.minReps);
          prMap.set(e.name, {
            exerciseName: e.name,
            category: e.category,
            maxWeight: e.currentWeight,
            max1RM: est1RM,
            date: 'Базовый вес'
          });
        }
      });
    });
  }

  const prList = Array.from(prMap.values()).sort((a, b) => b.max1RM - a.max1RM);

  return (
    <div className="max-w-2xl mx-auto p-3 sm:p-4 pb-[calc(6.5rem+env(safe-area-inset-bottom))] space-y-4 sm:space-y-6 text-white animate-fade-in">
      
      {/* Top Title */}
      <div>
        <p className="text-lime text-[11px] font-bold tracking-[0.28em] uppercase">IronForge</p>
        <h1 className="text-xl sm:text-2xl font-extrabold text-white mt-2">Аналитика & Рекорды</h1>
        <p className="text-xs text-muted mt-1">
          Статистика прогресса, тоннаж и расчетные 1RM максимумы
        </p>
        <div className="mt-3 flex flex-wrap gap-2">
          <span className="inline-flex items-center gap-1.5 text-xs font-bold px-2.5 py-1 rounded-full bg-orange-500/15 text-orange-300 border border-orange-400/30">
            <Flame className="w-3.5 h-3.5" /> Streak {streak} дн.
          </span>
          <span className="inline-flex items-center gap-1.5 text-xs font-bold px-2.5 py-1 rounded-full bg-lime/10 text-lime border border-lime/30">
            Эта неделя: {weekCount}
          </span>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-3 gap-2 sm:gap-4">
        <div className="surface-panel p-2.5 sm:p-4 flex flex-col justify-between min-w-0">
          <span className="text-[10px] sm:text-[11px] font-bold uppercase tracking-wider text-muted truncate">
            Тренировки
          </span>
          <div className="mt-1.5 flex items-baseline gap-1">
            <span className="text-xl sm:text-3xl font-mono font-black text-lime">
              {totalWorkouts}
            </span>
            <span className="text-[10px] sm:text-xs text-muted truncate">сессий</span>
          </div>
        </div>

        <div className="surface-panel p-2.5 sm:p-4 flex flex-col justify-between min-w-0">
          <span className="text-[10px] sm:text-[11px] font-bold uppercase tracking-wider text-muted truncate">
            Тоннаж
          </span>
          <div className="mt-1.5 flex items-baseline gap-1">
            <span className="text-xl sm:text-3xl font-mono font-black text-sky-400">
              {totalVolumeTons}
            </span>
            <span className="text-[10px] sm:text-xs text-muted truncate">тонн</span>
          </div>
        </div>

        <div className="surface-panel p-2.5 sm:p-4 flex flex-col justify-between min-w-0">
          <span className="text-[10px] sm:text-[11px] font-bold uppercase tracking-wider text-muted truncate">
            Подходы
          </span>
          <div className="mt-1.5 flex items-baseline gap-1">
            <span className="text-xl sm:text-3xl font-mono font-black text-white">
              {totalSets}
            </span>
            <span className="text-[10px] sm:text-xs text-muted truncate">сетов</span>
          </div>
        </div>
      </div>

      {/* PR Showcase */}
      <div className="surface-panel p-4 sm:p-5">
        <div className="flex items-center gap-2 mb-4">
          <Trophy className="w-5 h-5 text-amber-400" />
          <h2 className="font-bold text-base text-white">Рекорды (1RM Оценка)</h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
          {prList.slice(0, 6).map((pr) => (
            <div 
              key={pr.exerciseName}
              className="bg-white/[0.03] border border-white/10 p-3.5 rounded-2xl flex items-center justify-between"
            >
              <div>
                <span className="text-[10px] text-muted uppercase tracking-wider block font-bold">
                  {pr.category}
                </span>
                <span className="text-xs sm:text-sm font-bold text-white truncate max-w-[140px] block mt-0.5">
                  {pr.exerciseName}
                </span>
                <span className="text-[10px] text-muted font-mono">
                  {pr.date}
                </span>
              </div>
              <div className="text-right">
                <span className="text-base sm:text-lg font-mono font-black text-amber-400">
                  {pr.max1RM} <span className="text-xs text-muted">кг</span>
                </span>
                <span className="text-[10px] text-muted block font-mono">
                  1RM Epley
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Workout History Log Feed */}
      <div className="space-y-3">
        <div className="flex items-center gap-2">
          <Calendar className="w-5 h-5 text-lime" />
          <h2 className="font-bold text-base text-white">История тренировок</h2>
        </div>

        {history.length === 0 ? (
          <div className="surface-panel p-8 text-center text-muted text-sm">
            Журнал пуст. Завершите тренировку во вкладке «Программы», чтобы сохранить историю.
          </div>
        ) : (
          history.map(workout => {
            const isExpanded = expandedWorkoutId === workout.id;

            return (
              <div 
                key={workout.id}
                className="surface-panel p-4 sm:p-5 transition"
              >
                <div 
                  onClick={() => setExpandedWorkoutId(isExpanded ? null : workout.id)}
                  className="flex items-center justify-between cursor-pointer"
                >
                  <div>
                    <h3 className="font-bold text-sm sm:text-base text-white">
                      {workout.templateName}
                    </h3>
                    <div className="flex items-center gap-2 text-xs text-muted font-mono mt-0.5">
                      <span>{new Date(workout.endTime).toLocaleDateString('ru-RU', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}</span>
                      <span>•</span>
                      <span>{workout.durationMinutes} мин</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="text-right">
                      <span className="font-mono font-bold text-xs sm:text-sm text-lime block">
                        {workout.totalVolumeKg} кг
                      </span>
                      <span className="text-[10px] text-muted">
                        {workout.totalSets} сетов
                      </span>
                    </div>
                    {isExpanded ? (
                      <ChevronUp className="w-5 h-5 text-muted" />
                    ) : (
                      <ChevronDown className="w-5 h-5 text-muted" />
                    )}
                  </div>
                </div>

                {/* Expanded set breakdown */}
                {isExpanded && (
                  <div className="mt-4 pt-3 border-t border-white/10 space-y-3">
                    {workout.exercises.map(ex => (
                      <div key={ex.exerciseId} className="bg-white/[0.03] p-3 rounded-2xl border border-white/10 text-xs">
                        <div className="flex justify-between items-center mb-1.5">
                          <span className="font-semibold text-white">{ex.name}</span>
                          <span className="text-[10px] text-lime font-mono font-bold">
                            {ex.progression.badgeText}
                          </span>
                        </div>
                        <div className="flex flex-wrap gap-1.5">
                          {ex.sets.map(s => (
                            <span 
                              key={s.setNumber}
                              className="px-2 py-0.5 bg-white/[0.04] border border-white/10 rounded font-mono text-[11px] text-white/80"
                            >
                              {s.weight}кг × {s.reps} {s.rpe ? `@${s.rpe}` : ''}
                            </span>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                )}

              </div>
            );
          })
        )}
      </div>

    </div>
  );
};
