import 'reflect-metadata';
import { Logger } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { ConfigService } from '@nestjs/config';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { AppModule } from './app.module';
import { setupApp } from './setup-app';
/** Boots the API only after configuration and infrastructure have initialized. */
async function bootstrap(): Promise<void> {
  const app = await NestFactory.create(AppModule, { bufferLogs: true });
  try {
    setupApp(app);
    const config = app.get(ConfigService);
    const environment = config.getOrThrow<string>('NODE_ENV');
    const prefix = config.get<string>('API_PREFIX') ?? 'api';
    if (environment === 'development') {
      const document = SwaggerModule.createDocument(
        app,
        new DocumentBuilder()
          .setTitle('SBR Real Estate API')
          .setDescription('Phase 1 foundation endpoints')
          .setVersion('1.0')
          .addBearerAuth()
          .build(),
      );
      SwaggerModule.setup(`${prefix}/docs`, app, document);
    }
    const port = Number(config.get<number>('PORT') ?? 5000);
    await app.listen(port, '0.0.0.0');
    new Logger('Bootstrap').log(
      `API listening on port ${port} (${environment}); prefix /${prefix}`,
    );
  } catch (error: unknown) {
    await app.close();
    throw error;
  }
}
void bootstrap().catch(() => {
  new Logger('Bootstrap').error(
    'Application startup failed; check configuration and infrastructure logs',
  );
  process.exitCode = 1;
});
