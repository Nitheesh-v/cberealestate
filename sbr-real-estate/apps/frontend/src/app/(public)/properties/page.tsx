import { PlaceholderPage } from '@/components/shared/PlaceholderPage';
import { SEO } from '@/components/shared/SEO';
export const metadata = {
  ...SEO({
    title: 'Properties Listing',
    description: 'Spaces to live, work, and grow. Our property collection is coming soon.',
    url: '/properties',
  }),
};
/** Phase 1 placeholder; feature functionality is deliberately not enabled. */
export default function Page(): React.JSX.Element {
  return (
    <PlaceholderPage
      title={'Properties Listing'}
      subtitle={'Spaces to live, work, and grow. Our property collection is coming soon.'}
    />
  );
}
