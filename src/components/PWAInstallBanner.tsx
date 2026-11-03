import React, { useEffect, useState } from 'react';
import { X, Smartphone, Share2, PlusSquare } from 'lucide-react';

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
    const isStandaloneMode = window.matchMedia('(display-mode: standalone)').matches ||
      (window.navigator as unknown as { standalone?: boolean }).standalone === true;
    setIsStandalone(isStandaloneMode);

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
      <div className="bg-ink-2/95 border-b border-lime/25 px-4 py-2.5 text-xs text-white backdrop-blur">
        <div className="max-w-2xl mx-auto flex items-center justify-between gap-3">
          <div className="flex items-center gap-2 min-w-0">
            <Smartphone className="w-4 h-4 text-lime shrink-0" />
            <span className="text-muted truncate sm:whitespace-normal">
              Установите IronForge как приложение для тренировок офлайн в зале
            </span>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <button
              type="button"
              onClick={handleInstallClick}
              className="px-3 py-1.5 btn-lime rounded-xl text-xs min-h-[36px] transition"
            >
              Установить
            </button>
            <button
              type="button"
              onClick={() => setDismissed(true)}
              className="p-2 min-h-[36px] min-w-[36px] flex items-center justify-center text-muted hover:text-white"
              aria-label="Закрыть"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {showIOSInstructions && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
          <div className="w-full max-w-sm surface-panel p-5 border-lime/20 text-white animate-slide-up">
            <h3 className="font-extrabold text-base mb-3 flex items-center gap-2">
              <Smartphone className="w-5 h-5 text-lime" /> Установка на iOS Safari
            </h3>
            <ol className="space-y-3 text-sm text-muted">
              <li className="flex items-start gap-2">
                <span className="font-bold text-lime font-mono">1.</span>
                <span>Нажмите кнопку «Поделиться» <Share2 className="w-3.5 h-3.5 inline mx-1 text-sky-400" /> в нижней панели Safari.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="font-bold text-lime font-mono">2.</span>
                <span>Прокрутите вниз и выберите «На экран «Домой»» <PlusSquare className="w-3.5 h-3.5 inline mx-1" />.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="font-bold text-lime font-mono">3.</span>
                <span>Нажмите «Добавить» в правом верхнем углу.</span>
              </li>
            </ol>
            <button
              type="button"
              onClick={() => setShowIOSInstructions(false)}
              className="w-full mt-4 py-3 btn-lime text-sm rounded-2xl min-h-[48px] transition"
            >
              Понятно
            </button>
          </div>
        </div>
      )}
    </>
  );
};
