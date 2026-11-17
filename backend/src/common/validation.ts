import { applyDecorators } from '@nestjs/common';
import { Transform } from 'class-transformer';
import { IsEmail, IsString, Length, Matches, MaxLength, registerDecorator } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { NAME_PATTERN, PASSWORD_PATTERN } from './security';
/** Normalizes identity text without coercing objects or query operators to strings. */
export const Trim = () =>
  Transform(({ value }: { value: unknown }) =>
    typeof value === 'string' ? value.normalize('NFC').trim() : value,
  );
/** Validated, normalized person name. */
export const PersonName = () =>
  applyDecorators(
    ApiProperty({ minLength: 2, maxLength: 50 }),
    Trim(),
    IsString(),
    Length(2, 50),
    Matches(NAME_PATTERN, { message: 'Use letters, spaces, apostrophes, dots or hyphens' }),
  );
/** Email normalization is shared by registration, login and recovery. */
export const EmailAddress = () =>
  applyDecorators(
    ApiProperty({ format: 'email' }),
    Trim(),
    Transform(({ value }: { value: unknown }) =>
      typeof value === 'string' ? value.toLowerCase() : value,
    ),
    IsEmail(),
    MaxLength(254),
  );
/** Prevents bcrypt silently truncating multibyte passwords at 72 bytes. */
export function BcryptLength(): PropertyDecorator {
  return (target, propertyKey) =>
    registerDecorator({
      name: 'bcryptLength',
      target: target.constructor,
      propertyName: String(propertyKey),
      validator: {
        validate: (value: unknown) =>
          typeof value === 'string' && Buffer.byteLength(value, 'utf8') <= 72,
        defaultMessage: () => 'Password must not exceed 72 UTF-8 bytes',
      },
    });
}
/** Strong password validation; passwords are intentionally never trimmed. */
export const StrongPassword = () =>
  applyDecorators(
    ApiProperty({ minLength: 8, maxLength: 72, format: 'password' }),
    IsString(),
    Length(8, 72),
    BcryptLength(),
    Matches(PASSWORD_PATTERN, {
      message: 'Password needs uppercase, lowercase, a number and a symbol, with no spaces',
    }),
  );
