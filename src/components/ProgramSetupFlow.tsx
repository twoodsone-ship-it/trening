import React, { useMemo, useState } from 'react';
import { Check, X } from 'lucide-react';
import type { DaysPerWeek, GymProfile, ProgramGoal, WorkoutTemplate } from '../types';
import { PROGRAM_GOALS, buildProgramTemplates } from '../data/programBuilder';
import { GYM_PROFILES } from '../utils/equipmentMap';
import { cn } from '../utils/cn';

interface ProgramSetupFlowProps {
  existingTemplates: WorkoutTemplate[];
  onCancel?: () => void;
  onConfirm: (goal: ProgramGoal, days: DaysPerWeek, gym: GymProfile, coreSessions: 0 | 1 | 2 | 3 | 4, cardioSessions: number) => void;
}

const DAYS: DaysPerWeek[] = [2, 3, 4, 5, 6];

export const ProgramSetupFlow: React.FC<ProgramSetupFlowProps> = ({ existingTemplates, onCancel, onConfirm }) => {
  const [goal, setGoal] = useState<ProgramGoal | null>(null);
  const [days, setDays] = useState<DaysPerWeek>(3);
  const [gym, setGym] = useState<GymProfile>('full');
  const [coreSessions, setCoreSessions] = useState<0 | 1 | 2 | 3 | 4>(2);
  const [cardioSessions, setCardioSessions] = useState(2);
  const preview = useMemo(() => goal ? buildProgramTemplates(goal, days, existingTemplates, gym, Math.min(coreSessions, days) as 0 | 1 | 2 | 3 | 4, Math.min(cardioSessions, days)) : null,
    [goal, days, existingTemplates, gym, coreSessions, cardioSessions]);

  const selectGoal = (value: ProgramGoal) => {
    setGoal(value);
    setCardioSessions(value === 'cut' ? Math.min(3, days) : value === 'recomp' ? Math.min(2, days) : 0);
  };

  return (
    <div className="fixed inset-0 z-[60] bg-app-atmosphere text-white flex flex-col">
      <div className="flex-1 overflow-y-auto px-5 pt-[max(1rem,env(safe-area-inset-top))] pb-5">
        <div className="max-w-lg mx-auto">
          <header className="flex items-start justify-between gap-3 mb-5">
            <div>
              <p className="text-xs font-bold text-lime">IronForge · программа</p>
              <h1 className="font-display text-4xl font-bold mt-1 leading-none">Выбери свой план</h1>
              <p className="text-sm text-muted mt-2">Цель и частоту можно изменить позже.</p>
            </div>
            {onCancel && <button type="button" onClick={onCancel} className="w-12 h-12 shrink-0 flex items-center justify-center rounded-xl border border-white/10" aria-label="Закрыть"><X /></button>}
          </header>

          <section>
            <h2 className="text-xs font-bold uppercase tracking-wider text-muted mb-2">Цель</h2>
            <div className="grid grid-cols-2 gap-2">
              {PROGRAM_GOALS.map(item => (
                <button key={item.id} type="button" onClick={() => selectGoal(item.id)} aria-pressed={goal === item.id}
                  className={cn('min-h-[82px] rounded-xl border p-3 text-left', goal === item.id ? 'border-lime bg-lime/10' : 'border-white/10 bg-white/[0.03]')}>
                  <span className="block font-bold text-sm">{item.title}</span>
                  <span className="block text-xs text-muted mt-1">{item.subtitle}</span>
                </button>
              ))}
            </div>
          </section>

          <section className="mt-5">
            <h2 className="text-xs font-bold uppercase tracking-wider text-muted mb-2">Тренировок в неделю</h2>
            <div className="grid grid-cols-5 gap-2">
              {DAYS.map(value => <button key={value} type="button" onClick={() => setDays(value)} aria-pressed={days === value}
                className={cn('min-h-[52px] rounded-xl border font-mono text-lg font-bold', days === value ? 'bg-lime text-ink border-lime' : 'border-white/10 bg-white/[0.03]')}>{value}</button>)}
            </div>
          </section>

          <details className="mt-5 border-y border-white/10 py-2 group">
            <summary className="min-h-[48px] flex items-center justify-between cursor-pointer list-none font-semibold text-sm">Оборудование, пресс и кардио <span className="text-muted text-xs group-open:hidden">Настроить</span><span className="text-muted text-xs hidden group-open:inline">Скрыть</span></summary>
            <div className="space-y-5 pb-3">
              <div>
                <p className="text-xs text-muted mb-2">Где тренируешься</p>
                <div className="grid grid-cols-3 gap-2">
                  {GYM_PROFILES.map(item => <button key={item.id} type="button" onClick={() => setGym(item.id)} aria-pressed={gym === item.id}
                    className={cn('min-h-[48px] rounded-lg border px-2 text-xs font-bold', gym === item.id ? 'border-lime text-lime' : 'border-white/10 text-muted')}>{item.title}</button>)}
                </div>
              </div>
              <div>
                <p className="text-xs text-muted mb-2">Пресс / кор · раз в неделю</p>
                <div className="grid grid-cols-5 gap-2">
                  {([0, 1, 2, 3, 4] as const).map(value => <button key={value} type="button" onClick={() => setCoreSessions(value)} aria-pressed={coreSessions === value}
                    className={cn('min-h-[48px] rounded-lg border font-mono', coreSessions === value ? 'border-lime text-lime' : 'border-white/10 text-muted')}>{value}</button>)}
                </div>
              </div>
              <div>
                <p className="text-xs text-muted mb-2">Кардио · раз в неделю</p>
                <div className="grid grid-cols-5 gap-2">
                  {[0, 1, 2, 3, 4].map(value => <button key={value} type="button" onClick={() => setCardioSessions(value)} aria-pressed={cardioSessions === value}
                    className={cn('min-h-[48px] rounded-lg border font-mono', cardioSessions === value ? 'border-lime text-lime' : 'border-white/10 text-muted')}>{value}</button>)}
                </div>
              </div>
            </div>
          </details>

          {preview && <div className="mt-5 text-sm">
            <p className="font-bold">{preview.program.title}</p>
            <p className="text-xs text-muted mt-1">Порядок тренировок: {preview.templates.map(t => t.name).join(' → ')}</p>
          </div>}
        </div>
      </div>
      <div className="shrink-0 border-t border-white/10 bg-ink px-5 pt-3 pb-[max(1rem,env(safe-area-inset-bottom))]">
        <button type="button" disabled={!goal} onClick={() => goal && onConfirm(goal, days, gym, Math.min(coreSessions, days) as 0 | 1 | 2 | 3 | 4, Math.min(cardioSessions, days))}
          className="w-full max-w-lg mx-auto btn-lime min-h-[56px] rounded-xl flex items-center justify-center gap-2 disabled:opacity-35 font-bold"><Check className="w-5 h-5" /> Выбрать программу</button>
      </div>
    </div>
  );
};
