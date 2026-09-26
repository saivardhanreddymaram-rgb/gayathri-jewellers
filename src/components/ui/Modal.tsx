import React, { useEffect, useRef } from 'react';
import { X } from 'lucide-react';
import { clsx } from 'clsx';

interface ModalProps {
  open: boolean;
  onClose: () => void;
  title?: string;
  description?: string;
  children: React.ReactNode;
  size?: 'sm' | 'md' | 'lg' | 'xl' | 'full';
  hideCloseButton?: boolean;
  className?: string;
}

const sizeClasses = {
  sm: 'max-w-sm',
  md: 'max-w-md',
  lg: 'max-w-lg',
  xl: 'max-w-2xl',
  full: 'max-w-4xl',
};

export function Modal({
  open,
  onClose,
  title,
  description,
  children,
  size = 'md',
  hideCloseButton = false,
  className,
}: ModalProps) {
  const overlayRef = useRef<HTMLDivElement>(null);
  const firstFocusableRef = useRef<HTMLButtonElement>(null);

  // Trap focus & prevent body scroll
  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    firstFocusableRef.current?.focus();
    return () => { document.body.style.overflow = prev; };
  }, [open]);

  // Close on Escape
  useEffect(() => {
    if (!open) return;
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div
      ref={overlayRef}
      role="dialog"
      aria-modal="true"
      aria-labelledby={title ? 'modal-title' : undefined}
      aria-describedby={description ? 'modal-desc' : undefined}
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      onClick={(e) => { if (e.target === overlayRef.current) onClose(); }}
    >
      {/* Backdrop */}
      <div className="absolute inset-0 bg-espresso-900/60 backdrop-blur-sm animate-fade-in" aria-hidden />

      {/* Panel */}
      <div
        className={clsx(
          'relative w-full bg-ivory rounded-2xl shadow-modal animate-slide-up',
          'flex flex-col max-h-[90vh]',
          sizeClasses[size],
          className
        )}
      >
        {/* Header */}
        {(title || !hideCloseButton) && (
          <div className="flex items-start justify-between p-6 pb-4 border-b border-ivory-200 shrink-0">
            <div>
              {title && (
                <h2 id="modal-title" className="font-serif text-xl text-espresso font-medium">
                  {title}
                </h2>
              )}
              {description && (
                <p id="modal-desc" className="mt-1 text-sm text-espresso-400 font-sans">
                  {description}
                </p>
              )}
            </div>
            {!hideCloseButton && (
              <button
                ref={firstFocusableRef}
                onClick={onClose}
                aria-label="Close dialog"
                className="ml-4 p-1.5 rounded-lg text-espresso-400 hover:text-espresso hover:bg-espresso-100 transition-colors duration-150 focus-visible:outline focus-visible:outline-2 focus-visible:outline-gold-500 shrink-0"
              >
                <X size={18} />
              </button>
            )}
          </div>
        )}

        {/* Body */}
        <div className="overflow-y-auto flex-1 p-6">{children}</div>
      </div>
    </div>
  );
}

// ─── Drawer (slide from right) ────────────────────────────────────────────────

interface DrawerProps {
  open: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
  side?: 'right' | 'left' | 'bottom';
}

export function Drawer({ open, onClose, title, children, side = 'right' }: DrawerProps) {
  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', handler);
    return () => { document.body.style.overflow = prev; window.removeEventListener('keydown', handler); };
  }, [open, onClose]);

  if (!open) return null;

  const panelClass = clsx(
    'fixed z-50 bg-ivory shadow-modal flex flex-col',
    side === 'right' && 'top-0 right-0 h-full w-full max-w-sm animate-slide-in-right',
    side === 'left' && 'top-0 left-0 h-full w-full max-w-sm',
    side === 'bottom' && 'bottom-0 left-0 right-0 max-h-[85vh] rounded-t-2xl animate-slide-up'
  );

  return (
    <div role="dialog" aria-modal="true" aria-label={title} className="fixed inset-0 z-50">
      <div
        className="absolute inset-0 bg-espresso-900/50 backdrop-blur-sm animate-fade-in"
        aria-hidden
        onClick={onClose}
      />
      <div className={panelClass}>
        <div className="flex items-center justify-between p-5 border-b border-ivory-200 shrink-0">
          {title && <h2 className="font-serif text-lg text-espresso font-medium">{title}</h2>}
          <button
            onClick={onClose}
            aria-label="Close"
            className="ml-auto p-1.5 rounded-lg text-espresso-400 hover:text-espresso hover:bg-espresso-100 transition-colors"
          >
            <X size={18} />
          </button>
        </div>
        <div className="overflow-y-auto flex-1 p-5">{children}</div>
      </div>
    </div>
  );
}
