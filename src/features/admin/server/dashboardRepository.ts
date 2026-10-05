import 'server-only';

import type { AdminDashboardSummary, DistributionItem } from '../contracts';

type RegistrationRow = {
  id: string;
  nama_lengkap: string | null;
  pilihan_kelas: string | null;
  jenis_pendaftaran: string | null;
  status: string | null;
  created_at: string;
};

type DashboardClient = {
  from(table: 'pendaftar'): {
    select(columns: string): Promise<{ data: unknown[] | null; error: unknown }>;
  };
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

function distribution(values: Array<string | null>, knownLabels: readonly string[]): DistributionItem[] {
  const total = values.length;
  const counts = new Map(knownLabels.map((label) => [label, 0]));
  let otherCount = 0;

  for (const value of values) {
    if (value && counts.has(value)) counts.set(value, (counts.get(value) ?? 0) + 1);
    else otherCount += 1;
  }

  const items = knownLabels.map((label) => ({
    label,
    count: counts.get(label) ?? 0,
    percentage: total === 0 ? 0 : Math.round(((counts.get(label) ?? 0) / total) * 100),
  }));
  if (otherCount > 0) items.push({ label: 'Lainnya', count: otherCount, percentage: Math.round((otherCount / total) * 100) });
  return items;
}

export function createAdminDashboardRepository(client: DashboardClient) {
  return {
    async getSummary(): Promise<AdminDashboardSummary> {
      const { data, error } = await client
        .from('pendaftar')
        .select('id,nama_lengkap,pilihan_kelas,jenis_pendaftaran,status,created_at');

      if (error || !data) throw new AdminDashboardLoadError();

      const rows = data as RegistrationRow[];
      const totalRegistrations = rows.length;
      return {
        totalRegistrations,
        awaitingVerification: rows.filter((row) => row.status === 'Menunggu Verifikasi').length,
        incompleteUploads: rows.filter((row) => row.status === 'Menunggu Unggahan').length,
        completedRegistrations: rows.filter((row) => row.status !== 'Menunggu Unggahan').length,
        classDistribution: distribution(rows.map((row) => row.pilihan_kelas), CLASS_LABELS),
        typeDistribution: distribution(rows.map((row) => row.jenis_pendaftaran), TYPE_LABELS),
        recentApplicants: [...rows]
          .sort((a, b) => Date.parse(b.created_at) - Date.parse(a.created_at))
          .slice(0, 8)
          .map((row) => ({
            id: row.id,
            namaLengkap: row.nama_lengkap?.trim() || 'Belum diisi',
            pilihanKelas: CLASS_LABELS.includes(row.pilihan_kelas as (typeof CLASS_LABELS)[number]) ? row.pilihan_kelas! : 'Lainnya',
            jenisPendaftaran: TYPE_LABELS.includes(row.jenis_pendaftaran as (typeof TYPE_LABELS)[number]) ? row.jenis_pendaftaran! : 'Lainnya',
            status: row.status?.trim() || 'Belum diisi',
            createdAt: row.created_at,
          })),
        updatedAt: new Date().toISOString(),
      };
    },
  };
}
