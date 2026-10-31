import type { WorkoutTemplate, Exercise } from '../types';
import { EXERCISE_CATALOG } from './exerciseCatalog';

function createExerciseFromCatalog(
  id: string,
  overrides?: Partial<Exercise>
): Exercise {
  const item = EXERCISE_CATALOG[id];
  const currentWeight = overrides?.currentWeight !== undefined
    ? overrides.currentWeight
    : (item ? item.defaultWeight : 50);

  // Retain history demo on bench-press so progress displays immediately
  let history = overrides?.history;
  if (!history || history.length === 0) {
    if (id === 'bench-press') {
      const prevWeight = currentWeight > 2.5 ? currentWeight - 2.5 : currentWeight;
      history = [
        {
          id: 'demo-h1',
          workoutId: 'w0',
          date: new Date(Date.now() - 7 * 86400000).toISOString(),
          targetSets: overrides?.targetSets || item?.defaultSets || 3,
          minReps: overrides?.minReps || item?.minReps || 8,
          maxReps: overrides?.maxReps || item?.maxReps || 12,
          weight: prevWeight,
          sets: [
            { setNumber: 1, weight: prevWeight, reps: 12, rpe: 8 },
            { setNumber: 2, weight: prevWeight, reps: 12, rpe: 8.5 },
            { setNumber: 3, weight: prevWeight, reps: 12, rpe: 9 }
          ],
          totalVolume: Math.round(prevWeight * 36),
          estimated1RM: Math.round(prevWeight * (1 + 12 / 30) * 10) / 10
        }
      ];
    } else {
      history = [];
    }
  }

  if (!item) {
    return {
      id,
      name: overrides?.name || 'Упражнение',
      category: overrides?.category || 'Chest',
      equipment: overrides?.equipment || 'barbell',
      animationType: overrides?.animationType || 'bench-press',
      gifUrl: overrides?.gifUrl,
      targetSets: overrides?.targetSets || 3,
      minReps: overrides?.minReps || 8,
      maxReps: overrides?.maxReps || 12,
      weightStep: overrides?.weightStep || 2.5,
      currentWeight,
      restSeconds: overrides?.restSeconds || 90,
      history,
      ...overrides
    };
  }

  return {
    id: item.id,
    name: item.name,
    category: item.category,
    equipment: item.equipment,
    animationType: item.animationType,
    gifUrl: item.gifUrl || overrides?.gifUrl,
    technique: item.technique,
    alternatives: item.alternatives,
    targetSets: overrides?.targetSets || item.defaultSets,
    minReps: overrides?.minReps || item.minReps,
    maxReps: overrides?.maxReps || item.maxReps,
    weightStep: overrides?.weightStep || item.weightStep,
    currentWeight,
    restSeconds: overrides?.restSeconds || item.restSeconds,
    notes: overrides?.notes,
    history
  };
}

export const DEFAULT_TEMPLATES: WorkoutTemplate[] = [
  // ==========================================================================
  // НЕДЕЛЯ 1 (ВАРИАНТ А) - Верх / Низ (Upper / Lower)
  // Оптимизировано под рекомпозицию, короткие рычаги и защиту поясницы
  // ==========================================================================

  // 1. Upper A (Верх А: Базовый жим и штанга)
  {
    id: 'week-1-upper-a',
    name: 'Верх А: Базовый жим и штанга',
    description: 'Базовый жим штанги лёжа, тяга штанги в наклоне, армейский жим, тяга верхнего блока, французский жим, подъем на бицепс и пресс на наклонной скамье.',
    icon: 'Flame',
    weekVariant: 'A',
    exercises: [
      createExerciseFromCatalog('bench-press', {
        currentWeight: 70,
        history: [
          {
            id: 'demo-h1',
            workoutId: 'w0',
            date: new Date(Date.now() - 7 * 86400000).toISOString(),
            targetSets: 3,
            minReps: 8,
            maxReps: 12,
            weight: 67.5,
            sets: [
              { setNumber: 1, weight: 67.5, reps: 12, rpe: 8 },
              { setNumber: 2, weight: 67.5, reps: 12, rpe: 8.5 },
              { setNumber: 3, weight: 67.5, reps: 12, rpe: 9 }
            ],
            totalVolume: 2430,
            estimated1RM: 94.5
          }
        ]
      }),
      createExerciseFromCatalog('barbell-row', { currentWeight: 60 }),
      createExerciseFromCatalog('overhead-press', { currentWeight: 42.5 }),
      createExerciseFromCatalog('lat-pulldown', { currentWeight: 60 }),
      createExerciseFromCatalog('skull-crushers', { currentWeight: 27.5 }),
      createExerciseFromCatalog('bicep-curls', { currentWeight: 27.5 }),
      createExerciseFromCatalog('decline-crunch')
    ]
  },

  // 2. Lower A (Низ А: Квадрицепсы и присед)
  {
    id: 'week-1-lower-a',
    name: 'Низ А: Квадрицепсы и присед',
    description: 'Базовые приседания со штангой, румынская тяга для задней цепи, разгибания и сгибания ног, голень стоя и подъем коленей в висе.',
    icon: 'Dumbbell',
    weekVariant: 'A',
    exercises: [
      createExerciseFromCatalog('barbell-squat', { currentWeight: 85 }),
      createExerciseFromCatalog('romanian-deadlift', { currentWeight: 75 }),
      createExerciseFromCatalog('leg-extension', { currentWeight: 45 }),
      createExerciseFromCatalog('seated-leg-curl', { currentWeight: 45 }),
      createExerciseFromCatalog('standing-calf-raise', { currentWeight: 60 }),
      createExerciseFromCatalog('hanging-knee-raise')
    ]
  },

  // 3. Upper B (Верх B: Гантели и блоки)
  {
    id: 'week-1-upper-b',
    name: 'Верх B: Гантели и блоки',
    description: 'Жим гантелей под углом 30°, тяга гантелей с упором грудью (разгрузка поясницы), кроссовер, махи через стороны, молоты и французский жим с канатом.',
    icon: 'TrendingUp',
    weekVariant: 'A',
    exercises: [
      createExerciseFromCatalog('incline-db-press', { currentWeight: 24 }),
      createExerciseFromCatalog('chest-supported-db-row', { currentWeight: 22 }),
      createExerciseFromCatalog('cable-crossover', { currentWeight: 25 }),
      createExerciseFromCatalog('lateral-raises', { currentWeight: 10 }),
      createExerciseFromCatalog('cable-rope-hammer-curl', { currentWeight: 25 }),
      createExerciseFromCatalog('overhead-rope-extension', { currentWeight: 25 }),
      createExerciseFromCatalog('russian-twist')
    ]
  },

  // 4. Lower B (Низ B: Жим платформы и сплит)
  {
    id: 'week-1-lower-b',
    name: 'Низ B: Жим платформы и сплит',
    description: 'Безопасный для позвоночника жим ногами в платформе 45°, болгарские сплит-приседания, сгибания лёжа, разгибания, голень сидя и планка.',
    icon: 'Zap',
    weekVariant: 'A',
    exercises: [
      createExerciseFromCatalog('leg-press', { currentWeight: 160 }),
      createExerciseFromCatalog('bulgarian-split-squat', { currentWeight: 14 }),
      createExerciseFromCatalog('leg-curls-lying', { currentWeight: 40 }),
      createExerciseFromCatalog('leg-extension', { currentWeight: 45 }),
      createExerciseFromCatalog('seated-calf-raise', { currentWeight: 40 }),
      createExerciseFromCatalog('plank')
    ]
  },

  // ==========================================================================
  // НЕДЕЛЯ 2 (ВАРИАНТ Б) - Верх / Низ (Upper / Lower)
  // Вариация углов, тренажеры с фиксированной траекторией и гипертрофия
  // ==========================================================================

  // 5. Upper A (Верх А: Хаммер и гантели)
  {
    id: 'week-2-upper-a',
    name: 'Верх А: Хаммер и гантели',
    description: 'Жим гантелей лёжа, Т-тяга с опорой груди, жим гантелей сидя, верхний блок нейтральным хватом, узкий жим штанги, скамья Скотта и пресс на блоке.',
    icon: 'Flame',
    weekVariant: 'B',
    exercises: [
      createExerciseFromCatalog('db-bench-press', { currentWeight: 26 }),
      createExerciseFromCatalog('t-bar-row', { currentWeight: 50 }),
      createExerciseFromCatalog('seated-db-press', { currentWeight: 20 }),
      createExerciseFromCatalog('neutral-grip-pulldown', { currentWeight: 60 }),
      createExerciseFromCatalog('close-grip-bench-press', { currentWeight: 55 }),
      createExerciseFromCatalog('preacher-curl', { currentWeight: 25 }),
      createExerciseFromCatalog('cable-crunch', { currentWeight: 50 })
    ]
  },

  // 6. Lower A (Низ А: Задняя цепь и жим ногами)
  {
    id: 'week-2-lower-a',
    name: 'Низ А: Задняя цепь и жим ногами',
    description: 'Тяжелый жим ногами, классическая становая тяга с умеренным весом, сгибания ног сидя, гоблет-присед, жим носками в платформе и подъем прямых ног в висе.',
    icon: 'Dumbbell',
    weekVariant: 'B',
    exercises: [
      createExerciseFromCatalog('leg-press', { currentWeight: 170 }),
      createExerciseFromCatalog('deadlift-conventional', { currentWeight: 85 }),
      createExerciseFromCatalog('seated-leg-curl', { currentWeight: 50 }),
      createExerciseFromCatalog('goblet-squat', { currentWeight: 28 }),
      createExerciseFromCatalog('calf-press-leg-press', { currentWeight: 120 }),
      createExerciseFromCatalog('hanging-leg-raise')
    ]
  },

  // 7. Upper B (Верх B: Брусья и турник)
  {
    id: 'week-2-upper-b',
    name: 'Верх B: Брусья и турник',
    description: 'Подтягивания широким хватом, жим от груди в Хаммере, горизонтальная тяга блока, бабочка на заднюю дельту, махи на блоке, трицепс на блоке и дровосек.',
    icon: 'TrendingUp',
    weekVariant: 'B',
    exercises: [
      createExerciseFromCatalog('pull-ups', { currentWeight: 0, minReps: 6, maxReps: 10 }),
      createExerciseFromCatalog('hammer-chest-press', { currentWeight: 65 }),
      createExerciseFromCatalog('seated-cable-row', { currentWeight: 55 }),
      createExerciseFromCatalog('rear-delt-fly-machine', { currentWeight: 35 }),
      createExerciseFromCatalog('cable-lateral-raise', { currentWeight: 7.5 }),
      createExerciseFromCatalog('tricep-pushdown', { currentWeight: 32.5 }),
      createExerciseFromCatalog('cable-woodchopper', { currentWeight: 20 })
    ]
  },

  // 8. Lower B (Низ B: Хакк и сплит-выпады)
  {
    id: 'week-2-lower-b',
    name: 'Низ B: Хакк и сплит-выпады',
    description: 'Хакк-приседания для изоляции квадрицепсов, румынская тяга с гантелями, шагающие выпады, сгибания лёжа, икры стоя и скручивания на наклонной скамье.',
    icon: 'Zap',
    weekVariant: 'B',
    exercises: [
      createExerciseFromCatalog('hack-squat', { currentWeight: 80 }),
      createExerciseFromCatalog('db-rdl', { currentWeight: 26 }),
      createExerciseFromCatalog('walking-lunges', { currentWeight: 14 }),
      createExerciseFromCatalog('leg-curls-lying', { currentWeight: 45 }),
      createExerciseFromCatalog('standing-calf-raise', { currentWeight: 65 }),
      createExerciseFromCatalog('decline-crunch')
    ]
  }
];
