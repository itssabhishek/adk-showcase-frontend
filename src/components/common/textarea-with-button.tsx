'use client';

import React, { ChangeEvent, KeyboardEvent, useEffect } from 'react';
import { cn } from '@/lib/utils';
import { SendSVG } from '../../../public/svg';

interface TextareaWithButtonProps {
  placeholder: string;
  value: string;
  onChange: (event: ChangeEvent<HTMLTextAreaElement>) => void;
  buttonText: string;
  onButtonClick: () => void;
  className?: string;
  containerClassName?: string;
  icon?: React.ReactNode;
}

/**
 * A reusable component for a styled textarea with
 * a floating button in the top-right corner.
 */
export default function TextareaWithButton({
  placeholder,
  value,
  onChange,
  buttonText,
  onButtonClick,
  className = '',
  containerClassName,
  icon = <SendSVG />,
}: TextareaWithButtonProps) {
  const textareaRef = React.useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      const newHeight = Math.min(textareaRef.current.scrollHeight, 100);
      textareaRef.current.style.height = `${newHeight}px`;
    }
  }, [value]);

  const handleKeyDown = (event: KeyboardEvent<HTMLTextAreaElement>) => {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      onButtonClick();
      resetTextareaHeight();
    }
  };

  const resetTextareaHeight = () => {
    if (textareaRef.current) {
      textareaRef.current.style.height = '40px';
    }
  };

  const handleButtonClick = () => {
    onButtonClick();
    resetTextareaHeight();
  };

  return (
    <div
      className={cn(
        'relative w-full flex flex-row items-start min-h-[50px] bg-white/10 rounded-[80px]',
        containerClassName
      )}>
      <textarea
        ref={textareaRef}
        className={cn(
          'w-full p-1 bg-transparent text-white  text-sm font-geist placeholder:font-geist placeholder:text-sm placeholder:text-muted rounded resize-none leading-snug focus:outline-none',
          className
        )}
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        onKeyDown={handleKeyDown}
        style={
          {
            // minHeight: '50px',
            // height: 'auto',
            // maxHeight: '120px',
          }
        }
        rows={1}
        onInput={(e) => {
          const target = e.target as HTMLTextAreaElement;
          target.style.height = 'auto';
          const newHeight = Math.min(target.scrollHeight, 100);
          target.style.height = `${newHeight}px`;
        }}
      />
    </div>
  );
}
