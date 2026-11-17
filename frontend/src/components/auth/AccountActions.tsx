'use client';
import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { LogOut } from 'lucide-react';
import { useAuthStore } from '@/store/auth.store';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { toast } from '@/hooks/use-toast';
import { UserRole } from '@/types/user.types';
/** Session-aware links with immediate local logout and explicit server-revocation feedback. */
export function AccountActions({ mobile = false }: { mobile?: boolean }): React.JSX.Element {
  const { user, isAuthenticated, isLoading, logout } = useAuthStore();
  const [busy, setBusy] = useState(false);
  const router = useRouter();
  /** Signs out locally even during an outage; persisted logout prevents silent session restoration. */
  const signOut = async (): Promise<void> => {
    setBusy(true);
    try {
      await logout();
    } catch {
      toast({
        title: 'Signed out on this device',
        description:
          'Server revocation could not be confirmed. Retry when connected if this is a shared device.',
      });
    } finally {
      setBusy(false);
      router.replace('/login');
    }
  };
  if (isLoading) return <Skeleton className="h-9 w-28" />;
  if (!isAuthenticated || !user)
    return (
      <div className={mobile ? 'grid gap-3' : 'flex items-center gap-3'}>
        <Button asChild size="sm">
          <Link href="/login">Login</Link>
        </Button>
        <Button asChild variant="ghost" size="sm">
          <Link href="/register">Register</Link>
        </Button>
      </div>
    );
  return (
    <div className={mobile ? 'grid gap-3' : 'flex items-center gap-2'}>
      <Button asChild variant="ghost" size="sm">
        <Link href={user.role === UserRole.ADMIN ? '/admin' : '/dashboard'}>Dashboard</Link>
      </Button>
      <Button asChild variant="outline" size="sm">
        <Link href="/dashboard/profile">Profile</Link>
      </Button>
      <Button
        disabled={busy}
        variant="ghost"
        size={mobile ? 'sm' : 'icon'}
        aria-label="Sign out"
        onClick={() => void signOut()}
      >
        <LogOut className="h-4 w-4" />
        {mobile && 'Sign out'}
      </Button>
    </div>
  );
}
