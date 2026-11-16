import type { PropsWithChildren } from 'react';
/** Public routes share the root navigation and footer. */
export default function PublicLayout({ children }: PropsWithChildren): React.ReactNode {
  return children;
}
