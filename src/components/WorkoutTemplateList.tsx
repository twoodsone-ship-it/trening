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
  Layers
} from 'lucide-react';
import { Exercise, WorkoutTemplate } from '../types';
import { evaluateDoubleProgression } from '../services/progressionEngine';
import { ExerciseProgressionModal } from './ExerciseProgressionModal';

interface WorkoutTemplateListProps {
  templates: WorkoutTemplate[];
  onStartWorkout: (template: WorkoutTemplate) => void;
  onUpdateTemplate: (template: WorkoutTemplate) => void;
  onCreateTemplate: (template: WorkoutTemplate) => void;
}

export const WorkoutTemplateList: React.FC<WorkoutTemplateListProps> = ({
  templates,
  onStartWorkout,
  onUpdateTemplate,
  onCreateTemplate
}) => {
  const [selectedExercise, setSelectedExercise] = useState<{ exercise: Exercise; templateId: string } | null>(null);
  const [isCreatingNew, setIsCreatingNew] = useState(false);
  const [newProgramName, setNewProgramName] = useState('');
  const [newProgramDesc, setNewProgramDesc] = useState('');

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

  const handleCreateProgram = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newProgramName.trim()) return;

    const newTemplate: WorkoutTemplate = {
      id: 'template-' + Date.now(),
      name: newProgramName.trim(),
      description: newProgramDesc.trim() || 'Пользовательская программа тренировок',
      exercises: [
        {
          id: 'ex-' + Date.now(),
          name: 'Базовое упражнение',
          category: 'Chest',
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
    <div className="max-w-2xl mx-auto p-3 sm:p-4 pb-28 space-y-6">
      
      {/* Hero Welcome Card */}
      <div className="bg-gradient-to-br from-zinc-900 via-zinc-900 to-emerald-950/40 border border-zinc-800 rounded-3xl p-5 sm:p-6 shadow-2xl relative overflow-hidden">
        <div className="relative z-10">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-emerald-500/10 border border-emerald-500/30 rounded-full text-xs font-semibold text-emerald-400 mb-3">
            <Zap className="w-3.5 h-3.5" /> Умная Двойная Прогрессия (Smart DP)
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
            IronForge PWA
          </h1>
          <p className="text-zinc-400 text-xs sm:text-sm mt-1.5 max-w-md leading-relaxed">
            Автоматическое наращивание повторений и весов с контролем RPE и защитой от плато.
          </p>
        </div>
      </div>

      {/* Header and Add button */}
      <div className="flex items-center justify-between pt-2">
        <div className="flex items-center gap-2">
          <Layers className="w-5 h-5 text-emerald-400" />
          <h2 className="font-bold text-lg text-zinc-100">Программы тренировок</h2>
        </div>
        <button
          onClick={() => setIsCreatingNew(true)}
          className="text-xs font-semibold text-emerald-400 hover:text-emerald-300 bg-emerald-950/50 hover:bg-emerald-950/80 border border-emerald-800/60 px-3 py-1.5 rounded-xl flex items-center gap-1 transition"
        >
          <Plus className="w-3.5 h-3.5" /> Новая программа
        </button>
      </div>

      {/* Program Templates List */}
      <div className="space-y-4">
        {templates.map(template => (
          <div
            key={template.id}
            className="bg-zinc-900/90 border border-zinc-800 hover:border-zinc-700/80 rounded-2xl p-4 sm:p-5 shadow-xl transition-all"
          >
            {/* Template Header */}
            <div className="flex items-start justify-between gap-3 mb-3">
              <div>
                <h3 className="font-bold text-lg text-white">{template.name}</h3>
                <p className="text-xs text-zinc-400 mt-0.5">{template.description}</p>
              </div>
              <button
                onClick={() => onStartWorkout(template)}
                className="px-4 py-2 bg-emerald-500 hover:bg-emerald-400 active:scale-95 text-black font-bold text-xs sm:text-sm rounded-xl shadow-lg shadow-emerald-950/40 flex items-center gap-1.5 transition shrink-0"
              >
                <Play className="w-4 h-4 fill-current" /> Начать
              </button>
            </div>

            {/* Exercises mini preview list */}
            <div className="space-y-2 mt-4 pt-3 border-t border-zinc-800/80">
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
                    onClick={() => setSelectedExercise({ exercise, templateId: template.id })}
                    className="flex items-center justify-between p-2.5 bg-zinc-950/60 hover:bg-zinc-950 border border-zinc-800/60 rounded-xl cursor-pointer group transition"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-2 h-2 rounded-full bg-emerald-400 group-hover:scale-125 transition" />
                      <div>
                        <div className="font-semibold text-xs sm:text-sm text-zinc-200 group-hover:text-white">
                          {exercise.name}
                        </div>
                        <div className="text-[11px] text-zinc-500 font-mono">
                          {exercise.targetSets}×{exercise.minReps}-{exercise.maxReps} повт. • {exercise.currentWeight} кг
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <span className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded-full border ${
                        recommendation.badgeColor === 'emerald'
                          ? 'bg-emerald-950/60 text-emerald-400 border-emerald-800/50'
                          : recommendation.badgeColor === 'amber'
                          ? 'bg-amber-950/60 text-amber-400 border-amber-800/50'
                          : recommendation.badgeColor === 'purple'
                          ? 'bg-purple-950/60 text-purple-400 border-purple-800/50'
                          : 'bg-zinc-800/60 text-zinc-400 border-zinc-700/50'
                      }`}>
                        {recommendation.badgeText}
                      </span>
                      <ChevronRight className="w-4 h-4 text-zinc-600 group-hover:text-zinc-300 transition" />
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

      {/* Modal: Create Program */}
      {isCreatingNew && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="w-full max-w-md bg-zinc-900 border border-zinc-700 rounded-2xl p-6 shadow-2xl text-white">
            <h3 className="font-bold text-lg mb-4">Создать новую программу</h3>
            <form onSubmit={handleCreateProgram} className="space-y-4">
              <div>
                <label className="block text-xs uppercase tracking-wider text-zinc-400 font-semibold mb-1">
                  Название
                </label>
                <input
                  type="text"
                  required
                  placeholder="Например: Upper Body A или Спина + Бицепс"
                  value={newProgramName}
                  onChange={e => setNewProgramName(e.target.value)}
                  className="w-full bg-zinc-950 border border-zinc-700 rounded-xl px-4 py-2.5 text-sm text-zinc-100 focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="block text-xs uppercase tracking-wider text-zinc-400 font-semibold mb-1">
                  Описание
                </label>
                <textarea
                  placeholder="Краткое описание акцентов..."
                  value={newProgramDesc}
                  onChange={e => setNewProgramDesc(e.target.value)}
                  className="w-full bg-zinc-950 border border-zinc-700 rounded-xl px-4 py-2.5 text-sm text-zinc-100 focus:outline-none focus:border-emerald-500"
                  rows={3}
                />
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsCreatingNew(false)}
                  className="flex-1 py-2.5 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-sm font-semibold rounded-xl transition"
                >
                  Отмена
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 bg-emerald-500 hover:bg-emerald-400 text-black text-sm font-bold rounded-xl transition"
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
