import React from 'react';
import { clsx } from 'clsx';
import { Loader2 } from 'lucide-react';

type Variant = 'primary' | 'gold' | 'outline' | 'ghost' | 'danger';
type Size = 'sm' | 'md' | 'lg';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: Size;
  loading?: boolean;
  fullWidth?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

const variantClasses: Record<Variant, string> = {
  // Gold filled — matches screenshot "View Collection" button
  primary:
    'bg-gold-500 text-white hover:bg-gold-600 focus-visible:outline-gold-500 active:scale-95',
  gold:
    'bg-gold-500 text-white hover:bg-gold-600 focus-visible:outline-gold-500 active:scale-95',
  outline:
    'border-2 border-gold-500 text-gold-600 hover:bg-gold-500 hover:text-white focus-visible:outline-gold-500 active:scale-95 bg-white',
  ghost:
    'text-brown-800 hover:bg-gray-100 focus-visible:outline-gold-500 active:scale-95',
  danger:
    'bg-red-600 text-white hover:bg-red-700 focus-visible:outline-red-500 active:scale-95',
};

const sizeClasses: Record<Size, string> = {
  sm: 'px-4 py-2 text-xs gap-1.5 min-h-[40px]',
  md: 'px-5 py-2.5 text-sm gap-2 min-h-[44px]',
  lg: 'px-7 py-3 text-base gap-2 min-h-[48px]',
};

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      variant = 'primary',
      size = 'md',
      loading = false,
      fullWidth = false,
      leftIcon,
      rightIcon,
      children,
      disabled,
      className,
      ...props
    },
    ref
  ) => {
    const isDisabled = disabled || loading;

    return (
      <button
        ref={ref}
        disabled={isDisabled}
        aria-busy={loading}
        className={clsx(
          // Rounded-full = pill shape matching the screenshot
          'inline-flex items-center justify-center font-sans font-semibold rounded-full',
          'transition-all duration-200',
          'focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2',
          'disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none',
          variantClasses[variant],
          sizeClasses[size],
          fullWidth && 'w-full',
          className
        )}
        {...props}
      >
        {loading ? (
          <Loader2
            className="animate-spin shrink-0"
            size={size === 'sm' ? 14 : size === 'lg' ? 18 : 16}
          />
        ) : (
          leftIcon && <span className="shrink-0">{leftIcon}</span>
        )}
        {children}
        {!loading && rightIcon && <span className="shrink-0">{rightIcon}</span>}
      </button>
    );
  }
);

Button.displayName = 'Button';
