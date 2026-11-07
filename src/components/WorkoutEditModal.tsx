import React, { useState, useEffect } from 'react';
import { X, Check } from 'lucide-react';
import type { CompletedWorkout } from '../types';
import { RpePickerModal } from './RpePickerModal';
import { sanitizeNumber } from '../utils/workoutMath';
import { roundWeight } from '../utils/roundWeight';
import { useDialogA11y } from '../hooks/useDialogA11y';

interface WorkoutEditModalProps {
  isOpen: boolean;
  workout: CompletedWorkout | null;
  onClose: () => void;
  onSave: (updated: CompletedWorkout) => void;
}

export const WorkoutEditModal: React.FC<WorkoutEditModalProps> = ({
  isOpen,
  workout,
  onClose,
  onSave
}) => {
  const [draft, setDraft] = useState<CompletedWorkout | null>(workout);
  const [rpeTarget, setRpeTarget] = useState<{ exIdx: number; setIdx: number } | null>(null);

  useEffect(() => {
    setDraft(workout ? JSON.parse(JSON.stringify(workout)) : null);
  }, [workout]);

  const { containerRef, dialogProps } = useDialogA11y({
    isOpen,
    onClose,
    titleId: 'workout-edit-title'
  });

  if (!isOpen || !draft) return null;

  const handleWeightChange = (exIdx: number, setIdx: number, val: string) => {
    const num = roundWeight(sanitizeNumber(val, 1000));
    setDraft(prev => {
      if (!prev) return null;
      const next = { ...prev, exercises: [...prev.exercises] };
      const ex = { ...next.exercises[exIdx], sets: [...next.exercises[exIdx].sets] };
      ex.sets[setIdx] = { ...ex.sets[setIdx], weight: num };
      next.exercises[exIdx] = ex;
      return next;
    });
  };

  const handleRepsChange = (exIdx: number, setIdx: number, val: string) => {
    const num = Math.round(sanitizeNumber(val, 500));
    setDraft(prev => {
      if (!prev) return null;
      const next = { ...prev, exercises: [...prev.exercises] };
      const ex = { ...next.exercises[exIdx], sets: [...next.exercises[exIdx].sets] };
      ex.sets[setIdx] = { ...ex.sets[setIdx], reps: num };
      next.exercises[exIdx] = ex;
      return next;
    });
  };

  const handleRpeConfirm = (rpe: number) => {
    if (!rpeTarget) return;
    const { exIdx, setIdx } = rpeTarget;
    setDraft(prev => {
      if (!prev) return null;
      const next = { ...prev, exercises: [...prev.exercises] };
      const ex = { ...next.exercises[exIdx], sets: [...next.exercises[exIdx].sets] };
      ex.sets[setIdx] = { ...ex.sets[setIdx], rpe };
      next.exercises[exIdx] = ex;
      return next;
    });
    setRpeTarget(null);
  };

  const currentRpeExercise = rpeTarget ? draft.exercises[rpeTarget.exIdx] : null;
  const currentRpeSet = rpeTarget && currentRpeExercise ? currentRpeExercise.sets[rpeTarget.setIdx] : null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
      <div ref={containerRef} {...dialogProps} className="w-full max-w-lg surface-panel bg-ink-2 border border-white/10 rounded-2xl max-h-[90vh] max-h-[90dvh] flex flex-col text-white shadow-2xl">
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-white/10 flex items-center justify-between gap-3">
          <div>
            <h2 id="workout-edit-title" className="font-display text-xl font-bold text-white">Редактировать тренировку</h2>
            <p className="text-xs text-muted mt-0.5">
              {draft.templateName} • {new Date(draft.endTime).toLocaleDateString('ru-RU', { day: 'numeric', month: 'short' })}
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Закрыть"
            className="min-h-[44px] min-w-[44px] flex items-center justify-center rounded-xl bg-white/5 hover:bg-white/10 text-muted hover:text-white transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Exercises list */}
        <div className="flex-1 overflow-y-auto p-3 sm:p-4 space-y-4">
          {draft.exercises.map((ex, exIdx) => (
            <div key={ex.exerciseId} className="bg-white/[0.03] border border-white/10 rounded-2xl p-3.5 space-y-2.5">
              <div className="flex justify-between items-center">
                <span className="font-bold text-sm text-white">{ex.name}</span>
                <span className="text-xs text-muted font-mono uppercase">{ex.category}</span>
              </div>

              <div className="space-y-2">
                {ex.sets.map((s, setIdx) => (
                  <div key={s.setNumber} className="flex items-center gap-2 text-xs bg-white/[0.02] p-2 rounded-xl border border-white/5">
                    <span className="font-mono text-muted w-12 shrink-0">
                      {s.type === 'warmup' || s.isWarmup ? 'Разминка' : `Сет ${s.setNumber}`}
                    </span>

                    <div className="flex items-center gap-1.5 flex-1 min-w-0">
                      <div className="flex items-center gap-1">
                        <input
                          type="number"
                          step="0.5"
                          min="0"
                          value={s.weight}
                          onChange={e => handleWeightChange(exIdx, setIdx, e.target.value)}
                          className="min-h-[44px] w-20 text-center rounded-xl bg-white/5 border border-white/10 text-white font-mono font-bold text-base focus:border-lime focus:outline-none"
                          aria-label={`Вес для подхода ${s.setNumber}`}
                        />
                        <span className="text-muted text-xs">кг</span>
                      </div>

                      <div className="flex items-center gap-1">
                        <input
                          type="number"
                          step="1"
                          min="0"
                          value={s.reps}
                          onChange={e => handleRepsChange(exIdx, setIdx, e.target.value)}
                          className="min-h-[44px] w-16 text-center rounded-xl bg-white/5 border border-white/10 text-white font-mono font-bold text-base focus:border-lime focus:outline-none"
                          aria-label={`Повторения для подхода ${s.setNumber}`}
                        />
                        <span className="text-muted text-xs">повт</span>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => setRpeTarget({ exIdx, setIdx })}
                      className="min-h-[44px] min-w-[44px] px-2.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 font-mono text-xs font-bold text-lime shrink-0"
                    >
                      {s.rpe ? `@${s.rpe}` : 'RPE'}
                    </button>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Footer */}
        <div className="p-3 sm:p-4 border-t border-white/10 flex gap-2 sm:gap-3 bg-ink-2">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 min-h-[48px] rounded-xl bg-white/5 hover:bg-white/10 text-white font-semibold text-sm transition"
          >
            Отмена
          </button>
          <button
            type="button"
            onClick={() => onSave(draft)}
            className="flex-[1.5] min-h-[48px] rounded-xl btn-lime text-ink font-bold text-sm flex items-center justify-center gap-2 transition"
          >
            <Check className="w-4 h-4" /> Сохранить
          </button>
        </div>
      </div>

      {/* RPE Picker for active set */}
      {rpeTarget && currentRpeExercise && currentRpeSet && (
        <RpePickerModal
          isOpen={true}
          initialRpe={currentRpeSet.rpe ?? 8}
          exerciseName={currentRpeExercise.name}
          setLabel={`Сет ${currentRpeSet.setNumber}`}
          onConfirm={handleRpeConfirm}
          onSkip={() => setRpeTarget(null)}
        />
      )}
    </div>
  );
};
