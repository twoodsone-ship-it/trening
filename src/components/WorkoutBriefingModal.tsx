import React from 'react';
import { ArrowRight, Target, X, Zap } from 'lucide-react';
import type { ProgramGoal, WorkoutTemplate } from '../types';
import { buildWorkoutBriefing } from '../data/programBuilder';

interface WorkoutBriefingModalProps {
  template: WorkoutTemplate;
  goal?: ProgramGoal;
  isOpen: boolean;
  onClose: () => void;
  onContinue: () => void;
}

export const WorkoutBriefingModal: React.FC<WorkoutBriefingModalProps> = ({
  template,
  goal,
  isOpen,
  onClose,
  onContinue
}) => {
  if (!isOpen) return null;
  const b = buildWorkoutBriefing(template, goal);

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-3 bg-black/75 backdrop-blur-sm animate-fade-in">
      <div className="w-full max-w-md surface-panel p-5 animate-slide-up border-lime/20">
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-lime">Брифинг</p>
            <h3 className="text-xl font-extrabold mt-1">{b.headline}</h3>
            <p className="text-sm text-muted mt-1">{b.focus}</p>
          </div>
          <button type="button" onClick={onClose} className="p-2 rounded-xl bg-white/5" aria-label="Закрыть">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="mt-4 space-y-2">
          <p className="text-[11px] font-bold uppercase tracking-wider text-muted flex items-center gap-1.5">
            <Target className="w-3.5 h-3.5 text-lime" /> Цели на сегодня
          </p>
          {b.targets.map(t => (
            <div key={t} className="text-sm font-mono bg-white/[0.04] border border-white/8 rounded-xl px-3 py-2">
              {t}
            </div>
          ))}
        </div>

        <div className="mt-4 flex gap-2 p-3 rounded-2xl bg-lime/10 border border-lime/20">
          <Zap className="w-4 h-4 text-lime shrink-0 mt-0.5" />
          <p className="text-sm leading-snug">{b.cue}</p>
        </div>

        <button
          type="button"
          onClick={onContinue}
          className="mt-5 w-full btn-lime py-3.5 rounded-2xl flex items-center justify-center gap-2 min-h-[52px]"
        >
          К самочувствию <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
