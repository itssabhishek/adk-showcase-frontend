import * as React from 'react';

import { cn } from '@/lib/utils';

export interface TextAreaProps
  extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  startAdornment?: React.ReactNode;
  endAdornment?: React.ReactNode;
}

const TextArea = React.forwardRef<HTMLTextAreaElement, TextAreaProps>(
  (
    { className, rows, maxLength, startAdornment, endAdornment, ...props },
    ref
  ) => {
    return (
      <div
        className={cn(
          'flex items-center flex-row flex-nowrap rounded-md border border-[#909090] focus-visible:outline-none focus-visible:ring-0 focus-visible:ring-transparent focus-visible:ring-offset-1',
          endAdornment?.toString().length > 0 ? 'pr-6' : 'pr-0',
          startAdornment?.toString().length > 0 ? 'pl-6' : 'pl-0'
        )}>
        {startAdornment}
        <textarea
          className={cn(
            'flex w-full rounded-md bg-black pt-6 px-6 text-sm qhd:text-lg ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium focus-visible:outline-none focus-visible:ring-0 focus-visible:ring-transparent focus-visible:ring-offset-0 placeholder:text-[#464646] disabled:cursor-not-allowed disabled:opacity-50 dark:border-slate-800 dark:bg-slate-950 dark:ring-offset-slate-950 dark:placeholder:text-slate-400 dark:focus-visible:ring-slate-300',
            className
          )}
          maxLength={maxLength}
          rows={rows}
          ref={ref}
          {...props}
        />
        {endAdornment}
      </div>
    );
  }
);
TextArea.displayName = 'Text Area';

export { TextArea };
