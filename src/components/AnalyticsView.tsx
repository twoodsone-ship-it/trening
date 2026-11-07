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
import { WorkoutTrendChart } from './WorkoutTrendChart';

interface AnalyticsViewProps {
  history: CompletedWorkout[];
  templates: WorkoutTemplate[];
}

export const AnalyticsView: React.FC<AnalyticsViewProps> = ({ history }) => {
  const [expandedWorkoutId, setExpandedWorkoutId] = useState<string | null>(null);
  const [periodWeeks, setPeriodWeeks] = useState<4 | 8 | 12>(8);
  const cutoff = Date.now() - periodWeeks * 7 * 86400000;
  const periodHistory = history.filter(w => w.endTime >= cutoff);

  // Compute aggregated stats
  const totalWorkouts = periodHistory.length;
  const totalVolumeKg = periodHistory.reduce((sum, w) => sum + w.totalVolumeKg, 0);
  const totalSets = periodHistory.reduce((sum, w) => sum + w.exercises.reduce(
    (exerciseSum, exercise) => exerciseSum + exercise.sets.filter(s => !s.isWarmup && s.type !== 'warmup').length,
    0
  ), 0);
  const totalVolumeTons = (totalVolumeKg / 1000).toFixed(1);
  const streak = calculateStreak(history);
  const weekCount = workoutsThisWeek(history);

  // Find Personal Records (Max 1RM per exercise across history)
  const prMap = new Map<string, { exerciseName: string; category: string; maxWeight: number; max1RM: number; date: string }>();

  // Check history records
  periodHistory.forEach(workout => {
    workout.exercises.forEach(ex => {
      ex.sets.forEach(set => {
        if (set.reps <= 0 || set.weight <= 0 || set.isWarmup || set.type === 'warmup' || ex.category === 'Cardio') return;
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

  const prList = Array.from(prMap.values()).sort((a, b) => b.max1RM - a.max1RM);

  return (
    <div className="max-w-2xl md:max-w-[720px] mx-auto p-3 sm:p-4 pb-[calc(6.5rem+env(safe-area-inset-bottom))] space-y-4 sm:space-y-6 text-white animate-fade-in">
      
      {/* Top Title */}
      <div>
        <p className="text-lime text-xs font-bold tracking-[0.28em] uppercase">IronForge</p>
        <h1 className="font-display text-3xl sm:text-4xl font-bold text-white mt-2">Прогресс и рекорды</h1>
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

      <section className="space-y-2">
        <div className="flex items-center justify-between gap-3">
          <div>
            <h2 className="font-bold text-sm">Обзор нагрузки</h2>
            <p className="text-xs text-muted">Силовой объём, занятия и кардио</p>
          </div>
          <div className="flex gap-1 rounded-xl bg-white/[0.04] border border-white/10 p-1">
            {([4, 8, 12] as const).map(weeks => (
              <button key={weeks} type="button" onClick={() => setPeriodWeeks(weeks)}
                className={`px-2.5 py-1.5 rounded-lg text-xs font-bold ${periodWeeks === weeks ? 'bg-lime text-ink' : 'text-muted'}`}>
                {weeks} нед.
              </button>
            ))}
          </div>
        </div>
        <WorkoutTrendChart history={history} weeks={periodWeeks} />
      </section>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-3 gap-2 sm:gap-4">
        <div className="surface-panel p-2.5 sm:p-4 flex flex-col justify-between min-w-0">
          <span className="text-xs sm:text-xs font-bold uppercase tracking-wider text-muted truncate">
            Тренировки
          </span>
          <div className="mt-1.5 flex items-baseline gap-1">
            <span className="text-xl sm:text-3xl font-mono font-black text-lime">
              {totalWorkouts}
            </span>
            <span className="text-xs sm:text-xs text-muted truncate">сессий</span>
          </div>
        </div>

        <div className="surface-panel p-2.5 sm:p-4 flex flex-col justify-between min-w-0">
          <span className="text-xs sm:text-xs font-bold uppercase tracking-wider text-muted truncate">
            Тоннаж
          </span>
          <div className="mt-1.5 flex items-baseline gap-1">
            <span className="text-xl sm:text-3xl font-mono font-black text-sky-400">
              {totalVolumeTons}
            </span>
            <span className="text-xs sm:text-xs text-muted truncate">тонн</span>
          </div>
        </div>

        <div className="surface-panel p-2.5 sm:p-4 flex flex-col justify-between min-w-0">
          <span className="text-xs sm:text-xs font-bold uppercase tracking-wider text-muted truncate">
            Подходы
          </span>
          <div className="mt-1.5 flex items-baseline gap-1">
            <span className="text-xl sm:text-3xl font-mono font-black text-white">
              {totalSets}
            </span>
            <span className="text-xs sm:text-xs text-muted truncate">сетов</span>
          </div>
        </div>
      </div>

      {/* PR Showcase */}
      <div className="surface-panel p-4 sm:p-5">
        <div className="flex items-center gap-2 mb-4">
          <Trophy className="w-5 h-5 text-amber-400" />
          <h2 className="font-bold text-base text-white">Лучшие результаты за период</h2>
        </div>

        {prList.length === 0 ? <p className="text-sm text-muted">После первой силовой тренировки здесь появятся результаты.</p> : <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
          {prList.slice(0, 6).map((pr) => (
            <div 
              key={pr.exerciseName}
              className="bg-white/[0.03] border border-white/10 p-3.5 rounded-2xl flex items-center justify-between"
            >
              <div>
                <span className="text-xs text-muted uppercase tracking-wider block font-bold">
                  {pr.category}
                </span>
                <span className="text-xs sm:text-sm font-bold text-white truncate max-w-[140px] block mt-0.5">
                  {pr.exerciseName}
                </span>
                <span className="text-xs text-muted font-mono">
                  {pr.date}
                </span>
              </div>
              <div className="text-right">
                <span className="text-base sm:text-lg font-mono font-black text-amber-400">
                  {pr.max1RM} <span className="text-xs text-muted">кг</span>
                </span>
                <span className="text-xs text-muted block font-mono">
                  1RM Epley
                </span>
              </div>
            </div>
          ))}
        </div>}
      </div>

      {/* Workout History Log Feed */}
      <div className="space-y-3">
        <div className="flex items-center gap-2">
          <Calendar className="w-5 h-5 text-lime" />
          <h2 className="font-bold text-base text-white">История тренировок</h2>
        </div>

        {periodHistory.length === 0 ? (
          <div className="surface-panel p-8 text-center text-muted text-sm">
            Журнал пуст. Завершите тренировку во вкладке «Программы», чтобы сохранить историю.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {periodHistory.map(workout => {
            const isExpanded = expandedWorkoutId === workout.id;

            return (
              <div 
                key={workout.id}
                className="surface-panel p-4 sm:p-5 transition"
              >
                <button
                  type="button"
                  onClick={() => setExpandedWorkoutId(isExpanded ? null : workout.id)}
                  aria-expanded={isExpanded}
                  className="w-full text-left flex items-center justify-between gap-2 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-lime rounded-lg"
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
                      <span className="text-xs text-muted">
                        {workout.totalSets} сетов
                      </span>
                    </div>
                    {isExpanded ? (
                      <ChevronUp className="w-5 h-5 text-muted" />
                    ) : (
                      <ChevronDown className="w-5 h-5 text-muted" />
                    )}
                  </div>
                </button>

                {/* Expanded set breakdown */}
                {isExpanded && (
                  <div className="mt-4 pt-3 border-t border-white/10 space-y-3">
                    {workout.exercises.map(ex => (
                      <div key={ex.exerciseId} className="bg-white/[0.03] p-3 rounded-2xl border border-white/10 text-xs">
                        <div className="flex justify-between items-center mb-1.5">
                          <span className="font-semibold text-white">{ex.name}</span>
                          <span className="text-xs text-lime font-mono font-bold">
                            {ex.progression.badgeText}
                          </span>
                        </div>
                        <div className="flex flex-wrap gap-1.5">
                          {ex.sets.map(s => (
                            <span 
                              key={s.setNumber}
                              className="px-2 py-0.5 bg-white/[0.04] border border-white/10 rounded font-mono text-xs text-white/80"
                            >
                              {ex.trackingMode === 'duration'
                                ? `${Math.floor((s.durationSeconds || 0) / 60)}:${String((s.durationSeconds || 0) % 60).padStart(2, '0')}`
                                : ex.trackingMode === 'distance'
                                  ? `${((s.distanceMeters || 0) / 1000).toFixed(2)} км`
                                  : `${s.weight} кг × ${s.reps}`}
                              {s.rpe ? ` @${s.rpe}` : ''}
                            </span>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                )}

              </div>
            );
          })}
          </div>
        )}
      </div>

    </div>
  );
};
