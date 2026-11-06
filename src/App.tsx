import React, { Suspense, lazy, useCallback, useRef } from 'react';
import { HomeView } from './components/HomeView';
import { ActiveWorkoutView } from './components/ActiveWorkoutView';
import { Navigation } from './components/Navigation';
import { PWAInstallBanner } from './components/PWAInstallBanner';
import { useWorkoutSession } from './hooks/useWorkoutSession';

const AnalyticsView = lazy(() =>
  import('./components/AnalyticsView').then(m => ({ default: m.AnalyticsView }))
);
const SettingsModal = lazy(() =>
  import('./components/SettingsModal').then(m => ({ default: m.SettingsModal }))
);
const RestTimer = lazy(() =>
  import('./components/RestTimer').then(m => ({ default: m.RestTimer }))
);
const WorkoutSummaryView = lazy(() =>
  import('./components/WorkoutSummaryView').then(m => ({ default: m.WorkoutSummaryView }))
);

export const App: React.FC = () => {
  const [programSetupOpen, setProgramSetupOpen] = React.useState(false);
  const [restResumeNonce, setRestResumeNonce] = React.useState(0);
  const focusResumeRef = useRef<(() => void) | null>(null);

  const registerFocusResume = useCallback((fn: (() => void) | null) => {
    focusResumeRef.current = fn;
  }, []);

  const {
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
    cancelWorkout,
    updateActiveExercises,
    triggerRestTimer,
    updateSettings
  } = useWorkoutSession();

  const handleRestFinished = useCallback(() => {
    setIsRestTimerOpen(false);
    setRestResumeNonce(n => n + 1);
    // Imperative open after timer closes — survives lock-screen thaw
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        focusResumeRef.current?.();
      });
    });
  }, [setIsRestTimerOpen]);

  if (pendingSummary) {
    return (
      <Suspense fallback={<div className="min-h-screen bg-app-atmosphere" />}>
        <WorkoutSummaryView
          workout={pendingSummary}
          previousVolumeKg={previousVolumeForTemplate(pendingSummary.templateId, pendingSummary.id)}
          onDone={dismissSummary}
        />
      </Suspense>
    );
  }

  return (
    <div className="min-h-screen min-h-[100dvh] bg-app-atmosphere text-white flex flex-col font-sans selection:bg-lime selection:text-ink">
      <PWAInstallBanner />

      <div className="flex-1">
        {isViewActiveWorkout && activeWorkout ? (
          <ActiveWorkoutView
            workoutName={activeWorkout.templateName}
            templateId={activeWorkout.templateId}
            readiness={activeWorkout.readiness}
            cycleWeek={activeWorkout.cycleWeek}
            cyclePhase={activeWorkout.cyclePhase}
            startTime={activeWorkout.startTime}
            exercises={activeWorkout.exercises}
            settings={settings}
            restResumeNonce={restResumeNonce}
            onRegisterFocusResume={registerFocusResume}
            onUpdateExercises={updateActiveExercises}
            onFinishWorkout={finishWorkout}
            onCancelWorkout={cancelWorkout}
            onTriggerRestTimer={triggerRestTimer}
          />
        ) : (
          <>
            {activeTab === 'home' && (
              <HomeView
                templates={templates}
                history={history}
                activeProgram={activeProgram}
                onApplyProgram={applyProgram}
                onSaveProgram={saveProgramEdits}
                onStartWorkout={startWorkout}
                onSetupVisibilityChange={setProgramSetupOpen}
              />
            )}

            {activeTab === 'analytics' && (
              <Suspense fallback={<div className="p-8 text-center text-muted text-sm">Загрузка…</div>}>
                <AnalyticsView history={history} templates={templates} />
              </Suspense>
            )}

            {!programSetupOpen && (
              <Navigation
                activeTab={activeTab}
                onSelectTab={setActiveTab}
                onOpenSettings={() => setIsSettingsOpen(true)}
                hasActiveWorkout={!!activeWorkout}
                onReturnToActiveWorkout={() => setIsViewActiveWorkout(true)}
              />
            )}
          </>
        )}
      </div>

      <Suspense fallback={null}>
        <RestTimer
          initialSeconds={restTimerSeconds}
          isOpen={isRestTimerOpen}
          onClose={() => setIsRestTimerOpen(false)}
          onFinished={handleRestFinished}
          soundEnabled={settings.soundEnabled}
          vibrationEnabled={settings.vibrationEnabled}
          voiceEnabled={settings.voiceEnabled}
          clearBottomNav={!isViewActiveWorkout && !programSetupOpen}
        />

        <SettingsModal
          isOpen={isSettingsOpen}
          onClose={() => setIsSettingsOpen(false)}
          settings={settings}
          history={history}
          onUpdateSettings={updateSettings}
          onDataReload={loadData}
        />
      </Suspense>
    </div>
  );
};
