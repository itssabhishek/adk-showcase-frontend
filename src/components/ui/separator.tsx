import * as SeparatorPrimitive from '@radix-ui/react-separator';
import * as React from 'react';

// Utility function for class names; ensure this is defined in your utility library
import { cn } from '@/lib/utils';

interface SeparatorProps {
  className?: string;
  orientation?: 'horizontal' | 'vertical';
  decorative?: boolean;
}

const Separator = React.forwardRef<
  React.ElementRef<typeof SeparatorPrimitive.Root>,
  SeparatorProps &
    React.ComponentPropsWithoutRef<typeof SeparatorPrimitive.Root>
>(
  (
    {
      className,
      orientation = 'horizontal',
      decorative = true,
      ...props
    }: SeparatorProps,
    ref
  ) => (
    <SeparatorPrimitive.Root
      ref={ref}
      decorative={decorative}
      orientation={orientation}
      className={cn(
        'shrink-0 bg-[#464646] bg-border',
        orientation === 'horizontal' ? 'h-[1px] w-full' : 'h-full w-[1px]',
        className
      )}
      {...props}
    />
  )
);

// Adding display name based on the Radix UI component display name
Separator.displayName = SeparatorPrimitive.Root.displayName;

export { Separator };
