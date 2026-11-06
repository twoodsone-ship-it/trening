import React, { useEffect, useMemo, useState } from 'react';
import { createPortal } from 'react-dom';
import { Check, Clock, Minus, Plus, X } from 'lucide-react';
import type { ActiveExerciseSession, WorkoutSet } from '../types';
import { EXERCISE_GIF_MAP } from '../data/exerciseCatalog';
import { cn } from '../utils/cn';

interface FocusSetOverlayProps {
  exercise: ActiveExerciseSession;
  set: WorkoutSet;
  setIndex: number;
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
  if (exercise.category === 'Cardio') return 'Ровное дыхание, контролируемый темп, без жёстких приземлений.';
  if (exercise.category === 'Core') return 'Нейтральная поясница, рёбра вниз, выдох на сокращении.';
  return 'Контролируйте негатив, фиксируйте пик 0.5 сек, без рывков.';
}

export const FocusSetOverlay: React.FC<FocusSetOverlayProps> = ({
  exercise,
  set,
  setIndex,
  onClose,
  onWeightDelta,
  onRepsDelta,
  onDurationDelta,
  onComplete
}) => {
  const prev = exercise.previousPerformance?.sets[setIndex];
  const [elapsed, setElapsed] = useState(0);
  const [gifError, setGifError] = useState(false);

  const gifUrl =
    exercise.gifUrl ||
    (exercise.exerciseId && EXERCISE_GIF_MAP[exercise.exerciseId]) ||
    undefined;

  const tip = useMemo(() => tipForExercise(exercise), [exercise]);
  const restHint = exercise.restSeconds || 90;
  const isBodyweight = exercise.weightStep === 0 || (exercise.targetWeight === 0 && exercise.category === 'Cardio');
  const isTimed = exercise.trackingMode === 'duration';
  const durationStep = (exercise.defaultDurationSeconds || 60) < 90 ? 15 : 60;
  const formatDuration = (value: number) => {
    const safe = Math.max(0, value);
    return `${Math.floor(safe / 60).toString().padStart(2, '0')}:${(safe % 60).toString().padStart(2, '0')}`;
  };

  useEffect(() => {
    setElapsed(0);
    const id = setInterval(() => setElapsed(e => e + 1), 1000);
    return () => clearInterval(id);
  }, [exercise.exerciseId, setIndex]);

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
        <div className="flex items-center gap-2 font-mono text-sm text-lime">
          <Clock className="w-4 h-4" />
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
          <div className="text-center space-y-1">
            <p className="text-xs font-bold uppercase tracking-wider text-lime">
              {exercise.category} · сет {set.setNumber || setIndex + 1}
            </p>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-white leading-tight">
              {exercise.name}
            </h2>
            {prev && (
              <p className="text-sm text-muted font-mono">Прошлый: {prev.weight}×{prev.reps}</p>
            )}
          </div>

          {/* Technique preview */}
          <div className="surface-panel overflow-hidden">
            <div className="flex gap-3 p-3">
              <div className="w-[42%] shrink-0 rounded-2xl bg-ink border border-white/10 min-h-[120px] flex items-center justify-center overflow-hidden">
                {gifUrl && !gifError ? (
                  <img
                    src={gifUrl}
                    alt={exercise.name}
                    className="w-full h-full max-h-36 object-contain"
                    onError={() => setGifError(true)}
                  />
                ) : (
                  <div className="p-3 text-center">
                    <p className="text-[10px] font-bold uppercase tracking-wider text-lime mb-1">Фаза</p>
                    <p className="text-xs text-white/80 leading-snug line-clamp-4">
                      {exercise.technique?.execution?.slice(0, 90) || tip.slice(0, 90)}
                    </p>
                  </div>
                )}
              </div>
              <div className="flex-1 min-w-0 flex flex-col justify-center gap-2">
                <p className="text-[10px] font-bold uppercase tracking-wider text-muted">Как делать</p>
                <p className="text-sm leading-snug text-white/90 line-clamp-5">{tip}</p>
                {exercise.technique?.primaryMuscles && (
                  <p className="text-[11px] text-lime font-semibold truncate">
                    {exercise.technique.primaryMuscles}
                  </p>
                )}
              </div>
            </div>
          </div>

          <div className="space-y-3">
            {!isBodyweight && (
              <FocusStepper
                label="Вес, кг"
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
          </div>

          <button
            type="button"
            onClick={onComplete}
            className={cn(
              'w-full py-5 rounded-3xl font-black text-lg flex items-center justify-center gap-2 min-h-[64px] active:scale-95 transition',
              set.completed ? 'bg-white/10 text-muted' : 'btn-lime animate-pulse-ring'
            )}
          >
            <Check className="w-6 h-6" />
            {set.completed ? 'Сет отмечен' : isTimed ? 'Интервал выполнен' : 'Подход выполнен'}
          </button>
        </div>
      </div>
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
