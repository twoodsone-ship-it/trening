import type { MuscleCategory } from '../types';

const MUSCLE_CATEGORY_LABELS: Record<MuscleCategory, string> = {
  Chest: 'Грудь',
  Back: 'Спина',
  Legs: 'Ноги',
  Shoulders: 'Плечи',
  Arms: 'Руки',
  Core: 'Кор',
  Cardio: 'Кардио'
};

const LEGACY_WORKOUT_NAMES: Record<string, string> = {
  Push: 'Жим',
  Pull: 'Тяга',
  Legs: 'Ноги',
  'Push 2': 'Жим 2',
  'Pull 2': 'Тяга 2',
  'Legs 2': 'Ноги 2',
  'Full Body A': 'Всё тело A',
  'Full Body B': 'Всё тело B',
  'Full Body C': 'Всё тело C'
};

export function muscleCategoryLabel(category: MuscleCategory | string): string {
  return MUSCLE_CATEGORY_LABELS[category as MuscleCategory] || category;
}

export function workoutNameLabel(name: string): string {
  return LEGACY_WORKOUT_NAMES[name] || name;
}
