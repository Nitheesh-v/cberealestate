import Link from 'next/link';
import {
  Facebook,
  Instagram,
  Twitter,
  Linkedin,
  Youtube,
  MapPin,
  Phone,
  Mail,
  Clock,
  ArrowUpRight,
} from 'lucide-react';
import { Brand } from '@/components/shared/Brand';
import { Container } from '@/components/shared/Container';
import { CONTACT, FOOTER_LINKS, SOCIAL_LINKS } from '@/lib/constants';
const socialIcons = [Facebook, Instagram, Twitter, Linkedin, Youtube];
/** Four-column brand footer; unverified business details are never fabricated. */
export function Footer(): React.JSX.Element {
  return (
    <footer className="bg-primary-dark text-white">
      <Container>
        <div className="grid gap-10 py-14 sm:grid-cols-2 lg:grid-cols-[1.3fr_0.8fr_0.9fr_1.2fr] lg:gap-12">
          <div>
            <Brand inverse />
            <p className="mt-5 max-w-xs text-sm leading-7 text-white/65">
              Thoughtful spaces. Lasting relationships. Your next chapter begins with a place to
              call your own.
            </p>
            <div className="mt-6 flex gap-2">
              {SOCIAL_LINKS.map(({ label, url }, index) => {
                const Icon = socialIcons[index] ?? Facebook;
                return url ? (
                  <a
                    key={label}
                    href={url}
                    aria-label={label}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="rounded-full border border-white/15 p-2.5 transition-colors hover:bg-white/10"
                  >
                    <Icon className="h-3.5 w-3.5" />
                  </a>
                ) : (
                  <span
                    key={label}
                    title={`${label} — link coming soon`}
                    className="rounded-full border border-white/10 p-2.5 text-white/30"
                  >
                    <Icon aria-hidden="true" className="h-3.5 w-3.5" />
                    <span className="sr-only">{label} link coming soon</span>
                  </span>
                );
              })}
            </div>
          </div>
          <div>
            <h2 className="mb-5 text-sm font-semibold">Quick links</h2>
            <ul className="space-y-3">
              {FOOTER_LINKS.quick.map(({ label, href }) => (
                <li key={label}>
                  <Link
                    className="text-sm text-white/65 transition-colors hover:text-secondary-light"
                    href={href}
                  >
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <h2 className="mb-5 text-sm font-semibold">Property types</h2>
            <ul className="space-y-3">
              {FOOTER_LINKS.property.map((label) => (
                <li key={label}>
                  <Link
                    href="/properties"
                    className="inline-flex items-center gap-1 text-sm text-white/65 hover:text-secondary-light"
                  >
                    {label}
                    <ArrowUpRight className="h-3 w-3 opacity-50" />
                  </Link>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <h2 className="mb-5 text-sm font-semibold">Get in touch</h2>
            <ul className="space-y-5 text-sm text-white/65">
              <li className="flex gap-3">
                <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-secondary" />
                <span>{CONTACT.address || 'Office details coming soon'}</span>
              </li>
              <li className="flex gap-3">
                <Phone className="h-4 w-4 shrink-0 text-secondary" />
                {CONTACT.phone ? (
                  <a href={`tel:${CONTACT.phone.replace(/[^+0-9]/g, '')}`}>{CONTACT.phone}</a>
                ) : (
                  <span>Phone details coming soon</span>
                )}
              </li>
              <li className="flex gap-3">
                <Mail className="h-4 w-4 shrink-0 text-secondary" />
                {CONTACT.email && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(CONTACT.email) ? (
                  <a className="break-all" href={`mailto:${CONTACT.email}`}>
                    {CONTACT.email}
                  </a>
                ) : (
                  <Link href="/contact">Visit our contact page</Link>
                )}
              </li>
              <li className="flex gap-3">
                <Clock className="h-4 w-4 shrink-0 text-secondary" />
                <span>{CONTACT.hours || 'Working hours coming soon'}</span>
              </li>
            </ul>
          </div>
        </div>
        <div className="flex flex-col gap-4 border-t border-white/10 py-6 text-xs text-white/50 sm:flex-row sm:items-center sm:justify-between">
          <p>© 2024 SBR Real Estate. All rights reserved.</p>
          <div className="flex gap-6">
            <span title="Available in a future phase">Privacy Policy · Coming soon</span>
            <span title="Available in a future phase">Terms of Service · Coming soon</span>
          </div>
        </div>
      </Container>
    </footer>
  );
}
