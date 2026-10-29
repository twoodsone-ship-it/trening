import { WorkoutTemplate, Exercise } from '../types';
import { EXERCISE_CATALOG } from './exerciseCatalog';

function createExerciseFromCatalog(
  id: string,
  overrides?: Partial<Exercise>
): Exercise {
  const item = EXERCISE_CATALOG[id];
  if (!item) {
    return {
      id,
      name: overrides?.name || 'Упражнение',
      category: overrides?.category || 'Chest',
      equipment: overrides?.equipment || 'barbell',
      animationType: overrides?.animationType || 'bench-press',
      targetSets: overrides?.targetSets || 3,
      minReps: overrides?.minReps || 8,
      maxReps: overrides?.maxReps || 12,
      weightStep: overrides?.weightStep || 2.5,
      currentWeight: overrides?.currentWeight || 50,
      restSeconds: overrides?.restSeconds || 90,
      history: [],
      ...overrides
    };
  }

  return {
    id: item.id,
    name: item.name,
    category: item.category,
    equipment: item.equipment,
    animationType: item.animationType,
    technique: item.technique,
    alternatives: item.alternatives,
    targetSets: overrides?.targetSets || item.defaultSets,
    minReps: overrides?.minReps || item.minReps,
    maxReps: overrides?.maxReps || item.maxReps,
    weightStep: overrides?.weightStep || item.weightStep,
    currentWeight: overrides?.currentWeight !== undefined ? overrides.currentWeight : item.defaultWeight,
    restSeconds: overrides?.restSeconds || item.restSeconds,
    notes: overrides?.notes,
    history: overrides?.history || []
  };
}

export const DEFAULT_TEMPLATES: WorkoutTemplate[] = [
  // --- НЕДЕЛЯ 1 (ВАРИАНТ A) ---
  {
    id: 'push-workout-a',
    name: 'Push A: Жим (Неделя 1: Базовая штанга)',
    description: 'Фокус на базовом жиме штанги, армейском жиме и жиме гантелей под углом.',
    icon: 'Flame',
    weekVariant: 'A',
    exercises: [
      createExerciseFromCatalog('bench-press', {
        currentWeight: 75,
        history: [
          {
            id: 'demo-h1',
            workoutId: 'w0',
            date: new Date(Date.now() - 7 * 86400000).toISOString(),
            targetSets: 3,
            minReps: 8,
            maxReps: 12,
            weight: 72.5,
            sets: [
              { setNumber: 1, weight: 72.5, reps: 12, rpe: 8 },
              { setNumber: 2, weight: 72.5, reps: 12, rpe: 8.5 },
              { setNumber: 3, weight: 72.5, reps: 12, rpe: 9 }
            ],
            totalVolume: 2610,
            estimated1RM: 101.5
          }
        ]
      }),
      createExerciseFromCatalog('overhead-press', { currentWeight: 42.5 }),
      createExerciseFromCatalog('incline-db-press', { currentWeight: 24 }),
      createExerciseFromCatalog('lateral-raises', { currentWeight: 10 }),
      createExerciseFromCatalog('tricep-pushdown', { currentWeight: 30 })
    ]
  },
  {
    id: 'push-workout-b',
    name: 'Push B: Жим (Неделя 2: Гантели & Хаммер)',
    description: 'Ротация: акцент на жим гантелей, тренажер Хаммер и отжимания на брусьях.',
    icon: 'Flame',
    weekVariant: 'B',
    exercises: [
      createExerciseFromCatalog('db-bench-press', { currentWeight: 28 }),
      createExerciseFromCatalog('hammer-chest-press', { currentWeight: 65 }),
      createExerciseFromCatalog('seated-db-press', { currentWeight: 20 }),
      createExerciseFromCatalog('dips-chest', { currentWeight: 0, minReps: 8, maxReps: 12 }),
      createExerciseFromCatalog('tricep-pushdown', { currentWeight: 32.5 })
    ]
  },

  // --- СПИНА И БИЦЕПС ---
  {
    id: 'pull-workout-a',
    name: 'Pull A: Тяга (Неделя 1: Блоки & Штанга)',
    description: 'Тяга верхнего блока широким хватом, тяга штанги в наклоне и бицепс.',
    icon: 'TrendingUp',
    weekVariant: 'A',
    exercises: [
      createExerciseFromCatalog('lat-pulldown', { currentWeight: 65 }),
      createExerciseFromCatalog('barbell-row', { currentWeight: 60 }),
      createExerciseFromCatalog('seated-cable-row', { currentWeight: 50 }),
      createExerciseFromCatalog('lateral-raises', { currentWeight: 10 }),
      createExerciseFromCatalog('bicep-curls', { currentWeight: 27.5 })
    ]
  },
  {
    id: 'pull-workout-b',
    name: 'Pull B: Тяга (Неделя 2: Турник & Гантели)',
    description: 'Ротация: подтягивания на турнике, тяга гантели к поясу и узкий блок.',
    icon: 'TrendingUp',
    weekVariant: 'B',
    exercises: [
      createExerciseFromCatalog('pull-ups', { currentWeight: 0, minReps: 6, maxReps: 10 }),
      createExerciseFromCatalog('db-row', { currentWeight: 28 }),
      createExerciseFromCatalog('lat-pulldown', { currentWeight: 67.5 }),
      createExerciseFromCatalog('bicep-curls', { currentWeight: 30 })
    ]
  },

  // --- НОГИ ---
  {
    id: 'legs-workout-a',
    name: 'Legs A: Ноги (Неделя 1: Базовый присед)',
    description: 'Тяжелые приседания со штангой, румынская тяга на бицепс бедра.',
    icon: 'Dumbbell',
    weekVariant: 'A',
    exercises: [
      createExerciseFromCatalog('barbell-squat', { currentWeight: 90 }),
      createExerciseFromCatalog('romanian-deadlift', { currentWeight: 80 }),
      createExerciseFromCatalog('leg-press', { currentWeight: 150 })
    ]
  },
  {
    id: 'legs-workout-b',
    name: 'Legs B: Ноги (Неделя 2: Жим платформы & RDL)',
    description: 'Ротация: тяжелый жим ногами в тренажере, румынская тяга и присед.',
    icon: 'Dumbbell',
    weekVariant: 'B',
    exercises: [
      createExerciseFromCatalog('leg-press', { currentWeight: 170 }),
      createExerciseFromCatalog('romanian-deadlift', { currentWeight: 85 }),
      createExerciseFromCatalog('barbell-squat', { currentWeight: 85 })
    ]
  }
];
