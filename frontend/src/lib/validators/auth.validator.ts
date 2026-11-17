import { z } from 'zod';
import { UserRole } from '@/types/user.types';
const email = z.string().trim().toLowerCase().pipe(z.email('Enter a valid email address').max(254));
const name = z
  .string()
  .trim()
  .min(2, 'Use at least 2 characters')
  .max(50, 'Use at most 50 characters')
  .regex(/^[\p{L}\p{M}][\p{L}\p{M} .'-]*$/u, 'Use letters, spaces, apostrophes, dots or hyphens');
export const passwordSchema = z
  .string()
  .min(8, 'Use at least 8 characters')
  .max(72, 'Use at most 72 characters')
  .refine((value) => new TextEncoder().encode(value).length <= 72, 'Use at most 72 UTF-8 bytes')
  .regex(
    /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9\s])[^\s]+$/,
    'Include uppercase, lowercase, a number and a symbol; no spaces',
  );
const phone = z
  .string()
  .trim()
  .refine(
    (value) => value === '' || /^\+?[1-9]\d{7,14}$/.test(value),
    'Use 8–15 digits, optionally starting with +',
  );
export const loginSchema = z.object({
  email,
  password: z.string().min(1, 'Enter your password').max(72),
  rememberMe: z.boolean(),
});
export const registerSchema = z
  .object({
    firstName: name,
    lastName: name,
    email,
    phone,
    password: passwordSchema,
    confirmPassword: z.string(),
    role: z.enum(['user', 'agent']),
    terms: z.boolean().refine(Boolean, 'Please accept the terms to continue'),
  })
  .refine((data) => data.password === data.confirmPassword, {
    path: ['confirmPassword'],
    message: 'Passwords do not match',
  });
export const forgotPasswordSchema = z.object({ email });
export const resetPasswordSchema = z
  .object({ newPassword: passwordSchema, confirmPassword: z.string() })
  .refine((data) => data.newPassword === data.confirmPassword, {
    path: ['confirmPassword'],
    message: 'Passwords do not match',
  });
export const changePasswordSchema = z
  .object({
    currentPassword: z.string().min(1, 'Enter your current password').max(72),
    newPassword: passwordSchema,
    confirmPassword: z.string(),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    path: ['confirmPassword'],
    message: 'Passwords do not match',
  });
export const otpSchema = z.object({
  email,
  otp: z.string().regex(/^\d{6}$/, 'Enter the six-digit code'),
});
export const profileSchema = z.object({ firstName: name, lastName: name, phone });
export const userSchema = z.object({
  id: z.string(),
  firstName: z.string(),
  lastName: z.string(),
  fullName: z.string(),
  email: z.email(),
  phone: z.string().optional(),
  avatar: z.url().optional(),
  role: z.enum(UserRole),
  isVerified: z.boolean(),
  isActive: z.boolean(),
  createdAt: z.string(),
  updatedAt: z.string(),
});
export const authSessionSchema = z.object({
  user: userSchema,
  accessToken: z.string().min(1),
  expiresIn: z.number().positive(),
  rememberMe: z.boolean(),
  verificationEmailQueued: z.boolean().optional(),
});
export type LoginValues = z.infer<typeof loginSchema>;
export type RegisterValues = z.infer<typeof registerSchema>;
export type ForgotValues = z.infer<typeof forgotPasswordSchema>;
export type ResetValues = z.infer<typeof resetPasswordSchema>;
export type ChangeValues = z.infer<typeof changePasswordSchema>;
export type OtpValues = z.infer<typeof otpSchema>;
export type ProfileValues = z.infer<typeof profileSchema>;
