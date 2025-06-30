import React from 'react';

import { cn } from '@/lib/utils';

import { Button } from '../ui/button';

export function BasicButton(
  props: React.ButtonHTMLAttributes<HTMLButtonElement>
) {
  return (
    <Button
      {...props}
      className={cn(
        'rounded-lg w-full h-12 button-text-md px-6  text-center border border-lightWhite bg-borderWhite transition-all duration-200 hover:bg-primary/5 hover:border-primary/20 hover:text-primary  backdrop-blur-[120px]',
        props.className
      )}
    />
  );
}
