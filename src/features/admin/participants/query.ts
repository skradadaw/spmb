import { parseOkbWave } from '@/features/admin/okbWave';
import { ANNOUNCEMENT_FILTERS, ATTENTION_FILTERS, PARTICIPANT_CLASS_FILTERS, PARTICIPANT_DEFAULT_STATUSES, PARTICIPANT_PAGE_SIZE, PARTICIPANT_PAGE_SIZES, type AnnouncementFilter, type AttentionFilter, type ParticipantListQuery, isPaymentMethod } from './contracts';
const MAX_SEARCH_LENGTH = 100;
const allowed = (value: string | null, values: readonly string[]) => value && values.includes(value) ? value : null;
export function escapeSearch(value: string) { return value.replace(/[\\%_]/g, (char) => `\\${char}`); }
export function parseParticipantListQuery(params: URLSearchParams, statuses: readonly string[] = PARTICIPANT_DEFAULT_STATUSES): ParticipantListQuery {
  const rawPage = params.get('page') ?? '1';
  const numericPage = /^\d+$/.test(rawPage) ? Number(rawPage) : 1;
  const pageSize = Number(params.get('per'));
  return { search: (params.get('q') ?? '').trim().slice(0, MAX_SEARCH_LENGTH), classFilter: allowed(params.get('kelas'), PARTICIPANT_CLASS_FILTERS), statusFilter: allowed(params.get('status')?.trim() ?? null, statuses), attentionFilter: allowed(params.get('perhatian'), Object.keys(ATTENTION_FILTERS)) as AttentionFilter | null, okbMissed: params.get('okb') === 'terlewat', waveFilter: parseOkbWave(params.get('gelombang')), announcementFilter: allowed(params.get('pengumuman'), Object.keys(ANNOUNCEMENT_FILTERS)) as AnnouncementFilter | null, paymentFilter: isPaymentMethod(params.get('bayar')) ? params.get('bayar') as ParticipantListQuery['paymentFilter'] : null, page: Number.isSafeInteger(numericPage) && numericPage > 0 ? numericPage : 1, pageSize: (PARTICIPANT_PAGE_SIZES as readonly number[]).includes(pageSize) ? pageSize : PARTICIPANT_PAGE_SIZE };
}
export function participantListHref(query: ParticipantListQuery, page = 1) { const p = new URLSearchParams(); if (query.search) p.set('q', query.search); if (query.classFilter) p.set('kelas', query.classFilter); if (query.statusFilter) p.set('status', query.statusFilter); if (query.attentionFilter) p.set('perhatian', query.attentionFilter); if (query.okbMissed) p.set('okb', 'terlewat'); if (query.waveFilter) p.set('gelombang', String(query.waveFilter)); if (query.announcementFilter) p.set('pengumuman', query.announcementFilter); if (query.paymentFilter) p.set('bayar', query.paymentFilter); if (query.pageSize !== PARTICIPANT_PAGE_SIZE) p.set('per', String(query.pageSize)); if (page > 1) p.set('page', String(page)); const value = p.toString(); return `/admin/pendaftar${value ? `?${value}` : ''}`; }
export const hasActiveFilters = (query: ParticipantListQuery) => Boolean(query.search || query.classFilter || query.statusFilter || query.attentionFilter || query.okbMissed || query.waveFilter || query.announcementFilter || query.paymentFilter);
/** Page numbers to show: first, last, and one either side of the current page; null marks a gap. */
export function paginationPages(page: number, totalPages: number): (number | null)[] {
  const pages: (number | null)[] = [];
  for (let n = 1; n <= totalPages; n++) {
    // A gap that would hide a single page shows that page instead.
    const fillsGap = (n === 2 && page === 4) || (n === totalPages - 1 && page === totalPages - 3);
    if (n === 1 || n === totalPages || Math.abs(n - page) <= 1 || fillsGap) pages.push(n);
    else if (pages.at(-1) !== null) pages.push(null);
  }
  return pages;
}
export { PARTICIPANT_PAGE_SIZE };
