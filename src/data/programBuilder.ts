import type {
  ActiveProgram,
  DaysPerWeek,
  Exercise,
  ExerciseSession,
  GymProfile,
  ProgramGoal,
  WorkoutTemplate
} from '../types';
import { EXERCISE_CATALOG } from './exerciseCatalog';
import { adaptExerciseIds } from '../utils/equipmentMap';

export const PROGRAM_GOALS: Array<{
  id: ProgramGoal;
  title: string;
  subtitle: string;
  detail: string;
  accent: string;
}> = [
  {
    id: 'recomp',
    title: 'Рекомпозиция',
    subtitle: 'Похудение + мышцы',
    detail: 'Жиросжигание при сохранении и наборе мышц. Умеренный объём, 8–12 повт.',
    accent: 'lime'
  },
  {
    id: 'cut',
    title: 'Похудение',
    subtitle: 'Дефицит калорий',
    detail: 'Больше повторений и плотности. Короче отдых, акцент на технику.',
    accent: 'amber'
  },
  {
    id: 'bulk',
    title: 'Набор массы',
    subtitle: 'Гипертрофия',
    detail: 'Прогрессия весов, базовые движения, 8–12 повт. и достаточный отдых.',
    accent: 'sky'
  },
  {
    id: 'strength',
    title: 'Сила',
    subtitle: 'Низкие повторения',
    detail: 'Тяжёлые базы 5–8 повт., длинный отдых, меньше изоляции.',
    accent: 'rose'
  }
];

type SlotDef = { id: string; dayLabel: string; focus: string; exerciseIds: string[] };

function goalReps(goal: ProgramGoal): { minReps: number; maxReps: number; restSeconds: number; sets: number } {
  switch (goal) {
    case 'cut':
      return { minReps: 10, maxReps: 15, restSeconds: 60, sets: 3 };
    case 'bulk':
      return { minReps: 8, maxReps: 12, restSeconds: 90, sets: 4 };
    case 'strength':
      return { minReps: 5, maxReps: 8, restSeconds: 150, sets: 4 };
    case 'recomp':
    default:
      return { minReps: 8, maxReps: 12, restSeconds: 90, sets: 3 };
  }
}

function createExercise(
  id: string,
  goal: ProgramGoal,
  historyMap: Map<string, ExerciseSession[]>
): Exercise {
  const item = EXERCISE_CATALOG[id];
  const g = goalReps(goal);
  const isCompound = ['barbell-squat', 'bench-press', 'deadlift-conventional', 'overhead-press', 'barbell-row', 'leg-press', 'romanian-deadlift'].includes(id);
  const sets = goal === 'strength' && isCompound ? 5 : g.sets;
  const minReps = goal === 'cut' && !isCompound ? 12 : g.minReps;
  const maxReps = goal === 'cut' && !isCompound ? 15 : g.maxReps;

  if (!item) {
    return {
      id,
      name: id,
      category: 'Chest',
      targetSets: sets,
      minReps,
      maxReps,
      weightStep: 2.5,
      currentWeight: 40,
      restSeconds: g.restSeconds,
      history: historyMap.get(id) || []
    };
  }

  return {
    id: item.id,
    name: item.name,
    category: item.category,
    equipment: item.equipment,
    animationType: item.animationType,
    gifUrl: item.gifUrl,
    technique: item.technique,
    alternatives: item.alternatives,
    targetSets: sets,
    minReps: goal === 'strength' && isCompound ? 5 : (item.minReps || minReps),
    maxReps: goal === 'strength' && isCompound ? 8 : (item.maxReps || maxReps),
    weightStep: item.weightStep,
    currentWeight: item.defaultWeight,
    restSeconds: isCompound ? Math.max(g.restSeconds, item.restSeconds) : g.restSeconds,
    history: historyMap.get(id) || []
  };
}

const CUT_CARDIO = ['jump-rope', 'burpees', 'mountain-climbers', 'stationary-bike', 'rowing-machine'] as const;

function withCutCardio(slot: SlotDef, dayIndex: number, goal: ProgramGoal): SlotDef {
  if (goal !== 'cut') return slot;
  const cardioId = CUT_CARDIO[dayIndex % CUT_CARDIO.length];
  if (slot.exerciseIds.includes(cardioId)) return slot;
  return {
    ...slot,
    focus: `${slot.focus} · Кардио`,
    exerciseIds: [...slot.exerciseIds, cardioId]
  };
}

/** Day blueprints keyed by frequency */
function slotsForDays(days: DaysPerWeek, goal: ProgramGoal = 'recomp'): SlotDef[] {
  const fullA: SlotDef = {
    id: 'fb-a',
    dayLabel: 'Full Body A',
    focus: 'Присед · Жим · Тяга',
    exerciseIds: ['barbell-squat', 'bench-press', 'barbell-row', 'overhead-press', 'lat-pulldown', 'plank']
  };
  const fullB: SlotDef = {
    id: 'fb-b',
    dayLabel: 'Full Body B',
    focus: 'Ноги · Жим гантелей · Спина',
    exerciseIds: ['leg-press', 'db-bench-press', 'seated-cable-row', 'romanian-deadlift', 'lateral-raises', 'cable-crunch']
  };
  const fullC: SlotDef = {
    id: 'fb-c',
    dayLabel: 'Full Body C',
    focus: 'Ягодицы · Плечи · Кор',
    exerciseIds: ['hip-thrust', 'incline-db-press', 'pull-ups', 'seated-db-press', 'leg-curls-lying', 'hanging-knee-raise']
  };
  const push: SlotDef = {
    id: 'push',
    dayLabel: 'Push',
    focus: 'Грудь · Плечи · Трицепс',
    exerciseIds: ['bench-press', 'overhead-press', 'incline-db-press', 'lateral-raises', 'tricep-pushdown', 'cable-crossover']
  };
  const pull: SlotDef = {
    id: 'pull',
    dayLabel: 'Pull',
    focus: 'Спина · Бицепс · Задние дельты',
    exerciseIds: ['deadlift-conventional', 'lat-pulldown', 'barbell-row', 'face-pulls', 'bicep-curls', 'hammer-curls']
  };
  const legs: SlotDef = {
    id: 'legs',
    dayLabel: 'Legs',
    focus: 'Квадрицепс · Бицепс бедра · Икры',
    exerciseIds: ['barbell-squat', 'romanian-deadlift', 'leg-press', 'leg-curls-lying', 'standing-calf-raise', 'hanging-leg-raise']
  };
  const upper: SlotDef = {
    id: 'upper',
    dayLabel: 'Верх',
    focus: 'Жим · Тяга · Плечи',
    exerciseIds: ['bench-press', 'barbell-row', 'seated-db-press', 'lat-pulldown', 'lateral-raises', 'french-press']
  };
  const lower: SlotDef = {
    id: 'lower',
    dayLabel: 'Низ',
    focus: 'Присед · Тяга · Ягодицы',
    exerciseIds: ['barbell-squat', 'romanian-deadlift', 'leg-press', 'hip-thrust', 'seated-leg-curl', 'standing-calf-raise']
  };
  const upper2: SlotDef = {
    id: 'upper-2',
    dayLabel: 'Верх 2',
    focus: 'Наклонный жим · Горизонтальная тяга',
    exerciseIds: ['incline-db-press', 'seated-cable-row', 'arnold-press', 'pull-ups', 'cable-bicep-curl', 'overhead-rope-extension']
  };
  const lower2: SlotDef = {
    id: 'lower-2',
    dayLabel: 'Низ 2',
    focus: 'Жим ногами · Выпады',
    exerciseIds: ['leg-press', 'bulgarian-split-squat', 'db-rdl', 'leg-extension', 'walking-lunges', 'seated-calf-raise']
  };

  const raw: SlotDef[] = (() => {
    switch (days) {
      case 2:
        return [fullA, fullB];
      case 3:
        return [push, pull, legs];
      case 4:
        return [upper, lower, upper2, lower2];
      case 5:
        return [push, pull, legs, upper, lower];
      case 6:
        return [push, pull, legs, { ...push, id: 'push-2', dayLabel: 'Push 2' }, { ...pull, id: 'pull-2', dayLabel: 'Pull 2' }, { ...legs, id: 'legs-2', dayLabel: 'Legs 2' }];
      default:
        return [fullA, fullB, fullC];
    }
  })();

  return raw.map((slot, i) => withCutCardio(slot, i, goal));
}

function goalTitle(goal: ProgramGoal): string {
  return PROGRAM_GOALS.find(g => g.id === goal)?.title || 'Программа';
}

/** Prefer Mon/Wed/Fri etc. based on frequency for schedule hints */
function preferredWeekdays(days: DaysPerWeek): number[] {
  switch (days) {
    case 2:
      return [1, 4]; // Mon Thu
    case 3:
      return [1, 3, 5];
    case 4:
      return [1, 2, 4, 5];
    case 5:
      return [1, 2, 3, 4, 5];
    case 6:
      return [1, 2, 3, 4, 5, 6];
    default:
      return [1, 3, 5];
  }
}

export function buildProgramTemplates(
  goal: ProgramGoal,
  daysPerWeek: DaysPerWeek,
  previousTemplates: WorkoutTemplate[] = [],
  gymProfile: GymProfile = 'full'
): { program: ActiveProgram; templates: WorkoutTemplate[] } {
  const historyMap = new Map<string, ExerciseSession[]>();
  const weightMap = new Map<string, number>();
  previousTemplates.forEach(t => {
    t.exercises.forEach(ex => {
      if (ex.history?.length) historyMap.set(ex.id, ex.history);
      if (ex.currentWeight > 0) weightMap.set(ex.id, ex.currentWeight);
    });
  });

  const slots = slotsForDays(daysPerWeek, goal);
  const weekdays = preferredWeekdays(daysPerWeek);
  const gymLabel = gymProfile === 'full' ? 'зал' : gymProfile === 'dumbbells' ? 'гантели' : 'дом';
  const title = `${goalTitle(goal)} · ${daysPerWeek}×/нед · ${gymLabel}`;

  const templates: WorkoutTemplate[] = slots.map((slot, i) => {
    const adaptedIds = adaptExerciseIds(slot.exerciseIds, gymProfile);
    const exercises = adaptedIds.map(id => {
      const ex = createExercise(id, goal, historyMap);
      if (weightMap.has(id)) ex.currentWeight = weightMap.get(id)!;
      return ex;
    });

    return {
      id: `prog-${goal}-${daysPerWeek}-${gymProfile}-${slot.id}`,
      name: slot.dayLabel,
      description: slot.focus,
      icon: 'Dumbbell',
      weekVariant: 'all',
      scheduledDays: [weekdays[i] ?? ((i % 6) + 1)],
      exercises
    };
  });

  const program: ActiveProgram = {
    goal,
    daysPerWeek,
    gymProfile,
    title,
    startedAt: new Date().toISOString(),
    templateIds: templates.map(t => t.id)
  };

  return { program, templates };
}

export function buildWorkoutBriefing(template: WorkoutTemplate, goal?: ProgramGoal): {
  headline: string;
  focus: string;
  targets: string[];
  cue: string;
} {
  const top = template.exercises.slice(0, 3);
  const cues: Record<ProgramGoal, string> = {
    cut: 'Контроль темпа, короче отдых, техника важнее веса.',
    bulk: 'Добавляй вес, когда закрыл верх диапазона повторений.',
    recomp: 'Базы тяжело, изоляция чисто. Не гони RPE выше 9 без нужды.',
    strength: 'Длинный отдых между тяжёлыми сетами. Оставь 1–2 повтора в запасе.'
  };
  return {
    headline: template.name,
    focus: template.description,
    targets: top.map(e => `${e.name}: ${e.currentWeight} кг × ${e.minReps}–${e.maxReps}`),
    cue: cues[goal || 'recomp']
  };
}

export function pickTodaysTemplate(
  templates: WorkoutTemplate[],
  program: ActiveProgram | null | undefined,
  history: { templateId: string; endTime: number }[]
): WorkoutTemplate | null {
  if (!program || !templates.length) return null;
  const ordered = program.templateIds
    .map(id => templates.find(t => t.id === id))
    .filter(Boolean) as WorkoutTemplate[];

  if (!ordered.length) return templates[0] || null;

  const today = new Date().getDay();
  const bySchedule = ordered.find(t => t.scheduledDays?.includes(today));
  if (bySchedule) return bySchedule;

  // Round-robin: next unused since last workout
  const last = history.find(h => program.templateIds.includes(h.templateId));
  if (!last) return ordered[0];
  const lastIdx = ordered.findIndex(t => t.id === last.templateId);
  return ordered[(lastIdx + 1) % ordered.length];
}

export function estimateWorkoutMinutes(template: WorkoutTemplate): number {
  const sets = template.exercises.reduce((s, e) => s + e.targetSets, 0);
  const avgRest = template.exercises.reduce((s, e) => s + e.restSeconds, 0) / Math.max(template.exercises.length, 1);
  return Math.round((sets * (45 + avgRest)) / 60);
}
