import { createParamDecorator, type ExecutionContext } from '@nestjs/common';
import type { Request } from 'express';
import type { RequestUser } from '../interfaces/api-response.interface';
/** Reads the authenticated principal, if populated by a future authentication strategy. */
export const CurrentUser = createParamDecorator(
  (_data: unknown, context: ExecutionContext): RequestUser | undefined =>
    context.switchToHttp().getRequest<Request & { user?: RequestUser }>().user,
);
