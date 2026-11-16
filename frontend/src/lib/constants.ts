import { publicEnv } from './env';
import { FurnishedType, ListingType, PropertyType } from '@/types';
export const APP_NAME = publicEnv.appName;
export const APP_URL = publicEnv.appUrl;
export const API_URL = publicEnv.apiUrl;
export const PROPERTY_TYPES = Object.values(PropertyType);
export const LISTING_TYPES = Object.values(ListingType);
export const CITIES = [
  'Chennai',
  'Coimbatore',
  'Bengaluru',
  'Mumbai',
  'Delhi',
  'Hyderabad',
  'Pune',
  'Kolkata',
  'Ahmedabad',
  'Kochi',
] as const;
export const AMENITIES = [
  'Parking',
  'Lift',
  'Security',
  'Swimming pool',
  'Gym',
  'Garden',
  'Power backup',
  'Clubhouse',
] as const;
export const FURNISHED_TYPES = Object.values(FurnishedType);
export const FACING_DIRECTIONS = [
  'North',
  'South',
  'East',
  'West',
  'North-East',
  'North-West',
  'South-East',
  'South-West',
] as const;
export const NAV_LINKS = [
  { label: 'Home', href: '/' },
  { label: 'Properties', href: '/properties' },
  { label: 'About', href: '/about' },
  { label: 'Services', href: '/services' },
  { label: 'Blog', href: '/blog' },
  { label: 'Contact', href: '/contact' },
] as const;
export const FOOTER_LINKS = {
  quick: [...NAV_LINKS, { label: 'Careers', href: '/contact' }],
  property: ['Apartments', 'Villas', 'Houses', 'Plots', 'Commercial', 'Penthouses'],
};
/** Only verified, environment-provided external destinations become clickable links. */
function externalLink(value: string | undefined): string | undefined {
  if (!value) return undefined;
  try {
    const url = new URL(value);
    return url.protocol === 'https:' ? url.href : undefined;
  } catch {
    return undefined;
  }
}
export const SOCIAL_LINKS = [
  { label: 'Facebook', url: externalLink(process.env.NEXT_PUBLIC_FACEBOOK_URL) },
  { label: 'Instagram', url: externalLink(process.env.NEXT_PUBLIC_INSTAGRAM_URL) },
  { label: 'Twitter', url: externalLink(process.env.NEXT_PUBLIC_TWITTER_URL) },
  { label: 'LinkedIn', url: externalLink(process.env.NEXT_PUBLIC_LINKEDIN_URL) },
  { label: 'YouTube', url: externalLink(process.env.NEXT_PUBLIC_YOUTUBE_URL) },
];
export const CONTACT = {
  address: process.env.NEXT_PUBLIC_CONTACT_ADDRESS,
  phone: process.env.NEXT_PUBLIC_CONTACT_PHONE,
  email: process.env.NEXT_PUBLIC_CONTACT_EMAIL,
  hours: process.env.NEXT_PUBLIC_WORKING_HOURS,
};
