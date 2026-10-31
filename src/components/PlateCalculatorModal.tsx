import React, { useState } from 'react';
import { X, Dumbbell, Calculator, Check } from 'lucide-react';

interface PlateCalculatorModalProps {
  initialWeight?: number;
  barWeight?: number;
  isOpen: boolean;
  onClose: () => void;
}

const AVAILABLE_PLATES = [25, 20, 15, 10, 5, 2.5, 1.25, 0.5];

const PLATE_COLORS: Record<number, { bg: string; text: string; border: string }> = {
  25: { bg: 'bg-red-600', text: 'text-white', border: 'border-red-500' },
  20: { bg: 'bg-blue-600', text: 'text-white', border: 'border-blue-500' },
  15: { bg: 'bg-yellow-500', text: 'text-black', border: 'border-yellow-400' },
  10: { bg: 'bg-emerald-600', text: 'text-white', border: 'border-emerald-500' },
  5: { bg: 'bg-slate-200 dark:bg-zinc-200', text: 'text-slate-900', border: 'border-slate-300' },
  2.5: { bg: 'bg-slate-700 dark:bg-zinc-700', text: 'text-white', border: 'border-slate-600' },
  1.25: { bg: 'bg-slate-800 dark:bg-zinc-800', text: 'text-white', border: 'border-slate-700' },
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

  // Calculate plates per side
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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/70 backdrop-blur-sm animate-fade-in text-slate-900 dark:text-zinc-100">
      <div className="w-full max-w-md bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-700 rounded-3xl p-4 sm:p-6 shadow-2xl max-h-[min(92dvh,calc(100dvh-1.5rem))] overflow-y-auto">
        
        {/* Header */}
        <div className="flex items-center justify-between pb-3 sm:pb-4 border-b border-slate-200 dark:border-zinc-800">
          <div className="flex items-center gap-2">
            <Calculator className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
            <h3 className="font-bold text-base sm:text-lg text-slate-900 dark:text-white">Калькулятор блинов</h3>
          </div>
          <button 
            onClick={onClose}
            className="w-9 h-9 flex items-center justify-center text-slate-400 hover:text-slate-700 dark:text-zinc-400 dark:hover:text-white rounded-xl hover:bg-slate-100 dark:hover:bg-zinc-800 active:scale-95 transition"
            aria-label="Закрыть"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Inputs */}
        <div className="my-5 space-y-4">
          <div>
            <label className="block text-xs uppercase tracking-wider text-slate-500 dark:text-zinc-400 font-semibold mb-1.5">
              Целевой вес штанги (кг)
            </label>
            <div className="flex items-center gap-2">
              <input
                type="number"
                step="0.5"
                min={barbellWeight}
                value={targetWeight}
                onChange={e => setTargetWeight(parseFloat(e.target.value) || 0)}
                className="w-full bg-slate-50 dark:bg-zinc-950 border border-slate-200 dark:border-zinc-700 rounded-2xl px-4 py-3 font-mono text-2xl font-bold text-emerald-600 dark:text-emerald-400 focus:outline-none focus:border-emerald-500"
              />
              <div className="flex gap-1">
                {[+2.5, +5, +10].map(inc => (
                  <button
                    key={inc}
                    onClick={() => setTargetWeight(prev => Math.max(barbellWeight, prev + inc))}
                    className="px-2.5 py-3 bg-slate-100 dark:bg-zinc-800 hover:bg-slate-200 dark:hover:bg-zinc-700 rounded-xl text-xs font-semibold text-slate-700 dark:text-zinc-200 transition"
                  >
                    +{inc}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="flex items-center justify-between text-xs text-slate-500 dark:text-zinc-400 bg-slate-50 dark:bg-zinc-950/60 p-3 rounded-2xl border border-slate-200 dark:border-zinc-800">
            <span>Вес грифа:</span>
            <div className="flex gap-2">
              {[20, 15, 10].map(w => (
                <button
                  key={w}
                  onClick={() => setBarbellWeight(w)}
                  className={`px-3 py-1 rounded-xl font-medium transition ${
                    barbellWeight === w 
                      ? 'bg-emerald-500 text-white font-bold' 
                      : 'bg-white dark:bg-zinc-800 text-slate-700 dark:text-zinc-300 border border-slate-200 dark:border-zinc-700 hover:bg-slate-100'
                  }`}
                >
                  {w} кг
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Result Per Side */}
        <div className="bg-slate-50 dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800 rounded-2xl p-4 mb-4">
          <div className="flex justify-between items-center mb-3">
            <span className="text-xs uppercase tracking-wider text-slate-500 dark:text-zinc-400 font-bold">
              Навесить на каждую сторону:
            </span>
            <span className="font-mono text-lg font-bold text-emerald-600 dark:text-emerald-400">
              {weightPerSide} кг
            </span>
          </div>

          {plateBreakdown.length === 0 ? (
            <p className="text-slate-400 text-sm italic text-center py-2">
              Только пустой гриф ({barbellWeight} кг)
            </p>
          ) : (
            <div className="flex flex-wrap gap-2 justify-center py-2">
              {plateBreakdown.map(p => {
                const color = PLATE_COLORS[p.weight] || { bg: 'bg-zinc-700', text: 'text-white', border: 'border-zinc-600' };
                return (
                  <div
                    key={p.weight}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl border font-mono font-bold text-sm shadow-xs ${color.bg} ${color.text} ${color.border}`}
                  >
                    <span>{p.weight} кг</span>
                    <span className="text-xs opacity-90">× {p.count}</span>
                  </div>
                );
              })}
            </div>
          )}

          {remainderNotice > 0 && (
            <div className="mt-3 text-xs text-amber-700 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800/40 p-2 rounded-xl text-center">
              ⚠️ Округлите вес: {remainderNotice} кг не распределяется стандартными блинами.
            </div>
          )}
        </div>

        {/* Barbell visualizer */}
        <div className="flex items-center justify-center gap-1 py-4 px-2 bg-slate-100 dark:bg-black/40 rounded-2xl border border-slate-200 dark:border-zinc-800 overflow-x-auto">
          {/* Left sleeve plates */}
          <div className="flex items-center gap-1">
            {plateBreakdown.map(p => 
              Array.from({ length: p.count }).map((_, i) => (
                <div
                  key={`l-${p.weight}-${i}`}
                  style={{ height: `${Math.min(56, 26 + p.weight * 1.2)}px` }}
                  className={`w-3 rounded-sm ${PLATE_COLORS[p.weight]?.bg || 'bg-slate-600'} border border-black/30`}
                  title={`${p.weight} кг`}
                />
              ))
            )}
          </div>

          {/* Bar collar and center */}
          <div className="w-2.5 h-7 bg-slate-400 dark:bg-zinc-400 rounded-sm" />
          <div className="w-24 sm:w-32 h-2.5 bg-slate-500 dark:bg-zinc-500 rounded-full flex items-center justify-center text-[9px] text-white font-bold select-none">
            {barbellWeight}kg
          </div>
          <div className="w-2.5 h-7 bg-slate-400 dark:bg-zinc-400 rounded-sm" />

          {/* Right sleeve plates */}
          <div className="flex items-center gap-1 flex-row-reverse">
            {plateBreakdown.map(p => 
              Array.from({ length: p.count }).map((_, i) => (
                <div
                  key={`r-${p.weight}-${i}`}
                  style={{ height: `${Math.min(56, 26 + p.weight * 1.2)}px` }}
                  className={`w-3 rounded-sm ${PLATE_COLORS[p.weight]?.bg || 'bg-slate-600'} border border-black/30`}
                  title={`${p.weight} кг`}
                />
              ))
            )}
          </div>
        </div>

        <button
          onClick={onClose}
          className="w-full mt-5 py-3 bg-emerald-500 hover:bg-emerald-400 text-white font-bold rounded-2xl transition flex items-center justify-center gap-2"
        >
          <Check className="w-5 h-5" /> Готово
        </button>

      </div>
    </div>
  );
};
