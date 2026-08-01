import Link from "next/link";
import AdminIcon from "@/components/admin/AdminIcon";
import { AdminBadge, AdminCard } from "@/components/admin/AdminUI";
import {
  adminInputCls,
  adminPrimaryButtonCls,
  adminSecondaryButtonCls,
} from "@/components/admin/styles";
import { createAdminClient } from "@/lib/supabase/admin";
import {
  LABEL_PENERIMAAN,
  LABEL_VERIFIKASI,
  STATUS_PENERIMAAN,
  STATUS_VERIFIKASI,
  type StatusPenerimaan,
  type StatusVerifikasi,
} from "@/lib/status";

export const dynamic = "force-dynamic";

type Params = { q?: string; verifikasi?: string; penerimaan?: string };

const VERIFICATION_TONE = {
  menunggu: "warning",
  terverifikasi: "success",
  perlu_perbaikan: "info",
} as const;

const ACCEPTANCE_TONE = {
  menunggu: "warning",
  diterima: "success",
  tidak_diterima: "danger",
} as const;

const formatDate = (date: string) => new Intl.DateTimeFormat("id-ID", {
  day: "2-digit",
  month: "short",
  year: "numeric",
}).format(new Date(date));

export default async function PendaftarPage({
  searchParams,
}: {
  searchParams: Promise<Params>;
}) {
  const { q, verifikasi, penerimaan } = await searchParams;
  const supabase = createAdminClient();

  let query = supabase
    .from("pendaftar")
    .select(
      "id, nomor_pendaftaran, nama_lengkap, no_whatsapp, status_verifikasi, status_penerimaan, created_at"
    )
    .order("nomor_urut", { ascending: true });

  if (q) query = query.or(`nama_lengkap.ilike.%${q}%,nomor_pendaftaran.ilike.%${q}%`);
  if (verifikasi) query = query.eq("status_verifikasi", verifikasi);
  if (penerimaan) query = query.eq("status_penerimaan", penerimaan);
  const { data: daftar, error: daftarError } = await query;
  if (daftarError) {
    throw new Error("Gagal memuat daftar pendaftar. Silakan coba lagi.");
  }

  const paramExport = new URLSearchParams();
  if (q) paramExport.set("q", q);
  if (verifikasi) paramExport.set("verifikasi", verifikasi);
  if (penerimaan) paramExport.set("penerimaan", penerimaan);

  const applicants = daftar ?? [];
  const hasFilters = Boolean(q || verifikasi || penerimaan);

  return (
    <div className="space-y-7">
      <header className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="admin-display text-[28px] font-extrabold leading-[1.15] tracking-[-0.025em] text-[#101820] sm:text-[32px]">
            Pendaftar
          </h1>
          <p className="mt-2 text-sm leading-6 text-[#667085]">
            Total {applicants.length} data calon siswa yang sesuai kriteria pencarian.
          </p>
        </div>
        <a
          href={`/admin/pendaftar/export?${paramExport.toString()}`}
          className={`${adminSecondaryButtonCls} w-full sm:w-auto`}
        >
          <AdminIcon name="download" className="h-4 w-4" />
          Unduh Data Excel
        </a>
      </header>

      <AdminCard className="p-4 sm:p-5">
        <form method="get" className="grid gap-4 lg:grid-cols-[minmax(0,1.4fr)_minmax(190px,1fr)_minmax(190px,1fr)_auto] lg:items-end">
          <div className="space-y-1.5">
            <label htmlFor="pendaftar-search" className="block text-sm font-semibold text-[#101820]">
              Cari nama atau nomor pendaftaran
            </label>
            <input
              id="pendaftar-search"
              name="q"
              defaultValue={q}
              placeholder="Masukkan nama atau nomor"
              className={adminInputCls}
            />
          </div>
          <div className="space-y-1.5">
            <label htmlFor="status-verifikasi" className="block text-sm font-semibold text-[#101820]">
              Status verifikasi
            </label>
            <select id="status-verifikasi" name="verifikasi" defaultValue={verifikasi ?? ""} className={adminInputCls}>
              <option value="">Semua status</option>
              {STATUS_VERIFIKASI.map((status) => (
                <option key={status} value={status}>
                  {LABEL_VERIFIKASI[status]}
                </option>
              ))}
            </select>
          </div>
          <div className="space-y-1.5">
            <label htmlFor="status-penerimaan" className="block text-sm font-semibold text-[#101820]">
              Status penerimaan
            </label>
            <select id="status-penerimaan" name="penerimaan" defaultValue={penerimaan ?? ""} className={adminInputCls}>
              <option value="">Semua status</option>
              {STATUS_PENERIMAAN.map((status) => (
                <option key={status} value={status}>
                  {LABEL_PENERIMAAN[status]}
                </option>
              ))}
            </select>
          </div>
          <div className="flex flex-wrap gap-2">
            <button type="submit" className={`${adminPrimaryButtonCls} flex-1 lg:flex-none`}>
              Terapkan Filter
            </button>
            {hasFilters && (
              <Link href="/admin/pendaftar" className={`${adminSecondaryButtonCls} flex-1 lg:flex-none`}>
                Hapus Filter
              </Link>
            )}
          </div>
        </form>
      </AdminCard>

      {applicants.length > 0 ? (
        <>
          <div className="space-y-3 md:hidden">
            {applicants.map((applicant) => (
              <AdminCard key={applicant.id} className="overflow-hidden">
                <Link
                  href={`/admin/pendaftar/${applicant.id}`}
                  className="block min-h-11 p-5 transition-colors hover:bg-[#F6F7F5] focus:outline-none focus:ring-4 focus:ring-inset focus:ring-[#00AA13]/15"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="font-mono text-xs font-semibold text-[#667085]">{applicant.nomor_pendaftaran}</p>
                      <p className="mt-1 text-base font-semibold text-[#101820]">{applicant.nama_lengkap}</p>
                    </div>
                    <span className="shrink-0 text-xs text-[#667085]">{formatDate(applicant.created_at)}</span>
                  </div>
                  <p className="mt-1 text-sm text-[#667085]">WA: {applicant.no_whatsapp}</p>
                  <div className="mt-4 flex flex-wrap gap-2 border-t border-slate-100 pt-4">
                    <AdminBadge tone={VERIFICATION_TONE[applicant.status_verifikasi as StatusVerifikasi]}>
                      {LABEL_VERIFIKASI[applicant.status_verifikasi as StatusVerifikasi]}
                    </AdminBadge>
                    <AdminBadge tone={ACCEPTANCE_TONE[applicant.status_penerimaan as StatusPenerimaan]}>
                      {LABEL_PENERIMAAN[applicant.status_penerimaan as StatusPenerimaan]}
                    </AdminBadge>
                  </div>
                  <span className="mt-4 inline-flex min-h-11 items-center gap-1.5 text-sm font-semibold text-[#00880F]">
                    Lihat detail
                    <AdminIcon name="arrow-right" className="h-4 w-4" />
                  </span>
                </Link>
              </AdminCard>
            ))}
          </div>

          <AdminCard className="hidden overflow-hidden md:block">
            <div className="overflow-x-auto">
              <table className="w-full min-w-[850px] text-left text-sm">
                <thead className="bg-[#F6F7F5] text-xs font-semibold text-[#667085]">
                  <tr>
                    <th className="px-5 py-3 sm:px-6">No. Pendaftaran</th>
                    <th className="px-5 py-3">Nama Lengkap</th>
                    <th className="px-5 py-3">No. WhatsApp</th>
                    <th className="px-5 py-3">Verifikasi Berkas</th>
                    <th className="px-5 py-3">Penerimaan</th>
                    <th className="px-5 py-3 text-right sm:px-6">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {applicants.map((applicant) => (
                    <tr key={applicant.id} className="h-14 transition-colors hover:bg-[#F6F7F5]">
                      <td className="whitespace-nowrap px-5 py-2.5 font-mono text-[#667085] sm:px-6">
                        {applicant.nomor_pendaftaran}
                      </td>
                      <td className="px-5 py-2.5 font-semibold text-[#101820]">{applicant.nama_lengkap}</td>
                      <td className="whitespace-nowrap px-5 py-2.5 text-[#667085]">{applicant.no_whatsapp}</td>
                      <td className="px-5 py-2.5">
                        <AdminBadge tone={VERIFICATION_TONE[applicant.status_verifikasi as StatusVerifikasi]}>
                          {LABEL_VERIFIKASI[applicant.status_verifikasi as StatusVerifikasi]}
                        </AdminBadge>
                      </td>
                      <td className="px-5 py-2.5">
                        <AdminBadge tone={ACCEPTANCE_TONE[applicant.status_penerimaan as StatusPenerimaan]}>
                          {LABEL_PENERIMAAN[applicant.status_penerimaan as StatusPenerimaan]}
                        </AdminBadge>
                      </td>
                      <td className="px-5 py-2.5 text-right sm:px-6">
                        <Link
                          href={`/admin/pendaftar/${applicant.id}`}
                          className="inline-flex min-h-11 items-center gap-1.5 rounded-lg px-2.5 text-sm font-semibold text-[#00880F] transition-colors hover:bg-[#E9F8EB] focus:outline-none focus:ring-4 focus:ring-[#00AA13]/15"
                        >
                          Lihat detail
                          <AdminIcon name="arrow-right" className="h-4 w-4" />
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </AdminCard>
        </>
      ) : hasFilters ? (
        <AdminCard className="px-6 py-12 text-center sm:py-16">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-[#E9F8EB] text-[#00880F]">
            <AdminIcon name="search" className="h-6 w-6" />
          </div>
          <h2 className="admin-display mt-4 text-lg font-bold text-[#101820]">Tidak ada pendaftar yang sesuai</h2>
          <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-[#667085]">
            Ubah kata kunci atau status filter, lalu coba kembali untuk melihat pendaftar yang sesuai.
          </p>
          <Link href="/admin/pendaftar" className={`${adminSecondaryButtonCls} mt-5`}>
            Hapus Filter
          </Link>
        </AdminCard>
      ) : (
        <AdminCard className="px-6 py-12 text-center sm:py-16">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-[#E9F8EB] text-[#00880F]">
            <AdminIcon name="users" className="h-6 w-6" />
          </div>
          <h2 className="admin-display mt-4 text-lg font-bold text-[#101820]">Belum ada data pendaftar</h2>
          <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-[#667085]">
            Data calon siswa yang mendaftar akan tampil di halaman ini.
          </p>
        </AdminCard>
      )}
    </div>
  );
}
