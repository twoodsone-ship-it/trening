import React, { useState, useMemo, useRef } from 'react';
import { X, Copy, Check, Share2, Sparkles, AlertCircle } from 'lucide-react';
import type { CompletedWorkout, AppSettings } from '../types';
import { buildAiReviewReport } from '../utils/aiReview';
import { useDialogA11y } from '../hooks/useDialogA11y';
import { cn } from '../utils/cn';

interface AiReviewModalProps {
  isOpen: boolean;
  history: CompletedWorkout[];
  settings: AppSettings;
  onClose: () => void;
}

export const AiReviewModal: React.FC<AiReviewModalProps> = ({
  isOpen,
  history,
  settings,
  onClose
}) => {
  const [period, setPeriod] = useState<'2w' | '4w' | 'last8'>('2w');
  const [userNote, setUserNote] = useState('');
  const [copied, setCopied] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const touchStartY = useRef<number | null>(null);

  const { containerRef, dialogProps } = useDialogA11y({
    isOpen,
    onClose,
    titleId: 'ai-review-title'
  });

  const reportText = useMemo(() => {
    return buildAiReviewReport(history, settings, {
      period,
      userNote: userNote.trim() ? userNote.trim() : undefined
    });
  }, [history, settings, period, userNote]);

  if (!isOpen) return null;

  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartY.current = e.touches[0].clientY;
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (touchStartY.current != null) {
      const deltaY = e.changedTouches[0].clientY - touchStartY.current;
      // Swipe down gesture to dismiss
      if (deltaY > 80) {
        onClose();
      }
      touchStartY.current = null;
    }
  };

  const handleCopy = async () => {
    let success = false;
    if (navigator.clipboard && navigator.clipboard.writeText) {
      try {
        await navigator.clipboard.writeText(reportText);
        success = true;
      } catch (err) {
        console.warn('navigator.clipboard.writeText failed, using fallback', err);
      }
    }

    // Fallback via select + execCommand for iOS Safari PWA limitations
    if (!success && textareaRef.current) {
      try {
        textareaRef.current.focus();
        textareaRef.current.select();
        textareaRef.current.setSelectionRange(0, reportText.length);
        const res = document.execCommand('copy');
        if (res) success = true;
      } catch (err) {
        console.error('execCommand copy fallback failed', err);
      }
    }

    if (success) {
      setCopied(true);
      setTimeout(() => setCopied(false), 2200);
    }
  };

  const canShare = typeof navigator !== 'undefined' && typeof navigator.share === 'function';

  const handleShare = async () => {
    if (!canShare) return;
    try {
      await navigator.share({
        title: 'Разбор тренировок IronForge для ИИ',
        text: reportText
      });
    } catch (err) {
      // User cancelled share or dismissed
      console.log('Share dismissed or not completed', err);
    }
  };

  const charCount = reportText.length;
  const isNearLimit = charCount > 11500;

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
      <div
        ref={containerRef}
        {...dialogProps}
        className="w-full max-w-2xl surface-panel bg-ink-2 border border-white/10 rounded-t-3xl sm:rounded-2xl max-h-[92dvh] sm:max-h-[88dvh] flex flex-col text-white shadow-2xl animate-slide-up"
      >
        {/* Swipe drag handle for mobile */}
        <div
          onTouchStart={handleTouchStart}
          onTouchEnd={handleTouchEnd}
          className="pt-3 pb-1 cursor-grab active:cursor-grabbing sm:hidden flex justify-center"
        >
          <div className="w-12 h-1.5 rounded-full bg-white/25" />
        </div>

        {/* Header */}
        <div
          onTouchStart={handleTouchStart}
          onTouchEnd={handleTouchEnd}
          className="p-4 sm:p-5 border-b border-white/10 flex items-center justify-between gap-3"
        >
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-9 h-9 rounded-xl bg-lime/10 border border-lime/30 flex items-center justify-center shrink-0">
              <Sparkles className="w-5 h-5 text-lime" />
            </div>
            <div className="min-w-0">
              <h2 id="ai-review-title" className="font-display text-lg sm:text-xl font-bold text-white truncate">
                Разбор тренировок для ИИ
              </h2>
              <p className="text-xs text-muted truncate">
                Скопируйте отчёт и вставьте в любой чат с ИИ (ChatGPT, Claude, Gemini)
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Закрыть"
            className="min-h-[48px] min-w-[48px] flex items-center justify-center rounded-xl bg-white/5 hover:bg-white/10 text-muted hover:text-white transition shrink-0"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content body */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-4">
          {/* Period selector */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold uppercase tracking-wider text-muted">
              Период анализа
            </label>
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => setPeriod('2w')}
                className={cn(
                  'min-h-[48px] px-3 py-2 rounded-xl text-xs sm:text-sm font-bold border transition flex items-center justify-center text-center',
                  period === '2w'
                    ? 'bg-lime text-ink border-lime shadow-lg shadow-lime/10'
                    : 'bg-white/[0.04] text-muted border-white/10 hover:bg-white/10'
                )}
              >
                2 недели
              </button>
              <button
                type="button"
                onClick={() => setPeriod('4w')}
                className={cn(
                  'min-h-[48px] px-3 py-2 rounded-xl text-xs sm:text-sm font-bold border transition flex items-center justify-center text-center',
                  period === '4w'
                    ? 'bg-lime text-ink border-lime shadow-lg shadow-lime/10'
                    : 'bg-white/[0.04] text-muted border-white/10 hover:bg-white/10'
                )}
              >
                4 недели
              </button>
              <button
                type="button"
                onClick={() => setPeriod('last8')}
                className={cn(
                  'min-h-[48px] px-3 py-2 rounded-xl text-xs sm:text-sm font-bold border transition flex items-center justify-center text-center',
                  period === 'last8'
                    ? 'bg-lime text-ink border-lime shadow-lg shadow-lime/10'
                    : 'bg-white/[0.04] text-muted border-white/10 hover:bg-white/10'
                )}
              >
                Последние 8
              </button>
            </div>
          </div>

          {/* User note optional input */}
          <div className="space-y-1.5">
            <label htmlFor="ai-review-note" className="text-xs font-bold uppercase tracking-wider text-muted flex items-center justify-between">
              <span>О чём спросить, что беспокоит</span>
              <span className="text-muted/60 font-normal lowercase">(необязательно)</span>
            </label>
            <textarea
              id="ai-review-note"
              rows={2}
              value={userNote}
              onChange={e => setUserNote(e.target.value)}
              placeholder="Например: «Болит правое плечо при жиме лёжа», «Хочу добавить подтягивания», «Чувствую сильную усталость»..."
              className="w-full bg-white/[0.03] border border-white/10 focus:border-lime/50 rounded-xl p-3 text-xs sm:text-sm text-white placeholder-muted/60 outline-none transition resize-none"
            />
          </div>

          {/* Text preview with character counter */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between text-xs">
              <span className="font-bold uppercase tracking-wider text-muted">
                Превью итогового текста для ИИ
              </span>
              <span className={cn('font-mono font-medium', isNearLimit ? 'text-amber-400' : 'text-muted')}>
                {charCount.toLocaleString('ru-RU')} / 12 000 символов
              </span>
            </div>

            <div className="relative">
              <textarea
                ref={textareaRef}
                readOnly
                value={reportText}
                rows={11}
                className="w-full font-mono text-xs leading-relaxed bg-black/50 border border-white/10 rounded-xl p-3 text-zinc-300 outline-none select-all resize-none shadow-inner"
              />
            </div>
          </div>

          {history.length < 2 && (
            <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-400/20 text-xs text-amber-200 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 text-amber-400" />
              <span>
                В истории пока мало данных. Рекомендуется накопить хотя бы 2–3 тренировки для более точного анализа прогресса.
              </span>
            </div>
          )}
        </div>

        {/* Action Footer */}
        <div className="p-4 sm:p-5 border-t border-white/10 bg-black/20 flex flex-wrap sm:flex-nowrap items-center gap-3">
          <button
            type="button"
            onClick={handleCopy}
            className={cn(
              'min-h-[48px] flex-1 px-4 py-3 rounded-xl font-bold text-sm transition flex items-center justify-center gap-2 shadow-lg',
              copied
                ? 'bg-emerald-500 text-black border border-emerald-400'
                : 'bg-lime hover:bg-lime/90 active:scale-[0.98] text-ink shadow-lime/10'
            )}
          >
            {copied ? (
              <>
                <Check className="w-5 h-5" />
                <span>Скопировано в буфер!</span>
              </>
            ) : (
              <>
                <Copy className="w-5 h-5" />
                <span>Скопировать отчёт</span>
              </>
            )}
          </button>

          {canShare && (
            <button
              type="button"
              onClick={handleShare}
              className="min-h-[48px] px-4 py-3 rounded-xl font-bold text-sm bg-white/[0.06] hover:bg-white/10 active:scale-[0.98] text-white border border-white/10 transition flex items-center justify-center gap-2"
            >
              <Share2 className="w-5 h-5 text-muted" />
              <span>Поделиться</span>
            </button>
          )}

          <button
            type="button"
            onClick={onClose}
            className="min-h-[48px] px-4 py-3 rounded-xl font-bold text-sm bg-transparent hover:bg-white/5 text-muted hover:text-white transition"
          >
            Закрыть
          </button>
        </div>
      </div>
    </div>
  );
};
