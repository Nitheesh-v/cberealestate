import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import type { Request, Response } from 'express';
import { Error as MongooseError } from 'mongoose';
/** Detects a duplicate-key error without assuming an Error subclass. */
function isDuplicateKey(error: unknown): boolean {
  return typeof error === 'object' && error !== null && 'code' in error && error.code === 11000;
}
/** Maps all failures to safe, consistent REST error responses. */
@Catch()
export class HttpExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(HttpExceptionFilter.name);
  /** Formats the error and avoids exposing stack traces, credentials, or submitted values. */
  catch(exception: unknown, host: ArgumentsHost): void {
    const context = host.switchToHttp();
    const response = context.getResponse<Response>();
    const request = context.getRequest<Request>();
    let status = HttpStatus.INTERNAL_SERVER_ERROR;
    let message: string | string[] = 'An unexpected error occurred';
    if (exception instanceof HttpException) {
      status = exception.getStatus();
      const payload = exception.getResponse();
      if (typeof payload === 'string') message = payload;
      else if (
        'message' in payload &&
        (typeof payload.message === 'string' ||
          (Array.isArray(payload.message) &&
            payload.message.every((item: unknown) => typeof item === 'string')))
      )
        message = payload.message as string | string[];
      else message = exception.message;
    } else if (exception instanceof MongooseError.ValidationError) {
      status = HttpStatus.BAD_REQUEST;
      message = Object.keys(exception.errors).map((field) => `${field}: invalid value`);
    } else if (exception instanceof MongooseError.CastError) {
      status = HttpStatus.BAD_REQUEST;
      message = 'Invalid resource identifier';
    } else if (isDuplicateKey(exception)) {
      status = HttpStatus.CONFLICT;
      message = 'A record with these unique fields already exists';
    }
    const path = request.path;
    if (status >= 500) this.logger.error(`${request.method} ${path} ${status}`);
    else this.logger.warn(`${request.method} ${path} ${status}`);
    response.status(status).json({
      success: false,
      message,
      statusCode: status,
      timestamp: new Date().toISOString(),
      path,
    });
  }
}
