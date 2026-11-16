import { PlaceholderPage } from '@/components/shared/PlaceholderPage';
import { SEO } from '@/components/shared/SEO';
export const metadata = {
  ...SEO({
    title: 'Admin Panel',
    description: 'A dedicated workspace for managing SBR Real Estate. Coming soon.',
    url: '/admin',
  }),
  robots: { index: false, follow: false },
};
/** Phase 1 placeholder; feature functionality is deliberately not enabled. */
export default function Page(): React.JSX.Element {
  return (
    <PlaceholderPage
      title={'Admin Panel'}
      subtitle={'A dedicated workspace for managing SBR Real Estate. Coming soon.'}
    />
  );
}
