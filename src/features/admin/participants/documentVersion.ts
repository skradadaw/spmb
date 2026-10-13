const REPLACEMENT_SUFFIX = /-r(\d{10,16})\.[a-z]+$/i;

/** Cache key for a document's current file: the Berkas Pengganti timestamp, or "o" for the registration upload. */
export function documentVersion(path: string) {
  return path.match(REPLACEMENT_SUFFIX)?.[1] ?? 'o';
}

/** When an admin replaced the file, read from the Berkas Pengganti path; null for the registration upload. */
export function documentReplacedAt(path: string) {
  const timestamp = path.match(REPLACEMENT_SUFFIX)?.[1];
  return timestamp ? new Date(Number(timestamp)).toISOString() : null;
}

/**
 * URL the viewer and prefetch download from. PDFs use the `preview=pdfjs` variant, served as plain text
 * without Content-Disposition, so download managers such as IDM do not grab the file and start a download.
 */
export function documentFetchHref(href: string) {
  const url = new URL(href, 'http://localhost');
  if (url.searchParams.get('contentType') !== 'application/pdf') return href;
  url.searchParams.set('preview', 'pdfjs');
  // New cache key: browsers may still hold the earlier binary-typed copy of this URL for up to an hour.
  url.searchParams.set('as', 'text');
  return `${url.pathname}${url.search}`;
}
