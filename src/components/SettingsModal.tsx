import React, { useRef, useState } from 'react';
import { 
  X, 
  Volume1,
  Volume2, 
  VolumeX, 
  Smartphone, 
  Download, 
  Upload, 
  RotateCcw, 
  Undo2,
  Mic,
  Focus,
  HeartPulse,
  Settings
} from 'lucide-react';
import { AppSettings, CompletedWorkout } from '../types';
import { storageService, getLocalStorageUsage, LOCALSTORAGE_BUDGET_BYTES } from '../services/storageService';
import { downloadCsv, workoutsToCsv } from '../utils/healthExport';
import { cn } from '../utils/cn';
import { useDialogA11y } from '../hooks/useDialogA11y';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  settings: AppSettings;
  history?: CompletedWorkout[];
  onUpdateSettings: (newSettings: AppSettings) => void;
  onDataReload: () => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen,
  onClose,
  settings,
  history = [],
  onUpdateSettings,
  onDataReload
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [importStatus, setImportStatus] = useState<string | null>(null);
  const storageUsage = isOpen && typeof localStorage !== 'undefined' ? getLocalStorageUsage(localStorage) : 0;
  const { containerRef, dialogProps } = useDialogA11y({
    isOpen,
    onClose,
    titleId: 'settings-dialog-title'
  });

  if (!isOpen) return null;

  const handleExport = () => {
    const json = storageService.exportBackupJson();
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `ironforge_backup_${new Date().toISOString().slice(0, 10)}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    onUpdateSettings(storageService.getSettings());
    setImportStatus('Резервная копия скачана.');
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = event => {
      const content = event.target?.result as string;
      if (content) {
        const ok = storageService.importBackupJson(content);
        if (ok) {
          setImportStatus('Резервная копия успешно восстановлена!');
          onDataReload();
          setTimeout(() => setImportStatus(null), 3000);
        } else {
          setImportStatus('Ошибка чтения файла. Проверьте формат JSON.');
        }
      }
    };
    reader.readAsText(file);
  };

  const handleUndoImport = () => {
    if (storageService.restoreEmergencySnapshot()) {
      setImportStatus('Предыдущее состояние успешно возвращено (Undo)!');
      onDataReload();
      setTimeout(() => setImportStatus(null), 4000);
    }
  };

  const handleReset = () => {
    if (window.confirm('Внимание! Это удалит все сохраненные тренировки и сбросит прогресс к начальным настройкам. Продолжить?')) {
      storageService.resetAllData();
      onDataReload();
      onClose();
    }
  };

  const renderToggle = (
    checked: boolean,
    onChange: () => void,
    label: string
  ) => (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={label}
      onClick={onChange}
      className="min-h-[44px] min-w-[48px] inline-flex items-center justify-center p-0 bg-transparent border-0 shrink-0 cursor-pointer"
    >
      <span className={cn('w-12 h-6 rounded-full transition relative block', checked ? 'bg-lime' : 'bg-white/15')}>
        <span
          className={cn(
            'w-5 h-5 rounded-full bg-white absolute top-0.5 transition-all block',
            checked ? 'right-0.5' : 'left-0.5'
          )}
        />
      </span>
    </button>
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/75 backdrop-blur-sm animate-fade-in text-white">
      <div ref={containerRef} {...dialogProps} className="w-full max-w-md surface-panel p-4 sm:p-6 border-lime/20 max-h-[min(92dvh,calc(100dvh-1.5rem))] overflow-y-auto">

        {/* Header */}
        <div className="flex items-center justify-between pb-3 sm:pb-4 border-b border-white/10">
          <div className="flex items-center gap-2">
            <Settings className="w-5 h-5 text-lime" />
            <h3 id="settings-dialog-title" className="font-bold text-base sm:text-lg text-white">Настройки IronForge</h3>
          </div>
          <button 
            onClick={onClose}
            className="min-h-[44px] min-w-[44px] flex items-center justify-center text-muted hover:text-white rounded-xl hover:bg-white/5 active:scale-95 transition"
            aria-label="Закрыть"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {history.length > 0 && (!settings.lastBackupAt || Date.now() - settings.lastBackupAt > 14 * 86400000) && <p className="mt-3 rounded-xl border border-amber-400/20 bg-amber-400/5 p-3 text-xs text-amber-200">Пора сохранить резервную копию тренировок в JSON.</p>}
        <div className="mt-3 rounded-xl border border-white/10 bg-white/[0.03] p-3 text-xs text-muted">Данные приложения: {(storageUsage / 1048576).toFixed(1)} МБ из ~5 МБ{storageUsage / LOCALSTORAGE_BUDGET_BYTES > 0.6 && <p className="mt-1 text-amber-300">Места остаётся мало. Скачайте резервную копию.</p>}</div>

        {/* Settings list */}
        <div className="my-5 space-y-4">
          
          {/* Sound Toggle */}
          <div className="flex items-center justify-between bg-white/[0.03] p-3.5 rounded-2xl border border-white/10">
            <div className="flex items-center gap-3">
              {settings.soundEnabled ? (
                <Volume2 className="w-5 h-5 text-lime" />
              ) : (
                <VolumeX className="w-5 h-5 text-muted" />
              )}
              <div>
                <span className="font-semibold text-sm text-white block">Звуки таймера</span>
                <span className="text-xs text-muted">Сигнал окончания отдыха</span>
              </div>
            </div>
            {renderToggle(
              settings.soundEnabled,
              () => onUpdateSettings({ ...settings, soundEnabled: !settings.soundEnabled }),
              'Звуки таймера'
            )}
          </div>

          {/* Vibration Toggle */}
          <div className="flex items-center justify-between bg-white/[0.03] p-3.5 rounded-2xl border border-white/10">
            <div className="flex items-center gap-3">
              <Smartphone className="w-5 h-5 text-lime" />
              <div>
                <span className="font-semibold text-sm text-white block">Вибрация (Haptic)</span>
                <span className="text-xs text-muted">После подхода и отдыха</span>
              </div>
            </div>
            {renderToggle(
              settings.vibrationEnabled,
              () => onUpdateSettings({ ...settings, vibrationEnabled: !settings.vibrationEnabled }),
              'Вибрация (Haptic)'
            )}
          </div>

          {/* Voice countdown */}
          <div className="flex items-center justify-between bg-white/[0.03] p-3.5 rounded-2xl border border-white/10">
            <div className="flex items-center gap-3">
              <Mic className="w-5 h-5 text-lime" />
              <div>
                <span className="font-semibold text-sm text-white block">Голосовой отсчёт</span>
                <span className="text-xs text-muted">Последние секунды отдыха</span>
              </div>
            </div>
            {renderToggle(
              settings.voiceEnabled,
              () => onUpdateSettings({ ...settings, voiceEnabled: !settings.voiceEnabled }),
              'Голосовой отсчёт'
            )}
          </div>

          {/* Audio Ducking Toggle */}
          <div className="flex items-center justify-between bg-white/[0.03] p-3.5 rounded-2xl border border-white/10">
            <div className="flex items-center gap-3">
              <Volume1 className="w-5 h-5 text-lime" />
              <div>
                <span className="font-semibold text-sm text-white block">Приглушать музыку при сигналах</span>
                <span className="text-xs text-muted">Audio Session API (Safari 16.4+)</span>
              </div>
            </div>
            {renderToggle(
              settings.audioDuckingEnabled ?? true,
              () => onUpdateSettings({ ...settings, audioDuckingEnabled: !(settings.audioDuckingEnabled ?? true) }),
              'Приглушать музыку при сигналах'
            )}
          </div>

          {/* Focus mode default */}
          <div className="flex items-center justify-between bg-white/[0.03] p-3.5 rounded-2xl border border-white/10">
            <div className="flex items-center gap-3">
              <Focus className="w-5 h-5 text-lime" />
              <div>
                <span className="font-semibold text-sm text-white block">Фокус-режим по умолчанию</span>
                <span className="text-xs text-muted">Крупный текущий сет на весь экран</span>
              </div>
            </div>
            {renderToggle(
              settings.focusModeDefault,
              () => onUpdateSettings({ ...settings, focusModeDefault: !settings.focusModeDefault }),
              'Фокус-режим по умолчанию'
            )}
          </div>

          {/* Barbell Weight default */}
          <div className="bg-white/[0.03] p-3.5 rounded-2xl border border-white/10 space-y-2">
            <div className="flex items-center justify-between">
              <span className="font-semibold text-sm text-white">Вес грифа по умолчанию</span>
              <span className="font-mono text-xs text-lime font-bold">{settings.barbellWeightKg} кг</span>
            </div>
            <div className="flex gap-2">
              {[20, 15, 10].map(w => (
                <button
                  key={w}
                  onClick={() => onUpdateSettings({ ...settings, barbellWeightKg: w })}
                  type="button"
                  className={cn(
                    'flex-1 min-h-[44px] flex items-center justify-center py-1.5 rounded-xl text-xs font-semibold transition',
                    settings.barbellWeightKg === w
                      ? 'btn-lime'
                      : 'bg-white/[0.04] text-muted border border-white/10'
                  )}
                >
                  {w} кг
                </button>
              ))}
            </div>
          </div>

          {/* Health CSV + Backup */}
          <div className="bg-white/[0.03] p-3.5 rounded-2xl border border-white/10 space-y-3">
            <span className="text-xs font-bold uppercase tracking-wider text-muted block">
              Экспорт и резервные копии
            </span>
            <button
              onClick={() => {
                downloadCsv(
                  `ironforge_health_${new Date().toISOString().slice(0, 10)}.csv`,
                  workoutsToCsv(history)
                );
              }}
              type="button" className="w-full min-h-[44px] py-2 px-3 bg-white/[0.04] hover:bg-white/[0.07] text-white text-xs font-semibold rounded-xl flex items-center justify-center gap-1.5 border border-white/10 transition"
            >
              <HeartPulse className="w-4 h-4 text-rose-400" /> Скачать CSV тренировок
            </button>
            <div className="flex gap-2">
              <button
                onClick={handleExport}
                className="flex-1 py-2 px-3 bg-white/[0.04] hover:bg-white/[0.07] text-white text-xs font-semibold rounded-xl flex items-center justify-center gap-1.5 border border-white/10 transition"
              >
                <Download className="w-4 h-4 text-lime" /> JSON
              </button>
              <button
                onClick={() => fileInputRef.current?.click()}
                className="flex-1 py-2 px-3 bg-white/[0.04] hover:bg-white/[0.07] text-white text-xs font-semibold rounded-xl flex items-center justify-center gap-1.5 border border-white/10 transition"
              >
                <Upload className="w-4 h-4 text-sky-400" /> Импорт
              </button>
              <input
                ref={fileInputRef}
                type="file"
                accept=".json"
                className="hidden"
                onChange={handleFileChange}
              />
            </div>

            {storageService.hasEmergencySnapshot() && (
              <button
                onClick={handleUndoImport}
                type="button" className="w-full min-h-[44px] py-2 px-3 bg-amber-500/10 hover:bg-amber-500/20 text-amber-400 border border-amber-500/30 text-xs font-bold rounded-xl flex items-center justify-center gap-1.5 transition active:scale-98"
              >
                <Undo2 className="w-4 h-4" /> Откатить последний импорт (Undo)
              </button>
            )}

            {importStatus && (
              <p className="text-xs text-lime text-center font-medium bg-lime/10 p-2 rounded-lg border border-lime/20">
                {importStatus}
              </p>
            )}
          </div>

          {/* Factory Reset */}
          <button
            onClick={handleReset}
            type="button" className="w-full min-h-[44px] py-2.5 text-xs font-semibold text-rose-400 hover:bg-rose-500/10 border border-rose-500/30 rounded-xl flex items-center justify-center gap-2 transition"
          >
            <RotateCcw className="w-4 h-4" /> Сбросить данные к заводским
          </button>

        </div>

      </div>
    </div>
  );
};
