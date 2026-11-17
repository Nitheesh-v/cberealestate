import { createParamDecorator, type ExecutionContext } from '@nestjs/common';
import type { Request } from 'express';
import type { ActiveUserData } from '../interfaces/active-user-data.interface';
/** Reads the principal attached by the relevant authentication strategy. */
export const CurrentUser = createParamDecorator(
  (_data: unknown, context: ExecutionContext): ActiveUserData | undefined =>
    context.switchToHttp().getRequest<Request & { user?: ActiveUserData }>().user,
);
