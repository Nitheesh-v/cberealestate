import { PlaceholderPage } from '@/components/shared/PlaceholderPage';
import { SEO } from '@/components/shared/SEO';
export const metadata = {
  ...SEO({
    title: 'About Us',
    description: 'Get to know the people and purpose behind SBR Real Estate. Coming soon.',
    url: '/about',
  }),
};
/** Phase 1 placeholder; feature functionality is deliberately not enabled. */
export default function Page(): React.JSX.Element {
  return (
    <PlaceholderPage
      title={'About Us'}
      subtitle={'Get to know the people and purpose behind SBR Real Estate. Coming soon.'}
    />
  );
}
