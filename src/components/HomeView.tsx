import React, { useMemo, useState } from 'react';
import { Clock, Dumbbell, Flame, Play, RefreshCw, Sparkles } from 'lucide-react';
import type {
  ActiveProgram,
  CompletedWorkout,
  DaysPerWeek,
  ProgramGoal,
  ReadinessLevel,
  WorkoutTemplate
} from '../types';
import {
  PROGRAM_GOALS,
  estimateWorkoutMinutes,
  pickTodaysTemplate
} from '../data/programBuilder';
import { calculateStreak, workoutsThisWeek, WEEKDAY_LABELS_RU } from '../utils/streak';
import { ReadinessCheckinModal } from './ReadinessCheckinModal';
import { ProgramSetupFlow } from './ProgramSetupFlow';
import { cn } from '../utils/cn';

interface HomeViewProps {
  templates: WorkoutTemplate[];
  history: CompletedWorkout[];
  activeProgram: ActiveProgram | null;
  onApplyProgram: (goal: ProgramGoal, days: DaysPerWeek) => void;
  onStartWorkout: (template: WorkoutTemplate, readiness: ReadinessLevel) => void;
}

export const HomeView: React.FC<HomeViewProps> = ({
  templates,
  history,
  activeProgram,
  onApplyProgram,
  onStartWorkout
}) => {
  const [setupOpen, setSetupOpen] = useState(!activeProgram);
  const [checkinTemplate, setCheckinTemplate] = useState<WorkoutTemplate | null>(null);

  const todayTemplate = useMemo(
    () => pickTodaysTemplate(templates, activeProgram, history),
    [templates, activeProgram, history]
  );

  const streak = calculateStreak(history);
  const weekCount = workoutsThisWeek(history);
  const goalMeta = PROGRAM_GOALS.find(g => g.id === activeProgram?.goal);
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

  if (setupOpen) {
    return (
      <ProgramSetupFlow
        existingTemplates={templates}
        onCancel={activeProgram ? () => setSetupOpen(false) : undefined}
        onConfirm={(goal, days) => {
          onApplyProgram(goal, days);
          setSetupOpen(false);
        }}
      />
    );
  }

  const mins = todayTemplate ? estimateWorkoutMinutes(todayTemplate) : 0;

  return (
    <div className="max-w-lg mx-auto px-5 pt-[max(1.25rem,env(safe-area-inset-top))] pb-[calc(7rem+env(safe-area-inset-bottom))] text-white animate-fade-in">
      {/* Brand-first hero */}
      <header className="pt-4 pb-8">
        <p className="text-lime text-[11px] font-bold tracking-[0.28em] uppercase">IronForge</p>
        <h1 className="text-[2.6rem] leading-[0.95] font-extrabold tracking-tight mt-3">
          Тренируйся<br />умнее.
        </h1>
        <p className="text-muted text-sm mt-3 max-w-[20rem] leading-relaxed">
          Программа собрана под твою цель. Упражнения — только внутри тренировки.
        </p>
      </header>

      {/* Streak strip */}
      <div className="flex items-center gap-3 mb-5">
        <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-orange-500/15 border border-orange-400/30 text-orange-300">
          <Flame className="w-3.5 h-3.5" />
          <span className="text-xs font-bold font-mono">{streak}</span>
          <span className="text-[10px] font-semibold">дн. streak</span>
        </div>
        <span className="text-xs text-muted">{weekCount} тр. на этой неделе</span>
      </div>

      {/* Active program chip */}
      {activeProgram && (
        <div className="surface-panel p-4 mb-4 flex items-center justify-between gap-3">
          <div className="min-w-0">
            <p className="text-[10px] uppercase tracking-wider text-muted font-bold">Активная программа</p>
            <p className="font-bold truncate mt-0.5">{activeProgram.title}</p>
            <p className="text-xs text-muted truncate">{goalMeta?.subtitle}</p>
          </div>
          <button
            type="button"
            onClick={() => setSetupOpen(true)}
            className="shrink-0 px-3 py-2 rounded-xl border border-white/10 text-xs font-semibold text-muted hover:text-white hover:border-white/25 flex items-center gap-1.5 transition"
          >
            <RefreshCw className="w-3.5 h-3.5" /> Сменить
          </button>
        </div>
      )}

      {/* Today CTA — no exercise list */}
      <section className="relative overflow-hidden rounded-[1.75rem] border border-lime/25 bg-gradient-to-br from-lime/15 via-ink-2 to-ink-3 p-5 mb-5">
        <div className="absolute -right-8 -top-8 w-40 h-40 rounded-full bg-lime/10 blur-2xl pointer-events-none" />
        <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-lime flex items-center gap-1.5">
          <Sparkles className="w-3.5 h-3.5" /> Сегодня
        </p>
        <h2 className="text-2xl font-extrabold mt-2 tracking-tight">
          {todayTemplate?.name || 'День отдыха'}
        </h2>
        <p className="text-sm text-muted mt-1">
          {todayTemplate
            ? todayTemplate.description
            : 'По расписанию сегодня можно восстановиться.'}
        </p>

        {todayTemplate && (
          <div className="flex flex-wrap gap-3 mt-4 text-xs text-muted">
            <span className="inline-flex items-center gap-1.5 font-mono">
              <Dumbbell className="w-3.5 h-3.5 text-lime" />
              {todayTemplate.exercises.length} упр.
            </span>
            <span className="inline-flex items-center gap-1.5 font-mono">
              <Clock className="w-3.5 h-3.5 text-lime" />
              ~{mins} мин
            </span>
          </div>
        )}

        <button
          type="button"
          disabled={!todayTemplate}
          onClick={() => todayTemplate && setCheckinTemplate(todayTemplate)}
          className="mt-5 w-full btn-lime py-4 rounded-2xl text-base flex items-center justify-center gap-2 min-h-[56px] disabled:opacity-40"
        >
          <Play className="w-5 h-5 fill-current" />
          Начать тренировку
        </button>
      </section>

      {/* Week overview — names only */}
      <section className="mb-2">
        <p className="text-[11px] font-bold uppercase tracking-wider text-muted mb-3">Неделя</p>
        <div className="grid grid-cols-7 gap-1.5">
          {weekDays.map(({ dow, match, trained, isToday }) => (
            <div
              key={dow}
              className={cn(
                'rounded-2xl py-2.5 px-0.5 text-center border transition',
                isToday && 'border-lime/60 bg-lime/10',
                !isToday && trained && 'border-white/10 bg-white/[0.06]',
                !isToday && !trained && 'border-white/5 bg-transparent'
              )}
            >
              <p className="text-[10px] font-bold text-muted">{WEEKDAY_LABELS_RU[dow]}</p>
              <p className={cn('text-[9px] mt-1 font-semibold leading-tight px-0.5 truncate', match ? 'text-white' : 'text-white/25')}>
                {match ? match.name.replace(/^\S+\s*/, '').slice(0, 6) || match.name.slice(0, 6) : '—'}
              </p>
              {trained && <span className="inline-block mt-1 w-1.5 h-1.5 rounded-full bg-lime" />}
            </div>
          ))}
        </div>
      </section>

      {/* Upcoming sessions list without exercises */}
      {activeProgram && (
        <section className="mt-6 space-y-2">
          <p className="text-[11px] font-bold uppercase tracking-wider text-muted mb-1">Цикл тренировок</p>
          {activeProgram.templateIds.map((id, i) => {
            const t = templates.find(x => x.id === id);
            if (!t) return null;
            const isTodayCard = todayTemplate?.id === t.id;
            return (
              <button
                key={id}
                type="button"
                onClick={() => setCheckinTemplate(t)}
                className={cn(
                  'w-full text-left surface-panel p-4 flex items-center justify-between gap-3 transition active:scale-[0.99]',
                  isTodayCard && 'border-lime/40'
                )}
              >
                <div className="min-w-0">
                  <p className="text-[10px] font-mono text-muted">День {i + 1}</p>
                  <p className="font-bold truncate">{t.name}</p>
                  <p className="text-xs text-muted truncate">{t.description} · {t.exercises.length} упр.</p>
                </div>
                <Play className="w-4 h-4 text-lime shrink-0" />
              </button>
            );
          })}
        </section>
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
    </div>
  );
};
