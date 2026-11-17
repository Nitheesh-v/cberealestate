'use client';
import { useState } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { loginSchema, type LoginValues } from '@/lib/validators/auth.validator';
import { authService, authError } from '@/services/auth.service';
import { useAuthStore } from '@/store/auth.store';
import { toast } from '@/hooks/use-toast';
import { FormError, FormField, FormPanel, SubmitButton } from './FormControls';
/** Restricts return navigation to actual protected application areas, never external URLs. */
export function safeReturnTo(value: string | null, role: string): string {
  if (
    value &&
    /^\/(dashboard|admin)(?:\/[a-zA-Z0-9_/-]*)?$/.test(value) &&
    (role === 'admin' || !value.startsWith('/admin'))
  )
    return value;
  return role === 'admin' ? '/admin' : '/dashboard';
}
/** Credential login with server-authoritative role routing and a real cookie persistence preference. */
export function LoginForm(): React.JSX.Element {
  const router = useRouter();
  const search = useSearchParams();
  const [error, setError] = useState('');
  const [audience, setAudience] = useState<'buyer' | 'agent'>('buyer');
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: '', password: '', rememberMe: true },
  });
  /** Starts a session and uses only the role returned by the server. */
  const submit = async (values: LoginValues): Promise<void> => {
    setError('');
    try {
      const result = await authService.login(values);
      useAuthStore.getState().setAuth(result.user, result.accessToken);
      router.replace(safeReturnTo(search.get('returnTo'), result.user.role));
    } catch (failure: unknown) {
      const message = authError(failure);
      setError(message);
      toast({ title: 'Sign-in unsuccessful', description: message });
    }
  };
  return (
    <FormPanel title="Welcome back" subtitle="Sign in to find a place for your next chapter.">
      {search.get('reset') === 'success' && (
        <p role="status" className="rounded-lg bg-primary/10 p-3 text-sm">
          Password updated. Sign in with your new password.
        </p>
      )}
      <div
        role="group"
        aria-label="Your property journey"
        className="grid grid-cols-2 rounded-lg bg-muted p-1"
      >
        {(['buyer', 'agent'] as const).map((role) => (
          <button
            key={role}
            type="button"
            aria-pressed={audience === role}
            className={`rounded-md px-3 py-2 text-sm ${audience === role ? 'bg-surface shadow-sm' : 'text-muted-foreground'}`}
            onClick={() => setAudience(role)}
          >
            {role === 'buyer' ? 'Buyer / Renter' : 'Agent / Builder'}
          </button>
        ))}
      </div>
      <form noValidate onSubmit={handleSubmit(submit)} className="space-y-5">
        <FormError message={error} />
        <FormField
          label="Email address"
          type="email"
          autoComplete="email"
          field={register('email')}
          error={errors.email?.message}
        />
        <FormField
          label="Password"
          type="password"
          autoComplete="current-password"
          field={register('password')}
          error={errors.password?.message}
        />
        <div className="flex flex-wrap items-center justify-between gap-3 text-sm">
          <label className="flex items-center gap-2">
            <input type="checkbox" {...register('rememberMe')} className="h-4 w-4 accent-primary" />
            Remember me
          </label>
          <Link href="/forgot-password" className="text-accent underline-offset-4 hover:underline">
            Forgot password?
          </Link>
        </div>
        <SubmitButton loading={isSubmitting}>Sign in</SubmitButton>
      </form>
      <p className="text-center text-sm text-muted-foreground">
        New to SBR?{' '}
        <Link className="font-medium text-accent underline" href="/register">
          Create an account
        </Link>
      </p>
    </FormPanel>
  );
}
