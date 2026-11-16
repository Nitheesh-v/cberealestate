import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
/** Combines conditional utility classes with predictable Tailwind precedence. */
export function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs));
}
/** Formats finite non-negative property prices in Indian compact currency. */
export function formatPrice(price: number): string {
  if (!Number.isFinite(price) || price < 0)
    throw new RangeError('Price must be a finite non-negative number');
  const number = new Intl.NumberFormat('en-IN', { maximumFractionDigits: 2 });
  if (price >= 10_000_000) return `₹${number.format(price / 10_000_000)} Cr`;
  if (price >= 100_000) return `₹${number.format(price / 100_000)} Lakh`;
  if (price >= 1000) return `₹${number.format(price / 1000)}K`;
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(price);
}
/** Truncates Unicode code points, including the ellipsis in the maximum length. */
export function truncateText(text: string, maxLength: number): string {
  if (!Number.isInteger(maxLength) || maxLength < 0)
    throw new RangeError('maxLength must be a non-negative integer');
  const characters = Array.from(text.trim());
  if (characters.length <= maxLength) return characters.join('');
  return maxLength === 0 ? '' : `${characters.slice(0, maxLength - 1).join('')}…`;
}
/** Creates a route-safe slug, removing markup and punctuation rather than rendering HTML. */
export function slugify(text: string): string {
  return text
    .replace(/<[^>]*>/g, '')
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}
/** Formats dates deterministically in UTC. Supported presets: short, long, ISO. */
export function formatDate(date: string | Date, format: 'short' | 'long' | 'ISO' = 'long'): string {
  const parsed = new Date(date);
  if (Number.isNaN(parsed.getTime())) throw new RangeError('Invalid date');
  if (format === 'ISO') return parsed.toISOString().slice(0, 10);
  return new Intl.DateTimeFormat('en-IN', {
    day: 'numeric',
    month: format === 'short' ? 'short' : 'long',
    year: 'numeric',
    timeZone: 'UTC',
  }).format(parsed);
}
