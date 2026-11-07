import React from 'react';
import { X, RefreshCw, AlertTriangle, Wind, Target } from 'lucide-react';
import type { ExerciseTechniqueGuide, EquipmentType } from '../types/index.ts';
import { ExerciseAnimation } from './ExerciseAnimation';
import { muscleCategoryLabel } from '../utils/uiLabels';
import { useDialogA11y } from '../hooks/useDialogA11y';

interface ExerciseTechniqueModalProps {
  exerciseId?: string;
  exerciseName: string;
  category: string;
  equipment?: EquipmentType;
  animationType: string;
  gifUrl?: string;
  technique?: ExerciseTechniqueGuide;
  isOpen: boolean;
  onClose: () => void;
  onOpenSwapModal?: () => void;
}

const EQUIPMENT_LABELS: Record<string, string> = {
  barbell: 'Штанга',
  dumbbell: 'Гантели',
  cable: 'Блочный тренажер',
  machine: 'Тренажер / Хаммер',
  smith: 'Тренажер Смита',
  bodyweight: 'Собственный вес'
};

export const ExerciseTechniqueModal: React.FC<ExerciseTechniqueModalProps> = ({
  exerciseId,
  exerciseName,
  category,
  equipment = 'barbell',
  animationType,
  gifUrl,
  technique,
  isOpen,
  onClose,
  onOpenSwapModal
}) => {
  const { containerRef, dialogProps } = useDialogA11y({
    isOpen,
    onClose,
    titleId: 'exercise-technique-title'
  });

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-2.5 sm:p-4 bg-black/75 backdrop-blur-sm animate-fade-in text-white">
      <div ref={containerRef} {...dialogProps} className="w-full max-w-lg bg-ink-2 border border-white/10 rounded-[1.75rem] shadow-2xl max-h-[min(92dvh,calc(100dvh-1.5rem))] flex flex-col overflow-hidden">
        <div className="flex items-center justify-between p-3.5 sm:p-4 border-b border-white/10 bg-ink/80 gap-2">
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-1.5 flex-wrap">
              <span className="text-xs font-bold uppercase tracking-wider text-lime bg-lime/10 border border-lime/30 px-2 py-0.5 rounded-full">
                {muscleCategoryLabel(category)}
              </span>
              <span className="text-xs font-semibold text-muted bg-white/5 border border-white/10 px-2 py-0.5 rounded-full">
                {EQUIPMENT_LABELS[equipment] || equipment}
              </span>
            </div>
            <h3 id="exercise-technique-title" className="font-bold text-base sm:text-lg text-white mt-1 truncate">{exerciseName}</h3>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="w-11 h-11 flex items-center justify-center text-muted hover:text-white rounded-xl hover:bg-white/5 active:scale-95 transition shrink-0"
            aria-label="Закрыть"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-4 sm:p-5 overflow-y-auto space-y-4 pb-[max(1rem,env(safe-area-inset-bottom))]">
          <ExerciseAnimation
            exerciseId={exerciseId}
            gifUrl={gifUrl}
            animationType={animationType}
            category={category}
            exerciseName={exerciseName}
            technique={technique}
          />

          {onOpenSwapModal && (
            <button
              type="button"
              onClick={() => {
                onClose();
                onOpenSwapModal();
              }}
              className="w-full min-h-[48px] py-3 px-4 bg-lime/10 hover:bg-lime/15 border border-lime/30 rounded-2xl text-xs sm:text-sm font-bold text-lime flex items-center justify-center gap-2 transition"
            >
              <RefreshCw className="w-4 h-4" />
              <span>Тренажер занят или его нет в зале? Нажмите для замены</span>
            </button>
          )}

          {technique ? (
            <div className="space-y-3 text-xs sm:text-sm">
              <div className="surface-panel p-3.5">
                <div className="flex items-center gap-2 text-lime font-bold mb-1">
                  <Target className="w-4 h-4" />
                  <span>Работающие мышцы</span>
                </div>
                <p className="text-white/85 leading-relaxed font-medium">{technique.primaryMuscles}</p>
              </div>

              <div className="surface-panel p-3.5">
                <span className="font-bold text-white block mb-1">1. Исходное положение</span>
                <p className="text-muted leading-relaxed">{technique.setup}</p>
              </div>

              <div className="surface-panel p-3.5">
                <span className="font-bold text-white block mb-1">2. Техника движения</span>
                <p className="text-muted leading-relaxed">{technique.execution}</p>
              </div>

              <div className="rounded-2xl border border-sky-400/30 bg-sky-500/10 p-3.5">
                <div className="flex items-center gap-2 text-sky-300 font-bold mb-1">
                  <Wind className="w-4 h-4" />
                  <span>3. Правильное дыхание</span>
                </div>
                <p className="text-white/85 leading-relaxed font-medium">{technique.breathing}</p>
              </div>

              {technique.mistakes && technique.mistakes.length > 0 && (
                <div className="rounded-2xl border border-amber-400/30 bg-amber-500/10 p-3.5">
                  <div className="flex items-center gap-2 text-amber-300 font-bold mb-1.5">
                    <AlertTriangle className="w-4 h-4" />
                    <span>Частые ошибки</span>
                  </div>
                  <ul className="list-disc list-inside space-y-1 text-white/80">
                    {technique.mistakes.map((m, idx) => (
                      <li key={idx} className="leading-relaxed">{m}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          ) : (
            <p className="text-muted text-center py-4 text-xs">
              Техника выполняется подконтрольно с прямой спиной и фиксацией в конечной точке.
            </p>
          )}
        </div>

        <div className="p-3 border-t border-white/10 bg-ink/80 flex justify-end pb-[max(0.75rem,env(safe-area-inset-bottom))]">
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-3 min-h-[48px] btn-lime rounded-xl text-xs sm:text-sm"
          >
            Закрыть
          </button>
        </div>
      </div>
    </div>
  );
};
