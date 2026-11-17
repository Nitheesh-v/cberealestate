import { Injectable } from '@nestjs/common';
import { InjectQueue } from '@nestjs/bullmq';
import { Queue } from 'bullmq';
export type EmailJob = { email: string } & (
  | { template: 'welcome'; name: string }
  | { template: 'otp'; otp: string; expiresAt: number }
  | { template: 'reset-password'; resetUrl: string; expiresAt: number }
);
/** Enqueues transactional mail without retaining completed/failed credential-bearing payloads. */
@Injectable()
export class EmailProducer {
  /** Injects the shared email queue. */
  constructor(@InjectQueue('email') private readonly queue: Queue<EmailJob>) {}
  /** Queues a welcome email. */
  async sendWelcomeEmail(email: string, name: string): Promise<void> {
    await this.add('send-welcome-email', { template: 'welcome', email, name });
  }
  /** Queues a time-bounded verification code. */
  async sendOtpEmail(email: string, otp: string): Promise<void> {
    await this.add('send-otp-email', {
      template: 'otp',
      email,
      otp,
      expiresAt: Date.now() + 600_000,
    });
  }
  /** Queues a time-bounded reset link. */
  async sendResetPasswordEmail(email: string, resetUrl: string): Promise<void> {
    await this.add('send-reset-password-email', {
      template: 'reset-password',
      email,
      resetUrl,
      expiresAt: Date.now() + 900_000,
    });
  }
  /** Uses bounded retries with exponential backoff and automatic payload removal. */
  private async add(name: string, data: EmailJob): Promise<void> {
    await this.queue.add(name, data, {
      attempts: 3,
      backoff: { type: 'exponential', delay: 2000 },
      removeOnComplete: true,
      removeOnFail: true,
    });
  }
}
