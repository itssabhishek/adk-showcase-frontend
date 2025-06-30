'use client';

import React, { CSSProperties, useEffect, useRef } from 'react';

import { Bubble } from '@/store/useBubbleStore';

interface BubbleDivProps {
  bubble: Bubble;
  onRemove: () => void;
  style?: CSSProperties;
}

const BubbleDiv: React.FC<BubbleDivProps> = React.memo(
  // eslint-disable-next-line react/prop-types
  ({ bubble, onRemove, style }) => {
    const divRef = useRef<HTMLDivElement>(null);
    const duration = 10000;

    useEffect(() => {
      if (divRef.current) {
        divRef.current.style.opacity = '1';
        divRef.current.style.transition = `opacity 1s ease`;

        const fadeOutTimeout = setTimeout(() => {
          if (divRef.current) {
            divRef.current.style.opacity = '0';
          }
        }, duration - 1000);

        const removeTimeout = setTimeout(() => {
          onRemove();
        }, duration);

        return () => {
          clearTimeout(fadeOutTimeout);
          clearTimeout(removeTimeout);
        };
      }
    }, [onRemove, duration]);

    return (
      <div
        ref={divRef}
        style={{
          ...style,
          opacity: 1,
          transition: 'opacity 1s ease',
        }}>
        {/* eslint-disable-next-line react/prop-types */}
        {bubble.content}
      </div>
    );
  },
  (prevProps, nextProps) => {
    return (
      prevProps.bubble.id === nextProps.bubble.id &&
      prevProps.bubble.content === nextProps.bubble.content &&
      JSON.stringify(prevProps.style) === JSON.stringify(nextProps.style)
    );
  }
);

BubbleDiv.displayName = 'BubbleDiv';

export { BubbleDiv };
