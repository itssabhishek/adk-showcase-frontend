'use client';

import React from 'react';

import { cn } from '@/lib/utils';

interface IconButtonProps {
  icon: React.ReactNode;
  onClick?: () => void;
  className?: string;
  disabled?: boolean;
}

export function IconButton({
  icon,
  onClick,
  className,
  disabled = false,
}: IconButtonProps) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={cn(
        'h-[50px] w-[50px] flex items-center justify-center rounded-full bg-black/60 text-white transition-colors',
        'hover:opacity-90 active:opacity-80 disabled:opacity-50',
        className
      )}>
      {icon}
    </button>
  );
}
