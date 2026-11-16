import { PlaceholderPage } from '@/components/shared/PlaceholderPage';
import { SEO } from '@/components/shared/SEO';
export const metadata = {
  ...SEO({
    title: 'Dashboard',
    description: 'Your properties, conversations, and saved spaces. Coming soon.',
    url: '/dashboard',
  }),
  robots: { index: false, follow: false },
};
/** Phase 1 placeholder; feature functionality is deliberately not enabled. */
export default function Page(): React.JSX.Element {
  return (
    <PlaceholderPage
      title={'Dashboard'}
      subtitle={'Your properties, conversations, and saved spaces. Coming soon.'}
    />
  );
}
