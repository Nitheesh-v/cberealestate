import { CanActivate, ExecutionContext, ForbiddenException, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import type { Request } from 'express';
import type { ActiveUserData } from '../interfaces/active-user-data.interface';
import { ROLES_KEY } from '../decorators/roles.decorator';
/** Enforces route roles after authentication has populated a user. */
@Injectable()
export class RolesGuard implements CanActivate {
  /** Injects the metadata reader. */
  constructor(private readonly reflector: Reflector) {}
  /** Denies access if a required role is not present. */
  canActivate(context: ExecutionContext): boolean {
    const roles = this.reflector.getAllAndOverride<string[]>(ROLES_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
    if (!roles?.length) return true;
    const user = context.switchToHttp().getRequest<Request & { user?: ActiveUserData }>().user;
    if (!user || !roles.includes(user.role))
      throw new ForbiddenException('Insufficient permissions');
    return true;
  }
}
