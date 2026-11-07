import React, { Component, ErrorInfo, ReactNode } from 'react';
import { storageService, buildRawStorageDump } from '../services/storageService';

interface ErrorBoundaryProps {
  children?: ReactNode;
  fallbackError?: Error | null;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
  confirmReset: boolean;
}

export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  public state: ErrorBoundaryState = {
    hasError: !!this.props.fallbackError,
    error: this.props.fallbackError || null,
    confirmReset: false
  };

  public static getDerivedStateFromError(error: Error): Partial<ErrorBoundaryState> {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    console.error('ErrorBoundary caught error:', error, errorInfo);
  }

  private handleReload = (): void => {
    if (typeof window !== 'undefined' && window.location) {
      window.location.reload();
    }
  };

  private handleDownloadBackup = (): void => {
    let jsonString = '';
    try {
      jsonString = storageService.exportBackupJson();
    } catch {
      if (typeof localStorage !== 'undefined') {
        jsonString = buildRawStorageDump(localStorage);
      }
    }

    if (!jsonString) return;

    try {
      const blob = new Blob([jsonString], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `ironforge_backup_${new Date().toISOString().slice(0, 10)}.json`;
      link.click();
      URL.revokeObjectURL(url);
    } catch (e) {
      console.error('Failed to trigger backup download:', e);
    }
  };

  private handleResetConfirm = (): void => {
    try {
      storageService.resetAllData();
      if (typeof window !== 'undefined' && window.location) {
        window.location.reload();
      }
    } catch (e) {
      console.error('Failed to reset data:', e);
    }
  };

  public render(): ReactNode {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen min-h-[100dvh] bg-app-atmosphere text-white flex flex-col items-center justify-center p-4">
          <div className="max-w-md w-full surface-panel p-6 space-y-4 text-center">
            <h1 className="font-display text-2xl font-bold text-white">
              Что-то пошло не так
            </h1>
            <p className="text-sm text-muted">
              Все данные тренировок сохранены на этом устройстве в безопасности. Перезагрузите страницу или скачайте резервную копию.
            </p>

            <div className="space-y-3 pt-2">
              <button
                type="button"
                onClick={this.handleReload}
                className="w-full min-h-[48px] rounded-xl btn-lime text-ink font-bold text-sm px-4"
              >
                Перезагрузить
              </button>

              <button
                type="button"
                onClick={this.handleDownloadBackup}
                className="w-full min-h-[48px] rounded-xl bg-white/10 hover:bg-white/15 text-white font-bold text-sm px-4 border border-white/10"
              >
                Скачать резервную копию
              </button>

              {!this.state.confirmReset ? (
                <button
                  type="button"
                  onClick={() => this.setState({ confirmReset: true })}
                  className="w-full min-h-[48px] rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-300 font-bold text-sm px-4 border border-rose-500/30"
                >
                  Сбросить данные
                </button>
              ) : (
                <div className="p-3 rounded-xl border border-rose-500/30 bg-rose-500/10 space-y-2">
                  <p className="text-xs text-rose-200">
                    Вы уверены? Это действие удалит все данные тренировок на этом устройстве.
                  </p>
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={this.handleResetConfirm}
                      className="flex-1 min-h-[44px] rounded-lg bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs"
                    >
                      Подтвердить сброс
                    </button>
                    <button
                      type="button"
                      onClick={() => this.setState({ confirmReset: false })}
                      className="flex-1 min-h-[44px] rounded-lg bg-white/10 text-white font-bold text-xs"
                    >
                      Отмена
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
