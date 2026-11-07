import React from 'react';
import { createPortal } from 'react-dom';
import { ArrowRight, Target, X, Zap } from 'lucide-react';
import type { ProgramGoal, WorkoutTemplate } from '../types';
import { buildWorkoutBriefing } from '../data/programBuilder';
import { useDialogA11y } from '../hooks/useDialogA11y';

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
  const { containerRef, dialogProps } = useDialogA11y({
    isOpen,
    onClose,
    titleId: 'briefing-title'
  });

  if (!isOpen || typeof document === 'undefined') return null;
  const b = buildWorkoutBriefing(template, goal);

  return createPortal(
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
      <div
        ref={containerRef}
        {...dialogProps}
        className="w-full max-w-md surface-panel border-lime/25 flex flex-col max-h-[min(88dvh,640px)] overflow-hidden shadow-2xl"
      >
        <div className="p-5 pb-3 overflow-y-auto min-h-0 flex-1">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <p className="text-xs font-bold uppercase tracking-[0.18em] text-lime">Брифинг</p>
              <h3 id="briefing-title" className="text-xl font-extrabold mt-1 leading-tight">
                {b.headline}
              </h3>
              <p className="text-sm text-muted mt-1">{b.focus}</p>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="p-2.5 rounded-xl bg-white/5 min-h-[44px] min-w-[44px] flex items-center justify-center shrink-0"
              aria-label="Закрыть"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="mt-4 space-y-2">
            <p className="text-xs font-bold uppercase tracking-wider text-muted flex items-center gap-1.5">
              <Target className="w-3.5 h-3.5 text-lime" /> Цели на сегодня
            </p>
            {b.targets.map(t => (
              <div
                key={t}
                className="text-sm font-mono bg-white/[0.04] border border-white/8 rounded-xl px-3 py-2"
              >
                {t}
              </div>
            ))}
          </div>

          <div className="mt-4 flex gap-2 p-3 rounded-2xl bg-lime/10 border border-lime/20">
            <Zap className="w-4 h-4 text-lime shrink-0 mt-0.5" />
            <p className="text-sm leading-snug">{b.cue}</p>
          </div>
        </div>

        <div className="shrink-0 border-t border-white/10 bg-ink/90 p-4 pb-[max(1rem,env(safe-area-inset-bottom))]">
          <button
            type="button"
            onClick={onContinue}
            className="w-full btn-lime py-3.5 rounded-2xl flex items-center justify-center gap-2 min-h-[52px]"
          >
            К самочувствию <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
};
