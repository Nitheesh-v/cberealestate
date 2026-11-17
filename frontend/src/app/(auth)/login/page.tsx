import { Suspense } from 'react';
import { LoginForm } from '@/components/auth/LoginForm';
import { LoadingSpinner } from '@/components/shared/LoadingSpinner';
import { SEO } from '@/components/shared/SEO';
export const metadata = {
  ...SEO({
    title: 'Login',
    description: 'Sign in to your SBR Real Estate account.',
    url: '/login',
  }),
  robots: { index: false, follow: false },
  referrer: 'no-referrer' as const,
};
/** Accessible auth page with metadata and a Suspense fallback for query parameters. */
export default function Page(): React.JSX.Element {
  return (
    <Suspense
      fallback={
        <div className="p-12 text-center">
          <LoadingSpinner />
        </div>
      }
    >
      <LoginForm />
    </Suspense>
  );
}
