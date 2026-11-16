import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { RedisModule } from '@nestjs-modules/ioredis';
import { BullModule } from '@nestjs/bullmq';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import appConfig from './config/app.config';
import jwtConfig from './config/jwt.config';
import cloudinaryConfig from './config/cloudinary.config';
import mailConfig from './config/mail.config';
import { validateEnvironment } from './config/environment';
import { databaseConfig } from './config/database.config';
import { getRedisOptions, redisConfig } from './config/redis.config';
import { HealthModule } from './health/health.module';
import { AuthModule } from './modules/auth/auth.module';
import { UsersModule } from './modules/users/users.module';
import { PropertiesModule } from './modules/properties/properties.module';
import { InquiriesModule } from './modules/inquiries/inquiries.module';
import { UploadsModule } from './modules/uploads/uploads.module';
import { AnalyticsModule } from './modules/analytics/analytics.module';
import { EmailModule } from './modules/email/email.module';
import { ImageModule } from './modules/image-processing/image.module';
import { NotificationModule } from './modules/notification/notification.module';
import { AdminModule } from './modules/admin/admin.module';
/** Composition root for Phase 1 infrastructure and feature boundaries. */
@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
      load: [appConfig, jwtConfig, cloudinaryConfig, mailConfig],
      validate: validateEnvironment,
    }),
    MongooseModule.forRootAsync(databaseConfig),
    RedisModule.forRootAsync(redisConfig),
    BullModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        connection: { ...getRedisOptions(config), maxRetriesPerRequest: null },
      }),
    }),
    AuthModule,
    UsersModule,
    PropertiesModule,
    InquiriesModule,
    UploadsModule,
    AnalyticsModule,
    EmailModule,
    ImageModule,
    NotificationModule,
    AdminModule,
    HealthModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
