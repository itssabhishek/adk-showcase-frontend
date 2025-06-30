'use client';

import * as DialogPrimitive from '@radix-ui/react-dialog';
import { cva, type VariantProps } from 'class-variance-authority';
import { X } from 'lucide-react';
import * as React from 'react';

import { IconTextButton } from '@/components/buttons/icon-text-button';
import { cn } from '@/lib/utils';

import { CloseButton } from '../dialog/dialog.provider';

const Dialog = DialogPrimitive.Root;

const DialogTrigger = DialogPrimitive.Trigger;

const DialogPortal = DialogPrimitive.Portal;

const DialogClose = DialogPrimitive.Close;

const DialogOverlay = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Overlay>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Overlay> & {
    className?: string;
  }
>(({ className, ...props }, ref) => {
  // const currentActiveSlider = useTuningSliderStateStore(
  //   (state) => state.currentActiveSlider
  // );
  return (
    <DialogPrimitive.Overlay
      ref={ref}
      className={cn(
        'fixed inset-0 z-50 bg-black/70 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0',
        className
        // currentActiveSlider ? 'max-lg:bg-transparent' : ''
      )}
      {...props}
    />
  );
});
DialogOverlay.displayName = DialogPrimitive.Overlay.displayName;

const dialogVariants = cva(
  'fixed left-[50%] z-50 translate-x-[-50%]  duration-200 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[state=closed]:slide-out-to-left-1/2 data-[state=closed]:slide-out-to-top-[48%] data-[state=open]:slide-in-from-left-1/2 data-[state=open]:slide-in-from-top-[48%] w-[500px] bg-black/80 rounded-lg border border-lightWhite p-6 pt-[14px] flex  justify-between items-center  flex-col',
  {
    variants: {
      // variant: {
      //   default:
      //     'border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-950 shadow-lg ',
      //   dark: 'bg-black shadow-lg',
      //   ghost: '',
      //   glass:
      //     'bg-lightWhite backdrop-blur-lg p-6 text-left align-middle shadow-xl transition-all shadow-lg',
      // },
      size: {
        default: 'w-full max-w-lg',
        full: 'w-full',
        max: 'w-max',
        xl: 'w-full max-w-[85vw] sm:max-w-sm md:max-w-xl',
        md: 'w-full max-w-[85vw] sm:max-w-sm md:max-w-md',
        sm: 'w-full max-w-[85vw] sm:max-w-sm',
      },
      position: {
        top: 'top-10',
        center: 'top-1/2 -translate-y-1/2',
        bottom: 'bottom-2.5',
      },
    },
    defaultVariants: {
      // variant: 'default',
      size: 'default',
      position: 'center',
    },
  }
);

const dialogCloseButtonVariants = cva(
  'flex absolute justify-center items-center z-50 rounded-full transition-opacity hover:opacity-100 focus:outline-none p-1 disabled:pointer-events-none duration-500',
  {
    variants: {
      variant: {
        ghost: '',
        primary: 'text-primarygreen',
        glass:
          'bg-black/60 hover:text-white/95 hover:bg-black/5 backdrop-blur-md data-[state=open]:bg-slate-100 data-[state=open]:text-white text-white',
      },
      size: {
        default: '',
        sm: 'w-6 h-6 p-0 aspect-squeare',
      },
      position: {
        start: 'left-4 top-3',
        end: 'right-4 top-3',
      },
    },
    defaultVariants: {
      variant: 'glass',
      size: 'default',
      position: 'end',
    },
  }
);

export interface DialogContentProps
  extends React.ComponentPropsWithoutRef<typeof DialogPrimitive.Content>,
    VariantProps<typeof dialogVariants> {
  position?: 'top' | 'center' | 'bottom';
  closeButton?: CloseButton;
  overlayClassName?: string;
}

const DialogCloseButton = ({
  size,
  position,
  variant,
  className,
}: {
  size: 'default' | 'sm';
  position: 'end' | 'start';
  variant: 'ghost' | 'glass' | 'primary';
  className: string;
}) => (
  <DialogPrimitive.Close
    className={cn(
      dialogCloseButtonVariants({
        size,
        position,
        variant,
        className,
      })
    )}>
    <X className="h-4 w-4" />
    <span className="sr-only">Close</span>
  </DialogPrimitive.Close>
);

const DialogContent = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Content>,
  DialogContentProps
>(
  (
    {
      overlayClassName,
      className,
      // variant,
      size,
      children,
      closeButton,
      position,
      ...props
    },
    ref
  ) => (
    <DialogPortal>
      <DialogOverlay className={overlayClassName} />
      <DialogPrimitive.Content
        ref={ref}
        // data-variant={variant}
        className={cn(
          dialogVariants({
            // variant,
            size,
            className,
            position,
          })
        )}
        {...props}>
        {children}
        {closeButton?.visible ? (
          <DialogCloseButton
            className={closeButton.className}
            position={closeButton.position}
            size={closeButton.size}
            variant={closeButton.variant}
          />
        ) : null}
      </DialogPrimitive.Content>
    </DialogPortal>
  )
);
DialogContent.displayName = DialogPrimitive.Content.displayName;

const DialogHeader = ({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement> & { className?: string }) => (
  <div
    className={cn(
      'flex flex-col space-y-1.5 text-center sm:text-left',
      className
    )}
    {...props}
  />
);
DialogHeader.displayName = 'DialogHeader';

const DialogFooter = ({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement> & { className?: string }) => (
  <div
    className={cn(
      'w-full flex flex-col-reverse sm:flex-row sm:justify-end sm:space-x-2',
      className
    )}
    {...props}
  />
);
DialogFooter.displayName = 'DialogFooter';

const DialogTitle = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Title>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Title> & {
    className?: string;
  }
>(({ className, ...props }, ref) => (
  <DialogPrimitive.Title
    ref={ref}
    className={cn(
      'font-geist scroll-m-20 text-base font-semibold tracking-tight',
      className
    )}
    {...props}
  />
));
DialogTitle.displayName = DialogPrimitive.Title.displayName;

const DialogDescription = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Description>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Description> & {
    className?: string;
  }
>(({ className, ...props }, ref) => (
  <DialogPrimitive.Description
    ref={ref}
    className={cn(
      'font-geist scroll-m-20  font-normal tracking-tight text-muted text-xs',
      className
    )}
    {...props}
  />
));
DialogDescription.displayName = DialogPrimitive.Description.displayName;

export {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogOverlay,
  DialogPortal,
  DialogTitle,
  DialogTrigger,
};
