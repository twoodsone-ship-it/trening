import React, { Suspense, lazy, useState } from 'react';
import { 
  Play, 
  Plus, 
  Zap,
  Layers,
  Sparkles,
  RefreshCw,
  Repeat
} from 'lucide-react';
import { CompletedWorkout, Exercise, WorkoutTemplate, ReadinessLevel } from '../types';
import { evaluateDoubleProgression } from '../services/progressionEngine';
import { ReadinessCheckinModal } from './ReadinessCheckinModal';
import { WeeklyPlanCard } from './WeeklyPlanCard';
import { CatalogExerciseItem } from '../data/exerciseCatalog';
import { applyDeloadToTemplate } from '../utils/deload';
import { linkAsSuperset } from '../utils/superset';
import { cn } from '../utils/cn';

const ExerciseProgressionModal = lazy(() =>
  import('./ExerciseProgressionModal').then(m => ({ default: m.ExerciseProgressionModal }))
);
const ExerciseTechniqueModal = lazy(() =>
  import('./ExerciseTechniqueModal').then(m => ({ default: m.ExerciseTechniqueModal }))
);
const ExerciseSwapModal = lazy(() =>
  import('./ExerciseSwapModal').then(m => ({ default: m.ExerciseSwapModal }))
);

interface WorkoutTemplateListProps {
  templates: WorkoutTemplate[];
  history: CompletedWorkout[];
  currentWeek: 'A' | 'B';
  onChangeWeek: (week: 'A' | 'B') => void;
  onStartWorkout: (template: WorkoutTemplate, readiness: ReadinessLevel) => void;
  onUpdateTemplate: (template: WorkoutTemplate) => void;
  onCreateTemplate: (template: WorkoutTemplate) => void;
}

export const WorkoutTemplateList: React.FC<WorkoutTemplateListProps> = ({
  templates,
  history,
  currentWeek,
  onChangeWeek,
  onStartWorkout,
  onUpdateTemplate,
  onCreateTemplate
}) => {
  const [selectedExercise, setSelectedExercise] = useState<{ exercise: Exercise; templateId: string } | null>(null);
  const [viewingTechniqueEx, setViewingTechniqueEx] = useState<{ exercise: Exercise; templateId: string } | null>(null);
  const [swappingEx, setSwappingEx] = useState<{ exercise: Exercise; templateId: string } | null>(null);
  const [checkinTemplate, setCheckinTemplate] = useState<WorkoutTemplate | null>(null);

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
      gifUrl: newCatalogEx.gifUrl,
      technique: newCatalogEx.technique,
      alternatives: newCatalogEx.alternatives,
      weekVariant: swappingEx.exercise.weekVariant,
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
    <div className="max-w-2xl mx-auto p-3 sm:p-4 pb-[calc(7rem+env(safe-area-inset-bottom))] space-y-4 sm:space-y-6 text-white animate-fade-in">
      
      {/* Hero Welcome Card */}
      <div className="surface-panel p-4 sm:p-6 border-lime/20 relative overflow-hidden">
        <div className="relative z-10">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-lime/10 border border-lime/30 rounded-full text-xs font-semibold text-lime mb-2.5">
            <Zap className="w-3.5 h-3.5 shrink-0" /> <span className="truncate">Умная Прогрессия + Ротация</span>
          </div>
          <p className="text-lime text-xs font-bold tracking-[0.28em] uppercase">IronForge</p>
          <h1 className="text-xl sm:text-3xl font-extrabold tracking-tight text-white mt-1">
            IronForge PWA
          </h1>
          <p className="text-muted text-xs sm:text-sm mt-1 max-w-md leading-relaxed">
            Анимированная 3D-техника, ротация программ и мгновенная замена занятых тренажеров.
          </p>
        </div>
      </div>

      <WeeklyPlanCard
        templates={templates}
        history={history}
        currentWeek={currentWeek}
        onStartSuggested={(t) => setCheckinTemplate(t)}
      />

      {/* Weekly Rotation Switcher Tabs */}
      <div className="surface-panel p-1.5 sm:p-2 flex items-center gap-1.5 sm:gap-2">
        <button
          onClick={() => onChangeWeek('A')}
          className={cn(
            'flex-1 py-2 sm:py-2.5 px-2 sm:px-3 rounded-xl text-xs sm:text-sm font-bold flex items-center justify-center gap-1.5 transition active:scale-98',
            currentWeek === 'A'
              ? 'btn-lime'
              : 'text-muted hover:bg-white/5 hover:text-white'
          )}
        >
          <Repeat className="w-3.5 h-3.5 sm:w-4 sm:h-4 shrink-0" />
          <span className="truncate">Неделя 1 (А)</span>
        </button>

        <button
          onClick={() => onChangeWeek('B')}
          className={cn(
            'flex-1 py-2 sm:py-2.5 px-2 sm:px-3 rounded-xl text-xs sm:text-sm font-bold flex items-center justify-center gap-1.5 transition active:scale-98',
            currentWeek === 'B'
              ? 'btn-lime'
              : 'text-muted hover:bg-white/5 hover:text-white'
          )}
        >
          <Repeat className="w-3.5 h-3.5 sm:w-4 sm:h-4 shrink-0" />
          <span className="truncate">Неделя 2 (Б)</span>
        </button>
      </div>

      {/* Header and Add button */}
      <div className="flex items-center justify-between pt-1">
        <div>
          <div className="flex items-center gap-2">
            <Layers className="w-5 h-5 text-lime" />
            <h2 className="font-bold text-lg text-white">
              Программы {currentWeek === 'A' ? 'Недели 1' : 'Недели 2'}
            </h2>
          </div>
          <span className="text-xs text-muted">
            Упражнения автоматически чередуются для разнообразия стимула
          </span>
        </div>

        <button
          onClick={() => setIsCreatingNew(true)}
          className="text-xs font-semibold text-lime bg-lime/10 hover:bg-lime/15 border border-lime/30 px-3 py-1.5 rounded-xl flex items-center gap-1 transition"
        >
          <Plus className="w-3.5 h-3.5" /> Добавить
        </button>
      </div>

      {/* Program Templates List */}
      <div className="space-y-4">
        {filteredTemplates.map(template => (
          <div
            key={template.id}
            className="surface-panel p-4 sm:p-5 transition-all"
          >
            {/* Template Header */}
            <div className="flex items-start justify-between gap-3 mb-3">
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="font-bold text-base sm:text-lg text-white">
                    {template.name}
                  </h3>
                  {template.weekVariant && (
                    <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-white/[0.06] text-muted border border-white/10 font-mono">
                      Нед. {template.weekVariant}
                    </span>
                  )}
                </div>
                <p className="text-xs text-muted mt-0.5">{template.description}</p>
              </div>

              <div className="flex flex-col gap-1.5 shrink-0">
                <button
                  onClick={() => setCheckinTemplate(template)}
                  className="px-4 py-2 btn-lime active:scale-95 text-xs sm:text-sm rounded-xl flex items-center gap-1.5 transition min-h-[44px]"
                >
                  <Play className="w-4 h-4 fill-current" /> Начать
                </button>
                <button
                  type="button"
                  title="Делоад −10% ко всем весам"
                  onClick={() => {
                    if (window.confirm(`Применить делоад −10% ко всем весам в «${template.name}»?`)) {
                      onUpdateTemplate(applyDeloadToTemplate(template, 0.1));
                    }
                  }}
                  className="px-3 py-1.5 text-xs font-bold uppercase tracking-wide rounded-xl border border-amber-500/40 text-amber-400 bg-amber-500/10 hover:bg-amber-500/20 transition"
                >
                  Делоад −10%
                </button>
              </div>
            </div>

            {/* Exercises mini preview list */}
            <div className="space-y-2 mt-4 pt-3 border-t border-white/10">
              {template.exercises.map((exercise, exIdx) => {
                const recommendation = evaluateDoubleProgression(
                  exercise.targetSets,
                  exercise.minReps,
                  exercise.maxReps,
                  exercise.weightStep,
                  exercise.currentWeight,
                  exercise.history
                );
                const next = template.exercises[exIdx + 1];
                const linked = !!(exercise.supersetGroupId && next?.supersetGroupId === exercise.supersetGroupId);

                return (
                  <div key={exercise.id} className="space-y-1">
                  <div
                    className={cn(
                      'flex items-center justify-between gap-2 p-2.5 bg-white/[0.03] hover:bg-white/[0.06] border rounded-2xl transition',
                      exercise.supersetGroupId
                        ? 'border-sky-400/40'
                        : 'border-white/10'
                    )}
                  >
                    <div 
                      onClick={() => setSelectedExercise({ exercise, templateId: template.id })}
                      className="flex items-center gap-2.5 cursor-pointer min-w-0 flex-1"
                    >
                      <div className="w-2 h-2 rounded-full bg-lime shrink-0" />
                      <div className="min-w-0 flex-1">
                        <div className="font-semibold text-xs sm:text-sm text-white hover:text-lime transition truncate">
                          {exercise.name}
                        </div>
                        <div className="text-xs text-muted font-mono truncate">
                          {exercise.targetSets}×{exercise.minReps}-{exercise.maxReps} повт. • {exercise.currentWeight} кг
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-1.5 shrink-0">
                      {/* Technique Animation Trigger */}
                      <button
                        onClick={() => setViewingTechniqueEx({ exercise, templateId: template.id })}
                        title="Посмотреть анимацию техники"
                        className="p-1.5 text-muted hover:text-lime bg-white/[0.04] rounded-lg border border-white/10 hover:scale-105 active:scale-95 transition"
                      >
                        <Sparkles className="w-3.5 h-3.5" />
                      </button>

                      {/* Swap Alternative Trigger */}
                      <button
                        onClick={() => setSwappingEx({ exercise, templateId: template.id })}
                        title="Заменить (тренажер занят)"
                        className="p-1.5 text-muted hover:text-sky-400 bg-white/[0.04] rounded-lg border border-white/10 hover:scale-105 active:scale-95 transition"
                      >
                        <RefreshCw className="w-3.5 h-3.5" />
                      </button>

                      <span className={cn(
                        'text-xs font-mono font-bold px-2 py-0.5 rounded-full border whitespace-nowrap',
                        recommendation.badgeColor === 'emerald'
                          ? 'bg-lime/10 text-lime border-lime/30'
                          : recommendation.badgeColor === 'amber'
                          ? 'bg-amber-500/10 text-amber-400 border-amber-500/30'
                          : 'bg-white/[0.06] text-muted border-white/10'
                      )}>
                        {recommendation.badgeText}
                      </span>
                    </div>
                  </div>
                  {next && (
                    <button
                      type="button"
                      onClick={() => {
                        if (linked) {
                          onUpdateTemplate({
                            ...template,
                            exercises: template.exercises.map(e =>
                              e.supersetGroupId === exercise.supersetGroupId
                                ? { ...e, supersetGroupId: undefined }
                                : e
                            )
                          });
                        } else {
                          onUpdateTemplate({
                            ...template,
                            exercises: linkAsSuperset(template.exercises, [exIdx, exIdx + 1])
                          });
                        }
                      }}
                      className={cn(
                        'w-full text-xs font-semibold py-1 rounded-lg transition',
                        linked
                          ? 'text-sky-400 bg-sky-500/10'
                          : 'text-muted hover:text-sky-400'
                      )}
                    >
                      {linked ? '↔ Суперсет' : '＋ Связать суперсет'}
                    </button>
                  )}
                  </div>
                );
              })}
            </div>

          </div>
        ))}
      </div>

      <Suspense fallback={null}>
        {selectedExercise && (
          <ExerciseProgressionModal
            exercise={selectedExercise.exercise}
            isOpen={true}
            onClose={() => setSelectedExercise(null)}
            onUpdateExercise={handleUpdateExercise}
          />
        )}

        {viewingTechniqueEx && (
          <ExerciseTechniqueModal
            exerciseId={viewingTechniqueEx.exercise.id}
            exerciseName={viewingTechniqueEx.exercise.name}
            category={viewingTechniqueEx.exercise.category}
            equipment={viewingTechniqueEx.exercise.equipment}
            animationType={viewingTechniqueEx.exercise.animationType || 'bench-press'}
            gifUrl={viewingTechniqueEx.exercise.gifUrl}
            technique={viewingTechniqueEx.exercise.technique}
            isOpen={true}
            onClose={() => setViewingTechniqueEx(null)}
            onOpenSwapModal={() => {
              setSwappingEx({
                exercise: viewingTechniqueEx.exercise,
                templateId: viewingTechniqueEx.templateId
              });
            }}
          />
        )}

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
      </Suspense>

      {/* Modal: Create Program */}
      {isCreatingNew && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm">
          <div className="w-full max-w-md surface-panel p-6 border-lime/20 text-white">
            <h3 className="font-bold text-lg mb-4">Создать новую программу</h3>
            <form onSubmit={handleCreateProgram} className="space-y-4">
              <div>
                <label className="block text-xs uppercase tracking-wider text-muted font-semibold mb-1">
                  Название
                </label>
                <input
                  type="text"
                  required
                  placeholder="Например: Спина + Бицепс (Вариант Б)"
                  value={newProgramName}
                  onChange={e => setNewProgramName(e.target.value)}
                  className="w-full bg-white/[0.04] border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white placeholder:text-muted focus:outline-none focus:border-lime/50"
                />
              </div>

              <div>
                <label className="block text-xs uppercase tracking-wider text-muted font-semibold mb-1">
                  Описание
                </label>
                <textarea
                  placeholder="Краткое описание акцентов..."
                  value={newProgramDesc}
                  onChange={e => setNewProgramDesc(e.target.value)}
                  className="w-full bg-white/[0.04] border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white placeholder:text-muted focus:outline-none focus:border-lime/50"
                  rows={3}
                />
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsCreatingNew(false)}
                  className="flex-1 py-2.5 bg-white/[0.06] hover:bg-white/10 text-muted text-sm font-semibold rounded-xl border border-white/10 transition"
                >
                  Отмена
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 btn-lime rounded-xl transition"
                >
                  Создать
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Readiness Check-in Modal (Auto-Regulation) */}
      <ReadinessCheckinModal
        template={checkinTemplate}
        isOpen={!!checkinTemplate}
        onClose={() => setCheckinTemplate(null)}
        onConfirm={(readiness) => {
          if (checkinTemplate) {
            onStartWorkout(checkinTemplate, readiness);
            setCheckinTemplate(null);
          }
        }}
      />

    </div>
  );
};
