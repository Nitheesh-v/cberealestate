'use client';
import { useState } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { resetPasswordSchema, type ResetValues } from '@/lib/validators/auth.validator';
import { authService, authError } from '@/services/auth.service';
import { useAuthStore } from '@/store/auth.store';
import { toast } from '@/hooks/use-toast';
import { FormError, FormField, FormPanel, SubmitButton } from './FormControls';
/** Resets credentials using only a well-formed token read from the current URL. */
export function ResetPasswordForm(): React.JSX.Element {
  const token = useSearchParams().get('token') ?? '';
  const router = useRouter();
  const [error, setError] = useState('');
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ResetValues>({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: { newPassword: '', confirmPassword: '' },
  });
  /** Clears any local session and removes the reset credential from browser navigation. */
  const submit = async (values: ResetValues): Promise<void> => {
    setError('');
    try {
      await authService.resetPassword(token, values.newPassword);
      useAuthStore.getState().clearAuth();
      router.replace('/login?reset=success');
    } catch (failure: unknown) {
      const message = authError(failure);
      setError(message);
      toast({ title: 'Password reset unsuccessful', description: message });
    }
  };
  return (
    <FormPanel
      title="Choose a fresh start"
      subtitle="Set a strong password you haven’t used before."
    >
      {!/^[a-f0-9]{64}$/.test(token) ? (
        <div role="alert" className="space-y-4">
          <p>This reset link is missing or invalid.</p>
          <Link href="/forgot-password" className="text-accent underline">
            Request a new link
          </Link>
        </div>
      ) : (
        <form noValidate onSubmit={handleSubmit(submit)} className="space-y-5">
          <FormError message={error} />
          <FormField
            label="New password"
            type="password"
            autoComplete="new-password"
            field={register('newPassword')}
            error={errors.newPassword?.message}
          />
          <FormField
            label="Confirm password"
            type="password"
            autoComplete="new-password"
            field={register('confirmPassword')}
            error={errors.confirmPassword?.message}
          />
          <SubmitButton loading={isSubmitting}>Reset password</SubmitButton>
          <Link href="/forgot-password" className="block text-center text-sm text-accent underline">
            Request a new link instead
          </Link>
        </form>
      )}
    </FormPanel>
  );
}
