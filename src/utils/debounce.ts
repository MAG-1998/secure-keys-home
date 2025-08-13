// Debounce utility function
export function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): T & { flush: () => void } {
  let timeout: NodeJS.Timeout | null = null;
  let lastArgs: Parameters<T> | null = null;

  const debounced = ((...args: Parameters<T>) => {
    lastArgs = args;
    if (timeout) clearTimeout(timeout);
    timeout = setTimeout(() => {
      func(...lastArgs!);
      timeout = null;
      lastArgs = null;
    }, wait);
  }) as T & { flush: () => void };

  debounced.flush = () => {
    if (timeout) {
      clearTimeout(timeout);
      if (lastArgs) {
        func(...lastArgs);
      }
      timeout = null;
      lastArgs = null;
    }
  };

  return debounced;
}