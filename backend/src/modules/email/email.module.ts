import { Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bullmq';
import { EmailProducer } from './email.producer';
import { EmailConsumer } from './email.consumer';
/** Shared transactional email producer and Redis-backed worker. */
@Module({
  imports: [BullModule.registerQueue({ name: 'email' })],
  providers: [EmailProducer, EmailConsumer],
  exports: [EmailProducer],
})
export class EmailModule {}
