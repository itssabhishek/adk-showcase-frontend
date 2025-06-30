import { ChevronDown, ChevronRight, ChevronUp } from 'lucide-react';
import React from 'react';

import { cn } from '@/lib/utils';

import { IconTextButton } from './icon-text-button';

type SubNavItem = {
  id: string;
  label: string;
};

type IconTextButtonItem = {
  id: string;
  label: string;
  icon?: React.ReactNode;
  subItems?: SubNavItem[];
  isOpen?: boolean;
};

type IconTextButtonGroupProps = {
  items: IconTextButtonItem[];
  activeItem?: string;
  activeSubItem?: string;
  onItemClick?: (id: string) => void;
  onSubItemClick?: (value: string) => void;
  onToggleDropdown?: (itemId: string) => void;
  direction?: 'vertical' | 'horizontal';
  className?: string;
  iconClassName?: string;
  buttonClassName?: string;
  textClassName?: string;
  showLabel?: boolean;
};

export function IconTextButtonGroup({
  items,
  activeItem,
  activeSubItem,
  onItemClick,
  onSubItemClick,
  onToggleDropdown,
  direction = 'vertical',
  className,
  iconClassName,
  buttonClassName,
  textClassName,
  showLabel = true,
}: IconTextButtonGroupProps) {
  return (
    <div
      className={cn(
        'flex',
        direction === 'vertical' ? 'flex-col' : 'flex-row',
        className
      )}>
      {items.map((item) => (
        <div key={item.id} className="relative">
          <div className="flex items-center justify-between gap-x-2.5 w-full group hover:cursor-pointer">
            <div
              className={`h-[18px] w-[2px] bg-primary opacity-0 group-hover:opacity-100 transition-opacity ${item.id === activeItem ? 'opacity-100' : ''} transition-colors `}></div>

            <IconTextButton
              label={item.label}
              icon={item.icon}
              isActive={item.id === activeItem}
              onClick={() => {
                if (item.subItems?.length) {
                  onToggleDropdown?.(item.id);
                  onItemClick?.(item.id);
                } else {
                  onSubItemClick?.(null);
                  onItemClick?.(item.id);
                }
              }}
              textClassName={textClassName}
              iconClassName={iconClassName}
              className={cn(buttonClassName, 'w-full group-hover:text-primary')}
              rightIcon={
                showLabel && item.subItems?.length ? (
                  item.isOpen ? (
                    <ChevronDown size={20} />
                  ) : (
                    <ChevronRight size={20} />
                  )
                ) : null
              }
              showLabel={showLabel}
            />
            <div className={`w-[2px]  `}></div>
          </div>

          {item.subItems && item.isOpen && (
            <div className="ml-14 mt-4 space-y-2">
              {item.subItems.map((subItem) => (
                <IconTextButton
                  key={subItem.id}
                  label={subItem.label}
                  className={'ml-0.5 bg-transparent hover:bg-muted text-xs'}
                  isActive={activeSubItem === subItem.id}
                  onClick={() => {
                    onSubItemClick?.(subItem.id);
                    onItemClick?.(item.id);
                  }}
                  showLabel={true}
                />
              ))}
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
