import React, { useMemo, useState } from 'react';
import { ArrowLeft, ArrowRight, Check, Flame, Home, Dumbbell, Building2 } from 'lucide-react';
import type { DaysPerWeek, GymProfile, ProgramGoal, WorkoutTemplate } from '../types';
import { PROGRAM_GOALS, buildProgramTemplates } from '../data/programBuilder';
import { GYM_PROFILES } from '../utils/equipmentMap';
import { cn } from '../utils/cn';

interface ProgramSetupFlowProps {
  existingTemplates: WorkoutTemplate[];
  onCancel?: () => void;
  onConfirm: (goal: ProgramGoal, days: DaysPerWeek, gym: GymProfile) => void;
}

const DAYS: DaysPerWeek[] = [2, 3, 4, 5, 6];
const GYM_ICONS = { full: Building2, dumbbells: Dumbbell, home: Home };

export const ProgramSetupFlow: React.FC<ProgramSetupFlowProps> = ({
  existingTemplates,
  onCancel,
  onConfirm
}) => {
  const [step, setStep] = useState<1 | 2 | 3 | 4>(1);
  const [goal, setGoal] = useState<ProgramGoal | null>(null);
  const [days, setDays] = useState<DaysPerWeek>(3);
  const [gym, setGym] = useState<GymProfile>('full');

  const preview = useMemo(() => {
    if (!goal) return null;
    return buildProgramTemplates(goal, days, existingTemplates, gym);
  }, [goal, days, gym, existingTemplates]);

  const primaryDisabled = step === 1 && !goal;
  const primaryLabel =
    step === 1 ? 'Дальше' :
    step === 2 ? 'Дальше' :
    step === 3 ? 'К предпросмотру' :
    'Запустить программу';

  const onPrimary = () => {
    if (step === 1 && goal) setStep(2);
    else if (step === 2) setStep(3);
    else if (step === 3) setStep(4);
    else if (step === 4 && goal) onConfirm(goal, days, gym);
  };

  return (
    <div className="fixed inset-0 z-[60] bg-app-atmosphere text-white flex flex-col animate-fade-in">
      <div className="flex-1 overflow-y-auto px-5 pt-[max(1.25rem,env(safe-area-inset-top))] pb-4">
        <div className="max-w-lg mx-auto">
          <div className="flex items-center justify-between mb-8">
            {step > 1 || onCancel ? (
              <button
                type="button"
                onClick={() => {
                  if (step === 1 && onCancel) onCancel();
                  else setStep(s => (s > 1 ? ((s - 1) as 1 | 2 | 3 | 4) : 1));
                }}
                className="w-11 h-11 rounded-2xl surface-panel flex items-center justify-center"
                aria-label="Назад"
              >
                <ArrowLeft className="w-5 h-5" />
              </button>
            ) : (
              <div className="w-11" />
            )}
            <div className="flex gap-1.5">
              {[1, 2, 3, 4].map(n => (
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
            <div className="space-y-6 animate-slide-up">
              <header>
                <p className="text-lime text-xs font-bold tracking-[0.2em] uppercase">Шаг 1</p>
                <h1 className="text-3xl font-extrabold tracking-tight mt-2 leading-tight">
                  Какая цель<br />на ближайший месяц?
                </h1>
              </header>
              <div className="space-y-3">
                {PROGRAM_GOALS.map(g => (
                  <button
                    key={g.id}
                    type="button"
                    onClick={() => setGoal(g.id)}
                    className={cn(
                      'w-full text-left p-4 rounded-3xl border transition',
                      goal === g.id ? 'border-lime bg-lime/10' : 'border-white/10 bg-white/[0.03]'
                    )}
                  >
                    <p className="font-bold text-lg">{g.title}</p>
                    <p className="text-lime/90 text-xs font-semibold mt-0.5">{g.subtitle}</p>
                    <p className="text-muted text-sm mt-2">{g.detail}</p>
                  </button>
                ))}
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-6 animate-slide-up">
              <header>
                <p className="text-lime text-xs font-bold tracking-[0.2em] uppercase">Шаг 2</p>
                <h1 className="text-3xl font-extrabold tracking-tight mt-2 leading-tight">
                  Сколько раз<br />в неделю?
                </h1>
              </header>
              <div className="grid grid-cols-5 gap-2">
                {DAYS.map(d => (
                  <button
                    key={d}
                    type="button"
                    onClick={() => setDays(d)}
                    className={cn(
                      'aspect-square rounded-2xl font-mono font-bold text-xl border',
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
                <p className="text-lime text-xs font-bold tracking-[0.2em] uppercase">Шаг 3</p>
                <h1 className="text-3xl font-extrabold tracking-tight mt-2 leading-tight">
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
                      className={cn(
                        'w-full text-left p-4 rounded-3xl border flex items-center gap-4 transition',
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

          {step === 4 && preview && goal && (
            <div className="space-y-6 animate-slide-up">
              <header>
                <p className="text-lime text-xs font-bold tracking-[0.2em] uppercase">Шаг 4</p>
                <h1 className="text-3xl font-extrabold tracking-tight mt-2">Твоя программа</h1>
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
      <div className="shrink-0 border-t border-white/10 bg-ink/95 backdrop-blur-md px-5 pt-3 pb-[max(1rem,env(safe-area-inset-bottom))]">
        <div className="max-w-lg mx-auto">
          <button
            type="button"
            disabled={primaryDisabled || (step === 4 && !preview)}
            onClick={onPrimary}
            className="w-full btn-lime py-4 rounded-2xl flex items-center justify-center gap-2 disabled:opacity-40 min-h-[56px] text-base"
          >
            {step === 4 ? <Check className="w-5 h-5" /> : null}
            {primaryLabel}
            {step < 4 ? <ArrowRight className="w-4 h-4" /> : null}
          </button>
        </div>
      </div>
    </div>
  );
};
