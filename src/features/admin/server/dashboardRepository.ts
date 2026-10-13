import 'server-only';

import type { AdminDashboardSummary, DistributionItem } from '../contracts';

type RecentRow = {
  id: string;
  nama_lengkap: string | null;
  pilihan_kelas: string | null;
  jenis_pendaftaran: string | null;
  status: string | null;
  created_at: string | null;
};

type GroupCount = { label: string | null; count: number };

type SummaryPayload = {
  total: number;
  awaiting: number;
  incomplete: number;
  attention?: { any?: number; nisn?: number; followUp?: number } | null;
  classes: GroupCount[];
  types: GroupCount[];
  recent: RecentRow[];
};

type DashboardClient = {
  rpc(fn: 'get_admin_dashboard_summary'): PromiseLike<{ data: unknown; error: unknown }>;
};

const SAFE_ERROR = 'Ringkasan pendaftaran tidak dapat dimuat.';
const CLASS_LABELS = ['Reguler', 'Bilingual', 'Tahfizh'] as const;
const TYPE_LABELS = ['Siswa Baru', 'Pindahan'] as const;

export class AdminDashboardLoadError extends Error {
  constructor() {
    super(SAFE_ERROR);
    this.name = 'AdminDashboardLoadError';
  }
}

function distribution(groups: GroupCount[], knownLabels: readonly string[], total: number): DistributionItem[] {
  const counts = new Map(knownLabels.map((label) => [label, 0]));
  let otherCount = 0;

  for (const { label, count } of groups) {
    const value = Number(count) || 0;
    if (label && counts.has(label)) counts.set(label, (counts.get(label) ?? 0) + value);
    else otherCount += value;
  }

  const items = knownLabels.map((label) => ({
    label,
    count: counts.get(label) ?? 0,
    percentage: total === 0 ? 0 : Math.round(((counts.get(label) ?? 0) / total) * 100),
  }));
  if (otherCount > 0) items.push({ label: 'Lainnya', count: otherCount, percentage: Math.round((otherCount / total) * 100) });
  return items;
}

function validDate(value: string | null): string | null {
  return value && Number.isFinite(Date.parse(value)) ? value : null;
}

function isPayload(value: unknown): value is SummaryPayload {
  const payload = value as Partial<SummaryPayload> | null;
  return Boolean(payload) && Array.isArray(payload?.classes) && Array.isArray(payload?.types) && Array.isArray(payload?.recent);
}

export function createAdminDashboardRepository(client: DashboardClient) {
  return {
    async getSummary(): Promise<AdminDashboardSummary> {
      // Aggregated in Postgres so only counts and the latest rows cross the network.
      const { data, error } = await client.rpc('get_admin_dashboard_summary');
      if (error || !isPayload(data)) throw new AdminDashboardLoadError();

      const totalRegistrations = Number(data.total) || 0;
      const incompleteUploads = Number(data.incomplete) || 0;
      return {
        totalRegistrations,
        awaitingVerification: Number(data.awaiting) || 0,
        incompleteUploads,
        completedRegistrations: totalRegistrations - incompleteUploads,
        attention: { any: Number(data.attention?.any) || 0, nisn: Number(data.attention?.nisn) || 0, followUp: Number(data.attention?.followUp) || 0 },
        classDistribution: distribution(data.classes, CLASS_LABELS, totalRegistrations),
        typeDistribution: distribution(data.types, TYPE_LABELS, totalRegistrations),
        recentApplicants: data.recent.map((row) => ({
          id: row.id,
          namaLengkap: row.nama_lengkap?.trim() || 'Belum diisi',
          pilihanKelas: CLASS_LABELS.includes(row.pilihan_kelas as (typeof CLASS_LABELS)[number]) ? row.pilihan_kelas! : 'Lainnya',
          jenisPendaftaran: TYPE_LABELS.includes(row.jenis_pendaftaran as (typeof TYPE_LABELS)[number]) ? row.jenis_pendaftaran! : 'Lainnya',
          status: row.status?.trim() || 'Belum diisi',
          createdAt: validDate(row.created_at),
        })),
        updatedAt: new Date().toISOString(),
      };
    },
  };
}
