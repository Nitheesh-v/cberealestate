import { Controller, Get, ServiceUnavailableException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectConnection } from '@nestjs/mongoose';
import { InjectRedis } from '@nestjs-modules/ioredis';
import {
  ApiOkResponse,
  ApiOperation,
  ApiServiceUnavailableResponse,
  ApiTags,
} from '@nestjs/swagger';
import { Connection } from 'mongoose';
import Redis from 'ioredis';
import { Public } from '../common/decorators/public.decorator';
/** Unauthenticated liveness and dependency readiness probes. */
@ApiTags('Health')
@Public()
@Controller('health')
export class HealthController {
  /** Injects the actual infrastructure connections, never simulated clients. */
  constructor(
    private readonly config: ConfigService,
    @InjectConnection() private readonly connection: Connection,
    @InjectRedis() private readonly redis: Redis,
  ) {}
  /** Reports process liveness; dependency readiness is checked separately. */
  @Get()
  @ApiOperation({ summary: 'Process liveness' })
  @ApiOkResponse({ description: 'Process is alive' })
  getHealth(): { status: string; timestamp: string; uptime: number; environment: string } {
    return {
      status: 'ok',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      environment: this.config.getOrThrow<string>('NODE_ENV'),
    };
  }
  /** Pings MongoDB and returns 503 when unavailable. */
  @Get('db')
  @ApiOperation({ summary: 'MongoDB readiness' })
  @ApiServiceUnavailableResponse({ description: 'MongoDB unavailable' })
  async getDatabaseHealth(): Promise<{ status: string }> {
    try {
      if (this.connection.readyState !== 1 || !this.connection.db) throw new Error('Disconnected');
      await this.connection.db.admin().ping({ timeoutMS: 3000 });
      return { status: 'ok' };
    } catch {
      throw new ServiceUnavailableException('MongoDB unavailable');
    }
  }
  /** Pings Redis with a bounded deadline and returns 503 when unavailable. */
  @Get('redis')
  @ApiOperation({ summary: 'Redis readiness' })
  @ApiServiceUnavailableResponse({ description: 'Redis unavailable' })
  async getRedisHealth(): Promise<{ status: string }> {
    if (this.redis.status !== 'ready') throw new ServiceUnavailableException('Redis unavailable');
    try {
      const result = await this.redis.ping();
      if (result !== 'PONG') throw new Error('Unexpected ping response');
      return { status: 'ok' };
    } catch {
      throw new ServiceUnavailableException('Redis unavailable');
    }
  }
}
