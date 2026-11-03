import React, { Suspense, lazy } from 'react';
import { WorkoutTemplateList } from './components/WorkoutTemplateList';
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
  const {
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
  } = useWorkoutSession();

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
    <div className="min-h-screen min-h-[100dvh] bg-app-atmosphere text-slate-900 dark:text-zinc-100 flex flex-col font-sans selection:bg-emerald-500 selection:text-white transition-colors duration-200">
      <PWAInstallBanner />

      <div className="flex-1">
        {isViewActiveWorkout && activeWorkout ? (
          <ActiveWorkoutView
            workoutName={activeWorkout.templateName}
            templateId={activeWorkout.templateId}
            readiness={activeWorkout.readiness}
            startTime={activeWorkout.startTime}
            exercises={activeWorkout.exercises}
            settings={settings}
            onUpdateExercises={updateActiveExercises}
            onFinishWorkout={finishWorkout}
            onCancelWorkout={cancelWorkout}
            onTriggerRestTimer={triggerRestTimer}
          />
        ) : (
          <>
            {activeTab === 'templates' && (
              <WorkoutTemplateList
                templates={templates}
                history={history}
                currentWeek={settings.currentWeek || 'A'}
                onChangeWeek={changeWeek}
                onStartWorkout={startWorkout}
                onUpdateTemplate={updateTemplate}
                onCreateTemplate={createTemplate}
              />
            )}

            {activeTab === 'analytics' && (
              <Suspense fallback={<div className="p-8 text-center text-muted text-sm">Загрузка аналитики…</div>}>
                <AnalyticsView history={history} templates={templates} />
              </Suspense>
            )}

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

      <Suspense fallback={null}>
        <RestTimer
          initialSeconds={restTimerSeconds}
          isOpen={isRestTimerOpen}
          onClose={() => setIsRestTimerOpen(false)}
          soundEnabled={settings.soundEnabled}
          vibrationEnabled={settings.vibrationEnabled}
          voiceEnabled={settings.voiceEnabled}
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
