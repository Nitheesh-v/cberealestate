'use client';
import { useToast } from '@/hooks/use-toast';
import {
  Toast,
  ToastClose,
  ToastDescription,
  ToastProvider,
  ToastTitle,
  ToastViewport,
} from './toast';
/** Global live-region notifications backed by the shadcn/Radix primitives. */
export function Toaster(): React.JSX.Element {
  const { toasts, dismiss } = useToast();
  return (
    <ToastProvider duration={5000}>
      {toasts.map(({ id, title, description }) => (
        <Toast
          key={id}
          onOpenChange={(open) => {
            if (!open) dismiss(id);
          }}
        >
          <div>
            <ToastTitle>{title}</ToastTitle>
            {description && <ToastDescription>{description}</ToastDescription>}
          </div>
          <ToastClose />
        </Toast>
      ))}
      <ToastViewport />
    </ToastProvider>
  );
}
