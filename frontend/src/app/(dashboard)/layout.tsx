import { AuthGate } from '@/components/auth/AuthGate';
import { AccountActions } from '@/components/auth/AccountActions';
import type { PropsWithChildren } from 'react';
import Link from 'next/link';
import { LayoutDashboard, CircleUserRound } from 'lucide-react';
import { Brand } from '@/components/shared/Brand';
/** Authenticated workspace shell with profile navigation and session controls. */
export default function DashboardLayout({ children }: PropsWithChildren): React.JSX.Element {
  return (
    <AuthGate>
      <div className="min-h-screen bg-muted/40 md:flex">
        <aside className="border-b bg-surface p-6 md:w-64 md:shrink-0 md:border-r">
          <Brand />
          <nav aria-label="Dashboard navigation" className="mt-8 space-y-2">
            <Link
              href="/dashboard"
              className="flex items-center gap-3 rounded-lg px-3 py-3 text-sm hover:bg-muted"
            >
              <LayoutDashboard className="h-4 w-4" />
              Overview
            </Link>
            <Link
              href="/dashboard/profile"
              className="flex items-center gap-3 rounded-lg px-3 py-3 text-sm hover:bg-muted"
            >
              <CircleUserRound className="h-4 w-4" />
              Your profile
            </Link>
          </nav>
        </aside>
        <div className="min-w-0 flex-1">
          <header className="flex flex-wrap items-center justify-between gap-4 border-b bg-surface px-6 py-5">
            <span className="text-sm font-medium">Your workspace</span>
            <AccountActions />
          </header>
          {children}
        </div>
      </div>
    </AuthGate>
  );
}
