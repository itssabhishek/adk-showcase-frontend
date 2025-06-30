import React from 'react';

import { cn } from '@/lib/utils';

type SocialButtonProps = {
  /** Icon to display in the button */
  icon: React.ReactNode;
  /** Click handler */
  onClick?: (
    e: React.MouseEvent<HTMLButtonElement, MouseEvent> | undefined
  ) => void;
  /** Additional CSS classes */
  className?: string;
  classNameIcon?: string;
};

export function SocialButton({
  icon,
  onClick,
  className,
  classNameIcon,
}: SocialButtonProps) {
  return (
    <button
      onClick={onClick}
      className={cn(
        'flex items-center justify-center h-12 max-w-40 rounded-md transition-all duration-200 hover:brightness-[200%] p-3 bg-white/2 border border-lightWhite backdrop-blur-lg',
        className
      )}>
      <div className={cn(``, classNameIcon)}>{icon}</div>
    </button>
  );
}
