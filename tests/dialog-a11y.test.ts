import { describe, expect, it } from 'vitest';
import React from 'react';
import { renderToString } from 'react-dom/server';
import { getNextFocusIndex, findNextFocusableElement, pushDialog, removeDialog, isTopDialog, getTopDialog, clearDialogStack, handleDialogEscape } from '../src/hooks/useDialogA11y';
import { beforeEach, vi } from 'vitest';
import { SettingsModal } from '../src/components/SettingsModal';
import { PlateCalculatorModal } from '../src/components/PlateCalculatorModal';
import type { AppSettings } from '../src/types';

const mockSettings: AppSettings = {
  soundEnabled: true,
  vibrationEnabled: true,
  voiceEnabled: false,
  focusModeDefault: false,
  defaultRestSeconds: 90,
  barbellWeightKg: 20,
  unit: 'kg',
  theme: 'dark',
  currentWeek: 'A'
};

describe('Modal Accessibility: Focus-Cycling Logic (H6)', () => {
  it('returns -1 / null when list is empty', () => {
    expect(getNextFocusIndex(0, 0, false)).toBe(-1);
    expect(getNextFocusIndex(0, 0, true)).toBe(-1);
    expect(findNextFocusableElement([], 'btn1', false)).toBeNull();
  });

  it('cycles within a single element', () => {
    expect(getNextFocusIndex(0, 1, false)).toBe(0);
    expect(getNextFocusIndex(0, 1, true)).toBe(0);
    expect(findNextFocusableElement(['btn1'], 'btn1', false)).toBe('btn1');
    expect(findNextFocusableElement(['btn1'], 'btn1', true)).toBe('btn1');
  });

  it('advances forward on Tab and wraps from last to first', () => {
    const items = ['input1', 'btn1', 'btn2'];
    expect(getNextFocusIndex(0, items.length, false)).toBe(1);
    expect(getNextFocusIndex(1, items.length, false)).toBe(2);
    // Wrap around from last to first:
    expect(getNextFocusIndex(2, items.length, false)).toBe(0);

    expect(findNextFocusableElement(items, 'input1', false)).toBe('btn1');
    expect(findNextFocusableElement(items, 'btn1', false)).toBe('btn2');
    expect(findNextFocusableElement(items, 'btn2', false)).toBe('input1');
  });

  it('moves backward on Shift+Tab and wraps from first to last', () => {
    const items = ['input1', 'btn1', 'btn2'];
    expect(getNextFocusIndex(2, items.length, true)).toBe(1);
    expect(getNextFocusIndex(1, items.length, true)).toBe(0);
    // Wrap around from first to last:
    expect(getNextFocusIndex(0, items.length, true)).toBe(2);

    expect(findNextFocusableElement(items, 'btn2', true)).toBe('btn1');
    expect(findNextFocusableElement(items, 'btn1', true)).toBe('input1');
    expect(findNextFocusableElement(items, 'input1', true)).toBe('btn2');
  });

  it('picks first element on Tab and last element on Shift+Tab if current focus is outside', () => {
    const items = ['a', 'b', 'c'];
    expect(getNextFocusIndex(-1, items.length, false)).toBe(0);
    expect(getNextFocusIndex(-1, items.length, true)).toBe(2);

    expect(findNextFocusableElement(items, 'unknown', false)).toBe('a');
    expect(findNextFocusableElement(items, null, true)).toBe('c');
  });

  it('renders modal dialog attributes (role, aria-modal, aria-labelledby) in SettingsModal', () => {
    const html = renderToString(
      React.createElement(SettingsModal, {
        isOpen: true,
        onClose: () => {},
        settings: mockSettings,
        history: [],
        onUpdateSettings: () => {},
        onDataReload: () => {}
      })
    );
    expect(html).toContain('role="dialog"');
    expect(html).toContain('aria-modal="true"');
    expect(html).toContain('aria-labelledby="settings-dialog-title"');
    expect(html).toContain('id="settings-dialog-title"');
  });

  it('renders modal dialog attributes in PlateCalculatorModal', () => {
    const html = renderToString(
      React.createElement(PlateCalculatorModal, {
        isOpen: true,
        onClose: () => {},
        initialWeight: 60,
        barWeight: 20
      })
    );
    expect(html).toContain('role="dialog"');
    expect(html).toContain('aria-modal="true"');
    expect(html).toContain('aria-labelledby="plate-calc-title"');
    expect(html).toContain('id="plate-calc-title"');
  });
});

describe('I2: Nested dialog stack and Escape routing', () => {
  beforeEach(() => {
    clearDialogStack();
  });

  it('tracks dialog stack order with two and three dialogs', () => {
    expect(getTopDialog()).toBeNull();

    pushDialog('parent-modal');
    expect(getTopDialog()).toBe('parent-modal');
    expect(isTopDialog('parent-modal')).toBe(true);

    pushDialog('child-modal');
    expect(getTopDialog()).toBe('child-modal');
    expect(isTopDialog('child-modal')).toBe(true);
    expect(isTopDialog('parent-modal')).toBe(false);

    pushDialog('grandchild-modal');
    expect(getTopDialog()).toBe('grandchild-modal');
    expect(isTopDialog('grandchild-modal')).toBe(true);
    expect(isTopDialog('child-modal')).toBe(false);
    expect(isTopDialog('parent-modal')).toBe(false);
  });

  it('Escape routing returns handled by top only', () => {
    pushDialog('parent-modal');
    pushDialog('child-modal');
    pushDialog('grandchild-modal');

    const parentClose = vi.fn();
    const childClose = vi.fn();
    const grandchildClose = vi.fn();

    // When an event arrives, non-top dialogs do not handle it
    const parentHandled = handleDialogEscape('parent-modal', parentClose);
    const childHandled = handleDialogEscape('child-modal', childClose);
    expect(parentHandled).toBe(false);
    expect(childHandled).toBe(false);
    expect(parentClose).not.toHaveBeenCalled();
    expect(childClose).not.toHaveBeenCalled();

    // Only topmost dialog handles it
    const grandchildHandled = handleDialogEscape('grandchild-modal', grandchildClose);
    expect(grandchildHandled).toBe(true);
    expect(grandchildClose).toHaveBeenCalledTimes(1);
  });

  it('closing the top makes the parent topmost again', () => {
    pushDialog('parent-modal');
    pushDialog('child-modal');

    expect(isTopDialog('child-modal')).toBe(true);
    expect(isTopDialog('parent-modal')).toBe(false);

    removeDialog('child-modal');

    expect(isTopDialog('parent-modal')).toBe(true);
    expect(getTopDialog()).toBe('parent-modal');

    const parentClose = vi.fn();
    const handled = handleDialogEscape('parent-modal', parentClose);
    expect(handled).toBe(true);
    expect(parentClose).toHaveBeenCalledTimes(1);
  });

  it('removing a non-top id does not change the top', () => {
    pushDialog('dialog-1');
    pushDialog('dialog-2');
    pushDialog('dialog-3');

    expect(getTopDialog()).toBe('dialog-3');

    // Remove dialog-1 from bottom of stack
    removeDialog('dialog-1');
    expect(getTopDialog()).toBe('dialog-3');
    expect(isTopDialog('dialog-3')).toBe(true);
    expect(isTopDialog('dialog-2')).toBe(false);

    // Remove dialog-2 from middle of stack
    removeDialog('dialog-2');
    expect(getTopDialog()).toBe('dialog-3');
    expect(isTopDialog('dialog-3')).toBe(true);
  });

  it('parent with unsaved edits is not closed by Escape handled by child', () => {
    // Parent is WorkoutEditModal with unsaved edits in draft state
    const parentDraft = {
      isDirty: true,
      weight: 65,
      reps: 10
    };
    let parentClosed = false;
    const cancelParentEdit = vi.fn(() => {
      // Discards unsaved edits if invoked
      parentClosed = true;
    });

    // Parent dialog opens
    pushDialog('workout-edit-modal');
    expect(isTopDialog('workout-edit-modal')).toBe(true);

    // User opens RpePickerModal nested inside
    pushDialog('rpe-picker-modal');
    expect(isTopDialog('rpe-picker-modal')).toBe(true);
    expect(isTopDialog('workout-edit-modal')).toBe(false);

    let childClosed = false;
    const closeChild = vi.fn(() => {
      childClosed = true;
      removeDialog('rpe-picker-modal');
    });

    // Escape is pressed: both event listeners fire on document in capture phase
    // 1. Parent listener fires first (because it registered earlier):
    const handledByParent = handleDialogEscape('workout-edit-modal', cancelParentEdit);
    expect(handledByParent).toBe(false);
    expect(cancelParentEdit).not.toHaveBeenCalled();
    expect(parentClosed).toBe(false);
    expect(parentDraft.isDirty).toBe(true); // draft preserved

    // 2. Child listener fires:
    const handledByChild = handleDialogEscape('rpe-picker-modal', closeChild);
    expect(handledByChild).toBe(true);
    expect(closeChild).toHaveBeenCalledTimes(1);
    expect(childClosed).toBe(true);

    // After child closes, parent becomes topmost again
    expect(isTopDialog('workout-edit-modal')).toBe(true);
    expect(parentClosed).toBe(false);
    expect(parentDraft.weight).toBe(65);
  });
});
