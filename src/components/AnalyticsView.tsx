import React, { useState } from 'react';
import { 
  Trophy, 
  Flame, 
  BarChart3, 
  Calendar, 
  ChevronDown, 
  ChevronUp, 
  Dumbbell, 
  Zap,
  TrendingUp,
  Award
} from 'lucide-react';
import { CompletedWorkout, WorkoutTemplate } from '../types';
import { calculate1RM } from '../services/progressionEngine';

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
    <div className="max-w-2xl mx-auto p-3 sm:p-4 pb-28 space-y-6 text-slate-900 dark:text-zinc-100 transition-colors duration-200">
      
      {/* Top Title */}
      <div>
        <h1 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white">Аналитика & Рекорды</h1>
        <p className="text-xs text-slate-500 dark:text-zinc-400 mt-1">
          Статистика прогресса, тоннаж и расчетные 1RM максимумы
        </p>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-3 gap-2.5 sm:gap-4">
        <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 p-3.5 sm:p-4 rounded-3xl shadow-sm flex flex-col justify-between">
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-zinc-400">
            Тренировки
          </span>
          <div className="mt-2 flex items-baseline gap-1">
            <span className="text-2xl sm:text-3xl font-mono font-black text-emerald-600 dark:text-emerald-400">
              {totalWorkouts}
            </span>
            <span className="text-xs text-slate-400 dark:text-zinc-500">сессий</span>
          </div>
        </div>

        <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 p-3.5 sm:p-4 rounded-3xl shadow-sm flex flex-col justify-between">
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-zinc-400">
            Общий тоннаж
          </span>
          <div className="mt-2 flex items-baseline gap-1">
            <span className="text-2xl sm:text-3xl font-mono font-black text-blue-600 dark:text-blue-400">
              {totalVolumeTons}
            </span>
            <span className="text-xs text-slate-400 dark:text-zinc-500">тонн</span>
          </div>
        </div>

        <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 p-3.5 sm:p-4 rounded-3xl shadow-sm flex flex-col justify-between">
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-zinc-400">
            Подходы
          </span>
          <div className="mt-2 flex items-baseline gap-1">
            <span className="text-2xl sm:text-3xl font-mono font-black text-purple-600 dark:text-purple-400">
              {totalSets}
            </span>
            <span className="text-xs text-slate-400 dark:text-zinc-500">сетов</span>
          </div>
        </div>
      </div>

      {/* PR Showcase */}
      <div className="bg-white dark:bg-zinc-900/90 border border-slate-200 dark:border-zinc-800 rounded-3xl p-4 sm:p-5 shadow-sm dark:shadow-xl">
        <div className="flex items-center gap-2 mb-4">
          <Trophy className="w-5 h-5 text-amber-500" />
          <h2 className="font-bold text-base text-slate-900 dark:text-white">Рекорды (1RM Оценка)</h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
          {prList.slice(0, 6).map((pr, idx) => (
            <div 
              key={pr.exerciseName}
              className="bg-slate-50 dark:bg-zinc-950/80 border border-slate-200 dark:border-zinc-800/80 p-3.5 rounded-2xl flex items-center justify-between"
            >
              <div>
                <span className="text-[10px] text-slate-400 dark:text-zinc-500 uppercase tracking-wider block font-bold">
                  {pr.category}
                </span>
                <span className="text-xs sm:text-sm font-bold text-slate-800 dark:text-zinc-200 truncate max-w-[140px] block mt-0.5">
                  {pr.exerciseName}
                </span>
                <span className="text-[10px] text-slate-400 dark:text-zinc-500 font-mono">
                  {pr.date}
                </span>
              </div>
              <div className="text-right">
                <span className="text-base sm:text-lg font-mono font-black text-amber-600 dark:text-amber-400">
                  {pr.max1RM} <span className="text-xs text-slate-500 dark:text-zinc-400">кг</span>
                </span>
                <span className="text-[10px] text-slate-400 dark:text-zinc-500 block font-mono">
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
          <Calendar className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
          <h2 className="font-bold text-base text-slate-900 dark:text-white">История тренировок</h2>
        </div>

        {history.length === 0 ? (
          <div className="bg-white dark:bg-zinc-900/60 border border-slate-200 dark:border-zinc-800 rounded-3xl p-8 text-center text-slate-500 text-sm shadow-sm">
            Журнал пуст. Завершите тренировку во вкладке «Программы», чтобы сохранить историю.
          </div>
        ) : (
          history.map(workout => {
            const isExpanded = expandedWorkoutId === workout.id;

            return (
              <div 
                key={workout.id}
                className="bg-white dark:bg-zinc-900/90 border border-slate-200 dark:border-zinc-800 rounded-3xl p-4 sm:p-5 shadow-sm dark:shadow-lg transition"
              >
                <div 
                  onClick={() => setExpandedWorkoutId(isExpanded ? null : workout.id)}
                  className="flex items-center justify-between cursor-pointer"
                >
                  <div>
                    <h3 className="font-bold text-sm sm:text-base text-slate-900 dark:text-white">
                      {workout.templateName}
                    </h3>
                    <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-zinc-400 font-mono mt-0.5">
                      <span>{new Date(workout.endTime).toLocaleDateString('ru-RU', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}</span>
                      <span>•</span>
                      <span>{workout.durationMinutes} мин</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="text-right">
                      <span className="font-mono font-bold text-xs sm:text-sm text-emerald-600 dark:text-emerald-400 block">
                        {workout.totalVolumeKg} кг
                      </span>
                      <span className="text-[10px] text-slate-400 dark:text-zinc-500">
                        {workout.totalSets} сетов
                      </span>
                    </div>
                    {isExpanded ? (
                      <ChevronUp className="w-5 h-5 text-slate-400" />
                    ) : (
                      <ChevronDown className="w-5 h-5 text-slate-400" />
                    )}
                  </div>
                </div>

                {/* Expanded set breakdown */}
                {isExpanded && (
                  <div className="mt-4 pt-3 border-t border-slate-100 dark:border-zinc-800 space-y-3">
                    {workout.exercises.map(ex => (
                      <div key={ex.exerciseId} className="bg-slate-50 dark:bg-zinc-950 p-3 rounded-2xl border border-slate-200 dark:border-zinc-800/80 text-xs">
                        <div className="flex justify-between items-center mb-1.5">
                          <span className="font-semibold text-slate-900 dark:text-zinc-200">{ex.name}</span>
                          <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-mono font-bold">
                            {ex.progression.badgeText}
                          </span>
                        </div>
                        <div className="flex flex-wrap gap-1.5">
                          {ex.sets.map(s => (
                            <span 
                              key={s.setNumber}
                              className="px-2 py-0.5 bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded font-mono text-[11px] text-slate-700 dark:text-zinc-300 shadow-2xs"
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
