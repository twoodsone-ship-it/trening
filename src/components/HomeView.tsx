import React, { useMemo, useState } from 'react';
import { Clock, Dumbbell, Play, RefreshCw, AlertTriangle } from 'lucide-react';
import type {
  ActiveProgram,
  CompletedWorkout,
  DaysPerWeek,
  GymProfile,
  ProgramGoal,
  ReadinessLevel,
  WorkoutTemplate
} from '../types';
import type { AppSettings } from '../types';
import { getLocalStorageUsage, LOCALSTORAGE_BUDGET_BYTES } from '../services/storageService';
import {
  PROGRAM_GOALS,
  estimateWorkoutMinutes,
  getProgramCycle,
  pickTodaysTemplate
} from '../data/programBuilder';
import { workoutsThisWeek } from '../utils/streak';
import { analyzeProgramHealth } from '../utils/programAdaptation';
import { ReadinessCheckinModal } from './ReadinessCheckinModal';
import { ProgramSetupFlow } from './ProgramSetupFlow';
import { ProgramEditorModal } from './ProgramEditorModal';
import { cn } from '../utils/cn';

interface HomeViewProps {
  templates: WorkoutTemplate[];
  history: CompletedWorkout[];
  settings: AppSettings;
  onUpdateSettings: (settings: AppSettings) => void;
  activeProgram: ActiveProgram | null;
  onApplyProgram: (goal: ProgramGoal, days: DaysPerWeek, gym: GymProfile, coreSessions?: 0 | 1 | 2 | 3 | 4, cardioSessions?: number) => void;
  onStartWorkout: (template: WorkoutTemplate, readiness: ReadinessLevel) => void;
  onSaveProgram: (templates: WorkoutTemplate[], program: ActiveProgram) => void;
  /** Hide bottom nav while program wizard / start modals are open */
  onSetupVisibilityChange?: (open: boolean) => void;
}

export const HomeView: React.FC<HomeViewProps> = ({
  templates,
  history,
  settings,
  onUpdateSettings,
  activeProgram,
  onApplyProgram,
  onStartWorkout,
  onSaveProgram,
  onSetupVisibilityChange
}) => {
  // Only force setup when user taps «Сменить» — otherwise show wizard iff no saved program
  const [forceSetup, setForceSetup] = useState(false);
  const setupOpen = forceSetup || !activeProgram;
  const [checkinTemplate, setCheckinTemplate] = useState<WorkoutTemplate | null>(null);
  const [dismissedAdviceId, setDismissedAdviceId] = useState<string | null>(null);
  const [programEditorOpen, setProgramEditorOpen] = useState(false);
  const overlayOpen = setupOpen || !!checkinTemplate || programEditorOpen;

  React.useEffect(() => {
    onSetupVisibilityChange?.(overlayOpen);
  }, [overlayOpen, onSetupVisibilityChange]);

  const nextTemplate = useMemo(
    () => pickTodaysTemplate(templates, activeProgram, history),
    [templates, activeProgram, history]
  );

  const advice = useMemo(
    () => analyzeProgramHealth(activeProgram, history),
    [activeProgram, history]
  );

  const weekCount = workoutsThisWeek(history);
  const showBackupReminder = history.length > 0 &&
    ((!settings.lastBackupAt || Date.now() - settings.lastBackupAt > 14 * 86400000) ||
      getLocalStorageUsage(localStorage) / LOCALSTORAGE_BUDGET_BYTES > 0.7) &&
    (!settings.reminderDismissedAt || Date.now() - settings.reminderDismissedAt > 7 * 86400000);
  const goalMeta = PROGRAM_GOALS.find(g => g.id === activeProgram?.goal);
  const cycle = activeProgram ? getProgramCycle(activeProgram.startedAt) : null;
  const programHistory = useMemo(() => {
    if (!activeProgram) return [];
    const startedAt = new Date(activeProgram.startedAt).getTime();
    return history
      .filter(h => activeProgram.templateIds.includes(h.templateId) && (!Number.isFinite(startedAt) || h.endTime >= startedAt))
      .sort((a, b) => b.endTime - a.endTime);
  }, [activeProgram, history]);

  const beginFlow = (t: WorkoutTemplate) => {
    // Hide nav immediately so the start dialog stays clear of it.
    onSetupVisibilityChange?.(true);
    setCheckinTemplate(t);
  };

  if (setupOpen) {
    return (
      <ProgramSetupFlow
        existingTemplates={templates}
        onCancel={activeProgram ? () => setForceSetup(false) : undefined}
        onConfirm={(goal, days, gym, coreSessions, cardioSessions) => {
          onApplyProgram(goal, days, gym, coreSessions, cardioSessions);
          setForceSetup(false);
        }}
      />
    );
  }

  const mins = nextTemplate ? estimateWorkoutMinutes(nextTemplate) : 0;
  const showAdvice = advice?.severity === 'warning' && advice.id !== dismissedAdviceId ? advice : null;

  return (
    <div className="max-w-lg mx-auto px-5 pt-[max(1.25rem,env(safe-area-inset-top))] text-white animate-home-enter" style={{ paddingBottom: 'calc(var(--bottom-nav-height, 5rem) + 6rem)' }}>
      {showBackupReminder && <div role="status" className="mb-3 flex items-center gap-2 rounded-xl border border-amber-400/25 bg-amber-400/5 p-3 text-xs text-amber-200"><span className="flex-1">Пора скачать резервную копию тренировок в настройках.</span><button type="button" className="min-h-[44px] min-w-[44px] rounded-lg" aria-label="Скрыть напоминание" onClick={() => onUpdateSettings({ ...settings, reminderDismissedAt: Date.now() })}>×</button></div>}
      <header className="pt-3 pb-4">
        <div>
          <p className="text-lime text-[10px] font-bold tracking-[0.2em] uppercase flex items-center gap-2">
            <span className="inline-block w-5 h-[3px] bg-lime rounded-full" /> IronForge · журнал
          </p>
          <h1 className="font-display text-[2.4rem] leading-none font-bold mt-2 tracking-tight">
            Следующая тренировка
          </h1>
        </div>
      </header>

      {showAdvice && (
        <div
          className={cn(
            'mb-4 p-4 rounded-3xl border',
            showAdvice.severity === 'warning'
              ? 'border-amber-400/40 bg-amber-500/10'
              : 'border-lime/30 bg-lime/10'
          )}
        >
          <div className="flex gap-2 items-start">
            <AlertTriangle className={cn('w-4 h-4 mt-0.5 shrink-0', showAdvice.severity === 'warning' ? 'text-amber-400' : 'text-lime')} />
            <div className="min-w-0 flex-1">
              <p className="font-bold text-sm">{showAdvice.title}</p>
              <p className="text-xs text-muted mt-1 leading-relaxed">{showAdvice.message}</p>
              <div className="flex flex-wrap gap-2 mt-3">
                {showAdvice.suggestedDaysPerWeek && activeProgram && (
                  <button
                    type="button"
                    onClick={() => {
                      onApplyProgram(
                        activeProgram.goal,
                        showAdvice.suggestedDaysPerWeek!,
                        activeProgram.gymProfile || 'full',
                        activeProgram.coreSessionsPerWeek ?? 2,
                        Math.min(activeProgram.cardioSessionsPerWeek ?? 0, showAdvice.suggestedDaysPerWeek!)
                      );
                      setDismissedAdviceId(showAdvice.id);
                    }}
                    className="px-3 py-1.5 rounded-xl bg-lime text-ink text-xs font-bold"
                  >
                    {showAdvice.actionLabel}
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => setDismissedAdviceId(showAdvice.id)}
                  className="px-3 py-1.5 rounded-xl border border-white/15 text-xs font-semibold text-muted"
                >
                  {showAdvice.suggestedDaysPerWeek ? 'Позже' : showAdvice.actionLabel}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <section className="relative overflow-hidden rounded-2xl border border-lime/25 bg-[#151b13] p-5 pl-6 mb-5 shadow-[inset_3px_0_0_var(--lime)]">
        <p className="text-[11px] font-semibold text-muted">{activeProgram?.title} · {weekCount}/{activeProgram?.daysPerWeek} на неделе</p>
        <h2 className="font-display text-3xl font-bold mt-2 tracking-tight leading-none">
          {nextTemplate?.name || 'План пока пуст'}
        </h2>
        <p className="text-[13px] text-muted mt-2 leading-snug">
          {nextTemplate ? nextTemplate.description : 'Добавьте тренировку в настройках программы.'}
        </p>
        {nextTemplate && (
          <div className="flex flex-wrap gap-4 mt-4 text-xs text-muted">
            <span className="inline-flex items-center gap-1.5 font-mono">
              <Dumbbell className="w-3.5 h-3.5 text-lime" /> {nextTemplate.exercises.length} упр.
            </span>
            <span className="inline-flex items-center gap-1.5 font-mono">
              <Clock className="w-3.5 h-3.5 text-lime" /> ~{mins} мин
            </span>
          </div>
        )}
      </section>

      {programHistory[0] && (
        <p className="text-xs text-muted mb-4">Прошлая: {programHistory[0].templateName} · {new Date(programHistory[0].endTime).toLocaleDateString('ru-RU', { day: 'numeric', month: 'short' })}</p>
      )}

      <details className="group border-t border-white/10 pt-3">
        <summary className="min-h-[48px] flex items-center justify-between cursor-pointer font-semibold text-sm text-white list-none">
          <span>План и журнал</span>
          <span className="text-muted text-xs group-open:hidden">Показать</span>
          <span className="text-muted text-xs hidden group-open:inline">Скрыть</span>
        </summary>
        <div className="pt-3">
          <div className="flex items-center justify-between gap-3 pb-4 border-b border-white/10">
            <div className="min-w-0">
              <p className="font-bold truncate">{activeProgram?.title}</p>
              <p className="text-xs text-muted">{goalMeta?.subtitle} · {activeProgram?.daysPerWeek}× в неделю</p>
            </div>
            <div className="flex gap-2 shrink-0">
              <button type="button" onClick={() => setProgramEditorOpen(true)} className="min-h-[44px] px-3 rounded-lg border border-white/15 text-xs font-bold">Изменить</button>
              <button type="button" onClick={() => setForceSetup(true)} className="min-h-[44px] px-3 rounded-lg border border-white/15 text-xs text-muted flex items-center gap-1"><RefreshCw className="w-3.5 h-3.5" /> Сменить</button>
            </div>
          </div>
          {cycle && <p className="text-xs text-muted py-3 border-b border-white/10">Неделя {cycle.week}/4 · {cycle.title}. {cycle.description}</p>}
      <section className="mb-2 mt-4">
        <p className="text-[11px] font-bold uppercase tracking-wider text-muted mb-3">Когда тренировался</p>
        {programHistory.length === 0 ? (
          <p className="text-xs text-muted border-y border-white/10 py-3">Пока нет завершённых тренировок этой программы. Начните с первого дня.</p>
        ) : (
          <div className="divide-y divide-white/10 border-y border-white/10">
            {programHistory.slice(0, 5).map(workout => (
              <div key={workout.id} className="flex items-center justify-between gap-3 py-2.5">
                <span className="font-semibold text-sm min-w-0 truncate">{workout.templateName}</span>
                <time dateTime={new Date(workout.endTime).toISOString()} className="font-mono text-[11px] text-muted shrink-0">
                  {new Date(workout.endTime).toLocaleDateString('ru-RU', { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' })}
                </time>
              </div>
            ))}
          </div>
        )}
      </section>

      {activeProgram && (
        <section className="mt-6">
          <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-muted mb-2">Тренировки плана</p>
          <div className="divide-y divide-white/10 border-y border-white/10">
          {activeProgram.templateIds.map((id, i) => {
            const t = templates.find(x => x.id === id);
            if (!t) return null;
            return (
              <div
                key={id}
                className={cn(
                  'w-full text-left py-3.5 flex items-center justify-between gap-3 interactive-row',
                  nextTemplate?.id === t.id && 'text-lime'
                )}
              >
                <div className="min-w-0">
                  <p className="text-[10px] font-mono text-muted">ТРЕНИРОВКА {i + 1}</p>
                  <p className="font-bold truncate mt-0.5">{t.name}</p>
                  <p className="text-xs text-muted truncate mt-0.5">{t.description}</p>
                  {programHistory.find(h => h.templateId === t.id) && (
                    <p className="text-[11px] text-muted mt-1">Последний раз: {new Date(programHistory.find(h => h.templateId === t.id)!.endTime).toLocaleDateString('ru-RU', { day: 'numeric', month: 'long', year: 'numeric' })}</p>
                  )}
                </div>
                {nextTemplate?.id === t.id && <span className="text-[10px] font-bold uppercase tracking-wider text-lime shrink-0">Следующая</span>}
              </div>
            );
          })}
          </div>
        </section>
      )}
        </div>
      </details>

      <ReadinessCheckinModal
        template={checkinTemplate}
        isOpen={!!checkinTemplate}
        onClose={() => setCheckinTemplate(null)}
        onConfirm={(readiness) => {
          if (checkinTemplate) {
            onStartWorkout(checkinTemplate, readiness);
            setCheckinTemplate(null);
          }
        }}
      />

      {activeProgram && (
        <ProgramEditorModal
          isOpen={programEditorOpen}
          templates={templates}
          program={activeProgram}
          onClose={() => setProgramEditorOpen(false)}
          onSave={(nextTemplates, nextProgram) => {
            onSaveProgram(nextTemplates, nextProgram);
            setProgramEditorOpen(false);
          }}
        />
      )}

      {/* Dock: CTA sits in a column above reserved nav height so nothing is clipped */}
      {!overlayOpen && (
        <div
          className="fixed inset-x-0 z-[39] px-5 pointer-events-none"
          style={{ bottom: 'calc(var(--bottom-nav-height, 5rem) + 0.5rem)' }}
        >
          <div className="max-w-lg mx-auto pointer-events-auto">
            <button
              type="button"
              disabled={!nextTemplate}
              onClick={() => nextTemplate && beginFlow(nextTemplate)}
              className="w-full btn-lime py-4 rounded-2xl text-base flex items-center justify-center gap-2 min-h-[56px] disabled:opacity-40 shadow-xl shadow-black/50"
            >
              <Play className="w-5 h-5 fill-current" /> Начать тренировку
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
