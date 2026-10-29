import React, { useState } from 'react';
import { 
  Play, 
  Dumbbell, 
  ChevronRight, 
  Flame, 
  TrendingUp, 
  Plus, 
  Settings2, 
  Zap,
  MoreVertical,
  Calendar,
  Layers,
  Sparkles,
  RefreshCw,
  Repeat
} from 'lucide-react';
import { Exercise, WorkoutTemplate } from '../types';
import { evaluateDoubleProgression } from '../services/progressionEngine';
import { ExerciseProgressionModal } from './ExerciseProgressionModal';
import { ExerciseTechniqueModal } from './ExerciseTechniqueModal';
import { ExerciseSwapModal } from './ExerciseSwapModal';
import { CatalogExerciseItem } from '../data/exerciseCatalog';

interface WorkoutTemplateListProps {
  templates: WorkoutTemplate[];
  currentWeek: 'A' | 'B';
  onChangeWeek: (week: 'A' | 'B') => void;
  onStartWorkout: (template: WorkoutTemplate) => void;
  onUpdateTemplate: (template: WorkoutTemplate) => void;
  onCreateTemplate: (template: WorkoutTemplate) => void;
}

export const WorkoutTemplateList: React.FC<WorkoutTemplateListProps> = ({
  templates,
  currentWeek,
  onChangeWeek,
  onStartWorkout,
  onUpdateTemplate,
  onCreateTemplate
}) => {
  const [selectedExercise, setSelectedExercise] = useState<{ exercise: Exercise; templateId: string } | null>(null);
  const [viewingTechniqueEx, setViewingTechniqueEx] = useState<Exercise | null>(null);
  const [swappingEx, setSwappingEx] = useState<{ exercise: Exercise; templateId: string } | null>(null);

  const [isCreatingNew, setIsCreatingNew] = useState(false);
  const [newProgramName, setNewProgramName] = useState('');
  const [newProgramDesc, setNewProgramDesc] = useState('');

  // Filter templates matching current week or general
  const filteredTemplates = templates.filter(
    t => !t.weekVariant || t.weekVariant === currentWeek || t.weekVariant === 'all'
  );

  const handleUpdateExercise = (updatedEx: Exercise) => {
    if (!selectedExercise) return;
    const template = templates.find(t => t.id === selectedExercise.templateId);
    if (!template) return;

    const updatedTemplate = {
      ...template,
      exercises: template.exercises.map(e => e.id === updatedEx.id ? updatedEx : e)
    };
    onUpdateTemplate(updatedTemplate);
    setSelectedExercise(null);
  };

  const handleSwapExerciseInTemplate = (newCatalogEx: CatalogExerciseItem) => {
    if (!swappingEx) return;
    const template = templates.find(t => t.id === swappingEx.templateId);
    if (!template) return;

    const updatedExercise: Exercise = {
      id: newCatalogEx.id,
      name: newCatalogEx.name,
      category: newCatalogEx.category,
      equipment: newCatalogEx.equipment,
      animationType: newCatalogEx.animationType,
      technique: newCatalogEx.technique,
      alternatives: newCatalogEx.alternatives,
      targetSets: newCatalogEx.defaultSets,
      minReps: newCatalogEx.minReps,
      maxReps: newCatalogEx.maxReps,
      weightStep: newCatalogEx.weightStep,
      currentWeight: newCatalogEx.defaultWeight,
      restSeconds: newCatalogEx.restSeconds,
      history: []
    };

    const updatedTemplate = {
      ...template,
      exercises: template.exercises.map(e => e.id === swappingEx.exercise.id ? updatedExercise : e)
    };

    onUpdateTemplate(updatedTemplate);
    setSwappingEx(null);
  };

  const handleCreateProgram = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newProgramName.trim()) return;

    const newTemplate: WorkoutTemplate = {
      id: 'template-' + Date.now(),
      name: newProgramName.trim(),
      description: newProgramDesc.trim() || 'Пользовательская программа тренировок',
      weekVariant: currentWeek,
      exercises: [
        {
          id: 'ex-' + Date.now(),
          name: 'Базовое упражнение',
          category: 'Chest',
          equipment: 'barbell',
          animationType: 'bench-press',
          targetSets: 3,
          minReps: 8,
          maxReps: 12,
          weightStep: 2.5,
          currentWeight: 50,
          restSeconds: 90,
          history: []
        }
      ]
    };

    onCreateTemplate(newTemplate);
    setIsCreatingNew(false);
    setNewProgramName('');
    setNewProgramDesc('');
  };

  return (
    <div className="max-w-2xl mx-auto p-3 sm:p-4 pb-28 space-y-6 text-slate-900 dark:text-zinc-100 transition-colors duration-200">
      
      {/* Hero Welcome Card */}
      <div className="bg-gradient-to-br from-emerald-600 via-teal-700 to-emerald-800 dark:from-zinc-900 dark:via-zinc-900 dark:to-emerald-950/40 border border-emerald-500/30 dark:border-zinc-800 rounded-3xl p-5 sm:p-6 shadow-xl text-white relative overflow-hidden">
        <div className="relative z-10">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-white/20 dark:bg-emerald-500/10 backdrop-blur border border-white/30 dark:border-emerald-500/30 rounded-full text-xs font-semibold text-white dark:text-emerald-400 mb-3">
            <Zap className="w-3.5 h-3.5" /> Умная Двойная Прогрессия + Ротация
          </div>
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight">
            IronForge PWA
          </h1>
          <p className="text-emerald-100 dark:text-zinc-400 text-xs sm:text-sm mt-1.5 max-w-md leading-relaxed">
            Анимированная техника упражнений, еженедельная ротация программ и мгновенная замена занятых тренажеров.
          </p>
        </div>
      </div>

      {/* Weekly Rotation Switcher Tabs */}
      <div className="bg-white dark:bg-zinc-900 p-2 rounded-2xl border border-slate-200 dark:border-zinc-800 shadow-sm flex items-center gap-2">
        <button
          onClick={() => onChangeWeek('A')}
          className={`flex-1 py-2.5 px-3 rounded-xl text-xs sm:text-sm font-bold flex items-center justify-center gap-2 transition ${
            currentWeek === 'A'
              ? 'bg-emerald-500 text-white shadow-md shadow-emerald-500/20'
              : 'text-slate-600 dark:text-zinc-400 hover:bg-slate-100 dark:hover:bg-zinc-800'
          }`}
        >
          <Repeat className="w-4 h-4" />
          <span>Неделя 1 (Вариант А)</span>
        </button>

        <button
          onClick={() => onChangeWeek('B')}
          className={`flex-1 py-2.5 px-3 rounded-xl text-xs sm:text-sm font-bold flex items-center justify-center gap-2 transition ${
            currentWeek === 'B'
              ? 'bg-emerald-500 text-white shadow-md shadow-emerald-500/20'
              : 'text-slate-600 dark:text-zinc-400 hover:bg-slate-100 dark:hover:bg-zinc-800'
          }`}
        >
          <Repeat className="w-4 h-4" />
          <span>Неделя 2 (Вариант Б)</span>
        </button>
      </div>

      {/* Header and Add button */}
      <div className="flex items-center justify-between pt-1">
        <div>
          <div className="flex items-center gap-2">
            <Layers className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
            <h2 className="font-bold text-lg text-slate-900 dark:text-zinc-100">
              Программы {currentWeek === 'A' ? 'Недели 1' : 'Недели 2'}
            </h2>
          </div>
          <span className="text-xs text-slate-500 dark:text-zinc-400">
            Упражнения автоматически чередуются для разнообразия стимула
          </span>
        </div>

        <button
          onClick={() => setIsCreatingNew(true)}
          className="text-xs font-semibold text-emerald-700 dark:text-emerald-400 bg-emerald-100 dark:bg-emerald-950/50 hover:bg-emerald-200 dark:hover:bg-emerald-950/80 border border-emerald-300 dark:border-emerald-800/60 px-3 py-1.5 rounded-xl flex items-center gap-1 transition shadow-xs"
        >
          <Plus className="w-3.5 h-3.5" /> Добавить
        </button>
      </div>

      {/* Program Templates List */}
      <div className="space-y-4">
        {filteredTemplates.map(template => (
          <div
            key={template.id}
            className="bg-white dark:bg-zinc-900/90 border border-slate-200 dark:border-zinc-800 rounded-3xl p-4 sm:p-5 shadow-sm dark:shadow-xl transition-all"
          >
            {/* Template Header */}
            <div className="flex items-start justify-between gap-3 mb-3">
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="font-bold text-base sm:text-lg text-slate-900 dark:text-white">
                    {template.name}
                  </h3>
                  {template.weekVariant && (
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-100 dark:bg-zinc-800 text-slate-600 dark:text-zinc-400 border border-slate-200 dark:border-zinc-700 font-mono">
                      Нед. {template.weekVariant}
                    </span>
                  )}
                </div>
                <p className="text-xs text-slate-500 dark:text-zinc-400 mt-0.5">{template.description}</p>
              </div>

              <button
                onClick={() => onStartWorkout(template)}
                className="px-4 py-2 bg-emerald-500 hover:bg-emerald-400 active:scale-95 text-white dark:text-black font-bold text-xs sm:text-sm rounded-xl shadow-lg shadow-emerald-500/20 flex items-center gap-1.5 transition shrink-0"
              >
                <Play className="w-4 h-4 fill-current" /> Начать
              </button>
            </div>

            {/* Exercises mini preview list */}
            <div className="space-y-2 mt-4 pt-3 border-t border-slate-100 dark:border-zinc-800/80">
              {template.exercises.map(exercise => {
                const recommendation = evaluateDoubleProgression(
                  exercise.targetSets,
                  exercise.minReps,
                  exercise.maxReps,
                  exercise.weightStep,
                  exercise.currentWeight,
                  exercise.history
                );

                return (
                  <div
                    key={exercise.id}
                    className="flex items-center justify-between p-2.5 bg-slate-50 dark:bg-zinc-950/60 hover:bg-slate-100 dark:hover:bg-zinc-950 border border-slate-200 dark:border-zinc-800/60 rounded-2xl transition"
                  >
                    <div 
                      onClick={() => setSelectedExercise({ exercise, templateId: template.id })}
                      className="flex items-center gap-3 cursor-pointer flex-1"
                    >
                      <div className="w-2 h-2 rounded-full bg-emerald-500 transition" />
                      <div>
                        <div className="font-semibold text-xs sm:text-sm text-slate-800 dark:text-zinc-200 hover:text-emerald-600 dark:hover:text-emerald-400 transition">
                          {exercise.name}
                        </div>
                        <div className="text-[11px] text-slate-500 dark:text-zinc-500 font-mono">
                          {exercise.targetSets}×{exercise.minReps}-{exercise.maxReps} повт. • {exercise.currentWeight} кг
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-1.5">
                      {/* Technique Animation Trigger */}
                      <button
                        onClick={() => setViewingTechniqueEx(exercise)}
                        title="Посмотреть анимацию техники"
                        className="p-1.5 text-slate-500 dark:text-zinc-400 hover:text-emerald-600 dark:hover:text-emerald-400 bg-white dark:bg-zinc-800 rounded-lg border border-slate-200 dark:border-zinc-700 shadow-2xs hover:scale-105 transition"
                      >
                        <Sparkles className="w-3.5 h-3.5" />
                      </button>

                      {/* Swap Alternative Trigger */}
                      <button
                        onClick={() => setSwappingEx({ exercise, templateId: template.id })}
                        title="Заменить (тренажер занят)"
                        className="p-1.5 text-slate-500 dark:text-zinc-400 hover:text-blue-600 dark:hover:text-blue-400 bg-white dark:bg-zinc-800 rounded-lg border border-slate-200 dark:border-zinc-700 shadow-2xs hover:scale-105 transition"
                      >
                        <RefreshCw className="w-3.5 h-3.5" />
                      </button>

                      <span className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded-full border ${
                        recommendation.badgeColor === 'emerald'
                          ? 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800/50'
                          : recommendation.badgeColor === 'amber'
                          ? 'bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-400 border-amber-200 dark:border-amber-800/50'
                          : 'bg-slate-100 dark:bg-zinc-800/60 text-slate-600 dark:text-zinc-400 border-slate-200 dark:border-zinc-700/50'
                      }`}>
                        {recommendation.badgeText}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>

          </div>
        ))}
      </div>

      {/* Modal: Exercise Detail & Edit */}
      {selectedExercise && (
        <ExerciseProgressionModal
          exercise={selectedExercise.exercise}
          isOpen={true}
          onClose={() => setSelectedExercise(null)}
          onUpdateExercise={handleUpdateExercise}
        />
      )}

      {/* Modal: Exercise Technique Animation Guide */}
      {viewingTechniqueEx && (
        <ExerciseTechniqueModal
          exerciseName={viewingTechniqueEx.name}
          category={viewingTechniqueEx.category}
          equipment={viewingTechniqueEx.equipment}
          animationType={viewingTechniqueEx.animationType || 'bench-press'}
          technique={viewingTechniqueEx.technique}
          isOpen={true}
          onClose={() => setViewingTechniqueEx(null)}
        />
      )}

      {/* Modal: Swap Exercise */}
      {swappingEx && (
        <ExerciseSwapModal
          currentExercise={{
            id: swappingEx.exercise.id,
            name: swappingEx.exercise.name,
            category: swappingEx.exercise.category,
            equipment: swappingEx.exercise.equipment,
            alternatives: swappingEx.exercise.alternatives
          }}
          isOpen={true}
          onClose={() => setSwappingEx(null)}
          onSelectAlternative={handleSwapExerciseInTemplate}
        />
      )}

      {/* Modal: Create Program */}
      {isCreatingNew && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="w-full max-w-md bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-700 rounded-3xl p-6 shadow-2xl text-slate-900 dark:text-white">
            <h3 className="font-bold text-lg mb-4">Создать новую программу</h3>
            <form onSubmit={handleCreateProgram} className="space-y-4">
              <div>
                <label className="block text-xs uppercase tracking-wider text-slate-500 dark:text-zinc-400 font-semibold mb-1">
                  Название
                </label>
                <input
                  type="text"
                  required
                  placeholder="Например: Спина + Бицепс (Вариант Б)"
                  value={newProgramName}
                  onChange={e => setNewProgramName(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-zinc-950 border border-slate-200 dark:border-zinc-700 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="block text-xs uppercase tracking-wider text-slate-500 dark:text-zinc-400 font-semibold mb-1">
                  Описание
                </label>
                <textarea
                  placeholder="Краткое описание акцентов..."
                  value={newProgramDesc}
                  onChange={e => setNewProgramDesc(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-zinc-950 border border-slate-200 dark:border-zinc-700 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-emerald-500"
                  rows={3}
                />
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsCreatingNew(false)}
                  className="flex-1 py-2.5 bg-slate-100 dark:bg-zinc-800 hover:bg-slate-200 text-slate-700 dark:text-zinc-300 text-sm font-semibold rounded-xl transition"
                >
                  Отмена
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 bg-emerald-500 hover:bg-emerald-400 text-white font-bold rounded-xl transition"
                >
                  Создать
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
