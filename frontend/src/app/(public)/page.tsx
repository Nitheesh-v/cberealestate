import { PlaceholderPage } from '@/components/shared/PlaceholderPage';
import { SEO } from '@/components/shared/SEO';
export const metadata = {
  ...SEO({
    title: 'Welcome to SBR Real Estate',
    description: 'A new home for your next chapter. Our real estate experience is coming soon.',
    url: '/',
  }),
};
/** Phase 1 placeholder; feature functionality is deliberately not enabled. */
export default function Page(): React.JSX.Element {
  return (
    <PlaceholderPage
      title={'Welcome to SBR Real Estate'}
      subtitle={'A new home for your next chapter. Our real estate experience is coming soon.'}
    />
  );
}
