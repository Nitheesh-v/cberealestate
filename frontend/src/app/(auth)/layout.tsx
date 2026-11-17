import Image from 'next/image';
import type { PropsWithChildren } from 'react';
import { Brand } from '@/components/shared/Brand';
/** Responsive split-screen authentication shell with optimized local brand imagery. */
export default function AuthLayout({ children }: PropsWithChildren): React.JSX.Element {
  return (
    <div className="grid min-h-screen bg-background lg:grid-cols-2">
      <aside className="relative hidden overflow-hidden bg-primary-dark lg:flex lg:flex-col lg:justify-between lg:p-12">
        <div className="relative z-10">
          <Brand inverse />
        </div>
        <div className="relative my-12 aspect-[4/3] overflow-hidden rounded-2xl">
          <Image
            src="/images/hero-bg.jpg"
            fill
            sizes="50vw"
            alt="Architectural illustration of a home"
            loading="lazy"
            className="object-cover"
          />
        </div>
        <div className="relative text-white">
          <p className="mb-4 text-xs uppercase tracking-[0.25em] text-secondary-light">
            Your next chapter
          </p>
          <h2 className="max-w-lg font-heading text-4xl leading-tight xl:text-5xl">
            A place to belong.
            <br />A future to build.
          </h2>
          <p className="mt-5 max-w-md text-sm leading-7 text-white/65">
            Thoughtful spaces and meaningful connections, for every step of your property journey.
          </p>
        </div>
      </aside>
      <div className="flex min-w-0 flex-col">
        <header className="px-6 pt-8 sm:px-12 lg:hidden">
          <Brand />
        </header>
        <div className="m-auto w-full max-w-xl px-6 py-12 sm:px-12 lg:py-16">{children}</div>
      </div>
    </div>
  );
}
