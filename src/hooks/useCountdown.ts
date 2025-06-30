'use client';
import { useCallback, useEffect, useRef, useState } from 'react';

interface CountdownOptions {
  countStart: number;
  intervalMs?: number;
}

interface CountdownControls {
  startCountdown: () => void;
  stopCountdown: () => void;
  resetCountdown: () => void;
}

/**
 * A custom React hook for managing a countdown timer. It provides the current countdown value and control methods to start, stop, and reset the countdown.
 *
 * @param {CountdownOptions} options An object that contains configuration for the countdown. It includes:
 *   - countStart: The starting value of the countdown.
 *   - intervalMs: Interval in milliseconds at which the countdown decrements (default is 1000 milliseconds).
 * @return {[number, CountdownControls]} Returns a tuple where the first element is the current countdown value as a number. The second element is an object containing control methods (`startCountdown`, `stopCountdown`, `resetCountdown`) for managing the countdown state.
 */
export function useCountdown(
  options: CountdownOptions
): [number, CountdownControls] {
  const { countStart, intervalMs = 1000 } = options;
  const [count, setCount] = useState<number>(countStart);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  const stopCountdown = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  }, []);

  const startCountdown = useCallback(() => {
    if (intervalRef.current === null) {
      intervalRef.current = setInterval(() => {
        setCount((currentCount) => {
          if (currentCount <= 0) {
            stopCountdown();
            return 0;
          }
          return currentCount - 1;
        });
      }, intervalMs);
    }
  }, [intervalMs, stopCountdown]);

  const resetCountdown = useCallback(() => {
    stopCountdown();
    setCount(countStart);
  }, [countStart, stopCountdown]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      stopCountdown();
    };
  }, [stopCountdown]);

  return [
    count,
    {
      startCountdown,
      stopCountdown,
      resetCountdown,
    },
  ];
}
