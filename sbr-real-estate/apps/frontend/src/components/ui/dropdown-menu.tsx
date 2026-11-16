'use client';
import * as React from 'react';
import * as Primitive from '@radix-ui/react-dropdown-menu';
import { Check, ChevronRight, Circle } from 'lucide-react';
import { cn } from '@/lib/utils';
export const DropdownMenu = Primitive.Root;
export const DropdownMenuTrigger = Primitive.Trigger;
export const DropdownMenuGroup = Primitive.Group;
export const DropdownMenuPortal = Primitive.Portal;
export const DropdownMenuSub = Primitive.Sub;
export const DropdownMenuRadioGroup = Primitive.RadioGroup;
/** Portaled accessible dropdown content. */
export const DropdownMenuContent = React.forwardRef<
  React.ElementRef<typeof Primitive.Content>,
  React.ComponentPropsWithoutRef<typeof Primitive.Content>
>(({ className, sideOffset = 4, ...props }, ref) => (
  <Primitive.Portal>
    <Primitive.Content
      ref={ref}
      sideOffset={sideOffset}
      className={cn(
        'z-50 min-w-40 overflow-hidden rounded-lg border bg-popover p-1 text-popover-foreground shadow-soft',
        className,
      )}
      {...props}
    />
  </Primitive.Portal>
));
DropdownMenuContent.displayName = 'DropdownMenuContent';
/** Keyboard-navigable menu item. */
export const DropdownMenuItem = React.forwardRef<
  React.ElementRef<typeof Primitive.Item>,
  React.ComponentPropsWithoutRef<typeof Primitive.Item>
>(({ className, ...props }, ref) => (
  <Primitive.Item
    ref={ref}
    className={cn(
      'relative flex cursor-default select-none items-center rounded-md px-2 py-2 text-sm outline-none focus:bg-muted data-[disabled]:pointer-events-none data-[disabled]:opacity-50',
      className,
    )}
    {...props}
  />
));
DropdownMenuItem.displayName = 'DropdownMenuItem';
/** Menu group label. */
export const DropdownMenuLabel = React.forwardRef<
  React.ElementRef<typeof Primitive.Label>,
  React.ComponentPropsWithoutRef<typeof Primitive.Label>
>(({ className, ...props }, ref) => (
  <Primitive.Label
    ref={ref}
    className={cn('px-2 py-1.5 text-sm font-semibold', className)}
    {...props}
  />
));
DropdownMenuLabel.displayName = 'DropdownMenuLabel';
/** Visual menu divider. */
export const DropdownMenuSeparator = React.forwardRef<
  React.ElementRef<typeof Primitive.Separator>,
  React.ComponentPropsWithoutRef<typeof Primitive.Separator>
>(({ className, ...props }, ref) => (
  <Primitive.Separator
    ref={ref}
    className={cn('-mx-1 my-1 h-px bg-border', className)}
    {...props}
  />
));
DropdownMenuSeparator.displayName = 'DropdownMenuSeparator';
/** Checkbox menu item with a state indicator. */
export const DropdownMenuCheckboxItem = React.forwardRef<
  React.ElementRef<typeof Primitive.CheckboxItem>,
  React.ComponentPropsWithoutRef<typeof Primitive.CheckboxItem>
>(({ className, children, ...props }, ref) => (
  <Primitive.CheckboxItem
    ref={ref}
    className={cn(
      'relative flex items-center rounded-md py-2 pl-8 pr-2 text-sm outline-none focus:bg-muted',
      className,
    )}
    {...props}
  >
    <span className="absolute left-2">
      <Primitive.ItemIndicator>
        <Check className="h-4 w-4" />
      </Primitive.ItemIndicator>
    </span>
    {children}
  </Primitive.CheckboxItem>
));
DropdownMenuCheckboxItem.displayName = 'DropdownMenuCheckboxItem';
/** Radio menu item with a state indicator. */
export const DropdownMenuRadioItem = React.forwardRef<
  React.ElementRef<typeof Primitive.RadioItem>,
  React.ComponentPropsWithoutRef<typeof Primitive.RadioItem>
>(({ className, children, ...props }, ref) => (
  <Primitive.RadioItem
    ref={ref}
    className={cn(
      'relative flex items-center rounded-md py-2 pl-8 pr-2 text-sm outline-none focus:bg-muted',
      className,
    )}
    {...props}
  >
    <span className="absolute left-2">
      <Primitive.ItemIndicator>
        <Circle className="h-2 w-2 fill-current" />
      </Primitive.ItemIndicator>
    </span>
    {children}
  </Primitive.RadioItem>
));
DropdownMenuRadioItem.displayName = 'DropdownMenuRadioItem';
/** Nested menu trigger. */
export const DropdownMenuSubTrigger = React.forwardRef<
  React.ElementRef<typeof Primitive.SubTrigger>,
  React.ComponentPropsWithoutRef<typeof Primitive.SubTrigger>
>(({ className, children, ...props }, ref) => (
  <Primitive.SubTrigger
    ref={ref}
    className={cn(
      'flex items-center rounded-md px-2 py-2 text-sm outline-none focus:bg-muted',
      className,
    )}
    {...props}
  >
    {children}
    <ChevronRight className="ml-auto h-4 w-4" />
  </Primitive.SubTrigger>
));
DropdownMenuSubTrigger.displayName = 'DropdownMenuSubTrigger';
/** Nested menu content. */
export const DropdownMenuSubContent = React.forwardRef<
  React.ElementRef<typeof Primitive.SubContent>,
  React.ComponentPropsWithoutRef<typeof Primitive.SubContent>
>(({ className, ...props }, ref) => (
  <Primitive.SubContent
    ref={ref}
    className={cn('z-50 min-w-40 rounded-md border bg-popover p-1 shadow-soft', className)}
    {...props}
  />
));
DropdownMenuSubContent.displayName = 'DropdownMenuSubContent';
/** Optional keyboard shortcut hint. */
export function DropdownMenuShortcut({
  className,
  ...props
}: React.HTMLAttributes<HTMLSpanElement>): React.JSX.Element {
  return (
    <span className={cn('ml-auto text-xs tracking-widest opacity-60', className)} {...props} />
  );
}
