import { Suspense } from 'react';
import { ForgotPasswordForm } from '@/components/auth/ForgotPasswordForm';
import { LoadingSpinner } from '@/components/shared/LoadingSpinner';
import { SEO } from '@/components/shared/SEO';
export const metadata = {
  ...SEO({
    title: 'Forgot Password',
    description: 'Request a secure password reset link.',
    url: '/forgot-password',
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
      <ForgotPasswordForm />
    </Suspense>
  );
}
