'use client';
import { useState } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { otpSchema, type OtpValues } from '@/lib/validators/auth.validator';
import { authService, authError } from '@/services/auth.service';
import { useAuthStore } from '@/store/auth.store';
import { useCooldown } from '@/hooks/useCooldown';
import { toast } from '@/hooks/use-toast';
import { FormError, FormField, FormPanel, OtpInput, SubmitButton } from './FormControls';
/** Email verification supports pasted/autofilled six-digit codes and a resend cooldown. */
export function VerifyOtpForm(): React.JSX.Element {
  const search = useSearchParams();
  const router = useRouter();
  const user = useAuthStore((state) => state.user);
  const [error, setError] = useState('');
  const [resending, setResending] = useState(false);
  const cooldown = useCooldown(60);
  const {
    register,
    handleSubmit,
    control,
    getValues,
    trigger,
    formState: { errors, isSubmitting },
  } = useForm<OtpValues>({
    resolver: zodResolver(otpSchema),
    defaultValues: { email: search.get('email') ?? user?.email ?? '', otp: '' },
  });
  /** Redeems the challenge and refreshes the stored verification status from the API. */
  const submit = async (values: OtpValues): Promise<void> => {
    setError('');
    try {
      await authService.verifyOtp(values.email, values.otp);
      if (useAuthStore.getState().isAuthenticated)
        useAuthStore.getState().updateUser(await authService.me());
      toast({ title: 'Email verified' });
      router.replace(useAuthStore.getState().isAuthenticated ? '/dashboard' : '/login');
    } catch (failure: unknown) {
      const message = authError(failure);
      setError(message);
      toast({ title: 'Verification unsuccessful', description: message });
    }
  };
  /** Uses the same email validation before requesting another code. */
  const resend = async (): Promise<void> => {
    if (cooldown.remaining || !(await trigger('email'))) return;
    setResending(true);
    setError('');
    try {
      await authService.resendOtp(getValues('email'));
      cooldown.start(60);
      toast({
        title: 'Code requested',
        description: 'If your account needs verification, check your inbox.',
      });
    } catch (failure: unknown) {
      setError(authError(failure));
    } finally {
      setResending(false);
    }
  };
  return (
    <FormPanel
      title="Check your inbox"
      subtitle="Enter the six-digit verification code. Codes expire after 10 minutes and allow at most five attempts."
    >
      <form noValidate onSubmit={handleSubmit(submit)} className="space-y-5">
        <FormError message={error} />
        <FormField
          label="Email address"
          type="email"
          autoComplete="email"
          field={register('email')}
          error={errors.email?.message}
        />
        <Controller
          control={control}
          name="otp"
          render={({ field }) => (
            <OtpInput value={field.value} onChange={field.onChange} error={errors.otp?.message} />
          )}
        />
        <SubmitButton loading={isSubmitting}>Verify email</SubmitButton>
      </form>
      <button
        type="button"
        disabled={cooldown.remaining > 0 || resending}
        onClick={() => void resend()}
        className="w-full text-sm text-accent underline disabled:text-muted-foreground disabled:no-underline"
      >
        {resending
          ? 'Requesting…'
          : cooldown.remaining
            ? `Resend code in ${cooldown.remaining}s`
            : 'Resend code'}
      </button>
      <Link href="/login" className="block text-center text-sm text-muted-foreground underline">
        Back to sign in
      </Link>
    </FormPanel>
  );
}
