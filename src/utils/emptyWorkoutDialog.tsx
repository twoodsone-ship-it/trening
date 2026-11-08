import React from 'react';
import { hasAnyValidCompletedSets, type ExerciseOrSessionLike } from './sessionValidation';
import { useDialogA11y } from '../hooks/useDialogA11y';

export type EmptyWorkoutDialogAction = 'cancel' | 'discard' | 'save_empty';

/**
 * Checks if the workout completion flow should prompt the user
 * with the empty workout confirmation dialog.
 * Prompts if NO exercise has at least one valid completed set.
 */
export function shouldPromptEmptyWorkoutFinish(exercises: ExerciseOrSessionLike[]): boolean {
  return !hasAnyValidCompletedSets(exercises);
}

/**
 * Pure decision resolver for empty workout dialog actions.
 */
export function resolveEmptyWorkoutFinishAction(action: EmptyWorkoutDialogAction): {
  save: boolean;
  cancelSession: boolean;
  dismissDialog: boolean;
} {
  switch (action) {
    case 'discard':
      return { save: false, cancelSession: true, dismissDialog: true };
    case 'save_empty':
      return { save: true, cancelSession: false, dismissDialog: true };
    case 'cancel':
    default:
      return { save: false, cancelSession: false, dismissDialog: true };
  }
}

export interface EmptyWorkoutConfirmModalProps {
  isOpen: boolean;
  onDiscard: () => void;
  onSaveEmpty: () => void;
  onBack: () => void;
}

export const EmptyWorkoutConfirmModal: React.FC<EmptyWorkoutConfirmModalProps> = ({
  isOpen,
  onDiscard,
  onSaveEmpty,
  onBack
}) => {
  const { containerRef, dialogProps } = useDialogA11y({
    dialogId: 'empty-workout-confirm-dialog',
    isOpen,
    onClose: onBack,
    titleId: 'empty-workout-title'
  });

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
      <div
        ref={containerRef}
        {...dialogProps}
        className="w-full max-w-sm surface-panel p-5 border border-zinc-800 rounded-2xl shadow-2xl space-y-4 animate-slide-up"
      >
        <div className="space-y-1">
          <h2
            id="empty-workout-title"
            className="text-lg font-bold text-zinc-100 tracking-tight"
          >
            Ни одного подхода не выполнено.
          </h2>
          <p className="text-xs text-zinc-400 leading-relaxed">
            В этой тренировке нет завершённых рабочих подходов. Выберите действие:
          </p>
        </div>

        <div className="space-y-2 pt-2">
          <button
            type="button"
            onClick={onDiscard}
            className="w-full min-h-[48px] px-4 py-3 rounded-xl font-medium text-sm text-rose-400 bg-rose-950/40 border border-rose-800/50 hover:bg-rose-900/40 transition-colors flex items-center justify-center text-center"
          >
            Выйти без сохранения
          </button>

          <button
            type="button"
            onClick={onSaveEmpty}
            className="w-full min-h-[48px] px-4 py-3 rounded-xl font-medium text-sm text-zinc-300 bg-zinc-800/80 hover:bg-zinc-700/80 border border-zinc-700/50 transition-colors flex items-center justify-center text-center"
          >
            Сохранить пустую
          </button>

          <button
            type="button"
            onClick={onBack}
            className="w-full min-h-[48px] px-4 py-3 rounded-xl font-medium text-sm text-zinc-900 bg-lime hover:bg-lime-light transition-colors flex items-center justify-center text-center"
          >
            Назад
          </button>
        </div>
      </div>
    </div>
  );
};
