import React, { useState, useMemo } from 'react';
import { X, RefreshCw, Check, Dumbbell, ArrowRight, Search, Filter, Plus, AlertCircle, Sparkles } from 'lucide-react';
import type { Exercise, EquipmentType, MuscleCategory } from '../types/index.ts';
import { EXERCISE_CATALOG, CatalogExerciseItem } from '../data/exerciseCatalog';
import { storageService } from '../services/storageService';
import { useDialogA11y } from '../hooks/useDialogA11y';

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

type TabType = 'recommended' | 'all' | 'Chest' | 'Back' | 'Legs' | 'Shoulders' | 'Arms' | 'Core' | 'Cardio';

const CATEGORY_TABS: { id: TabType; label: string; icon?: string }[] = [
  { id: 'recommended', label: '⭐ Аналоги' },
  { id: 'all', label: '🔥 Все (44+)' },
  { id: 'Chest', label: 'Грудь' },
  { id: 'Back', label: 'Спина' },
  { id: 'Legs', label: 'Ноги' },
  { id: 'Shoulders', label: 'Плечи' },
  { id: 'Arms', label: 'Руки' },
  { id: 'Core', label: 'Кор / Пресс' },
  { id: 'Cardio', label: 'Кардио' }
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
  barbell: { label: 'Штанга', bg: 'bg-rose-500/10', text: 'text-rose-300' },
  dumbbell: { label: 'Гантели', bg: 'bg-sky-500/10', text: 'text-sky-300' },
  cable: { label: 'Блок / Кроссовер', bg: 'bg-violet-500/10', text: 'text-violet-300' },
  machine: { label: 'Тренажер / Хаммер', bg: 'bg-amber-500/10', text: 'text-amber-300' },
  smith: { label: 'Смит', bg: 'bg-indigo-500/10', text: 'text-indigo-300' },
  'fixed-barbell': { label: 'Цельная штанга', bg: 'bg-emerald-500/10', text: 'text-emerald-300' },
  bodyweight: { label: 'Свой вес', bg: 'bg-lime/10', text: 'text-lime' }
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
      animationType:
        customCategory === 'Chest' ? 'bench-press' :
        customCategory === 'Back' ? 'row' :
        customCategory === 'Legs' ? 'squat' :
        customCategory === 'Shoulders' ? 'overhead-press' :
        customCategory === 'Arms' ? 'bicep-curl' :
        customCategory === 'Cardio' ? 'cardio' :
        customCategory === 'Core' ? 'core' : 'squat',
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

  const { containerRef, dialogProps } = useDialogA11y({
    isOpen,
    onClose,
    titleId: 'exercise-swap-title'
  });

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2.5 sm:p-4 bg-black/80 backdrop-blur-sm animate-fade-in text-white">
      <div ref={containerRef} {...dialogProps} className="w-full max-w-xl md:max-w-lg surface-panel bg-ink-2 border border-white/10 rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[min(92dvh,calc(100dvh-1.5rem))]">
        
        {/* Header */}
        <div className="p-3.5 sm:p-4 border-b border-white/10 bg-ink-2 space-y-2.5 sm:space-y-3 shrink-0">
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2 min-w-0 flex-1">
              <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-lime/10 flex items-center justify-center text-lime shrink-0">
                <RefreshCw className="w-4 h-4 sm:w-5 sm:h-5 animate-spin-slow" />
              </div>
              <div className="min-w-0 flex-1">
                <h3 id="exercise-swap-title" className="font-bold text-sm sm:text-lg text-white truncate">Замена упражнения</h3>
                <span className="text-xs sm:text-xs text-muted block truncate">
                  Тренажер занят или отсутствует? Выберите замену:
                </span>
              </div>
            </div>
            <button 
              onClick={onClose}
              className="min-h-[44px] min-w-[44px] flex items-center justify-center text-muted hover:text-white rounded-xl hover:bg-white/5 active:scale-95 transition shrink-0"
              aria-label="Закрыть"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Current Exercise Banner */}
          <div className="px-3 py-1.5 sm:py-2 bg-lime/10 border border-white/10 rounded-2xl flex items-center justify-between text-xs gap-2">
            <span className="text-lime font-medium shrink-0">Заменяем:</span>
            <span className="font-bold text-white truncate text-right">
              {currentExercise.name}
            </span>
          </div>

          {/* Search bar & Custom Exercise Trigger */}
          <div className="flex gap-2">
            <div className="relative flex-1">
              <Search className="w-4 h-4 absolute left-3 top-2.5 text-muted" />
              <input
                type="text"
                placeholder="Поиск по названию (жим, тяга, штанга, грудь)..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="w-full bg-white/5 border border-white/10 rounded-xl pl-9 pr-4 py-2 text-xs sm:text-sm text-white focus:outline-none focus:border-lime shadow-2xs"
              />
            </div>
            <button
              onClick={() => setIsCreatingCustom(!isCreatingCustom)}
              className={`px-3 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 shrink-0 ${
                isCreatingCustom
                  ? 'btn-lime'
                  : 'bg-lime/10 text-lime border border-white/10 hover:bg-lime/20'
              }`}
            >
              <Plus className="w-4 h-4" />
              <span>{isCreatingCustom ? 'К списку' : '+ Свое'}</span>
            </button>
          </div>

          {/* Muscle Category Tabs */}
          {!isCreatingCustom && (
            <div className="flex items-center gap-1 overflow-x-auto pb-1 scrollbar-none border-t border-white/10 pt-2">
              {CATEGORY_TABS.map(tab => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition flex items-center gap-1.5 ${
                    activeTab === tab.id
                      ? 'btn-lime shadow-xs'
                      : 'bg-white/5 text-muted border border-white/10 hover:bg-white/10'
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
                  className={`px-2.5 py-1 rounded-xl text-xs font-bold whitespace-nowrap transition flex items-center gap-1 ${
                    selectedEquipment === tab.id
                      ? 'btn-lime shadow-xs'
                      : 'bg-white/5 text-muted border border-white/10 hover:bg-white/10'
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
            <form onSubmit={handleSaveCustomExercise} className="bg-ink-2 border border-white/10 rounded-2xl p-4 space-y-3 animate-fade-in text-xs sm:text-sm">
              <div className="flex items-center gap-2 text-lime font-bold border-b border-white/10 pb-2">
                <Sparkles className="w-4 h-4" />
                <span>Добавление собственного упражнения</span>
              </div>

              <div>
                <label className="block text-xs font-semibold text-muted mb-1">
                  Название упражнения *
                </label>
                <input
                  type="text"
                  required
                  placeholder="Например: Жим в тренажере Hammer Strength"
                  value={customName}
                  onChange={e => setCustomName(e.target.value)}
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-xs sm:text-sm text-white focus:outline-none focus:border-lime"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-muted mb-1">
                    Группа мышц
                  </label>
                  <select
                    value={customCategory}
                    onChange={e => setCustomCategory(e.target.value as MuscleCategory)}
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-xs sm:text-sm text-white focus:outline-none focus:border-lime"
                  >
                    <option value="Chest">Грудь (Chest)</option>
                    <option value="Back">Спина (Back)</option>
                    <option value="Legs">Ноги (Legs)</option>
                    <option value="Shoulders">Плечи (Shoulders)</option>
                    <option value="Arms">Руки (Arms)</option>
                    <option value="Core">Кор / Пресс (Core)</option>
                    <option value="Cardio">Кардио (Cardio)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-muted mb-1">
                    Тип снаряда
                  </label>
                  <select
                    value={customEquipment}
                    onChange={e => setCustomEquipment(e.target.value as EquipmentType)}
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-xs sm:text-sm text-white focus:outline-none focus:border-lime"
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
                  <label className="block text-xs font-semibold text-muted mb-1">
                    Вес (кг)
                  </label>
                  <input
                    type="number"
                    step="0.5"
                    value={customWeight}
                    onChange={e => setCustomWeight(parseFloat(e.target.value) || 0)}
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-2 py-1.5 text-xs text-center text-white focus:outline-none focus:border-lime"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-muted mb-1">
                    Мин повт.
                  </label>
                  <input
                    type="number"
                    value={customMinReps}
                    onChange={e => setCustomMinReps(parseInt(e.target.value) || 8)}
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-2 py-1.5 text-xs text-center text-white focus:outline-none focus:border-lime"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-muted mb-1">
                    Макс повт.
                  </label>
                  <input
                    type="number"
                    value={customMaxReps}
                    onChange={e => setCustomMaxReps(parseInt(e.target.value) || 12)}
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-2 py-1.5 text-xs text-center text-white focus:outline-none focus:border-lime"
                  />
                </div>
              </div>

              <button
                type="submit"
                className="w-full py-2.5 btn-lime font-bold rounded-xl shadow-md transition flex items-center justify-center gap-1.5 mt-2"
              >
                <Check className="w-4 h-4" />
                <span>Создать и сразу выбрать это упражнение</span>
              </button>
            </form>
          ) : filteredExercises.length === 0 ? (
            /* Smart Zero-Result Fallback: NEVER a dead end! */
            <div className="text-center py-8 px-4 bg-ink-2 rounded-2xl border border-white/10 space-y-3">
              <div className="w-12 h-12 mx-auto rounded-full bg-amber-500/10 flex items-center justify-center text-amber-300">
                <AlertCircle className="w-6 h-6" />
              </div>
              <h4 className="font-bold text-sm text-white">
                {selectedEquipment !== 'all' 
                  ? 'С выбранным снарядом упражнений не найдено'
                  : 'По вашему запросу ничего не найдено'}
              </h4>
              <p className="text-xs text-muted max-w-xs mx-auto">
                {selectedEquipment !== 'all'
                  ? 'Сбросьте фильтр снаряда, чтобы увидеть все доступные варианты в этой категории, либо добавьте своё упражнение.'
                  : 'Попробуйте изменить поисковый запрос или переключить группу мышц.'}
              </p>
              <div className="flex items-center justify-center gap-2 pt-2">
                {selectedEquipment !== 'all' && (
                  <button
                    onClick={() => setSelectedEquipment('all')}
                    className="px-4 py-2 btn-lime font-bold text-xs rounded-xl transition shadow-xs"
                  >
                    Сбросить фильтр снаряда ⚡
                  </button>
                )}
                <button
                  onClick={() => setIsCreatingCustom(true)}
                  className="px-4 py-2 bg-white/5 hover:bg-white/10 text-white font-bold text-xs rounded-xl transition border border-white/10"
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
                bg: 'bg-white/5',
                text: 'text-muted'
              };

              const isDirectAlt = directAltIds.has(alt.id);

              return (
                <div
                  key={alt.id}
                  onClick={() => onSelectAlternative(alt)}
                  className="p-3 sm:p-3.5 bg-white/5 hover:bg-lime/10 border border-white/10 hover:border-lime rounded-2xl cursor-pointer transition flex items-center justify-between gap-3 group shadow-2xs"
                >
                  <div className="space-y-1 min-w-0 flex-1">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${badge.bg} ${badge.text}`}>
                        {badge.label}
                      </span>
                      {isDirectAlt && (
                        <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-lime/10 text-lime border border-white/10">
                          ⭐ Прямой аналог
                        </span>
                      )}
                      <span className="text-xs text-muted font-mono">
                        {alt.defaultSets}×{alt.minReps}-{alt.maxReps} повт.
                      </span>
                      <span className="text-xs font-mono text-lime font-bold">
                        ~{alt.defaultWeight} кг
                      </span>
                    </div>

                    <h4 className="font-bold text-sm text-white group-hover:text-lime transition truncate">
                      {alt.name}
                    </h4>

                    <p className="text-xs text-muted line-clamp-1">
                      {alt.technique.primaryMuscles}
                    </p>
                  </div>

                  <button className="px-3 py-1.5 btn-lime font-bold text-xs rounded-xl shadow-xs transition shrink-0 flex items-center gap-1">
                    <span>Выбрать</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              );
            })
          )}
        </div>

        {/* Footer */}
        <div className="p-3 border-t border-white/10 bg-ink-2 flex justify-between items-center text-xs text-muted shrink-0">
          <span>{filteredExercises.length} доступных вариантов замены</span>
          <button
            onClick={onClose}
            className="px-4 py-2 bg-white/5 hover:bg-white/10 text-white font-bold rounded-xl transition border border-white/10"
          >
            Закрыть
          </button>
        </div>

      </div>
    </div>
  );
};
