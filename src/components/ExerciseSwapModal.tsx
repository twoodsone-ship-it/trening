import React, { useState, useMemo } from 'react';
import { X, RefreshCw, Check, Dumbbell, ArrowRight, Search, Filter, Plus, AlertCircle, Sparkles } from 'lucide-react';
import type { Exercise, EquipmentType, MuscleCategory } from '../types/index.ts';
import { EXERCISE_CATALOG, CatalogExerciseItem } from '../data/exerciseCatalog';
import { storageService } from '../services/storageService';

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

type TabType = 'recommended' | 'all' | 'Chest' | 'Back' | 'Legs' | 'Shoulders' | 'Arms' | 'Core';

const CATEGORY_TABS: { id: TabType; label: string; icon?: string }[] = [
  { id: 'recommended', label: '⭐ Аналоги' },
  { id: 'all', label: '🔥 Все (44+)' },
  { id: 'Chest', label: 'Грудь' },
  { id: 'Back', label: 'Спина' },
  { id: 'Legs', label: 'Ноги' },
  { id: 'Shoulders', label: 'Плечи' },
  { id: 'Arms', label: 'Руки' },
  { id: 'Core', label: 'Кор / Пресс' }
];

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
  smith: { label: 'Смит', bg: 'bg-indigo-100 dark:bg-indigo-950/60', text: 'text-indigo-700 dark:text-indigo-400' },
  bodyweight: { label: 'Свой вес', bg: 'bg-emerald-100 dark:bg-emerald-950/60', text: 'text-emerald-700 dark:text-emerald-400' }
};

export const ExerciseSwapModal: React.FC<ExerciseSwapModalProps> = ({
  currentExercise,
  isOpen,
  onClose,
  onSelectAlternative
}) => {
  // Check if current exercise has direct alternatives in catalog
  const catalogEntry = EXERCISE_CATALOG[currentExercise.id];
  const directAltIds = useMemo(() => {
    return new Set(catalogEntry?.alternatives || currentExercise.alternatives || []);
  }, [catalogEntry, currentExercise.alternatives]);

  // Default to 'recommended' if direct alternatives exist, else default to 'all'
  const [activeTab, setActiveTab] = useState<TabType>(directAltIds.size > 0 ? 'recommended' : 'all');
  const [selectedEquipment, setSelectedEquipment] = useState<EquipmentType | 'all'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  
  // Custom exercise creation toggle & state
  const [isCreatingCustom, setIsCreatingCustom] = useState(false);
  const [customName, setCustomName] = useState('');
  const [customCategory, setCustomCategory] = useState<MuscleCategory>('Chest');
  const [customEquipment, setCustomEquipment] = useState<EquipmentType>('barbell');
  const [customWeight, setCustomWeight] = useState(40);
  const [customMinReps, setCustomMinReps] = useState(8);
  const [customMaxReps, setCustomMaxReps] = useState(12);

  // Filter exercises
  const { filteredExercises, totalCategoryCount } = useMemo(() => {
    const allCatalogList = Object.values(EXERCISE_CATALOG);

    // 1. Filter by Category / Recommended Tab
    let baseList: CatalogExerciseItem[] = [];

    if (activeTab === 'recommended') {
      baseList = allCatalogList.filter(item => {
        if (item.id === currentExercise.id) return false;
        // Direct match
        if (directAltIds.has(item.id)) return true;
        // Fallback: match category if direct alternatives are empty
        return item.category.toLowerCase() === (currentExercise.category || '').toLowerCase();
      });

      // If still empty, fallback to all catalog
      if (baseList.length === 0) {
        baseList = allCatalogList.filter(item => item.id !== currentExercise.id);
      }
    } else if (activeTab === 'all') {
      baseList = allCatalogList.filter(item => item.id !== currentExercise.id);
    } else {
      // Explicit Muscle Group tab: 'Chest', 'Back', etc.
      baseList = allCatalogList.filter(item => item.category === activeTab && item.id !== currentExercise.id);
    }

    const totalCategoryCount = baseList.length;

    // 2. Filter by Equipment
    let list = baseList;
    if (selectedEquipment !== 'all') {
      list = list.filter(item => {
        if (selectedEquipment === 'machine') {
          return item.equipment === 'machine' || item.equipment === 'smith';
        }
        return item.equipment === selectedEquipment;
      });
    }

    // 3. Filter by Search Query
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      list = list.filter(item => {
        const nameMatch = item.name.toLowerCase().includes(q);
        const muscleMatch = item.technique.primaryMuscles.toLowerCase().includes(q);
        const equipMatch = item.equipment.toLowerCase().includes(q) || (EQUIPMENT_BADGES[item.equipment]?.label.toLowerCase().includes(q) ?? false);
        const idMatch = item.id.toLowerCase().includes(q);
        return nameMatch || muscleMatch || equipMatch || idMatch;
      });
    }

    return { filteredExercises: list, totalCategoryCount };
  }, [activeTab, selectedEquipment, searchQuery, currentExercise.id, currentExercise.category, directAltIds]);

  // Handle creating a custom exercise on the fly
  const handleSaveCustomExercise = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customName.trim()) return;

    const newCustomItem: CatalogExerciseItem = {
      id: 'custom-' + Date.now(),
      name: customName.trim(),
      category: customCategory,
      equipment: customEquipment,
      animationType: customCategory === 'Chest' ? 'bench-press' : customCategory === 'Back' ? 'row' : customCategory === 'Legs' ? 'squat' : customCategory === 'Shoulders' ? 'overhead-press' : customCategory === 'Arms' ? 'bicep-curl' : 'squat',
      defaultSets: 3,
      minReps: customMinReps,
      maxReps: customMaxReps,
      weightStep: customEquipment === 'dumbbell' ? 2 : customEquipment === 'barbell' ? 2.5 : 2.5,
      defaultWeight: customWeight,
      restSeconds: 90,
      alternatives: Object.values(EXERCISE_CATALOG).filter(x => x.category === customCategory).slice(0, 4).map(x => x.id),
      technique: {
        primaryMuscles: `Целевая группа: ${customCategory}`,
        setup: 'Займите исходное положение, сохраняйте естественный прогиб и стабильный корпус.',
        execution: 'Выполняйте движение подконтрольно в полной амплитуде с пиковым сокращением.',
        breathing: 'Вдох в негативной фазе, выдох на усилии.',
        mistakes: ['Чрезмерный вес в ущерб амплитуде', 'Рывки и потеря контроля']
      }
    };

    onSelectAlternative(newCustomItem);
    setIsCreatingCustom(false);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2.5 sm:p-4 bg-black/70 backdrop-blur-sm animate-fade-in text-slate-900 dark:text-zinc-100">
      <div className="w-full max-w-xl bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-700 rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[min(92dvh,calc(100dvh-1.5rem))]">
        
        {/* Header */}
        <div className="p-3.5 sm:p-4 border-b border-slate-200 dark:border-zinc-800 bg-slate-50 dark:bg-zinc-950 space-y-2.5 sm:space-y-3 shrink-0">
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2 min-w-0 flex-1">
              <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-emerald-500/10 flex items-center justify-center text-emerald-600 dark:text-emerald-400 shrink-0">
                <RefreshCw className="w-4 h-4 sm:w-5 sm:h-5 animate-spin-slow" />
              </div>
              <div className="min-w-0 flex-1">
                <h3 className="font-bold text-sm sm:text-lg text-slate-900 dark:text-white truncate">Замена упражнения</h3>
                <span className="text-[11px] sm:text-xs text-slate-500 dark:text-zinc-400 block truncate">
                  Тренажер занят или отсутствует? Выберите замену:
                </span>
              </div>
            </div>
            <button 
              onClick={onClose}
              className="w-9 h-9 flex items-center justify-center text-slate-400 hover:text-slate-700 dark:text-zinc-400 dark:hover:text-white rounded-xl hover:bg-slate-200 dark:hover:bg-zinc-800 active:scale-95 transition shrink-0"
              aria-label="Закрыть"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Current Exercise Banner */}
          <div className="px-3 py-1.5 sm:py-2 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/50 rounded-2xl flex items-center justify-between text-xs gap-2">
            <span className="text-emerald-800 dark:text-emerald-300 font-medium shrink-0">Заменяем:</span>
            <span className="font-bold text-slate-900 dark:text-white truncate text-right">
              {currentExercise.name}
            </span>
          </div>

          {/* Search bar & Custom Exercise Trigger */}
          <div className="flex gap-2">
            <div className="relative flex-1">
              <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
              <input
                type="text"
                placeholder="Поиск по названию (жим, тяга, штанга, грудь)..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="w-full bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-700 rounded-xl pl-9 pr-4 py-2 text-xs sm:text-sm text-slate-900 dark:text-white focus:outline-none focus:border-emerald-500 shadow-2xs"
              />
            </div>
            <button
              onClick={() => setIsCreatingCustom(!isCreatingCustom)}
              className={`px-3 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 shrink-0 ${
                isCreatingCustom
                  ? 'bg-emerald-600 text-white'
                  : 'bg-emerald-50 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800/50 hover:bg-emerald-100'
              }`}
            >
              <Plus className="w-4 h-4" />
              <span>{isCreatingCustom ? 'К списку' : '+ Свое'}</span>
            </button>
          </div>

          {/* Muscle Category Tabs */}
          {!isCreatingCustom && (
            <div className="flex items-center gap-1 overflow-x-auto pb-1 scrollbar-none border-t border-slate-100 dark:border-zinc-800/60 pt-2">
              {CATEGORY_TABS.map(tab => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition flex items-center gap-1.5 ${
                    activeTab === tab.id
                      ? 'bg-slate-900 dark:bg-white text-white dark:text-slate-900 shadow-xs'
                      : 'bg-white dark:bg-zinc-900 text-slate-600 dark:text-zinc-400 border border-slate-200 dark:border-zinc-800 hover:bg-slate-100 dark:hover:bg-zinc-800'
                  }`}
                >
                  <span>{tab.label}</span>
                </button>
              ))}
            </div>
          )}

          {/* Equipment Filter Pills */}
          {!isCreatingCustom && (
            <div className="flex items-center gap-1.5 overflow-x-auto pb-0.5 scrollbar-none">
              {EQUIPMENT_TABS.map(tab => (
                <button
                  key={tab.id}
                  onClick={() => setSelectedEquipment(tab.id)}
                  className={`px-2.5 py-1 rounded-xl text-[11px] font-bold whitespace-nowrap transition flex items-center gap-1 ${
                    selectedEquipment === tab.id
                      ? 'bg-emerald-500 text-white shadow-xs'
                      : 'bg-white dark:bg-zinc-900 text-slate-600 dark:text-zinc-400 border border-slate-200 dark:border-zinc-800 hover:bg-slate-100 dark:hover:bg-zinc-800'
                  }`}
                >
                  <span>{tab.icon}</span>
                  <span>{tab.label}</span>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Modal Body */}
        <div className="p-3 sm:p-4 overflow-y-auto space-y-2.5 flex-1 min-h-[280px]">
          {isCreatingCustom ? (
            /* Custom Exercise Creation Form */
            <form onSubmit={handleSaveCustomExercise} className="bg-slate-50 dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800 rounded-2xl p-4 space-y-3 animate-fade-in text-xs sm:text-sm">
              <div className="flex items-center gap-2 text-emerald-600 font-bold border-b border-slate-200 dark:border-zinc-800 pb-2">
                <Sparkles className="w-4 h-4" />
                <span>Добавление собственного упражнения</span>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-500 dark:text-zinc-400 mb-1">
                  Название упражнения *
                </label>
                <input
                  type="text"
                  required
                  placeholder="Например: Жим в тренажере Hammer Strength"
                  value={customName}
                  onChange={e => setCustomName(e.target.value)}
                  className="w-full bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-700 rounded-xl px-3 py-2 text-xs sm:text-sm focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-500 dark:text-zinc-400 mb-1">
                    Группа мышц
                  </label>
                  <select
                    value={customCategory}
                    onChange={e => setCustomCategory(e.target.value as MuscleCategory)}
                    className="w-full bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-700 rounded-xl px-3 py-2 text-xs sm:text-sm focus:outline-none focus:border-emerald-500"
                  >
                    <option value="Chest">Грудь (Chest)</option>
                    <option value="Back">Спина (Back)</option>
                    <option value="Legs">Ноги (Legs)</option>
                    <option value="Shoulders">Плечи (Shoulders)</option>
                    <option value="Arms">Руки (Arms)</option>
                    <option value="Core">Кор / Пресс (Core)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-500 dark:text-zinc-400 mb-1">
                    Тип снаряда
                  </label>
                  <select
                    value={customEquipment}
                    onChange={e => setCustomEquipment(e.target.value as EquipmentType)}
                    className="w-full bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-700 rounded-xl px-3 py-2 text-xs sm:text-sm focus:outline-none focus:border-emerald-500"
                  >
                    <option value="barbell">Штанга 🏋️</option>
                    <option value="dumbbell">Гантели 🥫</option>
                    <option value="machine">Тренажер / Хаммер ⚙️</option>
                    <option value="cable">Блок / Кроссовер ⛓️</option>
                    <option value="bodyweight">Свой вес 🤸</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-2">
                <div>
                  <label className="block text-[11px] font-semibold text-slate-500 dark:text-zinc-400 mb-1">
                    Вес (кг)
                  </label>
                  <input
                    type="number"
                    step="0.5"
                    value={customWeight}
                    onChange={e => setCustomWeight(parseFloat(e.target.value) || 0)}
                    className="w-full bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-700 rounded-xl px-2 py-1.5 text-xs text-center"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-slate-500 dark:text-zinc-400 mb-1">
                    Мин повт.
                  </label>
                  <input
                    type="number"
                    value={customMinReps}
                    onChange={e => setCustomMinReps(parseInt(e.target.value) || 8)}
                    className="w-full bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-700 rounded-xl px-2 py-1.5 text-xs text-center"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-slate-500 dark:text-zinc-400 mb-1">
                    Макс повт.
                  </label>
                  <input
                    type="number"
                    value={customMaxReps}
                    onChange={e => setCustomMaxReps(parseInt(e.target.value) || 12)}
                    className="w-full bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-700 rounded-xl px-2 py-1.5 text-xs text-center"
                  />
                </div>
              </div>

              <button
                type="submit"
                className="w-full py-2.5 bg-emerald-500 hover:bg-emerald-400 text-white dark:text-black font-bold rounded-xl shadow-md transition flex items-center justify-center gap-1.5 mt-2"
              >
                <Check className="w-4 h-4" />
                <span>Создать и сразу выбрать это упражнение</span>
              </button>
            </form>
          ) : filteredExercises.length === 0 ? (
            /* Smart Zero-Result Fallback: NEVER a dead end! */
            <div className="text-center py-8 px-4 bg-slate-50 dark:bg-zinc-950 rounded-2xl border border-slate-200 dark:border-zinc-800 space-y-3">
              <div className="w-12 h-12 mx-auto rounded-full bg-amber-100 dark:bg-amber-950/60 flex items-center justify-center text-amber-600 dark:text-amber-400">
                <AlertCircle className="w-6 h-6" />
              </div>
              <h4 className="font-bold text-sm text-slate-800 dark:text-zinc-200">
                {selectedEquipment !== 'all' 
                  ? 'С выбранным снарядом упражнений не найдено'
                  : 'По вашему запросу ничего не найдено'}
              </h4>
              <p className="text-xs text-slate-500 dark:text-zinc-400 max-w-xs mx-auto">
                {selectedEquipment !== 'all'
                  ? 'Сбросьте фильтр снаряда, чтобы увидеть все доступные варианты в этой категории, либо добавьте своё упражнение.'
                  : 'Попробуйте изменить поисковый запрос или переключить группу мышц.'}
              </p>
              <div className="flex items-center justify-center gap-2 pt-2">
                {selectedEquipment !== 'all' && (
                  <button
                    onClick={() => setSelectedEquipment('all')}
                    className="px-4 py-2 bg-emerald-500 hover:bg-emerald-400 text-white font-bold text-xs rounded-xl transition shadow-xs"
                  >
                    Сбросить фильтр снаряда ⚡
                  </button>
                )}
                <button
                  onClick={() => setIsCreatingCustom(true)}
                  className="px-4 py-2 bg-slate-200 dark:bg-zinc-800 hover:bg-slate-300 text-slate-800 dark:text-zinc-200 font-bold text-xs rounded-xl transition"
                >
                  + Своё упражнение
                </button>
              </div>
            </div>
          ) : (
            /* Exercise Candidate Cards */
            filteredExercises.map(alt => {
              const badge = EQUIPMENT_BADGES[alt.equipment] || {
                label: alt.equipment,
                bg: 'bg-slate-100 dark:bg-zinc-800',
                text: 'text-slate-600 dark:text-zinc-400'
              };

              const isDirectAlt = directAltIds.has(alt.id);

              return (
                <div
                  key={alt.id}
                  onClick={() => onSelectAlternative(alt)}
                  className="p-3 sm:p-3.5 bg-slate-50 dark:bg-zinc-950/80 hover:bg-emerald-50/60 dark:hover:bg-emerald-950/30 border border-slate-200 dark:border-zinc-800 hover:border-emerald-400 dark:hover:border-emerald-600 rounded-2xl cursor-pointer transition flex items-center justify-between gap-3 group shadow-2xs"
                >
                  <div className="space-y-1 min-w-0 flex-1">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${badge.bg} ${badge.text}`}>
                        {badge.label}
                      </span>
                      {isDirectAlt && (
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800/60">
                          ⭐ Прямой аналог
                        </span>
                      )}
                      <span className="text-[11px] text-slate-500 dark:text-zinc-500 font-mono">
                        {alt.defaultSets}×{alt.minReps}-{alt.maxReps} повт.
                      </span>
                      <span className="text-[11px] font-mono text-emerald-600 dark:text-emerald-400 font-bold">
                        ~{alt.defaultWeight} кг
                      </span>
                    </div>

                    <h4 className="font-bold text-sm text-slate-900 dark:text-zinc-100 group-hover:text-emerald-700 dark:group-hover:text-emerald-400 transition truncate">
                      {alt.name}
                    </h4>

                    <p className="text-[11px] text-slate-500 dark:text-zinc-400 line-clamp-1">
                      {alt.technique.primaryMuscles}
                    </p>
                  </div>

                  <button className="px-3 py-1.5 bg-emerald-500 group-hover:bg-emerald-400 text-white font-bold text-xs rounded-xl shadow-xs transition shrink-0 flex items-center gap-1">
                    <span>Выбрать</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              );
            })
          )}
        </div>

        {/* Footer */}
        <div className="p-3 border-t border-slate-200 dark:border-zinc-800 bg-slate-50 dark:bg-zinc-950 flex justify-between items-center text-xs text-slate-500 shrink-0">
          <span>{filteredExercises.length} доступных вариантов замены</span>
          <button
            onClick={onClose}
            className="px-4 py-2 bg-slate-200 dark:bg-zinc-800 hover:bg-slate-300 dark:hover:bg-zinc-700 text-slate-700 dark:text-zinc-200 font-bold rounded-xl transition"
          >
            Закрыть
          </button>
        </div>

      </div>
    </div>
  );
};
