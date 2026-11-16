import { Module } from '@nestjs/common';
import { HealthController } from './health.controller';
/** Exposes infrastructure probes. */
@Module({ controllers: [HealthController] })
export class HealthModule {}
