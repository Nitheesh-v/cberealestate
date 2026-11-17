import { Suspense } from 'react';
import { VerifyOtpForm } from '@/components/auth/VerifyOtpForm';
import { LoadingSpinner } from '@/components/shared/LoadingSpinner';
import { SEO } from '@/components/shared/SEO';
export const metadata = {
  ...SEO({
    title: 'Verify Your Email',
    description: 'Verify your email address with a six-digit code.',
    url: '/verify-otp',
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
      <VerifyOtpForm />
    </Suspense>
  );
}
