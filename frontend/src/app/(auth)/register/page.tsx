import { Suspense } from 'react';
import { RegisterForm } from '@/components/auth/RegisterForm';
import { LoadingSpinner } from '@/components/shared/LoadingSpinner';
import { SEO } from '@/components/shared/SEO';
export const metadata = {
  ...SEO({
    title: 'Create an Account',
    description: 'Register as a buyer, renter, or property agent.',
    url: '/register',
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
      <RegisterForm />
    </Suspense>
  );
}
