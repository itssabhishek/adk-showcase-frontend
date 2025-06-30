import React from 'react';

import { cn } from '@/lib/utils';

import { Button } from '../ui/button';

export function CTAButton(
  props: React.ButtonHTMLAttributes<HTMLButtonElement>
) {
  return (
    <Button
      {...props}
      className={cn(
        'rounded-lg w-full h-12 button-text-md px-6  text-center border  ',
        props.className
      )}
      variant="primary"
    />
  );
}
