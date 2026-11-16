import { plainToInstance } from 'class-transformer';
import {
  IsEnum,
  IsInt,
  IsOptional,
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
  @Matches(/^[a-zA-Z0-9][a-zA-Z0-9/_-]*$/) API_PREFIX = 'api';
  @IsString() @Matches(/^mongodb(?:\+srv)?:\/\//) MONGODB_URI!: string;
  @IsString() @MinLength(1) REDIS_HOST!: string;
  @IsInt() @Min(1) @Max(65535) REDIS_PORT = 6379;
  @IsOptional() @IsString() REDIS_PASSWORD?: string;
  @IsString() FRONTEND_URL!: string;
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
  const numericKeys = ['PORT', 'REDIS_PORT', 'SMTP_PORT', 'THROTTLE_TTL', 'THROTTLE_LIMIT'];
  const normalized = { ...input };
  for (const key of numericKeys)
    if (normalized[key] !== undefined) normalized[key] = Number(normalized[key]);
  const config = plainToInstance(EnvironmentVariables, normalized);
  const errors = validateSync(config, { skipMissingProperties: false });
  if (errors.length)
    throw new Error(
      `Invalid environment settings: ${errors.map((error) => error.property).join(', ')}`,
    );
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
  if ([Environment.Production, Environment.Staging].includes(config.NODE_ENV)) {
    if (
      [config.JWT_SECRET, config.JWT_REFRESH_SECRET].some((secret) => secret.startsWith('your-')) ||
      config.JWT_SECRET === config.JWT_REFRESH_SECRET
    ) {
      throw new Error('Configure distinct non-placeholder JWT secrets for staging/production');
    }
    if (origins.some((origin) => !origin.startsWith('https:')))
      throw new Error('HTTPS CORS origins are required outside development');
  }
  return { ...normalized, ...config };
}
