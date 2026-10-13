'use client';

import { useEffect, useRef, useState, type ReactNode } from 'react';

const GAP = 16;

/**
 * Sticky column without its own scrollbar. When it is taller than the window it scrolls with the
 * page until its bottom is visible, then stays put, so its lower cards never wait for the left column.
 */
export function StickyAside({ children, className = '' }: { children: ReactNode; className?: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const [top, setTop] = useState(GAP);

  useEffect(() => {
    const element = ref.current;
    if (!element) return;
    const update = () => setTop(Math.min(GAP, window.innerHeight - element.offsetHeight - GAP));
    update();
    window.addEventListener('resize', update);
    const observer = typeof ResizeObserver === 'undefined' ? null : new ResizeObserver(update);
    observer?.observe(element);
    return () => {
      window.removeEventListener('resize', update);
      observer?.disconnect();
    };
  }, []);

  return (
    <div ref={ref} data-detail-aside style={{ ['--aside-top' as string]: `${top}px` }} className={`xl:sticky xl:top-(--aside-top) ${className}`}>
      {children}
    </div>
  );
}
