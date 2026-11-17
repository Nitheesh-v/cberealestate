import type { UserRole } from '../../modules/users/schemas/user.schema';
export interface JwtPayload {
  sub: string;
  email: string;
  role: UserRole;
  version: number;
  type: 'access' | 'refresh';
  jti: string;
  remember: boolean;
}
