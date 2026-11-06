import React, { useMemo, useState } from 'react';
import { ArrowLeft, ArrowRight, Check, CheckCircle2, Flame, Home, Dumbbell, Building2 } from 'lucide-react';
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
const CORE_FREQUENCIES = [0, 1, 2, 3, 4] as const;
const GYM_ICONS = { full: Building2, dumbbells: Dumbbell, home: Home };

export const ProgramSetupFlow: React.FC<ProgramSetupFlowProps> = ({
  existingTemplates,
  onCancel,
  onConfirm
}) => {
  const [step, setStep] = useState<1 | 2 | 3 | 4 | 5>(1);
  const [goal, setGoal] = useState<ProgramGoal | null>(null);
  const [days, setDays] = useState<DaysPerWeek>(3);
  const [gym, setGym] = useState<GymProfile>('full');
  const [coreSessions, setCoreSessions] = useState<0 | 1 | 2 | 3 | 4>(2);
  const [cardioSessions, setCardioSessions] = useState(2);

  const preview = useMemo(() => {
    if (!goal) return null;
    return buildProgramTemplates(goal, days, existingTemplates, gym, coreSessions, cardioSessions);
  }, [goal, days, gym, coreSessions, cardioSessions, existingTemplates]);

  const primaryDisabled = step === 1 && !goal;
  const primaryLabel =
    step === 1 ? 'Дальше' :
    step === 2 ? 'Дальше' :
    step === 3 ? 'Дальше' :
    step === 4 ? 'К предпросмотру' :
    'Запустить программу';

  const onPrimary = () => {
    if (step === 1 && goal) setStep(2);
    else if (step === 2) setStep(3);
    else if (step === 3) setStep(4);
    else if (step === 4) setStep(5);
    else if (step === 5 && goal) onConfirm(goal, days, gym, Math.min(coreSessions, days) as 0 | 1 | 2 | 3 | 4, Math.min(cardioSessions, days));
  };

  return (
    <div className="fixed inset-0 z-[60] bg-app-atmosphere text-white flex flex-col animate-fade-in">
      <div className="flex-1 overflow-y-auto px-5 pt-[max(1.25rem,env(safe-area-inset-top))] pb-4">
        <div className="max-w-lg mx-auto">
          <div className="flex items-center justify-between mb-7">
            {step > 1 || onCancel ? (
              <button
                type="button"
                onClick={() => {
                  if (step === 1 && onCancel) onCancel();
                  else setStep(s => (s > 1 ? ((s - 1) as 1 | 2 | 3 | 4 | 5) : 1));
                }}
                className="w-12 h-12 rounded-xl surface-panel flex items-center justify-center active:scale-95 transition"
                aria-label="Назад"
              >
                <ArrowLeft className="w-5 h-5" />
              </button>
            ) : (
              <div className="w-11" />
            )}
        <div className="flex gap-1.5" aria-label={`Шаг ${step} из 5`}>
              {[1, 2, 3, 4, 5].map(n => (
                <span
                  key={n}
                  className={cn(
                    'h-1.5 rounded-full transition-all',
                    n === step ? 'w-7 bg-lime' : n < step ? 'w-3.5 bg-lime/50' : 'w-3.5 bg-white/15'
                  )}
                />
              ))}
            </div>
            <div className="w-11" />
          </div>

          {step === 1 && (
          <div className="space-y-5 animate-slide-up">
              <header>
                <p className="text-lime text-[11px] font-bold tracking-[0.18em] uppercase">Твоя цель · шаг 1 из 5</p>
                <h1 className="font-display text-4xl sm:text-5xl font-bold mt-2 leading-[0.95]">
                  Какая цель<br />на ближайший месяц?
                </h1>
                <p className="text-sm text-muted mt-3">План подстроится под цель и частоту тренировок.</p>
              </header>
              <div className="space-y-3">
                {PROGRAM_GOALS.map(g => (
                  <button
                    key={g.id}
                    type="button"
                    onClick={() => {
                      setGoal(g.id);
                      setCardioSessions(g.id === 'cut' ? Math.min(3, days) : g.id === 'recomp' ? Math.min(2, days) : 0);
                    }}
                    aria-pressed={goal === g.id}
                    className={cn(
                      'w-full text-left p-4 rounded-2xl border transition flex items-center gap-3 min-h-[92px] active:scale-[0.99]',
                      goal === g.id ? 'border-lime bg-lime/[0.09] shadow-[inset_3px_0_0_var(--lime)]' : 'border-white/10 bg-[#111512] hover:border-white/20'
                    )}
                  >
                    <span className="min-w-0 flex-1">
                      <span className="block font-bold text-lg leading-tight">{g.title}</span>
                      <span className="block text-lime/90 text-xs font-semibold mt-1">{g.subtitle}</span>
                      <span className="block text-muted text-[13px] leading-snug mt-2">{g.detail}</span>
                    </span>
                    <CheckCircle2 className={cn('w-5 h-5 shrink-0 transition-colors', goal === g.id ? 'text-lime' : 'text-white/20')} aria-hidden="true" />
                  </button>
                ))}
              </div>
            </div>
          )}

          {step === 2 && (
          <div className="space-y-5 animate-slide-up">
              <header>
                <p className="text-lime text-[11px] font-bold tracking-[0.18em] uppercase">Частота · шаг 2 из 5</p>
                <h1 className="font-display text-4xl sm:text-5xl font-bold mt-2 leading-[0.95]">
                  Сколько раз<br />в неделю?
                </h1>
                <p className="text-sm text-muted mt-3">Выбирай темп, который сможешь поддерживать.</p>
              </header>
              <div className="grid grid-cols-5 gap-2">
                {DAYS.map(d => (
                  <button
                    key={d}
                    type="button"
                    onClick={() => setDays(d)}
                    aria-pressed={days === d}
                    className={cn(
                      'min-h-[64px] rounded-xl font-mono font-bold text-2xl border transition active:scale-95',
                      days === d ? 'bg-lime text-ink border-lime' : 'bg-white/[0.03] border-white/10'
                    )}
                  >
                    {d}
                  </button>
                ))}
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="space-y-6 animate-slide-up">
              <header>
                <p className="text-lime text-[11px] font-bold tracking-[0.18em] uppercase">Оборудование · шаг 3 из 5</p>
                <h1 className="font-display text-4xl sm:text-5xl font-bold mt-2 leading-[0.95]">
                  Какое<br />оборудование?
                </h1>
                <p className="text-muted text-sm mt-2">Подберём упражнения под твой зал или дом.</p>
              </header>
              <div className="space-y-3">
                {GYM_PROFILES.map(g => {
                  const Icon = GYM_ICONS[g.id];
                  return (
                    <button
                      key={g.id}
                      type="button"
                      onClick={() => setGym(g.id)}
                      aria-pressed={gym === g.id}
                      className={cn(
                        'w-full text-left p-4 rounded-2xl border flex items-center gap-4 transition min-h-[80px] active:scale-[0.99]',
                        gym === g.id ? 'border-lime bg-lime/10' : 'border-white/10 bg-white/[0.03]'
                      )}
                    >
                      <span className={cn('w-12 h-12 rounded-2xl flex items-center justify-center', gym === g.id ? 'bg-lime text-ink' : 'bg-white/5')}>
                        <Icon className="w-5 h-5" />
                      </span>
                      <div>
                        <p className="font-bold text-lg">{g.title}</p>
                        <p className="text-sm text-muted">{g.subtitle}</p>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {step === 4 && goal && (
            <div className="space-y-6 animate-slide-up">
              <header>
                <p className="text-lime text-[11px] font-bold tracking-[0.18em] uppercase">Дополнения · шаг 4 из 5</p>
                <h1 className="font-display text-4xl sm:text-5xl font-bold mt-2">Кор и кардио</h1>
                <p className="text-muted text-sm mt-2">Настрой пресс и кардио в недельном плане.</p>
              </header>
              <div className="surface-panel p-4 space-y-3">
                <div>
                  <p className="font-bold">Пресс / кор</p>
                  <p className="text-xs text-muted mt-1">Сколько коротких блоков добавить в неделю?</p>
                </div>
                <div className="grid grid-cols-5 gap-2">
                  {CORE_FREQUENCIES.map(n => (
                    <button key={n} type="button" onClick={() => setCoreSessions(n)}
                      className={cn('min-h-[48px] rounded-xl border font-mono font-bold', coreSessions === n ? 'bg-lime text-ink border-lime' : 'bg-white/[0.03] border-white/10')}>
                      {n}×
                    </button>
                  ))}
                </div>
              </div>
              {(goal === 'cut' || goal === 'recomp') && (
                <div className="surface-panel p-4 space-y-3">
                  <div>
                    <p className="font-bold">Кардио</p>
                    <p className="text-xs text-muted mt-1">Лёгкое кардио или интервалы добавятся в выбранные дни.</p>
                  </div>
                  <div className="grid grid-cols-5 gap-2">
                    {[0, 1, 2, 3, 4].map(n => (
                      <button key={n} type="button" onClick={() => setCardioSessions(n)}
                        className={cn('min-h-[48px] rounded-xl border font-mono font-bold', cardioSessions === n ? 'bg-lime text-ink border-lime' : 'bg-white/[0.03] border-white/10')}>
                        {n}×
                      </button>
                    ))}
                  </div>
                </div>
              )}
              {goal === 'strength' || goal === 'bulk' ? (
                <p className="text-xs text-muted">Для этой цели кардио можно добавить позже в редакторе программы.</p>
              ) : null}
            </div>
          )}

          {step === 5 && preview && goal && (
            <div className="space-y-6 animate-slide-up">
              <header>
                <p className="text-lime text-[11px] font-bold tracking-[0.18em] uppercase">Предпросмотр · шаг 5 из 5</p>
                <h1 className="font-display text-4xl sm:text-5xl font-bold mt-2">Твоя программа</h1>
              </header>
              <div className="surface-panel p-5 space-y-4">
                <div className="flex items-center gap-2">
                  <Flame className="w-5 h-5 text-lime" />
                  <div>
                    <p className="font-bold text-lg">{preview.program.title}</p>
                    <p className="text-xs text-muted">{preview.templates.length} дней в цикле</p>
                  </div>
                </div>
                {preview.templates.map((t, i) => (
                  <div key={t.id} className="flex justify-between gap-3 py-3 border-t border-white/8">
                    <div className="min-w-0">
                      <p className="font-semibold truncate">{t.name}</p>
                      <p className="text-xs text-muted truncate">{t.description} · {t.exercises.length} упр.</p>
                    </div>
                    <span className="text-[11px] font-mono text-lime bg-lime/10 px-2 py-1 rounded-lg h-fit">
                      {i + 1}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Sticky CTA — always above safe area / home indicator */}
      <div className="shrink-0 border-t border-white/10 bg-[#090b0a]/95 px-5 pt-3 pb-[max(1rem,env(safe-area-inset-bottom))]">
        <div className="max-w-lg mx-auto">
          <button
            type="button"
            disabled={primaryDisabled || (step === 5 && !preview)}
            onClick={onPrimary}
            className="w-full btn-lime py-4 rounded-xl flex items-center justify-center gap-2 disabled:opacity-35 disabled:saturate-50 min-h-[56px] text-base active:scale-[0.99] transition"
          >
            {step === 5 ? <Check className="w-5 h-5" /> : null}
            {primaryLabel}
            {step < 5 ? <ArrowRight className="w-4 h-4" /> : null}
          </button>
        </div>
      </div>
    </div>
  );
};
