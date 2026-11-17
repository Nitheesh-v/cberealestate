import { describe, expect, it } from 'vitest';
import {
  registerSchema,
  loginSchema,
  passwordSchema,
  resetPasswordSchema,
  changePasswordSchema,
  otpSchema,
} from './auth.validator';
const registration = {
  firstName: 'Test',
  lastName: 'Person',
  email: 'test@example.test',
  phone: '',
  password: 'GoodPassword1!',
  confirmPassword: 'GoodPassword1!',
  role: 'user',
  terms: true,
};
describe('Auth validation', () => {
  it('normalizes email and name input', () => {
    const result = registerSchema.parse({
      ...registration,
      firstName: ' Test ',
      email: ' TEST@EXAMPLE.TEST ',
    });
    expect(result.email).toBe('test@example.test');
    expect(result.firstName).toBe('Test');
  });
  it.each([
    { role: 'admin' },
    { terms: false },
    { confirmPassword: 'different' },
    { phone: 'abc' },
    { firstName: '<script>' },
  ])('rejects unsafe registration %o', (override) => {
    expect(registerSchema.safeParse({ ...registration, ...override }).success).toBe(false);
  });
  it.each([
    'short',
    'lowercaseonly',
    'NoNumbers!',
    'NoSymbols123',
    'Has Spaces1!',
    'Aa1!' + '🙂'.repeat(18),
  ])('rejects weak or truncated password %s', (password) => {
    expect(passwordSchema.safeParse(password).success).toBe(false);
  });
  it('keeps legitimate password characters unchanged', () => {
    expect(
      loginSchema.parse({
        email: registration.email,
        password: 'CaseSensitive1!',
        rememberMe: false,
      }).password,
    ).toBe('CaseSensitive1!');
  });
  it('requires matching reset/change confirmations', () => {
    expect(
      resetPasswordSchema.safeParse({ newPassword: 'GoodPassword1!', confirmPassword: 'other' })
        .success,
    ).toBe(false);
    expect(
      changePasswordSchema.safeParse({
        currentPassword: '',
        newPassword: 'GoodPassword1!',
        confirmPassword: 'GoodPassword1!',
      }).success,
    ).toBe(false);
  });
  it('preserves leading zeroes in six-digit OTPs', () => {
    expect(otpSchema.parse({ email: registration.email, otp: '001234' }).otp).toBe('001234');
    expect(otpSchema.safeParse({ email: registration.email, otp: 123456 }).success).toBe(false);
  });
});
