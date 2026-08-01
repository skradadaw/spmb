import Link from "next/link";
import { notFound } from "next/navigation";
import { createAdminClient } from "@/lib/supabase/admin";
import { LABEL_DOKUMEN } from "@/lib/files";
import type { Dokumen, Pendaftar } from "@/lib/types";
import StatusForm from "@/components/admin/StatusForm";
import AdminIcon from "@/components/admin/AdminIcon";
import { AdminBadge, AdminCard } from "@/components/admin/AdminUI";
import { adminSecondaryButtonCls } from "@/components/admin/styles";
import { LABEL_PENERIMAAN, LABEL_VERIFIKASI, type StatusPenerimaan, type StatusVerifikasi } from "@/lib/status";

export const dynamic = "force-dynamic";

const TONE_VERIFIKASI = {
  menunggu: "warning",
  terverifikasi: "success",
  perlu_perbaikan: "info",
} as const;

const TONE_PENERIMAAN = {
  menunggu: "warning",
  diterima: "success",
  tidak_diterima: "danger",
} as const;

export default async function DetailPendaftar({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = createAdminClient();

  const { data: pendaftar, error: pendaftarError } = await supabase
    .from("pendaftar")
    .select("*")
    .eq("id", id)
    .maybeSingle<Pendaftar>();

  if (pendaftarError) {
    throw new Error("Gagal memuat detail pendaftar. Silakan coba lagi.");
  }
  if (!pendaftar) notFound();

  const { data: dokumen, error: dokumenError } = await supabase
    .from("dokumen")
    .select("*")
    .eq("pendaftar_id", id)
    .returns<Dokumen[]>();
  if (dokumenError) {
    throw new Error("Gagal memuat dokumen pendaftar. Silakan coba lagi.");
  }

  // Signed URL berumur pendek untuk preview dokumen
  const dokumenDenganUrl = await Promise.all(
    (dokumen ?? []).map(async (d) => {
      const { data } = await supabase.storage
        .from("dokumen")
        .createSignedUrl(d.path_storage, 300);
      return { ...d, url: data?.signedUrl ?? null };
    })
  );

  const rincianSiswa: [string, string][] = [
    ["NIK", pendaftar.nik],
    ["Tempat, Tanggal Lahir", `${pendaftar.tempat_lahir}, ${pendaftar.tanggal_lahir}`],
    ["Jenis Kelamin", pendaftar.jenis_kelamin === "L" ? "Laki-laki" : "Perempuan"],
    ["Alamat", pendaftar.alamat],
    ["Asal TK/RA", pendaftar.asal_tk ?? "-"],
    ["Tanggal Mendaftar", new Date(pendaftar.created_at).toLocaleString("id-ID")],
  ];

  const rincianOrtu: [string, string][] = [
    ["Ayah", `${pendaftar.nama_ayah} (${pendaftar.pekerjaan_ayah} - ${pendaftar.pendidikan_ayah})`],
    ["Ibu", `${pendaftar.nama_ibu} (${pendaftar.pekerjaan_ibu} - ${pendaftar.pendidikan_ibu})`],
    ["Wali", pendaftar.nama_wali ? `${pendaftar.nama_wali} (${pendaftar.pekerjaan_wali ?? "-"})` : "-"],
    ["No. WhatsApp", pendaftar.no_whatsapp],
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-5 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <Link
            href="/admin/pendaftar"
            className={`${adminSecondaryButtonCls} mb-4 min-h-11 px-3`}
          >
            <AdminIcon name="arrow-right" className="h-4 w-4 rotate-180" />
            Kembali ke Pendaftar
          </Link>
          <p className="text-sm font-semibold text-[#667085]">Detail pendaftar</p>
          <div className="mt-1 flex flex-wrap items-center gap-3">
            <h1 className="admin-display text-3xl font-bold text-[#101820]">{pendaftar.nama_lengkap}</h1>
            <span className="rounded-lg bg-slate-100 px-2.5 py-1 font-mono text-sm font-semibold text-[#101820]">
              {pendaftar.nomor_pendaftaran}
            </span>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <AdminBadge tone={TONE_VERIFIKASI[pendaftar.status_verifikasi as StatusVerifikasi]}>
            Verifikasi: {LABEL_VERIFIKASI[pendaftar.status_verifikasi as StatusVerifikasi]}
          </AdminBadge>
          <AdminBadge tone={TONE_PENERIMAAN[pendaftar.status_penerimaan as StatusPenerimaan]}>
            Penerimaan: {LABEL_PENERIMAAN[pendaftar.status_penerimaan as StatusPenerimaan]}
          </AdminBadge>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-[minmax(0,2fr)_minmax(320px,1fr)] lg:items-start">
        <div className="space-y-6">
          <AdminCard className="p-5 sm:p-6">
            <div className="mb-4 flex items-center gap-3 border-b border-slate-200 pb-4">
              <span className="flex min-h-11 min-w-11 items-center justify-center rounded-xl bg-green-50 text-[#00880F]">
                <AdminIcon name="student" />
              </span>
              <h2 className="admin-display text-xl font-bold text-[#101820]">Data Calon Siswa</h2>
            </div>
            <table className="w-full text-sm">
              <tbody className="divide-y divide-slate-200">
                {rincianSiswa.map(([label, nilai]) => (
                  <tr key={label}>
                    <th scope="row" className="w-40 py-3 pr-4 text-left align-top font-medium text-[#667085] sm:w-48">{label}</th>
                    <td className="py-3 font-semibold text-[#101820]">{nilai}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </AdminCard>

          <AdminCard className="p-5 sm:p-6">
            <div className="mb-4 flex items-center gap-3 border-b border-slate-200 pb-4">
              <span className="flex min-h-11 min-w-11 items-center justify-center rounded-xl bg-blue-50 text-blue-700">
                <AdminIcon name="users" />
              </span>
              <h2 className="admin-display text-xl font-bold text-[#101820]">Orang Tua dan Wali</h2>
            </div>
            <table className="w-full text-sm">
              <tbody className="divide-y divide-slate-200">
                {rincianOrtu.map(([label, nilai]) => (
                  <tr key={label}>
                    <th scope="row" className="w-40 py-3 pr-4 text-left align-top font-medium text-[#667085] sm:w-48">{label}</th>
                    <td className="py-3 font-semibold text-[#101820]">{nilai}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </AdminCard>

          <AdminCard className="p-5 sm:p-6">
            <div className="mb-4 flex items-center gap-3 border-b border-slate-200 pb-4">
              <span className="flex min-h-11 min-w-11 items-center justify-center rounded-xl bg-amber-50 text-amber-700">
                <AdminIcon name="file" />
              </span>
              <h2 className="admin-display text-xl font-bold text-[#101820]">Dokumen Pendaftaran</h2>
            </div>
            <ul className="space-y-3">
              {dokumenDenganUrl.map((d) => (
                <li
                  key={d.id}
                  className="flex flex-col gap-3 rounded-xl border border-slate-200 bg-slate-50 p-3 sm:flex-row sm:items-center sm:justify-between"
                >
                  <span className="text-sm font-semibold text-[#101820]">{LABEL_DOKUMEN[d.jenis]}</span>
                  {d.url ? (
                    <a
                      href={d.url}
                      target="_blank"
                      rel="noreferrer"
                      className={`${adminSecondaryButtonCls} min-h-11 self-start text-xs sm:self-auto`}
                    >
                      Lihat file
                      <AdminIcon name="arrow-right" className="h-4 w-4" />
                    </a>
                  ) : (
                    <span className="text-sm font-semibold text-red-700">Gagal memuat</span>
                  )}
                </li>
              ))}
              {dokumenDenganUrl.length === 0 && (
                <li className="rounded-xl border border-dashed border-slate-300 p-4 text-center text-sm text-[#667085]">Belum ada dokumen yang diunggah.</li>
              )}
            </ul>
          </AdminCard>
        </div>

        <aside className="lg:sticky lg:top-28">
          <StatusForm
            id={pendaftar.id}
            status_verifikasi={pendaftar.status_verifikasi}
            status_penerimaan={pendaftar.status_penerimaan}
            catatan_admin={pendaftar.catatan_admin ?? ""}
          />
        </aside>
      </div>
    </div>
  );
}
