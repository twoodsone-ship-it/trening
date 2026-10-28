import React from 'react';
import { Layers, BarChart2, Settings, Play, Dumbbell } from 'lucide-react';

interface NavigationProps {
  activeTab: 'templates' | 'analytics';
  onSelectTab: (tab: 'templates' | 'analytics') => void;
  onOpenSettings: () => void;
  hasActiveWorkout: boolean;
  onReturnToActiveWorkout: () => void;
}

export const Navigation: React.FC<NavigationProps> = ({
  activeTab,
  onSelectTab,
  onOpenSettings,
  hasActiveWorkout,
  onReturnToActiveWorkout
}) => {
  return (
    <div className="fixed bottom-0 inset-x-0 z-40 bg-zinc-950/95 backdrop-blur-lg border-t border-zinc-800/80 px-4 py-2">
      <div className="max-w-md mx-auto flex items-center justify-around relative">
        
        {/* Templates Tab */}
        <button
          onClick={() => onSelectTab('templates')}
          className={`flex flex-col items-center gap-1 py-1 px-4 rounded-xl transition ${
            activeTab === 'templates'
              ? 'text-emerald-400 font-bold'
              : 'text-zinc-500 hover:text-zinc-300'
          }`}
        >
          <Layers className="w-5 h-5" />
          <span className="text-[10px] tracking-wide">Программы</span>
        </button>

        {/* Floating Active Workout Pill in Center if active */}
        {hasActiveWorkout && (
          <button
            onClick={onReturnToActiveWorkout}
            className="flex items-center gap-2 -top-5 relative bg-emerald-500 hover:bg-emerald-400 text-black px-4 py-2.5 rounded-full font-bold text-xs shadow-xl shadow-emerald-950/60 active:scale-95 transition"
          >
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-black opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-black"></span>
            </span>
            <span>Идет тренировка</span>
          </button>
        )}

        {/* Analytics Tab */}
        <button
          onClick={() => onSelectTab('analytics')}
          className={`flex flex-col items-center gap-1 py-1 px-4 rounded-xl transition ${
            activeTab === 'analytics'
              ? 'text-emerald-400 font-bold'
              : 'text-zinc-500 hover:text-zinc-300'
          }`}
        >
          <BarChart2 className="w-5 h-5" />
          <span className="text-[10px] tracking-wide">Аналитика</span>
        </button>

        {/* Settings Button */}
        <button
          onClick={onOpenSettings}
          className="flex flex-col items-center gap-1 py-1 px-4 text-zinc-500 hover:text-zinc-300 rounded-xl transition"
        >
          <Settings className="w-5 h-5" />
          <span className="text-[10px] tracking-wide">Настройки</span>
        </button>

      </div>
    </div>
  );
};
