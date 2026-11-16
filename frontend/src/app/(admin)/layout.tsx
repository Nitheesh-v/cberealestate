import type { PropsWithChildren } from 'react';
import { Bell } from 'lucide-react';
import { AdminSidebar } from '@/components/layout/AdminSidebar';
/** Admin shell preview only; Phase 1 exposes no administrative operations or data. */
export default function AdminLayout({ children }: PropsWithChildren): React.JSX.Element {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-background md:flex">
      <AdminSidebar />
      <div className="min-w-0 flex-1">
        <header className="flex items-center justify-between gap-4 border-b bg-surface px-6 py-5">
          <span className="text-sm font-medium">Administration</span>
          <div className="flex items-center gap-4 text-xs text-muted-foreground">
            <span>Admin preview</span>
            <Bell aria-label="Notifications coming soon" className="h-5 w-5" />
          </div>
        </header>
        {children}
      </div>
    </div>
  );
}
