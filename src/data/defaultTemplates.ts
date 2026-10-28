import { WorkoutTemplate } from '../types';

export const DEFAULT_TEMPLATES: WorkoutTemplate[] = [
  {
    id: 'push-workout',
    name: 'Push (Жим: Грудь, Плечи, Трицепс)',
    description: 'Фокус на жимовых движениях с акцентом на грудные и плечевой пояс.',
    icon: 'Flame',
    exercises: [
      {
        id: 'bench-press',
        name: 'Жим штанги лёжа',
        category: 'Chest',
        targetSets: 3,
        minReps: 8,
        maxReps: 12,
        weightStep: 2.5,
        currentWeight: 75,
        restSeconds: 120,
        notes: 'Лопатки сведены, ноги упираются в пол, пауза в нижней точке.',
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
      },
      {
        id: 'overhead-press',
        name: 'Армейский жим стоя (OHP)',
        category: 'Shoulders',
        targetSets: 3,
        minReps: 8,
        maxReps: 12,
        weightStep: 2.5,
        currentWeight: 42.5,
        restSeconds: 90,
        notes: 'Пресс и ягодицы напряжены, траектория ровная вверх.',
        history: []
      },
      {
        id: 'incline-db-press',
        name: 'Жим гантелей на наклонной скамье',
        category: 'Chest',
        targetSets: 3,
        minReps: 10,
        maxReps: 14,
        weightStep: 2,
        currentWeight: 24,
        restSeconds: 90,
        notes: 'Угол скамьи 30 градусов.',
        history: []
      },
      {
        id: 'lateral-raises',
        name: 'Махи гантелями в стороны',
        category: 'Shoulders',
        targetSets: 3,
        minReps: 12,
        maxReps: 16,
        weightStep: 1,
        currentWeight: 10,
        restSeconds: 60,
        notes: 'Контролируйте движение без читинга.',
        history: []
      },
      {
        id: 'tricep-pushdown',
        name: 'Разгибания на трицепс на блоке',
        category: 'Arms',
        targetSets: 3,
        minReps: 10,
        maxReps: 15,
        weightStep: 2.5,
        currentWeight: 30,
        restSeconds: 60,
        notes: 'Локти зафиксированы по бокам.',
        history: []
      }
    ]
  },
  {
    id: 'pull-workout',
    name: 'Pull (Тяга: Спина, Задняя дельта, Бицепс)',
    description: 'Развитие ширины и толщины спины, силы хвата и бицепсов.',
    icon: 'TrendingUp',
    exercises: [
      {
        id: 'lat-pulldown',
        name: 'Тяга верхнего блока к груди',
        category: 'Back',
        targetSets: 3,
        minReps: 8,
        maxReps: 12,
        weightStep: 2.5,
        currentWeight: 65,
        restSeconds: 90,
        notes: 'Тяните локтями вниз, прожимайте широчайшие.',
        history: []
      },
      {
        id: 'barbell-row',
        name: 'Тяга штанги в наклоне',
        category: 'Back',
        targetSets: 3,
        minReps: 8,
        maxReps: 12,
        weightStep: 2.5,
        currentWeight: 60,
        restSeconds: 120,
        notes: 'Спина нейтральная, наклон 45-60 градусов.',
        history: []
      },
      {
        id: 'seated-cable-row',
        name: 'Горизонтальная тяга к поясу',
        category: 'Back',
        targetSets: 3,
        minReps: 10,
        maxReps: 14,
        weightStep: 2.5,
        currentWeight: 50,
        restSeconds: 75,
        notes: 'Полное сведение лопаток.',
        history: []
      },
      {
        id: 'face-pulls',
        name: 'Face Pulls (Тяга канатов к лицу)',
        category: 'Shoulders',
        targetSets: 3,
        minReps: 12,
        maxReps: 16,
        weightStep: 2.5,
        currentWeight: 22.5,
        restSeconds: 60,
        notes: 'Внешняя ротация плеч в конце движения.',
        history: []
      },
      {
        id: 'bicep-curls',
        name: 'Сгибания со штангой на бицепс',
        category: 'Arms',
        targetSets: 3,
        minReps: 8,
        maxReps: 12,
        weightStep: 2.5,
        currentWeight: 27.5,
        restSeconds: 60,
        notes: 'Без раскачки корпусом.',
        history: []
      }
    ]
  },
  {
    id: 'legs-workout',
    name: 'Legs & Core (Ноги и Кор)',
    description: 'Базовый тренинг квадрицепсов, задней поверхности бедра, икр и пресса.',
    icon: 'Dumbbell',
    exercises: [
      {
        id: 'barbell-squat',
        name: 'Приседания со штангой',
        category: 'Legs',
        targetSets: 3,
        minReps: 6,
        maxReps: 10,
        weightStep: 5,
        currentWeight: 90,
        restSeconds: 150,
        notes: 'Глубина до параллели, колени сонаправлены со стопами.',
        history: []
      },
      {
        id: 'romanian-deadlift',
        name: 'Румынская тяга со штангой',
        category: 'Legs',
        targetSets: 3,
        minReps: 8,
        maxReps: 12,
        weightStep: 5,
        currentWeight: 80,
        restSeconds: 120,
        notes: 'Отводите таз назад, растягивая бицепс бедра.',
        history: []
      },
      {
        id: 'leg-press',
        name: 'Жим ногами в тренажере',
        category: 'Legs',
        targetSets: 3,
        minReps: 10,
        maxReps: 15,
        weightStep: 10,
        currentWeight: 150,
        restSeconds: 90,
        notes: 'Не отрывайте поясницу от спинки.',
        history: []
      },
      {
        id: 'standing-calf-raises',
        name: 'Подъемы на носки стоя',
        category: 'Legs',
        targetSets: 4,
        minReps: 12,
        maxReps: 16,
        weightStep: 5,
        currentWeight: 55,
        restSeconds: 60,
        notes: 'Пауза в растянутом и пиковом положениях.',
        history: []
      },
      {
        id: 'hanging-leg-raises',
        name: 'Подъемы ног в висе на турнике',
        category: 'Core',
        targetSets: 3,
        minReps: 10,
        maxReps: 15,
        weightStep: 0,
        currentWeight: 0,
        restSeconds: 60,
        notes: 'Подкручивайте таз к груди.',
        history: []
      }
    ]
  }
];
