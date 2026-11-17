import type { User } from './user.types';
export interface AuthSession {
  user: User;
  accessToken: string;
  expiresIn: number;
  rememberMe: boolean;
  verificationEmailQueued?: boolean;
}
export interface LoginInput {
  email: string;
  password: string;
  rememberMe: boolean;
}
export interface RegisterInput {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  phone?: string;
  role: 'user' | 'agent';
}
export interface MessageResult {
  message: string;
}
