import Link from "next/link";
import { notFound } from "next/navigation";
import { createAdminClient } from "@/lib/supabase/admin";
import { LABEL_DOKUMEN } from "@/lib/files";
import type { Dokumen, Pendaftar } from "@/lib/types";
import StatusForm from "@/components/admin/StatusForm";
import { Badge } from "@/components/ui";
import { LABEL_PENERIMAAN, LABEL_VERIFIKASI, type StatusPenerimaan, type StatusVerifikasi } from "@/lib/status";

export const dynamic = "force-dynamic";

const WARNA_VERIFIKASI = {
  menunggu: "abu",
  terverifikasi: "hijau",
  perlu_perbaikan: "kuning",
} as const;

const WARNA_PENERIMAAN = {
  menunggu: "abu",
  diterima: "hijau",
  tidak_diterima: "merah",
} as const;

export default async function DetailPendaftar({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = createAdminClient();

  const { data: pendaftar } = await supabase
    .from("pendaftar")
    .select("*")
    .eq("id", id)
    .maybeSingle<Pendaftar>();

  if (!pendaftar) notFound();

  const { data: dokumen } = await supabase
    .from("dokumen")
    .select("*")
    .eq("pendaftar_id", id)
    .returns<Dokumen[]>();

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
      {/* Top Header Navigation */}
      <div className="flex flex-wrap items-center justify-between gap-4 rounded-3xl bg-white p-6 shadow-sm border border-slate-200">
        <div>
          <Link
            href="/admin/pendaftar"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-emerald-700 transition-colors mb-2"
          >
            <span>←</span>
            <span>Kembali ke Daftar Pendaftar</span>
          </Link>
          <div className="flex flex-wrap items-center gap-3">
            <h1 className="text-2xl font-extrabold text-slate-900">{pendaftar.nama_lengkap}</h1>
            <span className="font-mono text-sm font-bold text-emerald-700 bg-emerald-50 px-3 py-1 rounded-xl border border-emerald-200">
              {pendaftar.nomor_pendaftaran}
            </span>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <Badge warna={WARNA_VERIFIKASI[pendaftar.status_verifikasi as StatusVerifikasi]}>
            Verifikasi: {LABEL_VERIFIKASI[pendaftar.status_verifikasi as StatusVerifikasi]}
          </Badge>
          <Badge warna={WARNA_PENERIMAAN[pendaftar.status_penerimaan as StatusPenerimaan]}>
            Penerimaan: {LABEL_PENERIMAAN[pendaftar.status_penerimaan as StatusPenerimaan]}
          </Badge>
        </div>
      </div>

      {/* Grid Dua Kolom */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Kolom Kiri (2 Span): Data Calon Siswa & Ortu */}
        <div className="lg:col-span-2 space-y-6">
          {/* Card Data Siswa */}
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="flex items-center gap-2 border-b border-slate-100 pb-3 mb-4">
              <span className="text-xl">👧🏻</span>
              <h2 className="font-bold text-slate-900">Data Calon Siswa</h2>
            </div>
            <table className="w-full text-sm">
              <tbody className="divide-y divide-slate-100">
                {rincianSiswa.map(([label, nilai]) => (
                  <tr key={label}>
                    <td className="w-44 py-2.5 pr-3 text-slate-500 font-medium">{label}</td>
                    <td className="py-2.5 font-semibold text-slate-900">{nilai}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Card Data Ortu */}
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="flex items-center gap-2 border-b border-slate-100 pb-3 mb-4">
              <span className="text-xl">👨‍👩‍👧</span>
              <h2 className="font-bold text-slate-900">Data Orang Tua / Wali & Kontak</h2>
            </div>
            <table className="w-full text-sm">
              <tbody className="divide-y divide-slate-100">
                {rincianOrtu.map(([label, nilai]) => (
                  <tr key={label}>
                    <td className="w-44 py-2.5 pr-3 text-slate-500 font-medium">{label}</td>
                    <td className="py-2.5 font-semibold text-slate-900">{nilai}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Kolom Kanan (1 Span): Dokumen Upload & StatusForm */}
        <div className="space-y-6">
          {/* Card Dokumen Upload */}
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="flex items-center gap-2 border-b border-slate-100 pb-3 mb-4">
              <span className="text-xl">📁</span>
              <h2 className="font-bold text-slate-900">Dokumen Pendaftaran</h2>
            </div>
            <ul className="space-y-3">
              {dokumenDenganUrl.map((d) => (
                <li
                  key={d.id}
                  className="flex items-center justify-between gap-3 rounded-xl border border-slate-100 bg-slate-50/80 p-3 text-sm"
                >
                  <span className="font-medium text-slate-800">{LABEL_DOKUMEN[d.jenis]}</span>
                  {d.url ? (
                    <a
                      href={d.url}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-1 rounded-lg bg-emerald-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-emerald-500 transition-colors shadow-sm"
                    >
                      <span>Lihat File</span>
                      <span>↗</span>
                    </a>
                  ) : (
                    <span className="text-xs font-semibold text-rose-600">Gagal Memuat</span>
                  )}
                </li>
              ))}
              {dokumenDenganUrl.length === 0 && (
                <li className="p-4 text-center text-xs text-slate-500">Belum ada dokumen yang diunggah.</li>
              )}
            </ul>
          </div>

          {/* Form Ubah Status */}
          <StatusForm
            id={pendaftar.id}
            status_verifikasi={pendaftar.status_verifikasi}
            status_penerimaan={pendaftar.status_penerimaan}
            catatan_admin={pendaftar.catatan_admin ?? ""}
          />
        </div>
      </div>
    </div>
  );
}
