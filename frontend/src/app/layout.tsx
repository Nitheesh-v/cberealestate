import type { Metadata } from 'next';
import { Inter, Playfair_Display } from 'next/font/google';
import { QueryProvider } from '@/providers/QueryProvider';
import { ThemeProvider } from '@/providers/ThemeProvider';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import { ScrollToTop } from '@/components/layout/ScrollToTop';
import { SiteShell } from '@/components/layout/SiteShell';
import { Toaster } from '@/components/ui/toaster';
import { APP_NAME, APP_URL } from '@/lib/constants';
import './globals.css';
const inter = Inter({ subsets: ['latin'], variable: '--font-inter', display: 'swap' });
const playfair = Playfair_Display({
  subsets: ['latin'],
  variable: '--font-playfair',
  display: 'swap',
});
export const metadata: Metadata = {
  metadataBase: new URL(APP_URL),
  title: { default: APP_NAME, template: `%s | ${APP_NAME}` },
  description:
    'Discover your next chapter with SBR Real Estate. Homes, spaces, and opportunities across India.',
  keywords: ['SBR Real Estate', 'real estate India', 'apartments', 'villas', 'properties'],
  openGraph: {
    type: 'website',
    locale: 'en_IN',
    siteName: APP_NAME,
    title: APP_NAME,
    description: 'Thoughtful spaces. New beginnings.',
    images: [{ url: '/images/hero-bg.jpg', alt: APP_NAME }],
  },
  twitter: {
    card: 'summary_large_image',
    title: APP_NAME,
    description: 'Thoughtful spaces. New beginnings.',
  },
};
/** Shared application providers, metadata, fonts, and responsive route chrome. */
export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>): React.JSX.Element {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${inter.variable} ${playfair.variable} bg-background font-body`}>
        <a
          href="#main-content"
          className="sr-only z-[100] rounded-lg bg-primary p-3 text-white focus:not-sr-only focus:fixed focus:left-4 focus:top-4"
        >
          Skip to content
        </a>
        <QueryProvider>
          <ThemeProvider>
            <SiteShell header={<Navbar />} footer={<Footer />}>
              {children}
            </SiteShell>
            <ScrollToTop />
            <Toaster />
          </ThemeProvider>
        </QueryProvider>
      </body>
    </html>
  );
}
