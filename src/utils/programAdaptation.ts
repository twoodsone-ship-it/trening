import type {
  ActiveProgram,
  CompletedWorkout,
  DaysPerWeek,
  ProgramAdaptationAdvice
} from '../types';

function clampDays(n: number): DaysPerWeek {
  const allowed: DaysPerWeek[] = [2, 3, 4, 5, 6];
  return allowed.reduce((best, d) => (Math.abs(d - n) < Math.abs(best - n) ? d : best), 3);
}

/** Detect missed weeks / chronic high RPE and suggest lighter load. */
export function analyzeProgramHealth(
  program: ActiveProgram | null | undefined,
  history: CompletedWorkout[]
): ProgramAdaptationAdvice | null {
  if (!program) return null;

  const relevant = history
    .filter(h => program.templateIds.includes(h.templateId))
    .sort((a, b) => b.endTime - a.endTime);

  const now = Date.now();
  const last = relevant[0];
  if (!last) return null;
  const daysSince = last ? (now - last.endTime) / 86400000 : Infinity;

  if (daysSince >= 14) {
    const suggested = clampDays(Math.max(2, program.daysPerWeek - 1));
    return {
      id: 'missed-fortnight',
      severity: 'warning',
      title: 'Давно не тренировался',
      message: last
        ? `Прошло ${Math.floor(daysSince)} дн. с последней сессии. Имеет смысл снизить частоту и вернуться мягко.`
        : 'Пока нет завершённых тренировок по этой программе. Начни с комфортного объёма.',
      suggestedDaysPerWeek: suggested,
      actionLabel: suggested < program.daysPerWeek ? `Снизить до ${suggested}×/нед` : 'Понятно'
    };
  }

  const recent = relevant.slice(0, 3);
  if (recent.length >= 3) {
    const rpes: number[] = [];
    recent.forEach(w => {
      w.exercises.forEach(ex => {
        ex.sets.forEach(s => {
          if (s.rpe != null && !s.isWarmup && s.type !== 'warmup') rpes.push(s.rpe);
        });
      });
    });
    if (rpes.length >= 6) {
      const avg = rpes.reduce((a, b) => a + b, 0) / rpes.length;
      if (avg >= 9) {
        const suggested = clampDays(Math.max(2, program.daysPerWeek - 1));
        return {
          id: 'high-rpe',
          severity: 'warning',
          title: 'Слишком высокий RPE',
          message: `Средний RPE последних 3 тренировок ≈ ${avg.toFixed(1)}. Организм не успевает восстанавливаться — уменьши дни или объём.`,
          suggestedDaysPerWeek: suggested < program.daysPerWeek ? suggested : undefined,
          actionLabel: suggested < program.daysPerWeek ? `Облегчить: ${suggested}×/нед` : 'Ок'
        };
      }
    }
  }

  // Mild tip if hitting frequency well
  const fortnightWorkouts = relevant.filter(h => now - h.endTime < 14 * 86400000).length;
  const expected = Math.round((program.daysPerWeek / 7) * 14);
  if (fortnightWorkouts >= expected && fortnightWorkouts > 0) {
    return {
      id: 'on-track',
      severity: 'info',
      title: 'Темп хороший',
      message: `${fortnightWorkouts} тренировок за 14 дней при плане ${program.daysPerWeek}×/нед. Держи курс.`,
      actionLabel: 'Отлично'
    };
  }

  return null;
}
