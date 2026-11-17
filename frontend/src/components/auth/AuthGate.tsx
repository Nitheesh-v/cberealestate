'use client';
import { useEffect, type PropsWithChildren } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/auth.store';
import { UserRole } from '@/types/user.types';
import { LoadingSpinner } from '@/components/shared/LoadingSpinner';
import { SkeletonCard } from '@/components/shared/SkeletonCard';
/** Client UX gate only; API guards independently enforce all actual authorization. */
export function AuthGate({
  children,
  roles,
}: PropsWithChildren<{ roles?: UserRole[] }>): React.JSX.Element {
  const { isLoading, isAuthenticated, user } = useAuthStore();
  const router = useRouter();
  const pathname = usePathname();
  useEffect(() => {
    if (!isLoading && !isAuthenticated)
      router.replace(`/login?returnTo=${encodeURIComponent(pathname)}`);
  }, [isLoading, isAuthenticated, router, pathname]);
  if (isLoading || !isAuthenticated)
    return (
      <div className="mx-auto max-w-3xl space-y-8 p-10">
        <div className="text-center">
          <LoadingSpinner />
        </div>
        <SkeletonCard />
      </div>
    );
  if (roles && (!user || !roles.includes(user.role)))
    return (
      <section className="p-12 text-center">
        <h1 className="font-heading text-3xl">Access restricted</h1>
        <p className="my-4">Your account does not have permission to view this area.</p>
        <Link href="/dashboard" className="underline">
          Go to your dashboard
        </Link>
      </section>
    );
  return <>{children}</>;
}
