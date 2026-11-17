import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { AuthGuard } from '@nestjs/passport';
import { IS_PUBLIC_KEY } from '../decorators/public.decorator';
/** Global JWT guard; only explicitly public routes bypass authentication. */
@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') implements CanActivate {
  /** Injects route metadata access. */
  constructor(private readonly reflector: Reflector) {
    super();
  }
  /** Allows explicitly public routes and fails closed if no strategy is registered. */
  async canActivate(context: ExecutionContext): Promise<boolean> {
    if (
      this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
        context.getHandler(),
        context.getClass(),
      ])
    )
      return true;
    try {
      return Boolean(await super.canActivate(context));
    } catch {
      throw new UnauthorizedException('Authentication required');
    }
  }
}
