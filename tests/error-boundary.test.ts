import { describe, expect, it } from 'vitest';
import React from 'react';
import { renderToString } from 'react-dom/server';
import { buildRawStorageDump } from '../src/services/storageService';
import { ErrorBoundary } from '../src/components/ErrorBoundary';

class MemoryStorage implements Storage {
  private values = new Map<string, string>();
  get length() { return this.values.size; }
  clear() { this.values.clear(); }
  getItem(key: string) { return this.values.get(key) ?? null; }
  key(index: number) { return [...this.values.keys()][index] ?? null; }
  removeItem(key: string) { this.values.delete(key); }
  setItem(key: string, value: string) { this.values.set(key, String(value)); }
}

describe('E1: ErrorBoundary & buildRawStorageDump', () => {
  it('buildRawStorageDump exports only ironforge_* keys as JSON', () => {
    const storage = new MemoryStorage();
    storage.setItem('ironforge_history_v1', '[{"id":"w1"}]');
    storage.setItem('ironforge_settings_v1', '{"unit":"kg"}');
    storage.setItem('other_app_key', 'should-be-ignored');

    const dumpStr = buildRawStorageDump(storage);
    const dump = JSON.parse(dumpStr);

    expect(dump).toHaveProperty('ironforge_history_v1', '[{"id":"w1"}]');
    expect(dump).toHaveProperty('ironforge_settings_v1', '{"unit":"kg"}');
    expect(dump).not.toHaveProperty('other_app_key');
  });

  it('ErrorBoundary.getDerivedStateFromError updates state on error', () => {
    const err = new Error('Test crash');
    const state = ErrorBoundary.getDerivedStateFromError(err);
    expect(state.hasError).toBe(true);
    expect(state.error).toBe(err);
  });

  it('renderToString of ErrorBoundary fallback contains title and all buttons', () => {
    const ThrowingComponent = () => {
      throw new Error('Render explosion');
    };

    // React renderToString does not catch errors in ErrorBoundary in server render,
    // so we can test ErrorBoundary directly with pre-set error state or test the fallback rendering
    const element = React.createElement(ErrorBoundary, { fallbackError: new Error('Render explosion') });
    const html = renderToString(element);

    expect(html).toContain('Что-то пошло не так');
    expect(html).toContain('Перезагрузить');
    expect(html).toContain('Скачать резервную копию');
    expect(html).toContain('Сбросить данные');
    // Also asserts that text indicates data is safe on device
    expect(html).toMatch(/данные.*(безопасности|сохранены|устройстве)/i);
  });
});
