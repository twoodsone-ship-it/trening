import React, { useRef, useState } from 'react';
import { 
  X, 
  Volume2, 
  VolumeX, 
  Smartphone, 
  Download, 
  Upload, 
  RotateCcw, 
  Sun,
  Moon,
  Repeat,
  Undo2,
  Mic,
  Focus,
  HeartPulse,
  Settings
} from 'lucide-react';
import { AppSettings, CompletedWorkout } from '../types';
import { storageService } from '../services/storageService';
import { downloadCsv, workoutsToCsv } from '../utils/healthExport';
import { cn } from '../utils/cn';

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

  const toggleTrack = (on: boolean) =>
    cn('w-12 h-6 rounded-full transition relative', on ? 'bg-lime' : 'bg-white/15');

  const segmentBtn = (active: boolean) =>
    cn(
      'py-2 px-3 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition',
      active
        ? 'btn-lime'
        : 'bg-white/[0.04] text-muted border border-white/10 hover:text-white'
    );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/75 backdrop-blur-sm animate-fade-in text-white">
      <div className="w-full max-w-md surface-panel p-4 sm:p-6 border-lime/20 max-h-[min(92dvh,calc(100dvh-1.5rem))] overflow-y-auto">
        
        {/* Header */}
        <div className="flex items-center justify-between pb-3 sm:pb-4 border-b border-white/10">
          <div className="flex items-center gap-2">
            <Settings className="w-5 h-5 text-lime" />
            <h3 className="font-bold text-base sm:text-lg text-white">Настройки IronForge</h3>
          </div>
          <button 
            onClick={onClose}
            className="w-9 h-9 flex items-center justify-center text-muted hover:text-white rounded-xl hover:bg-white/5 active:scale-95 transition"
            aria-label="Закрыть"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Settings list */}
        <div className="my-5 space-y-4">
          
          {/* Theme Selector (Light vs Dark) */}
          <div className="bg-white/[0.03] p-3.5 rounded-2xl border border-white/10 space-y-2">
            <div className="flex items-center justify-between">
              <span className="font-semibold text-sm text-white">Тема оформления</span>
              <span className="text-xs text-muted font-medium">
                {settings.theme === 'light' ? 'Светлая' : 'Тёмная OLED'}
              </span>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => onUpdateSettings({ ...settings, theme: 'light' })}
                className={segmentBtn(settings.theme === 'light')}
              >
                <Sun className="w-4 h-4" /> ☀️ Светлая
              </button>
              <button
                onClick={() => onUpdateSettings({ ...settings, theme: 'dark' })}
                className={segmentBtn(settings.theme === 'dark')}
              >
                <Moon className="w-4 h-4" /> 🌙 Тёмная
              </button>
            </div>
          </div>

          {/* Weekly Rotation Option */}
          <div className="bg-white/[0.03] p-3.5 rounded-2xl border border-white/10 space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Repeat className="w-4 h-4 text-lime" />
                <span className="font-semibold text-sm text-white">Текущая неделя ротации</span>
              </div>
              <span className="text-xs font-mono font-bold text-lime">
                Неделя {settings.currentWeek || 'A'}
              </span>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => onUpdateSettings({ ...settings, currentWeek: 'A' })}
                className={segmentBtn(settings.currentWeek === 'A')}
              >
                Неделя 1 (Вариант А)
              </button>
              <button
                onClick={() => onUpdateSettings({ ...settings, currentWeek: 'B' })}
                className={segmentBtn(settings.currentWeek === 'B')}
              >
                Неделя 2 (Вариант Б)
              </button>
            </div>
          </div>

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
                <span className="text-xs text-muted">Сигнал окончания отдыха (Web Audio)</span>
              </div>
            </div>
            <button
              onClick={() => onUpdateSettings({ ...settings, soundEnabled: !settings.soundEnabled })}
              className={toggleTrack(settings.soundEnabled)}
            >
              <div className={cn(
                'w-5 h-5 rounded-full bg-white absolute top-0.5 transition-transform',
                settings.soundEnabled ? 'right-0.5' : 'left-0.5'
              )} />
            </button>
          </div>

          {/* Vibration Toggle */}
          <div className="flex items-center justify-between bg-white/[0.03] p-3.5 rounded-2xl border border-white/10">
            <div className="flex items-center gap-3">
              <Smartphone className="w-5 h-5 text-lime" />
              <div>
                <span className="font-semibold text-sm text-white block">Вибрация (Haptic)</span>
                <span className="text-xs text-muted">Карта паттернов: сет / таймер / PR</span>
              </div>
            </div>
            <button
              onClick={() => onUpdateSettings({ ...settings, vibrationEnabled: !settings.vibrationEnabled })}
              className={toggleTrack(settings.vibrationEnabled)}
            >
              <div className={cn(
                'w-5 h-5 rounded-full bg-white absolute top-0.5 transition-transform',
                settings.vibrationEnabled ? 'right-0.5' : 'left-0.5'
              )} />
            </button>
          </div>

          {/* Voice countdown */}
          <div className="flex items-center justify-between bg-white/[0.03] p-3.5 rounded-2xl border border-white/10">
            <div className="flex items-center gap-3">
              <Mic className="w-5 h-5 text-lime" />
              <div>
                <span className="font-semibold text-sm text-white block">Голосовой отсчёт</span>
                <span className="text-xs text-muted">SpeechSynthesis: 3…2…1 и «начинайте»</span>
              </div>
            </div>
            <button
              onClick={() => onUpdateSettings({ ...settings, voiceEnabled: !settings.voiceEnabled })}
              className={toggleTrack(settings.voiceEnabled)}
            >
              <div className={cn(
                'w-5 h-5 rounded-full bg-white absolute top-0.5 transition-transform',
                settings.voiceEnabled ? 'right-0.5' : 'left-0.5'
              )} />
            </button>
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
            <button
              onClick={() => onUpdateSettings({ ...settings, focusModeDefault: !settings.focusModeDefault })}
              className={toggleTrack(settings.focusModeDefault)}
            >
              <div className={cn(
                'w-5 h-5 rounded-full bg-white absolute top-0.5 transition-transform',
                settings.focusModeDefault ? 'right-0.5' : 'left-0.5'
              )} />
            </button>
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
                  className={cn(
                    'flex-1 py-1.5 rounded-xl text-xs font-semibold transition',
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
              className="w-full py-2 px-3 bg-white/[0.04] hover:bg-white/[0.07] text-white text-xs font-semibold rounded-xl flex items-center justify-center gap-1.5 border border-white/10 transition"
            >
              <HeartPulse className="w-4 h-4 text-rose-400" /> CSV для Apple Health / Google Fit
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
                className="w-full py-2 px-3 bg-amber-500/10 hover:bg-amber-500/20 text-amber-400 border border-amber-500/30 text-xs font-bold rounded-xl flex items-center justify-center gap-1.5 transition active:scale-98"
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
            className="w-full py-2.5 text-xs font-semibold text-rose-400 hover:bg-rose-500/10 border border-rose-500/30 rounded-xl flex items-center justify-center gap-2 transition"
          >
            <RotateCcw className="w-4 h-4" /> Сбросить данные к заводским
          </button>

        </div>

      </div>
    </div>
  );
};
