import type { HTMLAttributes } from 'react';
import { cn } from '@/lib/utils';
/** Decorative pulse block; expose a single loading status on its parent. */
export function Skeleton({
  className,
  ...props
}: HTMLAttributes<HTMLDivElement>): React.JSX.Element {
  return (
    <div
      aria-hidden="true"
      className={cn('animate-pulse rounded-lg bg-muted', className)}
      {...props}
    />
  );
}
