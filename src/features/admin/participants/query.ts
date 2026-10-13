import { ATTENTION_FILTERS, PARTICIPANT_CLASSES, PARTICIPANT_DEFAULT_STATUSES, PARTICIPANT_PAGE_SIZE, PARTICIPANT_TYPES, type AttentionFilter, type ParticipantListQuery } from './contracts';
const MAX_SEARCH_LENGTH = 100;
const allowed = (value: string | null, values: readonly string[]) => value && values.includes(value) ? value : null;
export function escapeSearch(value: string) { return value.replace(/[\\%_]/g, (char) => `\\${char}`); }
export function parseParticipantListQuery(params: URLSearchParams, statuses: readonly string[] = PARTICIPANT_DEFAULT_STATUSES): ParticipantListQuery {
  const rawPage = params.get('page') ?? '1';
  const numericPage = /^\d+$/.test(rawPage) ? Number(rawPage) : 1;
  return { search: (params.get('q') ?? '').trim().slice(0, MAX_SEARCH_LENGTH), classFilter: allowed(params.get('kelas'), PARTICIPANT_CLASSES), typeFilter: allowed(params.get('jenis'), PARTICIPANT_TYPES), statusFilter: allowed(params.get('status')?.trim() ?? null, statuses), attentionFilter: allowed(params.get('perhatian'), Object.keys(ATTENTION_FILTERS)) as AttentionFilter | null, page: Number.isSafeInteger(numericPage) && numericPage > 0 ? numericPage : 1 };
}
export function participantListHref(query: ParticipantListQuery, page = 1) { const p = new URLSearchParams(); if (query.search) p.set('q', query.search); if (query.classFilter) p.set('kelas', query.classFilter); if (query.typeFilter) p.set('jenis', query.typeFilter); if (query.statusFilter) p.set('status', query.statusFilter); if (query.attentionFilter) p.set('perhatian', query.attentionFilter); if (page > 1) p.set('page', String(page)); const value = p.toString(); return `/admin/pendaftar${value ? `?${value}` : ''}`; }
export { PARTICIPANT_PAGE_SIZE };
