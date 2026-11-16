import { Building2 } from 'lucide-react';
import { Container } from './Container';
import { Badge } from '@/components/ui/badge';
/** Intentionally minimal Phase 1 route content, without simulated feature functionality. */
export function PlaceholderPage({
  title,
  subtitle,
}: {
  title: string;
  subtitle: string;
}): React.JSX.Element {
  return (
    <Container className="flex min-h-[65vh] items-center justify-center py-20 sm:py-28">
      <section
        aria-labelledby="page-heading"
        className="relative w-full max-w-3xl overflow-hidden rounded-2xl border bg-surface px-6 py-16 text-center shadow-soft sm:px-12 sm:py-24"
      >
        <div
          aria-hidden="true"
          className="absolute -right-16 -top-16 h-48 w-48 rounded-full border border-secondary/20"
        />
        <div
          aria-hidden="true"
          className="absolute -bottom-24 -left-16 h-56 w-56 rounded-full border border-primary/10"
        />
        <div className="relative">
          <div className="mx-auto mb-7 flex h-14 w-14 items-center justify-center rounded-2xl border border-primary/10 bg-primary/5 text-accent">
            <Building2 strokeWidth={1.3} className="h-7 w-7" />
          </div>
          <Badge variant="secondary" className="mb-6 uppercase tracking-[0.18em]">
            Coming soon
          </Badge>
          <h1
            id="page-heading"
            className="font-heading text-4xl font-medium leading-tight tracking-tight text-primary dark:text-secondary-light sm:text-5xl"
          >
            {title}
          </h1>
          <div aria-hidden="true" className="mx-auto my-6 h-0.5 w-12 bg-secondary" />
          <p className="mx-auto max-w-md text-sm leading-7 text-muted-foreground sm:text-base">
            {subtitle}
          </p>
          <p className="mt-9 text-[10px] font-medium uppercase tracking-[0.24em] text-muted-foreground">
            Thoughtful spaces. New beginnings.
          </p>
        </div>
      </section>
    </Container>
  );
}
