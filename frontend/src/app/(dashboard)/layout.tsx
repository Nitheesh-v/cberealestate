import type { PropsWithChildren } from 'react';
import Link from 'next/link';
import { LayoutDashboard, CircleUserRound } from 'lucide-react';
import { Brand } from '@/components/shared/Brand';
/** Presentational dashboard shell, not an authenticated area yet. */
export default function DashboardLayout({ children }: PropsWithChildren): React.JSX.Element {
  return (
    <div className="min-h-screen bg-muted/40 md:flex">
      <aside className="border-b bg-surface p-6 md:w-64 md:shrink-0 md:border-r">
        <Brand />
        <nav aria-label="Dashboard navigation" className="mt-8">
          <Link
            href="/dashboard"
            aria-current="page"
            className="flex items-center gap-3 rounded-lg bg-primary/10 px-3 py-3 text-sm text-accent"
          >
            <LayoutDashboard className="h-4 w-4" />
            Overview
          </Link>
        </nav>
      </aside>
      <div className="min-w-0 flex-1">
        <header className="flex items-center justify-between gap-4 border-b bg-surface px-6 py-5">
          <span className="text-sm font-medium">Your workspace</span>
          <span className="flex items-center gap-2 text-xs text-muted-foreground">
            <CircleUserRound className="h-5 w-5" />
            Guest preview
          </span>
        </header>
        {children}
      </div>
    </div>
  );
}
