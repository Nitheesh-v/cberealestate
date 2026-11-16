import { cn } from '@/lib/utils';
interface SectionHeadingProps {
  title: string;
  subtitle?: string;
  align?: 'left' | 'center';
}
/** Reusable section title with the brand's gold accent. */
export function SectionHeading({
  title,
  subtitle,
  align = 'center',
}: SectionHeadingProps): React.JSX.Element {
  return (
    <div className={cn('space-y-4', align === 'center' && 'text-center')}>
      <h2 className="font-heading text-3xl font-bold tracking-tight text-primary dark:text-secondary-light sm:text-4xl">
        {title}
      </h2>
      <div className={cn('h-0.5 w-12 bg-secondary', align === 'center' && 'mx-auto')} />
      {subtitle && <p className="text-base leading-relaxed text-muted-foreground">{subtitle}</p>}
    </div>
  );
}
