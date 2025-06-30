import { Slot } from '@radix-ui/react-slot';
import { cva, type VariantProps } from 'class-variance-authority';
import Link from 'next/link';
import * as React from 'react';

import { cn } from '@/lib/utils';

const buttonVariants = cva(
  'inline-flex items-center justify-center whitespace-nowrap rounded-lg text-sm qhd:text-lg font-helvetica font-extrabold ring-offset-white transition-colors focus-visible:outline-none disabled:pointer-events-none disabled:opacity-50 dark:ring-offset-slate-950 dark:focus-visible:ring-slate-300',
  {
    variants: {
      variant: {
        primary:
          'bg-primary border border-primary hover:bg-transparent text-black hover:text-primary',
        glass:
          'bg-black/60 hover:text-white/95 hover:bg-black/40 text-white backdrop-blur-md duration-500 transition-colors',
        default:
          'bg-slate-900 text-slate-50 hover:bg-slate-900/90 dark:bg-slate-50 dark:text-slate-900 dark:hover:bg-slate-50/90',
        destructive:
          'bg-red-500 text-slate-50 hover:bg-red-500/90 dark:bg-red-900 dark:text-slate-50 dark:hover:bg-red-900/90',
        outline:
          'border border-primarygreen hover:bg-primarygreen hover:text-black text-primarygreen dark:border-slate-800 dark:bg-slate-950 dark:hover:bg-slate-800 dark:hover:text-slate-50',
        secondary:
          'bg-slate-100 text-slate-900 hover:bg-slate-100/80 dark:bg-slate-800 dark:text-slate-50 dark:hover:bg-slate-800/80',
        ghost: 'hover:bg-slate-100',
        link: 'text-slate-900 underline-offset-4 hover:underline dark:text-slate-50',
        reversePrimary: 'bg-black text-primarygreen',
      },
      size: {
        default: 'h-max py-4',
        sm: 'h-9 rounded-md px-3',
        icon: 'h-10 w-10',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  }
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
  href?: string;
  target?: '_blank' | '_self' | '_parent' | '_top'; // Added the target attribute for link behavior
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    { className, variant, size, asChild = false, href, target, ...props },
    ref
  ) => {
    const Comp = asChild ? Slot : 'button';
    return href ? (
      <Link href={href} target={target ? '_blank' : '_self'} className="w-max">
        <Comp
          className={cn(buttonVariants({ variant, size, className }))}
          ref={ref}
          {...props}
        />
      </Link>
    ) : (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    );
  }
);
Button.displayName = 'Button';

export { Button, buttonVariants };
