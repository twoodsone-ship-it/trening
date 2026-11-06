import React, { useMemo, useState } from 'react';
import { Clock, Dumbbell, Flame, Play, RefreshCw, Sparkles, AlertTriangle } from 'lucide-react';
import type {
  ActiveProgram,
  CompletedWorkout,
  DaysPerWeek,
  GymProfile,
  ProgramGoal,
  ReadinessLevel,
  WorkoutTemplate
} from '../types';
import {
  PROGRAM_GOALS,
  estimateWorkoutMinutes,
  getProgramCycle,
  pickTodaysTemplate
} from '../data/programBuilder';
import { calculateStreak, workoutsThisWeek, WEEKDAY_LABELS_RU } from '../utils/streak';
import { analyzeProgramHealth } from '../utils/programAdaptation';
import { ReadinessCheckinModal } from './ReadinessCheckinModal';
import { WorkoutBriefingModal } from './WorkoutBriefingModal';
import { ProgramSetupFlow } from './ProgramSetupFlow';
import { ProgramEditorModal } from './ProgramEditorModal';
import { cn } from '../utils/cn';

interface HomeViewProps {
  templates: WorkoutTemplate[];
  history: CompletedWorkout[];
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
  activeProgram,
  onApplyProgram,
  onStartWorkout,
  onSaveProgram,
  onSetupVisibilityChange
}) => {
  // Only force setup when user taps «Сменить» — otherwise show wizard iff no saved program
  const [forceSetup, setForceSetup] = useState(false);
  const setupOpen = forceSetup || !activeProgram;
  const [briefingTemplate, setBriefingTemplate] = useState<WorkoutTemplate | null>(null);
  const [checkinTemplate, setCheckinTemplate] = useState<WorkoutTemplate | null>(null);
  const [dismissedAdviceId, setDismissedAdviceId] = useState<string | null>(null);
  const [programEditorOpen, setProgramEditorOpen] = useState(false);
  const overlayOpen = setupOpen || !!briefingTemplate || !!checkinTemplate || programEditorOpen;

  React.useEffect(() => {
    onSetupVisibilityChange?.(overlayOpen);
  }, [overlayOpen, onSetupVisibilityChange]);

  const todayTemplate = useMemo(
    () => pickTodaysTemplate(templates, activeProgram, history),
    [templates, activeProgram, history]
  );

  const advice = useMemo(
    () => analyzeProgramHealth(activeProgram, history),
    [activeProgram, history]
  );

  const streak = calculateStreak(history);
  const weekCount = workoutsThisWeek(history);
  const goalMeta = PROGRAM_GOALS.find(g => g.id === activeProgram?.goal);
  const cycle = activeProgram ? getProgramCycle(activeProgram.startedAt) : null;
  const today = new Date().getDay();

  const weekDays = useMemo(() => {
    const ordered = activeProgram?.templateIds
      .map(id => templates.find(t => t.id === id))
      .filter(Boolean) as WorkoutTemplate[] | undefined;
    return [1, 2, 3, 4, 5, 6, 0].map(dow => {
      const match = ordered?.find(t => t.scheduledDays?.includes(dow));
      const trained = history.some(h => {
        const d = new Date(h.endTime);
        const start = new Date();
        start.setHours(0, 0, 0, 0);
        start.setDate(start.getDate() - ((start.getDay() + 6) % 7));
        return h.endTime >= start.getTime() && d.getDay() === dow;
      });
      return { dow, match, trained, isToday: dow === today };
    });
  }, [activeProgram, templates, history, today]);

  const beginFlow = (t: WorkoutTemplate) => {
    // Hide nav immediately (don't wait for useEffect) so briefing CTA isn't covered
    onSetupVisibilityChange?.(true);
    setBriefingTemplate(t);
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

  const mins = todayTemplate ? estimateWorkoutMinutes(todayTemplate) : 0;
  const showAdvice = advice && advice.id !== dismissedAdviceId && advice.severity !== 'info'
    ? advice
    : advice?.severity === 'info' && advice.id !== dismissedAdviceId
    ? advice
    : null;

  return (
    <div className="max-w-lg mx-auto px-5 pt-[max(1.25rem,env(safe-area-inset-top))] text-white animate-home-enter" style={{ paddingBottom: 'calc(var(--bottom-nav-height, 5rem) + 6rem)' }}>
      <header className="pt-3 pb-5 flex items-end justify-between gap-3">
        <div>
          <p className="text-lime text-[10px] font-bold tracking-[0.2em] uppercase flex items-center gap-2">
            <span className="inline-block w-5 h-[3px] bg-lime rounded-full" /> IronForge · журнал
          </p>
          <h1 className="font-display text-[2.75rem] leading-[0.9] font-bold mt-2 tracking-tight">
            Тренировка<br />сегодня
          </h1>
        </div>
        <span className="font-mono text-[11px] text-muted text-right pb-1">
          {new Date().toLocaleDateString('ru-RU', { weekday: 'short', day: 'numeric', month: 'short' })}
        </span>
      </header>

      <div className="flex items-center gap-4 mb-5 border-y border-white/10 py-2.5">
        <div className="inline-flex items-center gap-1.5 text-orange-300">
          <Flame className="w-3.5 h-3.5" />
          <span className="text-xs font-bold font-mono">{streak}</span>
          <span className="text-[10px] font-semibold text-muted">дн. серия</span>
        </div>
        <span className="text-xs text-muted">{weekCount} из {activeProgram?.daysPerWeek ?? 0} тренировок на неделе</span>
      </div>

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

      {activeProgram && (
        <div className="py-3 mb-2 flex items-center justify-between gap-3 border-b border-white/10">
          <div className="min-w-0">
            <p className="text-[10px] uppercase tracking-[0.16em] text-lime font-bold">Текущий план</p>
            <p className="font-bold truncate mt-1">{activeProgram.title}</p>
            <p className="text-xs text-muted truncate">{goalMeta?.subtitle} · {activeProgram.daysPerWeek}× в неделю</p>
          </div>
          <div className="flex shrink-0 flex-col gap-1.5">
            <button
              type="button"
              onClick={() => setProgramEditorOpen(true)}
              className="px-3 py-2 rounded-lg border border-lime/30 bg-lime/[0.07] text-xs font-bold text-lime min-h-[44px]"
            >Настроить</button>
            <button
              type="button"
              onClick={() => setForceSetup(true)}
              className="px-3 py-2 rounded-lg border border-white/10 text-xs font-semibold text-muted hover:text-white flex items-center justify-center gap-1.5 min-h-[44px]"
            >
              <RefreshCw className="w-3.5 h-3.5" /> Сменить
            </button>
          </div>
        </div>
      )}

      {cycle && (
        <section className="py-3 mb-3 border-b border-white/10">
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="text-[10px] uppercase tracking-[0.16em] text-muted font-bold">Блок {cycle.block} · месяц</p>
              <p className="font-bold mt-0.5">Неделя {cycle.week}/4 <span className="text-muted font-normal">· {cycle.title}</span></p>
            </div>
            <span className={cn('shrink-0 px-2.5 py-1 rounded-full text-[10px] font-bold border', cycle.phase === 'deload' ? 'text-amber-300 border-amber-400/30 bg-amber-500/10' : 'text-lime border-lime/30 bg-lime/10')}>
              {cycle.week}/4
            </span>
          </div>
          <p className="text-xs text-muted mt-2">{cycle.description}</p>
          <div className="grid grid-cols-4 gap-1.5 mt-3">
            {['База', 'Прогресс', 'Нагрузка', 'Разгрузка'].map((label, index) => (
              <div key={label} className={cn('h-1.5 rounded-full', index + 1 <= cycle.week ? index === 3 ? 'bg-amber-400' : 'bg-lime' : 'bg-white/10')} title={`Неделя ${index + 1}: ${label}`} />
            ))}
          </div>
        </section>
      )}

      <section className="relative overflow-hidden rounded-2xl border border-lime/25 bg-[#151b13] p-5 pl-6 mb-5 shadow-[inset_3px_0_0_var(--lime)]">
        <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-lime flex items-center gap-1.5">
          <Sparkles className="w-3.5 h-3.5" /> НА СЕГОДНЯ
        </p>
        <h2 className="font-display text-3xl font-bold mt-2 tracking-tight leading-none">
          {todayTemplate?.name || 'День отдыха'}
        </h2>
        <p className="text-[13px] text-muted mt-2 leading-snug">
          {todayTemplate ? todayTemplate.description : 'Можно восстановиться.'}
        </p>
        {todayTemplate && (
          <div className="flex flex-wrap gap-4 mt-4 text-xs text-muted">
            <span className="inline-flex items-center gap-1.5 font-mono">
              <Dumbbell className="w-3.5 h-3.5 text-lime" /> {todayTemplate.exercises.length} упр.
            </span>
            <span className="inline-flex items-center gap-1.5 font-mono">
              <Clock className="w-3.5 h-3.5 text-lime" /> ~{mins} мин
            </span>
          </div>
        )}
      </section>

      <section className="mb-2">
        <p className="text-[11px] font-bold uppercase tracking-wider text-muted mb-3">Неделя</p>
        <div className="grid grid-cols-7 gap-1">
          {weekDays.map(({ dow, match, trained, isToday }) => (
            <div
              key={dow}
              className={cn(
                'rounded-lg py-2 text-center border min-w-0',
                isToday && 'border-lime/60 bg-lime/[0.08]',
                !isToday && trained && 'border-white/10 bg-white/[0.06]',
                !isToday && !trained && 'border-white/5'
              )}
            >
              <p className="text-[10px] font-bold text-muted">{WEEKDAY_LABELS_RU[dow]}</p>
              <p className={cn('text-[9px] mt-1 font-semibold truncate px-0.5', match ? 'text-white' : 'text-white/25')} title={match?.name}>
                {match ? match.name.split(' ')[0] : '—'}
              </p>
              {trained && <span className="inline-block mt-1 w-1.5 h-1.5 rounded-full bg-lime" />}
            </div>
          ))}
        </div>
      </section>

      {activeProgram && (
        <section className="mt-6">
          <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-muted mb-2">Тренировки плана</p>
          <div className="divide-y divide-white/10 border-y border-white/10">
          {activeProgram.templateIds.map((id, i) => {
            const t = templates.find(x => x.id === id);
            if (!t) return null;
            return (
              <button
                key={id}
                type="button"
                onClick={() => beginFlow(t)}
                className={cn(
                  'w-full text-left py-3.5 flex items-center justify-between gap-3 interactive-row',
                  todayTemplate?.id === t.id && 'text-lime'
                )}
              >
                <div className="min-w-0">
                  <p className="text-[10px] font-mono text-muted">ТРЕНИРОВКА {i + 1}</p>
                  <p className="font-bold truncate mt-0.5">{t.name}</p>
                  <p className="text-xs text-muted truncate mt-0.5">{t.description}</p>
                </div>
                <Play className="w-4 h-4 text-lime shrink-0" />
              </button>
            );
          })}
          </div>
        </section>
      )}

      {briefingTemplate && (
        <WorkoutBriefingModal
          template={briefingTemplate}
          goal={activeProgram?.goal}
          isOpen={true}
          onClose={() => setBriefingTemplate(null)}
          onContinue={() => {
            setCheckinTemplate(briefingTemplate);
            setBriefingTemplate(null);
          }}
        />
      )}

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
              disabled={!todayTemplate}
              onClick={() => todayTemplate && beginFlow(todayTemplate)}
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
