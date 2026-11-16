import { BadRequestException, ValidationPipe, type ValidationError } from '@nestjs/common';
/** Flattens nested DTO errors without echoing submitted values. */
export function formatValidationErrors(errors: ValidationError[], parent = ''): string[] {
  return errors.flatMap((error) => {
    const path = parent ? `${parent}.${error.property}` : error.property;
    return [
      ...Object.values(error.constraints ?? {}).map((message) => `${path}: ${message}`),
      ...formatValidationErrors(error.children ?? [], path),
    ];
  });
}
/** Rejects unexpected fields, casts DTO values, and provides consistent error messages. */
export class AppValidationPipe extends ValidationPipe {
  /** Configures secure validation defaults for all controllers. */
  constructor() {
    super({
      whitelist: true,
      transform: true,
      forbidNonWhitelisted: true,
      forbidUnknownValues: true,
      validationError: { target: false, value: false },
      exceptionFactory: (errors) => new BadRequestException(formatValidationErrors(errors)),
    });
  }
}
