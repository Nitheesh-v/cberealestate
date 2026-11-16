'use client';
import { create } from 'zustand';
interface Notification {
  id: string;
  title: string;
  description?: string;
}
interface ToastState {
  toasts: Notification[];
  dismiss: (id: string) => void;
}
/** Bounded, ephemeral notification state shared by components and the HTTP client. */
export const useToast = create<ToastState>((set) => ({
  toasts: [],
  dismiss: (id) => set((state) => ({ toasts: state.toasts.filter((item) => item.id !== id) })),
}));
/** Queues a notification; the Radix lifecycle removes it after dismissal. */
export function toast(notification: Omit<Notification, 'id'>): void {
  useToast.setState((state) => ({
    toasts: [...state.toasts.slice(-2), { ...notification, id: crypto.randomUUID() }],
  }));
}
