'use client';

import React, { useEffect, useState } from 'react';
import { cn } from '@/lib/utils';
import { MicSVG } from '../../../public/svg';

interface MicPortalProps {
  isOpen: boolean;
  isRecording: boolean;
  onClose: () => void;
  onStopRecording: () => void;
  placeholder?: string;
}

export default function MicPortal({
  isOpen,
  isRecording,
  onClose,
  onStopRecording,
  placeholder = 'What do you want to ask?',
}: MicPortalProps) {
  const [isMobile, setIsMobile] = useState(false);
  const [animateIn, setAnimateIn] = useState(false);

  // Check if the screen is mobile-sized
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };

    checkMobile();
    window.addEventListener('resize', checkMobile);

    return () => {
      window.removeEventListener('resize', checkMobile);
    };
  }, []);

  // Handle animation
  useEffect(() => {
    if (isOpen) {
      // Small delay to ensure the component is rendered before animating
      setTimeout(() => setAnimateIn(true), 10);
    } else {
      setAnimateIn(false);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div
      className={cn(
        'fixed inset-0 z-[100] flex items-center justify-center transition-opacity duration-300',
        animateIn ? 'opacity-100' : 'opacity-0'
      )}>
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/70 z-[101]" onClick={onClose} />

      {/* Modal content */}
      <div
        className={cn(
          'relative bg-black border border-white/40 transition-all duration-300 transform z-[102]',
          isMobile
            ? 'w-full h-auto mt-auto flex flex-col rounded-t-[40px] overflow-hidden'
            : 'max-w-md w-full p-6 rounded-lg',
          animateIn ? 'translate-y-0' : 'translate-y-8'
        )}>
        {isMobile ? (
          // Mobile layout - full screen portal like in wireframe
          <div className="flex flex-col">
            {/* Bottom input area */}
            <div className="">
              {/* Mic visualization */}
              <div className="bg-black py-4">
                <div className="flex items-center justify-center h-12">
                  <div className="flex items-end justify-center gap-1 h-10">
                    {Array.from({ length: 9 }).map((_, i) => (
                      <div
                        key={i}
                        className={cn(
                          'bg-white w-1 rounded-full',
                          isRecording ? 'animate-sound-wave' : 'h-2'
                        )}
                        style={{
                          height: isRecording
                            ? `${Math.random() * 16 + 4}px`
                            : undefined,
                          animationDelay: `${i * 0.1}s`,
                        }}
                      />
                    ))}
                  </div>
                </div>

                {/* Mic button */}
                <div className="flex flex-col items-center mt-4 mb-2">
                  <button
                    onClick={onStopRecording}
                    className={cn(
                      'bg-transparent border-2 border-white rounded-full w-14 h-14 flex items-center justify-center mb-2',
                      isRecording ? 'border-red-500 animate-pulse' : ''
                    )}>
                    <MicSVG
                      height={24}
                      width={24}
                      fill={isRecording ? 'red' : 'white'}
                    />
                  </button>
                  <span className="text-white text-sm">Press and hold</span>
                </div>
              </div>
            </div>
          </div>
        ) : (
          // Desktop layout - centered modal
          <div className="p-6 flex flex-col items-center">
            <h3 className="text-white text-xl font-medium mb-4">
              Voice Recording
            </h3>

            {/* Audio visualization */}
            <div className="flex items-center justify-center my-6 w-full">
              <div className="flex items-end justify-center gap-2 h-16 w-full">
                {Array.from({ length: 15 }).map((_, i) => (
                  <div
                    key={i}
                    className={cn(
                      'bg-white w-1.5 rounded-full transition-all duration-100',
                      isRecording ? 'animate-sound-wave' : 'h-2'
                    )}
                    style={{
                      height: isRecording
                        ? `${Math.random() * 24 + 4}px`
                        : undefined,
                      animationDelay: `${i * 0.1}s`,
                    }}
                  />
                ))}
              </div>
            </div>

            {/* Mic button */}
            <div className="flex flex-col items-center">
              <button
                onClick={onStopRecording}
                className={cn(
                  'bg-transparent border-2 border-white rounded-full w-16 h-16 flex items-center justify-center mb-2',
                  isRecording ? 'border-red-500 animate-pulse' : ''
                )}>
                <MicSVG
                  height={28}
                  width={28}
                  fill={isRecording ? 'red' : 'white'}
                />
              </button>
              <span className="text-white opacity-70 text-sm">
                {isRecording ? 'Tap to stop' : 'Tap to record'}
              </span>
            </div>

            {/* Cancel button */}
            <button
              onClick={onClose}
              className="mt-6 px-6 py-2 border border-white/30 rounded-lg text-white hover:bg-white/10">
              Cancel
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
