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
  Settings
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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in text-zinc-100">
      <div className="w-full max-w-md bg-zinc-900 border border-zinc-700 rounded-2xl p-5 sm:p-6 shadow-2xl">
        
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-zinc-800">
          <div className="flex items-center gap-2">
            <Settings className="w-5 h-5 text-emerald-400" />
            <h3 className="font-bold text-lg text-white">Настройки IronForge</h3>
          </div>
          <button 
            onClick={onClose}
            className="p-1 text-zinc-400 hover:text-white rounded-lg hover:bg-zinc-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Settings list */}
        <div className="my-5 space-y-4">
          
          {/* Sound Toggle */}
          <div className="flex items-center justify-between bg-zinc-950 p-3.5 rounded-xl border border-zinc-800">
            <div className="flex items-center gap-3">
              {settings.soundEnabled ? (
                <Volume2 className="w-5 h-5 text-emerald-400" />
              ) : (
                <VolumeX className="w-5 h-5 text-zinc-500" />
              )}
              <div>
                <span className="font-semibold text-sm text-zinc-200 block">Звуки таймера</span>
                <span className="text-xs text-zinc-500">Сигнал окончания отдыха и обратный отсчет</span>
              </div>
            </div>
            <button
              onClick={() => onUpdateSettings({ ...settings, soundEnabled: !settings.soundEnabled })}
              className={`w-12 h-6 rounded-full transition relative ${
                settings.soundEnabled ? 'bg-emerald-500' : 'bg-zinc-800'
              }`}
            >
              <div className={`w-5 h-5 rounded-full bg-white absolute top-0.5 transition-transform ${
                settings.soundEnabled ? 'right-0.5' : 'left-0.5'
              }`} />
            </button>
          </div>

          {/* Vibration Toggle */}
          <div className="flex items-center justify-between bg-zinc-950 p-3.5 rounded-xl border border-zinc-800">
            <div className="flex items-center gap-3">
              <Smartphone className="w-5 h-5 text-emerald-400" />
              <div>
                <span className="font-semibold text-sm text-zinc-200 block">Вибрация (Haptic)</span>
                <span className="text-xs text-zinc-500">Вибро-оповещения в кармане во время отдыха</span>
              </div>
            </div>
            <button
              onClick={() => onUpdateSettings({ ...settings, vibrationEnabled: !settings.vibrationEnabled })}
              className={`w-12 h-6 rounded-full transition relative ${
                settings.vibrationEnabled ? 'bg-emerald-500' : 'bg-zinc-800'
              }`}
            >
              <div className={`w-5 h-5 rounded-full bg-white absolute top-0.5 transition-transform ${
                settings.vibrationEnabled ? 'right-0.5' : 'left-0.5'
              }`} />
            </button>
          </div>

          {/* Barbell Weight default */}
          <div className="bg-zinc-950 p-3.5 rounded-xl border border-zinc-800 space-y-2">
            <div className="flex items-center justify-between">
              <span className="font-semibold text-sm text-zinc-200">Вес грифа по умолчанию</span>
              <span className="font-mono text-xs text-emerald-400 font-bold">{settings.barbellWeightKg} кг</span>
            </div>
            <div className="flex gap-2">
              {[20, 15, 10].map(w => (
                <button
                  key={w}
                  onClick={() => onUpdateSettings({ ...settings, barbellWeightKg: w })}
                  className={`flex-1 py-1.5 rounded-lg text-xs font-semibold transition ${
                    settings.barbellWeightKg === w
                      ? 'bg-emerald-500 text-black font-bold'
                      : 'bg-zinc-800 text-zinc-300 hover:bg-zinc-700'
                  }`}
                >
                  {w} кг
                </button>
              ))}
            </div>
          </div>

          {/* Backup / Restore section */}
          <div className="bg-zinc-950 p-3.5 rounded-xl border border-zinc-800 space-y-3">
            <span className="text-xs font-bold uppercase tracking-wider text-zinc-400 block">
              Резервное копирование (Offline JSON)
            </span>
            <div className="flex gap-2">
              <button
                onClick={handleExport}
                className="flex-1 py-2 px-3 bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-xs font-semibold rounded-xl flex items-center justify-center gap-1.5 transition"
              >
                <Download className="w-4 h-4 text-emerald-400" /> Экспорт
              </button>
              <button
                onClick={() => fileInputRef.current?.click()}
                className="flex-1 py-2 px-3 bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-xs font-semibold rounded-xl flex items-center justify-center gap-1.5 transition"
              >
                <Upload className="w-4 h-4 text-blue-400" /> Импорт
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
              <p className="text-xs text-emerald-400 text-center font-medium">
                {importStatus}
              </p>
            )}
          </div>

          {/* Factory Reset */}
          <button
            onClick={handleReset}
            className="w-full py-2.5 text-xs font-semibold text-red-400 hover:text-red-300 bg-red-950/20 hover:bg-red-950/40 border border-red-900/40 rounded-xl flex items-center justify-center gap-2 transition"
          >
            <RotateCcw className="w-4 h-4" /> Сбросить данные к заводским
          </button>

        </div>

      </div>
    </div>
  );
};
