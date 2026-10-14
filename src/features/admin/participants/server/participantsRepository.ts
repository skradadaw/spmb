import 'server-only';
import type { SupabaseClient } from '@supabase/supabase-js';
import type { ParticipantAttention, ParticipantDetail, ParticipantDocumentReviews, ParticipantExportRecord, ParticipantListItem, ParticipantListQuery, ParticipantListResult } from '../contracts';
import { ATTENTION_EXCLUDED_STATUSES, PARTICIPANT_DETAIL_COLUMNS, PARTICIPANT_EXPORT_COLUMNS, PARTICIPANT_LIST_COLUMNS } from '../contracts';
import { PARTICIPANT_FIELDS, type ParticipantFieldGroupName } from '../fields';
import { escapeSearch } from '../query';
import { fromPendaftarRow } from '../editing';
import { DOCUMENT_DEFINITIONS } from '@/features/registration/contracts';
import { okbWaveLabel, parseOkbWave } from '@/features/admin/okbWave';

type Result<T> = PromiseLike<{ data: T | null; error: unknown; count?: number | null }>;
type Query = {
  ilike: (column: string, value: string) => Query;
  eq: (column: string, value: string | boolean) => Query;
  in: (column: string, values: readonly string[]) => Query;
  not: (column: string, operator: string, value: string) => Query;
  lt: (column: string, value: string) => Query;
  or: (filters: string) => Query;
  order: (column: string, options?: { ascending?: boolean }) => Query;
  range: (from: number, to: number) => Result<unknown[]>;
  maybeSingle: () => Result<Record<string, unknown>>;
};
type Client = { from: (table: 'pendaftar' | 'verifikasi_dokumen') => { select: (columns: string, options?: { count?: 'exact'; head?: boolean }) => Query } };
const text = (value: unknown): string | null => typeof value === 'string' && value.trim() ? value : null;
/** Field values as shown to the admin; Gelombang OKB is stored as a number but read as its name. */
const fieldValue = (column: string, value: unknown) => {
  if (column !== 'jadwal_okb_gelombang') return text(value);
  const wave = parseOkbWave(value);
  return wave ? okbWaveLabel(wave) : null;
};
const failure = () => new Error('Data pendaftar tidak dapat dimuat.');
/** Pencarian yang diawali "OB-" dicocokkan ke Nomor Pendaftaran, selain itu ke nama. */
const searchColumn = (search: string) => /^OB-/i.test(search.trim()) ? 'nomor_pendaftaran' : 'nama_lengkap';

const jakartaToday = () => new Intl.DateTimeFormat('en-CA', { timeZone: 'Asia/Jakarta' }).format(new Date());
const count = (value: unknown) => Math.max(0, Number(value) || 0);
const EXCLUDED_STATUS_LIST = `(${ATTENTION_EXCLUDED_STATUSES.map(status => `"${status}"`).join(',')})`;

function mapAttention(row: Record<string, unknown>, status: string): ParticipantAttention {
  if ((ATTENTION_EXCLUDED_STATUSES as readonly string[]).includes(status)) return { nisnMismatch: false, missingDocuments: 0 };
  return { nisnMismatch: row.nisn_tidak_sesuai === true, missingDocuments: count(row.berkas_belum_tersedia) };
}

function applyFilters(request: Query, query: ParticipantListQuery) {
  if (query.search) request = request.ilike(searchColumn(query.search), `%${escapeSearch(query.search.trim())}%`);
  if (query.classFilter === 'Pindahan') request = request.eq('jenis_pendaftaran', 'Pindahan');
  else if (query.classFilter) {
    // Kelas Penempatan dari Panitia menggantikan Pilihan Kelas begitu ditetapkan.
    request = request.eq('jenis_pendaftaran', 'Siswa Baru')
      .or(`kelas_penempatan.eq.${query.classFilter},and(kelas_penempatan.is.null,pilihan_kelas.eq.${query.classFilter})`);
  }
  if (query.statusFilter) request = request.eq('status', query.statusFilter);
  // Tidak Hadir OKB: tanggal Jadwal OKB sudah lewat tanpa Scan Kehadiran.
  if (query.okbMissed) request = request.eq('status', 'Terjadwal OKB').lt('jadwal_okb_tanggal', jakartaToday());
  if (query.waveFilter) request = request.eq('status', 'Terjadwal OKB').eq('jadwal_okb_gelombang', String(query.waveFilter));
  if (query.attentionFilter) {
    request = request.not('status', 'in', EXCLUDED_STATUS_LIST);
    if (query.attentionFilter === 'nisn') request = request.eq('nisn_tidak_sesuai', true);
    else request = request.or('nisn_tidak_sesuai.is.true,berkas_belum_tersedia.gt.0');
  }
  return request;
}

function mapList(row: Record<string, unknown>): ParticipantListItem {
  const status = text(row.status) ?? 'Belum diisi';
  return {
    id: String(row.id), nomorPendaftaran: text(row.nomor_pendaftaran), namaLengkap: text(row.nama_lengkap) ?? 'Nama belum diisi', asalSekolah: text(row.asal_sekolah),
    pilihanKelas: text(row.pilihan_kelas) ?? 'Belum diisi', kelasPenempatan: text(row.kelas_penempatan), kelasTujuan: text(row.kelas_tujuan), jenisPendaftaran: text(row.jenis_pendaftaran) ?? 'Belum diisi',
    status, jadwalGelombang: status === 'Terjadwal OKB' ? fieldValue('jadwal_okb_gelombang', row.jadwal_okb_gelombang) : null,
    createdAt: text(row.created_at), attention: mapAttention(row, status),
  };
}

export function createParticipantsRepository(supabase: SupabaseClient) {
  const client = supabase as unknown as Client;
  function filtered(query: ParticipantListQuery) {
    return applyFilters(client.from('pendaftar').select(PARTICIPANT_LIST_COLUMNS, { count: 'exact' }), query);
  }
  return {
    async list(query: ParticipantListQuery): Promise<ParticipantListResult> {
      const fetchPage = (page: number) => filtered(query).order('created_at', { ascending: false }).order('id', { ascending: false })
        .range((page - 1) * query.pageSize, page * query.pageSize - 1);
      // Rows and the exact count arrive in one round trip; only a page beyond the end needs a second query.
      let page = query.page;
      let result = await fetchPage(page);
      if (result.error || result.count == null) {
        // PostgREST answers an out-of-range offset with an error, so re-check from the first page before failing.
        if (page === 1) throw failure();
        result = await fetchPage(1);
        if (result.error || result.count == null) throw failure();
        page = 1;
      }
      const total = result.count ?? 0;
      const totalPages = Math.max(1, Math.ceil(total / query.pageSize));
      const lastAllowedPage = Math.min(query.page, totalPages);
      if (lastAllowedPage !== page) {
        page = lastAllowedPage;
        result = await fetchPage(page);
        if (result.error || result.count == null) throw failure();
      }
      if (!result.data) throw failure();
      return { items: result.data.map(row => mapList(row as Record<string, unknown>)), page, pageSize: query.pageSize, total, totalPages };
    },
    async exportAll(query: ParticipantListQuery): Promise<ParticipantListItem[]> {
      const items: ParticipantListItem[] = [];
      for (let offset = 0; ; offset += 1000) {
        const result = await filtered(query).order('created_at', { ascending: false }).order('id', { ascending: false }).range(offset, offset + 999);
        if (result.error || !result.data) throw failure();
        items.push(...result.data.map(row => mapList(row as Record<string, unknown>)));
        if (result.data.length < 1000) return items;
      }
    },
    /** Ekspor berdiri sendiri dari filter daftar: hanya status yang dipilih admin yang menyaring. */
    async exportDetails(statuses: readonly string[]): Promise<ParticipantExportRecord[]> {
      const records: ParticipantExportRecord[] = [];
      for (let offset = 0; ; offset += 1000) {
        const result = await client.from('pendaftar').select(PARTICIPANT_EXPORT_COLUMNS).in('status', statuses).order('created_at', { ascending: false }).order('id', { ascending: false }).range(offset, offset + 999);
        if (result.error || !result.data) throw failure();
        for (const raw of result.data) {
          const row = raw as Record<string, unknown>;
          const fields: Record<string, string | null> = {};
          for (const [group, definitions] of Object.entries(PARTICIPANT_FIELDS)) {
            for (const [key, column] of definitions) fields[group === 'father' ? `father${key[0].toUpperCase()}${key.slice(1)}` : group === 'mother' ? `mother${key[0].toUpperCase()}${key.slice(1)}` : key] = fieldValue(column, row[column]);
          }
          records.push({ id: String(row.id), createdAt: text(row.created_at), updatedAt: text(row.updated_at), status: text(row.status) ?? 'Belum diisi', adminNote: text(row.catatan_admin), nisnMismatch: row.nisn_tidak_sesuai === true, fields });
        }
        if (result.data.length < 1000) return records;
      }
    },
    /** Jumlah pendaftar per status, untuk ditampilkan di modal ekspor. */
    async countByStatus(statuses: readonly string[]): Promise<Record<string, number>> {
      const counts: Record<string, number> = Object.fromEntries(statuses.map(status => [status, 0]));
      for (let offset = 0; ; offset += 1000) {
        const result = await client.from('pendaftar').select('status').in('status', statuses).order('id').range(offset, offset + 999);
        if (result.error || !result.data) throw failure();
        for (const row of result.data as Record<string, unknown>[]) {
          const status = text(row.status);
          if (status && status in counts) counts[status] += 1;
        }
        if (result.data.length < 1000) return counts;
      }
    },
    async getDocumentRow(id: string): Promise<Record<string, unknown> | null> {
      const columns = 'id,submission_id,' + DOCUMENT_DEFINITIONS.map(document => document.dbColumn).join(',');
      const result = await client.from('pendaftar').select(columns).eq('id', id).maybeSingle();
      if (result.error) throw failure();
      return result.data;
    },    async getById(id: string): Promise<ParticipantDetail | null> {
      // Both reads depend only on the id, so they run in parallel instead of back to back.
      const [result, reviewResult] = await Promise.all([
        client.from('pendaftar').select(PARTICIPANT_DETAIL_COLUMNS).eq('id', id).maybeSingle(),
        client.from('verifikasi_dokumen').select('dokumen_id,status,diperiksa_pada,diperiksa_oleh').eq('pendaftar_id', id).range(0, 99),
      ]);
      if (result.error) throw failure();
      const row = result.data;
      if (!row) return null;
      if (reviewResult.error || !reviewResult.data) throw failure();
      const documentReviews = Object.fromEntries(reviewResult.data.map(review => {
        const item = review as Record<string, unknown>;
        return [item.dokumen_id, { status: item.status, reviewedAt: text(item.diperiksa_pada) ?? '', reviewedBy: text(item.diperiksa_oleh) ?? 'Admin' }];
      })) as ParticipantDocumentReviews;
      const group = (name: ParticipantFieldGroupName) => Object.fromEntries(PARTICIPANT_FIELDS[name].map(([key, column]) => [key, fieldValue(column, row[column])]));
      return {
        id, createdAt: text(row.created_at), updatedAt: text(row.updated_at), status: text(row.status) ?? 'Belum diisi',
        identity: group('identity'), registration: group('registration'), school: group('school'), affiliation: group('affiliation'),
        referral: group('referral'), okb: group('okb'), decision: group('decision'), formValues: fromPendaftarRow(row), previousStatus: text(row.status_sebelum_dibatalkan),
        address: group('address'), father: group('father'), mother: group('mother'),
        documents: DOCUMENT_DEFINITIONS.map(doc => ({ id: doc.id, title: doc.title, path: text(row[doc.dbColumn]) })), documentReviews, adminNote: text(row.catatan_admin), nisnMismatch: row.nisn_tidak_sesuai === true,
      };
    },
  };
}
