import React, { useState } from 'react';
import { 
  Check, 
  Plus, 
  Minus, 
  Trash2, 
  Calculator, 
  Flame, 
  TrendingUp, 
  CheckCircle2, 
  X, 
  Info,
  Clock,
  Dumbbell,
  RefreshCw,
  HelpCircle,
  Sparkles
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { ActiveExerciseSession, CompletedWorkout, WorkoutSet } from '../types';
import { soundService } from '../services/audioService';
import { calculate1RM, calculateVolume, evaluateDoubleProgression } from '../services/progressionEngine';
import { PlateCalculatorModal } from './PlateCalculatorModal';
import { ExerciseTechniqueModal } from './ExerciseTechniqueModal';
import { ExerciseSwapModal } from './ExerciseSwapModal';
import { CatalogExerciseItem } from '../data/exerciseCatalog';

interface ActiveWorkoutViewProps {
  workoutName: string;
  templateId: string;
  startTime: number;
  exercises: ActiveExerciseSession[];
  onUpdateExercises: (exercises: ActiveExerciseSession[]) => void;
  onFinishWorkout: (completed: CompletedWorkout) => void;
  onCancelWorkout: () => void;
  onTriggerRestTimer: (seconds: number) => void;
}

export const ActiveWorkoutView: React.FC<ActiveWorkoutViewProps> = ({
  workoutName,
  templateId,
  startTime,
  exercises,
  onUpdateExercises,
  onFinishWorkout,
  onCancelWorkout,
  onTriggerRestTimer
}) => {
  const [selectedPlateCalcWeight, setSelectedPlateCalcWeight] = useState<number | null>(null);
  
  // Technique & Animation Modal
  const [viewingTechniqueEx, setViewingTechniqueEx] = useState<ActiveExerciseSession | null>(null);

  // Exercise Swap Modal (Machine Busy / Missing)
  const [swappingExIndex, setSwappingExIndex] = useState<number | null>(null);

  // Time elapsed ticker
  const [elapsedMinutes, setElapsedMinutes] = useState(
    Math.max(1, Math.round((Date.now() - startTime) / 60000))
  );

  React.useEffect(() => {
    const timer = setInterval(() => {
      setElapsedMinutes(Math.max(1, Math.round((Date.now() - startTime) / 60000)));
    }, 30000);
    return () => clearInterval(timer);
  }, [startTime]);

  const toggleSetComplete = (exIdx: number, setIdx: number) => {
    const updated = [...exercises];
    const targetSet = updated[exIdx].sets[setIdx];
    const willBeCompleted = !targetSet.completed;
    targetSet.completed = willBeCompleted;

    onUpdateExercises(updated);

    if (willBeCompleted) {
      soundService.vibrate([100, 50, 100]);
      soundService.playCountdownBeep();
      // Auto-trigger rest timer for this exercise
      onTriggerRestTimer(updated[exIdx].restSeconds || 90);
    }
  };

  const updateSetWeight = (exIdx: number, setIdx: number, delta: number) => {
    const updated = [...exercises];
    const set = updated[exIdx].sets[setIdx];
    const newWeight = Math.max(0, Math.round((set.weight + delta) * 10) / 10);
    set.weight = newWeight;
    onUpdateExercises(updated);
  };

  const updateSetReps = (exIdx: number, setIdx: number, delta: number) => {
    const updated = [...exercises];
    const set = updated[exIdx].sets[setIdx];
    const newReps = Math.max(0, set.reps + delta);
    set.reps = newReps;
    onUpdateExercises(updated);
  };

  const addSet = (exIdx: number) => {
    const updated = [...exercises];
    const ex = updated[exIdx];
    const lastSet = ex.sets[ex.sets.length - 1];
    ex.sets.push({
      id: 'set-' + Date.now() + '-' + Math.random().toString(36).substring(2, 5),
      setNumber: ex.sets.length + 1,
      weight: lastSet ? lastSet.weight : ex.targetWeight,
      reps: lastSet ? lastSet.reps : ex.minReps,
      rpe: 8,
      completed: false
    });
    onUpdateExercises(updated);
  };

  const removeSet = (exIdx: number, setIdx: number) => {
    const updated = [...exercises];
    if (updated[exIdx].sets.length <= 1) return;
    updated[exIdx].sets.splice(setIdx, 1);
    // Renumber
    updated[exIdx].sets.forEach((s, i) => s.setNumber = i + 1);
    onUpdateExercises(updated);
  };

  // Handle swapping an exercise for another
  const handleSwapExercise = (newCatalogEx: CatalogExerciseItem) => {
    if (swappingExIndex === null) return;
    const updated = [...exercises];
    const oldEx = updated[swappingExIndex];

    const recommendation = evaluateDoubleProgression(
      newCatalogEx.defaultSets,
      newCatalogEx.minReps,
      newCatalogEx.maxReps,
      newCatalogEx.weightStep,
      newCatalogEx.defaultWeight,
      []
    );

    // Keep completed sets or seed new sets with matching target
    const newSets: WorkoutSet[] = oldEx.sets.map((s, i) => ({
      id: 'swap-' + Date.now() + '-' + i,
      setNumber: i + 1,
      weight: s.completed ? s.weight : newCatalogEx.defaultWeight,
      reps: s.completed ? s.reps : newCatalogEx.minReps,
      rpe: s.rpe || 8,
      completed: s.completed
    }));

    updated[swappingExIndex] = {
      exerciseId: newCatalogEx.id,
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
      targetWeight: newCatalogEx.defaultWeight,
      restSeconds: newCatalogEx.restSeconds,
      sets: newSets,
      recommendation
    };

    onUpdateExercises(updated);
    setSwappingExIndex(null);
  };

  const handleFinish = () => {
    const endTime = Date.now();
    const duration = Math.max(1, Math.round((endTime - startTime) / 60000));
    
    let totalVolume = 0;
    let totalSetsCount = 0;

    const completedExercises = exercises.map(ex => {
      const completedSets = ex.sets.filter(s => s.completed);
      const vol = calculateVolume(completedSets);
      totalVolume += vol;
      totalSetsCount += completedSets.length;

      return {
        exerciseId: ex.exerciseId,
        name: ex.name,
        category: ex.category,
        targetSets: ex.targetSets,
        minReps: ex.minReps,
        maxReps: ex.maxReps,
        workingWeight: ex.targetWeight,
        sets: completedSets.map(s => ({
          setNumber: s.setNumber,
          weight: s.weight,
          reps: s.reps,
          rpe: s.rpe
        })),
        progression: ex.recommendation
      };
    });

    // PR Confetti & Victory Fanfare
    try {
      confetti({
        particleCount: 120,
        spread: 80,
        origin: { y: 0.6 }
      });
      soundService.playPrFanfare();
      soundService.vibrate([150, 100, 250]);
    } catch {
      //
    }

    const completedWorkout: CompletedWorkout = {
      id: 'w-' + Date.now(),
      templateId,
      templateName: workoutName,
      startTime,
      endTime,
      durationMinutes: duration,
      totalVolumeKg: Math.round(totalVolume),
      totalSets: totalSetsCount,
      exercises: completedExercises
    };

    onFinishWorkout(completedWorkout);
  };

  const totalCompletedSets = exercises.reduce(
    (sum, ex) => sum + ex.sets.filter(s => s.completed).length, 0
  );
  const totalPlannedSets = exercises.reduce((sum, ex) => sum + ex.sets.length, 0);

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-gym-dark pb-32 text-slate-900 dark:text-zinc-100 transition-colors duration-200">
      
      {/* Sticky Workout Top Bar */}
      <div className="sticky top-0 z-40 bg-white/95 dark:bg-zinc-950/90 backdrop-blur-md border-b border-slate-200 dark:border-zinc-800 px-4 py-3 shadow-sm">
        <div className="max-w-2xl mx-auto flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2">
              <span className="relative flex h-2.5 w-2.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-500 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-600 dark:bg-emerald-500"></span>
              </span>
              <h1 className="font-bold text-base sm:text-lg text-slate-900 dark:text-white truncate">{workoutName}</h1>
            </div>
            <div className="flex items-center gap-3 text-xs text-slate-500 dark:text-zinc-400 mt-0.5">
              <span className="flex items-center gap-1 font-mono">
                <Clock className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" /> {elapsedMinutes} мин
              </span>
              <span>•</span>
              <span className="font-mono text-emerald-600 dark:text-emerald-400 font-bold">
                {totalCompletedSets}/{totalPlannedSets} сетов
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={onCancelWorkout}
              className="px-3 py-1.5 text-xs text-slate-500 dark:text-zinc-400 hover:text-red-600 dark:hover:text-red-400 hover:bg-slate-100 dark:hover:bg-zinc-900 rounded-lg transition"
            >
              Отменить
            </button>
            <button
              onClick={handleFinish}
              className="px-4 py-2 bg-emerald-500 hover:bg-emerald-400 active:scale-95 text-black font-bold text-xs sm:text-sm rounded-xl shadow-lg shadow-emerald-500/20 flex items-center gap-1.5 transition"
            >
              <CheckCircle2 className="w-4 h-4" /> Завершить
            </button>
          </div>
        </div>
      </div>

      {/* Main Exercise Cards List */}
      <div className="max-w-2xl mx-auto p-3 sm:p-4 space-y-5">
        {exercises.map((ex, exIdx) => {
          const completedCount = ex.sets.filter(s => s.completed).length;

          return (
            <div 
              key={ex.exerciseId + '-' + exIdx}
              className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-3xl p-4 sm:p-5 shadow-sm dark:shadow-xl transition"
            >
              {/* Exercise Header */}
              <div className="flex items-start justify-between gap-2 pb-3 border-b border-slate-100 dark:border-zinc-800/80">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-700 dark:text-emerald-400 bg-emerald-100 dark:bg-emerald-950/60 border border-emerald-300 dark:border-emerald-800/40 px-2 py-0.5 rounded-full">
                      {ex.category}
                    </span>
                    <span className="text-xs text-slate-500 dark:text-zinc-400 font-mono">
                      {completedCount}/{ex.sets.length}
                    </span>
                  </div>
                  <h2 className="font-bold text-base sm:text-lg text-slate-900 dark:text-white mt-1">{ex.name}</h2>
                </div>

                {/* Action Buttons: Animation/Technique, Swap, Plate Calculator */}
                <div className="flex items-center gap-1.5 shrink-0">
                  {/* View Technique & Animation */}
                  <button
                    onClick={() => setViewingTechniqueEx(ex)}
                    title="Техника и анимация"
                    className="p-2 text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-zinc-800 hover:bg-emerald-100 dark:hover:bg-zinc-700 border border-emerald-200 dark:border-zinc-700 rounded-xl transition flex items-center gap-1 text-xs font-semibold"
                  >
                    <Sparkles className="w-3.5 h-3.5" />
                    <span className="hidden sm:inline">Техника</span>
                  </button>

                  {/* Swap Exercise Button (Busy or missing machine) */}
                  <button
                    onClick={() => setSwappingExIndex(exIdx)}
                    title="Заменить упражнение (тренажер занят / нет в зале)"
                    className="p-2 text-blue-700 dark:text-blue-400 bg-blue-50 dark:bg-zinc-800 hover:bg-blue-100 dark:hover:bg-zinc-700 border border-blue-200 dark:border-zinc-700 rounded-xl transition flex items-center gap-1 text-xs font-semibold"
                  >
                    <RefreshCw className="w-3.5 h-3.5" />
                    <span className="hidden sm:inline">Замена</span>
                  </button>

                  {/* Plate calculator trigger */}
                  <button
                    onClick={() => setSelectedPlateCalcWeight(ex.targetWeight)}
                    title="Калькулятор блинов"
                    className="p-2 text-slate-600 dark:text-zinc-400 hover:text-emerald-600 dark:hover:text-emerald-400 bg-slate-100 dark:bg-zinc-800 hover:bg-slate-200 border border-slate-200 dark:border-zinc-700 rounded-xl transition"
                  >
                    <Calculator className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Smart Progression Recommendation Alert Box */}
              <div className={`mt-3 p-3 rounded-2xl border text-xs flex items-center justify-between ${
                ex.recommendation.badgeColor === 'emerald'
                  ? 'bg-emerald-50 dark:bg-emerald-950/30 border-emerald-200 dark:border-emerald-500/40 text-emerald-900 dark:text-emerald-200'
                  : ex.recommendation.badgeColor === 'amber'
                  ? 'bg-amber-50 dark:bg-amber-950/30 border-amber-200 dark:border-amber-500/40 text-amber-900 dark:text-amber-200'
                  : 'bg-slate-50 dark:bg-zinc-950/80 border-slate-200 dark:border-zinc-800 text-slate-700 dark:text-zinc-300'
              }`}>
                <div className="flex items-center gap-2">
                  <span className="text-base">⚡</span>
                  <div>
                    <span className="font-bold text-slate-900 dark:text-white block">
                      {ex.recommendation.badgeText}
                    </span>
                    <span className="text-[11px] opacity-80">
                      Цель: {ex.targetWeight} кг × {ex.minReps}-{ex.maxReps} повт.
                    </span>
                  </div>
                </div>
                <span className="text-[10px] px-2 py-1 bg-white/80 dark:bg-black/40 rounded-lg font-mono font-bold shadow-xs">
                  Шаг: +{ex.weightStep}кг
                </span>
              </div>

              {/* Sets Table */}
              <div className="mt-4 space-y-2.5">
                {/* Table Header */}
                <div className="grid grid-cols-12 gap-1 text-[11px] font-bold uppercase tracking-wider text-slate-400 dark:text-zinc-500 px-1">
                  <span className="col-span-1 text-center">Сет</span>
                  <span className="col-span-3 text-center">Пред.</span>
                  <span className="col-span-3 text-center">Вес (кг)</span>
                  <span className="col-span-3 text-center">Повторы</span>
                  <span className="col-span-2 text-center">Готово</span>
                </div>

                {/* Set Rows */}
                {ex.sets.map((set, setIdx) => {
                  const prevSet = ex.previousPerformance?.sets[setIdx];

                  return (
                    <div 
                      key={set.id}
                      className={`grid grid-cols-12 gap-1 items-center p-2 rounded-2xl border transition ${
                        set.completed 
                          ? 'bg-emerald-50/80 dark:bg-emerald-950/20 border-emerald-400 dark:border-emerald-500/40' 
                          : 'bg-slate-50/80 dark:bg-zinc-950/60 border-slate-200 dark:border-zinc-800/80'
                      }`}
                    >
                      {/* Set Number */}
                      <div className="col-span-1 text-center font-mono font-bold text-sm text-slate-500 dark:text-zinc-400">
                        {set.setNumber}
                      </div>

                      {/* Ghost Data from Previous Session */}
                      <div className="col-span-3 text-center text-[11px] font-mono text-slate-400 dark:text-zinc-500">
                        {prevSet ? `${prevSet.weight}кг × ${prevSet.reps}` : '—'}
                      </div>

                      {/* Weight Stepper */}
                      <div className="col-span-3 flex items-center justify-center gap-1 bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-xl p-1 shadow-xs">
                        <button
                          onClick={() => updateSetWeight(exIdx, setIdx, -ex.weightStep)}
                          className="w-6 h-6 flex items-center justify-center bg-slate-100 dark:bg-zinc-800 hover:bg-slate-200 text-slate-700 dark:text-zinc-300 rounded text-xs active:scale-95 transition"
                        >
                          <Minus className="w-3 h-3" />
                        </button>
                        <span className="font-mono font-bold text-xs sm:text-sm text-slate-900 dark:text-white w-10 text-center">
                          {set.weight}
                        </span>
                        <button
                          onClick={() => updateSetWeight(exIdx, setIdx, +ex.weightStep)}
                          className="w-6 h-6 flex items-center justify-center bg-slate-100 dark:bg-zinc-800 hover:bg-slate-200 text-slate-700 dark:text-zinc-300 rounded text-xs active:scale-95 transition"
                        >
                          <Plus className="w-3 h-3" />
                        </button>
                      </div>

                      {/* Reps Stepper */}
                      <div className="col-span-3 flex items-center justify-center gap-1 bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-xl p-1 shadow-xs">
                        <button
                          onClick={() => updateSetReps(exIdx, setIdx, -1)}
                          className="w-6 h-6 flex items-center justify-center bg-slate-100 dark:bg-zinc-800 hover:bg-slate-200 text-slate-700 dark:text-zinc-300 rounded text-xs active:scale-95 transition"
                        >
                          <Minus className="w-3 h-3" />
                        </button>
                        <span className="font-mono font-bold text-xs sm:text-sm text-slate-900 dark:text-white w-7 text-center">
                          {set.reps}
                        </span>
                        <button
                          onClick={() => updateSetReps(exIdx, setIdx, +1)}
                          className="w-6 h-6 flex items-center justify-center bg-slate-100 dark:bg-zinc-800 hover:bg-slate-200 text-slate-700 dark:text-zinc-300 rounded text-xs active:scale-95 transition"
                        >
                          <Plus className="w-3 h-3" />
                        </button>
                      </div>

                      {/* Complete Checkbox */}
                      <div className="col-span-2 flex justify-center">
                        <button
                          onClick={() => toggleSetComplete(exIdx, setIdx)}
                          className={`w-10 h-10 rounded-xl flex items-center justify-center transition active:scale-90 shadow-sm ${
                            set.completed
                              ? 'bg-emerald-500 text-white shadow-emerald-500/30'
                              : 'bg-white dark:bg-zinc-800 hover:bg-slate-100 dark:hover:bg-zinc-700 text-slate-400 dark:text-zinc-400 border border-slate-200 dark:border-zinc-700'
                          }`}
                        >
                          <Check className={`w-5 h-5 ${set.completed ? 'stroke-[3]' : ''}`} />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Add / Remove Set Row */}
              <div className="flex items-center justify-between pt-3 mt-2 border-t border-slate-100 dark:border-zinc-800/60">
                <button
                  onClick={() => addSet(exIdx)}
                  className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 hover:text-emerald-700 flex items-center gap-1 px-2.5 py-1.5 rounded-lg hover:bg-emerald-50 dark:hover:bg-emerald-950/30 transition"
                >
                  <Plus className="w-3.5 h-3.5" /> Добавить подход
                </button>

                {ex.sets.length > 1 && (
                  <button
                    onClick={() => removeSet(exIdx, ex.sets.length - 1)}
                    className="text-xs text-slate-400 hover:text-red-500 flex items-center gap-1 px-2 py-1 transition"
                  >
                    <Trash2 className="w-3.5 h-3.5" /> Удалить последний
                  </button>
                )}
              </div>

            </div>
          );
        })}
      </div>

      {/* Technique & Animation Modal */}
      {viewingTechniqueEx && (
        <ExerciseTechniqueModal
          exerciseName={viewingTechniqueEx.name}
          category={viewingTechniqueEx.category}
          equipment={viewingTechniqueEx.equipment}
          animationType={viewingTechniqueEx.animationType || 'bench-press'}
          technique={viewingTechniqueEx.technique}
          isOpen={true}
          onClose={() => setViewingTechniqueEx(null)}
          onOpenSwapModal={() => {
            const idx = exercises.findIndex(e => e.exerciseId === viewingTechniqueEx.exerciseId);
            if (idx !== -1) {
              setSwappingExIndex(idx);
            }
          }}
        />
      )}

      {/* Exercise Swap Modal */}
      {swappingExIndex !== null && exercises[swappingExIndex] && (
        <ExerciseSwapModal
          currentExercise={{
            id: exercises[swappingExIndex].exerciseId,
            name: exercises[swappingExIndex].name,
            category: exercises[swappingExIndex].category,
            equipment: exercises[swappingExIndex].equipment,
            alternatives: exercises[swappingExIndex].alternatives
          }}
          isOpen={true}
          onClose={() => setSwappingExIndex(null)}
          onSelectAlternative={handleSwapExercise}
        />
      )}

      {/* Plate Calculator Modal */}
      {selectedPlateCalcWeight !== null && (
        <PlateCalculatorModal
          initialWeight={selectedPlateCalcWeight}
          isOpen={true}
          onClose={() => setSelectedPlateCalcWeight(null)}
        />
      )}

    </div>
  );
};
