'use client';
import * as React from 'react';
import * as Primitive from '@radix-ui/react-toast';
import { X } from 'lucide-react';
import { cn } from '@/lib/utils';
export const ToastProvider = Primitive.Provider;
/** Screen-reader-aware toast viewport. */
export const ToastViewport = React.forwardRef<
  React.ElementRef<typeof Primitive.Viewport>,
  React.ComponentPropsWithoutRef<typeof Primitive.Viewport>
>(({ className, ...props }, ref) => (
  <Primitive.Viewport
    ref={ref}
    className={cn(
      'fixed bottom-0 right-0 z-[100] flex max-h-screen w-full flex-col gap-2 p-4 sm:max-w-sm',
      className,
    )}
    {...props}
  />
));
ToastViewport.displayName = 'ToastViewport';
/** Dismissible notification surface. */
export const Toast = React.forwardRef<
  React.ElementRef<typeof Primitive.Root>,
  React.ComponentPropsWithoutRef<typeof Primitive.Root>
>(({ className, ...props }, ref) => (
  <Primitive.Root
    ref={ref}
    className={cn(
      'relative flex w-full items-center justify-between gap-4 rounded-lg border bg-surface p-5 pr-9 shadow-lg data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-80',
      className,
    )}
    {...props}
  />
));
Toast.displayName = 'Toast';
/** Notification title. */
export const ToastTitle = React.forwardRef<
  React.ElementRef<typeof Primitive.Title>,
  React.ComponentPropsWithoutRef<typeof Primitive.Title>
>(({ className, ...props }, ref) => (
  <Primitive.Title ref={ref} className={cn('text-sm font-semibold', className)} {...props} />
));
ToastTitle.displayName = 'ToastTitle';
/** Notification description, rendered as escaped text. */
export const ToastDescription = React.forwardRef<
  React.ElementRef<typeof Primitive.Description>,
  React.ComponentPropsWithoutRef<typeof Primitive.Description>
>(({ className, ...props }, ref) => (
  <Primitive.Description
    ref={ref}
    className={cn('text-sm text-muted-foreground', className)}
    {...props}
  />
));
ToastDescription.displayName = 'ToastDescription';
/** Accessible dismiss action. */
export const ToastClose = React.forwardRef<
  React.ElementRef<typeof Primitive.Close>,
  React.ComponentPropsWithoutRef<typeof Primitive.Close>
>(({ className, ...props }, ref) => (
  <Primitive.Close
    ref={ref}
    className={cn('absolute right-2 top-2 rounded-md p-1', className)}
    {...props}
  >
    <X className="h-4 w-4" />
    <span className="sr-only">Dismiss notification</span>
  </Primitive.Close>
));
ToastClose.displayName = 'ToastClose';
/** Optional contextual toast action. */
export const ToastAction = React.forwardRef<
  React.ElementRef<typeof Primitive.Action>,
  React.ComponentPropsWithoutRef<typeof Primitive.Action>
>(({ className, ...props }, ref) => (
  <Primitive.Action
    ref={ref}
    className={cn('rounded-md border px-3 py-1 text-sm', className)}
    {...props}
  />
));
ToastAction.displayName = 'ToastAction';
