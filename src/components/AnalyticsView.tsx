import React, { useState, useEffect } from 'react';
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
import { storageService } from '../services/storageService';
import { pluralize } from '../utils/pluralize';
import { WorkoutTrendChart } from './WorkoutTrendChart';
import { WorkoutEditModal } from './WorkoutEditModal';
import { cn } from '../utils/cn';

interface AnalyticsViewProps {
  history: CompletedWorkout[];
  templates: WorkoutTemplate[];
  onDataReload?: () => void;
  initialExpandedWorkoutId?: string | null;
  initialEditingWorkout?: CompletedWorkout | null;
}

interface DeleteUndoState {
  workoutId: string;
  prevTemplatesRaw: string | null;
  prevHistoryRaw: string | null;
  postTemplatesRaw: string | null;
  postHistoryRaw: string | null;
}

export const AnalyticsView: React.FC<AnalyticsViewProps> = ({
  history,
  onDataReload,
  initialExpandedWorkoutId = null,
  initialEditingWorkout = null
}) => {
  const [expandedWorkoutId, setExpandedWorkoutId] = useState<string | null>(initialExpandedWorkoutId);
  const [editingWorkout, setEditingWorkout] = useState<CompletedWorkout | null>(initialEditingWorkout);
  const [periodWeeks, setPeriodWeeks] = useState<4 | 8 | 12>(8);
  const [visibleCount, setVisibleCount] = useState<number>(30);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);
  const [storageError, setStorageError] = useState<string | null>(null);
  const [undoState, setUndoState] = useState<DeleteUndoState | null>(null);

  const cutoff = Date.now() - periodWeeks * 7 * 86400000;
  const periodHistory = history.filter(w => w.endTime >= cutoff);
  const visibleWorkouts = periodHistory.slice(0, visibleCount);

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

  // Auto-dismiss undo toast after 8 seconds
  useEffect(() => {
    if (!undoState) return;
    const timer = setTimeout(() => {
      setUndoState(null);
    }, 8000);
    return () => clearTimeout(timer);
  }, [undoState]);

  const canUndo = Boolean(
    undoState &&
    typeof localStorage !== 'undefined' &&
    localStorage.getItem('ironforge_templates_v1') === undoState.postTemplatesRaw &&
    localStorage.getItem('ironforge_history_v1') === undoState.postHistoryRaw
  );

  const handleDeleteWorkout = (workoutId: string) => {
    const prevTemplatesRaw = typeof localStorage !== 'undefined' ? localStorage.getItem('ironforge_templates_v1') : null;
    const prevHistoryRaw = typeof localStorage !== 'undefined' ? localStorage.getItem('ironforge_history_v1') : null;

    try {
      const success = storageService.deleteCompletedWorkout(workoutId);
      if (success) {
        const postTemplatesRaw = typeof localStorage !== 'undefined' ? localStorage.getItem('ironforge_templates_v1') : null;
        const postHistoryRaw = typeof localStorage !== 'undefined' ? localStorage.getItem('ironforge_history_v1') : null;

        setUndoState({
          workoutId,
          prevTemplatesRaw,
          prevHistoryRaw,
          postTemplatesRaw,
          postHistoryRaw
        });
        setConfirmDeleteId(null);
        onDataReload?.();
      }
    } catch (e) {
      console.error('Delete workout failed', e);
      setStorageError('Не удалось удалить тренировку. Попробуйте снова.');
    }
  };

  const handleUndoDelete = () => {
    if (!undoState) return;
    if (typeof localStorage !== 'undefined') {
      const curTemplates = localStorage.getItem('ironforge_templates_v1');
      const curHistory = localStorage.getItem('ironforge_history_v1');
      if (curTemplates === undoState.postTemplatesRaw && curHistory === undoState.postHistoryRaw) {
        if (undoState.prevTemplatesRaw == null) localStorage.removeItem('ironforge_templates_v1');
        else localStorage.setItem('ironforge_templates_v1', undoState.prevTemplatesRaw);
        if (undoState.prevHistoryRaw == null) localStorage.removeItem('ironforge_history_v1');
        else localStorage.setItem('ironforge_history_v1', undoState.prevHistoryRaw);
        setUndoState(null);
        onDataReload?.();
        return;
      }
    }
    setUndoState(null);
  };

  const handleSaveWorkoutEdit = (updated: CompletedWorkout) => {
    try {
      const ok = storageService.updateCompletedWorkout(updated.id, updated);
      if (ok) {
        setEditingWorkout(null);
        onDataReload?.();
      } else {
        setStorageError('Не удалось обновить тренировку. Проверьте данные.');
      }
    } catch (e) {
      console.error('Update workout failed', e);
      setStorageError('Не удалось сохранить изменения тренировки.');
    }
  };

  // Find Personal Records (Max 1RM per exercise across history)
  const prMap = new Map<string, { exerciseName: string; category: string; maxWeight: number; max1RM: number; date: string }>();

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
    <div
      className={cn(
        'max-w-2xl md:max-w-[720px] mx-auto p-3 sm:p-4 pb-36 sm:pb-40 space-y-4 sm:space-y-6 text-white animate-fade-in',
        (editingWorkout || undoState || storageError) && 'relative z-50'
      )}
    >
      {/* Dismissible Error Banner */}
      {storageError && (
        <div role="alert" className="fixed z-[70] inset-x-3 top-3 mx-auto max-w-lg rounded-2xl border border-rose-400/40 bg-zinc-950 p-4 shadow-xl">
          <button
            type="button"
            onClick={() => setStorageError(null)}
            aria-label="Закрыть ошибку"
            className="absolute right-2 top-2 min-h-[44px] min-w-[44px] rounded-lg text-xl text-rose-200"
          >
            ×
          </button>
          <p className="pr-11 text-sm font-semibold text-rose-300">{storageError}</p>
        </div>
      )}

      {/* Undo Toast */}
      {undoState && (
        <div
          role="status"
          className="fixed bottom-20 sm:bottom-6 inset-x-4 max-w-md mx-auto z-50 flex items-center justify-between gap-3 p-3.5 rounded-2xl bg-zinc-900 border border-white/20 shadow-2xl animate-fade-in"
        >
          <span className="text-sm font-semibold text-white">Тренировка удалена</span>
          {canUndo && (
            <button
              type="button"
              onClick={handleUndoDelete}
              className="min-h-[44px] min-w-[44px] px-4 rounded-xl bg-lime/15 hover:bg-lime/25 text-lime border border-lime/30 text-xs font-bold transition"
            >
              Отменить
            </button>
          )}
        </div>
      )}

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
          {visibleWorkouts.map(workout => {
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
                  className="w-full text-left flex items-center justify-between gap-2 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-lime rounded-lg min-h-[44px]"
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
                        {workout.totalSets} {pluralize(workout.totalSets, ['сет', 'сета', 'сетов'])}
                      </span>
                    </div>
                    {isExpanded ? (
                      <ChevronUp className="w-5 h-5 text-muted" />
                    ) : (
                      <ChevronDown className="w-5 h-5 text-muted" />
                    )}
                  </div>
                </button>

                {/* Expanded set breakdown & actions */}
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

                    {/* Workout Actions (Edit / Delete) */}
                    {confirmDeleteId === workout.id ? (
                      <div className="p-3 rounded-xl border border-rose-500/30 bg-rose-500/10 space-y-2 mt-3">
                        <p className="text-xs text-rose-200">Удалить эту тренировку из истории?</p>
                        <div className="flex gap-2">
                          <button
                            type="button"
                            onClick={() => handleDeleteWorkout(workout.id)}
                            className="flex-1 min-h-[44px] rounded-lg bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs"
                          >
                            Да, удалить
                          </button>
                          <button
                            type="button"
                            onClick={() => setConfirmDeleteId(null)}
                            className="flex-1 min-h-[44px] rounded-lg bg-white/10 text-white font-bold text-xs"
                          >
                            Отмена
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div className="flex items-center justify-end gap-2 pt-2 border-t border-white/10 mt-3">
                        <button
                          type="button"
                          onClick={() => setEditingWorkout(workout)}
                          className="min-h-[44px] px-3.5 py-2 rounded-xl bg-white/[0.06] hover:bg-white/[0.1] text-white text-xs font-bold border border-white/10 transition"
                        >
                          Редактировать
                        </button>
                        <button
                          type="button"
                          onClick={() => setConfirmDeleteId(workout.id)}
                          className="min-h-[44px] px-3.5 py-2 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-300 text-xs font-bold border border-rose-500/30 transition"
                        >
                          Удалить
                        </button>
                      </div>
                    )}
                  </div>
                )}

              </div>
            );
          })}
          </div>
        )}

        {periodHistory.length > visibleCount && (
          <button
            type="button"
            onClick={() => setVisibleCount(c => c + 30)}
            className="w-full min-h-[44px] py-3 rounded-2xl bg-white/[0.04] hover:bg-white/[0.08] border border-white/10 text-xs font-bold text-muted hover:text-white transition"
          >
            Показать ещё ({periodHistory.length - visibleCount})
          </button>
        )}
      </div>

      {/* Edit Workout Modal */}
      {editingWorkout && (
        <WorkoutEditModal
          isOpen={true}
          workout={editingWorkout}
          onClose={() => setEditingWorkout(null)}
          onSave={handleSaveWorkoutEdit}
        />
      )}
    </div>
  );
};
