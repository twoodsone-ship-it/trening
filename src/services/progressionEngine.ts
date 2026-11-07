import type { 
  ExerciseSession, 
  ProgressionRecommendation, 
  ReadinessLevel,
  SetHistoryEntry 
} from '../types/index.ts';

export const PLATEAU_SESSION_COUNT = 3;
export const RETURNING_AFTER_DAYS = 21;
export const LONG_BREAK_DAYS = 42;

/**
 * Calculates Estimated One Rep Max (1RM) using Epley and Brzycki equations.
 * For high repetitions (r > 15), Brzycki formula becomes non-linear and approaches
 * division-by-zero (r >= 37). To prevent Infinity / NaN, exclusively Epley formula
 * is used for r > 15.
 */
export function calculate1RM(weight: number, reps: number): number {
  if (!Number.isFinite(weight) || !Number.isFinite(reps) || reps <= 0 || weight <= 0) return 0;
  if (reps === 1) return weight;
  
  // Epley formula: w * (1 + r / 30)
  const epley = weight * (1 + reps / 30);
  
  // Guard: if r > 15, use exclusively Epley to avoid distortion and division-by-zero
  if (reps > 15) {
    return Math.round(epley * 10) / 10;
  }
  
  // Brzycki formula for r <= 15: w * (36 / (37 - r))
  const brzycki = weight * (36 / (37 - reps));
  const estimated = (epley + brzycki) / 2;
  return Math.round(estimated * 10) / 10;
}

/**
 * Calculates total volume tonnage (sum of weight * reps for completed sets).
 * Excludes warmups if specified.
 */
export function calculateVolume(sets: { weight: number; reps: number; completed?: boolean; type?: string; isWarmup?: boolean }[]): number {
  return sets.reduce((acc, set) => {
    if (set.completed === false) return acc;
    if (set.type === 'warmup' || set.isWarmup) return acc;
    return acc + (set.weight * set.reps);
  }, 0);
}

/**
 * The core Smart Double Progression decision engine with Warmup isolation & Auto-Regulation.
 */
export function evaluateDoubleProgression(
  targetSets: number,
  minReps: number,
  maxReps: number,
  weightStep: number,
  currentWeight: number,
  history: ExerciseSession[],
  readiness: ReadinessLevel = 'optimal',
  now: Date = new Date()
): ProgressionRecommendation {
  const isFatigued = readiness === 'tired' || readiness === 'sleep_deprived';

  if (!history || history.length === 0) {
    return {
      decision: 'FIRST_SESSION',
      nextWeight: currentWeight,
      targetRepRange: `${minReps}-${maxReps}`,
      badgeText: '🏁 Первый цикл',
      badgeColor: 'blue',
      analysis: 'История пока отсутствует. Начните с комфортного веса и стремитесь к верхней границе повторений.',
      suggestedAction: `Выполните ${targetSets} подхода по ${minReps}-${maxReps} повторений с весом ${currentWeight} кг.`,
      consecutivePlateauCount: 0
    };
  }

  // Last completed session: filter out warmup sets
  const workingHistory = history.filter(session => session.phase !== 'deload' && session.progressionNote !== 'Разгрузочная неделя');
  const referenceHistory = workingHistory.length ? workingHistory : history;
  const lastSession = referenceHistory[referenceHistory.length - 1];
  const eligibleSets = lastSession.sets.filter(s => s.completed !== false && s.reps > 0 && s.type !== 'warmup' && !s.isWarmup && s.type !== 'dropset');
  const topWorkingWeight = eligibleSets.reduce((top, set) => Math.max(top, set.weight), 0);
  const completedSets = eligibleSets.filter(s => s.weight >= topWorkingWeight - 0.01);
  const lastWeight = completedSets[completedSets.length - 1]?.weight ?? lastSession.weight;
  const currentTarget = currentWeight;
  const ageDays = Math.max(0, (now.getTime() - new Date(history[history.length - 1].date).getTime()) / 86400000);

  if (ageDays >= RETURNING_AFTER_DAYS) {
    const longBreakWeight = ageDays >= LONG_BREAK_DAYS
      ? (weightStep > 0 ? Math.round((lastWeight * 0.9) / weightStep) * weightStep : Math.round(lastWeight * 0.9 * 10) / 10)
      : lastWeight;
    return {
      decision: 'INCREASE_REPS',
      nextWeight: longBreakWeight,
      targetRepRange: `${minReps}-${maxReps}`,
      badgeText: ageDays >= LONG_BREAK_DAYS ? '↩️ Возврат после перерыва' : '↩️ Возвращение после перерыва',
      badgeColor: 'amber',
      analysis: ageDays >= LONG_BREAK_DAYS ? 'После длительного перерыва вернитесь с весом на 10% ниже последней тренировки.' : 'После перерыва не повышайте вес; сначала вернитесь к рабочему ритму.',
      suggestedAction: `Начните с ${longBreakWeight} кг и восстановите привычный темп тренировок.`,
      consecutivePlateauCount: 0
    };
  }

  if (completedSets.length === 0) {
    return {
      decision: 'INCREASE_REPS',
      nextWeight: currentWeight,
      targetRepRange: `${minReps}-${maxReps}`,
      badgeText: '🎯 Цель: рабочие сеты',
      badgeColor: 'blue',
      analysis: 'В прошлой тренировке зафиксированы только разминочные сеты либо неполные данные. Продолжайте работу с текущим весом.',
      suggestedAction: `Работайте с весом ${currentWeight} кг, цель — ${targetSets} рабочих подходов по ${minReps}-${maxReps} повт.`,
      consecutivePlateauCount: 0
    };
  }

  const allSetsHitMax = completedSets.length >= targetSets && 
    completedSets.slice(0, targetSets).every(s => s.reps >= maxReps);

  const knownRpes = completedSets.flatMap(s => s.rpe == null ? [] : [s.rpe]);
  const averageRpe = knownRpes.length ? knownRpes.reduce((sum, rpe) => sum + rpe, 0) / knownRpes.length : 0;
  const maxRpe = knownRpes.length ? Math.max(...knownRpes) : 0;

  // Two consecutive sessions below the minimum indicate regression rather than a rep plateau.
  const recentFailures = referenceHistory.slice(-2);
  if (recentFailures.length === 2 && recentFailures.every(session => {
    const working = session.sets.filter(set => set.completed !== false && set.type !== 'warmup' && !set.isWarmup && set.type !== 'dropset');
    const top = working.reduce((value, set) => Math.max(value, set.weight), 0);
    const main = working.filter(set => set.weight >= top - 0.01);
    return main.length >= targetSets && main.slice(0, targetSets).every(set => set.reps > 0 && set.reps < minReps);
  })) {
    const nextWeight = weightStep > 0
      ? Math.round((lastWeight * 0.9) / weightStep) * weightStep
      : Math.round(lastWeight * 0.9 * 10) / 10;
    return {
      decision: 'DELOAD_RECOMMENDED', nextWeight, targetRepRange: `${minReps}-${maxReps}`,
      badgeText: '↘️ Разгрузка', badgeColor: 'amber',
      analysis: 'Две тренировки подряд все рабочие подходы ниже нижней границы повторений.',
      suggestedAction: `Снизьте вес до ${nextWeight} кг и восстановите рабочий диапазон.`,
      consecutivePlateauCount: 0
    };
  }

  // Check Plateau Detection: Look back up to 3 previous sessions
  let consecutivePlateau = 0;
  if (!isFatigued && referenceHistory.length >= PLATEAU_SESSION_COUNT) {
    const recentSessions = referenceHistory.slice(-PLATEAU_SESSION_COUNT);
    const weightsEqual = recentSessions.every(s => Math.abs(s.weight - recentSessions[0].weight) < 0.1);
    
    if (weightsEqual) {
      const totalRepsList = recentSessions.map(s => {
        const working = s.sets.filter(st => st.completed !== false && st.reps > 0 && st.type !== 'warmup' && !st.isWarmup && st.type !== 'dropset');
        const top = working.reduce((value, set) => Math.max(value, set.weight), 0);
        return working.filter(set => set.weight >= top - 0.01).reduce((sum, set) => sum + set.reps, 0);
      });
      const lastIndex = totalRepsList.length - 1;
      const noRepGrowth = totalRepsList[lastIndex] <= totalRepsList[lastIndex - 1] && totalRepsList[lastIndex - 1] <= totalRepsList[lastIndex - 2] + 1;
      
      if (noRepGrowth && !allSetsHitMax) {
        consecutivePlateau = 3;
      }
    }
  }

  // 1. Plateau condition triggered (only if NOT in fatigued/auto-regulation mode)
  if (consecutivePlateau >= 3 && !isFatigued) {
    const microStep = Math.max(0.5, Math.round((weightStep / 2) * 10) / 10);
    const deloadWeight = weightStep > 0 ? Math.max(weightStep, Math.round((currentWeight * 0.9) / weightStep) * weightStep) : currentWeight;

    return {
      decision: 'PLATEAU_WARNING',
      nextWeight: lastWeight,
      targetRepRange: `${minReps}-${maxReps}`,
      badgeText: '⚠️ Плато (3 сессии)',
      badgeColor: 'amber',
      analysis: `Вы зафиксировались на одном объеме 3 тренировки подряд (${lastWeight} кг). Накопленная усталость мешает прогрессу.`,
      suggestedAction: `Рекомендация: 1) Сделайте разгрузку (Делоад: ${deloadWeight} кг на 1 неделю) ИЛИ 2) Используйте микро-прибавку (+${microStep} кг вместо +${weightStep} кг).`,
      consecutivePlateauCount: consecutivePlateau
    };
  }

  // Auto-regulation RPE threshold: lower by 0.5 points if fatigued (from 9.5 to 9.0)
  const rpeThreshold = isFatigued ? 9.0 : 9.5;

  // 2. All sets reached max reps
  if (allSetsHitMax) {
    if (lastWeight < currentTarget - 0.01) return {
      decision: 'INCREASE_REPS', nextWeight: lastWeight, targetRepRange: `${minReps}-${maxReps}`, badgeText: '↔️ Удержание фактического веса', badgeColor: 'blue', analysis: 'Рабочие подходы выполнены с меньшим весом. Сначала закрепите прогресс на фактически поднятом весе.', suggestedAction: `Оставайтесь на ${lastWeight} кг.`, consecutivePlateauCount: 0
    };
    if (lastSession.decision === 'CONSOLIDATE_WEIGHT') {
      const microStep = Math.max(0.5, Math.round(weightStep / 2 * 10) / 10);
      const nextWeight = Math.round((lastWeight + microStep) * 10) / 10;
      return { decision: 'INCREASE_WEIGHT', nextWeight, targetRepRange: `${minReps}-${minReps + 2}`, badgeText: `⚡ +${microStep} кг Повышение!`, badgeColor: 'emerald', analysis: 'Вы повторно закрыли верхнюю границу после закрепления веса. Переходите на небольшой шаг независимо от RPE.', suggestedAction: `Увеличьте вес до ${nextWeight} кг.`, consecutivePlateauCount: 0 };
    }
    // If it was near limit / grind, recommend consolidation
    if (maxRpe >= rpeThreshold) {
      const fatigueNote = isFatigued ? ' [Авторегуляция: порог RPE снижен на 0.5 из-за утомления]' : '';
      return {
      decision: 'CONSOLIDATE_WEIGHT',
      nextWeight: lastWeight,
        targetRepRange: `${maxReps}`,
        badgeText: '🔄 Закрепление веса',
        badgeColor: 'purple',
        analysis: `Вы закрыли ${maxReps} повторений во всех подходах, но на высоком усилии (RPE ${maxRpe}). Форма требует фиксации перед увеличением веса.${fatigueNote}`,
        suggestedAction: `Повторите ${currentWeight} кг еще 1 тренировку. Сфокусируйтесь на чистоте техники и контроле эксцентрики. При успехе повышаем вес!`,
        consecutivePlateauCount: 0
      };
    }

    // Standard smart progression: Boost weight, drop to lower rep bracket
    const overperformed = completedSets.slice(0, targetSets).every(s => s.reps >= maxReps + 2);
    const nextWeight = Math.round((lastWeight + weightStep * (overperformed ? 2 : 1)) * 10) / 10;
    return {
      decision: 'INCREASE_WEIGHT',
      nextWeight,
      targetRepRange: `${minReps}-${minReps + 2}`,
      badgeText: `⚡ +${weightStep} кг Повышение!`,
      badgeColor: 'emerald',
      analysis: `Отличная работа! Закрыты все ${targetSets} подходов по ${maxReps} повт. с хорошим запасом (RPE ${knownRpes.length ? `~${averageRpe.toFixed(1)}` : 'неизвестно'}). Активирован второй шаг двойной прогрессии.`,
      suggestedAction: `Увеличьте вес до ${nextWeight} кг. Цель на сегодня: выполнить от ${minReps} повторений в каждом подходе.`,
      consecutivePlateauCount: 0
    };
  }

  // 3. In-between: Working on the repetition progression
  const repCounts = completedSets.slice(0, targetSets).map(s => s.reps);
  const totalRepsCurrent = repCounts.reduce((a, b) => a + b, 0);
  const maxPossibleReps = targetSets * maxReps;
  const progressPercent = Math.min(100, Math.round((totalRepsCurrent / maxPossibleReps) * 100));

  // Check if athlete is just 1-2 reps away from breakthrough
  const repsNeeded = maxPossibleReps - totalRepsCurrent;

  let analysisMsg = `Текущий результат: [${repCounts.join(', ')}] повт. Прогресс цикла: ${progressPercent}%.`;
  if (isFatigued) {
    analysisMsg += ' 🛡️ Режим авторегуляции: детектор плато заморожен на эту сессию.';
  }
  let actionMsg = `Оставайтесь на весе ${lastWeight} кг. Постарайтесь добавить хотя бы +1 повторение в отстающих подходах.`;

  if (repsNeeded <= 2) {
    analysisMsg += ` Вы буквально в одном шаге от взятия веса (осталось всего ${repsNeeded} повт. до максимума)!`;
    actionMsg = `Максимальный фокус! Дожмите оставшиеся повторения, чтобы в следующий раз взять ${lastWeight + weightStep} кг.`;
  }

  return {
    decision: 'INCREASE_REPS',
    nextWeight: lastWeight,
    targetRepRange: `${minReps}-${maxReps}`,
    badgeText: isFatigued ? `🛡️ Авторегуляция (${progressPercent}%)` : `📈 Набор повторений (${progressPercent}%)`,
    badgeColor: isFatigued ? 'amber' : 'blue',
    analysis: analysisMsg,
    suggestedAction: actionMsg,
    consecutivePlateauCount: 0
  };
}
