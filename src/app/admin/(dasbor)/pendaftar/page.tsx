import Link from "next/link";
import { createAdminClient } from "@/lib/supabase/admin";
import {
  LABEL_PENERIMAAN,
  LABEL_VERIFIKASI,
  STATUS_PENERIMAAN,
  STATUS_VERIFIKASI,
  type StatusPenerimaan,
  type StatusVerifikasi,
} from "@/lib/status";
import { Badge, inputCls } from "@/components/ui";

export const dynamic = "force-dynamic";

type Params = { q?: string; verifikasi?: string; penerimaan?: string };

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
  const { data: daftar } = await query;

  const paramExport = new URLSearchParams();
  if (q) paramExport.set("q", q);
  if (verifikasi) paramExport.set("verifikasi", verifikasi);
  if (penerimaan) paramExport.set("penerimaan", penerimaan);

  return (
    <div className="space-y-6">
      {/* Header & Export Action */}
      <div className="flex flex-wrap items-center justify-between gap-4 rounded-3xl bg-white p-6 shadow-sm border border-slate-200">
        <div>
          <h1 className="text-xl font-extrabold text-slate-900 sm:text-2xl">Daftar Pendaftar SPMB</h1>
          <p className="text-xs text-slate-500 sm:text-sm mt-0.5">
            Total {daftar?.length ?? 0} data calon siswa yang sesuai kriteria pencarian.
          </p>
        </div>
        <a
          href={`/admin/pendaftar/export?${paramExport.toString()}`}
          className="inline-flex items-center gap-2 rounded-xl bg-emerald-600 px-5 py-2.5 text-sm font-semibold text-white shadow-md hover:bg-emerald-500 transition-colors"
        >
          <span>📊</span>
          <span>Export Excel (.xlsx)</span>
        </a>
      </div>

      {/* Toolbar Filter */}
      <form
        method="get"
        className="grid grid-cols-1 gap-3 rounded-2xl bg-white p-4 shadow-sm border border-slate-200 sm:grid-cols-4"
      >
        <div className="sm:col-span-1">
          <input
            name="q"
            defaultValue={q}
            placeholder="🔍 Cari nama / nomor..."
            className={inputCls}
          />
        </div>
        <div>
          <select name="verifikasi" defaultValue={verifikasi ?? ""} className={inputCls}>
            <option value="">Semua Status Verifikasi</option>
            {STATUS_VERIFIKASI.map((s) => (
              <option key={s} value={s}>
                {LABEL_VERIFIKASI[s]}
              </option>
            ))}
          </select>
        </div>
        <div>
          <select name="penerimaan" defaultValue={penerimaan ?? ""} className={inputCls}>
            <option value="">Semua Status Penerimaan</option>
            {STATUS_PENERIMAAN.map((s) => (
              <option key={s} value={s}>
                {LABEL_PENERIMAAN[s]}
              </option>
            ))}
          </select>
        </div>
        <div className="flex items-center gap-2">
          <button className="flex-1 rounded-xl bg-slate-900 py-2.5 text-sm font-semibold text-white hover:bg-slate-800 transition-colors">
            Terapkan Filter
          </button>
          {(q || verifikasi || penerimaan) && (
            <Link
              href="/admin/pendaftar"
              className="rounded-xl border border-slate-300 px-3 py-2.5 text-sm font-medium text-slate-600 hover:bg-slate-100"
              title="Reset Filter"
            >
              🔄
            </Link>
          )}
        </div>
      </form>

      {/* Kartu Khusus Layar Mobile (<768px) */}
      <div className="space-y-3 md:hidden">
        {(daftar ?? []).map((p) => (
          <Link
            key={p.id}
            href={`/admin/pendaftar/${p.id}`}
            className="block rounded-2xl bg-white p-4 shadow-sm border border-slate-200 hover:border-emerald-400 transition-all"
          >
            <div className="flex items-center justify-between">
              <span className="font-mono text-xs font-bold text-emerald-700">
                {p.nomor_pendaftaran}
              </span>
              <span className="text-[11px] text-slate-400">
                {new Date(p.created_at).toLocaleDateString("id-ID")}
              </span>
            </div>
            <p className="mt-1 font-bold text-slate-900">{p.nama_lengkap}</p>
            <p className="text-xs text-slate-500">WA: {p.no_whatsapp}</p>
            <div className="mt-3 flex flex-wrap gap-2 pt-2 border-t border-slate-100">
              <Badge warna={WARNA_VERIFIKASI[p.status_verifikasi as StatusVerifikasi]}>
                {LABEL_VERIFIKASI[p.status_verifikasi as StatusVerifikasi]}
              </Badge>
              <Badge warna={WARNA_PENERIMAAN[p.status_penerimaan as StatusPenerimaan]}>
                {LABEL_PENERIMAAN[p.status_penerimaan as StatusPenerimaan]}
              </Badge>
            </div>
          </Link>
        ))}
      </div>

      {/* Tabel Data Layar Desktop (≥768px) */}
      <div className="hidden overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm md:block">
        <table className="w-full text-sm">
          <thead className="bg-slate-900 text-left text-xs font-semibold uppercase tracking-wider text-slate-200">
            <tr>
              <th className="p-4">No. Pendaftaran</th>
              <th className="p-4">Nama Lengkap</th>
              <th className="p-4">No. WhatsApp</th>
              <th className="p-4">Verifikasi Berkas</th>
              <th className="p-4">Penerimaan</th>
              <th className="p-4 text-right">Aksi</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {(daftar ?? []).map((p) => (
              <tr key={p.id} className="hover:bg-slate-50/80 transition-colors">
                <td className="p-4 font-mono text-xs font-bold text-emerald-700">
                  {p.nomor_pendaftaran}
                </td>
                <td className="p-4 font-semibold text-slate-900">{p.nama_lengkap}</td>
                <td className="p-4 text-slate-600">{p.no_whatsapp}</td>
                <td className="p-4">
                  <Badge warna={WARNA_VERIFIKASI[p.status_verifikasi as StatusVerifikasi]}>
                    {LABEL_VERIFIKASI[p.status_verifikasi as StatusVerifikasi]}
                  </Badge>
                </td>
                <td className="p-4">
                  <Badge warna={WARNA_PENERIMAAN[p.status_penerimaan as StatusPenerimaan]}>
                    {LABEL_PENERIMAAN[p.status_penerimaan as StatusPenerimaan]}
                  </Badge>
                </td>
                <td className="p-4 text-right">
                  <Link
                    href={`/admin/pendaftar/${p.id}`}
                    className="inline-flex items-center gap-1 rounded-xl bg-slate-100 px-3 py-1.5 text-xs font-semibold text-slate-800 hover:bg-emerald-600 hover:text-white transition-colors"
                  >
                    <span>Detail</span>
                    <span>→</span>
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {(daftar ?? []).length === 0 && (
        <div className="rounded-2xl border border-slate-200 bg-white p-12 text-center shadow-sm">
          <p className="text-3xl">🔍</p>
          <p className="mt-2 text-base font-bold text-slate-900">Tidak ada pendaftar yang cocok</p>
          <p className="mt-1 text-xs text-slate-500">Coba atur ulang kata kunci pencarian atau filter status Anda.</p>
        </div>
      )}
    </div>
  );
}
