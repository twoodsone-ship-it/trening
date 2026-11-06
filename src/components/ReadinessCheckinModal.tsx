import React from 'react';
import { createPortal } from 'react-dom';
import { X } from 'lucide-react';
import type { ReadinessLevel, WorkoutTemplate } from '../types';

interface ReadinessCheckinModalProps {
  template: WorkoutTemplate | null;
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (readiness: ReadinessLevel) => void;
}

const OPTIONS: { level: ReadinessLevel; title: string; hint: string; color: string }[] = [
  { level: 'optimal', title: 'В ресурсе', hint: 'Обычная нагрузка', color: 'bg-lime' },
  { level: 'tired', title: 'Немного устал', hint: 'Снизим требование к усилию', color: 'bg-amber-400' },
  { level: 'sleep_deprived', title: 'Сильно устал', hint: 'Тренируйся бережно', color: 'bg-rose-400' }
];

export const ReadinessCheckinModal: React.FC<ReadinessCheckinModalProps> = ({ template, isOpen, onClose, onConfirm }) => {
  if (!isOpen || !template || typeof document === 'undefined') return null;

  return createPortal(
    <div className="fixed inset-0 z-[200] flex items-end sm:items-center justify-center bg-black/80 text-white">
      <div role="dialog" aria-modal="true" aria-labelledby="readiness-title" className="w-full max-w-md rounded-t-3xl sm:rounded-3xl bg-ink-2 border border-white/10 p-5 pb-[max(1.25rem,env(safe-area-inset-bottom))]">
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="text-xs text-lime font-semibold">{template.name} · {template.exercises.length} упражнений</p>
            <h2 id="readiness-title" className="font-display text-3xl font-bold mt-1">Как самочувствие?</h2>
          </div>
          <button type="button" onClick={onClose} className="w-12 h-12 rounded-xl flex items-center justify-center bg-white/5" aria-label="Закрыть"><X className="w-5 h-5" /></button>
        </div>
        <p className="text-xs text-muted mt-2 mb-5">Выбор поможет подобрать нагрузку. После касания тренировка начнётся.</p>
        <div className="space-y-2">
          {OPTIONS.map(option => (
            <button key={option.level} type="button" onClick={() => onConfirm(option.level)} className="w-full min-h-[68px] rounded-xl border border-white/10 bg-white/[0.03] px-4 text-left flex items-center gap-3 active:bg-white/10">
              <span className={`w-2.5 h-2.5 rounded-full shrink-0 ${option.color}`} />
              <span><span className="block font-bold">{option.title}</span><span className="block text-xs text-muted mt-0.5">{option.hint}</span></span>
            </button>
          ))}
        </div>
      </div>
    </div>,
    document.body
  );
};
