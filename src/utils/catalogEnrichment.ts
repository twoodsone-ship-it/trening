import type { EquipmentType, ExerciseTechniqueGuide, MuscleCategory } from '../types';
import { EXERCISE_CATALOG } from '../data/exerciseCatalog';

export function normalizeMuscleCategory(raw: unknown): MuscleCategory {
  if (typeof raw !== 'string') return 'Chest';
  const lower = raw.trim().toLowerCase();
  if (lower === 'chest' || lower.includes('груд')) return 'Chest';
  if (lower === 'back' || lower.includes('спин')) return 'Back';
  if (lower === 'legs' || lower.includes('ног') || lower.includes('бедр') || lower.includes('квадр') || lower.includes('ягодиц')) return 'Legs';
  if (lower === 'shoulders' || lower.includes('плеч') || lower.includes('дельт')) return 'Shoulders';
  if (lower === 'arms' || lower.includes('рук') || lower.includes('бицеп') || lower.includes('трицеп')) return 'Arms';
  if (lower === 'core' || lower.includes('кор') || lower.includes('пресс') || lower.includes('живот')) return 'Core';
  if (lower === 'cardio' || lower.includes('кардио') || lower.includes('аэро')) return 'Cardio';
  return 'Chest';
}

export function normalizeEquipment(raw: unknown, name?: string): EquipmentType {
  if (typeof raw === 'string') {
    const lower = raw.trim().toLowerCase();
    if (lower === 'barbell' || lower === 'штанга') return 'barbell';
    if (lower === 'dumbbell' || lower === 'гантели' || lower === 'гантель') return 'dumbbell';
    if (lower === 'cable' || lower === 'блок' || lower === 'кроссовер') return 'cable';
    if (lower === 'machine' || lower === 'тренажер' || lower === 'хаммер') return 'machine';
    if (lower === 'smith' || lower === 'смит') return 'smith';
    if (lower === 'bodyweight' || lower === 'свой вес' || lower === 'собственный вес') return 'bodyweight';
  }
  if (name) {
    const n = name.toLowerCase();
    if (n.includes('гантел')) return 'dumbbell';
    if (n.includes('блок') || n.includes('кроссовер')) return 'cable';
    if (n.includes('тренажер') || n.includes('хаммер')) return 'machine';
    if (n.includes('смит')) return 'smith';
    if (n.includes('турник') || n.includes('брусь') || n.includes('подтягиван') || n.includes('отжиман') || n.includes('планк') || n.includes('ролик')) {
      return 'bodyweight';
    }
  }
  return 'barbell';
}

const ANIMATION_BY_CATEGORY: Record<MuscleCategory, string> = {
  Chest: 'bench-press',
  Back: 'row',
  Legs: 'squat',
  Shoulders: 'overhead-press',
  Arms: 'bicep-curl',
  Core: 'core',
  Cardio: 'cardio'
};

export function resolveAnimationType(
  category: MuscleCategory,
  catalogAnimation?: string,
  rawAnimation?: string
): string {
  return catalogAnimation || rawAnimation || ANIMATION_BY_CATEGORY[category] || 'squat';
}

export function resolveTechnique(
  category: MuscleCategory,
  catalogTechnique?: ExerciseTechniqueGuide,
  rawTechnique?: ExerciseTechniqueGuide
): ExerciseTechniqueGuide {
  return catalogTechnique || rawTechnique || {
    primaryMuscles: `${category} целевые мышечные группы`,
    setup: 'Займите устойчивое исходное положение, сохраняя нейтральное положение позвоночника.',
    execution: 'Выполняйте движение подконтрольно в полной амплитуде, акцентируя сокращение мышц.',
    breathing: 'Вдох при опускании/растяжении, выдох на усилии.',
    mistakes: ['Чрезмерный читинг', 'Потеря контроля осанки']
  };
}

export function resolveAlternatives(
  exerciseId: string,
  category: MuscleCategory,
  catalogAlternatives?: string[],
  rawAlternatives?: string[]
): string[] {
  if (catalogAlternatives && catalogAlternatives.length > 0) return catalogAlternatives;
  if (Array.isArray(rawAlternatives) && rawAlternatives.length > 0) return rawAlternatives;
  return Object.values(EXERCISE_CATALOG)
    .filter(c => c.category === category && c.id !== exerciseId)
    .slice(0, 5)
    .map(c => c.id);
}
