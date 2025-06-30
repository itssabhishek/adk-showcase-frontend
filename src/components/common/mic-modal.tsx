'use client';

import React, { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { MicSVG } from '../../../public/svg';

interface MicModalProps {
  isOpen: boolean;
  isRecording: boolean;
  onClose: () => void;
  onStopRecording: () => void;
  placeholder?: string;
}

export default function MicModal({
  isOpen,
  isRecording,
  onClose,
  onStopRecording,
  placeholder = 'What do you want to ask?',
}: MicModalProps) {
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
        'fixed inset-0 z-50 flex items-center justify-center  duration-300'
      )}>
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/70" onClick={onClose} />

      {/* Modal content */}
      <div
        className={cn(
          'relative bg-gray-800/90 rounded-lg shadow-xl transition-all duration-300 z-10',
          isMobile
            ? 'w-full h-full flex flex-col'
            : 'max-w-md w-full p-6 transform',
          animateIn ? 'translate-y-0' : 'translate-y-8'
        )}>
        {/* Mobile layout */}
        {isMobile ? (
          <div className="flex flex-col h-full">
            {/* Upper section with "events" */}
            <div className="flex-1 p-4 overflow-y-auto">
              <div className="bg-white/10 rounded-lg p-4 mb-4">
                <div className="absolute top-4 right-4 bg-white rounded-full px-3 py-1 text-sm font-medium">
                  South Korea
                </div>
                <p className="text-white mb-4">
                  Oh, here is events in South Korea you can like:
                </p>

                {/* Event cards */}
                <div className="space-y-4">
                  {[1, 2].map((item) => (
                    <div key={item} className="bg-gray-600/50 rounded-lg p-4">
                      <h3 className="text-white font-medium">Event name</h3>
                      <p className="text-gray-300 text-sm">
                        Jun 27 2023 - Jun 29 2023
                      </p>
                      <Button className="w-full bg-gray-700 hover:bg-gray-600 text-white rounded-lg mt-3">
                        Buy ticket
                      </Button>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Input area */}
            <div className="p-4 bg-gray-900">
              <div className="flex items-center mb-4 rounded-full bg-gray-800 p-2">
                <div className="w-10 h-10 bg-gray-700 rounded-full flex items-center justify-center">
                  <MicSVG height={20} width={20} fill="white" />
                </div>
                <div className="ml-2 text-white">{placeholder}</div>
                <div className="ml-auto w-8 h-8 bg-white rounded-full"></div>
              </div>

              {/* Waveform visualization */}
              <div className="flex items-center justify-center my-4">
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

              {/* Press and hold */}
              <div
                className="w-full flex justify-center items-center"
                onClick={onStopRecording}>
                <button
                  className={cn(
                    'bg-transparent border-2 border-white rounded-full flex items-center justify-center transition-all',
                    isRecording
                      ? 'w-12 h-12 text-red-500 animate-pulse'
                      : 'w-16 h-16 text-white'
                  )}>
                  <MicSVG
                    height={24}
                    width={24}
                    fill={isRecording ? 'red' : 'white'}
                  />
                </button>
                <span className="text-white text-sm absolute mt-24">
                  Press and hold
                </span>
              </div>
            </div>
          </div>
        ) : (
          /* Desktop layout - centered modal */
          <div className="p-6 flex flex-col items-center">
            <h3 className="text-white text-xl font-medium mb-4">
              Voice Recording
            </h3>

            {/* Waveform visualization */}
            <div className="flex items-center justify-center my-8 w-full">
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

            <div className="flex flex-col items-center">
              <button
                onClick={onStopRecording}
                className={cn(
                  'bg-transparent border-2 border-white rounded-full w-20 h-20 flex items-center justify-center mb-4 transition-all',
                  isRecording
                    ? 'border-red-500 text-red-500 animate-pulse'
                    : 'text-white'
                )}>
                <MicSVG
                  height={32}
                  width={32}
                  fill={isRecording ? 'red' : 'white'}
                />
              </button>
              <span className="text-white opacity-70 text-sm">
                {isRecording ? 'Tap to stop' : 'Tap to record'}
              </span>
            </div>

            <Button
              onClick={onClose}
              variant="outline"
              className="mt-8 text-white border-white/40 hover:bg-white/10">
              Cancel
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
