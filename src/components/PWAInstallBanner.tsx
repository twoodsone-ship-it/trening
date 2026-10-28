import React, { useEffect, useState } from 'react';
import { Download, X, Smartphone, Share2, PlusSquare } from 'lucide-react';

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

export const PWAInstallBanner: React.FC = () => {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [isIOS, setIsIOS] = useState(false);
  const [isStandalone, setIsStandalone] = useState(false);
  const [dismissed, setDismissed] = useState(false);
  const [showIOSInstructions, setShowIOSInstructions] = useState(false);

  useEffect(() => {
    // Check if already in standalone mode
    const isStandaloneMode = window.matchMedia('(display-mode: standalone)').matches ||
      (window.navigator as unknown as { standalone?: boolean }).standalone === true;
    setIsStandalone(isStandaloneMode);

    // Check if iOS device
    const userAgent = window.navigator.userAgent.toLowerCase();
    const isAppleDevice = /iphone|ipad|ipod/.test(userAgent);
    setIsIOS(isAppleDevice);

    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    return () => window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
  }, []);

  if (isStandalone || dismissed) return null;

  const handleInstallClick = async () => {
    if (deferredPrompt) {
      await deferredPrompt.prompt();
      const choice = await deferredPrompt.userChoice;
      if (choice.outcome === 'accepted') {
        setDeferredPrompt(null);
      }
    } else if (isIOS) {
      setShowIOSInstructions(true);
    }
  };

  return (
    <>
      <div className="bg-gradient-to-r from-emerald-950/80 via-zinc-900 to-zinc-900 border-b border-emerald-500/30 px-4 py-2.5 text-xs text-zinc-200">
        <div className="max-w-2xl mx-auto flex items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <Smartphone className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>Установите IronForge как приложение для тренировок офлайн в зале</span>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={handleInstallClick}
              className="px-3 py-1 bg-emerald-500 hover:bg-emerald-400 text-black font-bold rounded-lg transition"
            >
              Установить
            </button>
            <button
              onClick={() => setDismissed(true)}
              className="p-1 text-zinc-400 hover:text-white"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* iOS Instructions Modal */}
      {showIOSInstructions && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="w-full max-w-sm bg-zinc-900 border border-zinc-700 rounded-2xl p-5 shadow-2xl text-white">
            <h3 className="font-bold text-base mb-3 flex items-center gap-2">
              <Smartphone className="w-5 h-5 text-emerald-400" /> Установка на iOS Safari
            </h3>
            <ol className="space-y-3 text-xs text-zinc-300">
              <li className="flex items-start gap-2">
                <span className="font-bold text-emerald-400 font-mono">1.</span>
                <span>Нажмите кнопку «Поделиться» <Share2 className="w-3.5 h-3.5 inline mx-1 text-blue-400" /> в нижней панели Safari.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="font-bold text-emerald-400 font-mono">2.</span>
                <span>Прокрутите вниз и выберите «На экран «Домой»» <PlusSquare className="w-3.5 h-3.5 inline mx-1 text-zinc-300" />.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="font-bold text-emerald-400 font-mono">3.</span>
                <span>Нажмите «Добавить» в правом верхнем углу.</span>
              </li>
            </ol>
            <button
              onClick={() => setShowIOSInstructions(false)}
              className="w-full mt-4 py-2.5 bg-emerald-500 hover:bg-emerald-400 text-black font-bold text-xs rounded-xl transition"
            >
              Понятно
            </button>
          </div>
        </div>
      )}
    </>
  );
};
