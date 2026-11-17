import type { UserRole } from '../../modules/users/schemas/user.schema';
export interface ActiveUserData {
  id: string;
  email: string;
  role: UserRole;
  tokenVersion: number;
}
export interface RefreshUserData extends ActiveUserData {
  refreshToken: string;
}
export interface PublicUser {
  id: string;
  firstName: string;
  lastName: string;
  fullName: string;
  email: string;
  phone?: string;
  avatar?: string;
  role: UserRole;
  isVerified: boolean;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}
