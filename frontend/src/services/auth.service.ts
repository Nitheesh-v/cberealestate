import axios from 'axios';
import { http } from '@/lib/http';
import { api } from '@/lib/api';
import { authSessionSchema, userSchema } from '@/lib/validators/auth.validator';
import type { AuthSession, LoginInput, RegisterInput, MessageResult } from '@/types/auth.types';
import type { ApiResponse } from '@/types';
import type { User, UpdateProfileInput } from '@/types/user.types';
/** Extracts only safe text errors from the API's known envelope. React escapes the result. */
export function authError(error: unknown): string {
  if (axios.isAxiosError<unknown>(error)) {
    const body = error.response?.data;
    if (typeof body === 'object' && body !== null && 'message' in body) {
      if (typeof body.message === 'string') return body.message.slice(0, 300);
      if (Array.isArray(body.message))
        return body.message
          .filter((item: unknown): item is string => typeof item === 'string')
          .slice(0, 3)
          .join('. ')
          .slice(0, 500);
    }
    return error.response?.status === 429
      ? 'Too many attempts. Please wait before trying again.'
      : 'Unable to reach the service. Please try again.';
  }
  return 'We could not complete your request. Please try again.';
}
/** Validates the session envelope while deliberately discarding body refresh tokens. */
async function session(path: string, body: LoginInput | RegisterInput): Promise<AuthSession> {
  const result = await http.post<ApiResponse<unknown>>(path, body);
  return authSessionSchema.parse(result.data.data);
}
/** Typed auth transport. Refresh uses the separate single-flight session coordinator. */
export const authService = {
  /** Starts a credential-based session. */
  login: async (input: LoginInput): Promise<AuthSession> => session('/auth/login', input),
  /** Registers an allowed buyer/agent account. */
  register: async (input: RegisterInput): Promise<AuthSession> => session('/auth/register', input),
  /** Requests an email without revealing whether an account exists. */
  forgotPassword: async (email: string): Promise<MessageResult> =>
    (await http.post<ApiResponse<MessageResult>>('/auth/forgot-password', { email })).data.data,
  /** Redeems a single-use reset link. */
  resetPassword: async (token: string, newPassword: string): Promise<MessageResult> =>
    (await http.post<ApiResponse<MessageResult>>('/auth/reset-password', { token, newPassword }))
      .data.data,
  /** Redeems an expiring six-digit email code. */
  verifyOtp: async (email: string, otp: string): Promise<MessageResult> =>
    (await http.post<ApiResponse<MessageResult>>('/auth/verify-otp', { email, otp })).data.data,
  /** Requests a code subject to the server cooldown. */
  resendOtp: async (email: string): Promise<MessageResult> =>
    (await http.post<ApiResponse<MessageResult>>('/auth/resend-otp', { email })).data.data,
  /** Loads the current profile through authenticated refresh-aware transport. */
  me: async (): Promise<User> =>
    userSchema.parse((await api.get<ApiResponse<unknown>>('/auth/me')).data.data),
  /** Updates only the allowed profile fields. */
  updateProfile: async (input: UpdateProfileInput): Promise<User> =>
    userSchema.parse((await api.patch<ApiResponse<unknown>>('/users/me', input)).data.data),
  /** Changes credentials and revokes the current session. */
  changePassword: async (currentPassword: string, newPassword: string): Promise<MessageResult> =>
    (
      await api.patch<ApiResponse<MessageResult>>('/auth/change-password', {
        currentPassword,
        newPassword,
      })
    ).data.data,
  /** Uses the captured token so clearing client state cannot trigger refresh during logout. */
  logout: async (token: string): Promise<void> => {
    await http.post('/auth/logout', {}, { headers: { Authorization: `Bearer ${token}` } });
  },
};
