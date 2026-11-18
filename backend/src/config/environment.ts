import { plainToInstance } from 'class-transformer';
import {
  IsEnum,
  IsIn,
  IsUrl,
  IsInt,
  IsOptional,
  ValidateIf,
  IsString,
  Matches,
  Max,
  Min,
  MinLength,
  validateSync,
} from 'class-validator';

enum Environment {
  Development = 'development',
  Staging = 'staging',
  Production = 'production',
  Test = 'test',
}
/** Validates infrastructure settings before any connections are attempted. */
class EnvironmentVariables {
  @IsEnum(Environment) NODE_ENV: Environment = Environment.Development;
  @IsInt() @Min(1) @Max(65535) PORT = 5000;
  @IsInt() @Min(0) @Max(5) TRUST_PROXY_HOPS = 0;
  @Matches(/^[a-zA-Z0-9][a-zA-Z0-9/_-]*$/) API_PREFIX = 'api';
  @IsString() @Matches(/^mongodb(?:\+srv)?:\/\//) MONGODB_URI!: string;
  @IsString() @MinLength(1) REDIS_HOST!: string;
  @IsInt() @Min(1) @Max(65535) REDIS_PORT = 6379;
  @IsOptional() @IsString() REDIS_PASSWORD?: string;
  @IsString() FRONTEND_URL!: string;
  @IsUrl({ require_tld: false, protocols: ['http', 'https'], require_protocol: true })
  APP_URL!: string;
  @IsString() @MinLength(1) JWT_ISSUER = 'sbr-real-estate';
  @IsString() @MinLength(1) JWT_AUDIENCE = 'sbr-web';
  @IsIn(['lax', 'strict', 'none']) AUTH_COOKIE_SAME_SITE = 'lax';
  @IsString() @MinLength(1) SMTP_HOST!: string;
  @IsIn(['true', 'false']) SMTP_AUTH_ENABLED = 'true';
  @ValidateIf((config: EnvironmentVariables) => config.SMTP_AUTH_ENABLED !== 'false')
  @IsString()
  @MinLength(1)
  SMTP_USER?: string;
  @ValidateIf((config: EnvironmentVariables) => config.SMTP_AUTH_ENABLED !== 'false')
  @IsString()
  @MinLength(1)
  SMTP_PASSWORD?: string;
  @IsString() @MinLength(1) SMTP_FROM!: string;
  @IsString() @MinLength(32) JWT_SECRET!: string;
  @IsString() @MinLength(32) JWT_REFRESH_SECRET!: string;
  @IsOptional() @Matches(/^\d+[smhd]$/) JWT_EXPIRES_IN?: string;
  @IsOptional() @Matches(/^\d+[smhd]$/) JWT_REFRESH_EXPIRES_IN?: string;
  @IsOptional() @IsInt() @Min(1) @Max(65535) SMTP_PORT?: number;
  @IsOptional() @IsInt() @Min(1) THROTTLE_TTL?: number;
  @IsOptional() @IsInt() @Min(1) THROTTLE_LIMIT?: number;
}
/** Rejects invalid settings without logging credentials or their values. */
export function validateEnvironment(input: Record<string, unknown>): Record<string, unknown> {
  const numericKeys = [
    'PORT',
    'REDIS_PORT',
    'SMTP_PORT',
    'THROTTLE_TTL',
    'THROTTLE_LIMIT',
    'TRUST_PROXY_HOPS',
  ];
  const normalized = { ...input };
  for (const key of numericKeys)
    if (normalized[key] !== undefined) normalized[key] = Number(normalized[key]);
  const config = plainToInstance(EnvironmentVariables, normalized);
  const errors = validateSync(config, { skipMissingProperties: false });
  if (errors.length)
    throw new Error(
      `Invalid environment settings: ${errors.map((error) => error.property).join(', ')}`,
    );
  if (
    config.SMTP_AUTH_ENABLED === 'false' &&
    (!['development', 'test'].includes(config.NODE_ENV) ||
      !['127.0.0.1', 'localhost', '::1'].includes(config.SMTP_HOST))
  )
    throw new Error('Unauthenticated SMTP is allowed only on loopback in development/test');
  const origins = config.FRONTEND_URL.split(',').map((origin) => origin.trim());
  if (
    origins.length === 0 ||
    origins.some((origin) => {
      try {
        const url = new URL(origin);
        return !['http:', 'https:'].includes(url.protocol) || url.origin !== origin;
      } catch {
        return true;
      }
    })
  )
    throw new Error('FRONTEND_URL must contain exact HTTP(S) origins, without trailing slashes');
  if (!origins.includes(config.APP_URL))
    throw new Error('APP_URL must equal one of the allowed frontend origins');
  if ([Environment.Production, Environment.Staging].includes(config.NODE_ENV)) {
    if (
      [config.JWT_SECRET, config.JWT_REFRESH_SECRET].some((secret) => secret.startsWith('your-')) ||
      config.JWT_SECRET === config.JWT_REFRESH_SECRET
    ) {
      throw new Error('Configure distinct non-placeholder JWT secrets for staging/production');
    }
    if (
      origins.some((origin) => !origin.startsWith('https:')) ||
      !config.APP_URL.startsWith('https:')
    )
      throw new Error('HTTPS CORS origins are required outside development');
  }
  if (
    config.AUTH_COOKIE_SAME_SITE === 'none' &&
    ![Environment.Production, Environment.Staging].includes(config.NODE_ENV)
  )
    throw new Error('SameSite=None requires a secure staging/production cookie');
  for (const key of ['JWT_EXPIRES_IN', 'JWT_REFRESH_EXPIRES_IN']) {
    const value = normalized[key];
    if (typeof value === 'string') {
      const match = /^([1-9]\d*)([smhd])$/.exec(value);
      const units: Record<string, number> = { s: 1, m: 60, h: 3600, d: 86400 };
      const seconds = Number(match?.[1]) * (units[match?.[2] ?? ''] ?? 0);
      if (!Number.isSafeInteger(seconds) || seconds < 1 || seconds > 31 * 86400)
        throw new Error(`Invalid ${key}`);
    }
  }
  return { ...normalized, ...config };
}
