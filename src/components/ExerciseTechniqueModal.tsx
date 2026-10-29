import React from 'react';
import { X, RefreshCw, AlertTriangle, Wind, Target, Dumbbell } from 'lucide-react';
import type { ExerciseTechniqueGuide, EquipmentType } from '../types/index.ts';
import { ExerciseAnimation } from './ExerciseAnimation';

interface ExerciseTechniqueModalProps {
  exerciseName: string;
  category: string;
  equipment?: EquipmentType;
  animationType: string;
  technique?: ExerciseTechniqueGuide;
  isOpen: boolean;
  onClose: () => void;
  onOpenSwapModal?: () => void;
}

const EQUIPMENT_LABELS: Record<string, string> = {
  barbell: 'Штанга',
  dumbbell: 'Гантели',
  cable: 'Блочный тренажер',
  machine: 'Тренажер / Хаммер',
  smith: 'Тренажер Смита',
  bodyweight: 'Собственный вес'
};

export const ExerciseTechniqueModal: React.FC<ExerciseTechniqueModalProps> = ({
  exerciseName,
  category,
  equipment = 'barbell',
  animationType,
  technique,
  isOpen,
  onClose,
  onOpenSwapModal
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-sm animate-fade-in text-slate-900 dark:text-zinc-100">
      <div className="w-full max-w-lg bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-700 rounded-3xl shadow-2xl max-h-[90vh] flex flex-col overflow-hidden">
        
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-slate-200 dark:border-zinc-800 bg-slate-50/80 dark:bg-zinc-900/90">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-700 dark:text-emerald-400 bg-emerald-100 dark:bg-emerald-950/60 border border-emerald-300 dark:border-emerald-800/40 px-2 py-0.5 rounded-full">
                {category}
              </span>
              <span className="text-[10px] font-semibold text-slate-500 dark:text-zinc-400 bg-slate-200 dark:bg-zinc-800 px-2 py-0.5 rounded-full">
                {EQUIPMENT_LABELS[equipment] || equipment}
              </span>
            </div>
            <h3 className="font-bold text-lg text-slate-900 dark:text-white mt-1">{exerciseName}</h3>
          </div>
          
          <button 
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-700 dark:text-zinc-400 dark:hover:text-white rounded-xl hover:bg-slate-100 dark:hover:bg-zinc-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Scrollable Body */}
        <div className="p-4 sm:p-5 overflow-y-auto space-y-4">
          
          {/* Animated Visual Canvas */}
          <ExerciseAnimation
            animationType={animationType}
            category={category}
            exerciseName={exerciseName}
          />

          {/* Swap Trigger Pill Button (Equipment busy/missing) */}
          {onOpenSwapModal && (
            <button
              onClick={() => {
                onClose();
                onOpenSwapModal();
              }}
              className="w-full py-2.5 px-4 bg-emerald-50 dark:bg-emerald-950/40 hover:bg-emerald-100 dark:hover:bg-emerald-900/50 border border-emerald-300 dark:border-emerald-700/60 rounded-2xl text-xs sm:text-sm font-bold text-emerald-800 dark:text-emerald-300 flex items-center justify-center gap-2 transition shadow-sm"
            >
              <RefreshCw className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
              <span>Тренажер занят или его нет в зале? Нажмите для замены</span>
            </button>
          )}

          {/* Technique Details */}
          {technique ? (
            <div className="space-y-3.5 text-xs sm:text-sm">
              
              {/* Target Muscles */}
              <div className="bg-slate-50 dark:bg-zinc-950 p-3.5 rounded-2xl border border-slate-200 dark:border-zinc-800/80">
                <div className="flex items-center gap-2 text-emerald-600 dark:text-emerald-400 font-bold mb-1">
                  <Target className="w-4 h-4" />
                  <span>Работающие мышцы</span>
                </div>
                <p className="text-slate-700 dark:text-zinc-300 leading-relaxed font-medium">
                  {technique.primaryMuscles}
                </p>
              </div>

              {/* Setup */}
              <div className="bg-slate-50 dark:bg-zinc-950 p-3.5 rounded-2xl border border-slate-200 dark:border-zinc-800/80">
                <span className="font-bold text-slate-900 dark:text-zinc-100 block mb-1">
                  📍 1. Исходное положение
                </span>
                <p className="text-slate-600 dark:text-zinc-300 leading-relaxed">
                  {technique.setup}
                </p>
              </div>

              {/* Execution */}
              <div className="bg-slate-50 dark:bg-zinc-950 p-3.5 rounded-2xl border border-slate-200 dark:border-zinc-800/80">
                <span className="font-bold text-slate-900 dark:text-zinc-100 block mb-1">
                  ⚡ 2. Техника движения
                </span>
                <p className="text-slate-600 dark:text-zinc-300 leading-relaxed">
                  {technique.execution}
                </p>
              </div>

              {/* Breathing */}
              <div className="bg-blue-50/60 dark:bg-blue-950/30 p-3.5 rounded-2xl border border-blue-200 dark:border-blue-800/50">
                <div className="flex items-center gap-2 text-blue-700 dark:text-blue-400 font-bold mb-1">
                  <Wind className="w-4 h-4" />
                  <span>3. Правильное дыхание</span>
                </div>
                <p className="text-slate-700 dark:text-zinc-300 leading-relaxed font-medium">
                  {technique.breathing}
                </p>
              </div>

              {/* Common Mistakes */}
              {technique.mistakes && technique.mistakes.length > 0 && (
                <div className="bg-amber-50/60 dark:bg-amber-950/30 p-3.5 rounded-2xl border border-amber-200 dark:border-amber-800/50">
                  <div className="flex items-center gap-2 text-amber-700 dark:text-amber-400 font-bold mb-1.5">
                    <AlertTriangle className="w-4 h-4" />
                    <span>Частые ошибки (избегайте травм)</span>
                  </div>
                  <ul className="list-disc list-inside space-y-1 text-slate-700 dark:text-zinc-300">
                    {technique.mistakes.map((m, idx) => (
                      <li key={idx} className="leading-relaxed">{m}</li>
                    ))}
                  </ul>
                </div>
              )}

            </div>
          ) : (
            <p className="text-slate-500 text-center py-4 text-xs">
              Техника выполняется подконтрольно с прямой спиной и фиксацией в конечной точке.
            </p>
          )}

        </div>

        {/* Footer */}
        <div className="p-3 border-t border-slate-200 dark:border-zinc-800 bg-slate-50 dark:bg-zinc-950 flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2 bg-slate-900 dark:bg-white text-white dark:text-black font-bold text-xs sm:text-sm rounded-xl hover:opacity-90 transition"
          >
            Закрыть
          </button>
        </div>

      </div>
    </div>
  );
};
