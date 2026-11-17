import { Processor, WorkerHost, OnWorkerEvent } from '@nestjs/bullmq';
import { ConfigService } from '@nestjs/config';
import { Logger, OnModuleDestroy } from '@nestjs/common';
import { Job } from 'bullmq';
import { readFile } from 'node:fs/promises';
import { join } from 'node:path';
import nodemailer, { type Transporter } from 'nodemailer';
import Handlebars from 'handlebars';
import type { EmailJob } from './email.producer';
/** Bounded worker sending escaped HTML templates through configured SMTP. */
@Processor('email', { concurrency: 3 })
export class EmailConsumer extends WorkerHost implements OnModuleDestroy {
  private readonly logger = new Logger(EmailConsumer.name);
  private readonly transport: Transporter;
  /** Configures SMTP without ever logging credentials or message bodies. */
  constructor(private readonly config: ConfigService) {
    super();
    this.transport = nodemailer.createTransport({
      host: config.getOrThrow<string>('SMTP_HOST'),
      port: Number(config.get<number>('SMTP_PORT') ?? 587),
      secure: Number(config.get<number>('SMTP_PORT') ?? 587) === 465,
      auth: {
        user: config.getOrThrow<string>('SMTP_USER'),
        pass: config.getOrThrow<string>('SMTP_PASSWORD'),
      },
      connectionTimeout: 10_000,
      greetingTimeout: 10_000,
      socketTimeout: 15_000,
    });
  }
  /** Compiles only a fixed template allowlist; expired secrets are never sent. */
  async process(job: Job<EmailJob>): Promise<void> {
    const data = job.data;
    if ('expiresAt' in data && data.expiresAt <= Date.now()) return;
    if (!['welcome', 'otp', 'reset-password'].includes(data.template))
      throw new Error('Invalid email template');
    try {
      const source = await readFile(join(__dirname, 'templates', `${data.template}.hbs`), 'utf8');
      const html = Handlebars.compile(source, { strict: true })(data);
      const subjects = {
        welcome: 'Welcome to SBR Real Estate',
        otp: 'Verify your email',
        'reset-password': 'Reset your password',
      };
      await this.transport.sendMail({
        from: this.config.getOrThrow<string>('SMTP_FROM'),
        to: data.email,
        subject: subjects[data.template],
        html,
        text:
          data.template === 'welcome'
            ? `Welcome, ${data.name}.`
            : data.template === 'otp'
              ? `Your verification code is ${data.otp}. It expires in 10 minutes.`
              : `Reset your password: ${data.resetUrl}. This link expires in 15 minutes.`,
      });
    } catch {
      throw new Error('Email delivery failed');
    }
  }
  /** Logs only a non-sensitive job identifier. */
  @OnWorkerEvent('failed') onFailed(job: Job<EmailJob> | undefined): void {
    this.logger.error(`Email job ${job?.id ?? 'unknown'} failed`);
  }
  /** Closes the SMTP transport on application shutdown. */
  onModuleDestroy(): void {
    this.transport.close();
  }
}
