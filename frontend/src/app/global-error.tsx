'use client';
/* eslint-disable @next/next/no-html-link-for-pages -- A hard navigation recovers even when the root router/provider tree has failed. */
/** Last-resort boundary for errors thrown by the root layout/providers themselves. */
export default function GlobalError({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}): React.JSX.Element {
  return (
    <html lang="en">
      <body>
        <main
          style={{
            maxWidth: '40rem',
            margin: '15vh auto',
            padding: '2rem',
            fontFamily: 'sans-serif',
            textAlign: 'center',
          }}
        >
          <h1>Something went wrong</h1>
          <p>We couldn’t start the application. Please try again.</p>
          <button onClick={reset}>Try Again</button>
          <p>
            <a href="/">Go Home</a>
          </p>
        </main>
      </body>
    </html>
  );
}
