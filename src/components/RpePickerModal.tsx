import React, { useState } from 'react';
import { Check } from 'lucide-react';
import { cn } from '../utils/cn';
import { soundService } from '../services/audioService';

interface RpePickerModalProps {
  isOpen: boolean;
  initialRpe?: number;
  exerciseName: string;
  setLabel: string;
  vibrationEnabled?: boolean;
  onConfirm: (rpe: number) => void;
  onSkip: () => void;
}

const RPE_HINTS: Record<number, string> = {
  6: 'Лёгко, ещё 4+ повт. в запасе',
  7: 'Комфортно, 3 повт. в запасе',
  8: 'Тяжело, 2 повт. в запасе',
  9: 'Почти отказ, 1 повт. в запасе',
  10: 'Абсолютный отказ'
};

export const RpePickerModal: React.FC<RpePickerModalProps> = ({
  isOpen,
  initialRpe = 8,
  exerciseName,
  setLabel,
  vibrationEnabled = true,
  onConfirm,
  onSkip
}) => {
  const [rpe, setRpe] = useState(initialRpe);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[60] flex items-end sm:items-center justify-center p-3 bg-black/70 backdrop-blur-sm animate-fade-in">
      <div className="w-full max-w-md surface-card p-5 animate-slide-up">
        <p className="text-[11px] font-bold uppercase tracking-wider text-muted">{setLabel}</p>
        <h3 className="font-bold text-lg text-slate-900 dark:text-white mt-0.5 truncate">{exerciseName}</h3>
        <p className="text-sm text-muted mt-1">Оцените усилие (RPE) — влияет на Smart Progression</p>

        <div className="mt-5 text-center">
          <div className="font-mono text-5xl font-black text-emerald-600 dark:text-emerald-400">{rpe}</div>
          <p className="text-xs text-muted mt-1 min-h-[1.25rem]">{RPE_HINTS[rpe]}</p>
        </div>

        <input
          type="range"
          min={6}
          max={10}
          step={0.5}
          value={rpe}
          onChange={e => setRpe(Number(e.target.value))}
          className="w-full mt-4 accent-emerald-500 h-2"
          aria-label="RPE"
        />

        <div className="flex justify-between text-[10px] font-mono text-muted mt-1 px-0.5">
          <span>6</span><span>7</span><span>8</span><span>9</span><span>10</span>
        </div>

        <div className="grid grid-cols-5 gap-1.5 mt-4">
          {[6, 7, 8, 9, 10].map(v => (
            <button
              key={v}
              type="button"
              onClick={() => setRpe(v)}
              className={cn(
                'py-2.5 rounded-xl text-sm font-bold font-mono transition active:scale-95 min-h-[44px]',
                Math.round(rpe) === v
                  ? 'bg-emerald-500 text-black'
                  : 'bg-slate-100 dark:bg-zinc-800 text-slate-700 dark:text-zinc-300'
              )}
            >
              {v}
            </button>
          ))}
        </div>

        <div className="flex gap-2 mt-5">
          <button
            type="button"
            onClick={onSkip}
            className="flex-1 py-3 rounded-xl text-sm font-semibold text-slate-500 dark:text-zinc-400 hover:bg-slate-100 dark:hover:bg-zinc-800 transition min-h-[48px]"
          >
            Пропустить
          </button>
          <button
            type="button"
            onClick={() => {
              soundService.haptic('rpeConfirm', vibrationEnabled);
              onConfirm(rpe);
            }}
            className="flex-[1.4] py-3 rounded-xl text-sm font-bold bg-emerald-500 text-black flex items-center justify-center gap-2 active:scale-95 transition min-h-[48px]"
          >
            <Check className="w-4 h-4" /> Сохранить RPE
          </button>
        </div>
      </div>
    </div>
  );
};
