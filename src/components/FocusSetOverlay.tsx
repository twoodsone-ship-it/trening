import React, { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { Check, Clock, Minus, Plus, X, Play } from 'lucide-react';
import { EXERCISE_GIF_MAP } from '../data/exerciseCatalog';
import type { ActiveExerciseSession, WorkoutSet } from '../types';
import { muscleCategoryLabel } from '../utils/uiLabels';
import { isWarmupSet, previousSetFor } from '../utils/workoutHelpers';
import { cn } from '../utils/cn';

interface FocusSetOverlayProps {
  exercise: ActiveExerciseSession;
  set: WorkoutSet;
  setIndex: number;
  exerciseNumber: number;
  exerciseCount: number;
  showIntroduction: boolean;
  onConfirmIntroduction: () => void;
  onClose: () => void;
  onWeightDelta: (delta: number) => void;
  onRepsDelta: (delta: number) => void;
  onDurationDelta: (deltaSeconds: number) => void;
  onComplete: () => void;
}

function formatMmSs(total: number): string {
  const m = Math.floor(total / 60);
  const s = total % 60;
  return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
}

function tipForExercise(exercise: ActiveExerciseSession): string {
  if (exercise.technique?.setup) return exercise.technique.setup;
  if (exercise.technique?.execution) return exercise.technique.execution;
  if (exercise.category === 'Cardio') return 'Начни спокойно, держи ровное дыхание и темп, который можешь контролировать.';
  return 'Двигайся плавно, сохраняй устойчивое положение и прекращай подход при боли.';
}

function shortCue(text: string): string {
  const firstSentence = text.split(/(?<=[.!?])\s/)[0];
  return firstSentence.length > 105 ? `${firstSentence.slice(0, 102).trimEnd()}…` : firstSentence;
}

export const FocusSetOverlay: React.FC<FocusSetOverlayProps> = ({
  exercise,
  set,
  setIndex,
  exerciseNumber,
  exerciseCount,
  showIntroduction,
  onConfirmIntroduction,
  onClose,
  onWeightDelta,
  onRepsDelta,
  onDurationDelta,
  onComplete
}) => {
  const prev = previousSetFor(set, exercise.previousPerformance?.sets);
  const isTrial = isWarmupSet(set);
  const [elapsed, setElapsed] = useState(0);
  const [animationOpen, setAnimationOpen] = useState(false);
  const [animationFailed, setAnimationFailed] = useState(false);
  const [animationLoaded, setAnimationLoaded] = useState(false);
  const animationUrl = exercise.gifUrl || EXERCISE_GIF_MAP[exercise.exerciseId];
  const setupTip = exercise.technique?.setup || tipForExercise(exercise);
  const executionTip = exercise.technique?.execution || (exercise.category === 'Cardio'
    ? 'Держи ровный темп и дыхание. При необходимости снизь скорость.'
    : 'Контролируй движение в обе стороны. Не используй рывок и не продолжай через боль.');
  const restHint = isTrial ? 30 : exercise.restSeconds || 90;
  const isBodyweight = exercise.weightStep === 0 || (exercise.targetWeight === 0 && exercise.category === 'Cardio');
  const isTimed = exercise.trackingMode === 'duration';
  const durationStep = (exercise.defaultDurationSeconds || 60) < 90 ? 15 : 60;
  const formatDuration = (value: number) => {
    const safe = Math.max(0, value);
    return `${Math.floor(safe / 60).toString().padStart(2, '0')}:${(safe % 60).toString().padStart(2, '0')}`;
  };

  useEffect(() => {
    if (showIntroduction || animationOpen) return;
    const id = setInterval(() => setElapsed(e => e + 1), 1000);
    return () => clearInterval(id);
  }, [showIntroduction, animationOpen]);

  useEffect(() => {
    const close = (event: KeyboardEvent) => { if (event.key === 'Escape') setAnimationOpen(false); };
    window.addEventListener('keydown', close);
    return () => window.removeEventListener('keydown', close);
  }, []);

  if (typeof document === 'undefined') return null;

  return createPortal(
    <div className="fixed inset-0 z-[220] bg-app-atmosphere flex flex-col text-white animate-fade-in">
      <div className="flex items-center justify-between px-4 pt-[max(1rem,env(safe-area-inset-top))] pb-2">
        <button
          type="button"
          onClick={onClose}
          className="p-2.5 rounded-xl surface-panel min-h-[44px] min-w-[44px] flex items-center justify-center"
          aria-label="Закрыть"
        >
          <X className="w-5 h-5" />
        </button>
        <div className="flex items-center gap-2 font-mono text-2xl text-lime">
          <Clock className="w-5 h-5" />
          <span className="font-bold tabular-nums">{formatMmSs(elapsed)}</span>
        </div>
        <div className="text-[10px] font-bold uppercase tracking-wider text-muted text-right leading-tight">
          отдых
          <br />
          <span className="text-white/80 font-mono">{restHint}с</span>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-4 pb-[max(1.25rem,env(safe-area-inset-bottom))]">
        <div className="max-w-md mx-auto flex flex-col gap-4 min-h-full justify-center py-2">
          <div className="flex items-center justify-between text-xs text-muted border-b border-white/10 pb-3">
            <span>Упражнение <strong className="text-white">{exerciseNumber} из {exerciseCount}</strong></span>
            <span>{muscleCategoryLabel(exercise.category)}</span>
          </div>
          {showIntroduction && <p role="status" className="text-lime font-bold text-center text-lg">Следующее упражнение</p>}
          <div className="text-center space-y-1">
            <p className="text-xs font-bold uppercase tracking-wider text-lime">
              {isTrial ? 'Пробный подход' : `${muscleCategoryLabel(exercise.category)} · подход ${set.setNumber || setIndex + 1}`}
            </p>
            <h2 className="font-display text-3xl sm:text-4xl font-bold text-white leading-[0.98]">
              {exercise.name}
            </h2>
            {showIntroduction && <p className="text-sm text-muted pt-2">Подготовь оборудование и посмотри технику перед стартом.</p>}
            {isTrial && <p className="text-sm text-muted">Лёгкий вес для знакомства с движением.</p>}
            {!isTrial && prev && (
              <p className="text-sm text-muted font-mono">Прошлый: {isTimed ? formatDuration(prev.durationSeconds || 0) : `${prev.weight} кг × ${prev.reps}`}</p>
            )}
          </div>

          <button type="button" onClick={() => setAnimationOpen(true)} className="min-h-[48px] rounded-xl border border-white/15 flex items-center justify-center gap-2 text-sm font-semibold"><Play className="w-4 h-4 text-lime" /> Посмотреть анимацию</button>

          <div className="border-l-2 border-lime pl-3 text-sm leading-snug text-white/85">
            <p><span className="text-lime font-semibold">Старт:</span> {shortCue(setupTip)}</p>
            <p className="mt-1"><span className="text-lime font-semibold">Движение:</span> {shortCue(executionTip)}</p>
            <details className="mt-2 text-xs text-muted">
              <summary className="cursor-pointer min-h-[36px] flex items-center">Подробная техника</summary>
              <p className="mt-1">{setupTip}</p>
              <p className="mt-2">{executionTip}</p>
              {exercise.technique?.breathing && <p className="mt-2">Дыхание: {exercise.technique.breathing}</p>}
            </details>
          </div>

          {!showIntroduction && <div className="space-y-3">
            {!isBodyweight && (
              <FocusStepper
                label="Вес · кг"
                value={set.weight}
                onMinus={() => onWeightDelta(-exercise.weightStep || -2.5)}
                onPlus={() => onWeightDelta(+(exercise.weightStep || 2.5))}
              />
            )}
            {exercise.cardioIntensity && (
              <p className="text-[10px] text-sky-300 font-semibold uppercase tracking-wider">
                {exercise.cardioIntensity === 'intervals' ? 'Интервалы' : exercise.cardioIntensity === 'easy' ? 'Лёгкий темп' : 'Умеренный темп'}
              </p>
            )}
            {isTimed ? (
              <FocusStepper
                label="Длительность"
                displayValue={formatDuration(set.durationSeconds ?? exercise.defaultDurationSeconds ?? 60)}
                onMinus={() => onDurationDelta(-durationStep)}
                onPlus={() => onDurationDelta(durationStep)}
              />
            ) : (
              <FocusStepper
                label="Повторения"
                value={set.reps}
                onMinus={() => onRepsDelta(-1)}
                onPlus={() => onRepsDelta(+1)}
              />
            )}
          </div>}

          <button
            type="button"
            onClick={showIntroduction ? onConfirmIntroduction : onComplete}
            className={cn(
              'w-full py-5 rounded-3xl font-black text-lg flex items-center justify-center gap-2 min-h-[64px] active:scale-95 transition',
              set.completed ? 'bg-white/10 text-muted' : 'btn-lime animate-pulse-ring'
            )}
          >
            <Check className="w-6 h-6" />
            {showIntroduction ? 'Готов, начать упражнение' : set.completed ? 'Подход отмечен' : isTrial ? 'Пробный подход выполнен' : isTimed ? 'Интервал выполнен' : 'Подход выполнен'}
          </button>
        </div>
      </div>
      {animationOpen && <div role="dialog" aria-modal="true" aria-label={`Анимация: ${exercise.name}`} className="fixed inset-0 z-[230] bg-ink p-4 pt-[max(1rem,env(safe-area-inset-top))] pb-[max(1rem,env(safe-area-inset-bottom))] flex flex-col gap-4">
        <header className="flex items-center justify-between gap-3"><h3 className="font-bold text-base">{exercise.name}</h3><button autoFocus type="button" onClick={() => setAnimationOpen(false)} aria-label="Закрыть анимацию" className="w-12 h-12 shrink-0 rounded-xl bg-white/10 flex items-center justify-center"><X /></button></header>
        <div className="flex-1 min-h-0 flex items-center justify-center rounded-2xl bg-white/[0.04] overflow-hidden relative">
          {animationUrl && !animationFailed ? <><img src={animationUrl} alt={`Техника выполнения: ${exercise.name}`} onLoad={() => setAnimationLoaded(true)} onError={() => setAnimationFailed(true)} className="w-full h-full object-contain" />{!animationLoaded && <p className="absolute text-sm text-muted">Загрузка анимации…</p>}</> : <div className="p-5 text-sm text-muted"><p className="font-semibold text-white mb-3">{animationUrl ? 'Анимация не загрузилась. Проверь подключение к интернету.' : 'Для этого упражнения анимации пока нет.'}</p><p>{setupTip}</p><p className="mt-3">{executionTip}</p></div>}
        </div>
        <button type="button" onClick={() => setAnimationOpen(false)} className="btn-lime min-h-[52px] rounded-xl font-bold">Вернуться к упражнению</button>
      </div>}
    </div>,
    document.body
  );
};

function FocusStepper({
  label,
  value,
  displayValue,
  onMinus,
  onPlus
}: {
  label: string;
  value?: number;
  displayValue?: string;
  onMinus: () => void;
  onPlus: () => void;
}) {
  return (
    <div className="surface-panel p-3 flex items-center justify-between gap-3">
      <button
        type="button"
        onClick={onMinus}
        className="w-14 h-14 rounded-2xl bg-white/5 flex items-center justify-center"
        aria-label={`Уменьшить ${label}`}
      >
        <Minus className="w-6 h-6" />
      </button>
      <div className="text-center">
        <p className="text-[11px] font-bold uppercase tracking-wider text-muted">{label}</p>
        <p className="font-mono text-4xl font-black text-white tabular-nums">{displayValue ?? value}</p>
      </div>
      <button
        type="button"
        onClick={onPlus}
        className="w-14 h-14 rounded-2xl bg-white/5 flex items-center justify-center"
        aria-label={`Увеличить ${label}`}
      >
        <Plus className="w-6 h-6" />
      </button>
    </div>
  );
}
