'use client';

import * as ScrollAreaPrimitive from '@radix-ui/react-scroll-area';
import { cva, type VariantProps } from 'class-variance-authority';
import * as React from 'react';

import { cn } from '@/lib/utils';

export interface ScrollAreaProps
  extends React.ComponentPropsWithoutRef<typeof ScrollAreaPrimitive.Root>,
    VariantProps<typeof scrollbarVariants> {}

const ScrollArea = React.forwardRef<
  React.ElementRef<typeof ScrollAreaPrimitive.Root>,
  ScrollAreaProps
>(({ className, variant, children, ...props }, ref) => (
  <ScrollAreaPrimitive.Root
    ref={ref}
    className={cn('relative overflow-hidden', className)}
    {...props}>
    <ScrollAreaPrimitive.Viewport className={`h-full w-full relative`}>
      {children}
    </ScrollAreaPrimitive.Viewport>
    <ScrollBar variant={variant} />
    <ScrollAreaPrimitive.Corner />
  </ScrollAreaPrimitive.Root>
));
ScrollArea.displayName = ScrollAreaPrimitive.Root.displayName;

const scrollbarVariants = cva('relative flex-1 rounded-full', {
  variants: {
    variant: {
      default: 'bg-white/20',
      ghost: '',
    },
  },
  defaultVariants: {
    variant: 'default',
  },
});

export interface ScrollBarProps
  extends React.ComponentPropsWithoutRef<
      typeof ScrollAreaPrimitive.ScrollAreaScrollbar
    >,
    VariantProps<typeof scrollbarVariants> {}

const ScrollBar = React.forwardRef<
  React.ElementRef<typeof ScrollAreaPrimitive.ScrollAreaScrollbar>,
  ScrollBarProps
>(({ className, variant, orientation = 'vertical', ...props }, ref) => (
  <ScrollAreaPrimitive.ScrollAreaScrollbar
    ref={ref}
    orientation={orientation}
    className={cn(
      'flex touch-none select-none transition-colors',
      orientation === 'vertical' &&
        'h-full w-2.5 border-l border-l-transparent p-[1px]',
      orientation === 'horizontal' &&
        'h-2.5 flex-col border-t border-t-transparent p-[1px]',
      className
    )}
    {...props}>
    <ScrollAreaPrimitive.ScrollAreaThumb
      className={cn(
        scrollbarVariants({
          variant,
        })
      )}
    />
  </ScrollAreaPrimitive.ScrollAreaScrollbar>
));
ScrollBar.displayName = ScrollAreaPrimitive.ScrollAreaScrollbar.displayName;

export { ScrollArea, ScrollBar };
