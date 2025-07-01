import * as React from 'react';

import { cn } from '@/lib/utils';

export interface InputProps
  extends React.InputHTMLAttributes<HTMLInputElement | HTMLTextAreaElement> {
  startAdornment?: React.ReactNode;
  endAdornment?: React.ReactNode;
  containerClassName?: string;
  multiline?: boolean;
  rows?: number;
  maxRows?: number;
}

const Input = React.forwardRef<
  HTMLInputElement | HTMLTextAreaElement,
  InputProps
>(
  (
    {
      className,
      type,
      startAdornment,
      endAdornment,
      containerClassName,
      multiline = false,
      rows = 1,
      maxRows = 3,
      ...props
    },
    ref
  ) => {
    const textareaRef = React.useRef<HTMLTextAreaElement>(null);
    const inputRef = React.useRef<HTMLInputElement>(null);
    const combinedRef = React.useMemo(() => {
      if (ref) {
        return ref;
      }
      return multiline ? textareaRef : inputRef;
    }, [ref, multiline]);

    const handleTextareaInput = (e: React.FormEvent<HTMLTextAreaElement>) => {
      const target = e.target as HTMLTextAreaElement;
      target.style.height = 'auto';
      const maxHeight = maxRows * 40; // Approximate line height
      const newHeight = Math.min(target.scrollHeight, maxHeight);
      target.style.height = `${newHeight}px`;
    };

    const resetHeight = () => {
      if (multiline && textareaRef.current) {
        textareaRef.current.style.height = '40px';
      }
    };

    const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
      if (e.key === 'Enter' && !e.shiftKey && props.onKeyDown) {
        props.onKeyDown(e);
        resetHeight();
      }
    };

    const commonClassNames = cn(
      'flex w-full bg-black px-6 text-sm font-helvetica text-white qhd:text-lg ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium focus-visible:outline-none focus-visible:ring-0 focus-visible:ring-transparent focus-visible:ring-offset-0 placeholder:text-white/40 disabled:cursor-not-allowed disabled:opacity-50 dark:border-slate-800 dark:bg-slate-950 dark:ring-offset-slate-950 dark:placeholder:text-slate-400 dark:focus-visible:ring-slate-300',
      className
    );

    return (
      <div
        className={cn(
          'flex items-center flex-row flex-nowrap rounded-md border border-lightWhite focus-visible:border-primary',
          endAdornment?.toString().length > 0 ? 'pr-6' : 'pr-0',
          startAdornment?.toString().length > 0 ? 'pl-6' : 'pl-0',
          containerClassName
        )}>
        {startAdornment}
        {multiline ? (
          <textarea
            className={cn(
              commonClassNames,
              'resize-none min-h-[56px] qhd:min-h-[64px] py-4 rounded-md'
            )}
            rows={rows}
            ref={textareaRef as React.RefObject<HTMLTextAreaElement>}
            onInput={handleTextareaInput}
            onKeyDown={handleKeyDown}
            style={{
              minHeight: '40px',
              height: 'auto',
              maxHeight: `${maxRows * 40}px`,
            }}
            {...(props as React.TextareaHTMLAttributes<HTMLTextAreaElement>)}
          />
        ) : (
          <input
            type={type}
            className={cn(commonClassNames, 'h-[56px] qhd:h-[64px] rounded-md')}
            ref={inputRef as React.RefObject<HTMLInputElement>}
            {...(props as React.InputHTMLAttributes<HTMLInputElement>)}
          />
        )}
        {endAdornment}
      </div>
    );
  }
);

Input.displayName = 'Input';

export { Input };
