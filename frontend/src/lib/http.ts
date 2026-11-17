import axios from 'axios';
import { API_URL } from './constants';
/** Bare transport for auth handshakes; avoids interceptor recursion during refresh. */
export const http = axios.create({
  baseURL: API_URL,
  timeout: 15000,
  withCredentials: true,
  headers: { 'Content-Type': 'application/json' },
});
