import { describe, expect, it } from 'vitest';
import { cn, formatDate, formatPrice, slugify, truncateText } from './utils';
describe('formatPrice', () => {
  it.each([
    [0, '₹0'],
    [999, '₹999'],
    [1000, '₹1K'],
    [100000, '₹1 Lakh'],
    [10000000, '₹1 Cr'],
    [12500000, '₹1.25 Cr'],
  ])('formats %s as %s', (price, expected) => {
    expect(formatPrice(Number(price))).toBe(expected);
  });
  it.each([-1, NaN, Infinity])('rejects invalid price %s', (price) => {
    expect(() => formatPrice(price)).toThrow(RangeError);
  });
});
describe('text helpers', () => {
  it('merges conflicting Tailwind classes', () => {
    expect(cn('px-2', false, 'px-4')).toBe('px-4');
  });
  it('normalizes and removes markup from slugs', () => {
    expect(slugify(' <b>Café</b> & Villas! ')).toBe('cafe-villas');
  });
  it('handles empty slugs', () => {
    expect(slugify('')).toBe('');
  });
  it('bounds Unicode output including ellipsis', () => {
    expect(truncateText('🏡 Lovely home', 3)).toBe('🏡 …');
  });
  it('handles zero and short input', () => {
    expect(truncateText('home', 0)).toBe('');
    expect(truncateText(' Hi ', 3)).toBe('Hi');
  });
  it('rejects invalid truncation bounds', () => {
    expect(() => truncateText('x', -1)).toThrow(RangeError);
  });
});
describe('formatDate', () => {
  it('uses UTC deterministically', () => {
    expect(formatDate('2026-01-01T23:30:00-05:00', 'ISO')).toBe('2026-01-02');
  });
  it('supports short and long presets', () => {
    expect(formatDate('2026-01-02', 'short')).toContain('Jan');
    expect(formatDate('2026-01-02')).toContain('January');
  });
  it('rejects invalid dates', () => {
    expect(() => formatDate('invalid')).toThrow(RangeError);
  });
});
