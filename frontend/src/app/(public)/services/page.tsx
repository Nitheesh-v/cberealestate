import { PlaceholderPage } from '@/components/shared/PlaceholderPage';
import { SEO } from '@/components/shared/SEO';
export const metadata = {
  ...SEO({
    title: 'Our Services',
    description: 'Support for every step of your property journey. Coming soon.',
    url: '/services',
  }),
};
/** Phase 1 placeholder; feature functionality is deliberately not enabled. */
export default function Page(): React.JSX.Element {
  return (
    <PlaceholderPage
      title={'Our Services'}
      subtitle={'Support for every step of your property journey. Coming soon.'}
    />
  );
}
