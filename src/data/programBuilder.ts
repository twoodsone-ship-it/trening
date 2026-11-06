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
    detail: 'Силовые упражнения, короткие блоки кора и лёгкое кардио по выбранному расписанию.',
    accent: 'lime'
  },
  {
    id: 'cut',
    title: 'Похудение',
    subtitle: 'Дефицит калорий',
    detail: 'Силовая база, короткие блоки кора и кардио-финишер в выбранные дни.',
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
    targetSets: item.category === 'Cardio' ? item.defaultSets : sets,
    minReps: item.trackingMode === 'duration' ? 0 : goal === 'strength' && isCompound ? 5 : (item.minReps || minReps),
    maxReps: item.trackingMode === 'duration' ? 0 : goal === 'strength' && isCompound ? 8 : (item.maxReps || maxReps),
    weightStep: item.weightStep,
    currentWeight: item.defaultWeight,
    restSeconds: item.category === 'Cardio' ? item.restSeconds : isCompound ? Math.max(g.restSeconds, item.restSeconds) : g.restSeconds,
    trackingMode: item.trackingMode || 'reps',
    defaultDurationSeconds: item.defaultDurationSeconds,
    cardioIntensity: item.cardioIntensity,
    history: historyMap.get(id) || []
  };
}

const FINISHER_CARDIO = ['jump-rope', 'burpees', 'mountain-climbers', 'stationary-bike', 'rowing-machine'] as const;
const CORE_ROTATION = [
  'plank',
  'cable-crunch',
  'hanging-knee-raise',
  'hanging-leg-raise',
  'russian-twist',
  'ab-wheel-rollout'
] as const;

const CORE_IDS = new Set<string>(CORE_ROTATION);

function spacedDays(days: number, count: number): Set<number> {
  const bounded = Math.max(0, Math.min(days, count));
  return new Set(Array.from({ length: bounded }, (_, i) => Math.floor(i * days / bounded)));
}

/** Add direct core on selected days; it is never forced onto every workout. */
function decorateSlots(
  source: SlotDef[],
  goal: ProgramGoal,
  coreSessionsPerWeek: number,
  cardioSessionsPerWeek: number
): SlotDef[] {
  const coreDays = spacedDays(source.length, coreSessionsPerWeek);
  const cardioDays = spacedDays(source.length, cardioSessionsPerWeek);
  let coreIndex = 0;
  return source.map((sourceSlot, dayIndex) => {
    const baseIds = sourceSlot.exerciseIds.filter(id => !CORE_IDS.has(id));
    const slot: SlotDef = { ...sourceSlot, exerciseIds: baseIds };
    const additions: string[] = [];
    const tags: string[] = [];
    if (coreDays.has(dayIndex)) {
      additions.push(CORE_ROTATION[coreIndex % CORE_ROTATION.length]);
      coreIndex += 1;
      tags.push('Кор');
    }
    if (cardioDays.has(dayIndex)) {
      additions.push(FINISHER_CARDIO[dayIndex % FINISHER_CARDIO.length]);
      tags.push('Кардио');
    }
    return {
      ...slot,
      focus: tags.length ? `${slot.focus} · ${tags.join(' + ')}` : slot.focus,
      exerciseIds: [...slot.exerciseIds, ...additions]
    };
  });
}

/** Day blueprints keyed by frequency */
function slotsForDays(
  days: DaysPerWeek,
  goal: ProgramGoal = 'recomp',
  coreSessionsPerWeek = 2,
  cardioSessionsPerWeek = goal === 'cut' ? Math.min(3, days) : goal === 'recomp' ? Math.min(2, days) : 0
): SlotDef[] {
  const fullA: SlotDef = {
    id: 'fb-a',
    dayLabel: 'Всё тело A',
    focus: 'Присед · Жим · Тяга',
    exerciseIds: ['barbell-squat', 'bench-press', 'barbell-row', 'overhead-press', 'lat-pulldown', 'plank']
  };
  const fullB: SlotDef = {
    id: 'fb-b',
    dayLabel: 'Всё тело B',
    focus: 'Ноги · Жим гантелей · Спина',
    exerciseIds: ['leg-press', 'db-bench-press', 'seated-cable-row', 'romanian-deadlift', 'lateral-raises', 'cable-crunch']
  };
  const fullC: SlotDef = {
    id: 'fb-c',
    dayLabel: 'Всё тело C',
    focus: 'Ягодицы · Плечи · Кор',
    exerciseIds: ['hip-thrust', 'incline-db-press', 'pull-ups', 'seated-db-press', 'leg-curls-lying', 'hanging-knee-raise']
  };
  const push: SlotDef = {
    id: 'push',
    dayLabel: 'Жим',
    focus: 'Грудь · Плечи · Трицепс',
    exerciseIds: ['bench-press', 'overhead-press', 'incline-db-press', 'lateral-raises', 'tricep-pushdown', 'cable-crossover']
  };
  const pull: SlotDef = {
    id: 'pull',
    dayLabel: 'Тяга',
    focus: 'Спина · Бицепс · Задние дельты',
    exerciseIds: ['deadlift-conventional', 'lat-pulldown', 'barbell-row', 'face-pulls', 'bicep-curls', 'hammer-curls']
  };
  const legs: SlotDef = {
    id: 'legs',
    dayLabel: 'Ноги',
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
        return [push, pull, legs, { ...push, id: 'push-2', dayLabel: 'Жим 2' }, { ...pull, id: 'pull-2', dayLabel: 'Тяга 2' }, { ...legs, id: 'legs-2', dayLabel: 'Ноги 2' }];
      default:
        return [fullA, fullB, fullC];
    }
  })();

  return decorateSlots(raw, goal, coreSessionsPerWeek, cardioSessionsPerWeek);
}

export type ProgramCyclePhase = 'base' | 'progress' | 'overload' | 'deload';
export interface ProgramCycleState {
  week: 1 | 2 | 3 | 4;
  block: number;
  phase: ProgramCyclePhase;
  title: string;
  description: string;
}

const CYCLE_WEEKS: Array<Pick<ProgramCycleState, 'phase' | 'title' | 'description'>> = [
  { phase: 'base', title: 'Освоение нагрузки', description: 'Работай с запасом, закрепи технику и исходный объём.' },
  { phase: 'progress', title: 'Прогрессия', description: 'Постепенно добавляй повторы или вес при чистой технике.' },
  { phase: 'overload', title: 'Нагрузка', description: 'Сохраняй качество подходов и используй рекомендации по прогрессии.' },
  { phase: 'deload', title: 'Разгрузка', description: 'Меньше рабочих подходов и около 90% обычного веса.' }
];

export function getProgramCycle(startedAt: string, now = Date.now()): ProgramCycleState {
  const start = new Date(startedAt).getTime();
  const elapsedWeeks = Number.isFinite(start) ? Math.max(0, Math.floor((now - start) / (7 * 86400000))) : 0;
  const week = (elapsedWeeks % 4 + 1) as 1 | 2 | 3 | 4;
  return { week, block: Math.floor(elapsedWeeks / 4) + 1, ...CYCLE_WEEKS[week - 1] };
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
  gymProfile: GymProfile = 'full',
  coreSessionsPerWeek = 2,
  cardioSessionsPerWeek = goal === 'cut' ? Math.min(3, daysPerWeek) : goal === 'recomp' ? Math.min(2, daysPerWeek) : 0
): { program: ActiveProgram; templates: WorkoutTemplate[] } {
  const historyMap = new Map<string, ExerciseSession[]>();
  const weightMap = new Map<string, number>();
  previousTemplates.forEach(t => {
    t.exercises.forEach(ex => {
      if (ex.history?.length) historyMap.set(ex.id, ex.history);
      if (ex.currentWeight > 0) weightMap.set(ex.id, ex.currentWeight);
    });
  });

  const slots = slotsForDays(daysPerWeek, goal, coreSessionsPerWeek, cardioSessionsPerWeek);
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
    templateIds: templates.map(t => t.id),
    coreSessionsPerWeek: Math.min(coreSessionsPerWeek, daysPerWeek) as 0 | 1 | 2 | 3 | 4,
    cardioSessionsPerWeek: Math.max(0, Math.min(cardioSessionsPerWeek, daysPerWeek))
  };

  return { program, templates };
}

/** Reassign existing core/cardio accessories across the weekly split without losing exercise history. */
export function applyAccessorySchedule(
  templates: WorkoutTemplate[],
  goal: ProgramGoal,
  gymProfile: GymProfile,
  coreSessionsPerWeek: number,
  cardioSessionsPerWeek: number
): WorkoutTemplate[] {
  const coreDays = spacedDays(templates.length, coreSessionsPerWeek);
  const cardioDays = spacedDays(templates.length, cardioSessionsPerWeek);
  const historyMap = new Map<string, ExerciseSession[]>();
  const weightMap = new Map<string, number>();
  templates.forEach(t => t.exercises.forEach(ex => {
    if (ex.history?.length) historyMap.set(ex.id, ex.history);
    if (ex.currentWeight > 0) weightMap.set(ex.id, ex.currentWeight);
  }));
  let coreIndex = 0;

  return templates.map((template, index) => {
    const exercises = template.exercises.filter(ex => ex.category !== 'Core' && ex.category !== 'Cardio');
    const ids: string[] = [];
    if (coreDays.has(index)) {
      ids.push(CORE_ROTATION[coreIndex % CORE_ROTATION.length]);
      coreIndex += 1;
    }
    if (cardioDays.has(index)) ids.push(FINISHER_CARDIO[index % FINISHER_CARDIO.length]);
    const accessories = adaptExerciseIds(ids, gymProfile).map(id => {
      const exercise = createExercise(id, goal, historyMap);
      if (weightMap.has(id)) exercise.currentWeight = weightMap.get(id)!;
      return exercise;
    });
    const cleanFocus = template.description.replace(/ · (?:Кор|Кардио)(?: \+ (?:Кор|Кардио))*$/, '');
    const tags = [coreDays.has(index) ? 'Кор' : '', cardioDays.has(index) ? 'Кардио' : ''].filter(Boolean);
    return {
      ...template,
      description: tags.length ? `${cleanFocus} · ${tags.join(' + ')}` : cleanFocus,
      exercises: [...exercises, ...accessories]
    };
  });
}

export function buildWorkoutBriefing(template: WorkoutTemplate, goal?: ProgramGoal): {
  headline: string;
  focus: string;
  targets: string[];
  cue: string;
} {
  const top = template.exercises.slice(0, 3);
  const cues: Record<ProgramGoal, string> = {
    cut: 'Кор и кардио в конце — не пропускай. Короче отдых, техника важнее веса.',
    bulk: 'Добавляй вес, когда закрыл верх диапазона повторений. Кор — коротко в конце.',
    recomp: 'Базы тяжело, в конце кор + лёгкое кардио. Не гони RPE выше 9 без нужды.',
    strength: 'Длинный отдых между тяжёлыми сетами. Кор в конце — 2–3 коротких подхода.'
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
  const minutes = template.exercises.reduce((sum, ex) => {
    if (ex.trackingMode === 'duration' && ex.defaultDurationSeconds) {
      return sum + (ex.targetSets * ex.defaultDurationSeconds + Math.max(0, ex.targetSets - 1) * ex.restSeconds) / 60;
    }
    return sum + (ex.targetSets * 45 + Math.max(0, ex.targetSets - 1) * ex.restSeconds) / 60;
  }, 0);
  return Math.round(minutes + Math.max(0, template.exercises.length - 1) * 1.5);
}
