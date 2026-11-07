import { describe, expect, it } from 'vitest';
import React from 'react';
import { renderToString } from 'react-dom/server';
import { getNextFocusIndex, findNextFocusableElement } from '../src/hooks/useDialogA11y';
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
