import { ForbiddenException, type INestApplication, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import helmet from 'helmet';
import cookieParser from 'cookie-parser';
import compression from 'compression';
import morgan from 'morgan';
import { HttpExceptionFilter } from './common/filters/http-exception.filter';
import { AppValidationPipe } from './common/pipes/validation.pipe';
import { TransformInterceptor } from './common/interceptors/transform.interceptor';
import { LoggingInterceptor } from './common/interceptors/logging.interceptor';
/** Applies the same HTTP stack in production and in integration tests. */
export function setupApp(app: INestApplication): void {
  const config = app.get(ConfigService);
  const logger = new Logger('HTTP');
  const allowedOrigins = config
    .getOrThrow<string>('FRONTEND_URL')
    .split(',')
    .map((origin) => origin.trim());
  app.setGlobalPrefix(config.get<string>('API_PREFIX') ?? 'api');
  const server: import('express').Express = app.getHttpAdapter().getInstance();
  server.set('trust proxy', Number(config.get<number>('TRUST_PROXY_HOPS') ?? 0));
  app.use(helmet());
  app.use(cookieParser());
  app.use(compression());
  morgan.token('safe-path', (request) => request.url?.split('?')[0] ?? '-');
  app.use(
    morgan(':method :safe-path :status :response-time ms', {
      stream: { write: (message: string) => logger.log(message.trim()) },
    }),
  );
  app.enableCors({
    origin: allowedOrigins,
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  });
  // Reject browser origins outside the explicit allowlist; non-browser probes have no Origin.
  app.use(
    (
      request: import('express').Request,
      _response: import('express').Response,
      next: import('express').NextFunction,
    ) => {
      const cookieBag: unknown = request.cookies;
      const hasAuthCookie =
        typeof cookieBag === 'object' &&
        cookieBag !== null &&
        ('refreshToken' in cookieBag || 'accessToken' in cookieBag);
      if (
        !['GET', 'HEAD', 'OPTIONS'].includes(request.method) &&
        hasAuthCookie &&
        !request.headers.origin
      )
        throw new ForbiddenException('Origin header required for cookie-authenticated requests');
      if (request.headers.origin && !allowedOrigins.includes(request.headers.origin))
        throw new ForbiddenException('Origin not allowed');
      next();
    },
  );

  app.useGlobalPipes(new AppValidationPipe());
  app.useGlobalFilters(new HttpExceptionFilter());
  app.useGlobalInterceptors(new LoggingInterceptor(), new TransformInterceptor());
  app.enableShutdownHooks();
}
