import { createHash, timingSafeEqual } from 'node:crypto';
import sanitizeHtml from 'sanitize-html';
/** Strips markup from stored plain-text fields without allowing executable HTML. */
export function plainText(value: string): string {
  return sanitizeHtml(value, { allowedTags: [], allowedAttributes: {} }).normalize('NFC').trim();
}
/** Hashes high-entropy tokens without bcrypt's 72-byte truncation. */
export function tokenDigest(value: string): string {
  return createHash('sha256').update(value).digest('hex');
}
/** Constant-time digest comparison, rejecting malformed stored digests. */
export function equalDigest(left: string, right: string): boolean {
  return (
    /^[a-f0-9]{64}$/.test(left) &&
    /^[a-f0-9]{64}$/.test(right) &&
    timingSafeEqual(Buffer.from(left, 'hex'), Buffer.from(right, 'hex'))
  );
}
export const NAME_PATTERN = /^[\p{L}\p{M}][\p{L}\p{M} .'-]*$/u;
export const PHONE_PATTERN = /^\+?[1-9]\d{7,14}$/;
export const PASSWORD_PATTERN = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9\s])[^\s]+$/;
export const CLOUDINARY_PATTERN = /^https:\/\/res\.cloudinary\.com\/[^\s<>]+$/;
