import React from 'react';
import { describe, expect, it } from 'vitest';
import { renderToString } from 'react-dom/server';
import { SettingsModal } from '../src/components/SettingsModal';
import type { AppSettings } from '../src/types';

const defaultSettings: AppSettings = {
  soundEnabled: true,
  vibrationEnabled: true,
  voiceEnabled: false,
  focusModeDefault: true,
  barbellWeightKg: 20,
  defaultRestSeconds: 90,
  unit: 'kg',
  theme: 'dark',
  currentWeek: 'A'
};

describe('K2: Settings toggles and small buttons audit', () => {
  it('renders toggles with a >=44px tap wrapper and an undistorted 48x24 (w-12 h-6) inner visual track', () => {
    const html = renderToString(
      React.createElement(SettingsModal, {
        isOpen: true,
        onClose: () => {},
        settings: defaultSettings,
        history: [],
        onUpdateSettings: () => {},
        onDataReload: () => {}
      })
    );

    // Each toggle button must have min-h-[44px] tap target wrapper
    expect(html).toContain('role="switch"');
    expect(html).toContain('min-h-[44px]');
    expect(html).toContain('min-w-[48px]');

    // The visual track must be a separate inner container with w-12 h-6 (48x24)
    expect(html).toContain('w-12 h-6 rounded-full');

    // The close button must have explicit min-h-[44px] min-w-[44px]
    expect(html).not.toContain('className="w-9 h-9 flex items-center justify-center text-muted');
  });
});
