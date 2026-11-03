import React from 'react';
import { Home, BarChart2, Settings } from 'lucide-react';
import { cn } from '../utils/cn';

interface NavigationProps {
  activeTab: 'home' | 'analytics';
  onSelectTab: (tab: 'home' | 'analytics') => void;
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
    <div className="fixed bottom-0 inset-x-0 z-40 bg-ink/95 backdrop-blur-xl border-t border-white/10 px-3 pt-2 pb-[max(0.65rem,env(safe-area-inset-bottom))]">
      {hasActiveWorkout && (
        <div className="max-w-md mx-auto mb-2 px-1">
          <button
            type="button"
            onClick={onReturnToActiveWorkout}
            className="w-full flex items-center justify-center gap-2 bg-lime text-ink px-4 py-2.5 rounded-2xl font-bold text-xs shadow-lg shadow-lime/15 active:scale-95 transition min-h-[44px]"
          >
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-ink opacity-40" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-ink" />
            </span>
            <span>Вернуться к тренировке</span>
          </button>
        </div>
      )}

      <div className="max-w-md mx-auto flex items-center justify-around">
        <button
          type="button"
          onClick={() => onSelectTab('home')}
          className={cn(
            'flex flex-col items-center justify-center gap-1 py-1.5 px-3 rounded-xl min-w-[64px] min-h-[48px] active:scale-95 transition',
            activeTab === 'home' ? 'text-lime font-bold' : 'text-white/40 hover:text-white/70'
          )}
        >
          <Home className="w-5 h-5" />
          <span className="text-[10px] tracking-wide font-medium">Главная</span>
        </button>

        <button
          type="button"
          onClick={() => onSelectTab('analytics')}
          className={cn(
            'flex flex-col items-center justify-center gap-1 py-1.5 px-3 rounded-xl min-w-[64px] min-h-[48px] active:scale-95 transition',
            activeTab === 'analytics' ? 'text-lime font-bold' : 'text-white/40 hover:text-white/70'
          )}
        >
          <BarChart2 className="w-5 h-5" />
          <span className="text-[10px] tracking-wide font-medium">Аналитика</span>
        </button>

        <button
          type="button"
          onClick={onOpenSettings}
          className="flex flex-col items-center justify-center gap-1 py-1.5 px-3 text-white/40 hover:text-white/70 rounded-xl min-w-[64px] min-h-[48px] active:scale-95 transition"
        >
          <Settings className="w-5 h-5" />
          <span className="text-[10px] tracking-wide font-medium">Ещё</span>
        </button>
      </div>
    </div>
  );
};
