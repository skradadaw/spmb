import 'server-only';
import type { SupabaseClient } from '@supabase/supabase-js';
import type { ParticipantDetail, ParticipantDocumentReviews, ParticipantListItem, ParticipantListQuery, ParticipantListResult } from '../contracts';
import { PARTICIPANT_DETAIL_COLUMNS, PARTICIPANT_LIST_COLUMNS, PARTICIPANT_PAGE_SIZE } from '../contracts';
import { PARTICIPANT_FIELDS, type ParticipantFieldGroupName } from '../fields';
import { escapeSearch } from '../query';
import { DOCUMENT_DEFINITIONS } from '@/features/registration/contracts';

type Result<T> = PromiseLike<{ data: T | null; error: unknown; count?: number | null }>;
type Query = {
  ilike: (column: string, value: string) => Query;
  eq: (column: string, value: string) => Query;
  order: (column: string, options?: { ascending?: boolean }) => Query;
  range: (from: number, to: number) => Result<unknown[]>;
  maybeSingle: () => Result<Record<string, unknown>>;
};
type Client = { from: (table: 'pendaftar' | 'verifikasi_dokumen') => { select: (columns: string, options?: { count?: 'exact'; head?: boolean }) => Query } };
const text = (value: unknown): string | null => typeof value === 'string' && value.trim() ? value : null;
const failure = () => new Error('Data peserta tidak dapat dimuat.');

function mapList(row: Record<string, unknown>): ParticipantListItem {
  return {
    id: String(row.id), namaLengkap: text(row.nama_lengkap) ?? 'Nama belum diisi', asalSekolah: text(row.asal_sekolah),
    pilihanKelas: text(row.pilihan_kelas) ?? 'Belum diisi', jenisPendaftaran: text(row.jenis_pendaftaran) ?? 'Belum diisi',
    status: text(row.status) ?? 'Belum diisi', createdAt: text(row.created_at),
  };
}

const STATUS_CACHE_TTL_MS = 60_000;
let statusCache: { expiresAt: number; values: string[] } | null = null;
let statusRequest: Promise<string[]> | null = null;

export function createParticipantsRepository(supabase: SupabaseClient) {
  const client = supabase as unknown as Client;
  function filtered(query: ParticipantListQuery) {
    let request = client.from('pendaftar').select(PARTICIPANT_LIST_COLUMNS, { count: 'exact' });
    if (query.search) request = request.ilike('nama_lengkap', `%${escapeSearch(query.search)}%`);
    if (query.classFilter) request = request.eq('pilihan_kelas', query.classFilter);
    if (query.typeFilter) request = request.eq('jenis_pendaftaran', query.typeFilter);
    if (query.statusFilter) request = request.eq('status', query.statusFilter);
    return request;
  }
  return {
    async list(query: ParticipantListQuery): Promise<ParticipantListResult> {
      // Count before calculating the range avoids overflowing or querying past the last page.
      const countResult = await filtered(query).range(0, 0);
      if (countResult.error || countResult.count == null) throw failure();
      const total = countResult.count;
      const totalPages = Math.max(1, Math.ceil(total / PARTICIPANT_PAGE_SIZE));
      const page = Math.min(query.page, totalPages);
      const result = await filtered(query).order('created_at', { ascending: false }).order('id', { ascending: false })
        .range((page - 1) * PARTICIPANT_PAGE_SIZE, page * PARTICIPANT_PAGE_SIZE - 1);
      if (result.error || !result.data) throw failure();
      return { items: result.data.map(row => mapList(row as Record<string, unknown>)), page, pageSize: PARTICIPANT_PAGE_SIZE, total, totalPages };
    },
    async getStatuses(): Promise<string[]> {
      if (statusCache && statusCache.expiresAt > Date.now()) return statusCache.values;
      if (statusRequest) return statusRequest;
      const request = (async () => {
        const statuses = new Set<string>();
        for (let offset = 0; ; offset += 1000) {
          const result = await client.from('pendaftar').select('status').order('id', { ascending: true }).range(offset, offset + 999);
          if (result.error || !result.data) throw failure();
          for (const row of result.data) { const status = text((row as Record<string, unknown>).status); if (status) statuses.add(status); }
          if (result.data.length < 1000) break;
        }
        return [...statuses].sort((a, b) => a.localeCompare(b, 'id'));
      })();
      statusRequest = request;
      try {
        const values = await request;
        statusCache = { expiresAt: Date.now() + STATUS_CACHE_TTL_MS, values };
        return values;
      } catch {
        if (statusCache) return statusCache.values;
        throw failure();
      } finally {
        statusRequest = null;
      }
    },    async getDocumentRow(id: string): Promise<Record<string, unknown> | null> {
      const columns = 'id,submission_id,' + DOCUMENT_DEFINITIONS.map(document => document.dbColumn).join(',');
      const result = await client.from('pendaftar').select(columns).eq('id', id).maybeSingle();
      if (result.error) throw failure();
      return result.data;
    },    async getById(id: string): Promise<ParticipantDetail | null> {
      const result = await client.from('pendaftar').select(PARTICIPANT_DETAIL_COLUMNS).eq('id', id).maybeSingle();
      if (result.error) throw failure();
      const row = result.data;
      if (!row) return null;
      const reviewResult = await client.from('verifikasi_dokumen').select('dokumen_id,status,diperiksa_pada,diperiksa_oleh').eq('pendaftar_id', id).range(0, 99);
      if (reviewResult.error || !reviewResult.data) throw failure();
      const documentReviews = Object.fromEntries(reviewResult.data.map(review => {
        const item = review as Record<string, unknown>;
        return [item.dokumen_id, { status: item.status, reviewedAt: text(item.diperiksa_pada) ?? '', reviewedBy: text(item.diperiksa_oleh) ?? 'Admin' }];
      })) as ParticipantDocumentReviews;
      const group = (name: ParticipantFieldGroupName) => Object.fromEntries(PARTICIPANT_FIELDS[name].map(([key, column]) => [key, text(row[column])]));
      return {
        id, createdAt: text(row.created_at), updatedAt: text(row.updated_at), status: text(row.status) ?? 'Belum diisi',
        identity: group('identity'), registration: group('registration'), school: group('school'), affiliation: group('affiliation'),
        address: group('address'), father: group('father'), mother: group('mother'),
        documents: DOCUMENT_DEFINITIONS.map(doc => ({ id: doc.id, title: doc.title, path: text(row[doc.dbColumn]) })), documentReviews, adminNote: text(row.catatan_admin),
      };
    },
  };
}
