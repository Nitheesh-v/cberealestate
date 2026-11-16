'use client';
import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  Building2,
  Users,
  MessagesSquare,
  BookOpen,
  ChartNoAxesCombined,
  Settings,
  Menu,
} from 'lucide-react';
import { Brand } from '@/components/shared/Brand';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
const items = [
  { label: 'Dashboard', icon: LayoutDashboard, href: '/admin' },
  { label: 'Properties', icon: Building2, href: '/admin#properties' },
  { label: 'Users', icon: Users, href: '/admin#users' },
  { label: 'Inquiries', icon: MessagesSquare, href: '/admin#inquiries' },
  { label: 'Blog', icon: BookOpen, href: '/admin#blog' },
  { label: 'Analytics', icon: ChartNoAxesCombined, href: '/admin#analytics' },
  { label: 'Settings', icon: Settings, href: '/admin#settings' },
];
/** Presentational admin navigation only; access control arrives in a future phase. */
export function AdminSidebar(): React.JSX.Element {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();
  return (
    <aside className="border-b bg-surface p-5 md:w-64 md:shrink-0 md:border-b-0 md:border-r">
      <div className="flex items-center justify-between">
        <Brand />
        <Button
          variant="ghost"
          size="icon"
          className="md:hidden"
          aria-label="Toggle admin navigation"
          aria-expanded={open}
          aria-controls="admin-navigation"
          onClick={() => setOpen(!open)}
        >
          <Menu className="h-5 w-5" />
        </Button>
      </div>
      <nav
        id="admin-navigation"
        aria-label="Admin navigation"
        className={cn('mt-8 space-y-2 md:block', !open && 'hidden')}
      >
        {items.map(({ label, icon: Icon, href }) => (
          <Link
            key={label}
            href={href}
            onClick={() => setOpen(false)}
            aria-current={pathname === href ? 'page' : undefined}
            className={cn(
              'flex items-center gap-3 rounded-lg px-3 py-3 text-sm hover:bg-muted',
              pathname === href && 'bg-primary/10 text-accent',
            )}
          >
            <Icon className="h-4 w-4" />
            {label}
          </Link>
        ))}
      </nav>
      <p className="mt-6 text-xs leading-5 text-muted-foreground">
        Phase 1 preview.
        <br />
        Admin tools are not yet enabled.
      </p>
    </aside>
  );
}
