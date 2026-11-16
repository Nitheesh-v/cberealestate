import { CallHandler, ExecutionContext, Injectable, Logger, NestInterceptor } from '@nestjs/common';
import type { Observable } from 'rxjs';
import type { Request, Response } from 'express';
/** Records request duration on completion, failure, or cancellation. */
@Injectable()
export class LoggingInterceptor implements NestInterceptor {
  private readonly logger = new Logger(LoggingInterceptor.name);
  /** Uses the response finish event so exception filters have already set the status. */
  intercept(context: ExecutionContext, next: CallHandler<unknown>): Observable<unknown> {
    const request = context.switchToHttp().getRequest<Request>();
    const response = context.switchToHttp().getResponse<Response>();
    const started = Date.now();
    response.once('finish', () =>
      this.logger.log(
        `${request.method} ${request.path} ${response.statusCode} ${Date.now() - started}ms`,
      ),
    );
    return next.handle();
  }
}
