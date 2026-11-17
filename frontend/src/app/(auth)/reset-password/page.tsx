import { Suspense } from 'react';
import { ResetPasswordForm } from '@/components/auth/ResetPasswordForm';
import { LoadingSpinner } from '@/components/shared/LoadingSpinner';
import { SEO } from '@/components/shared/SEO';
export const metadata = {
  ...SEO({
    title: 'Reset Password',
    description: 'Choose a new password using your secure reset link.',
    url: '/reset-password',
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
      <ResetPasswordForm />
    </Suspense>
  );
}
