import { Skeleton } from '@/components/ui/skeleton';
/** Property-shaped placeholder without fabricated listing data. */
export function SkeletonCard(): React.JSX.Element {
  return (
    <div
      role="status"
      aria-label="Loading property"
      className="overflow-hidden rounded-xl border bg-surface"
    >
      <Skeleton className="aspect-[4/3] rounded-none" />
      <div className="space-y-4 p-5">
        <Skeleton className="h-5 w-3/4" />
        <Skeleton className="h-7 w-1/2" />
        <div className="flex gap-3">
          <Skeleton className="h-4 w-1/3" />
          <Skeleton className="h-4 w-1/3" />
          <Skeleton className="h-4 w-1/3" />
        </div>
      </div>
    </div>
  );
}
