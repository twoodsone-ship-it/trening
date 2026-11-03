import React, { useState } from 'react';
import { X, Calculator, Check } from 'lucide-react';
import { cn } from '../utils/cn';

interface PlateCalculatorModalProps {
  initialWeight?: number;
  barWeight?: number;
  isOpen: boolean;
  onClose: () => void;
}

const AVAILABLE_PLATES = [25, 20, 15, 10, 5, 2.5, 1.25, 0.5];

/** Physical plate colors (not UI theme accents) */
const PLATE_COLORS: Record<number, { bg: string; text: string; border: string }> = {
  25: { bg: 'bg-red-600', text: 'text-white', border: 'border-red-500' },
  20: { bg: 'bg-blue-600', text: 'text-white', border: 'border-blue-500' },
  15: { bg: 'bg-yellow-500', text: 'text-black', border: 'border-yellow-400' },
  10: { bg: 'bg-green-700', text: 'text-white', border: 'border-green-600' },
  5: { bg: 'bg-zinc-200', text: 'text-ink', border: 'border-zinc-300' },
  2.5: { bg: 'bg-zinc-700', text: 'text-white', border: 'border-zinc-600' },
  1.25: { bg: 'bg-zinc-800', text: 'text-white', border: 'border-zinc-700' },
  0.5: { bg: 'bg-amber-700', text: 'text-white', border: 'border-amber-600' }
};

export const PlateCalculatorModal: React.FC<PlateCalculatorModalProps> = ({
  initialWeight = 80,
  barWeight = 20,
  isOpen,
  onClose
}) => {
  const [targetWeight, setTargetWeight] = useState<number>(initialWeight);
  const [barbellWeight, setBarbellWeight] = useState<number>(barWeight);

  if (!isOpen) return null;

  const weightPerSide = Math.max(0, (targetWeight - barbellWeight) / 2);
  let remaining = weightPerSide;
  const plateBreakdown: { weight: number; count: number }[] = [];

  for (const plate of AVAILABLE_PLATES) {
    if (remaining >= plate) {
      const count = Math.floor(remaining / plate);
      plateBreakdown.push({ weight: plate, count });
      remaining = Math.round((remaining - count * plate) * 100) / 100;
    }
  }

  const remainderNotice = remaining > 0 ? remaining * 2 : 0;

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-3 bg-black/75 backdrop-blur-sm animate-fade-in">
      <div className="w-full max-w-md surface-panel p-4 sm:p-6 border-lime/20 max-h-[min(92dvh,calc(100dvh-1.5rem))] overflow-y-auto animate-slide-up">
        <div className="flex items-center justify-between pb-3 border-b border-white/8 gap-2">
          <div className="flex items-center gap-2 min-w-0">
            <Calculator className="w-5 h-5 text-lime shrink-0" />
            <div>
              <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-lime">Инструмент</p>
              <h3 className="font-extrabold text-lg text-white leading-tight">Калькулятор блинов</h3>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-11 h-11 flex items-center justify-center text-muted hover:text-white rounded-2xl bg-white/5 active:scale-95 transition shrink-0"
            aria-label="Закрыть"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="my-5 space-y-4">
          <div>
            <label className="block text-xs uppercase tracking-wider text-muted font-semibold mb-1.5">
              Целевой вес штанги (кг)
            </label>
            <div className="flex items-center gap-2">
              <input
                type="number"
                step="0.5"
                min={barbellWeight}
                value={targetWeight}
                onChange={e => setTargetWeight(parseFloat(e.target.value) || 0)}
                className="w-full bg-white/[0.04] border border-white/10 rounded-2xl px-4 py-3 font-mono text-2xl font-bold text-lime focus:outline-none focus:border-lime/50 min-h-[52px]"
              />
              <div className="flex gap-1">
                {[+2.5, +5, +10].map(inc => (
                  <button
                    key={inc}
                    type="button"
                    onClick={() => setTargetWeight(prev => Math.max(barbellWeight, prev + inc))}
                    className="px-2.5 py-3 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl text-xs font-semibold text-white transition min-h-[52px]"
                  >
                    +{inc}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="flex items-center justify-between text-xs text-muted bg-white/[0.03] p-3 rounded-2xl border border-white/8 gap-2">
            <span>Вес грифа:</span>
            <div className="flex gap-2">
              {[20, 15, 10].map(w => (
                <button
                  key={w}
                  type="button"
                  onClick={() => setBarbellWeight(w)}
                  className={cn(
                    'px-3 py-2 rounded-xl font-medium transition border min-h-[36px]',
                    barbellWeight === w
                      ? 'btn-lime border-lime'
                      : 'bg-white/5 text-muted border-white/10'
                  )}
                >
                  {w} кг
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="bg-white/[0.03] border border-white/8 rounded-2xl p-4 mb-4">
          <div className="flex justify-between items-center mb-3">
            <span className="text-xs uppercase tracking-wider text-muted font-bold">
              Навесить на каждую сторону:
            </span>
            <span className="font-mono text-lg font-bold text-lime">
              {weightPerSide} кг
            </span>
          </div>

          {plateBreakdown.length === 0 ? (
            <p className="text-muted text-sm italic text-center py-2">
              Только пустой гриф ({barbellWeight} кг)
            </p>
          ) : (
            <div className="flex flex-wrap gap-2 justify-center py-2">
              {plateBreakdown.map(p => {
                const color = PLATE_COLORS[p.weight] || { bg: 'bg-zinc-700', text: 'text-white', border: 'border-zinc-600' };
                return (
                  <div
                    key={p.weight}
                    className={cn('flex items-center gap-1.5 px-3 py-1.5 rounded-xl border font-mono font-bold text-sm', color.bg, color.text, color.border)}
                  >
                    <span>{p.weight} кг</span>
                    <span className="text-xs opacity-90">× {p.count}</span>
                  </div>
                );
              })}
            </div>
          )}

          {remainderNotice > 0 && (
            <div className="mt-3 text-xs text-amber-300 bg-amber-500/10 border border-amber-400/30 p-2 rounded-xl text-center">
              ⚠️ Округлите вес: {remainderNotice} кг не распределяется стандартными блинами.
            </div>
          )}
        </div>

        <div className="flex items-center justify-center gap-1 py-4 px-2 bg-ink/60 rounded-2xl border border-white/8 overflow-x-auto">
          <div className="flex items-center gap-1">
            {plateBreakdown.map(p =>
              Array.from({ length: p.count }).map((_, i) => (
                <div
                  key={`l-${p.weight}-${i}`}
                  style={{ height: `${Math.min(56, 26 + p.weight * 1.2)}px` }}
                  className={cn('w-3 rounded-sm border border-black/30', PLATE_COLORS[p.weight]?.bg || 'bg-zinc-600')}
                  title={`${p.weight} кг`}
                />
              ))
            )}
          </div>

          <div className="w-2.5 h-7 bg-zinc-400 rounded-sm" />
          <div className="w-24 sm:w-32 h-2.5 bg-zinc-500 rounded-full flex items-center justify-center text-[9px] text-white font-bold select-none">
            {barbellWeight}kg
          </div>
          <div className="w-2.5 h-7 bg-zinc-400 rounded-sm" />

          <div className="flex items-center gap-1 flex-row-reverse">
            {plateBreakdown.map(p =>
              Array.from({ length: p.count }).map((_, i) => (
                <div
                  key={`r-${p.weight}-${i}`}
                  style={{ height: `${Math.min(56, 26 + p.weight * 1.2)}px` }}
                  className={cn('w-3 rounded-sm border border-black/30', PLATE_COLORS[p.weight]?.bg || 'bg-zinc-600')}
                  title={`${p.weight} кг`}
                />
              ))
            )}
          </div>
        </div>

        <button
          type="button"
          onClick={onClose}
          className="w-full mt-5 py-3.5 btn-lime font-bold rounded-2xl transition flex items-center justify-center gap-2 min-h-[52px]"
        >
          <Check className="w-5 h-5" /> Готово
        </button>
      </div>
    </div>
  );
};
