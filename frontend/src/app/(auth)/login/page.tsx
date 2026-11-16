import { PlaceholderPage } from '@/components/shared/PlaceholderPage';
import { SEO } from '@/components/shared/SEO';
export const metadata = {
  ...SEO({
    title: 'Login',
    description: 'Your personal real estate journey starts here. Sign-in is coming soon.',
    url: '/login',
  }),
  robots: { index: false, follow: false },
};
/** Phase 1 placeholder; feature functionality is deliberately not enabled. */
export default function Page(): React.JSX.Element {
  return (
    <PlaceholderPage
      title={'Login'}
      subtitle={'Your personal real estate journey starts here. Sign-in is coming soon.'}
    />
  );
}
