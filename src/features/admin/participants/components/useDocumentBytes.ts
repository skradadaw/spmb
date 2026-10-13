'use client';

import { useEffect, useState } from 'react';
import { documentFetchHref } from '../documentVersion';

type Loaded = {
  key: string;
  state: 'loading' | 'ready' | 'error';
  /** Download percentage, or null while the size is unknown. */
  progress: number | null;
  size: number | null;
  objectUrl: string | null;
  data: Uint8Array | null;
};

/**
 * Downloads a document with progress. A normal (cacheable) fetch, so a file the detail page already
 * prefetched, or one opened before, comes straight from the browser cache.
 */
export function useDocumentBytes(href: string) {
  const [attempt, setAttempt] = useState(0);
  const key = `${href}#${attempt}`;
  const [loaded, setLoaded] = useState<Loaded | null>(null);

  useEffect(() => {
    const controller = new AbortController();
    let objectUrl: string | null = null;
    const update = (value: Omit<Loaded, 'key'>) => setLoaded({ key, ...value });

    void (async () => {
      try {
        const response = await fetch(documentFetchHref(href), { credentials: 'same-origin', signal: controller.signal });
        if (!response.ok || !response.body) throw new Error('Berkas tidak dapat dimuat');
        const total = Number(response.headers.get('content-length')) || null;
        const reader = response.body.getReader();
        const chunks: Uint8Array[] = [];
        let received = 0;
        let lastPercent = -1;
        for (;;) {
          const { done, value } = await reader.read();
          if (done) break;
          chunks.push(value);
          received += value.byteLength;
          const percent = total ? Math.min(99, Math.floor((received / total) * 100)) : null;
          if (percent !== null && percent !== lastPercent) {
            lastPercent = percent;
            update({ state: 'loading', progress: percent, size: total, objectUrl: null, data: null });
          }
        }
        const type = response.headers.get('content-type') ?? '';
        const blob = new Blob(chunks as BlobPart[], { type });
        if (type.startsWith('image/')) {
          objectUrl = URL.createObjectURL(blob);
          update({ state: 'ready', progress: 100, size: blob.size, objectUrl, data: null });
        } else {
          update({ state: 'ready', progress: 100, size: blob.size, objectUrl: null, data: new Uint8Array(await blob.arrayBuffer()) });
        }
      } catch {
        if (!controller.signal.aborted) update({ state: 'error', progress: null, size: null, objectUrl: null, data: null });
      }
    })();

    return () => {
      controller.abort();
      if (objectUrl) URL.revokeObjectURL(objectUrl);
    };
  }, [href, key]);

  // Until this href/attempt reports anything, it is loading; stale results of another file never show.
  const current = loaded?.key === key ? loaded : null;
  return {
    state: current?.state ?? 'loading',
    progress: current?.progress ?? null,
    size: current?.size ?? null,
    objectUrl: current?.objectUrl ?? null,
    data: current?.data ?? null,
    retry: () => setAttempt(value => value + 1),
  };
}
