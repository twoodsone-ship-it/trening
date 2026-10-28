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
  Dumbbell
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { ActiveExerciseSession, CompletedWorkout, WorkoutSet } from '../types';
import { soundService } from '../services/audioService';
import { calculate1RM, calculateVolume } from '../services/progressionEngine';
import { PlateCalculatorModal } from './PlateCalculatorModal';
import { ExerciseProgressionModal } from './ExerciseProgressionModal';

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
  const [viewingProgressionExId, setViewingProgressionExId] = useState<string | null>(null);

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

  const updateSetRpe = (exIdx: number, setIdx: number, rpe: number) => {
    const updated = [...exercises];
    updated[exIdx].sets[setIdx].rpe = rpe;
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
    <div className="min-h-screen bg-gym-dark pb-32 text-zinc-100">
      
      {/* Sticky Workout Top Bar */}
      <div className="sticky top-0 z-40 bg-zinc-950/90 backdrop-blur-md border-b border-zinc-800 px-4 py-3">
        <div className="max-w-2xl mx-auto flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2">
              <span className="relative flex h-2.5 w-2.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
              </span>
              <h1 className="font-bold text-base sm:text-lg truncate">{workoutName}</h1>
            </div>
            <div className="flex items-center gap-3 text-xs text-zinc-400 mt-0.5">
              <span className="flex items-center gap-1 font-mono">
                <Clock className="w-3.5 h-3.5 text-emerald-400" /> {elapsedMinutes} мин
              </span>
              <span>•</span>
              <span className="font-mono text-emerald-400">
                {totalCompletedSets}/{totalPlannedSets} сетов
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={onCancelWorkout}
              className="px-3 py-1.5 text-xs text-zinc-400 hover:text-red-400 hover:bg-zinc-900 rounded-lg transition"
            >
              Отменить
            </button>
            <button
              onClick={handleFinish}
              className="px-4 py-2 bg-emerald-500 hover:bg-emerald-400 active:scale-95 text-black font-bold text-xs sm:text-sm rounded-xl shadow-lg shadow-emerald-950/50 flex items-center gap-1.5 transition"
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
              key={ex.exerciseId}
              className="bg-zinc-900/90 border border-zinc-800 rounded-2xl p-4 shadow-xl transition"
            >
              {/* Exercise Header */}
              <div className="flex items-start justify-between gap-2 pb-3 border-b border-zinc-800/80">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-400 bg-emerald-950/60 border border-emerald-800/40 px-2 py-0.5 rounded-full">
                      {ex.category}
                    </span>
                    <span className="text-xs text-zinc-400 font-mono">
                      {completedCount}/{ex.sets.length}
                    </span>
                  </div>
                  <h2 className="font-bold text-lg text-white mt-1">{ex.name}</h2>
                </div>

                <div className="flex items-center gap-1">
                  {/* Plate calculator trigger */}
                  <button
                    onClick={() => setSelectedPlateCalcWeight(ex.targetWeight)}
                    title="Калькулятор блинов"
                    className="p-2 text-zinc-400 hover:text-emerald-400 bg-zinc-950 hover:bg-zinc-800 border border-zinc-800 rounded-xl transition"
                  >
                    <Calculator className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Smart Progression Recommendation Alert Box */}
              <div className={`mt-3 p-3 rounded-xl border text-xs flex items-center justify-between ${
                ex.recommendation.badgeColor === 'emerald'
                  ? 'bg-emerald-950/30 border-emerald-500/40 text-emerald-200'
                  : ex.recommendation.badgeColor === 'amber'
                  ? 'bg-amber-950/30 border-amber-500/40 text-amber-200'
                  : 'bg-zinc-950/80 border-zinc-800 text-zinc-300'
              }`}>
                <div className="flex items-center gap-2">
                  <span className="text-base">⚡</span>
                  <div>
                    <span className="font-bold text-white block">
                      {ex.recommendation.badgeText}
                    </span>
                    <span className="text-[11px] opacity-80">
                      Цель: {ex.targetWeight} кг × {ex.minReps}-{ex.maxReps} повт.
                    </span>
                  </div>
                </div>
                <span className="text-[10px] px-2 py-1 bg-black/40 rounded-lg font-mono">
                  Шаг: +{ex.weightStep}кг
                </span>
              </div>

              {/* Sets Table */}
              <div className="mt-4 space-y-2.5">
                {/* Table Header */}
                <div className="grid grid-cols-12 gap-1 text-[11px] font-bold uppercase tracking-wider text-zinc-500 px-1">
                  <span className="col-span-1 text-center">Сет</span>
                  <span className="col-span-3 text-center">Предыдущий</span>
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
                      className={`grid grid-cols-12 gap-1 items-center p-2 rounded-xl border transition ${
                        set.completed 
                          ? 'bg-emerald-950/20 border-emerald-500/40 text-zinc-200' 
                          : 'bg-zinc-950/60 border-zinc-800/80'
                      }`}
                    >
                      {/* Set Number */}
                      <div className="col-span-1 text-center font-mono font-bold text-sm text-zinc-400">
                        {set.setNumber}
                      </div>

                      {/* Ghost Data from Previous Session */}
                      <div className="col-span-3 text-center text-[11px] font-mono text-zinc-500">
                        {prevSet ? `${prevSet.weight}кг × ${prevSet.reps}` : '—'}
                      </div>

                      {/* Weight Stepper */}
                      <div className="col-span-3 flex items-center justify-center gap-1 bg-zinc-900 border border-zinc-800 rounded-lg p-1">
                        <button
                          onClick={() => updateSetWeight(exIdx, setIdx, -ex.weightStep)}
                          className="w-6 h-6 flex items-center justify-center bg-zinc-800 hover:bg-zinc-700 text-zinc-300 rounded text-xs active:scale-95 transition"
                        >
                          <Minus className="w-3 h-3" />
                        </button>
                        <span className="font-mono font-bold text-xs sm:text-sm text-white w-10 text-center">
                          {set.weight}
                        </span>
                        <button
                          onClick={() => updateSetWeight(exIdx, setIdx, +ex.weightStep)}
                          className="w-6 h-6 flex items-center justify-center bg-zinc-800 hover:bg-zinc-700 text-zinc-300 rounded text-xs active:scale-95 transition"
                        >
                          <Plus className="w-3 h-3" />
                        </button>
                      </div>

                      {/* Reps Stepper */}
                      <div className="col-span-3 flex items-center justify-center gap-1 bg-zinc-900 border border-zinc-800 rounded-lg p-1">
                        <button
                          onClick={() => updateSetReps(exIdx, setIdx, -1)}
                          className="w-6 h-6 flex items-center justify-center bg-zinc-800 hover:bg-zinc-700 text-zinc-300 rounded text-xs active:scale-95 transition"
                        >
                          <Minus className="w-3 h-3" />
                        </button>
                        <span className="font-mono font-bold text-xs sm:text-sm text-white w-7 text-center">
                          {set.reps}
                        </span>
                        <button
                          onClick={() => updateSetReps(exIdx, setIdx, +1)}
                          className="w-6 h-6 flex items-center justify-center bg-zinc-800 hover:bg-zinc-700 text-zinc-300 rounded text-xs active:scale-95 transition"
                        >
                          <Plus className="w-3 h-3" />
                        </button>
                      </div>

                      {/* Complete Checkbox */}
                      <div className="col-span-2 flex justify-center">
                        <button
                          onClick={() => toggleSetComplete(exIdx, setIdx)}
                          className={`w-10 h-10 rounded-xl flex items-center justify-center transition active:scale-90 shadow-md ${
                            set.completed
                              ? 'bg-emerald-500 text-black shadow-emerald-950/50'
                              : 'bg-zinc-800 hover:bg-zinc-700 text-zinc-400 border border-zinc-700'
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
              <div className="flex items-center justify-between pt-3 mt-2 border-t border-zinc-800/60">
                <button
                  onClick={() => addSet(exIdx)}
                  className="text-xs font-semibold text-emerald-400 hover:text-emerald-300 flex items-center gap-1 px-2.5 py-1.5 rounded-lg hover:bg-emerald-950/30 transition"
                >
                  <Plus className="w-3.5 h-3.5" /> Добавить подход
                </button>

                {ex.sets.length > 1 && (
                  <button
                    onClick={() => removeSet(exIdx, ex.sets.length - 1)}
                    className="text-xs text-zinc-500 hover:text-red-400 flex items-center gap-1 px-2 py-1 transition"
                  >
                    <Trash2 className="w-3.5 h-3.5" /> Удалить последний
                  </button>
                )}
              </div>

            </div>
          );
        })}
      </div>

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
