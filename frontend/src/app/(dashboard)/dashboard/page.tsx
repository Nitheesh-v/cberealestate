import { DashboardHome } from '@/components/auth/DashboardHome';
import { SEO } from '@/components/shared/SEO';
export const metadata = {
  ...SEO({ title: 'Dashboard', description: 'Your SBR account overview.', url: '/dashboard' }),
  robots: { index: false, follow: false },
};
/** Account overview, rendered only inside the authenticated workspace gate. */
export default function Page(): React.JSX.Element {
  return <DashboardHome />;
}
