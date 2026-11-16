'use client';
import * as React from 'react';
import * as Primitive from '@radix-ui/react-dialog';
import { X } from 'lucide-react';
import { cn } from '@/lib/utils';
export const Sheet = Primitive.Root;
export const SheetTrigger = Primitive.Trigger;
export const SheetClose = Primitive.Close;
export const SheetPortal = Primitive.Portal;
/** Modal backdrop with reduced-motion-aware animations. */
export const SheetOverlay = React.forwardRef<
  React.ElementRef<typeof Primitive.Overlay>,
  React.ComponentPropsWithoutRef<typeof Primitive.Overlay>
>(({ className, ...props }, ref) => (
  <Primitive.Overlay
    ref={ref}
    className={cn(
      'fixed inset-0 z-50 bg-black/50 backdrop-blur-sm data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=open]:fade-in-0 data-[state=closed]:fade-out-0',
      className,
    )}
    {...props}
  />
));
SheetOverlay.displayName = 'SheetOverlay';
/** Focus-trapped sheet content with an accessible dismiss button. */
export const SheetContent = React.forwardRef<
  React.ElementRef<typeof Primitive.Content>,
  React.ComponentPropsWithoutRef<typeof Primitive.Content>
>(({ className, children, ...props }, ref) => (
  <SheetPortal>
    <SheetOverlay />
    <Primitive.Content
      ref={ref}
      className={cn(
        'fixed inset-y-0 right-0 z-50 h-full w-[min(90vw,380px)] overflow-y-auto border-l bg-surface p-6 shadow-xl data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=open]:slide-in-from-right data-[state=closed]:slide-out-to-right',
        className,
      )}
      {...props}
    >
      {children}
      <Primitive.Close className="absolute right-4 top-4 rounded-md p-2 text-muted-foreground hover:bg-muted">
        <X className="h-5 w-5" />
        <span className="sr-only">Close</span>
      </Primitive.Close>
    </Primitive.Content>
  </SheetPortal>
));
SheetContent.displayName = 'SheetContent';
/** Groups the modal heading and description. */
export function SheetHeader({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>): React.JSX.Element {
  return <div className={cn('flex flex-col space-y-2', className)} {...props} />;
}
/** Groups modal actions. */
export function SheetFooter({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>): React.JSX.Element {
  return (
    <div
      className={cn('flex flex-col-reverse gap-2 sm:flex-row sm:justify-end', className)}
      {...props}
    />
  );
}
/** Accessible modal title. */
export const SheetTitle = React.forwardRef<
  React.ElementRef<typeof Primitive.Title>,
  React.ComponentPropsWithoutRef<typeof Primitive.Title>
>(({ className, ...props }, ref) => (
  <Primitive.Title
    ref={ref}
    className={cn('font-heading text-xl font-semibold', className)}
    {...props}
  />
));
SheetTitle.displayName = 'SheetTitle';
/** Accessible modal description. */
export const SheetDescription = React.forwardRef<
  React.ElementRef<typeof Primitive.Description>,
  React.ComponentPropsWithoutRef<typeof Primitive.Description>
>(({ className, ...props }, ref) => (
  <Primitive.Description
    ref={ref}
    className={cn('text-sm text-muted-foreground', className)}
    {...props}
  />
));
SheetDescription.displayName = 'SheetDescription';
