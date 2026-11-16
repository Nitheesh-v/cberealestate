import { Logger } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import type { RedisModuleAsyncOptions } from '@nestjs-modules/ioredis';
import type { RedisOptions } from 'ioredis';
/** Shared environment-backed Redis connection options. */
export function getRedisOptions(config: ConfigService): RedisOptions {
  return {
    host: config.getOrThrow<string>('REDIS_HOST'),
    port: Number(config.getOrThrow<number>('REDIS_PORT')),
    password: config.get<string>('REDIS_PASSWORD') || undefined,
    connectTimeout: 5000,
    commandTimeout: 3000,
    maxRetriesPerRequest: 2,
    retryStrategy: (attempt: number) => Math.min(attempt * 500, 5000),
  };
}
/** Redis module configuration; BullMQ uses the same connection settings. */
export const redisConfig: RedisModuleAsyncOptions = {
  imports: [ConfigModule],
  inject: [ConfigService],
  useFactory: (config: ConfigService) => ({
    type: 'single',
    options: getRedisOptions(config),
    onClientReady: (client) => {
      const logger = new Logger('Redis');
      client.on('ready', () => logger.log('Redis connected'));
      client.on('error', () => logger.error('Redis connection error'));
    },
  }),
};
