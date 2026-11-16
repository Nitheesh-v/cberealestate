import type { Metadata } from 'next';
import { APP_NAME, APP_URL } from '@/lib/constants';
interface SeoProps {
  title: string;
  description: string;
  image?: string;
  url?: string;
  type?: 'website' | 'article';
}
/** Generates App Router metadata; avoids legacy document-head components. */
export function SEO({
  title,
  description,
  image = '/images/hero-bg.jpg',
  url = '/',
  type = 'website',
}: SeoProps): Metadata {
  const canonical = new URL(url, APP_URL).href;
  return {
    title,
    description,
    alternates: { canonical },
    openGraph: {
      title: `${title} | ${APP_NAME}`,
      description,
      url: canonical,
      siteName: APP_NAME,
      type,
      locale: 'en_IN',
      images: [{ url: new URL(image, APP_URL).href, alt: APP_NAME }],
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: [new URL(image, APP_URL).href],
    },
  };
}
