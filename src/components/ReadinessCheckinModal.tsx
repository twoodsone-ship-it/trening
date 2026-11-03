import React from 'react';
import { createPortal } from 'react-dom';
import { X, BatteryCharging } from 'lucide-react';
import { ReadinessLevel, WorkoutTemplate } from '../types';
import { cn } from '../utils/cn';

interface ReadinessCheckinModalProps {
  template: WorkoutTemplate | null;
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (readiness: ReadinessLevel) => void;
}

export const ReadinessCheckinModal: React.FC<ReadinessCheckinModalProps> = ({
  template,
  isOpen,
  onClose,
  onConfirm
}) => {
  if (!isOpen || !template || typeof document === 'undefined') return null;

  const options: Array<{
    level: ReadinessLevel;
    icon: string;
    title: string;
    badge: string;
    badgeColor: string;
    description: string;
    regulationEffect: string;
  }> = [
    {
      level: 'optimal',
      icon: '🟢',
      title: 'В ресурсе',
      badge: '100% Нагрузка',
      badgeColor: 'bg-lime/10 text-lime border-lime/30',
      description: 'Хороший сон 7-9ч, отличное самочувствие и аппетит.',
      regulationEffect: 'Штатная двойная прогрессия, RPE до 9.5-10, активный детектор плато.'
    },
    {
      level: 'tired',
      icon: '🟡',
      title: 'Устал (после смены)',
      badge: 'Авторегуляция',
      badgeColor: 'bg-amber-500/10 text-amber-300 border-amber-500/30',
      description: 'Работа на ногах, физическая или ментальная усталость.',
      regulationEffect: 'Заморозка триггера плато на 1 сессию, порог RPE снижен на 0.5 балла.'
    },
    {
      level: 'sleep_deprived',
      icon: '🔴',
      title: 'Недосып / Стресс',
      badge: 'Защита ЦНС',
      badgeColor: 'bg-rose-500/10 text-rose-300 border-rose-500/30',
      description: 'Сон < 6ч, упадок сил или высокий фоновый стресс.',
      regulationEffect: 'Заморозка триггера плато на 1 сессию, порог RPE снижен на 0.5 балла.'
    }
  ];

  return createPortal(
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
      <div
        className="w-full max-w-md surface-panel border-lime/25 flex flex-col max-h-[min(88dvh,640px)] overflow-hidden shadow-2xl"
        role="dialog"
        aria-modal="true"
        aria-labelledby="readiness-title"
      >
        <div className="p-5 pb-3 overflow-y-auto min-h-0 flex-1">
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-2 min-w-0">
              <BatteryCharging className="w-5 h-5 text-lime shrink-0" />
              <div>
                <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-lime">Чекин</p>
                <h3 id="readiness-title" className="font-extrabold text-lg text-white leading-tight">
                  Готовность ЦНС
                </h3>
              </div>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="w-11 h-11 flex items-center justify-center rounded-2xl bg-white/5 text-muted hover:text-white active:scale-95 transition shrink-0"
              aria-label="Закрыть"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <p className="text-sm text-muted mt-3 leading-relaxed">
            Тренировка: <span className="font-bold text-white">{template.name}</span>. Выберите
            самочувствие перед стартом для авторегуляции прогрессии:
          </p>

          <div className="mt-4 space-y-2.5">
            {options.map(opt => (
              <button
                key={opt.level}
                type="button"
                onClick={() => onConfirm(opt.level)}
                className={cn(
                  'w-full text-left p-4 rounded-3xl border border-white/10 bg-white/[0.03]',
                  'hover:border-lime/40 hover:bg-lime/5 transition active:scale-[0.98] group min-h-[44px]'
                )}
              >
                <div className="flex items-center justify-between gap-2 mb-1.5">
                  <div className="flex items-center gap-2 min-w-0">
                    <span className="text-lg">{opt.icon}</span>
                    <span className="font-bold text-base text-white group-hover:text-lime transition truncate">
                      {opt.title}
                    </span>
                  </div>
                  <span
                    className={cn(
                      'text-[10px] font-bold px-2 py-0.5 rounded-full border shrink-0',
                      opt.badgeColor
                    )}
                  >
                    {opt.badge}
                  </span>
                </div>
                <p className="text-xs text-muted leading-relaxed">{opt.description}</p>
                <div className="mt-2 text-[11px] font-mono text-lime/90 bg-white/[0.04] p-2 rounded-xl border border-white/8">
                  {opt.regulationEffect}
                </div>
              </button>
            ))}
          </div>
        </div>

        <div className="shrink-0 border-t border-white/10 px-5 py-3 pb-[max(0.85rem,env(safe-area-inset-bottom))]">
          <p className="text-[11px] text-muted text-center leading-relaxed">
            Авторегуляция защищает от ложного отката весов при усталости.
          </p>
        </div>
      </div>
    </div>,
    document.body
  );
};
