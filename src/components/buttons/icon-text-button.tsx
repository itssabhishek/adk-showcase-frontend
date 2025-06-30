import React from 'react';

import { cn } from '@/lib/utils';

import { IconSquareButton } from './icon-square-button';

type IconTextButtonProps = {
  /** Text label for the button */
  label: string;
  /** Optional icon (e.g., a small SVG) to display on the left */
  icon?: React.ReactNode;
  /** Whether the button is currently active or "selected" */
  isActive?: boolean;
  /** Click handler */
  onClick?: () => void;
  /** Additional CSS classes */
  className?: string;
  /** Additional CSS classes for the icon */
  iconClassName?: string;
  /** Optional icon (e.g., a small SVG) to display on the right **/
  rightIcon?: React.ReactNode;
  /** Additional CSS classes for the text */
  textClassName?: string;
  /** Disabled prop */
  disabled?: boolean;
  /** Show label */
  showLabel?: boolean;
  /** Show Icon */
  showIcon?: boolean;

  type?: 'button' | 'submit' | 'reset';
};

export function IconTextButton({
  label,
  icon,
  isActive = false,
  onClick,
  className,
  iconClassName,
  rightIcon,
  textClassName,
  disabled = false,
  showLabel = true,
  showIcon = true,
  type = 'button',
}: IconTextButtonProps) {
  return (
    <button
      onClick={onClick}
      type={type}
      className={cn(
        'flex items-center rounded p-4 font-medium bg-lightWhite border border-borderWhite transition-all duration-200 hover:bg-lightWhite hover:border-lightWhite hover:brightness-200 backdrop-blur-[120px]',
        isActive
          ? 'bg-lightWhite border-lightWhite text-primary'
          : 'text-white',
        disabled ? 'cursor-not-allowed' : 'cursor-pointer',
        className
      )}
      disabled={disabled}>
      {showIcon && icon && (
        <IconSquareButton
          icon={icon}
          isActive={isActive}
          onClick={() => {}}
          className={cn(
            'flex items-center justify-center rounded-md',
            'w-8 h-8',
            showLabel ? 'mr-4' : '',
            iconClassName
          )}
        />
        // <div
        //   className={cn(
        //     'flex items-center justify-center rounded-md',
        //     'w-8 h-8',
        //     showLabel ? 'mr-4' : '',
        //     iconClassName
        //   )}>
        //   {icon}
        // </div>
      )}
      {showLabel && (
        <span className={cn('uppercase button-text-md', textClassName)}>
          {label}
        </span>
      )}
      {rightIcon && <div className="ml-auto mr-2">{rightIcon}</div>}
    </button>
  );
}
