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
