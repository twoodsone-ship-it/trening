import { describe, expect, it, vi } from 'vitest';
import React from 'react';
import { renderToString } from 'react-dom/server';
import {
  shouldPromptEmptyWorkoutFinish,
  resolveEmptyWorkoutFinishAction,
  EmptyWorkoutConfirmModal
} from '../src/utils/emptyWorkoutDialog';
import {
  getTopDialog,
  isTopDialog,
  pushDialog,
  handleDialogEscape,
  clearDialogStack
} from '../src/hooks/useDialogA11y';

describe('K4c: Empty workout finish confirmation', () => {
  it('shouldPromptEmptyWorkoutFinish returns true when no exercise has valid completed sets', () => {
    // 0 sets
    expect(shouldPromptEmptyWorkoutFinish([])).toBe(true);

    // Sets present but completed is false
    expect(shouldPromptEmptyWorkoutFinish([
      {
        sets: [
          { setNumber: 1, weight: 60, reps: 10, completed: false, type: 'working' },
          { setNumber: 2, weight: 60, reps: 10, completed: false, type: 'working' }
        ]
      }
    ])).toBe(true);

    // Only warmup sets completed
    expect(shouldPromptEmptyWorkoutFinish([
      {
        sets: [
          { setNumber: 1, weight: 40, reps: 10, completed: true, type: 'warmup', isWarmup: true }
        ]
      }
    ])).toBe(true);

    // Working set with reps = 0
    expect(shouldPromptEmptyWorkoutFinish([
      {
        sets: [
          { setNumber: 1, weight: 60, reps: 0, completed: true, type: 'working' }
        ]
      }
    ])).toBe(true);
  });

  it('shouldPromptEmptyWorkoutFinish returns false when at least one exercise has a valid completed set', () => {
    // Normal reps working set
    expect(shouldPromptEmptyWorkoutFinish([
      {
        sets: [
          { setNumber: 1, weight: 60, reps: 10, completed: true, type: 'working' }
        ]
      }
    ])).toBe(false);

    // Cardio duration working set
    expect(shouldPromptEmptyWorkoutFinish([
      {
        trackingMode: 'duration',
        sets: [
          { setNumber: 1, weight: 0, reps: 0, durationSeconds: 600, completed: true, type: 'working' }
        ]
      }
    ])).toBe(false);

    // Distance working set
    expect(shouldPromptEmptyWorkoutFinish([
      {
        trackingMode: 'distance',
        sets: [
          { setNumber: 1, weight: 0, reps: 0, distanceMeters: 1000, completed: true, type: 'working' }
        ]
      }
    ])).toBe(false);

    // Multiple exercises, one skipped, one valid
    expect(shouldPromptEmptyWorkoutFinish([
      {
        sets: [{ setNumber: 1, reps: 0, completed: false }]
      },
      {
        sets: [{ setNumber: 1, weight: 50, reps: 8, completed: true, type: 'working' }]
      }
    ])).toBe(false);
  });

  it('resolveEmptyWorkoutFinishAction properly handles all three options', () => {
    // Option 1: Выйти без сохранения
    const exitAction = resolveEmptyWorkoutFinishAction('discard');
    expect(exitAction).toEqual({
      save: false,
      cancelSession: true,
      dismissDialog: true
    });

    // Option 2: Сохранить пустую
    const saveEmptyAction = resolveEmptyWorkoutFinishAction('save_empty');
    expect(saveEmptyAction).toEqual({
      save: true,
      cancelSession: false,
      dismissDialog: true
    });

    // Option 3: Назад
    const backAction = resolveEmptyWorkoutFinishAction('cancel');
    expect(backAction).toEqual({
      save: false,
      cancelSession: false,
      dismissDialog: true
    });
  });

  it('EmptyWorkoutConfirmModal renders required Russian copy and >= 44px touch targets', () => {
    const html = renderToString(
      React.createElement(EmptyWorkoutConfirmModal, {
        isOpen: true,
        onDiscard: () => {},
        onSaveEmpty: () => {},
        onBack: () => {}
      })
    );

    expect(html).toContain('Ни одного подхода не выполнено.');
    expect(html).toContain('Выйти без сохранения');
    expect(html).toContain('Сохранить пустую');
    expect(html).toContain('Назад');
    expect(html).toContain('role="dialog"');
    expect(html).toContain('aria-modal="true"');
    expect(html).toContain('min-h-[48px]');
  });

  it('Escape key triggers onBack via dialog stack hook helper', () => {
    clearDialogStack();
    const onBack = vi.fn();
    const dialogId = 'empty-workout-confirm-dialog';
    pushDialog(dialogId);
    expect(isTopDialog(dialogId)).toBe(true);
    const handled = handleDialogEscape(dialogId, onBack);
    expect(handled).toBe(true);
    expect(onBack).toHaveBeenCalledTimes(1);
  });
});
