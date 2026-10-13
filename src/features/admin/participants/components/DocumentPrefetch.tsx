'use client';

import { useEffect } from 'react';

/** Warms the browser cache with every uploaded document so "Lihat" opens instantly. */
export function DocumentPrefetch({ hrefs }: { hrefs: string[] }) {
  const key = hrefs.join('\n');
  useEffect(() => {
    const controller = new AbortController();
    for (const href of key.split('\n').filter(Boolean)) {
      fetch(href, { credentials: 'same-origin', signal: controller.signal, priority: 'low' } as RequestInit)
        .then(response => (response.ok ? response.blob() : null))
        .catch(() => null);
    }
    return () => controller.abort();
  }, [key]);
  return null;
}
