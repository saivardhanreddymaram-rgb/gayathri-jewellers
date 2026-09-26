import React from 'react';
import { clsx } from 'clsx';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  hint?: string;
  leftIcon?: React.ReactNode;
  rightElement?: React.ReactNode;
  wrapperClassName?: string;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  (
    {
      label,
      error,
      hint,
      leftIcon,
      rightElement,
      wrapperClassName,
      className,
      id,
      ...props
    },
    ref
  ) => {
    const inputId = id ?? (label ? label.toLowerCase().replace(/\s+/g, '-') : undefined);

    return (
      <div className={clsx('flex flex-col gap-1', wrapperClassName)}>
        {label && (
          <label htmlFor={inputId} className="text-sm font-medium text-espresso font-sans">
            {label}
            {props.required && <span className="text-red-500 ml-0.5" aria-hidden>*</span>}
          </label>
        )}
        <div className="relative flex items-center">
          {leftIcon && (
            <span className="absolute left-3 text-espresso-400 pointer-events-none" aria-hidden>
              {leftIcon}
            </span>
          )}
          <input
            ref={ref}
            id={inputId}
            aria-invalid={!!error}
            aria-describedby={
              error ? `${inputId}-error` : hint ? `${inputId}-hint` : undefined
            }
            className={clsx(
              'w-full bg-white border rounded-xl font-sans text-brown-800',
              'placeholder-gray-400 transition-colors duration-150',
              'focus:outline-none focus:ring-2',
              leftIcon ? 'pl-10' : 'pl-4',
              rightElement ? 'pr-12' : 'pr-4',
              'py-3 min-h-[48px]',
              error
                ? 'border-red-400 focus:border-red-400 focus:ring-red-200'
                : 'border-gray-200 focus:border-gold-500 focus:ring-gold-200',
              'disabled:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-60',
              className
            )}
            {...props}
          />
          {rightElement && (
            <span className="absolute right-3 flex items-center">{rightElement}</span>
          )}
        </div>
        {error && (
          <p id={`${inputId}-error`} role="alert" className="text-xs text-red-600 font-sans">
            {error}
          </p>
        )}
        {hint && !error && (
          <p id={`${inputId}-hint`} className="text-xs text-espresso-400 font-sans">
            {hint}
          </p>
        )}
      </div>
    );
  }
);

Input.displayName = 'Input';

// ─── Textarea ──────────────────────────────────────────────────────────────────

interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
  hint?: string;
  wrapperClassName?: string;
}

export const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ label, error, hint, wrapperClassName, className, id, ...props }, ref) => {
    const textareaId = id ?? (label ? label.toLowerCase().replace(/\s+/g, '-') : undefined);
    return (
      <div className={clsx('flex flex-col gap-1', wrapperClassName)}>
        {label && (
          <label htmlFor={textareaId} className="text-sm font-medium text-espresso font-sans">
            {label}
            {props.required && <span className="text-red-500 ml-0.5" aria-hidden>*</span>}
          </label>
        )}
        <textarea
          ref={ref}
          id={textareaId}
          aria-invalid={!!error}
          rows={4}
          className={clsx(
            'w-full px-4 py-3 bg-white border rounded-lg font-sans text-sm text-espresso',
            'placeholder-espresso-400 resize-y transition-colors duration-150',
            'focus:outline-none focus:ring-2',
            error
              ? 'border-red-400 focus:border-red-400 focus:ring-red-200'
              : 'border-espresso-100 focus:border-gold-500 focus:ring-gold-200',
            className
          )}
          {...props}
        />
        {error && <p role="alert" className="text-xs text-red-600 font-sans">{error}</p>}
        {hint && !error && <p className="text-xs text-espresso-400 font-sans">{hint}</p>}
      </div>
    );
  }
);
Textarea.displayName = 'Textarea';

// ─── Select ───────────────────────────────────────────────────────────────────

interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  error?: string;
  hint?: string;
  wrapperClassName?: string;
  options: { value: string; label: string }[];
  placeholder?: string;
}

export const Select = React.forwardRef<HTMLSelectElement, SelectProps>(
  ({ label, error, hint, wrapperClassName, className, id, options, placeholder, ...props }, ref) => {
    const selectId = id ?? (label ? label.toLowerCase().replace(/\s+/g, '-') : undefined);
    return (
      <div className={clsx('flex flex-col gap-1', wrapperClassName)}>
        {label && (
          <label htmlFor={selectId} className="text-sm font-medium text-espresso font-sans">
            {label}
            {props.required && <span className="text-red-500 ml-0.5" aria-hidden>*</span>}
          </label>
        )}
        <select
          ref={ref}
          id={selectId}
          aria-invalid={!!error}
          className={clsx(
            'w-full px-4 py-3 bg-white border rounded-lg font-sans text-sm text-espresso',
            'transition-colors duration-150 focus:outline-none focus:ring-2 cursor-pointer',
            error
              ? 'border-red-400 focus:border-red-400 focus:ring-red-200'
              : 'border-espresso-100 focus:border-gold-500 focus:ring-gold-200',
            className
          )}
          {...props}
        >
          {placeholder && <option value="">{placeholder}</option>}
          {options.map((o) => (
            <option key={o.value} value={o.value}>{o.label}</option>
          ))}
        </select>
        {error && <p role="alert" className="text-xs text-red-600 font-sans">{error}</p>}
        {hint && !error && <p className="text-xs text-espresso-400 font-sans">{hint}</p>}
      </div>
    );
  }
);
Select.displayName = 'Select';
