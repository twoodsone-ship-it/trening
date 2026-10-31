import React, { useRef, useState } from 'react';
import { 
  X, 
  Volume2, 
  VolumeX, 
  Smartphone, 
  Download, 
  Upload, 
  RotateCcw, 
  ShieldAlert, 
  Check, 
  Dumbbell,
  Settings,
  Sun,
  Moon,
  Repeat
} from 'lucide-react';
import { AppSettings } from '../types';
import { storageService } from '../services/storageService';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  settings: AppSettings;
  onUpdateSettings: (newSettings: AppSettings) => void;
  onDataReload: () => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen,
  onClose,
  settings,
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

  const handleReset = () => {
    if (window.confirm('Внимание! Это удалит все сохраненные тренировки и сбросит прогресс к начальным настройкам. Продолжить?')) {
      storageService.resetAllData();
      onDataReload();
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/70 backdrop-blur-sm animate-fade-in text-slate-900 dark:text-zinc-100">
      <div className="w-full max-w-md bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-700 rounded-3xl p-4 sm:p-6 shadow-2xl max-h-[min(92dvh,calc(100dvh-1.5rem))] overflow-y-auto">
        
        {/* Header */}
        <div className="flex items-center justify-between pb-3 sm:pb-4 border-b border-slate-200 dark:border-zinc-800">
          <div className="flex items-center gap-2">
            <Settings className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
            <h3 className="font-bold text-base sm:text-lg text-slate-900 dark:text-white">Настройки IronForge</h3>
          </div>
          <button 
            onClick={onClose}
            className="w-9 h-9 flex items-center justify-center text-slate-400 hover:text-slate-700 dark:text-zinc-400 dark:hover:text-white rounded-xl hover:bg-slate-100 dark:hover:bg-zinc-800 active:scale-95 transition"
            aria-label="Закрыть"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Settings list */}
        <div className="my-5 space-y-4">
          
          {/* Theme Selector (Light vs Dark) */}
          <div className="bg-slate-50 dark:bg-zinc-950 p-3.5 rounded-2xl border border-slate-200 dark:border-zinc-800 space-y-2">
            <div className="flex items-center justify-between">
              <span className="font-semibold text-sm text-slate-800 dark:text-zinc-200">Тема оформления</span>
              <span className="text-xs text-slate-500 font-medium">
                {settings.theme === 'light' ? 'Светлая' : 'Тёмная OLED'}
              </span>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => onUpdateSettings({ ...settings, theme: 'light' })}
                className={`py-2 px-3 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition ${
                  settings.theme === 'light'
                    ? 'bg-emerald-500 text-white shadow-sm'
                    : 'bg-white dark:bg-zinc-900 text-slate-700 dark:text-zinc-300 border border-slate-200 dark:border-zinc-800'
                }`}
              >
                <Sun className="w-4 h-4" /> ☀️ Светлая
              </button>
              <button
                onClick={() => onUpdateSettings({ ...settings, theme: 'dark' })}
                className={`py-2 px-3 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition ${
                  settings.theme === 'dark'
                    ? 'bg-emerald-500 text-white shadow-sm'
                    : 'bg-white dark:bg-zinc-900 text-slate-700 dark:text-zinc-300 border border-slate-200 dark:border-zinc-800'
                }`}
              >
                <Moon className="w-4 h-4" /> 🌙 Тёмная
              </button>
            </div>
          </div>

          {/* Weekly Rotation Option */}
          <div className="bg-slate-50 dark:bg-zinc-950 p-3.5 rounded-2xl border border-slate-200 dark:border-zinc-800 space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Repeat className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                <span className="font-semibold text-sm text-slate-800 dark:text-zinc-200">Текущая неделя ротации</span>
              </div>
              <span className="text-xs font-mono font-bold text-emerald-600 dark:text-emerald-400">
                Неделя {settings.currentWeek || 'A'}
              </span>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => onUpdateSettings({ ...settings, currentWeek: 'A' })}
                className={`py-2 px-3 rounded-xl text-xs font-bold transition ${
                  settings.currentWeek === 'A'
                    ? 'bg-emerald-500 text-white shadow-sm'
                    : 'bg-white dark:bg-zinc-900 text-slate-700 dark:text-zinc-300 border border-slate-200 dark:border-zinc-800'
                }`}
              >
                Неделя 1 (Вариант А)
              </button>
              <button
                onClick={() => onUpdateSettings({ ...settings, currentWeek: 'B' })}
                className={`py-2 px-3 rounded-xl text-xs font-bold transition ${
                  settings.currentWeek === 'B'
                    ? 'bg-emerald-500 text-white shadow-sm'
                    : 'bg-white dark:bg-zinc-900 text-slate-700 dark:text-zinc-300 border border-slate-200 dark:border-zinc-800'
                }`}
              >
                Неделя 2 (Вариант Б)
              </button>
            </div>
          </div>

          {/* Sound Toggle */}
          <div className="flex items-center justify-between bg-slate-50 dark:bg-zinc-950 p-3.5 rounded-2xl border border-slate-200 dark:border-zinc-800">
            <div className="flex items-center gap-3">
              {settings.soundEnabled ? (
                <Volume2 className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
              ) : (
                <VolumeX className="w-5 h-5 text-slate-400" />
              )}
              <div>
                <span className="font-semibold text-sm text-slate-800 dark:text-zinc-200 block">Звуки таймера</span>
                <span className="text-xs text-slate-500">Сигнал окончания отдыха (Web Audio)</span>
              </div>
            </div>
            <button
              onClick={() => onUpdateSettings({ ...settings, soundEnabled: !settings.soundEnabled })}
              className={`w-12 h-6 rounded-full transition relative ${
                settings.soundEnabled ? 'bg-emerald-500' : 'bg-slate-300 dark:bg-zinc-800'
              }`}
            >
              <div className={`w-5 h-5 rounded-full bg-white absolute top-0.5 transition-transform ${
                settings.soundEnabled ? 'right-0.5' : 'left-0.5'
              }`} />
            </button>
          </div>

          {/* Vibration Toggle */}
          <div className="flex items-center justify-between bg-slate-50 dark:bg-zinc-950 p-3.5 rounded-2xl border border-slate-200 dark:border-zinc-800">
            <div className="flex items-center gap-3">
              <Smartphone className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
              <div>
                <span className="font-semibold text-sm text-slate-800 dark:text-zinc-200 block">Вибрация (Haptic)</span>
                <span className="text-xs text-slate-500">Вибро-оповещения в кармане</span>
              </div>
            </div>
            <button
              onClick={() => onUpdateSettings({ ...settings, vibrationEnabled: !settings.vibrationEnabled })}
              className={`w-12 h-6 rounded-full transition relative ${
                settings.vibrationEnabled ? 'bg-emerald-500' : 'bg-slate-300 dark:bg-zinc-800'
              }`}
            >
              <div className={`w-5 h-5 rounded-full bg-white absolute top-0.5 transition-transform ${
                settings.vibrationEnabled ? 'right-0.5' : 'left-0.5'
              }`} />
            </button>
          </div>

          {/* Barbell Weight default */}
          <div className="bg-slate-50 dark:bg-zinc-950 p-3.5 rounded-2xl border border-slate-200 dark:border-zinc-800 space-y-2">
            <div className="flex items-center justify-between">
              <span className="font-semibold text-sm text-slate-800 dark:text-zinc-200">Вес грифа по умолчанию</span>
              <span className="font-mono text-xs text-emerald-600 dark:text-emerald-400 font-bold">{settings.barbellWeightKg} кг</span>
            </div>
            <div className="flex gap-2">
              {[20, 15, 10].map(w => (
                <button
                  key={w}
                  onClick={() => onUpdateSettings({ ...settings, barbellWeightKg: w })}
                  className={`flex-1 py-1.5 rounded-xl text-xs font-semibold transition ${
                    settings.barbellWeightKg === w
                      ? 'bg-emerald-500 text-white font-bold'
                      : 'bg-white dark:bg-zinc-800 text-slate-700 dark:text-zinc-300 border border-slate-200 dark:border-zinc-700'
                  }`}
                >
                  {w} кг
                </button>
              ))}
            </div>
          </div>

          {/* Backup / Restore section */}
          <div className="bg-slate-50 dark:bg-zinc-950 p-3.5 rounded-2xl border border-slate-200 dark:border-zinc-800 space-y-3">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-zinc-400 block">
              Резервное копирование (Offline JSON)
            </span>
            <div className="flex gap-2">
              <button
                onClick={handleExport}
                className="flex-1 py-2 px-3 bg-white dark:bg-zinc-800 hover:bg-slate-100 dark:hover:bg-zinc-700 text-slate-700 dark:text-zinc-200 text-xs font-semibold rounded-xl flex items-center justify-center gap-1.5 border border-slate-200 dark:border-zinc-700 transition"
              >
                <Download className="w-4 h-4 text-emerald-600 dark:text-emerald-400" /> Экспорт
              </button>
              <button
                onClick={() => fileInputRef.current?.click()}
                className="flex-1 py-2 px-3 bg-white dark:bg-zinc-800 hover:bg-slate-100 dark:hover:bg-zinc-700 text-slate-700 dark:text-zinc-200 text-xs font-semibold rounded-xl flex items-center justify-center gap-1.5 border border-slate-200 dark:border-zinc-700 transition"
              >
                <Upload className="w-4 h-4 text-blue-600 dark:text-blue-400" /> Импорт
              </button>
              <input
                ref={fileInputRef}
                type="file"
                accept=".json"
                className="hidden"
                onChange={handleFileChange}
              />
            </div>
            {importStatus && (
              <p className="text-xs text-emerald-600 dark:text-emerald-400 text-center font-medium">
                {importStatus}
              </p>
            )}
          </div>

          {/* Factory Reset */}
          <button
            onClick={handleReset}
            className="w-full py-2.5 text-xs font-semibold text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/40 border border-red-200 dark:border-red-900/40 rounded-xl flex items-center justify-center gap-2 transition"
          >
            <RotateCcw className="w-4 h-4" /> Сбросить данные к заводским
          </button>

        </div>

      </div>
    </div>
  );
};
