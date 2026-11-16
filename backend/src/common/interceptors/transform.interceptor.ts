import { CallHandler, ExecutionContext, Injectable, NestInterceptor } from '@nestjs/common';
import { map, type Observable } from 'rxjs';
import type { ApiResponse } from '../interfaces/api-response.interface';
/** Produces a single predictable envelope, including for null and empty results. */
@Injectable()
export class TransformInterceptor<T> implements NestInterceptor<T, ApiResponse<T | null>> {
  /** Wraps the controller payload exactly once. */
  intercept(_context: ExecutionContext, next: CallHandler<T>): Observable<ApiResponse<T | null>> {
    return next.handle().pipe(
      map((data) => ({
        success: true,
        message: 'Request successful',
        data: data ?? null,
        meta: { timestamp: new Date().toISOString() },
      })),
    );
  }
}
