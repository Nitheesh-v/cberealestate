import { cn } from '@/lib/utils';
interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  color?: string;
}
/** Screen-reader-labeled spinner with configurable size and CSS color. */
export function LoadingSpinner({
  size = 'md',
  color = 'currentColor',
}: LoadingSpinnerProps): React.JSX.Element {
  return (
    <span role="status" className="inline-flex items-center justify-center">
      <span
        aria-hidden="true"
        style={{ color }}
        className={cn('animate-spin rounded-full border-2 border-current border-r-transparent', {
          'h-4 w-4': size === 'sm',
          'h-8 w-8': size === 'md',
          'h-12 w-12': size === 'lg',
        })}
      />
      <span className="sr-only">Loading…</span>
    </span>
  );
}
