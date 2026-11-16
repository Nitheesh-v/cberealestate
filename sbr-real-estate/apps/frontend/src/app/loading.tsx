import Image from 'next/image';
import { LoadingSpinner } from '@/components/shared/LoadingSpinner';
import { SkeletonCard } from '@/components/shared/SkeletonCard';
import { Container } from '@/components/shared/Container';
/** Suspense fallback with brand, status, and responsive content skeletons. */
export default function Loading(): React.JSX.Element {
  return (
    <Container className="py-20">
      <div className="mb-12 flex flex-col items-center gap-5 text-primary dark:text-secondary-light">
        <Image
          src="/images/logo.svg"
          alt="SBR Real Estate"
          width={240}
          height={72}
          loading="lazy"
        />
        <LoadingSpinner size="lg" />
      </div>
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {[1, 2, 3].map((id) => (
          <SkeletonCard key={id} />
        ))}
      </div>
    </Container>
  );
}
