import Link from 'next/link';
import { House, ArrowLeft } from 'lucide-react';
import { Container } from '@/components/shared/Container';
import { Button } from '@/components/ui/button';
export const metadata = {
  title: 'Page Not Found',
  description: 'This address could not be found on SBR Real Estate.',
  robots: { index: false, follow: false },
};
/** Accessible branded fallback for unrecognized routes. */
export default function NotFound(): React.JSX.Element {
  return (
    <Container className="flex min-h-[70vh] flex-col items-center justify-center py-20 text-center">
      <div
        aria-hidden="true"
        className="relative mb-8 flex h-40 w-64 items-center justify-center rounded-[50%] bg-primary/5"
      >
        <span className="absolute font-heading text-9xl text-primary/10">404</span>
        <House className="relative h-16 w-16 text-accent" strokeWidth={1} />
      </div>
      <p className="mb-3 text-xs font-semibold uppercase tracking-[0.2em] text-secondary-dark">
        A little off the map
      </p>
      <h1 className="font-heading text-4xl text-primary dark:text-secondary-light sm:text-5xl">
        Page Not Found
      </h1>
      <p className="mb-8 mt-5 max-w-md leading-7 text-muted-foreground">
        This address doesn’t seem to exist. Let’s find your way back to familiar ground.
      </p>
      <Button asChild>
        <Link href="/">
          <ArrowLeft className="h-4 w-4" />
          Go Home
        </Link>
      </Button>
    </Container>
  );
}
