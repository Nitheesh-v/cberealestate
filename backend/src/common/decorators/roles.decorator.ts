import { SetMetadata } from '@nestjs/common';
export const ROLES_KEY = 'roles';
/** Declares allowed roles for the roles guard. */
export const Roles = (...roles: string[]) => SetMetadata(ROLES_KEY, roles);
