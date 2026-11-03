import type { EquipmentType, GymProfile } from '../types';
import { EXERCISE_CATALOG } from '../data/exerciseCatalog';

export const GYM_PROFILES: Array<{
  id: GymProfile;
  title: string;
  subtitle: string;
}> = [
  { id: 'full', title: 'Полный зал', subtitle: 'Штанга, тренажёры, блоки' },
  { id: 'dumbbells', title: 'Гантели + своё тело', subtitle: 'Стойка/скамья по возможности' },
  { id: 'home', title: 'Дома', subtitle: 'Гантели и вес тела' }
];

const ALLOWED: Record<GymProfile, EquipmentType[]> = {
  full: ['barbell', 'dumbbell', 'cable', 'machine', 'smith', 'bodyweight'],
  dumbbells: ['dumbbell', 'bodyweight'],
  home: ['dumbbell', 'bodyweight']
};

/** Prefer these replacements when gear is missing */
const FALLBACKS: Record<string, string[]> = {
  'barbell-squat': ['goblet-squat', 'bulgarian-split-squat', 'walking-lunges'],
  'bench-press': ['db-bench-press', 'push-ups', 'incline-db-press'],
  'barbell-row': ['db-row', 'chest-supported-db-row'],
  'overhead-press': ['seated-db-press', 'arnold-press'],
  'lat-pulldown': ['pull-ups', 'db-row'],
  'deadlift-conventional': ['db-rdl', 'romanian-deadlift', 'hip-thrust'],
  'romanian-deadlift': ['db-rdl', 'hip-thrust'],
  'leg-press': ['goblet-squat', 'bulgarian-split-squat', 'walking-lunges'],
  'seated-cable-row': ['db-row', 'chest-supported-db-row'],
  'tricep-pushdown': ['bench-dips', 'skull-crushers'],
  'cable-crossover': ['incline-db-fly', 'push-ups'],
  'cable-crunch': ['decline-crunch', 'plank', 'russian-twist'],
  'face-pulls': ['incline-rear-delt-fly', 'lateral-raises'],
  'leg-extension': ['goblet-squat', 'walking-lunges'],
  'seated-leg-curl': ['db-rdl', 'hip-thrust'],
  'leg-curls-lying': ['db-rdl', 'hip-thrust'],
  'french-press': ['skull-crushers', 'bench-dips'],
  'cable-bicep-curl': ['bicep-curls', 'db-incline-curls'],
  'overhead-rope-extension': ['skull-crushers', 'bench-dips'],
  'hack-squat': ['goblet-squat', 'bulgarian-split-squat'],
  't-bar-row': ['db-row', 'chest-supported-db-row'],
  'close-grip-bench-press': ['bench-dips', 'push-ups']
};

export function isEquipmentAllowed(equipment: EquipmentType | undefined, profile: GymProfile): boolean {
  if (!equipment) return profile === 'full';
  return ALLOWED[profile].includes(equipment);
}

export function resolveExerciseForGym(exerciseId: string, profile: GymProfile): string {
  if (profile === 'full') return exerciseId;
  const item = EXERCISE_CATALOG[exerciseId];
  if (item && isEquipmentAllowed(item.equipment, profile)) return exerciseId;

  const candidates = [
    ...(FALLBACKS[exerciseId] || []),
    ...(item?.alternatives || [])
  ];

  for (const id of candidates) {
    const alt = EXERCISE_CATALOG[id];
    if (alt && isEquipmentAllowed(alt.equipment, profile)) return id;
  }

  // Last resort: any same-category allowed exercise
  if (item) {
    const same = Object.values(EXERCISE_CATALOG).find(
      c => c.category === item.category && isEquipmentAllowed(c.equipment, profile) && c.id !== exerciseId
    );
    if (same) return same.id;
  }

  return exerciseId;
}

export function adaptExerciseIds(ids: string[], profile: GymProfile): string[] {
  const seen = new Set<string>();
  const out: string[] = [];
  for (const id of ids) {
    const resolved = resolveExerciseForGym(id, profile);
    if (seen.has(resolved)) continue;
    seen.add(resolved);
    out.push(resolved);
  }
  return out;
}
