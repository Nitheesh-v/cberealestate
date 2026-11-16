import type { HTMLAttributes } from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';
export const badgeVariants = cva(
  'inline-flex items-center rounded-full border px-3 py-1 text-xs font-medium',
  {
    variants: {
      variant: {
        default: 'border-transparent bg-primary text-white',
        secondary: 'border-secondary/30 bg-secondary/10 text-primary dark:text-secondary-light',
        outline: 'text-foreground',
      },
    },
    defaultVariants: { variant: 'default' },
  },
);
export interface BadgeProps
  extends HTMLAttributes<HTMLDivElement>, VariantProps<typeof badgeVariants> {}
/** Compact status label. */
export function Badge({ className, variant, ...props }: BadgeProps): React.JSX.Element {
  return <div className={cn(badgeVariants({ variant }), className)} {...props} />;
}
