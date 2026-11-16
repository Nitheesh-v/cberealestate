'use client';
import { useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion, useReducedMotion } from 'framer-motion';
import { Home, Building2, Info, Handshake, BookOpen, Mail } from 'lucide-react';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Brand } from '@/components/shared/Brand';
import { NAV_LINKS } from '@/lib/constants';
import { cn } from '@/lib/utils';
import { useUiStore } from '@/store/ui.store';
const icons = [Home, Building2, Info, Handshake, BookOpen, Mail];
/** Focus-trapped mobile navigation with staggered entrance transitions. */
export function MobileMenu(): React.JSX.Element {
  const pathname = usePathname();
  const { isMobileMenuOpen, setMobileMenuOpen } = useUiStore();
  const reduceMotion = useReducedMotion();
  useEffect(() => {
    setMobileMenuOpen(false);
  }, [pathname, setMobileMenuOpen]);
  return (
    <Sheet open={isMobileMenuOpen} onOpenChange={setMobileMenuOpen}>
      <SheetContent>
        <SheetHeader>
          <SheetTitle className="sr-only">Site navigation</SheetTitle>
          <Brand onClick={() => setMobileMenuOpen(false)} />
          <SheetDescription className="pt-3">A place for your next chapter.</SheetDescription>
        </SheetHeader>
        <nav aria-label="Mobile navigation" className="my-8 space-y-1">
          {NAV_LINKS.map(({ label, href }, index) => {
            const Icon = icons[index] ?? Home;
            return (
              <motion.div
                key={href}
                initial={reduceMotion ? false : { opacity: 0, x: 10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: reduceMotion ? 0 : index * 0.04 }}
              >
                <Link
                  href={href}
                  onClick={() => setMobileMenuOpen(false)}
                  aria-current={pathname === href ? 'page' : undefined}
                  className={cn(
                    'flex items-center gap-3 rounded-lg p-3 text-sm hover:bg-muted',
                    pathname === href && 'bg-primary/10 text-accent',
                  )}
                >
                  <Icon className="h-4 w-4" />
                  {label}
                </Link>
              </motion.div>
            );
          })}
        </nav>
        <Separator />
        <div className="mt-6 space-y-3">
          <Button asChild className="w-full">
            <Link href="/login">Login</Link>
          </Button>
          <Button asChild variant="outline" className="w-full">
            <Link href="/register">Create an account</Link>
          </Button>
          <Button asChild variant="ghost" className="w-full">
            <Link href="/login?returnTo=%2Fdashboard">List Property</Link>
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  );
}
