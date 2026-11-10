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
    expect(ohp.weightStep).toBe(5);
  });

  it('allows fixed-barbell only for full gym profile', () => {
    expect(isEquipmentAllowed('fixed-barbell', 'full')).toBe(true);
    expect(isEquipmentAllowed('fixed-barbell', 'dumbbells')).toBe(false);
    expect(isEquipmentAllowed('fixed-barbell', 'home')).toBe(false);
  });

  it('navigates the discrete fixed barbell weights correctly and respects boundaries', () => {
    expect(FIXED_BARBELL_WEIGHTS_KG).toEqual([
      15, 20, 25, 30, 35, 40, 45, 50
    ]);
    expect(getAdjacentFixedBarbellWeight(20, 1)).toBe(25);
    expect(getAdjacentFixedBarbellWeight(20, -1)).toBe(15);

    // Boundary checks: never below 15 and never above 50
    expect(getAdjacentFixedBarbellWeight(15, -1)).toBe(15);
    expect(getAdjacentFixedBarbellWeight(10, -1)).toBe(15);
    expect(getAdjacentFixedBarbellWeight(50, 1)).toBe(50);
    expect(getAdjacentFixedBarbellWeight(55, 1)).toBe(50);

    expect(getClosestFixedBarbellWeight(19)).toBe(20);
    expect(getClosestFixedBarbellWeight(14)).toBe(15);
    expect(getClosestFixedBarbellWeight(10)).toBe(15);
    expect(getClosestFixedBarbellWeight(52)).toBe(50);
  });

  it('determines trial set weight for fixed-barbell without 20kg barbell cap', () => {
    // 20 kg working weight: candidates < 20 kg is [15] -> trial is 15 kg
    const trial20 = createTrialSet({
      equipment: 'fixed-barbell',
      targetWeight: 20,
      weightStep: 5,
      minReps: 8
    }, 't-1');
    expect(trial20.weight).toBe(15);

    // 35 kg working weight: 50% is 17.5 kg -> closest candidate is 15 kg
    const trial35 = createTrialSet({
      equipment: 'fixed-barbell',
      targetWeight: 35,
      weightStep: 5,
      minReps: 8
    }, 't-2');
    expect(trial35.weight).toBe(15);

    // 15 kg working weight (minimum bar): no smaller bar -> 0 kg
    const trial15 = createTrialSet({
      equipment: 'fixed-barbell',
      targetWeight: 15,
      weightStep: 5,
      minReps: 8
    }, 't-3');
    expect(trial15.weight).toBe(0);
  });
});
