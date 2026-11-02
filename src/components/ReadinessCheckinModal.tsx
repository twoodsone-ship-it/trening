import React from 'react';
import { X, BatteryCharging, ShieldAlert, Sparkles, AlertTriangle, Moon } from 'lucide-react';
import { ReadinessLevel, WorkoutTemplate } from '../types';

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
  if (!isOpen || !template) return null;

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
      badgeColor: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/30',
      description: 'Хороший сон 7-9ч, отличное самочувствие и аппетит.',
      regulationEffect: 'Штатная двойная прогрессия, RPE до 9.5-10, активный детектор плато.'
    },
    {
      level: 'tired',
      icon: '🟡',
      title: 'Устал (после смены)',
      badge: 'Авторегуляция',
      badgeColor: 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/30',
      description: 'Работа на ногах, физическая или ментальная усталость.',
      regulationEffect: 'Заморозка триггера плато на 1 сессию, порог RPE снижен на 0.5 балла.'
    },
    {
      level: 'sleep_deprived',
      icon: '🔴',
      title: 'Недосып / Стресс',
      badge: 'Защита ЦНС',
      badgeColor: 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/30',
      description: 'Сон < 6ч, упадок сил или высокий фоновый стресс.',
      regulationEffect: 'Заморозка триггера плато на 1 сессию, порог RPE снижен на 0.5 балла.'
    }
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/75 backdrop-blur-sm animate-fade-in text-slate-900 dark:text-zinc-100">
      <div className="w-full max-w-md bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-700 rounded-3xl p-4 sm:p-6 shadow-2xl max-h-[min(94dvh,calc(100dvh-1.5rem))] overflow-y-auto">
        
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-zinc-800">
          <div className="flex items-center gap-2">
            <BatteryCharging className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
            <h3 className="font-bold text-base sm:text-lg text-slate-900 dark:text-white">
              Чекин готовности ЦНС
            </h3>
          </div>
          <button 
            onClick={onClose}
            className="w-9 h-9 flex items-center justify-center text-slate-400 hover:text-slate-700 dark:text-zinc-400 dark:hover:text-white rounded-xl hover:bg-slate-100 dark:hover:bg-zinc-800 active:scale-95 transition"
            aria-label="Закрыть"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Intro */}
        <div className="mt-3">
          <p className="text-xs text-slate-600 dark:text-zinc-400 leading-relaxed">
            Тренировка: <span className="font-bold text-slate-900 dark:text-zinc-200">{template.name}</span>.
            Выберите самочувствие перед стартом для авторегуляции прогрессии:
          </p>
        </div>

        {/* Cards */}
        <div className="mt-4 space-y-2.5">
          {options.map((opt) => (
            <button
              key={opt.level}
              onClick={() => onConfirm(opt.level)}
              className="w-full text-left p-3.5 rounded-2xl border border-slate-200 dark:border-zinc-800 bg-slate-50 dark:bg-zinc-950/70 hover:bg-emerald-500/5 hover:border-emerald-500/50 dark:hover:bg-zinc-800/80 dark:hover:border-emerald-500/40 transition active:scale-98 group"
            >
              <div className="flex items-center justify-between gap-2 mb-1.5">
                <div className="flex items-center gap-2">
                  <span className="text-lg">{opt.icon}</span>
                  <span className="font-bold text-sm sm:text-base text-slate-900 dark:text-white group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition">
                    {opt.title}
                  </span>
                </div>
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${opt.badgeColor}`}>
                  {opt.badge}
                </span>
              </div>
              <p className="text-xs text-slate-600 dark:text-zinc-400">
                {opt.description}
              </p>
              <div className="mt-2 text-[11px] font-mono text-emerald-700 dark:text-emerald-400 bg-white/70 dark:bg-zinc-900/60 p-1.5 rounded-lg border border-slate-200/80 dark:border-zinc-800">
                🛡️ {opt.regulationEffect}
              </div>
            </button>
          ))}
        </div>

        {/* Footer info note */}
        <p className="text-[11px] text-slate-400 dark:text-zinc-500 mt-3.5 text-center">
          Авторегуляция защищает от ложного отката весов при временном накоплении усталости.
        </p>

      </div>
    </div>
  );
};
