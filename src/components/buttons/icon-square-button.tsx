import React from 'react';

import { cn } from '@/lib/utils';

type IconSquareButtonProps = {
  icon: React.ReactNode;
  isActive?: boolean;
  onClick?: (e) => void;
  className?: string;
  disabled?: boolean;
};

export function IconSquareButton({
  icon,
  isActive = false,
  onClick,
  className,
  disabled = false,
}: IconSquareButtonProps) {
  return (
    <div
      onClick={!disabled ? onClick : null}
      className={cn(
        'flex items-center justify-center w-[46px] h-[46px] rounded-lg bg-lightWhite border border-borderWhite transition-all duration-200 hover:bg-lightWhite hover:border-lightWhite p-3 hover:brightness-200 backdrop-blur-[120px]',
        isActive
          ? 'bg-lightWhite border-lightWhite text-primary'
          : 'text-white',
        disabled ? 'cursor-not-allowed' : 'cursor-pointer',
        className
      )}>
      {icon}
    </div>
  );
}
