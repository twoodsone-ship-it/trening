import { useState, useEffect, useCallback } from 'react';
import type {
  ActiveExerciseSession,
  ActiveProgram,
  ActiveWorkout,
  AppSettings,
  CompletedWorkout,
  DaysPerWeek,
  GymProfile,
  ProgramGoal,
  ReadinessLevel,
  WorkoutSet,
  WorkoutTemplate
} from '../types';
import { storageService } from '../services/storageService';
import { pluralize } from '../utils/pluralize';
import { evaluateDoubleProgression } from '../services/progressionEngine';
import { buildProgramTemplates, getProgramCycle } from '../data/programBuilder';
import { createTrialSet, shouldCreateTrialSet } from '../utils/trialSet';
import { roundWeight } from '../utils/roundWeight';
import { cancelActiveWorkoutSession } from '../utils/activeWorkoutSession';
import { isValidExerciseSession } from '../utils/sessionValidation';

export type AppTab = 'home' | 'analytics';

export function buildActiveExercises(
  template: WorkoutTemplate,
  readiness: ReadinessLevel,
  cyclePhase: 'base' | 'progress' | 'overload' | 'deload'
): ActiveExerciseSession[] {
  return template.exercises.map((ex, exIndex) => {
    const recommendation = ex.trackingMode === 'duration' ? {
      decision: 'FIRST_SESSION' as const,
      nextWeight: 0,
      targetRepRange: 'по времени',
      badgeText: 'Работа по времени',
      badgeColor: 'blue' as const,
      analysis: 'Выберите комфортную длительность и сохраняйте ровную технику.',
      suggestedAction: 'Увеличивайте длительность постепенно, если нагрузка ощущается комфортной.',
      consecutivePlateauCount: 0
    } : evaluateDoubleProgression(
      ex.targetSets,
      ex.minReps,
      ex.maxReps,
      ex.weightStep,
      ex.currentWeight,
      ex.history,
      readiness
    );

    const validHistory = ex.history.filter(session => isValidExerciseSession(session));
    const effectiveHistory = validHistory.length > 0 ? validHistory : ex.history;
    const regularHistory = effectiveHistory.filter(session => session.phase !== 'deload' && session.progressionNote !== 'Разгрузочная неделя');
    const lastSession = (regularHistory.length ? regularHistory : effectiveHistory).at(-1);

    const targetSets = cyclePhase === 'deload' ? Math.max(1, Math.ceil(ex.targetSets * 0.6)) : ex.targetSets;
    const deloadWeight = ex.weightStep > 0
      ? Math.max(ex.weightStep, Math.round((ex.currentWeight * 0.9) / ex.weightStep) * ex.weightStep)
      : 0;
    const nextWeight = roundWeight(cyclePhase === 'deload' ? deloadWeight : recommendation.nextWeight);
    const initialSets: WorkoutSet[] = Array.from({ length: targetSets }).map((_, i) => ({
      id: 's-' + Date.now() + '-' + i,
      setNumber: i + 1,
      weight: nextWeight,
      reps: ex.minReps,
      durationSeconds: ex.trackingMode === 'duration' ? (ex.defaultDurationSeconds || 0) : undefined,
      rpe: undefined,
      completed: false,
      type: 'working' as const
    }));
    if (shouldCreateTrialSet(ex)) {
      initialSets.unshift(createTrialSet({ ...ex, targetWeight: nextWeight }, `trial-${Date.now()}-${exIndex}`));
    }

    return {
      exerciseId: ex.id,
      name: ex.name,
      category: ex.category,
      equipment: ex.equipment,
      animationType: ex.animationType,
      gifUrl: ex.gifUrl,
      technique: ex.technique,
      alternatives: ex.alternatives,
      supersetGroupId: ex.supersetGroupId,
      targetSets,
      minReps: ex.minReps,
      maxReps: ex.maxReps,
      weightStep: ex.weightStep,
      targetWeight: nextWeight,
      restSeconds: ex.restSeconds || 90,
      sets: initialSets,
      recommendation: cyclePhase === 'deload'
        ? {
            ...recommendation,
            decision: 'CONSOLIDATE_WEIGHT',
            nextWeight,
            badgeText: 'Разгрузочная неделя',
            suggestedAction: `Выполни ${targetSets} ${pluralize(targetSets, ['подход', 'подхода', 'подходов'])} примерно с 90% обычного веса. Оставь запас и сосредоточься на восстановлении.`
          }
        : recommendation,
      previousPerformance: lastSession
        ? {
            date: lastSession.date,
            weight: lastSession.weight,
            sets: lastSession.sets
          }
        : undefined,
      historySessions: ex.history.map(h => ({
        date: h.date,
        weight: h.weight,
        totalVolume: h.totalVolume,
        totalDurationSeconds: h.totalDurationSeconds
      })),
      trackingMode: ex.trackingMode || 'reps',
      defaultDurationSeconds: ex.defaultDurationSeconds,
      cardioIntensity: ex.cardioIntensity
    };
  });
}

export function useWorkoutSession() {
  const [activeTab, setActiveTab] = useState<AppTab>('home');
  const [templates, setTemplates] = useState<WorkoutTemplate[]>([]);
  const [history, setHistory] = useState<CompletedWorkout[]>([]);
  const [settings, setSettings] = useState<AppSettings>(storageService.getSettings());
  const [activeProgram, setActiveProgram] = useState<ActiveProgram | null>(null);
  const [activeWorkout, setActiveWorkout] = useState<ActiveWorkout | null>(() => storageService.getActiveWorkout());
  const [isViewActiveWorkout, setIsViewActiveWorkout] = useState(false);
  const [pendingSummary, setPendingSummary] = useState<CompletedWorkout | null>(null);
  const [restTimerSeconds, setRestTimerSeconds] = useState(90);
  const [isRestTimerOpen, setIsRestTimerOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [finishError, setFinishError] = useState(false);

  const loadData = useCallback(() => {
    setTemplates(storageService.getTemplates());
    setHistory(storageService.getHistory());
    setSettings(storageService.getSettings());
    setActiveProgram(storageService.getActiveProgram());

    const savedActive = storageService.getActiveWorkout();
    if (savedActive) {
      setActiveWorkout(savedActive);
      setIsViewActiveWorkout(true);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  useEffect(() => {
    document.documentElement.classList.add('dark');
  }, []);

  useEffect(() => {
    if (activeWorkout) storageService.saveActiveWorkout(activeWorkout);
  }, [activeWorkout]);

  const applyProgram = useCallback((
    goal: ProgramGoal,
    days: DaysPerWeek,
    gym: GymProfile = 'full',
    coreSessions: 0 | 1 | 2 | 3 | 4 = 2,
    cardioSessions = goal === 'cut' ? Math.min(3, days) : goal === 'recomp' ? Math.min(2, days) : 0
  ) => {
    const previous = storageService.getTemplates();
    const { program, templates: generated } = buildProgramTemplates(goal, days, previous, gym, coreSessions, cardioSessions);
    storageService.applyGeneratedProgram(program, generated);
    const nextSettings = {
      ...storageService.getSettings(),
      gymProfile: gym,
      focusModeDefault: true as const,
      activeProgram: program
    };
    storageService.saveSettings(nextSettings);
    storageService.saveActiveProgram(program);
    setActiveProgram(program);
    setTemplates(generated);
    setSettings(nextSettings);
  }, []);

  const saveProgramEdits = useCallback((nextTemplates: WorkoutTemplate[], nextProgram: ActiveProgram) => {
    storageService.saveTemplates(nextTemplates);
    storageService.saveActiveProgram(nextProgram);
    setTemplates(nextTemplates);
    setActiveProgram(nextProgram);
    setSettings(storageService.getSettings());
  }, []);

  const startWorkout = useCallback((template: WorkoutTemplate, readiness: ReadinessLevel = 'optimal') => {
    setPendingSummary(null);
    const cycle = activeProgram ? getProgramCycle(activeProgram.startedAt) : null;
    setActiveWorkout({
      templateId: template.id,
      templateName: template.name,
      readiness,
      startTime: Date.now(),
      cycleWeek: cycle?.week,
      cyclePhase: cycle?.phase,
      exercises: buildActiveExercises(template, readiness, cycle?.phase || 'base')
    });
    setIsViewActiveWorkout(true);
  }, [activeProgram]);

  const finishWorkout = useCallback((completed: CompletedWorkout) => {
    try {
      storageService.saveCompletedWorkout(completed);
    } catch {
      setFinishError(true);
      return false;
    }
    setFinishError(false);
    cancelActiveWorkoutSession();
    setActiveWorkout(null);
    setIsViewActiveWorkout(false);
    setIsRestTimerOpen(false);
    setPendingSummary(completed);
    loadData();
    return true;
  }, [loadData]);

  const dismissFinishError = useCallback(() => setFinishError(false), []);

  const dismissSummary = useCallback(() => {
    setPendingSummary(null);
    setActiveTab('home');
  }, []);

  const cancelWorkout = useCallback(() => {
    if (window.confirm('Отменить текущую тренировку? Несохраненные подходы будут сброшены.')) {
      cancelActiveWorkoutSession();
      setActiveWorkout(null);
      setIsViewActiveWorkout(false);
      setIsRestTimerOpen(false);
    }
  }, []);

  const updateActiveExercises = useCallback((exercises: ActiveExerciseSession[]) => {
    setActiveWorkout(prev => (prev ? { ...prev, exercises } : null));
  }, []);

  const triggerRestTimer = useCallback((seconds: number) => {
    setRestTimerSeconds(seconds);
    setIsRestTimerOpen(true);
  }, []);

  const updateSettings = useCallback((newSettings: AppSettings) => {
    setSettings(newSettings);
    storageService.saveSettings(newSettings);
  }, []);

  const previousVolumeForTemplate = useCallback((templateId: string, excludeWorkoutId?: string) => {
    const match = history.find(h => h.templateId === templateId && h.id !== excludeWorkoutId);
    return match?.totalVolumeKg;
  }, [history]);

  return {
    activeTab,
    setActiveTab,
    templates,
    history,
    settings,
    activeProgram,
    activeWorkout,
    isViewActiveWorkout,
    setIsViewActiveWorkout,
    pendingSummary,
    dismissSummary,
    previousVolumeForTemplate,
    restTimerSeconds,
    isRestTimerOpen,
    setIsRestTimerOpen,
    isSettingsOpen,
    setIsSettingsOpen,
    loadData,
    applyProgram,
    saveProgramEdits,
    startWorkout,
    finishWorkout,
    finishError,
    dismissFinishError,
    cancelWorkout,
    updateActiveExercises,
    triggerRestTimer,
    updateSettings
  };
}
