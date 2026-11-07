import { useEffect, useRef, type RefObject } from 'react';

export const FOCUSABLE_SELECTOR = [
  'a[href]',
  'button:not([disabled])',
  'textarea:not([disabled])',
  'input:not([disabled])',
  'select:not([disabled])',
  '[tabindex]:not([tabindex="-1"])'
].join(', ');

/**
 * Pure helper calculating the next focused index for modal Tab / Shift+Tab trapping.
 * Wraps around edges.
 */
export function getNextFocusIndex(currentIndex: number, totalCount: number, backward: boolean = false): number {
  if (totalCount <= 0) return -1;
  if (currentIndex === -1 || currentIndex < 0 || currentIndex >= totalCount) {
    return backward ? totalCount - 1 : 0;
  }
  if (backward) {
    return (currentIndex - 1 + totalCount) % totalCount;
  }
  return (currentIndex + 1) % totalCount;
}

/**
 * Pure helper for cycling focus among a list of items/elements.
 */
export function findNextFocusableElement<T>(
  elements: readonly T[] | T[],
  currentElement: T | null,
  shiftKey: boolean = false
): T | null {
  if (!elements || elements.length === 0) return null;
  const currentIndex = currentElement ? elements.indexOf(currentElement) : -1;
  const nextIndex = getNextFocusIndex(currentIndex, elements.length, shiftKey);
  return elements[nextIndex] ?? null;
}

const dialogStack: string[] = [];

export function pushDialog(id: string): void {
  if (!id) return;
  const idx = dialogStack.indexOf(id);
  if (idx !== -1) {
    dialogStack.splice(idx, 1);
  }
  dialogStack.push(id);
}

export function removeDialog(id: string): void {
  const idx = dialogStack.indexOf(id);
  if (idx !== -1) {
    dialogStack.splice(idx, 1);
  }
}

export function isTopDialog(id: string): boolean {
  if (dialogStack.length === 0) return false;
  return dialogStack[dialogStack.length - 1] === id;
}

export function getTopDialog(): string | null {
  if (dialogStack.length === 0) return null;
  return dialogStack[dialogStack.length - 1];
}

export function clearDialogStack(): void {
  dialogStack.length = 0;
}

export function handleDialogEscape(dialogId: string, onClose?: () => void): boolean {
  if (!isTopDialog(dialogId)) {
    return false;
  }
  if (onClose) {
    onClose();
  }
  return true;
}

let dialogCounter = 0;

export interface UseDialogA11yOptions<T extends HTMLElement = HTMLDivElement> {
  dialogId?: string;
  isOpen: boolean;
  onClose?: () => void;
  titleId?: string;
  initialFocusRef?: RefObject<HTMLElement | null>;
  closeOnEscape?: boolean;
}

export interface UseDialogA11yReturn<T extends HTMLElement = HTMLDivElement> {
  containerRef: RefObject<T | null>;
  dialogProps: {
    role: 'dialog';
    'aria-modal': true;
    'aria-labelledby'?: string;
    tabIndex: -1;
  };
}

export function useDialogA11y<T extends HTMLElement = HTMLDivElement>({
  dialogId,
  isOpen,
  onClose,
  titleId,
  initialFocusRef,
  closeOnEscape = true
}: UseDialogA11yOptions<T>): UseDialogA11yReturn<T> {
  const containerRef = useRef<T | null>(null);
  const openerRef = useRef<HTMLElement | null>(null);
  const onCloseRef = useRef(onClose);
  onCloseRef.current = onClose;
  const idRef = useRef<string>(dialogId || '');
  if (!idRef.current) {
    idRef.current = `dialog-${++dialogCounter}-${Math.random().toString(36).substring(2, 7)}`;
  }
  const effectiveId = dialogId || idRef.current;

  useEffect(() => {
    if (!isOpen) {
      removeDialog(effectiveId);
      return;
    }

    pushDialog(effectiveId);

    if (typeof document !== 'undefined') {
      openerRef.current = document.activeElement as HTMLElement | null;

      const timer = setTimeout(() => {
        if (!containerRef.current) return;
        if (initialFocusRef?.current) {
          initialFocusRef.current.focus();
        } else {
          const focusables = Array.from(
            containerRef.current.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTOR)
          ).filter(el => !el.hasAttribute('disabled') && el.tabIndex !== -1);
          if (focusables.length > 0) {
            focusables[0].focus();
          } else {
            containerRef.current.focus();
          }
        }
      }, 0);

      const handleKeyDown = (event: KeyboardEvent) => {
        if (!containerRef.current) return;
        if (!isTopDialog(effectiveId)) return;

        if (event.key === 'Escape') {
          if (closeOnEscape && onCloseRef.current) {
            event.preventDefault();
            event.stopPropagation();
            onCloseRef.current();
          }
          return;
        }

        if (event.key === 'Tab') {
          const focusables = Array.from(
            containerRef.current.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTOR)
          ).filter(el => !el.hasAttribute('disabled') && el.tabIndex !== -1);

          if (focusables.length === 0) {
            event.preventDefault();
            return;
          }

          const activeEl = document.activeElement as HTMLElement | null;
          const currentIndex = activeEl ? focusables.indexOf(activeEl) : -1;
          const nextIndex = getNextFocusIndex(currentIndex, focusables.length, event.shiftKey);
          event.preventDefault();
          focusables[nextIndex]?.focus();
        }
      };

      document.addEventListener('keydown', handleKeyDown, true);

      return () => {
        clearTimeout(timer);
        document.removeEventListener('keydown', handleKeyDown, true);
        removeDialog(effectiveId);
        if (openerRef.current && typeof openerRef.current.focus === 'function') {
          openerRef.current.focus();
        }
      };
    }

    return () => {
      removeDialog(effectiveId);
    };
  }, [isOpen, closeOnEscape, initialFocusRef, effectiveId]);

  return {
    containerRef,
    dialogProps: {
      role: 'dialog',
      'aria-modal': true,
      ...(titleId ? { 'aria-labelledby': titleId } : {}),
      tabIndex: -1
    }
  };
}
