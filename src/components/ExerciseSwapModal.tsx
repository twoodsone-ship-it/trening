import React from 'react';
import { X, RefreshCw, Check, Dumbbell, ShieldCheck, ArrowRight } from 'lucide-react';
import { Exercise, EquipmentType } from '../types';
import { EXERCISE_CATALOG, CatalogExerciseItem } from '../data/exerciseCatalog';

interface ExerciseSwapModalProps {
  currentExercise: {
    id: string;
    name: string;
    category: string;
    equipment?: EquipmentType;
    alternatives?: string[];
  };
  isOpen: boolean;
  onClose: () => void;
  onSelectAlternative: (newExercise: CatalogExerciseItem) => void;
}

const EQUIPMENT_BADGES: Record<string, { label: string; bg: string; text: string }> = {
  barbell: { label: 'Штанга', bg: 'bg-red-100 dark:bg-red-950/60', text: 'text-red-700 dark:text-red-400' },
  dumbbell: { label: 'Гантели', bg: 'bg-blue-100 dark:bg-blue-950/60', text: 'text-blue-700 dark:text-blue-400' },
  cable: { label: 'Блок / Кроссовер', bg: 'bg-purple-100 dark:bg-purple-950/60', text: 'text-purple-700 dark:text-purple-400' },
  machine: { label: 'Тренажер / Хаммер', bg: 'bg-amber-100 dark:bg-amber-950/60', text: 'text-amber-700 dark:text-amber-400' },
  bodyweight: { label: 'Свой вес / Турник', bg: 'bg-emerald-100 dark:bg-emerald-950/60', text: 'text-emerald-700 dark:text-emerald-400' }
};

export const ExerciseSwapModal: React.FC<ExerciseSwapModalProps> = ({
  currentExercise,
  isOpen,
  onClose,
  onSelectAlternative
}) => {
  if (!isOpen) return null;

  // Find alternatives in catalog
  const catalogEntry = EXERCISE_CATALOG[currentExercise.id];
  let alternativeIds = catalogEntry?.alternatives || currentExercise.alternatives || [];

  // If no direct alternatives defined, find all catalog exercises matching the same muscle category
  if (alternativeIds.length === 0) {
    alternativeIds = Object.keys(EXERCISE_CATALOG).filter(
      id => id !== currentExercise.id && EXERCISE_CATALOG[id].category === currentExercise.category
    );
  }

  const alternativeItems: CatalogExerciseItem[] = alternativeIds
    .map(id => EXERCISE_CATALOG[id])
    .filter(Boolean);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-sm animate-fade-in text-slate-900 dark:text-zinc-100">
      <div className="w-full max-w-md bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-700 rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[85vh]">
        
        {/* Header */}
        <div className="p-4 border-b border-slate-200 dark:border-zinc-800 bg-slate-50 dark:bg-zinc-950">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <RefreshCw className="w-5 h-5 text-emerald-600 dark:text-emerald-400 animate-spin-slow" />
              <h3 className="font-bold text-base sm:text-lg">Замена упражнения</h3>
            </div>
            <button 
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-slate-700 dark:text-zinc-400 dark:hover:text-white rounded-xl hover:bg-slate-200 dark:hover:bg-zinc-800 transition"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="mt-2 text-xs text-slate-500 dark:text-zinc-400">
            Тренажер занят или отсутствует? Выберите эквивалент на ту же целевую группу мышц:
          </div>
        </div>

        {/* Current Exercise Pill */}
        <div className="px-4 py-2.5 bg-slate-100 dark:bg-zinc-950/80 border-b border-slate-200 dark:border-zinc-800 flex items-center justify-between text-xs">
          <span className="text-slate-500 dark:text-zinc-400">Текущее упражнение:</span>
          <span className="font-bold text-slate-900 dark:text-white truncate max-w-[200px]">
            {currentExercise.name}
          </span>
        </div>

        {/* Alternatives List */}
        <div className="p-4 overflow-y-auto space-y-2.5 flex-1">
          {alternativeItems.length === 0 ? (
            <p className="text-slate-500 text-center py-6 text-xs">
              Альтернативные упражнения для данной категории не найдены.
            </p>
          ) : (
            alternativeItems.map(alt => {
              const badge = EQUIPMENT_BADGES[alt.equipment] || {
                label: alt.equipment,
                bg: 'bg-slate-100 dark:bg-zinc-800',
                text: 'text-slate-700 dark:text-zinc-300'
              };

              return (
                <div
                  key={alt.id}
                  onClick={() => {
                    onSelectAlternative(alt);
                    onClose();
                  }}
                  className="p-3 bg-white dark:bg-zinc-950/60 hover:bg-emerald-50/70 dark:hover:bg-emerald-950/40 border border-slate-200 dark:border-zinc-800 hover:border-emerald-400 dark:hover:border-emerald-600 rounded-2xl cursor-pointer transition shadow-sm group flex items-center justify-between gap-3"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${badge.bg} ${badge.text}`}>
                        {badge.label}
                      </span>
                      <span className="text-[10px] text-slate-500 dark:text-zinc-500 font-mono">
                        {alt.defaultSets}×{alt.minReps}-{alt.maxReps} повт.
                      </span>
                    </div>

                    <h4 className="font-bold text-sm text-slate-900 dark:text-zinc-100 group-hover:text-emerald-700 dark:group-hover:text-emerald-400 transition">
                      {alt.name}
                    </h4>

                    <p className="text-[11px] text-slate-500 dark:text-zinc-400 line-clamp-1">
                      {alt.technique.primaryMuscles}
                    </p>
                  </div>

                  <div className="w-8 h-8 rounded-full bg-slate-100 dark:bg-zinc-800 group-hover:bg-emerald-500 group-hover:text-black flex items-center justify-center transition shrink-0">
                    <ArrowRight className="w-4 h-4 text-slate-600 dark:text-zinc-300 group-hover:text-black transition" />
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Footer */}
        <div className="p-3 border-t border-slate-200 dark:border-zinc-800 bg-slate-50 dark:bg-zinc-950 flex justify-between items-center text-xs text-slate-500">
          <span>Прогрессия и тоннаж автоматически сохранятся.</span>
          <button
            onClick={onClose}
            className="px-4 py-2 bg-slate-200 dark:bg-zinc-800 hover:bg-slate-300 text-slate-700 dark:text-zinc-200 font-bold rounded-xl transition"
          >
            Отмена
          </button>
        </div>

      </div>
    </div>
  );
};
