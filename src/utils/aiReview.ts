import { CompletedWorkout, AppSettings, MuscleCategory } from '../types';
import { calculate1RM } from '../services/progressionEngine';
import { muscleCategoryLabel, pluralize } from './uiLabels';

export interface AiReviewOptions {
  period: '2w' | '4w' | 'last8';
  userNote?: string;
  now?: number;
}

export const AI_REVIEW_PROMPT_TEMPLATE = `Ты тренер по силовым тренировкам. Ниже мои тренировки из приложения. Ответь по структуре:
1) общая оценка периода;
2) где есть прогресс, а где застой, и почему;
3) объём по группам мышц на неделю: где перебор и где недобор;
4) конкретные правки на ближайшие 2 недели по упражнениям (вес, подходы, повторы, замена);
5) нужна ли разгрузка;
6) до трёх уточняющих вопросов ко мне.

Используй только упражнения из отчёта или их прямые замены, веса предлагай кратными шагу снаряжения. Если данных мало, так и скажи. В конце, отдельным блоком кода json, выдай правки в виде массива {exerciseId, suggestedWeightKg, suggestedSets, suggestedRepRange, comment}.`;

export const EQUIPMENT_NOTES = `=== ОСОБЕННОСТИ СНАРЯЖЕНИЯ В ЗАЛЕ ===
- Блочные тренажёры (cable): шаг веса 4.5 кг (плиты стека по 10 lbs). Допустимые веса кратны 4.5 кг (18, 22.5, 27, 31.5, 36 кг и т.д.).
- Армейский жим (overhead-press): цельная штанга фиксированного веса (fixed-barbell) из дискретного ряда: 10, 12.5, 15, 17.5, 20, 22.5, 25, 27.5, 30, 32.5, 35, 37.5, 40 кг (без наборных блинов).
- Обычная штанга со свободными весами (barbell): олимпийский гриф 20 кг, шаг подбора веса 2.5 кг (по 1.25 кг с каждой стороны).`;

const GOAL_LABELS: Record<string, string> = {
  recomp: 'Рекомпозиция',
  cut: 'Сушка / дефицит',
  bulk: 'Массонабор',
  strength: 'Сила'
};

const GYM_LABELS: Record<string, string> = {
  full: 'Полный зал (штанги, гантели, тренажёры, блоки)',
  dumbbells: 'Гантельный зал',
  home: 'Домашние условия'
};

const PHASE_LABELS: Record<string, string> = {
  base: 'Базовая фаза (накопление объёма)',
  progress: 'Фаза прогресса (повышение интенсивности)',
  overload: 'Фаза перегрузки (пик нагрузки)',
  deload: 'Разгрузочная неделя (deload)'
};

const READINESS_LABELS: Record<string, string> = {
  optimal: 'отличное',
  tired: 'усталость',
  sleep_deprived: 'недосып'
};

const KEY_COMPOUND_IDS = new Set([
  'squat',
  'bench-press',
  'deadlift',
  'overhead-press',
  'barbell-row',
  'romanian-deadlift',
  'incline-dumbbell-press',
  'lat-pulldown',
  'leg-press',
  'dips',
  'pull-ups'
]);

function formatIsoDate(timestamp: number): string {
  const d = new Date(timestamp);
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, '0');
  const dd = String(d.getDate()).padStart(2, '0');
  return `${yyyy}-${mm}-${dd}`;
}

function getWeekRangeLabel(timestamp: number): string {
  const d = new Date(timestamp);
  const day = d.getDay(); // 0 is Sunday, 1 is Monday...
  const diffToMonday = (day === 0 ? -6 : 1) - day;
  const monday = new Date(d);
  monday.setDate(d.getDate() + diffToMonday);
  monday.setHours(0, 0, 0, 0);

  const sunday = new Date(monday);
  sunday.setDate(monday.getDate() + 6);

  const pad = (n: number) => String(n).padStart(2, '0');
  const monStr = `${pad(monday.getDate())}.${pad(monday.getMonth() + 1)}`;
  const sunStr = `${pad(sunday.getDate())}.${pad(sunday.getMonth() + 1)}.${sunday.getFullYear()}`;
  return `${monStr}–${sunStr}`;
}

function getWeekSortKey(timestamp: number): number {
  const d = new Date(timestamp);
  const day = d.getDay();
  const diffToMonday = (day === 0 ? -6 : 1) - day;
  const monday = new Date(d);
  monday.setDate(d.getDate() + diffToMonday);
  monday.setHours(0, 0, 0, 0);
  return monday.getTime();
}

interface StagnationInfo {
  exerciseId: string;
  name: string;
  category: MuscleCategory;
  historyDetails: string;
}

/**
 * Detects exercises where in their last 3 appearances in history neither working weight
 * nor reps at that weight increased.
 */
export function detectStagnation(history: CompletedWorkout[]): StagnationInfo[] {
  // Sort history chronologically (oldest to newest)
  const sorted = [...history].sort((a, b) => a.endTime - b.endTime);

  // Group appearances by exerciseId
  const appearancesByExercise = new Map<string, {
    exerciseId: string;
    name: string;
    category: MuscleCategory;
    date: string;
    topWeight: number;
    maxRepsAtTopWeight: number;
    totalWorkingSets: number;
  }[]>();

  sorted.forEach(workout => {
    workout.exercises.forEach(ex => {
      const workingSets = ex.sets.filter(
        s => s.completed !== false && !s.isWarmup && s.type !== 'warmup' && s.reps > 0
      );
      if (workingSets.length === 0) return;

      const topWeight = Math.max(...workingSets.map(s => s.weight));
      const maxRepsAtTopWeight = Math.max(
        ...workingSets.filter(s => s.weight === topWeight).map(s => s.reps)
      );

      const list = appearancesByExercise.get(ex.exerciseId) || [];
      list.push({
        exerciseId: ex.exerciseId,
        name: ex.name,
        category: ex.category,
        date: formatIsoDate(workout.endTime),
        topWeight,
        maxRepsAtTopWeight,
        totalWorkingSets: workingSets.length
      });
      appearancesByExercise.set(ex.exerciseId, list);
    });
  });

  const stalled: StagnationInfo[] = [];

  appearancesByExercise.forEach((appearances, exId) => {
    if (appearances.length < 3) return;
    const last3 = appearances.slice(-3);
    const [s1, s2, s3] = last3;

    // Check progression from s1 to s2
    const grew1to2 = s2.topWeight > s1.topWeight || (s2.topWeight === s1.topWeight && s2.maxRepsAtTopWeight > s1.maxRepsAtTopWeight);
    // Check progression from s2 to s3
    const grew2to3 = s3.topWeight > s2.topWeight || (s3.topWeight === s2.topWeight && s3.maxRepsAtTopWeight > s2.maxRepsAtTopWeight);

    if (!grew1to2 && !grew2to3) {
      stalled.push({
        exerciseId: exId,
        name: s3.name,
        category: s3.category,
        historyDetails: `${s1.date} (${s1.topWeight} кг × ${s1.maxRepsAtTopWeight}) → ${s2.date} (${s2.topWeight} кг × ${s2.maxRepsAtTopWeight}) → ${s3.date} (${s3.topWeight} кг × ${s3.maxRepsAtTopWeight})`
      });
    }
  });

  return stalled;
}

/**
 * Builds weekly volume summary: number of working sets per muscle category.
 */
function buildWeeklySummary(workouts: CompletedWorkout[]): string {
  if (workouts.length === 0) return 'Нет данных по тренировкам за выбранный период.';

  // Map weekKey (monday timestamp) -> category -> count
  const weeks = new Map<number, { label: string; counts: Map<string, number>; total: number }>();

  workouts.forEach(workout => {
    const weekKey = getWeekSortKey(workout.endTime);
    if (!weeks.has(weekKey)) {
      weeks.set(weekKey, {
        label: getWeekRangeLabel(workout.endTime),
        counts: new Map(),
        total: 0
      });
    }

    const entry = weeks.get(weekKey)!;
    workout.exercises.forEach(ex => {
      const workingCount = ex.sets.filter(
        s => s.completed !== false && !s.isWarmup && s.type !== 'warmup'
      ).length;
      if (workingCount > 0) {
        const current = entry.counts.get(ex.category) || 0;
        entry.counts.set(ex.category, current + workingCount);
        entry.total += workingCount;
      }
    });
  });

  // Sort weeks chronological (oldest to newest)
  const sortedWeekKeys = Array.from(weeks.keys()).sort((a, b) => a - b);
  const lines: string[] = [];

  sortedWeekKeys.forEach(k => {
    const w = weeks.get(k)!;
    lines.push(`• Неделя ${w.label} — всего ${w.total} ${pluralize(w.total, ['рабочий подход', 'рабочих подхода', 'рабочих подходов'])}:`);
    
    // Sort categories alphabetically or by volume
    const catList = Array.from(w.counts.entries()).sort((a, b) => b[1] - a[1]);
    catList.forEach(([cat, count]) => {
      const label = muscleCategoryLabel(cat);
      lines.push(`    - ${label} (${cat}): ${count} ${pluralize(count, ['подход', 'подхода', 'подходов'])}`);
    });
  });

  return lines.join('\n');
}

/**
 * Computes period personal records (best weight & estimated 1RM).
 */
function buildPeriodRecords(workouts: CompletedWorkout[]): string {
  const records = new Map<string, {
    name: string;
    category: MuscleCategory;
    bestWeight: number;
    bestReps: number;
    best1RM: number;
    isKey: boolean;
  }>();

  workouts.forEach(workout => {
    workout.exercises.forEach(ex => {
      ex.sets.forEach(s => {
        if (s.completed === false || s.isWarmup || s.type === 'warmup' || s.reps <= 0 || s.weight <= 0) return;
        const est1RM = calculate1RM(s.weight, s.reps);
        const existing = records.get(ex.exerciseId);

        if (!existing || est1RM > existing.best1RM || (est1RM === existing.best1RM && s.weight > existing.bestWeight)) {
          records.set(ex.exerciseId, {
            name: ex.name,
            category: ex.category,
            bestWeight: s.weight,
            bestReps: s.reps,
            best1RM: est1RM,
            isKey: KEY_COMPOUND_IDS.has(ex.exerciseId)
          });
        }
      });
    });
  });

  if (records.size === 0) {
    return 'Нет данных о выполненных силовых подходах.';
  }

  // Prioritize key compound movements, then by 1RM
  const sorted = Array.from(records.values()).sort((a, b) => {
    if (a.isKey && !b.isKey) return -1;
    if (!a.isKey && b.isKey) return 1;
    return b.best1RM - a.best1RM;
  });

  const lines: string[] = [];
  sorted.slice(0, 10).forEach(r => {
    lines.push(`• ${r.name} (${muscleCategoryLabel(r.category)}): лучший вес ${r.bestWeight} кг × ${r.bestReps} повт. ~ расчётный 1RM: ${r.best1RM} кг`);
  });

  return lines.join('\n');
}

/**
 * Formats workouts list.
 * If compressOlder is true, workouts starting from index 3 are compressed to a single summary line per exercise.
 */
function renderWorkoutsList(workouts: CompletedWorkout[], compressOlder: boolean): string {
  if (workouts.length === 0) {
    return 'В истории нет завершённых тренировок за указанный период.';
  }

  const lines: string[] = [];

  workouts.forEach((w, workoutIdx) => {
    const isCompressed = compressOlder && workoutIdx >= 3;
    const dateStr = formatIsoDate(w.endTime);
    const readinessStr = w.readiness ? READINESS_LABELS[w.readiness] || w.readiness : 'не указано';
    const duration = w.durationMinutes ? `${w.durationMinutes} мин` : 'длительность не указана';

    lines.push(`--- Тренировка ${workoutIdx + 1}: ${dateStr} | ${w.templateName} ---`);
    lines.push(`Длительность: ${duration} | Самочувствие: ${readinessStr} | Объём: ${Math.round(w.totalVolumeKg)} кг`);

    w.exercises.forEach((ex, exIdx) => {
      const completedSets = ex.sets.filter(s => s.completed !== false);
      const warmups = completedSets.filter(s => s.isWarmup || s.type === 'warmup');
      const working = completedSets.filter(s => !s.isWarmup && s.type !== 'warmup' && s.reps > 0);

      const planStr = `план: ${ex.targetSets}×${ex.minReps}${ex.minReps !== ex.maxReps ? `–${ex.maxReps}` : ''}`;
      const warmupNote = warmups.length > 0 ? ` [разминка: ${warmups.length} ${pluralize(warmups.length, ['подход', 'подхода', 'подходов'])}]` : '';

      if (isCompressed) {
        if (working.length === 0) {
          lines.push(`  ${exIdx + 1}. ${ex.name} (${ex.category}): нет рабочих подходов (${planStr})${warmupNote}`);
        } else {
          // Find best set by weight * reps
          let best = working[0];
          working.forEach(s => {
            if (s.weight > best.weight || (s.weight === best.weight && s.reps > best.reps)) {
              best = s;
            }
          });
          const rpeStr = best.rpe != null ? ` @RPE${best.rpe}` : '';
          lines.push(`  ${exIdx + 1}. ${ex.name} (${ex.category}): лучший ${best.weight}×${best.reps}${rpeStr} (всего ${working.length} раб. подх., ${planStr})${warmupNote}`);
        }
      } else {
        if (working.length === 0) {
          lines.push(`  ${exIdx + 1}. ${ex.name} [id: ${ex.exerciseId}] (${muscleCategoryLabel(ex.category)}): нет завершённых рабочих подходов | ${planStr}${warmupNote}`);
        } else {
          const setsStr = working.map(s => {
            const rpeStr = s.rpe != null ? ` @RPE${s.rpe}` : '';
            return `${s.weight}×${s.reps}${rpeStr}`;
          }).join(', ');
          lines.push(`  ${exIdx + 1}. ${ex.name} [id: ${ex.exerciseId}] (${muscleCategoryLabel(ex.category)}): ${setsStr} | ${planStr}${warmupNote}`);
        }
      }
    });

    lines.push('');
  });

  return lines.join('\n');
}

/**
 * Main pure function to construct the complete text report and AI prompt.
 */
export function buildAiReviewReport(
  history: CompletedWorkout[],
  settings: AppSettings,
  options: AiReviewOptions
): string {
  const now = options.now ?? Date.now();
  const period = options.period;

  // Filter workouts by period
  let periodWorkouts: CompletedWorkout[] = [];

  if (period === '2w') {
    const cutoff = now - 14 * 86400000;
    periodWorkouts = history.filter(w => w.endTime >= cutoff);
  } else if (period === '4w') {
    const cutoff = now - 28 * 86400000;
    periodWorkouts = history.filter(w => w.endTime >= cutoff);
  } else if (period === 'last8') {
    // Sort history descending by endTime, take first 8
    const sorted = [...history].sort((a, b) => b.endTime - a.endTime);
    periodWorkouts = sorted.slice(0, 8);
  }

  // Sort period workouts descending (newest first)
  periodWorkouts.sort((a, b) => b.endTime - a.endTime);

  // Overall latest workout in history for cycle details
  const latestWorkout = [...history].sort((a, b) => b.endTime - a.endTime)[0];

  // 1. Profile section
  const activeProg = settings.activeProgram;
  const goalStr = activeProg?.goal ? GOAL_LABELS[activeProg.goal] || activeProg.goal : 'не задана';
  const daysStr = activeProg?.daysPerWeek ? `${activeProg.daysPerWeek} дня/нед` : 'не задано';
  const gymProfile = activeProg?.gymProfile || settings.gymProfile || 'full';
  const gymStr = GYM_LABELS[gymProfile] || gymProfile;

  const cycleWeekStr = latestWorkout?.cycleWeek ? `Неделя ${latestWorkout.cycleWeek}` : 'не отслеживается';
  const cyclePhaseStr = latestWorkout?.cyclePhase ? (PHASE_LABELS[latestWorkout.cyclePhase] || latestWorkout.cyclePhase) : 'базовая';

  const profileSection = `=== ПРОФИЛЬ АТЛЕТА И ЦИКЛ ===
- Цель программы: ${goalStr}
- Частота тренировок: ${daysStr}
- Оснащение зала: ${gymStr}
- Текущая неделя цикла: ${cycleWeekStr}
- Текущая фаза цикла: ${cyclePhaseStr}
- Проанализировано тренировок: ${periodWorkouts.length} (период: ${period === '2w' ? 'последние 2 недели' : period === '4w' ? 'последние 4 недели' : 'последние 8 тренировок'})`;

  // 2. Stagnation / Plateau
  const stalledList = detectStagnation(history);
  let stagnationSection = '=== АНАЛИЗ ЗАСТОЯ (ПЛАТО) ===\n';
  if (stalledList.length === 0) {
    stagnationSection += 'Застоя не обнаружено: во всех упражнениях за последние 3 появления наблюдается прогресс в весе или повторениях (либо упражнение выполнялось менее 3 раз).';
  } else {
    stagnationSection += 'Обнаружен застой (3 тренировки подряд без роста веса или повторов):\n';
    stalledList.forEach(s => {
      stagnationSection += `• ${s.name} [id: ${s.exerciseId}] (${muscleCategoryLabel(s.category)}): ${s.historyDetails}\n`;
    });
  }

  // 3. Weekly Summary
  const weeklySection = `=== СВОДКА РАБОЧЕГО ОБЪЁМА ПО НЕДЕЛЯМ ===\n${buildWeeklySummary(periodWorkouts)}`;

  // 4. Period Records
  const recordsSection = `=== РЕКОРДЫ И 1RM ЗА ПЕРИОД ===\n${buildPeriodRecords(periodWorkouts)}`;

  // Helper to assemble full prompt given workouts text
  const assemble = (workoutsText: string) => {
    const parts: string[] = [];

    if (options.userNote && options.userNote.trim().length > 0) {
      parts.push(`Что меня сейчас волнует: ${options.userNote.trim()}\n`);
    }

    parts.push(AI_REVIEW_PROMPT_TEMPLATE);
    parts.push('\n');
    parts.push(profileSection);
    parts.push('\n');
    parts.push(EQUIPMENT_NOTES);
    parts.push('\n');
    parts.push(weeklySection);
    parts.push('\n');
    parts.push(stagnationSection.trim());
    parts.push('\n');
    parts.push(recordsSection);
    parts.push('\n');
    parts.push(`=== СПИСОК ТРЕНИРОВОК ЗА ПЕРИОД (ОТ НОВЫХ К СТАРЫМ) ===\n${workoutsText}`);

    return parts.join('\n');
  };

  // Try full details first
  let report = assemble(renderWorkoutsList(periodWorkouts, false));

  // If text exceeds 12 000 characters, compress workouts starting from index 3
  const MAX_CHARS = 12000;
  if (report.length > MAX_CHARS && periodWorkouts.length > 3) {
    report = assemble(renderWorkoutsList(periodWorkouts, true));
  }

  return report;
}
