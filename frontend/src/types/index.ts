export { UserRole } from './user.types';
export type { User } from './user.types';
export enum PropertyType {
  Apartment = 'apartment',
  Villa = 'villa',
  House = 'house',
  Plot = 'plot',
  Commercial = 'commercial',
  Penthouse = 'penthouse',
  Studio = 'studio',
  Duplex = 'duplex',
}
export enum ListingType {
  Sale = 'sale',
  Rent = 'rent',
  Lease = 'lease',
}
export enum PropertyStatus {
  Draft = 'draft',
  Available = 'available',
  Sold = 'sold',
  Rented = 'rented',
}
export enum FurnishedType {
  Furnished = 'fully-furnished',
  SemiFurnished = 'semi-furnished',
  Unfurnished = 'unfurnished',
}
export interface Property {
  id: string;
  title: string;
  slug: string;
  price: number;
  city: string;
  type: PropertyType;
  listingType: ListingType;
  status: PropertyStatus;
  furnishedType: FurnishedType;
  images: string[];
  createdAt: string;
}
export interface Inquiry {
  id: string;
  propertyId: string;
  name: string;
  email: string;
  message: string;
  createdAt: string;
}
export interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasNext: boolean;
  hasPrev: boolean;
}
export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
  meta: { timestamp: string; pagination?: PaginationMeta };
}
export interface PaginatedResponse<T> extends ApiResponse<T[]> {
  meta: { timestamp: string; pagination: PaginationMeta };
}
export interface ApiError {
  success: false;
  message: string | string[];
  statusCode: number;
  timestamp: string;
  path: string;
}
