import React, { useState, useEffect } from 'react';
import { 
  ActiveExerciseSession, 
  AppSettings, 
  CompletedWorkout, 
  WorkoutTemplate 
} from './types';
import { storageService } from './services/storageService';
import { evaluateDoubleProgression } from './services/progressionEngine';
import { WorkoutTemplateList } from './components/WorkoutTemplateList';
import { ActiveWorkoutView } from './components/ActiveWorkoutView';
import { AnalyticsView } from './components/AnalyticsView';
import { SettingsModal } from './components/SettingsModal';
import { RestTimer } from './components/RestTimer';
import { Navigation } from './components/Navigation';
import { PWAInstallBanner } from './components/PWAInstallBanner';

export const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'templates' | 'analytics'>('templates');
  const [templates, setTemplates] = useState<WorkoutTemplate[]>([]);
  const [history, setHistory] = useState<CompletedWorkout[]>([]);
  const [settings, setSettings] = useState<AppSettings>(storageService.getSettings());
  
  // Active Workout State
  const [activeWorkout, setActiveWorkout] = useState<{
    templateId: string;
    templateName: string;
    startTime: number;
    exercises: ActiveExerciseSession[];
  } | null>(null);

  const [isViewActiveWorkout, setIsViewActiveWorkout] = useState(false);

  // Rest Timer State
  const [restTimerSeconds, setRestTimerSeconds] = useState(90);
  const [isRestTimerOpen, setIsRestTimerOpen] = useState(false);

  // Settings Modal State
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  // Sync theme class to document element
  useEffect(() => {
    if (settings.theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [settings.theme]);

  // Load initial data
  const loadData = () => {
    setTemplates(storageService.getTemplates());
    setHistory(storageService.getHistory());
    const currentSettings = storageService.getSettings();
    setSettings(currentSettings);

    const savedActive = storageService.getActiveWorkout();
    if (savedActive) {
      setActiveWorkout(savedActive);
      setIsViewActiveWorkout(true);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // Sync active workout to storage whenever it changes
  useEffect(() => {
    storageService.saveActiveWorkout(activeWorkout);
  }, [activeWorkout]);

  // Start new workout from template
  const handleStartWorkout = (template: WorkoutTemplate) => {
    const activeExercises: ActiveExerciseSession[] = template.exercises.map(ex => {
      // Evaluate progression recommendation
      const recommendation = evaluateDoubleProgression(
        ex.targetSets,
        ex.minReps,
        ex.maxReps,
        ex.weightStep,
        ex.currentWeight,
        ex.history
      );

      // Previous session data for ghost display
      const lastSession = ex.history.length > 0 ? ex.history[ex.history.length - 1] : undefined;

      // Seed sets
      const initialSets = Array.from({ length: ex.targetSets }).map((_, i) => ({
        id: 's-' + Date.now() + '-' + i,
        setNumber: i + 1,
        weight: recommendation.nextWeight,
        reps: ex.minReps,
        rpe: 8,
        completed: false
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
        targetSets: ex.targetSets,
        minReps: ex.minReps,
        maxReps: ex.maxReps,
        weightStep: ex.weightStep,
        targetWeight: recommendation.nextWeight,
        restSeconds: ex.restSeconds || 90,
        sets: initialSets,
        recommendation,
        previousPerformance: lastSession ? {
          date: lastSession.date,
          weight: lastSession.weight,
          sets: lastSession.sets
        } : undefined
      };
    });

    const newSession = {
      templateId: template.id,
      templateName: template.name,
      startTime: Date.now(),
      exercises: activeExercises
    };

    setActiveWorkout(newSession);
    setIsViewActiveWorkout(true);
  };

  const handleFinishWorkout = (completed: CompletedWorkout) => {
    storageService.saveCompletedWorkout(completed);
    setActiveWorkout(null);
    setIsViewActiveWorkout(false);
    setIsRestTimerOpen(false);
    loadData();
    setActiveTab('analytics');
  };

  const handleCancelWorkout = () => {
    if (window.confirm('Отменить текущую тренировку? Несохраненные подходы будут сброшены.')) {
      setActiveWorkout(null);
      setIsViewActiveWorkout(false);
      setIsRestTimerOpen(false);
    }
  };

  const handleTriggerRestTimer = (seconds: number) => {
    setRestTimerSeconds(seconds);
    setIsRestTimerOpen(true);
  };

  const handleUpdateTemplate = (updated: WorkoutTemplate) => {
    const newTemplates = templates.map(t => t.id === updated.id ? updated : t);
    setTemplates(newTemplates);
    storageService.saveTemplates(newTemplates);
  };

  const handleCreateTemplate = (created: WorkoutTemplate) => {
    const newTemplates = [...templates, created];
    setTemplates(newTemplates);
    storageService.saveTemplates(newTemplates);
  };

  const handleChangeWeek = (week: 'A' | 'B') => {
    const updated = { ...settings, currentWeek: week };
    setSettings(updated);
    storageService.saveSettings(updated);
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-gym-dark text-slate-900 dark:text-zinc-100 flex flex-col font-sans selection:bg-emerald-500 selection:text-white transition-colors duration-200">
      
      {/* PWA installation prompt */}
      <PWAInstallBanner />

      {/* Main View Router */}
      <div className="flex-1">
        {isViewActiveWorkout && activeWorkout ? (
          <ActiveWorkoutView
            workoutName={activeWorkout.templateName}
            templateId={activeWorkout.templateId}
            startTime={activeWorkout.startTime}
            exercises={activeWorkout.exercises}
            onUpdateExercises={(updated) => {
              setActiveWorkout(prev => prev ? { ...prev, exercises: updated } : null);
            }}
            onFinishWorkout={handleFinishWorkout}
            onCancelWorkout={handleCancelWorkout}
            onTriggerRestTimer={handleTriggerRestTimer}
          />
        ) : (
          <>
            {activeTab === 'templates' && (
              <WorkoutTemplateList
                templates={templates}
                currentWeek={settings.currentWeek || 'A'}
                onChangeWeek={handleChangeWeek}
                onStartWorkout={handleStartWorkout}
                onUpdateTemplate={handleUpdateTemplate}
                onCreateTemplate={handleCreateTemplate}
              />
            )}

            {activeTab === 'analytics' && (
              <AnalyticsView
                history={history}
                templates={templates}
              />
            )}

            {/* Bottom Bar Navigation */}
            <Navigation
              activeTab={activeTab}
              onSelectTab={setActiveTab}
              onOpenSettings={() => setIsSettingsOpen(true)}
              hasActiveWorkout={!!activeWorkout}
              onReturnToActiveWorkout={() => setIsViewActiveWorkout(true)}
            />
          </>
        )}
      </div>

      {/* Global Gym Rest Countdown Timer */}
      <RestTimer
        initialSeconds={restTimerSeconds}
        isOpen={isRestTimerOpen}
        onClose={() => setIsRestTimerOpen(false)}
        soundEnabled={settings.soundEnabled}
        vibrationEnabled={settings.vibrationEnabled}
      />

      {/* Settings & Backup Modal */}
      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        settings={settings}
        onUpdateSettings={(newSettings) => {
          setSettings(newSettings);
          storageService.saveSettings(newSettings);
        }}
        onDataReload={loadData}
      />

    </div>
  );
};
