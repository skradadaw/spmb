import { PARTICIPANT_FILTER_STATUSES } from './contracts';

/** Status yang dapat diekspor; Menunggu Unggahan belum dianggap mendaftar sehingga tidak pernah ikut. */
export const PARTICIPANT_EXPORT_STATUSES: readonly string[] = PARTICIPANT_FILTER_STATUSES;
const EXPORT_PATH = '/admin/pendaftar/ekspor';

/** Tanpa `status` berarti semua pendaftar; status yang tidak dikenal membuat permintaan ditolak (null). */
export function parseExportStatuses(params: URLSearchParams): string[] | null {
  const requested = params.getAll('status').map(status => status.trim());
  if (!requested.length) return [...PARTICIPANT_EXPORT_STATUSES];
  if (requested.some(status => !PARTICIPANT_EXPORT_STATUSES.includes(status))) return null;
  return PARTICIPANT_EXPORT_STATUSES.filter(status => requested.includes(status));
}

export const isAllExportStatuses = (statuses: readonly string[]) => PARTICIPANT_EXPORT_STATUSES.every(status => statuses.includes(status));

export function participantExportHref(statuses: readonly string[]) {
  if (isAllExportStatuses(statuses)) return EXPORT_PATH;
  const params = new URLSearchParams();
  for (const status of PARTICIPANT_EXPORT_STATUSES) if (statuses.includes(status)) params.append('status', status);
  return `${EXPORT_PATH}?${params}`;
}

export function participantExportFilename(statuses: readonly string[], date: string) {
  const scope = isAllExportStatuses(statuses) ? 'semua' : statuses.length === 1 ? statuses[0].toLowerCase().replace(/\s+/g, '-') : `${statuses.length}-status`;
  return `data-pendaftar-${scope}-${date}.xlsx`;
}
