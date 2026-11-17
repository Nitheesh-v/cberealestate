import {
  CanActivate,
  ExecutionContext,
  Injectable,
  SetMetadata,
  HttpException,
  HttpStatus,
  ServiceUnavailableException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { InjectRedis } from '@nestjs-modules/ioredis';
import Redis from 'ioredis';
import type { Request, Response } from 'express';
import { tokenDigest } from '../security';
/** Per-route distributed limits, shared by every API replica. */
export const RateLimit = (limit: number, seconds: number) =>
  SetMetadata('authRateLimit', { limit, seconds });
/** Atomic Redis counter; fails closed if the limiter infrastructure is unavailable. */
@Injectable()
export class AuthRateLimitGuard implements CanActivate {
  /** Injects shared Redis and route metadata. */
  constructor(
    @InjectRedis() private readonly redis: Redis,
    private readonly reflector: Reflector,
  ) {}
  /** Counts requests without persisting raw IP addresses in Redis keys. */
  async canActivate(context: ExecutionContext): Promise<boolean> {
    const options = this.reflector.getAllAndOverride<{ limit: number; seconds: number }>(
      'authRateLimit',
      [context.getHandler(), context.getClass()],
    );
    if (!options) return true;
    const req = context.switchToHttp().getRequest<Request>();
    const key = `rate:${tokenDigest(`${context.getHandler().name}:${req.ip ?? 'unknown'}`)}`;
    let result: unknown;
    try {
      result = await this.redis.eval(
        "local count=redis.call('INCR',KEYS[1]); if count==1 then redis.call('EXPIRE',KEYS[1],ARGV[1]) end; return {count,redis.call('TTL',KEYS[1])}",
        1,
        key,
        options.seconds,
      );
    } catch {
      throw new ServiceUnavailableException('Authentication temporarily unavailable');
    }
    if (!Array.isArray(result) || typeof result[0] !== 'number' || typeof result[1] !== 'number')
      throw new HttpException(
        'Authentication temporarily unavailable',
        HttpStatus.SERVICE_UNAVAILABLE,
      );
    if (result[0] > options.limit) {
      context
        .switchToHttp()
        .getResponse<Response>()
        .setHeader('Retry-After', Math.max(1, result[1]));
      throw new HttpException(
        'Too many attempts. Please try again later.',
        HttpStatus.TOO_MANY_REQUESTS,
      );
    }
    return true;
  }
}
