import { describe, expect, it } from 'vitest';
import { shouldShowPlateGuide } from '../src/components/FocusSetOverlay';

describe('focus plate guide', () => {
  it('hides the guide for a trial set below the bar weight', () => {
    expect(shouldShowPlateGuide('barbell', true, 10, 20)).toBe(false);
    expect(shouldShowPlateGuide('barbell', false, 10, 20)).toBe(true);
    expect(shouldShowPlateGuide('barbell', true, 20, 20)).toBe(true);
  });
});
