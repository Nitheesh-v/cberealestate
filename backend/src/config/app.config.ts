import { registerAs } from '@nestjs/config';
/** Environment-backed application settings. */
export default registerAs('app', () => ({
  port: Number(process.env.PORT ?? 5000),
  env: process.env.NODE_ENV ?? 'development',
  apiPrefix: process.env.API_PREFIX ?? 'api',
  frontendUrl: process.env.FRONTEND_URL,
}));
