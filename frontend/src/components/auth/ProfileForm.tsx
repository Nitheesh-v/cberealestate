'use client';
import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Camera, CircleUserRound } from 'lucide-react';
import {
  profileSchema,
  changePasswordSchema,
  type ProfileValues,
  type ChangeValues,
} from '@/lib/validators/auth.validator';
import type { User } from '@/types/user.types';
import { authService, authError } from '@/services/auth.service';
import { useAuthStore } from '@/store/auth.store';
import { toast } from '@/hooks/use-toast';
import { Container } from '@/components/shared/Container';
import { FormError, FormField, SubmitButton } from './FormControls';
/** Authenticated profile and credential management; actual uploads belong to the media phase. */
export function ProfileForm(): React.JSX.Element | null {
  const user = useAuthStore((state) => state.user);
  return user ? <ProfileEditor key={user.id} user={user} /> : null;
}
/** Separates profile fields from password fields so secrets never enter persisted state. */
function ProfileEditor({ user }: { user: User }): React.JSX.Element {
  const router = useRouter();
  const [profileError, setProfileError] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const profile = useForm<ProfileValues>({
    resolver: zodResolver(profileSchema),
    defaultValues: { firstName: user.firstName, lastName: user.lastName, phone: user.phone ?? '' },
  });
  const password = useForm<ChangeValues>({
    resolver: zodResolver(changePasswordSchema),
    defaultValues: { currentPassword: '', newPassword: '', confirmPassword: '' },
  });
  /** Stores only the server's public profile response after a successful update. */
  const save = async (values: ProfileValues): Promise<void> => {
    setProfileError('');
    try {
      const updated = await authService.updateProfile(values);
      useAuthStore.getState().updateUser(updated);
      profile.reset({
        firstName: updated.firstName,
        lastName: updated.lastName,
        phone: updated.phone ?? '',
      });
      toast({ title: 'Profile updated' });
    } catch (failure: unknown) {
      setProfileError(authError(failure));
      toast({ title: 'Profile update unsuccessful', description: authError(failure) });
    }
  };
  /** A password change revokes the session, so require a fresh login immediately. */
  const change = async (values: ChangeValues): Promise<void> => {
    setPasswordError('');
    try {
      await authService.changePassword(values.currentPassword, values.newPassword);
      password.reset();
      useAuthStore.getState().clearAuth();
      router.replace('/login?reset=success');
    } catch (failure: unknown) {
      setPasswordError(authError(failure));
      toast({ title: 'Password change unsuccessful', description: authError(failure) });
    }
  };
  return (
    <Container className="max-w-4xl py-10">
      <header className="mb-8">
        <h1 className="font-heading text-3xl text-primary dark:text-secondary-light">
          Your profile
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Manage your details and account security.
        </p>
      </header>
      <div className="mb-8 flex flex-wrap items-center gap-5 rounded-xl border bg-surface p-6">
        {user.avatar ? (
          <Image
            src={user.avatar}
            width={72}
            height={72}
            alt={`${user.firstName}'s avatar`}
            loading="lazy"
            className="rounded-full object-cover"
          />
        ) : (
          <CircleUserRound className="h-16 w-16 text-accent" />
        )}
        <div>
          <p className="font-semibold">{user.fullName}</p>
          <p className="text-sm capitalize text-muted-foreground">
            {user.role} · {user.isVerified ? 'Email verified' : 'Email not verified'}
          </p>
          {!user.isVerified && (
            <Link
              href={`/verify-otp?email=${encodeURIComponent(user.email)}`}
              className="text-sm text-accent underline"
            >
              Verify your email
            </Link>
          )}
        </div>
        <div className="ml-auto text-xs text-muted-foreground">
          <Camera aria-hidden="true" className="mb-2 h-5 w-5" />
          Avatar uploads will be available with media management.
        </div>
      </div>
      <div className="grid gap-8 lg:grid-cols-2">
        <section className="rounded-xl border bg-surface p-6">
          <h2 className="mb-5 font-heading text-2xl">Personal details</h2>
          <form noValidate className="space-y-5" onSubmit={profile.handleSubmit(save)}>
            <FormError message={profileError} />
            <FormField
              label="First name"
              autoComplete="given-name"
              field={profile.register('firstName')}
              error={profile.formState.errors.firstName?.message}
            />
            <FormField
              label="Last name"
              autoComplete="family-name"
              field={profile.register('lastName')}
              error={profile.formState.errors.lastName?.message}
            />
            <div>
              <p className="text-sm font-medium">Email address</p>
              <p className="mt-2 break-all text-sm text-muted-foreground">{user.email}</p>
              <p className="mt-1 text-xs text-muted-foreground">
                Contact support to change your sign-in email.
              </p>
            </div>
            <FormField
              label="Phone"
              type="tel"
              autoComplete="tel"
              field={profile.register('phone')}
              error={profile.formState.errors.phone?.message}
            />
            <SubmitButton loading={profile.formState.isSubmitting}>Save changes</SubmitButton>
          </form>
        </section>
        <section className="rounded-xl border bg-surface p-6">
          <h2 className="mb-2 font-heading text-2xl">Change password</h2>
          <p className="mb-5 text-xs leading-5 text-muted-foreground">
            Use 8–72 characters with uppercase, lowercase, a number and a symbol. Changing your
            password signs you out.
          </p>
          <form noValidate className="space-y-5" onSubmit={password.handleSubmit(change)}>
            <FormError message={passwordError} />
            <FormField
              label="Current password"
              type="password"
              autoComplete="current-password"
              field={password.register('currentPassword')}
              error={password.formState.errors.currentPassword?.message}
            />
            <FormField
              label="New password"
              type="password"
              autoComplete="new-password"
              field={password.register('newPassword')}
              error={password.formState.errors.newPassword?.message}
            />
            <FormField
              label="Confirm password"
              type="password"
              autoComplete="new-password"
              field={password.register('confirmPassword')}
              error={password.formState.errors.confirmPassword?.message}
            />
            <SubmitButton loading={password.formState.isSubmitting}>Update password</SubmitButton>
          </form>
        </section>
      </div>
    </Container>
  );
}
