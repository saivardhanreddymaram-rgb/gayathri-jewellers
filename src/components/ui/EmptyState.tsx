import React from 'react';
import { clsx } from 'clsx';
import { Button } from './Button';
import type { LucideProps } from 'lucide-react';

interface EmptyStateProps {
  icon?: React.ForwardRefExoticComponent<Omit<LucideProps, 'ref'> & React.RefAttributes<SVGSVGElement>>;
  title: string;
  description?: string;
  action?: {
    label: string;
    onClick: () => void;
  };
  className?: string;
}

export function EmptyState({ icon: Icon, title, description, action, className }: EmptyStateProps) {
  return (
    <div
      className={clsx(
        'flex flex-col items-center justify-center text-center py-16 px-6',
        className
      )}
    >
      {Icon && (
        <div className="w-16 h-16 rounded-full bg-gold-100 flex items-center justify-center mb-5">
          <Icon size={28} className="text-gold-600" />
        </div>
      )}
      <h3 className="font-serif text-xl text-espresso mb-2">{title}</h3>
      {description && (
        <p className="text-sm text-espresso-400 font-sans max-w-sm mb-6">{description}</p>
      )}
      {action && (
        <Button variant="primary" onClick={action.onClick}>
          {action.label}
        </Button>
      )}
    </div>
  );
}

// ─── Error state with retry ────────────────────────────────────────────────────

interface ErrorStateProps {
  title?: string;
  message?: string;
  onRetry?: () => void;
  className?: string;
}

export function ErrorState({
  title = 'Something went wrong',
  message = 'We could not load this content. Please try again.',
  onRetry,
  className,
}: ErrorStateProps) {
  return (
    <div
      role="alert"
      className={clsx(
        'flex flex-col items-center justify-center text-center py-16 px-6',
        className
      )}
    >
      <div className="w-16 h-16 rounded-full bg-red-50 flex items-center justify-center mb-5">
        <span className="text-2xl">⚠️</span>
      </div>
      <h3 className="font-serif text-xl text-espresso mb-2">{title}</h3>
      <p className="text-sm text-espresso-400 font-sans max-w-sm mb-6">{message}</p>
      {onRetry && (
        <Button variant="outline" onClick={onRetry}>
          Try again
        </Button>
      )}
    </div>
  );
}
