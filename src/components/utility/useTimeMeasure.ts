import { useCallback, useRef } from 'react';

export default function useTimeMeasure() {
  const startTimeRef = useRef(null);
  const endTimeRef = useRef(null);
  const timeDeltaRef = useRef(null);

  const startTimer = useCallback(() => {
    startTimeRef.current = performance.now();
    // Reset endTime to ensure it's not affecting new measurements
    endTimeRef.current = null;
  }, []);

  const stopTimer = useCallback(() => {
    endTimeRef.current = performance.now();
    if (startTimeRef.current !== null) {
      timeDeltaRef.current = endTimeRef.current - startTimeRef.current;
    }
  }, []);

  // Function to retrieve the latest time delta
  const getLatestTimeDelta = useCallback(() => {
    return timeDeltaRef.current; // This will always be up-to-date
  }, []);

  return { startTimer, stopTimer, getLatestTimeDelta };
}
