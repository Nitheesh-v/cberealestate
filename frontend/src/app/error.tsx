'use client';
import Link from 'next/link';
import { TriangleAlert } from 'lucide-react';
import { Container } from '@/components/shared/Container';
import { Button } from '@/components/ui/button';
/** Route error boundary; internal error details are never exposed to visitors. */
export default function ErrorPage({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}): React.JSX.Element {
  return (
    <Container className="flex min-h-[65vh] flex-col items-center justify-center gap-6 py-20 text-center">
      <TriangleAlert className="h-12 w-12 text-secondary-dark" aria-hidden="true" />
      <h1 className="font-heading text-4xl">Something went wrong</h1>
      <p className="max-w-md text-muted-foreground">
        We couldn’t load this page. Please try again in a moment.
      </p>
      <div className="flex flex-wrap justify-center gap-3">
        <Button onClick={reset}>Try Again</Button>
        <Button variant="outline" asChild>
          <Link href="/">Go Home</Link>
        </Button>
      </div>
    </Container>
  );
}
