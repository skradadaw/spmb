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
      <div className="flex flex-wrap items-center justify-between gap-4 rounded-3xl bg-white p-6 shadow-sm border border-slate-200/80">
        <div>
          <h1 className="text-xl font-black text-[#1c1a2e] sm:text-2xl">Daftar Pendaftar SPMB</h1>
          <p className="text-xs font-medium text-slate-400 sm:text-sm mt-0.5">
            Total {daftar?.length ?? 0} data calon siswa yang sesuai kriteria pencarian.
          </p>
        </div>
        <a
          href={`/admin/pendaftar/export?${paramExport.toString()}`}
          className="inline-flex items-center gap-2 rounded-2xl bg-[#c8ee44] px-5 py-2.5 text-xs font-black text-[#1c1a2e] shadow-md shadow-[#c8ee44]/20 hover:bg-[#b5da35] transition-all"
        >
          <span>📊</span>
          <span>Export Excel (.xlsx)</span>
        </a>
      </div>

      {/* Toolbar Filter Maglo Style */}
      <form
        method="get"
        className="grid grid-cols-1 gap-3 rounded-3xl bg-white p-4 shadow-sm border border-slate-200/80 sm:grid-cols-4"
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
          <button className="flex-1 rounded-2xl bg-[#1c1a2e] py-2.5 text-xs font-bold text-white hover:bg-[#282541] transition-all shadow-sm">
            Terapkan Filter
          </button>
          {(q || verifikasi || penerimaan) && (
            <Link
              href="/admin/pendaftar"
              className="rounded-2xl border border-slate-300 px-3.5 py-2.5 text-xs font-bold text-slate-600 hover:bg-slate-100 transition-colors"
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
            className="block rounded-3xl bg-white p-5 shadow-sm border border-slate-200/80 hover:border-[#c8ee44] transition-all"
          >
            <div className="flex items-center justify-between">
              <span className="font-mono text-xs font-black text-[#1c1a2e]">
                {p.nomor_pendaftaran}
              </span>
              <span className="text-[11px] font-semibold text-slate-400">
                {new Date(p.created_at).toLocaleDateString("id-ID")}
              </span>
            </div>
            <p className="mt-1.5 font-extrabold text-[#1c1a2e] text-base">{p.nama_lengkap}</p>
            <p className="text-xs text-slate-500 font-medium">WA: {p.no_whatsapp}</p>
            <div className="mt-3 flex flex-wrap gap-2 pt-3 border-t border-slate-100">
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

      {/* Tabel Data Layar Desktop (≥768px) Maglo Style */}
      <div className="hidden overflow-hidden rounded-3xl border border-slate-200/80 bg-white shadow-sm md:block">
        <table className="w-full text-xs font-medium">
          <thead className="bg-[#1c1a2e] text-left text-[11px] font-bold uppercase tracking-wider text-slate-300">
            <tr>
              <th className="p-4.5">No. Pendaftaran</th>
              <th className="p-4.5">Nama Lengkap</th>
              <th className="p-4.5">No. WhatsApp</th>
              <th className="p-4.5">Verifikasi Berkas</th>
              <th className="p-4.5">Penerimaan</th>
              <th className="p-4.5 text-right">Aksi</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {(daftar ?? []).map((p) => (
              <tr key={p.id} className="hover:bg-slate-50/80 transition-colors">
                <td className="p-4.5 font-mono text-xs font-black text-[#1c1a2e]">
                  {p.nomor_pendaftaran}
                </td>
                <td className="p-4.5 font-bold text-[#1c1a2e]">{p.nama_lengkap}</td>
                <td className="p-4.5 text-slate-600">{p.no_whatsapp}</td>
                <td className="p-4.5">
                  <Badge warna={WARNA_VERIFIKASI[p.status_verifikasi as StatusVerifikasi]}>
                    {LABEL_VERIFIKASI[p.status_verifikasi as StatusVerifikasi]}
                  </Badge>
                </td>
                <td className="p-4.5">
                  <Badge warna={WARNA_PENERIMAAN[p.status_penerimaan as StatusPenerimaan]}>
                    {LABEL_PENERIMAAN[p.status_penerimaan as StatusPenerimaan]}
                  </Badge>
                </td>
                <td className="p-4.5 text-right">
                  <Link
                    href={`/admin/pendaftar/${p.id}`}
                    className="inline-flex items-center gap-1.5 rounded-xl bg-[#c8ee44] px-3.5 py-1.5 text-xs font-extrabold text-[#1c1a2e] hover:bg-[#b5da35] transition-all shadow-sm"
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
        <div className="rounded-3xl border border-slate-200/80 bg-white p-12 text-center shadow-sm">
          <p className="text-3xl">🔍</p>
          <p className="mt-2 text-base font-black text-[#1c1a2e]">Tidak ada pendaftar yang cocok</p>
          <p className="mt-1 text-xs font-medium text-slate-400">Coba atur ulang kata kunci pencarian atau filter status Anda.</p>
        </div>
      )}
    </div>
  );
}
