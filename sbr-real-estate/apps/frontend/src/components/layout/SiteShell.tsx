'use client';
import type { ReactNode } from 'react';
import { usePathname } from 'next/navigation';
/** Avoids duplicating public chrome on auth and workspace routes. */
export function SiteShell({
  children,
  header,
  footer,
}: {
  children: ReactNode;
  header: ReactNode;
  footer: ReactNode;
}): React.JSX.Element {
  const pathname = usePathname();
  const privateChrome = ['/login', '/register', '/dashboard', '/admin'].some(
    (route) => pathname === route || pathname.startsWith(`${route}/`),
  );
  return (
    <>
      {!privateChrome && header}
      <main id="main-content" className="min-h-screen">
        {children}
      </main>
      {!privateChrome && footer}
    </>
  );
}
