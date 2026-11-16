import { PlaceholderPage } from '@/components/shared/PlaceholderPage';
import { SEO } from '@/components/shared/SEO';
export const metadata = {
  ...SEO({
    title: 'Register',
    description: 'Make room for new possibilities. Registration is coming soon.',
    url: '/register',
  }),
  robots: { index: false, follow: false },
};
/** Phase 1 placeholder; feature functionality is deliberately not enabled. */
export default function Page(): React.JSX.Element {
  return (
    <PlaceholderPage
      title={'Register'}
      subtitle={'Make room for new possibilities. Registration is coming soon.'}
    />
  );
}
