import { describe, expect, it } from 'vitest';
import {
  EXERCISE_CATALOG,
  FIXED_BARBELL_WEIGHTS_KG,
  getAdjacentFixedBarbellWeight,
  getClosestFixedBarbellWeight,
  getTrialFixedBarbellWeight
} from '../src/data/exerciseCatalog';
import { isEquipmentAllowed } from '../src/utils/equipmentMap';
import { createTrialSet } from '../src/utils/trialSet';

describe('fixed barbell equipment and overhead press', () => {
  it('has overhead-press configured with fixed-barbell and 20kg start weight', () => {
    const ohp = EXERCISE_CATALOG['overhead-press'];
    expect(ohp).toBeDefined();
    expect(ohp.equipment).toBe('fixed-barbell');
    expect(ohp.defaultWeight).toBe(20);
  });

  it('allows fixed-barbell only for full gym profile', () => {
    expect(isEquipmentAllowed('fixed-barbell', 'full')).toBe(true);
    expect(isEquipmentAllowed('fixed-barbell', 'dumbbells')).toBe(false);
    expect(isEquipmentAllowed('fixed-barbell', 'home')).toBe(false);
  });

  it('navigates the discrete fixed barbell weights correctly', () => {
    expect(FIXED_BARBELL_WEIGHTS_KG).toEqual([
      10, 12.5, 15, 17.5, 20, 22.5, 25, 27.5, 30, 32.5, 35, 37.5, 40
    ]);
    expect(getAdjacentFixedBarbellWeight(20, 1)).toBe(22.5);
    expect(getAdjacentFixedBarbellWeight(20, -1)).toBe(17.5);
    expect(getAdjacentFixedBarbellWeight(10, -1)).toBe(10);
    expect(getAdjacentFixedBarbellWeight(40, 1)).toBe(40);

    expect(getClosestFixedBarbellWeight(19)).toBe(20);
    expect(getClosestFixedBarbellWeight(13)).toBe(12.5);
  });

  it('determines trial set weight for fixed-barbell without 20kg barbell cap', () => {
    // 20 kg working weight: 50% is 10 kg -> 10 kg
    const trial20 = createTrialSet({
      equipment: 'fixed-barbell',
      targetWeight: 20,
      weightStep: 2.5,
      minReps: 8
    }, 't-1');
    expect(trial20.weight).toBe(10);

    // 35 kg working weight: 50% is 17.5 kg -> 17.5 kg
    const trial35 = createTrialSet({
      equipment: 'fixed-barbell',
      targetWeight: 35,
      weightStep: 2.5,
      minReps: 8
    }, 't-2');
    expect(trial35.weight).toBe(17.5);

    // 10 kg working weight (minimum bar): no smaller bar -> 0 kg
    const trial10 = createTrialSet({
      equipment: 'fixed-barbell',
      targetWeight: 10,
      weightStep: 2.5,
      minReps: 8
    }, 't-3');
    expect(trial10.weight).toBe(0);
  });
});
