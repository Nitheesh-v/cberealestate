'use client';
import Link from 'next/link';
import { useAuthStore } from '@/store/auth.store';
import { Container } from '@/components/shared/Container';
import { Button } from '@/components/ui/button';
/** Authenticated account overview with working profile and verification destinations. */
export function DashboardHome(): React.JSX.Element {
  const user = useAuthStore((state) => state.user);
  return (
    <Container className="py-12">
      <h1 className="font-heading text-4xl text-primary dark:text-secondary-light">
        Welcome, {user?.firstName}
      </h1>
      <p className="mt-3 text-muted-foreground">
        Manage your account and get ready for your next property journey.
      </p>
      <section className="mt-8 space-y-5 rounded-xl border bg-surface p-6">
        <h2 className="font-heading text-2xl">Your account</h2>
        <p className="text-sm capitalize">
          {user?.role} account ·{' '}
          {user?.isVerified ? 'Email verified' : 'Email verification required'}
        </p>
        <div className="flex flex-wrap gap-3">
          <Button asChild>
            <Link href="/dashboard/profile">Manage profile</Link>
          </Button>
          {user && !user.isVerified && (
            <Button asChild variant="outline">
              <Link href={`/verify-otp?email=${encodeURIComponent(user.email)}`}>Verify email</Link>
            </Button>
          )}
        </div>
      </section>
    </Container>
  );
}
