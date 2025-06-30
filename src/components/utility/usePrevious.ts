import { useEffect, useRef } from 'react';

/**
 * Returns the previous value of a given value.
 * @param value - The current value.
 * @returns The previous value.
 */
export default function usePrevious(value: unknown) {
  const ref = useRef<unknown>(value);

  useEffect(() => {
    ref.current = value;
  }, [value]);

  return ref.current;
}
