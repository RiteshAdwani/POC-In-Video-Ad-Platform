import { useEffect, useRef } from 'react';

/**
 * @description Returns a ref to attach to a small marker element at the bottom of a list - once
 * it scrolls into view, `onIntersect` fires (e.g. fetchNextPage). No-ops while `enabled` is
 * false, e.g. while already fetching or once there's nothing left to load.
 */
export const useInfiniteScrollTrigger = (onIntersect: () => void, enabled: boolean) => {
  const scrollTriggerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const target = scrollTriggerRef.current;
    if (!enabled || !target) return;

    const observer = new IntersectionObserver((entries) => {
      if (entries[0].isIntersecting) {
        onIntersect();
      }
    });
    observer.observe(target);

    return () => observer.disconnect();
  }, [enabled, onIntersect]);

  return scrollTriggerRef;
};
