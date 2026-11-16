import { PlaceholderPage } from '@/components/shared/PlaceholderPage';
import { SEO } from '@/components/shared/SEO';
export const metadata = {
  ...SEO({
    title: 'Contact Us',
    description: 'Meaningful conversations start here. Our contact experience is coming soon.',
    url: '/contact',
  }),
};
/** Phase 1 placeholder; feature functionality is deliberately not enabled. */
export default function Page(): React.JSX.Element {
  return (
    <PlaceholderPage
      title={'Contact Us'}
      subtitle={'Meaningful conversations start here. Our contact experience is coming soon.'}
    />
  );
}
