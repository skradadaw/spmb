import 'server-only';

import { CLASS_OPTIONS } from '@/features/registration/classCapacity';
import { okbWaveLabel, parseOkbWave } from '../okbWave';
import type { AdminDashboardSummary, LabelCount, OkbScheduleDay } from '../contracts';

type Counts<K extends string> = Partial<Record<K, unknown>> | null | undefined;

type SummaryPayload = {
  today: string;
  total: unknown;
  tasks?: Counts<keyof AdminDashboardSummary['tasks']>;
  attention?: Counts<'any' | 'nisn'>;
  capacity: { label: string | null; kuota: unknown; terpakai: unknown }[];
  seatsByGender?: Counts<keyof AdminDashboardSummary['seatsByGender']>;
  transfers?: unknown;
  results?: Counts<keyof AdminDashboardSummary['results']>;
  acceptedByClass: { label: string | null; count: unknown }[];
  schedule: { date: string; total: unknown; waves: { wave: unknown; count: unknown }[] | null; rooms?: { room: unknown; count: unknown }[] | null }[];
};

type DashboardClient = {
  rpc(fn: 'get_admin_dashboard_summary'): PromiseLike<{ data: unknown; error: unknown }>;
};

const SAFE_ERROR = 'Ringkasan pendaftaran tidak dapat dimuat.';

export class AdminDashboardLoadError extends Error {
  constructor() {
    super(SAFE_ERROR);
    this.name = 'AdminDashboardLoadError';
  }
}

const num = (value: unknown) => Math.max(0, Number(value) || 0);

function isPayload(value: unknown): value is SummaryPayload {
  const payload = value as Partial<SummaryPayload> | null;
  return Boolean(payload) && typeof payload?.today === 'string'
    && Array.isArray(payload?.capacity) && Array.isArray(payload?.acceptedByClass) && Array.isArray(payload?.schedule);
}

/** Always the three program classes in a fixed order, so the cards never reshuffle. */
function perClass(rows: { label: string | null; count: unknown }[]): LabelCount[] {
  const counts = new Map(rows.map(row => [row.label, num(row.count)]));
  return CLASS_OPTIONS.map(label => ({ label, count: counts.get(label) ?? 0 }));
}

const compareRoom = (left: LabelCount, right: LabelCount) => left.label.localeCompare(right.label, 'id-ID', { numeric: true, sensitivity: 'base' });

/** Ruang OKB in natural name order (Ruang 2 before Ruang 10); null when an older database function omits them. */
function rooms(rows: { room: unknown; count: unknown }[] | null | undefined): LabelCount[] | null {
  if (!Array.isArray(rows)) return null;
  return rows.flatMap(row => (typeof row.room === 'string' && row.room ? [{ label: row.room, count: num(row.count) }] : [])).sort(compareRoom);
}

function schedule(rows: SummaryPayload['schedule']): OkbScheduleDay[] {
  return rows.map(row => ({
    date: row.date,
    total: num(row.total),
    waves: (row.waves ?? []).flatMap(item => {
      const wave = parseOkbWave(item.wave);
      return wave ? [{ label: okbWaveLabel(wave), count: num(item.count) }] : [];
    }),
    rooms: rooms(row.rooms),
  }));
}

export function createAdminDashboardRepository(client: DashboardClient) {
  return {
    async getSummary(): Promise<AdminDashboardSummary> {
      // Aggregated in Postgres so only counts cross the network.
      const { data, error } = await client.rpc('get_admin_dashboard_summary');
      if (error || !isPayload(data)) throw new AdminDashboardLoadError();

      const capacity = new Map(data.capacity.map(row => [row.label, row]));
      return {
        today: data.today,
        // The RPC total leaves out Menunggu Unggahan; adding them back counts every Pendaftar whose data has come in,
        // whatever their Berkas, so the card matches the default Data Pendaftar list it links to.
        totalRegistrations: num(data.total) + num(data.tasks?.uploading),
        tasks: {
          uploading: num(data.tasks?.uploading), awaiting: num(data.tasks?.awaiting), verified: num(data.tasks?.verified),
          absent: num(data.tasks?.absent), decision: num(data.tasks?.decision), unannounced: num(data.tasks?.unannounced),
        },
        attention: { any: num(data.attention?.any), nisn: num(data.attention?.nisn) },
        capacity: CLASS_OPTIONS.map(label => ({ label, kuota: num(capacity.get(label)?.kuota), terpakai: num(capacity.get(label)?.terpakai) })),
        seatsByGender: { male: num(data.seatsByGender?.male), female: num(data.seatsByGender?.female), unknown: num(data.seatsByGender?.unknown) },
        transfers: num(data.transfers),
        results: { accepted: num(data.results?.accepted), rejected: num(data.results?.rejected), withdrawn: num(data.results?.withdrawn) },
        acceptedByClass: perClass(data.acceptedByClass),
        schedule: schedule(data.schedule),
      };
    },
  };
}
