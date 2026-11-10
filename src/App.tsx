import React, { Suspense, lazy, useCallback, useRef } from 'react';
import { HomeView } from './components/HomeView';
import { ActiveWorkoutView } from './components/ActiveWorkoutView';
import { Navigation } from './components/Navigation';
import { PWAInstallBanner } from './components/PWAInstallBanner';
import { useWorkoutSession } from './hooks/useWorkoutSession';
import { useRegisterSW } from 'virtual:pwa-register/react';
import { storageService } from './services/storageService';

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
  if (import.meta.env.DEV && typeof window !== 'undefined' && window.location.search.includes('trigger_error=1')) {
    throw new Error('QA trigger error');
  }
  const { needRefresh: [needRefresh, setNeedRefresh], updateServiceWorker } = useRegisterSW();
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
    restTimerNextUp,
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
      {needRefresh && !activeWorkout && (
        <div className="px-4 pt-3 max-w-lg mx-auto w-full">
          <div className="rounded-xl border border-lime/30 bg-ink-2 p-3 flex items-center justify-between gap-3 text-sm">
            <span>Доступно обновление приложения</span>
            <button type="button" onClick={() => updateServiceWorker(true)} className="shrink-0 min-h-[44px] px-3 rounded-lg btn-lime text-xs font-bold">Обновить</button>
            <button type="button" onClick={() => setNeedRefresh(false)} className="min-h-[44px] px-2 text-muted text-xs">Позже</button>
          </div>
        </div>
      )}
      <PWAInstallBanner />

      <div className="flex-1">
        {isViewActiveWorkout && activeWorkout ? (
          <>
          {finishError && <div role="alert" className="fixed z-[70] inset-x-3 top-3 mx-auto max-w-lg rounded-2xl border border-rose-400/40 bg-ink p-4 shadow-xl">
            <button type="button" onClick={dismissFinishError} aria-label="Закрыть ошибку" className="absolute right-2 top-2 min-h-[44px] min-w-[44px] rounded-lg text-xl text-rose-200">×</button>
            <p className="pr-11 text-sm font-semibold text-rose-300">Не удалось сохранить тренировку. Она останется открытой и сохранённой на этом устройстве.</p>
            <button type="button" onClick={() => { const blob = new Blob([storageService.exportBackupJson()], { type: 'application/json' }); const url = URL.createObjectURL(blob); const link = document.createElement('a'); link.href = url; link.download = `ironforge_backup_${new Date().toISOString().slice(0, 10)}.json`; link.click(); URL.revokeObjectURL(url); }} className="mt-3 min-h-[48px] rounded-xl bg-white/10 px-4 text-sm font-bold">Скачать резервную копию JSON</button>
          </div>}
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
          </>
        ) : (
          <>
            {activeTab === 'home' && (
              <HomeView
                templates={templates}
                history={history}
                settings={settings}
                onUpdateSettings={updateSettings}
                activeProgram={activeProgram}
                onApplyProgram={applyProgram}
                onSaveProgram={saveProgramEdits}
                onStartWorkout={startWorkout}
                onSetupVisibilityChange={setProgramSetupOpen}
              />
            )}

            {activeTab === 'analytics' && (
              <Suspense fallback={<div className="p-8 text-center text-muted text-sm">Загрузка…</div>}>
                <AnalyticsView history={history} templates={templates} onDataReload={loadData} />
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
          nextUp={restTimerNextUp}
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
