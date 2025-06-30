'use client';

import * as MenubarPrimitive from '@radix-ui/react-menubar';
import { Check, ChevronRight, Circle } from 'lucide-react';
import * as React from 'react';

import { cn } from '@/lib/utils';

const MenubarMenu = MenubarPrimitive.Menu;

const MenubarGroup = MenubarPrimitive.Group;

const MenubarPortal = MenubarPrimitive.Portal;

const MenubarSub = MenubarPrimitive.Sub;

const MenubarRadioGroup = MenubarPrimitive.RadioGroup;

type MenubarProps = React.ComponentPropsWithoutRef<
  typeof MenubarPrimitive.Root
> & {
  className?: string;
};

const Menubar = React.forwardRef<
  React.ElementRef<typeof MenubarPrimitive.Root>,
  MenubarProps
>(({ className, ...props }, ref) => (
  <MenubarPrimitive.Root
    ref={ref}
    className={cn(
      'flex w-8 qhd:w-10 h-8 qhd:h-10 items-center rounded-md border border-slate-200 bg-white p-0',
      className
    )}
    {...props}
  />
));
Menubar.displayName = MenubarPrimitive.Root.displayName;

type MenubarTriggerProps = React.ComponentPropsWithoutRef<
  typeof MenubarPrimitive.Trigger
> & {
  className?: string;
};

const MenubarTrigger = React.forwardRef<
  React.ElementRef<typeof MenubarPrimitive.Trigger>,
  MenubarTriggerProps
>(({ className, ...props }, ref) => (
  <MenubarPrimitive.Trigger
    ref={ref}
    className={cn(
      'flex cursor-pointer select-none items-center rounded-md text-sm font-medium outline-none focus:bg-slate-100 focus:text-slate-900 data-[state=open]:bg-slate-100 data-[state=open]:text-slate-900 dark:focus:bg-slate-800 dark:focus:text-slate-50 dark:data-[state=open]:bg-slate-800 dark:data-[state=open]:text-slate-50',
      className
    )}
    {...props}
  />
));
MenubarTrigger.displayName = MenubarPrimitive.Trigger.displayName;

type MenubarSubTriggerProps = React.ComponentPropsWithoutRef<
  typeof MenubarPrimitive.SubTrigger
> & {
  className?: string;
  inset?: boolean;
};

const MenubarSubTrigger = React.forwardRef<
  React.ElementRef<typeof MenubarPrimitive.SubTrigger>,
  MenubarSubTriggerProps
>(({ className, inset, children, ...props }, ref) => (
  <MenubarPrimitive.SubTrigger
    ref={ref}
    className={cn(
      'flex cursor-default select-none items-center rounded-md px-2 py-1.5 text-sm outline-none focus:bg-slate-100 focus:text-slate-900 data-[state=open]:bg-slate-100 data-[state=open]:text-slate-900 dark:focus:bg-slate-800 dark:focus:text-slate-50 dark:data-[state=open]:bg-slate-800 dark:data-[state=open]:text-slate-50',
      inset && 'pl-8',
      className
    )}
    {...props}>
    {children}
    <ChevronRight className="ml-auto h-4 w-4" />
  </MenubarPrimitive.SubTrigger>
));
MenubarSubTrigger.displayName = MenubarPrimitive.SubTrigger.displayName;

type MenubarSubContentProps = React.ComponentPropsWithoutRef<
  typeof MenubarPrimitive.SubContent
> & {
  className?: string;
};

const MenubarSubContent = React.forwardRef<
  React.ElementRef<typeof MenubarPrimitive.SubContent>,
  MenubarSubContentProps
>(({ className, ...props }, ref) => (
  <MenubarPrimitive.SubContent
    ref={ref}
    className={cn(
      'z-50 min-w-[8rem] overflow-hidden rounded-md border border-slate-200 bg-white p-1 text-slate-950 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-50',
      className
    )}
    {...props}
  />
));
MenubarSubContent.displayName = MenubarPrimitive.SubContent.displayName;

type MenubarContentProps = React.ComponentPropsWithoutRef<
  typeof MenubarPrimitive.Content
> & {
  className?: string;
  align?: 'start' | 'end';
  alignOffset?: number;
  sideOffset?: number;
};

const MenubarContent = React.forwardRef<
  React.ElementRef<typeof MenubarPrimitive.Content>,
  MenubarContentProps
>(
  (
    { className, align = 'start', alignOffset = -4, sideOffset = 8, ...props },
    ref
  ) => (
    <MenubarPrimitive.Portal>
      <MenubarPrimitive.Content
        ref={ref}
        align={align}
        alignOffset={alignOffset}
        sideOffset={sideOffset}
        className={cn(
          'z-[60] min-w-56 space-y-2 overflow-hidden rounded-md bg-black/50 backdrop-blur-md p-1 text-white font-helvetica font-medium shadow-md ring-1 ring-black/5 data-[state=open]:animate-in data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-50',
          className
        )}
        {...props}
      />
    </MenubarPrimitive.Portal>
  )
);
MenubarContent.displayName = MenubarPrimitive.Content.displayName;

type MenubarItemProps = React.ComponentPropsWithoutRef<
  typeof MenubarPrimitive.Item
> & {
  className?: string;
  inset?: boolean;
};

const MenubarItem = React.forwardRef<
  React.ElementRef<typeof MenubarPrimitive.Item>,
  MenubarItemProps
>(({ className, inset, ...props }, ref) => (
  <MenubarPrimitive.Item
    ref={ref}
    className={cn(
      'relative flex cursor-pointer select-none items-center gap-2 rounded-md px-2 py-1.5 text-sm outline-none text-white focus:bg-gray-300/20 focus:text-primarygreen data-[disabled]:pointer-events-none data-[disabled]:opacity-50',
      inset && 'pl-8',
      className
    )}
    {...props}
  />
));
MenubarItem.displayName = MenubarPrimitive.Item.displayName;

type MenubarCheckboxItemProps = React.ComponentPropsWithoutRef<
  typeof MenubarPrimitive.CheckboxItem
> & {
  className?: string;
  checked: boolean;
};

const MenubarCheckboxItem = React.forwardRef<
  React.ElementRef<typeof MenubarPrimitive.CheckboxItem>,
  MenubarCheckboxItemProps
>(({ className, children, checked, ...props }, ref) => (
  <MenubarPrimitive.CheckboxItem
    ref={ref}
    className={cn(
      'relative flex cursor-default select-none items-center rounded-sm py-1.5 pl-8 pr-2 text-sm outline-none focus:bg-slate-100 focus:text-slate-900 data-[disabled]:pointer-events-none data-[disabled]:opacity-50 dark:focus:bg-slate-800 dark:focus:text-slate-50',
      className
    )}
    checked={checked}
    {...props}>
    <span className="absolute left-2 flex h-3.5 w-3.5 items-center justify-center">
      <MenubarPrimitive.ItemIndicator>
        <Check className="h-4 w-4" />
      </MenubarPrimitive.ItemIndicator>
    </span>
    {children}
  </MenubarPrimitive.CheckboxItem>
));
MenubarCheckboxItem.displayName = MenubarPrimitive.CheckboxItem.displayName;

type MenubarRadioItemProps = React.ComponentPropsWithoutRef<
  typeof MenubarPrimitive.RadioItem
> & {
  className?: string;
};

const MenubarRadioItem = React.forwardRef<
  React.ElementRef<typeof MenubarPrimitive.RadioItem>,
  MenubarRadioItemProps
>(({ className, children, ...props }, ref) => (
  <MenubarPrimitive.RadioItem
    ref={ref}
    className={cn(
      'relative flex cursor-default select-none items-center rounded-sm py-1.5 pl-8 pr-2 text-sm outline-none focus:bg-slate-100 focus:text-slate-900 data-[disabled]:pointer-events-none data-[disabled]:opacity-50 dark:focus:bg-slate-800 dark:focus:text-slate-50',
      className
    )}
    {...props}>
    <span className="absolute left-2 flex h-3.5 w-3.5 items-center justify-center">
      <MenubarPrimitive.ItemIndicator>
        <Circle className="h-2 w-2 fill-current" />
      </MenubarPrimitive.ItemIndicator>
    </span>
    {children}
  </MenubarPrimitive.RadioItem>
));
MenubarRadioItem.displayName = MenubarPrimitive.RadioItem.displayName;

type MenubarLabelProps = React.ComponentPropsWithoutRef<
  typeof MenubarPrimitive.Label
> & {
  className?: string;
  inset?: boolean;
};

const MenubarLabel = React.forwardRef<
  React.ElementRef<typeof MenubarPrimitive.Label>,
  MenubarLabelProps
>(({ className, inset, ...props }, ref) => (
  <MenubarPrimitive.Label
    ref={ref}
    className={cn(
      'px-2 py-1.5 text-sm font-semibold',
      inset && 'pl-8',
      className
    )}
    {...props}
  />
));
MenubarLabel.displayName = MenubarPrimitive.Label.displayName;

type MenubarSeparatorProps = React.ComponentPropsWithoutRef<
  typeof MenubarPrimitive.Separator
> & {
  className?: string;
};

const MenubarSeparator = React.forwardRef<
  React.ElementRef<typeof MenubarPrimitive.Separator>,
  MenubarSeparatorProps
>(({ className, ...props }, ref) => (
  <MenubarPrimitive.Separator
    ref={ref}
    className={cn(
      '-mx-1 my-1 h-px bg-primarygreen dark:bg-slate-800',
      className
    )}
    {...props}
  />
));
MenubarSeparator.displayName = MenubarPrimitive.Separator.displayName;

type MenubarShortcutProps = React.HTMLAttributes<HTMLSpanElement> & {
  className?: string;
};

const MenubarShortcut = ({ className, ...props }: MenubarShortcutProps) => (
  <span
    className={cn(
      'ml-auto text-xs tracking-widest text-slate-500 dark:text-slate-400',
      className
    )}
    {...props}
  />
);
MenubarShortcut.displayname = 'MenubarShortcut';

export {
  Menubar,
  MenubarCheckboxItem,
  MenubarContent,
  MenubarGroup,
  MenubarItem,
  MenubarLabel,
  MenubarMenu,
  MenubarPortal,
  MenubarRadioGroup,
  MenubarRadioItem,
  MenubarSeparator,
  MenubarShortcut,
  MenubarSub,
  MenubarSubContent,
  MenubarSubTrigger,
  MenubarTrigger,
};
