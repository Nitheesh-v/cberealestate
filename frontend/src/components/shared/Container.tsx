import type { HTMLAttributes } from 'react';
import { cn } from '@/lib/utils';
/** Mobile-first, consistently padded site container. */
export function Container({
  className,
  ...props
}: HTMLAttributes<HTMLDivElement>): React.JSX.Element {
  return (
    <div className={cn('mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8', className)} {...props} />
  );
}
