'use client';
import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { registerSchema, type RegisterValues } from '@/lib/validators/auth.validator';
import { authService, authError } from '@/services/auth.service';
import { useAuthStore } from '@/store/auth.store';
import { toast } from '@/hooks/use-toast';
import { FormError, FormField, FormPanel, SubmitButton } from './FormControls';
/** Buyer/agent registration never submits administrative or verification fields. */
export function RegisterForm(): React.JSX.Element {
  const router = useRouter();
  const [error, setError] = useState('');
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<RegisterValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      firstName: '',
      lastName: '',
      email: '',
      phone: '',
      password: '',
      confirmPassword: '',
      role: 'user',
      terms: false,
    },
  });
  /** Submits only the DTO allowlist and moves directly to email verification. */
  const submit = async (values: RegisterValues): Promise<void> => {
    setError('');
    try {
      const result = await authService.register({
        firstName: values.firstName,
        lastName: values.lastName,
        email: values.email,
        phone: values.phone || undefined,
        password: values.password,
        role: values.role,
      });
      useAuthStore.getState().setAuth(result.user, result.accessToken);
      toast({
        title: 'Account created',
        description:
          result.verificationEmailQueued === false
            ? 'Email delivery is delayed. Please request another code on the next page.'
            : 'Check your inbox for your verification code.',
      });
      router.replace(`/verify-otp?email=${encodeURIComponent(result.user.email)}`);
    } catch (failure: unknown) {
      const message = authError(failure);
      setError(message);
      toast({ title: 'Registration unsuccessful', description: message });
    }
  };
  return (
    <FormPanel
      title="Make room for possibilities"
      subtitle="Create your account and start your property journey."
    >
      <form noValidate onSubmit={handleSubmit(submit)} className="space-y-5">
        <FormError message={error} />
        <div className="grid gap-4 sm:grid-cols-2">
          <FormField
            label="First name"
            autoComplete="given-name"
            field={register('firstName')}
            error={errors.firstName?.message}
          />
          <FormField
            label="Last name"
            autoComplete="family-name"
            field={register('lastName')}
            error={errors.lastName?.message}
          />
        </div>
        <FormField
          label="Email address"
          type="email"
          autoComplete="email"
          field={register('email')}
          error={errors.email?.message}
        />
        <FormField
          label="Phone (optional)"
          type="tel"
          autoComplete="tel"
          field={register('phone')}
          error={errors.phone?.message}
        />
        <fieldset className="space-y-3">
          <legend className="mb-2 text-sm font-medium">Account type</legend>
          {[
            { value: 'user', label: 'I want to Buy / Rent' },
            { value: 'agent', label: 'I am an Agent / Builder' },
          ].map(({ value, label }) => (
            <label
              key={value}
              className="flex cursor-pointer items-center gap-3 rounded-lg border p-3 text-sm transition-colors has-[:checked]:border-accent has-[:checked]:bg-primary/5"
            >
              <input type="radio" value={value} {...register('role')} className="accent-primary" />
              {label}
            </label>
          ))}
        </fieldset>
        <FormField
          label="Password"
          type="password"
          autoComplete="new-password"
          field={register('password')}
          error={errors.password?.message}
        />
        <p className="text-xs leading-5 text-muted-foreground">
          8–72 characters; include uppercase, lowercase, a number and a symbol. No spaces.
        </p>
        <FormField
          label="Confirm password"
          type="password"
          autoComplete="new-password"
          field={register('confirmPassword')}
          error={errors.confirmPassword?.message}
        />
        <label className="flex items-start gap-3 text-sm">
          <input
            type="checkbox"
            {...register('terms')}
            className="mt-1 h-4 w-4 shrink-0 accent-primary"
          />
          <span>
            I accept the terms: use this service lawfully, provide accurate information, and keep
            account credentials private. This account does not guarantee a property transaction.
          </span>
        </label>
        {errors.terms && (
          <p role="alert" className="text-xs text-destructive">
            {errors.terms.message}
          </p>
        )}
        <SubmitButton loading={isSubmitting}>Create account</SubmitButton>
      </form>
      <p className="text-center text-sm text-muted-foreground">
        Already registered?{' '}
        <Link className="text-accent underline" href="/login">
          Sign in
        </Link>
      </p>
    </FormPanel>
  );
}
