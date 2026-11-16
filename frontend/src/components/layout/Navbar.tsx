'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Menu, Plus } from 'lucide-react';
import { motion, useReducedMotion } from 'framer-motion';
import { NAV_LINKS } from '@/lib/constants';
import { cn } from '@/lib/utils';
import { useUiStore } from '@/store/ui.store';
import { Button } from '@/components/ui/button';
import { Container } from '@/components/shared/Container';
import { Brand } from '@/components/shared/Brand';
import { MobileMenu } from './MobileMenu';
/** Responsive sticky site navigation with an accessible mobile drawer. */
export function Navbar(): React.JSX.Element {
  const pathname = usePathname();
  const [scrolled, setScrolled] = useState(false);
  const openMenu = useUiStore((state) => state.setMobileMenuOpen);
  const reduceMotion = useReducedMotion();
  useEffect(() => {
    /** Updates the header elevation without rerendering for every pixel. */
    const update = (): void => setScrolled(window.scrollY > 50);
    update();
    window.addEventListener('scroll', update, { passive: true });
    return () => window.removeEventListener('scroll', update);
  }, []);
  return (
    <>
      <motion.header
        initial={reduceMotion ? false : { opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
        className={cn(
          'sticky top-0 z-40 border-b border-border/60 bg-white/90 backdrop-blur-md transition-shadow dark:bg-surface/90',
          scrolled && 'shadow-sm',
        )}
      >
        <Container className="flex min-h-20 flex-wrap items-center justify-between gap-x-4 gap-y-3 py-4 lg:h-20 lg:flex-nowrap lg:py-0">
          <Brand />
          <nav
            aria-label="Main navigation"
            className="order-3 hidden w-full items-center justify-center gap-5 md:flex lg:order-none lg:w-auto lg:gap-6"
          >
            {NAV_LINKS.map(({ label, href }) => {
              const active = href === '/' ? pathname === href : pathname.startsWith(href);
              return (
                <Link
                  key={href}
                  href={href}
                  aria-current={active ? 'page' : undefined}
                  className={cn(
                    'group relative py-2 text-[13px] font-medium transition-colors hover:text-accent',
                    active ? 'text-primary dark:text-secondary-light' : 'text-muted-foreground',
                  )}
                >
                  {label}
                  <span
                    className={cn(
                      'absolute inset-x-0 bottom-0 h-0.5 origin-left bg-secondary transition-transform group-hover:scale-x-100',
                      active ? 'scale-x-100' : 'scale-x-0',
                    )}
                  />
                </Link>
              );
            })}
          </nav>
          <div className="hidden items-center gap-3 md:flex">
            <Button asChild variant="outline" size="sm" className="hidden lg:inline-flex">
              <Link href="/login?returnTo=%2Fdashboard">
                <Plus className="h-3.5 w-3.5" />
                List Property
              </Link>
            </Button>
            <Button asChild size="sm">
              <Link href="/login">Login</Link>
            </Button>
            <Link href="/register" className="text-xs font-medium hover:text-accent">
              Register
            </Link>
          </div>
          <Button
            variant="ghost"
            size="icon"
            className="md:hidden"
            aria-label="Open navigation"
            aria-haspopup="dialog"
            onClick={() => openMenu(true)}
          >
            <Menu className="h-6 w-6" />
          </Button>
        </Container>
      </motion.header>
      <MobileMenu />
    </>
  );
}
