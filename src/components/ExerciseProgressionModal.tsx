import React, { useState, useMemo } from 'react';
import { X, History, Settings2, Zap } from 'lucide-react';
import { Exercise } from '../types';
import { evaluateDoubleProgression, calculate1RM } from '../services/progressionEngine';
import { storageService, deriveExerciseHistoryFromCompletedWorkouts } from '../services/storageService';
import { cn } from '../utils/cn';
import { pluralize } from '../utils/pluralize';
import { useDialogA11y } from '../hooks/useDialogA11y';

interface ExerciseProgressionModalProps {
  exercise: Exercise;
  isOpen: boolean;
  onClose: () => void;
  onUpdateExercise: (updated: Exercise) => void;
}

export const ExerciseProgressionModal: React.FC<ExerciseProgressionModalProps> = ({
  exercise,
  isOpen,
  onClose,
  onUpdateExercise
}) => {
  const [activeTab, setActiveTab] = useState<'progression' | 'history' | 'settings'>('progression');

  const [weight, setWeight] = useState(exercise.currentWeight);
  const [targetSets, setTargetSets] = useState(exercise.targetSets);
  const [minReps, setMinReps] = useState(exercise.minReps);
  const [maxReps, setMaxReps] = useState(exercise.maxReps);
  const [weightStep, setWeightStep] = useState(exercise.weightStep);
  const [restSeconds, setRestSeconds] = useState(exercise.restSeconds);

  if (!isOpen) return null;

  const recommendation = evaluateDoubleProgression(
    exercise.targetSets,
    exercise.minReps,
    exercise.maxReps,
    exercise.weightStep,
    exercise.currentWeight,
    exercise.history
  );

  const handleSaveSettings = () => {
    onUpdateExercise({
      ...exercise,
      currentWeight: weight,
      targetSets,
      minReps,
      maxReps,
      weightStep,
      restSeconds
    });
    onClose();
  };

  const fullHistorySessions = useMemo(() => {
    if (typeof localStorage === 'undefined') return exercise.history;
    try {
      return deriveExerciseHistoryFromCompletedWorkouts(exercise.id, storageService.getHistory(), exercise.history);
    } catch {
      return exercise.history;
    }
  }, [exercise.id, exercise.history]);

  const historyPoints = fullHistorySessions.map((h, idx) => ({
    session: idx + 1,
    date: new Date(h.date).toLocaleDateString('ru-RU', { day: 'numeric', month: 'short' }),
    weight: h.weight,
    oneRM: h.estimated1RM,
    volume: h.totalVolume
  }));

  const maxOneRM = historyPoints.length > 0
    ? Math.max(...historyPoints.map(p => p.oneRM), 1)
    : calculate1RM(exercise.currentWeight, exercise.maxReps);

  const badgeTone =
    recommendation.badgeColor === 'emerald'
      ? 'bg-lime/10 border-lime/40 text-lime'
      : recommendation.badgeColor === 'amber'
      ? 'bg-amber-500/10 border-amber-400/40 text-amber-200'
      : recommendation.badgeColor === 'purple' || recommendation.badgeColor === 'red'
      ? 'bg-rose-500/10 border-rose-400/40 text-rose-200'
      : 'bg-sky-500/10 border-sky-400/40 text-sky-200';

  const tabs = [
    { id: 'progression' as const, label: 'Прогрессия', icon: Zap },
    { id: 'history' as const, label: `История (${fullHistorySessions.length})`, icon: History },
    { id: 'settings' as const, label: 'Параметры', icon: Settings2 }
  ];

  const { containerRef, dialogProps } = useDialogA11y({
    isOpen,
    onClose,
    titleId: 'exercise-progression-title'
  });

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-2.5 sm:p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
      <div ref={containerRef} {...dialogProps} className="w-full max-w-lg surface-panel border-lime/20 shadow-2xl text-white max-h-[min(92dvh,calc(100dvh-1.5rem))] flex flex-col overflow-hidden animate-slide-up">
        <div className="flex items-center justify-between p-3.5 sm:p-4 border-b border-white/8 gap-2 shrink-0">
          <div className="min-w-0 flex-1">
            <span className="text-xs font-bold tracking-wider uppercase text-lime bg-lime/10 border border-lime/30 px-2 py-0.5 rounded-full">
              {exercise.category}
            </span>
            <h3 id="exercise-progression-title" className="font-extrabold text-base sm:text-lg text-white mt-1 truncate">{exercise.name}</h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-11 h-11 flex items-center justify-center text-muted hover:text-white rounded-2xl bg-white/5 active:scale-95 transition shrink-0"
            aria-label="Закрыть"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="flex border-b border-white/8 bg-ink/40 px-2 shrink-0">
          {tabs.map(t => {
            const Icon = t.icon;
            const active = activeTab === t.id;
            return (
              <button
                key={t.id}
                type="button"
                onClick={() => setActiveTab(t.id)}
                className={cn(
                  'flex-1 py-3 text-xs font-semibold flex items-center justify-center gap-1.5 border-b-2 transition min-h-[44px]',
                  active ? 'border-lime text-lime' : 'border-transparent text-muted hover:text-white'
                )}
              >
                <Icon className="w-4 h-4" /> {t.label}
              </button>
            );
          })}
        </div>

        <div className="p-4 sm:p-5 overflow-y-auto space-y-4 flex-1 min-h-0">
          {activeTab === 'progression' && (
            <div className="space-y-4">
              <div className={cn('p-4 rounded-2xl border', badgeTone)}>
                <div className="flex items-center justify-between mb-2 gap-2">
                  <span className="text-xs font-bold uppercase tracking-wider">
                    Статус умной прогрессии
                  </span>
                  <span className="text-xs font-mono font-bold px-2 py-0.5 rounded-full bg-black/40 border border-current">
                    {recommendation.badgeText}
                  </span>
                </div>
                <h4 className="font-bold text-base text-white mb-1.5">
                  Цель: {recommendation.nextWeight} кг × {recommendation.targetRepRange} повт.
                </h4>
                <p className="text-xs leading-relaxed text-muted">
                  <span className="analysis-text">{recommendation.analysis}</span>
                </p>
                <div className="mt-3 pt-3 border-t border-white/10 text-xs font-medium text-white flex items-center gap-2">
                  <span className="text-lime">⚡ План:</span> <span className="recommendation-text">{recommendation.suggestedAction}</span>
                </div>
              </div>

              <div className="bg-white/[0.03] p-4 rounded-2xl border border-white/8 space-y-2">
                <span className="text-xs font-bold text-muted uppercase tracking-wider block mb-2">
                  Параметры двойной прогрессии
                </span>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div className="bg-ink/50 p-2.5 rounded-xl border border-white/8">
                    <span className="text-muted block">Диапазон повторений:</span>
                    <span className="font-mono font-bold text-sm text-white">
                      {exercise.minReps} - {exercise.maxReps} повт.
                    </span>
                  </div>
                  <div className="bg-ink/50 p-2.5 rounded-xl border border-white/8">
                    <span className="text-muted block">Рабочих подходов:</span>
                    <span className="font-mono font-bold text-sm text-white">
                      {exercise.targetSets} {pluralize(exercise.targetSets, ['подход', 'подхода', 'подходов'])}
                    </span>
                  </div>
                  <div className="bg-ink/50 p-2.5 rounded-xl border border-white/8">
                    <span className="text-muted block">Шаг веса (+ΔW):</span>
                    <span className="font-mono font-bold text-sm text-lime">
                      +{exercise.weightStep} кг
                    </span>
                  </div>
                  <div className="bg-ink/50 p-2.5 rounded-xl border border-white/8">
                    <span className="text-muted block">Отдых между сетами:</span>
                    <span className="font-mono font-bold text-sm text-white">
                      {exercise.restSeconds} сек.
                    </span>
                  </div>
                </div>
              </div>

              <div className="bg-white/[0.03] p-4 rounded-2xl border border-white/8">
                <div className="flex justify-between items-center mb-3 gap-2">
                  <span className="text-xs font-bold text-muted uppercase tracking-wider">
                    Оценка 1RM (Расчетный максимум)
                  </span>
                  <span className="text-xs font-mono font-bold text-lime">
                    ~{Math.round(calculate1RM(exercise.currentWeight, exercise.minReps))} кг
                  </span>
                </div>

                {historyPoints.length === 0 ? (
                  <p className="text-muted text-xs text-center py-4">
                    Завершите первую тренировку для построения графика прогресса.
                  </p>
                ) : (
                  <div className="flex items-end gap-2 h-24 pt-4 border-b border-white/8">
                    {historyPoints.map((pt, i) => {
                      const heightPct = Math.max(15, Math.min(100, (pt.oneRM / maxOneRM) * 100));
                      return (
                        <div key={i} className="flex-1 flex flex-col items-center gap-1 group relative">
                          <div className="absolute -top-7 hidden group-hover:block bg-ink-3 text-xs px-1.5 py-0.5 rounded shadow z-10 whitespace-nowrap border border-white/10">
                            {pt.oneRM} кг ({pt.date})
                          </div>
                          <div
                            style={{ height: `${heightPct}%` }}
                            className="w-full bg-lime/80 group-hover:bg-lime rounded-t transition-all"
                          />
                          <span className="text-xs text-muted truncate w-full text-center">
                            {pt.date}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          )}

          {activeTab === 'history' && (
            <div className="space-y-3">
              {fullHistorySessions.length === 0 ? (
                <p className="text-muted text-sm text-center py-8">
                  История подходов пуста. Начните тренировку!
                </p>
              ) : (
                [...fullHistorySessions].reverse().map(session => (
                  <div key={session.id} className="bg-white/[0.03] border border-white/8 rounded-2xl p-3.5 space-y-2">
                    <div className="flex items-center justify-between text-xs gap-2">
                      <span className="font-semibold text-white">
                        {new Date(session.date).toLocaleDateString('ru-RU', {
                          day: 'numeric',
                          month: 'long',
                          year: 'numeric'
                        })}
                      </span>
                      <span className="font-mono font-bold text-lime">
                        Вес: {session.weight} кг
                      </span>
                    </div>

                    <div className="flex flex-wrap gap-2 pt-1">
                      {session.sets.map((s: { setNumber: number; reps: number; rpe?: number }) => (
                        <div
                          key={s.setNumber}
                          className="bg-ink/50 border border-white/10 px-2.5 py-1 rounded-lg text-xs font-mono text-muted"
                        >
                          Сет {s.setNumber}: <span className="font-bold text-lime">{s.reps}</span> повт.
                          {s.rpe && <span className="text-muted text-xs ml-1">@RPE{s.rpe}</span>}
                        </div>
                      ))}
                    </div>

                    <div className="flex items-center justify-between text-xs text-muted pt-1 border-t border-white/8">
                      <span>Общий тоннаж: {session.totalVolume} кг</span>
                      <span>1RM: ~{session.estimated1RM} кг</span>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}

          {activeTab === 'settings' && (
            <div className="space-y-4">
              <div>
                <label className="block text-xs uppercase tracking-wider text-muted font-semibold mb-1">
                  Текущий рабочий вес (кг)
                </label>
                <input
                  type="number"
                  step="0.5"
                  value={weight}
                  onChange={e => setWeight(parseFloat(e.target.value) || 0)}
                  className="w-full bg-white/[0.04] border border-white/10 rounded-xl px-4 py-2.5 font-mono text-lg font-bold text-lime focus:outline-none focus:border-lime/50 min-h-[48px]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs uppercase tracking-wider text-muted font-semibold mb-1">
                    Мин. повторений
                  </label>
                  <input
                    type="number"
                    value={minReps}
                    onChange={e => setMinReps(parseInt(e.target.value) || 1)}
                    className="w-full bg-white/[0.04] border border-white/10 rounded-xl px-3 py-2 font-mono text-sm text-white min-h-[44px]"
                  />
                </div>
                <div>
                  <label className="block text-xs uppercase tracking-wider text-muted font-semibold mb-1">
                    Макс. повторений
                  </label>
                  <input
                    type="number"
                    value={maxReps}
                    onChange={e => setMaxReps(parseInt(e.target.value) || 1)}
                    className="w-full bg-white/[0.04] border border-white/10 rounded-xl px-3 py-2 font-mono text-sm text-white min-h-[44px]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs uppercase tracking-wider text-muted font-semibold mb-1">
                    Кол-во подходов
                  </label>
                  <input
                    type="number"
                    value={targetSets}
                    onChange={e => setTargetSets(parseInt(e.target.value) || 1)}
                    className="w-full bg-white/[0.04] border border-white/10 rounded-xl px-3 py-2 font-mono text-sm text-white min-h-[44px]"
                  />
                </div>
                <div>
                  <label className="block text-xs uppercase tracking-wider text-muted font-semibold mb-1">
                    Шаг веса (+кг)
                  </label>
                  <input
                    type="number"
                    step="0.5"
                    value={weightStep}
                    onChange={e => setWeightStep(parseFloat(e.target.value) || 0.5)}
                    className="w-full bg-white/[0.04] border border-white/10 rounded-xl px-3 py-2 font-mono text-sm text-white min-h-[44px]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs uppercase tracking-wider text-muted font-semibold mb-1">
                  Отдых между подходами (сек.)
                </label>
                <div className="flex gap-2">
                  {[60, 90, 120, 180].map(sec => (
                    <button
                      key={sec}
                      type="button"
                      onClick={() => setRestSeconds(sec)}
                      className={cn(
                        'flex-1 py-2.5 rounded-xl text-xs font-semibold transition border min-h-[44px]',
                        restSeconds === sec
                          ? 'btn-lime border-lime'
                          : 'bg-white/5 text-muted border-white/10'
                      )}
                    >
                      {sec}с
                    </button>
                  ))}
                </div>
              </div>

              <button
                type="button"
                onClick={handleSaveSettings}
                className="w-full mt-4 py-3.5 btn-lime font-bold rounded-2xl transition min-h-[52px]"
              >
                Сохранить настройки упражнения
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
