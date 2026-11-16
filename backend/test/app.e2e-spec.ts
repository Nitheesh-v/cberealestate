import 'reflect-metadata';
import { Controller, Get, INestApplication, Query } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { ConfigService } from '@nestjs/config';
import { getConnectionToken } from '@nestjs/mongoose';
import { getRedisConnectionToken } from '@nestjs-modules/ioredis';
import request from 'supertest';
import { Error as MongooseError } from 'mongoose';
import { AppController } from '../src/app.controller';
import { AppService } from '../src/app.service';
import { HealthController } from '../src/health/health.controller';
import { PaginationDto } from '../src/common/dto/pagination.dto';
import { setupApp } from '../src/setup-app';
/** Test-only controller exercises the real global HTTP pipeline. */
@Controller('test')
class PipelineController {
  /** Validates pagination through the global pipe. */
  @Get('pagination') paginate(@Query() query: PaginationDto): PaginationDto {
    return query;
  }
  /** Exercises null success payloads. */
  @Get('empty') empty(): null {
    return null;
  }
  /** Exercises unexpected failures without exposing secrets. */
  @Get('failure') failure(): never {
    throw new Error('private implementation details');
  }
  /** Exercises MongoDB duplicate key translation. */
  @Get('duplicate') duplicate(): never {
    throw { code: 11000, keyValue: { email: 'private' } };
  }
  /** Exercises MongoDB field validation translation. */
  @Get('invalid') invalid(): never {
    throw new MongooseError.ValidationError();
  }
}
describe('Application HTTP pipeline (infrastructure mocked)', () => {
  let app: INestApplication;
  const databasePing = jest.fn<Promise<{ ok: number }>, []>();
  const redisPing = jest.fn<Promise<string>, []>();
  const connection = { readyState: 1, db: { admin: () => ({ ping: databasePing }) } };
  const redis = { status: 'ready', ping: redisPing };
  beforeAll(async () => {
    const module = await Test.createTestingModule({
      controllers: [AppController, HealthController, PipelineController],
      providers: [
        AppService,
        {
          provide: ConfigService,
          useValue: new ConfigService({
            NODE_ENV: 'test',
            API_PREFIX: 'api',
            FRONTEND_URL: 'https://frontend.example.test',
          }),
        },
        { provide: getConnectionToken(), useValue: connection },
        { provide: getRedisConnectionToken(), useValue: redis },
      ],
    }).compile();
    app = module.createNestApplication();
    setupApp(app);
    await app.init();
  });
  beforeEach(() => {
    connection.readyState = 1;
    redis.status = 'ready';
    databasePing.mockResolvedValue({ ok: 1 });
    redisPing.mockResolvedValue('PONG');
  });
  afterAll(async () => {
    await app.close();
  });
  it('returns liveness in the standard success envelope', async () => {
    const response = await request(app.getHttpServer()).get('/api/health').expect(200);
    expect(response.body).toMatchObject({
      success: true,
      data: { status: 'ok', environment: 'test' },
      meta: { timestamp: expect.any(String) },
    });
    expect(response.headers['x-content-type-options']).toBe('nosniff');
  });
  it('returns API identity', async () => {
    const response = await request(app.getHttpServer()).get('/api').expect(200);
    expect(response.body.data.name).toBe('SBR Real Estate API');
  });
  it('pings actual injected dependency interfaces', async () => {
    await request(app.getHttpServer()).get('/api/health/db').expect(200);
    await request(app.getHttpServer()).get('/api/health/redis').expect(200);
    expect(databasePing).toHaveBeenCalled();
    expect(redisPing).toHaveBeenCalled();
  });
  it('returns 503 for disconnected dependencies', async () => {
    connection.readyState = 0;
    redis.status = 'end';
    await request(app.getHttpServer()).get('/api/health/db').expect(503);
    await request(app.getHttpServer()).get('/api/health/redis').expect(503);
  });
  it('returns 503 when dependency pings fail', async () => {
    databasePing.mockRejectedValue(new Error('secret connection string'));
    redisPing.mockRejectedValue(new Error('secret password'));
    const db = await request(app.getHttpServer()).get('/api/health/db').expect(503);
    const cache = await request(app.getHttpServer()).get('/api/health/redis').expect(503);
    expect(db.body.message).toBe('MongoDB unavailable');
    expect(cache.body.message).toBe('Redis unavailable');
  });
  it('returns custom validation errors and rejects operator injection', async () => {
    const response = await request(app.getHttpServer())
      .get('/api/test/pagination?sort=%24where&limit=101')
      .expect(400);
    expect(response.body.success).toBe(false);
    expect(Array.isArray(response.body.message)).toBe(true);
  });
  it('rejects extra query fields', async () => {
    await request(app.getHttpServer()).get('/api/test/pagination?unknown=value').expect(400);
  });
  it('transforms valid query values', async () => {
    const response = await request(app.getHttpServer())
      .get('/api/test/pagination?page=2')
      .expect(200);
    expect(response.body.data).toMatchObject({ page: 2, limit: 10 });
  });
  it('handles null data', async () => {
    const response = await request(app.getHttpServer()).get('/api/test/empty').expect(200);
    expect(response.body.data).toBeNull();
  });
  it('hides unexpected error details', async () => {
    const response = await request(app.getHttpServer()).get('/api/test/failure').expect(500);
    expect(JSON.stringify(response.body)).not.toContain('private implementation');
    expect(response.body).toMatchObject({
      success: false,
      statusCode: 500,
      path: '/api/test/failure',
    });
  });
  it('maps database errors to proper statuses', async () => {
    await request(app.getHttpServer()).get('/api/test/duplicate').expect(409);
    await request(app.getHttpServer()).get('/api/test/invalid').expect(400);
  });
  it('returns formatted 404 responses', async () => {
    const response = await request(app.getHttpServer()).get('/api/missing').expect(404);
    expect(response.body.success).toBe(false);
  });
  it('allows exact CORS origins', async () => {
    const response = await request(app.getHttpServer())
      .get('/api/health')
      .set('Origin', 'https://frontend.example.test')
      .expect(200);
    expect(response.headers['access-control-allow-origin']).toBe('https://frontend.example.test');
  });
  it('rejects unlisted CORS origins', async () => {
    const response = await request(app.getHttpServer())
      .get('/api/health')
      .set('Origin', 'https://attacker.example.test')
      .expect(403);
    expect(response.headers['access-control-allow-origin']).toBeUndefined();
    expect(response.body.success).toBe(false);
  });
});
