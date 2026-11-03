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
    /* ~4.75rem + safe-area; screens with sticky CTAs should use pb-[calc(7rem+env(safe-area-inset-bottom))] */
    <div className="fixed bottom-0 inset-x-0 z-40 bg-ink/90 backdrop-blur-xl border-t border-white/10 px-4 pt-2 pb-[max(0.65rem,env(safe-area-inset-bottom))]">
      <div className="max-w-md mx-auto flex items-center justify-around relative">
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

        {hasActiveWorkout && (
          <button
            onClick={onReturnToActiveWorkout}
            className="flex items-center gap-2 -top-5 relative bg-lime text-ink px-4 py-2.5 rounded-full font-bold text-xs shadow-xl shadow-lime/20 active:scale-95 transition min-h-[44px]"
          >
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-ink opacity-40" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-ink" />
            </span>
            <span className="whitespace-nowrap">Идёт тренировка</span>
          </button>
        )}

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
