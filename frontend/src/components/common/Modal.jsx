import React, { useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';

const SIZE_CLASSES = {
  sm: 'max-w-md',
  md: 'max-w-lg',
  lg: 'max-w-xl',
  xl: 'max-w-3xl',
  full: 'max-w-5xl',
};

export default function Modal({
  isOpen = false,
  onClose,
  title = '',
  description,
  children,
  size = 'md',
  maxWidth,
  footer,
  closeOnEscape = true,
  closeOnOverlayClick = true,
  isLoading = false,
}) {
  const dialogRef = useRef(null);
  const previouslyFocusedRef = useRef(null);
  const latestPropsRef = useRef({ onClose, closeOnEscape, closeOnOverlayClick, isLoading });
  latestPropsRef.current = { onClose, closeOnEscape, closeOnOverlayClick, isLoading };
  const titleId = 'modal-title';
  const descriptionId = description ? 'modal-description' : undefined;
  const widthClass = maxWidth || SIZE_CLASSES[size] || SIZE_CLASSES.md;

  useEffect(() => {
    if (!isOpen) return undefined;

    previouslyFocusedRef.current = document.activeElement;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    const focusableSelector = [
      'a[href]',
      'button:not([disabled])',
      'textarea:not([disabled])',
      'input:not([disabled])',
      'select:not([disabled])',
      '[tabindex]:not([tabindex="-1"])',
    ].join(',');

    const focusFirst = () => {
      const firstFocusable = dialogRef.current?.querySelector(focusableSelector);
      (firstFocusable || dialogRef.current)?.focus();
    };
    const frame = window.requestAnimationFrame(focusFirst);

    function handleKeyDown(event) {
      const latestProps = latestPropsRef.current;
      if (event.key === 'Escape' && latestProps.closeOnEscape && !latestProps.isLoading) {
        latestProps.onClose?.();
      }

      if (event.key === 'Tab' && dialogRef.current) {
        const focusable = Array.from(dialogRef.current.querySelectorAll(focusableSelector));
        if (focusable.length === 0) {
          event.preventDefault();
          dialogRef.current.focus();
          return;
        }

        const first = focusable[0];
        const last = focusable[focusable.length - 1];
        if (event.shiftKey && document.activeElement === first) {
          event.preventDefault();
          last.focus();
        } else if (!event.shiftKey && document.activeElement === last) {
          event.preventDefault();
          first.focus();
        }
      }
    }

    document.addEventListener('keydown', handleKeyDown);
    return () => {
      window.cancelAnimationFrame(frame);
      document.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = previousOverflow;
      previouslyFocusedRef.current?.focus?.();
    };
  }, [isOpen]);

  if (!isOpen) return null;

  return createPortal(
    <div className="fixed inset-0 z-[100] overflow-y-auto" role="presentation">
      <div className="flex min-h-full items-center justify-center p-4 sm:p-6">
        <button
          type="button"
          className="fixed inset-0 bg-slate-950/50 backdrop-blur-[2px] transition-opacity"
          aria-label="Close dialog"
          tabIndex={-1}
          onClick={closeOnOverlayClick && !isLoading ? onClose : undefined}
        />
        <section
          ref={dialogRef}
          className={`relative my-8 flex max-h-[calc(100vh-4rem)] w-full ${widthClass} flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white text-left shadow-2xl outline-none animate-[modal-enter_180ms_ease-out]`}
          role="dialog"
          aria-modal="true"
          aria-labelledby={title ? titleId : undefined}
          aria-describedby={descriptionId}
          tabIndex={-1}
        >
          <header className="flex shrink-0 items-start justify-between gap-4 border-b border-slate-100 px-5 py-4 sm:px-6">
            <div className="min-w-0">
              {title && <h2 id={titleId} className="text-lg font-semibold tracking-tight text-slate-900">{title}</h2>}
              {description && <p id={descriptionId} className="mt-1 text-sm text-slate-500">{description}</p>}
            </div>
            {onClose && (
              <button
                type="button"
                onClick={onClose}
                disabled={isLoading}
                className="-mr-1 rounded-lg p-2 text-slate-400 transition hover:bg-slate-100 hover:text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 disabled:cursor-not-allowed disabled:opacity-50"
                aria-label="Close dialog"
              >
                <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            )}
          </header>
          <div className="min-h-0 flex-1 overflow-y-auto px-5 py-5 sm:px-6">{children}</div>
          {footer && <footer className="shrink-0 border-t border-slate-100 bg-slate-50/70 px-5 py-4 sm:px-6">{footer}</footer>}
        </section>
      </div>
    </div>,
    document.body
  );
}
