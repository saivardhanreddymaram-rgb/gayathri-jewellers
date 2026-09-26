import React, { useRef, useEffect, useCallback } from 'react';
import { clsx } from 'clsx';

interface OTPInputProps {
  length?: number;
  value: string;
  onChange: (value: string) => void;
  disabled?: boolean;
  error?: boolean;
  autoFocus?: boolean;
}

export function OTPInput({
  length = 6,
  value,
  onChange,
  disabled = false,
  error = false,
  autoFocus = false,
}: OTPInputProps) {
  const inputsRef = useRef<(HTMLInputElement | null)[]>([]);

  // Sync external value into individual boxes
  const digits = value.padEnd(length, '').split('').slice(0, length);

  const focusBox = (index: number) => {
    inputsRef.current[Math.min(Math.max(index, 0), length - 1)]?.focus();
  };

  useEffect(() => {
    if (autoFocus) focusBox(0);
  }, [autoFocus]);

  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>, index: number) => {
      const raw = e.target.value.replace(/\D/g, ''); // digits only
      if (!raw) return;
      const char = raw[raw.length - 1];
      const newDigits = [...digits];
      newDigits[index] = char;
      const next = newDigits.join('');
      onChange(next);
      if (index < length - 1) focusBox(index + 1);
    },
    [digits, length, onChange]
  );

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLInputElement>, index: number) => {
      if (e.key === 'Backspace') {
        e.preventDefault();
        const newDigits = [...digits];
        if (newDigits[index]) {
          newDigits[index] = '';
          onChange(newDigits.join(''));
        } else if (index > 0) {
          newDigits[index - 1] = '';
          onChange(newDigits.join(''));
          focusBox(index - 1);
        }
      } else if (e.key === 'ArrowLeft') {
        e.preventDefault();
        focusBox(index - 1);
      } else if (e.key === 'ArrowRight') {
        e.preventDefault();
        focusBox(index + 1);
      }
    },
    [digits, length, onChange]
  );

  // Handle paste
  const handlePaste = useCallback(
    (e: React.ClipboardEvent) => {
      e.preventDefault();
      const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, length);
      onChange(pasted.padEnd(value.length > pasted.length ? value.length : pasted.length, '').slice(0, length));
      if (pasted.length > 0) focusBox(Math.min(pasted.length, length - 1));
    },
    [length, onChange, value]
  );

  return (
    <div
      className="flex gap-2 sm:gap-3 justify-center"
      role="group"
      aria-label="One-time passcode input"
    >
      {Array.from({ length }).map((_, i) => (
        <input
          key={i}
          ref={(el) => { inputsRef.current[i] = el; }}
          type="text"
          inputMode="numeric"
          pattern="[0-9]*"
          maxLength={1}
          value={digits[i] ?? ''}
          onChange={(e) => handleChange(e, i)}
          onKeyDown={(e) => handleKeyDown(e, i)}
          onPaste={handlePaste}
          onFocus={(e) => e.target.select()}
          disabled={disabled}
          aria-label={`Digit ${i + 1} of ${length}`}
          className={clsx(
            'w-11 h-13 sm:w-12 sm:h-14 text-center text-xl font-serif font-medium',
            'border-2 rounded-xl bg-white text-espresso',
            'transition-all duration-150',
            'focus:outline-none focus:ring-2',
            error
              ? 'border-red-400 focus:border-red-400 focus:ring-red-200 bg-red-50'
              : digits[i]
              ? 'border-gold-500 focus:border-gold-500 focus:ring-gold-200'
              : 'border-espresso-100 focus:border-gold-500 focus:ring-gold-200',
            disabled && 'opacity-50 cursor-not-allowed bg-ivory-100',
            // ensure minimum 44×44 touch target
            'min-w-[44px] min-h-[44px]'
          )}
        />
      ))}
    </div>
  );
}

// ─── Resend countdown ─────────────────────────────────────────────────────────

import { useState } from 'react';

interface ResendTimerProps {
  seconds: number;
  onResend: () => void;
  disabled?: boolean;
}

export function ResendTimer({ seconds, onResend, disabled }: ResendTimerProps) {
  const [remaining, setRemaining] = useState(seconds);
  const [active, setActive] = useState(true);

  useEffect(() => {
    setRemaining(seconds);
    setActive(true);
  }, [seconds]);

  useEffect(() => {
    if (!active) return;
    if (remaining <= 0) { setActive(false); return; }
    const t = setTimeout(() => setRemaining((r) => r - 1), 1000);
    return () => clearTimeout(t);
  }, [active, remaining]);

  if (active) {
    return (
      <p className="text-sm text-espresso-400 font-sans text-center">
        Resend code in <span className="font-medium text-espresso tabular-nums">{remaining}s</span>
      </p>
    );
  }

  return (
    <button
      type="button"
      onClick={onResend}
      disabled={disabled}
      className="text-sm font-medium text-gold-600 hover:text-gold-700 underline underline-offset-2 transition-colors font-sans disabled:opacity-50 disabled:cursor-not-allowed"
    >
      Resend code
    </button>
  );
}
