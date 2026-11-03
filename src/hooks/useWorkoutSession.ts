import { useState, useEffect, useCallback } from 'react';
import type {
  ActiveExerciseSession,
  ActiveWorkout,
  AppSettings,
  CompletedWorkout,
  ReadinessLevel,
  WorkoutTemplate
} from '../types';
import { storageService } from '../services/storageService';
import { evaluateDoubleProgression } from '../services/progressionEngine';

export type AppTab = 'templates' | 'analytics';

function buildActiveExercises(
  template: WorkoutTemplate,
  readiness: ReadinessLevel
): ActiveExerciseSession[] {
  return template.exercises.map(ex => {
    const recommendation = evaluateDoubleProgression(
      ex.targetSets,
      ex.minReps,
      ex.maxReps,
      ex.weightStep,
      ex.currentWeight,
      ex.history,
      readiness
    );

    const lastSession = ex.history.length > 0 ? ex.history[ex.history.length - 1] : undefined;

    const initialSets = Array.from({ length: ex.targetSets }).map((_, i) => ({
      id: 's-' + Date.now() + '-' + i,
      setNumber: i + 1,
      weight: recommendation.nextWeight,
      reps: ex.minReps,
      rpe: 8,
      completed: false,
      type: 'working' as const
    }));

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
      targetSets: ex.targetSets,
      minReps: ex.minReps,
      maxReps: ex.maxReps,
      weightStep: ex.weightStep,
      targetWeight: recommendation.nextWeight,
      restSeconds: ex.restSeconds || 90,
      sets: initialSets,
      recommendation,
      previousPerformance: lastSession
        ? {
            date: lastSession.date,
            weight: lastSession.weight,
            sets: lastSession.sets
          }
        : undefined
    };
  });
}

export function useWorkoutSession() {
  const [activeTab, setActiveTab] = useState<AppTab>('templates');
  const [templates, setTemplates] = useState<WorkoutTemplate[]>([]);
  const [history, setHistory] = useState<CompletedWorkout[]>([]);
  const [settings, setSettings] = useState<AppSettings>(storageService.getSettings());
  const [activeWorkout, setActiveWorkout] = useState<ActiveWorkout | null>(null);
  const [isViewActiveWorkout, setIsViewActiveWorkout] = useState(false);
  const [pendingSummary, setPendingSummary] = useState<CompletedWorkout | null>(null);
  const [restTimerSeconds, setRestTimerSeconds] = useState(90);
  const [isRestTimerOpen, setIsRestTimerOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  const loadData = useCallback(() => {
    setTemplates(storageService.getTemplates());
    setHistory(storageService.getHistory());
    setSettings(storageService.getSettings());

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
    if (settings.theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [settings.theme]);

  useEffect(() => {
    storageService.saveActiveWorkout(activeWorkout);
  }, [activeWorkout]);

  const startWorkout = useCallback((template: WorkoutTemplate, readiness: ReadinessLevel = 'optimal') => {
    setPendingSummary(null);
    setActiveWorkout({
      templateId: template.id,
      templateName: template.name,
      readiness,
      startTime: Date.now(),
      exercises: buildActiveExercises(template, readiness)
    });
    setIsViewActiveWorkout(true);
  }, []);

  const finishWorkout = useCallback((completed: CompletedWorkout) => {
    storageService.saveCompletedWorkout(completed);
    setActiveWorkout(null);
    setIsViewActiveWorkout(false);
    setIsRestTimerOpen(false);
    setPendingSummary(completed);
    loadData();
  }, [loadData]);

  const dismissSummary = useCallback(() => {
    setPendingSummary(null);
    setActiveTab('analytics');
  }, []);

  const cancelWorkout = useCallback(() => {
    if (window.confirm('Отменить текущую тренировку? Несохраненные подходы будут сброшены.')) {
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

  const updateTemplate = useCallback((updated: WorkoutTemplate) => {
    setTemplates(prev => {
      const next = prev.map(t => (t.id === updated.id ? updated : t));
      storageService.saveTemplates(next);
      return next;
    });
  }, []);

  const createTemplate = useCallback((created: WorkoutTemplate) => {
    setTemplates(prev => {
      const next = [...prev, created];
      storageService.saveTemplates(next);
      return next;
    });
  }, []);

  const changeWeek = useCallback((week: 'A' | 'B') => {
    setSettings(prev => {
      const updated = { ...prev, currentWeek: week };
      storageService.saveSettings(updated);
      return updated;
    });
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
    startWorkout,
    finishWorkout,
    cancelWorkout,
    updateActiveExercises,
    triggerRestTimer,
    updateTemplate,
    createTemplate,
    changeWeek,
    updateSettings
  };
}
