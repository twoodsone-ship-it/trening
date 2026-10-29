import React, { useState, useMemo } from 'react';
import { X, RefreshCw, Check, Dumbbell, ArrowRight, Search, Filter } from 'lucide-react';
import type { Exercise, EquipmentType, MuscleCategory } from '../types/index.ts';
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

const EQUIPMENT_TABS: { id: EquipmentType | 'all'; label: string; icon: string }[] = [
  { id: 'all', label: 'Все снаряды', icon: '⚡' },
  { id: 'barbell', label: 'Штанга', icon: '🏋️' },
  { id: 'dumbbell', label: 'Гантели', icon: '🥫' },
  { id: 'machine', label: 'Тренажер / Хаммер', icon: '⚙️' },
  { id: 'cable', label: 'Блок / Кроссовер', icon: '⛓️' },
  { id: 'bodyweight', label: 'Свой вес', icon: '🤸' }
];

const EQUIPMENT_BADGES: Record<string, { label: string; bg: string; text: string }> = {
  barbell: { label: 'Штанга', bg: 'bg-red-100 dark:bg-red-950/60', text: 'text-red-700 dark:text-red-400' },
  dumbbell: { label: 'Гантели', bg: 'bg-blue-100 dark:bg-blue-950/60', text: 'text-blue-700 dark:text-blue-400' },
  cable: { label: 'Блок / Кроссовер', bg: 'bg-purple-100 dark:bg-purple-950/60', text: 'text-purple-700 dark:text-purple-400' },
  machine: { label: 'Тренажер / Хаммер', bg: 'bg-amber-100 dark:bg-amber-950/60', text: 'text-amber-700 dark:text-amber-400' },
  bodyweight: { label: 'Свой вес', bg: 'bg-emerald-100 dark:bg-emerald-950/60', text: 'text-emerald-700 dark:text-emerald-400' }
};

export const ExerciseSwapModal: React.FC<ExerciseSwapModalProps> = ({
  currentExercise,
  isOpen,
  onClose,
  onSelectAlternative
}) => {
  const [selectedEquipment, setSelectedEquipment] = useState<EquipmentType | 'all'>('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Normalize target category
  const targetCategory = (currentExercise.category || 'Chest').toLowerCase();

  // Find all alternatives that exist in catalog
  const availableAlternatives = useMemo(() => {
    const catalogList = Object.values(EXERCISE_CATALOG);

    // 1. First priority: direct alternatives listed in catalog for this ID
    const entry = EXERCISE_CATALOG[currentExercise.id];
    const directAltIds = new Set(entry?.alternatives || currentExercise.alternatives || []);

    // 2. Filter exercises
    let candidates = catalogList.filter(item => {
      if (item.id === currentExercise.id) return false;

      // Match either direct alternative OR same muscle category
      const matchesDirect = directAltIds.has(item.id);
      const matchesCategory = item.category.toLowerCase() === targetCategory;

      return matchesDirect || matchesCategory;
    });

    // Fallback: If somehow empty, provide all exercises in catalog except current
    if (candidates.length === 0) {
      candidates = catalogList.filter(item => item.id !== currentExercise.id);
    }

    // Filter by equipment
    if (selectedEquipment !== 'all') {
      candidates = candidates.filter(item => item.equipment === selectedEquipment);
    }

    // Filter by search query
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      candidates = candidates.filter(
        item => item.name.toLowerCase().includes(q) || item.technique.primaryMuscles.toLowerCase().includes(q)
      );
    }

    return candidates;
  }, [currentExercise.id, currentExercise.category, currentExercise.alternatives, targetCategory, selectedEquipment, searchQuery]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-sm animate-fade-in text-slate-900 dark:text-zinc-100">
      <div className="w-full max-w-lg bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-700 rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        
        {/* Header */}
        <div className="p-4 border-b border-slate-200 dark:border-zinc-800 bg-slate-50 dark:bg-zinc-950 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <RefreshCw className="w-5 h-5 text-emerald-600 dark:text-emerald-400 animate-spin-slow" />
              <div>
                <h3 className="font-bold text-base sm:text-lg">Замена упражнения</h3>
                <span className="text-xs text-slate-500 dark:text-zinc-400 block">
                  Тренажер занят или отсутствует? Выберите доступный снаряд:
                </span>
              </div>
            </div>
            <button 
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-slate-700 dark:text-zinc-400 dark:hover:text-white rounded-xl hover:bg-slate-200 dark:hover:bg-zinc-800 transition"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Current Exercise Banner */}
          <div className="px-3.5 py-2 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/50 rounded-2xl flex items-center justify-between text-xs">
            <span className="text-emerald-800 dark:text-emerald-300 font-medium">Заменяем:</span>
            <span className="font-bold text-slate-900 dark:text-white truncate max-w-[240px]">
              {currentExercise.name}
            </span>
          </div>

          {/* Search bar */}
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
            <input
              type="text"
              placeholder="Поиск упражнения по названию или мышцам..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="w-full bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-700 rounded-xl pl-9 pr-4 py-2 text-xs sm:text-sm text-slate-900 dark:text-white focus:outline-none focus:border-emerald-500 shadow-2xs"
            />
          </div>

          {/* Equipment Filter Pills */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
            {EQUIPMENT_TABS.map(tab => (
              <button
                key={tab.id}
                onClick={() => setSelectedEquipment(tab.id)}
                className={`px-2.5 py-1 rounded-xl text-[11px] font-bold whitespace-nowrap transition flex items-center gap-1 ${
                  selectedEquipment === tab.id
                    ? 'bg-emerald-500 text-white shadow-xs'
                    : 'bg-white dark:bg-zinc-900 text-slate-600 dark:text-zinc-400 border border-slate-200 dark:border-zinc-800 hover:bg-slate-100'
                }`}
              >
                <span>{tab.icon}</span>
                <span>{tab.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Alternatives List */}
        <div className="p-4 overflow-y-auto space-y-2.5 flex-1">
          {availableAlternatives.length === 0 ? (
            <div className="text-center py-8 space-y-2">
              <p className="text-slate-500 text-sm font-medium">
                По выбранному фильтру снарядов упражнений не найдено.
              </p>
              <button
                onClick={() => { setSelectedEquipment('all'); setSearchQuery(''); }}
                className="text-xs font-bold text-emerald-600 hover:underline"
              >
                Сбросить фильтры снарядов
              </button>
            </div>
          ) : (
            availableAlternatives.map(alt => {
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
                  className="p-3.5 bg-white dark:bg-zinc-950/60 hover:bg-emerald-50/70 dark:hover:bg-emerald-950/40 border border-slate-200 dark:border-zinc-800 hover:border-emerald-400 dark:hover:border-emerald-600 rounded-2xl cursor-pointer transition shadow-2xs group flex items-center justify-between gap-3"
                >
                  <div className="space-y-1 flex-1">
                    <div className="flex items-center gap-2">
                      <span className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full ${badge.bg} ${badge.text}`}>
                        {badge.label}
                      </span>
                      <span className="text-[11px] text-slate-500 dark:text-zinc-500 font-mono">
                        {alt.defaultSets}×{alt.minReps}-{alt.maxReps} повт.
                      </span>
                      <span className="text-[11px] font-mono text-emerald-600 dark:text-emerald-400 font-bold">
                        ~{alt.defaultWeight} кг
                      </span>
                    </div>

                    <h4 className="font-bold text-sm text-slate-900 dark:text-zinc-100 group-hover:text-emerald-700 dark:group-hover:text-emerald-400 transition">
                      {alt.name}
                    </h4>

                    <p className="text-[11px] text-slate-500 dark:text-zinc-400 line-clamp-1">
                      {alt.technique.primaryMuscles}
                    </p>
                  </div>

                  <button className="px-3 py-1.5 bg-emerald-500 group-hover:bg-emerald-400 text-white dark:text-black font-bold text-xs rounded-xl shadow-xs transition shrink-0 flex items-center gap-1">
                    <span>Выбрать</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              );
            })
          )}
        </div>

        {/* Footer */}
        <div className="p-3 border-t border-slate-200 dark:border-zinc-800 bg-slate-50 dark:bg-zinc-950 flex justify-between items-center text-xs text-slate-500">
          <span>{availableAlternatives.length} доступных вариантов</span>
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
