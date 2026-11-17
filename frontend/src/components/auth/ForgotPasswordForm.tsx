'use client';
import { useState } from 'react';
import Link from 'next/link';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { forgotPasswordSchema, type ForgotValues } from '@/lib/validators/auth.validator';
import { authService, authError } from '@/services/auth.service';
import { useCooldown } from '@/hooks/useCooldown';
import { toast } from '@/hooks/use-toast';
import { FormError, FormField, FormPanel } from './FormControls';
/** Password recovery uses a generic response to avoid email enumeration. */
export function ForgotPasswordForm(): React.JSX.Element {
  const [sent, setSent] = useState(false);
  const [error, setError] = useState('');
  const cooldown = useCooldown();
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ForgotValues>({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: { email: '' },
  });
  /** Requests a reset email and starts the UI cooldown only after acknowledgement. */
  const submit = async (values: ForgotValues): Promise<void> => {
    if (cooldown.remaining) return;
    setError('');
    try {
      await authService.forgotPassword(values.email);
      setSent(true);
      cooldown.start(60);
    } catch (failure: unknown) {
      const message = authError(failure);
      setError(message);
      toast({ title: 'Request unsuccessful', description: message });
    }
  };
  return (
    <FormPanel
      title="Let’s get you back in"
      subtitle="We’ll send a secure, single-use password reset link."
    >
      {sent && (
        <p role="status" className="rounded-lg bg-primary/10 p-4 text-sm leading-6">
          If an account matches that email, a reset link has been requested. Check your inbox and
          spam folder. The link expires in 15 minutes.
        </p>
      )}
      <form noValidate onSubmit={handleSubmit(submit)} className="space-y-5">
        <FormError message={error} />
        <FormField
          label="Email address"
          type="email"
          autoComplete="email"
          field={register('email')}
          error={errors.email?.message}
        />
        <button
          disabled={isSubmitting || cooldown.remaining > 0}
          className="flex h-11 w-full items-center justify-center rounded-lg bg-primary px-4 text-sm font-medium text-white disabled:opacity-50"
          aria-busy={isSubmitting}
        >
          {isSubmitting
            ? 'Requesting…'
            : cooldown.remaining
              ? `Resend email in ${cooldown.remaining}s`
              : sent
                ? 'Resend email'
                : 'Send reset link'}
        </button>
      </form>
      <Link href="/login" className="block text-center text-sm text-accent underline">
        Back to sign in
      </Link>
    </FormPanel>
  );
}
