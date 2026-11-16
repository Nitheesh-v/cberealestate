import { Logger } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import type { MongooseModuleAsyncOptions } from '@nestjs/mongoose';
import type { Connection } from 'mongoose';
const logger = new Logger('MongoDB');
/** MongoDB connection factory. Never logs a URI or credentials. */
export const databaseConfig: MongooseModuleAsyncOptions = {
  imports: [ConfigModule],
  inject: [ConfigService],
  useFactory: (config: ConfigService) => ({
    uri: config.getOrThrow<string>('MONGODB_URI'),
    autoIndex: true,
    maxPoolSize: 10,
    serverSelectionTimeoutMS: 5000,
    socketTimeoutMS: 45000,
    retryAttempts: 3,
    connectionFactory: (connection: Connection): Connection => {
      logger.log('MongoDB connected');
      connection.on('error', () => logger.error('MongoDB connection error'));
      connection.on('disconnected', () => logger.warn('MongoDB disconnected'));
      connection.on('reconnected', () => logger.log('MongoDB reconnected'));
      return connection;
    },
    connectionErrorFactory: () => {
      logger.error('MongoDB connection failed');
      return new Error('MongoDB connection failed; verify infrastructure configuration');
    },
  }),
};
