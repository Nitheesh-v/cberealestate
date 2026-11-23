import { ImmersiveHome } from '@/components/home/ImmersiveHome';
import { SEO } from '@/components/shared/SEO';

export const metadata = {
  ...SEO({
    title: 'Welcome to SBR Real Estate',
    description: 'Discover spaces for the moments that matter. Explore your next chapter with SBR Real Estate.',
    url: '/',
  }),
};

export default function Page(): React.JSX.Element {
  return <ImmersiveHome />;
}
