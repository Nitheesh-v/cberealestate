'use client';
import { useId, useRef, useState, type InputHTMLAttributes, type PropsWithChildren } from 'react';
import type { UseFormRegisterReturn } from 'react-hook-form';
import { Eye, EyeOff } from 'lucide-react';
import { motion, useReducedMotion } from 'framer-motion';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { LoadingSpinner } from '@/components/shared/LoadingSpinner';
/** Labeled, error-associated RHF input with an accessible password visibility control. */
export function FormField({
  label,
  field,
  error,
  type = 'text',
  ...props
}: InputHTMLAttributes<HTMLInputElement> & {
  label: string;
  field: UseFormRegisterReturn;
  error?: string;
}): React.JSX.Element {
  const id = useId();
  const [visible, setVisible] = useState(false);
  const password = type === 'password';
  return (
    <div className="space-y-2">
      <label htmlFor={id} className="block text-sm font-medium">
        {label}
      </label>
      <div className="relative">
        <Input
          id={id}
          {...props}
          {...field}
          type={password && visible ? 'text' : type}
          aria-invalid={Boolean(error)}
          aria-describedby={error ? `${id}-error` : undefined}
          className={password ? 'pr-12' : undefined}
        />
        {password && (
          <button
            type="button"
            aria-label={visible ? `Hide ${label.toLowerCase()}` : `Show ${label.toLowerCase()}`}
            aria-pressed={visible}
            onClick={() => setVisible(!visible)}
            className="absolute right-1 top-1 rounded-md p-2 text-muted-foreground"
          >
            {visible ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
          </button>
        )}
      </div>
      {error && (
        <p id={`${id}-error`} className="text-xs text-destructive">
          {error}
        </p>
      )}
    </div>
  );
}
/** Consistent form card entrance that respects the visitor's motion preference. */
export function FormPanel({
  title,
  subtitle,
  children,
}: PropsWithChildren<{ title: string; subtitle: string }>): React.JSX.Element {
  const reduced = useReducedMotion();
  return (
    <motion.section
      initial={reduced ? false : { opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="w-full space-y-7"
    >
      <header>
        <p className="mb-3 text-xs font-semibold uppercase tracking-[0.2em] text-secondary-dark">
          SBR Real Estate
        </p>
        <h1 className="font-heading text-3xl text-primary dark:text-secondary-light sm:text-4xl">
          {title}
        </h1>
        <p className="mt-3 text-sm leading-6 text-muted-foreground">{subtitle}</p>
      </header>
      {children}
    </motion.section>
  );
}
/** Submission button exposes pending state without layout shifts. */
export function SubmitButton({
  loading,
  children,
}: PropsWithChildren<{ loading: boolean }>): React.JSX.Element {
  return (
    <Button type="submit" className="w-full" disabled={loading} aria-busy={loading}>
      {loading && <LoadingSpinner size="sm" />}
      {children}
    </Button>
  );
}
/** Persistent inline error complements the global toast live region. */
export function FormError({ message }: { message: string }): React.JSX.Element | null {
  return message ? (
    <p
      role="alert"
      className="rounded-lg border border-destructive/20 bg-destructive/5 p-3 text-sm text-destructive"
    >
      {message}
    </p>
  ) : null;
}
/** Six accessible PIN cells support mobile autofill, leading zeroes, paste and arrow keys. */
export function OtpInput({
  value,
  onChange,
  error,
}: {
  value: string;
  onChange: (value: string) => void;
  error?: string;
}): React.JSX.Element {
  const id = useId();
  const inputs = useRef<(HTMLInputElement | null)[]>([]);
  /** Distributes pasted/autofilled digits and advances the keyboard focus. */
  const insert = (raw: string, index: number): void => {
    const digits = raw.replace(/\D/g, '').slice(0, 6);
    if (digits.length > 1) {
      const next = value.padEnd(6, ' ').split('');
      for (let offset = 0; offset < digits.length && index + offset < 6; offset += 1)
        next[index + offset] = digits[offset] ?? ' ';
      onChange(next.join('').trimEnd());
      inputs.current[Math.min(5, index + digits.length)]?.focus();
    } else {
      const next = value.padEnd(6, ' ').split('');
      next[index] = digits || ' ';
      onChange(next.join('').trimEnd());
      if (digits) inputs.current[Math.min(5, index + 1)]?.focus();
    }
  };
  return (
    <fieldset className="space-y-2" aria-describedby={error ? `${id}-error` : undefined}>
      <legend className="mb-2 text-sm font-medium">Verification code</legend>
      <div className="grid grid-cols-6 gap-2">
        {Array.from({ length: 6 }, (_, index) => (
          <Input
            key={index}
            ref={(element) => {
              inputs.current[index] = element;
            }}
            aria-label={`Code digit ${index + 1}`}
            value={(value[index] ?? '').trim()}
            onChange={(event) => insert(event.target.value, index)}
            onPaste={(event) => {
              event.preventDefault();
              insert(event.clipboardData.getData('text'), index);
            }}
            onKeyDown={(event) => {
              if (event.key === 'ArrowLeft') {
                event.preventDefault();
                inputs.current[Math.max(0, index - 1)]?.focus();
              }
              if (event.key === 'ArrowRight') {
                event.preventDefault();
                inputs.current[Math.min(5, index + 1)]?.focus();
              }
              if (event.key === 'Backspace' && !(value[index] ?? '').trim()) {
                event.preventDefault();
                insert('', Math.max(0, index - 1));
                inputs.current[Math.max(0, index - 1)]?.focus();
              }
            }}
            onFocus={(event) => event.target.select()}
            inputMode="numeric"
            autoComplete={index === 0 ? 'one-time-code' : 'off'}
            maxLength={6}
            pattern="[0-9]*"
            className="h-14 px-0 text-center text-2xl"
            aria-invalid={Boolean(error)}
          />
        ))}
      </div>
      {error && (
        <p id={`${id}-error`} className="text-xs text-destructive">
          {error}
        </p>
      )}
    </fieldset>
  );
}
