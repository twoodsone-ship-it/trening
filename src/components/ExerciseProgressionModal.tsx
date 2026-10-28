import React, { useState } from 'react';
import { X, TrendingUp, History, Settings2, Award, Zap, AlertTriangle, ShieldCheck } from 'lucide-react';
import { Exercise, ProgressionRecommendation } from '../types';
import { evaluateDoubleProgression, calculate1RM } from '../services/progressionEngine';

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
  
  // Editable state
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

  // 1RM History points for chart
  const historyPoints = exercise.history.map((h, idx) => ({
    session: idx + 1,
    date: new Date(h.date).toLocaleDateString('ru-RU', { day: 'numeric', month: 'short' }),
    weight: h.weight,
    oneRM: h.estimated1RM,
    volume: h.totalVolume
  }));

  const maxOneRM = historyPoints.length > 0 
    ? Math.max(...historyPoints.map(p => p.oneRM), 1) 
    : calculate1RM(exercise.currentWeight, exercise.maxReps);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
      <div className="w-full max-w-lg bg-zinc-900 border border-zinc-700 rounded-2xl shadow-2xl text-white max-h-[90vh] flex flex-col overflow-hidden">
        
        {/* Top Header */}
        <div className="flex items-center justify-between p-4 border-b border-zinc-800 bg-zinc-900/90">
          <div>
            <span className="text-[10px] font-bold tracking-wider uppercase text-emerald-400 bg-emerald-950/60 border border-emerald-800/40 px-2 py-0.5 rounded-full">
              {exercise.category}
            </span>
            <h3 className="font-bold text-lg text-zinc-100 mt-1">{exercise.name}</h3>
          </div>
          <button 
            onClick={onClose}
            className="p-1.5 text-zinc-400 hover:text-white rounded-lg hover:bg-zinc-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab switchers */}
        <div className="flex border-b border-zinc-800 bg-zinc-950/40 px-3">
          <button
            onClick={() => setActiveTab('progression')}
            className={`flex-1 py-3 text-xs font-semibold flex items-center justify-center gap-1.5 border-b-2 transition ${
              activeTab === 'progression' 
                ? 'border-emerald-500 text-emerald-400' 
                : 'border-transparent text-zinc-400 hover:text-zinc-200'
            }`}
          >
            <Zap className="w-4 h-4" /> Прогрессия
          </button>
          <button
            onClick={() => setActiveTab('history')}
            className={`flex-1 py-3 text-xs font-semibold flex items-center justify-center gap-1.5 border-b-2 transition ${
              activeTab === 'history' 
                ? 'border-emerald-500 text-emerald-400' 
                : 'border-transparent text-zinc-400 hover:text-zinc-200'
            }`}
          >
            <History className="w-4 h-4" /> История ({exercise.history.length})
          </button>
          <button
            onClick={() => setActiveTab('settings')}
            className={`flex-1 py-3 text-xs font-semibold flex items-center justify-center gap-1.5 border-b-2 transition ${
              activeTab === 'settings' 
                ? 'border-emerald-500 text-emerald-400' 
                : 'border-transparent text-zinc-400 hover:text-zinc-200'
            }`}
          >
            <Settings2 className="w-4 h-4" /> Параметры
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-4 sm:p-5 overflow-y-auto space-y-4">
          {activeTab === 'progression' && (
            <div className="space-y-4">
              {/* Main Badge Card */}
              <div className={`p-4 rounded-xl border ${
                recommendation.badgeColor === 'emerald'
                  ? 'bg-emerald-950/30 border-emerald-500/40 text-emerald-200'
                  : recommendation.badgeColor === 'amber'
                  ? 'bg-amber-950/30 border-amber-500/40 text-amber-200'
                  : recommendation.badgeColor === 'purple'
                  ? 'bg-purple-950/30 border-purple-500/40 text-purple-200'
                  : 'bg-blue-950/30 border-blue-500/40 text-blue-200'
              }`}>
                <div className="flex items-center justify-between mb-2">
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
                <p className="text-xs leading-relaxed text-zinc-300">
                  {recommendation.analysis}
                </p>
                <div className="mt-3 pt-3 border-t border-white/10 text-xs font-medium text-white flex items-center gap-2">
                  <span className="text-emerald-400">⚡ План:</span> {recommendation.suggestedAction}
                </div>
              </div>

              {/* Formula & Rules Breakdown */}
              <div className="bg-zinc-950 p-4 rounded-xl border border-zinc-800 space-y-2">
                <span className="text-xs font-bold text-zinc-400 uppercase tracking-wider block mb-2">
                  Параметры двойной прогрессии
                </span>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div className="bg-zinc-900 p-2.5 rounded-lg border border-zinc-800/80">
                    <span className="text-zinc-500 block">Диапазон повторений:</span>
                    <span className="font-mono font-bold text-sm text-zinc-100">
                      {exercise.minReps} - {exercise.maxReps} повт.
                    </span>
                  </div>
                  <div className="bg-zinc-900 p-2.5 rounded-lg border border-zinc-800/80">
                    <span className="text-zinc-500 block">Рабочих подходов:</span>
                    <span className="font-mono font-bold text-sm text-zinc-100">
                      {exercise.targetSets} подхода
                    </span>
                  </div>
                  <div className="bg-zinc-900 p-2.5 rounded-lg border border-zinc-800/80">
                    <span className="text-zinc-500 block">Шаг веса (+ΔW):</span>
                    <span className="font-mono font-bold text-sm text-emerald-400">
                      +{exercise.weightStep} кг
                    </span>
                  </div>
                  <div className="bg-zinc-900 p-2.5 rounded-lg border border-zinc-800/80">
                    <span className="text-zinc-500 block">Отдых между сетами:</span>
                    <span className="font-mono font-bold text-sm text-zinc-100">
                      {exercise.restSeconds} сек.
                    </span>
                  </div>
                </div>
              </div>

              {/* 1RM Trend Visualization */}
              <div className="bg-zinc-950 p-4 rounded-xl border border-zinc-800">
                <div className="flex justify-between items-center mb-3">
                  <span className="text-xs font-bold text-zinc-400 uppercase tracking-wider">
                    Оценка 1RM (Расчетный максимум)
                  </span>
                  <span className="text-xs font-mono font-bold text-emerald-400">
                    ~{Math.round(calculate1RM(exercise.currentWeight, exercise.minReps))} кг
                  </span>
                </div>
                
                {historyPoints.length === 0 ? (
                  <p className="text-zinc-500 text-xs text-center py-4">
                    Завершите первую тренировку для построения графика прогресса.
                  </p>
                ) : (
                  <div className="space-y-2">
                    <div className="flex items-end gap-2 h-24 pt-4 border-b border-zinc-800">
                      {historyPoints.map((pt, i) => {
                        const heightPct = Math.max(15, Math.min(100, (pt.oneRM / maxOneRM) * 100));
                        return (
                          <div key={i} className="flex-1 flex flex-col items-center gap-1 group relative">
                            {/* Hover tooltip */}
                            <div className="absolute -top-7 hidden group-hover:block bg-zinc-800 text-[10px] px-1.5 py-0.5 rounded shadow z-10 whitespace-nowrap">
                              {pt.oneRM} кг ({pt.date})
                            </div>
                            <div 
                              style={{ height: `${heightPct}%` }}
                              className="w-full bg-emerald-500/80 group-hover:bg-emerald-400 rounded-t transition-all"
                            />
                            <span className="text-[9px] text-zinc-500 truncate w-full text-center">
                              {pt.date}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {activeTab === 'history' && (
            <div className="space-y-3">
              {exercise.history.length === 0 ? (
                <p className="text-zinc-500 text-sm text-center py-8">
                  История подходов пуста. Начните тренировку!
                </p>
              ) : (
                [...exercise.history].reverse().map(session => (
                  <div key={session.id} className="bg-zinc-950 border border-zinc-800/80 rounded-xl p-3.5 space-y-2">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-semibold text-zinc-300">
                        {new Date(session.date).toLocaleDateString('ru-RU', { 
                          day: 'numeric', 
                          month: 'long', 
                          year: 'numeric' 
                        })}
                      </span>
                      <span className="font-mono font-bold text-emerald-400">
                        Вес: {session.weight} кг
                      </span>
                    </div>

                    {/* Sets pills */}
                    <div className="flex flex-wrap gap-2 pt-1">
                      {session.sets.map(s => (
                        <div 
                          key={s.setNumber}
                          className="bg-zinc-900 border border-zinc-700/60 px-2.5 py-1 rounded-lg text-xs font-mono text-zinc-200"
                        >
                          Сет {s.setNumber}: <span className="font-bold text-emerald-400">{s.reps}</span> повт.
                          {s.rpe && <span className="text-zinc-500 text-[10px] ml-1">@RPE{s.rpe}</span>}
                        </div>
                      ))}
                    </div>

                    <div className="flex items-center justify-between text-[11px] text-zinc-500 pt-1 border-t border-zinc-900">
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
                <label className="block text-xs uppercase tracking-wider text-zinc-400 font-semibold mb-1">
                  Текущий рабочий вес (кг)
                </label>
                <input
                  type="number"
                  step="0.5"
                  value={weight}
                  onChange={e => setWeight(parseFloat(e.target.value) || 0)}
                  className="w-full bg-zinc-950 border border-zinc-700 rounded-xl px-4 py-2.5 font-mono text-lg font-bold text-emerald-400 focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs uppercase tracking-wider text-zinc-400 font-semibold mb-1">
                    Мин. повторений
                  </label>
                  <input
                    type="number"
                    value={minReps}
                    onChange={e => setMinReps(parseInt(e.target.value) || 1)}
                    className="w-full bg-zinc-950 border border-zinc-700 rounded-xl px-3 py-2 font-mono text-sm text-zinc-100"
                  />
                </div>
                <div>
                  <label className="block text-xs uppercase tracking-wider text-zinc-400 font-semibold mb-1">
                    Макс. повторений
                  </label>
                  <input
                    type="number"
                    value={maxReps}
                    onChange={e => setMaxReps(parseInt(e.target.value) || 1)}
                    className="w-full bg-zinc-950 border border-zinc-700 rounded-xl px-3 py-2 font-mono text-sm text-zinc-100"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs uppercase tracking-wider text-zinc-400 font-semibold mb-1">
                    Кол-во подходов
                  </label>
                  <input
                    type="number"
                    value={targetSets}
                    onChange={e => setTargetSets(parseInt(e.target.value) || 1)}
                    className="w-full bg-zinc-950 border border-zinc-700 rounded-xl px-3 py-2 font-mono text-sm text-zinc-100"
                  />
                </div>
                <div>
                  <label className="block text-xs uppercase tracking-wider text-zinc-400 font-semibold mb-1">
                    Шаг веса (+кг)
                  </label>
                  <input
                    type="number"
                    step="0.5"
                    value={weightStep}
                    onChange={e => setWeightStep(parseFloat(e.target.value) || 0.5)}
                    className="w-full bg-zinc-950 border border-zinc-700 rounded-xl px-3 py-2 font-mono text-sm text-zinc-100"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs uppercase tracking-wider text-zinc-400 font-semibold mb-1">
                  Отдых между подходами (сек.)
                </label>
                <div className="flex gap-2">
                  {[60, 90, 120, 180].map(sec => (
                    <button
                      key={sec}
                      type="button"
                      onClick={() => setRestSeconds(sec)}
                      className={`flex-1 py-2 rounded-xl text-xs font-semibold transition ${
                        restSeconds === sec 
                          ? 'bg-emerald-500 text-black font-bold' 
                          : 'bg-zinc-800 text-zinc-300 hover:bg-zinc-700'
                      }`}
                    >
                      {sec}с
                    </button>
                  ))}
                </div>
              </div>

              <button
                type="button"
                onClick={handleSaveSettings}
                className="w-full mt-4 py-3 bg-emerald-500 hover:bg-emerald-400 text-black font-bold rounded-xl transition"
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
