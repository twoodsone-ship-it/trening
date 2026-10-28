import type { 
  ExerciseSession, 
  ProgressionRecommendation, 
  SetHistoryEntry 
} from '../types/index.ts';

/**
 * Calculates Estimated One Rep Max (1RM) using Epley and Brzycki equations.
 */
export function calculate1RM(weight: number, reps: number): number {
  if (reps <= 0 || weight <= 0) return 0;
  if (reps === 1) return weight;
  
  // Epley formula: w * (1 + r / 30)
  const epley = weight * (1 + reps / 30);
  // Brzycki formula: w * (36 / (37 - r))
  const brzycki = reps < 37 ? weight * (36 / (37 - reps)) : epley;
  
  const estimated = (epley + brzycki) / 2;
  return Math.round(estimated * 10) / 10;
}

/**
 * Calculates total volume tonnage (sum of weight * reps for completed sets).
 */
export function calculateVolume(sets: { weight: number; reps: number; completed?: boolean }[]): number {
  return sets.reduce((acc, set) => {
    if (set.completed === false) return acc;
    return acc + (set.weight * set.reps);
  }, 0);
}

/**
 * The core Smart Double Progression decision engine.
 */
export function evaluateDoubleProgression(
  targetSets: number,
  minReps: number,
  maxReps: number,
  weightStep: number,
  currentWeight: number,
  history: ExerciseSession[]
): ProgressionRecommendation {
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

  // Last completed session
  const lastSession = history[history.length - 1];
  const completedSets = lastSession.sets.filter(s => s.reps > 0);

  if (completedSets.length === 0) {
    return {
      decision: 'INCREASE_REPS',
      nextWeight: currentWeight,
      targetRepRange: `${minReps}-${maxReps}`,
      badgeText: '🎯 Цель: повторения',
      badgeColor: 'blue',
      analysis: 'Прошлая тренировка была неполной. Продолжайте работу с текущим весом.',
      suggestedAction: `Работайте с весом ${currentWeight} кг, цель — ${targetSets} подходов по ${minReps}-${maxReps} повт.`,
      consecutivePlateauCount: 0
    };
  }

  const allSetsHitMax = completedSets.length >= targetSets && 
    completedSets.slice(0, targetSets).every(s => s.reps >= maxReps);

  const averageRpe = completedSets.reduce((sum, s) => sum + (s.rpe || 8), 0) / completedSets.length;
  const maxRpe = Math.max(...completedSets.map(s => s.rpe || 8));

  // Check Plateau Detection: Look back up to 3 previous sessions
  let consecutivePlateau = 0;
  if (history.length >= 3) {
    const recentSessions = history.slice(-3);
    const weightsEqual = recentSessions.every(s => Math.abs(s.weight - recentSessions[0].weight) < 0.1);
    
    if (weightsEqual) {
      const totalRepsList = recentSessions.map(s => s.sets.reduce((sum, set) => sum + set.reps, 0));
      const noRepGrowth = totalRepsList[2] <= totalRepsList[1] && totalRepsList[1] <= totalRepsList[0] + 1;
      
      if (noRepGrowth && !allSetsHitMax) {
        consecutivePlateau = 3;
      }
    }
  }

  // 1. Plateau condition triggered
  if (consecutivePlateau >= 3) {
    const microStep = Math.max(0.5, Math.round((weightStep / 2) * 10) / 10);
    const deloadWeight = Math.max(20, Math.round((currentWeight * 0.9) * 2) / 2);

    return {
      decision: 'PLATEAU_WARNING',
      nextWeight: currentWeight,
      targetRepRange: `${minReps}-${maxReps}`,
      badgeText: '⚠️ Плато (3 сессии)',
      badgeColor: 'amber',
      analysis: `Вы зафиксировались на одном объеме 3 тренировки подряд (${currentWeight} кг). Накопленная усталость мешает прогрессу.`,
      suggestedAction: `Рекомендация: 1) Сделайте разгрузку (Делоад: ${deloadWeight} кг на 1 неделю) ИЛИ 2) Используйте микро-прибавку (+${microStep} кг вместо +${weightStep} кг).`,
      consecutivePlateauCount: consecutivePlateau
    };
  }

  // 2. All sets reached max reps
  if (allSetsHitMax) {
    // If it was an absolute RPE 10 grind or form failure, recommend 1 consolidation session
    if (maxRpe >= 9.5) {
      return {
        decision: 'CONSOLIDATE_WEIGHT',
        nextWeight: currentWeight,
        targetRepRange: `${maxReps}`,
        badgeText: '🔄 Закрепление веса',
        badgeColor: 'purple',
        analysis: `Вы закрыли ${maxReps} повторений во всех подходах, но на пределе сил (RPE ${maxRpe}). Форма требует фиксации перед увеличением веса.`,
        suggestedAction: `Повторите ${currentWeight} кг еще 1 тренировку. Сфокусируйтесь на чистоте техники и контроле эксцентрики. При успехе повышаем вес!`,
        consecutivePlateauCount: 0
      };
    }

    // Standard smart progression: Boost weight, drop to lower rep bracket
    const nextWeight = Math.round((currentWeight + weightStep) * 10) / 10;
    return {
      decision: 'INCREASE_WEIGHT',
      nextWeight,
      targetRepRange: `${minReps}-${minReps + 2}`,
      badgeText: `⚡ +${weightStep} кг Повышение!`,
      badgeColor: 'emerald',
      analysis: `Отличная работа! Закрыты все ${targetSets} подходов по ${maxReps} повт. с хорошим запасом (RPE ~${averageRpe.toFixed(1)}). Активирован второй шаг двойной прогрессии.`,
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
  let actionMsg = `Оставайтесь на весе ${currentWeight} кг. Постарайтесь добавить хотя бы +1 повторение в отстающих подходах.`;

  if (repsNeeded <= 2) {
    analysisMsg += ` Вы буквально в одном шаге от взятия веса (осталось всего ${repsNeeded} повт. до максимума)!`;
    actionMsg = `Максимальный фокус! Дожмите оставшиеся повторения, чтобы в следующий раз взять ${currentWeight + weightStep} кг.`;
  }

  return {
    decision: 'INCREASE_REPS',
    nextWeight: currentWeight,
    targetRepRange: `${minReps}-${maxReps}`,
    badgeText: `📈 Набор повторений (${progressPercent}%)`,
    badgeColor: 'blue',
    analysis: analysisMsg,
    suggestedAction: actionMsg,
    consecutivePlateauCount: 0
  };
}
