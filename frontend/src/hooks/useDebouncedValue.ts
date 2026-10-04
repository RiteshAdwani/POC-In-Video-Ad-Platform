import { useEffect, useState } from 'react';

/**
 * @description Returns `value`, but only after it's stopped changing for `delayMs` - for typed
 * search input, so each keystroke doesn't trigger its own request.
 */
export const useDebouncedValue = <T>(value: T, delayMs: number): T => {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    const timeoutId = setTimeout(() => setDebouncedValue(value), delayMs);
    return () => clearTimeout(timeoutId);
  }, [value, delayMs]);

  return debouncedValue;
};
