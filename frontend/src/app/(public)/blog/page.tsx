import { PlaceholderPage } from '@/components/shared/PlaceholderPage';
import { SEO } from '@/components/shared/SEO';
export const metadata = {
  ...SEO({
    title: 'Blog',
    description: 'Fresh perspectives on homes, communities, and real estate. Coming soon.',
    url: '/blog',
  }),
};
/** Phase 1 placeholder; feature functionality is deliberately not enabled. */
export default function Page(): React.JSX.Element {
  return (
    <PlaceholderPage
      title={'Blog'}
      subtitle={'Fresh perspectives on homes, communities, and real estate. Coming soon.'}
    />
  );
}
