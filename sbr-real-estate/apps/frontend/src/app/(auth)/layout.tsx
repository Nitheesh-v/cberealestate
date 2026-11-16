import type { PropsWithChildren } from 'react';
import { Brand } from '@/components/shared/Brand';
/** Minimal branded auth shell; forms and authentication arrive in Phase 2. */
export default function AuthLayout({ children }: PropsWithChildren): React.JSX.Element {
  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-secondary/10">
      <header className="flex justify-center px-6 pt-10">
        <Brand />
      </header>
      <div className="mx-auto max-w-2xl">{children}</div>
    </div>
  );
}
