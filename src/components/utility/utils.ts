/**
 * Creates a debounced version of a function that delays its execution until after a specified wait time has elapsed.
 * @param func The function to debounce.
 * @param wait The number of milliseconds to wait before executing the debounced function.
 * @returns A debounced version of the original function.
 */
function debounce<F extends (...args: unknown[]) => unknown>(
  func: F,
  wait: number
): (...args: Parameters<F>) => void {
  let timeout: ReturnType<typeof setTimeout> | null = null;

  return (...args: Parameters<F>) => {
    if (timeout !== null) {
      clearTimeout(timeout);
    }
    timeout = setTimeout(() => func(...args), wait);
  };
}

const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

function randomElement<T>(array: T[]): T {
  return array[Math.floor(Math.random() * array.length)];
}

export { debounce, delay, randomElement };
