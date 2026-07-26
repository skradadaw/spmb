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

const WARNA_VERIFIKASI = { menunggu: "abu", terverifikasi: "hijau", perlu_perbaikan: "kuning" } as const;
const WARNA_PENERIMAAN = { menunggu: "abu", diterima: "hijau", tidak_diterima: "merah" } as const;

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
      "id, nomor_pendaftaran, nama_lengkap, no_whatsapp, status_verifikasi, status_penerimaan"
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
    <div>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-xl font-bold text-emerald-900">Pendaftar</h1>
        <a
          href={`/admin/pendaftar/export?${paramExport.toString()}`}
          className="rounded-xl bg-emerald-700 px-4 py-2 text-sm font-semibold text-white hover:bg-emerald-800"
        >
          Export Excel
        </a>
      </div>

      {/* Filter */}
      <form method="get" className="mt-4 grid grid-cols-1 gap-3 rounded-2xl bg-white p-4 shadow-sm sm:grid-cols-4">
        <input
          name="q"
          defaultValue={q}
          placeholder="Cari nama / nomor..."
          className={inputCls}
        />
        <select name="verifikasi" defaultValue={verifikasi ?? ""} className={inputCls}>
          <option value="">Semua Verifikasi</option>
          {STATUS_VERIFIKASI.map((s) => (
            <option key={s} value={s}>{LABEL_VERIFIKASI[s]}</option>
          ))}
        </select>
        <select name="penerimaan" defaultValue={penerimaan ?? ""} className={inputCls}>
          <option value="">Semua Penerimaan</option>
          {STATUS_PENERIMAAN.map((s) => (
            <option key={s} value={s}>{LABEL_PENERIMAAN[s]}</option>
          ))}
        </select>
        <button className="rounded-lg bg-emerald-700 px-4 py-2 font-medium text-white hover:bg-emerald-800">
          Terapkan
        </button>
      </form>

      {/* Daftar: kartu di HP, tabel di layar besar */}
      <div className="mt-4 space-y-3 md:hidden">
        {(daftar ?? []).map((p) => (
          <Link
            key={p.id}
            href={`/admin/pendaftar/${p.id}`}
            className="block rounded-2xl bg-white p-4 shadow-sm"
          >
            <div className="flex items-center justify-between">
              <p className="font-semibold">{p.nama_lengkap}</p>
              <span className="text-xs text-gray-500">{p.nomor_pendaftaran}</span>
            </div>
            <div className="mt-2 flex flex-wrap gap-2">
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

      <div className="mt-4 hidden overflow-hidden rounded-2xl bg-white shadow-sm md:block">
        <table className="w-full text-sm">
          <thead className="bg-emerald-50 text-left text-emerald-900">
            <tr>
              <th className="p-3">Nomor</th>
              <th className="p-3">Nama</th>
              <th className="p-3">WhatsApp</th>
              <th className="p-3">Verifikasi</th>
              <th className="p-3">Penerimaan</th>
              <th className="p-3"></th>
            </tr>
          </thead>
          <tbody>
            {(daftar ?? []).map((p) => (
              <tr key={p.id} className="border-t border-gray-100">
                <td className="p-3 font-mono text-xs">{p.nomor_pendaftaran}</td>
                <td className="p-3 font-medium">{p.nama_lengkap}</td>
                <td className="p-3">{p.no_whatsapp}</td>
                <td className="p-3">
                  <Badge warna={WARNA_VERIFIKASI[p.status_verifikasi as StatusVerifikasi]}>
                    {LABEL_VERIFIKASI[p.status_verifikasi as StatusVerifikasi]}
                  </Badge>
                </td>
                <td className="p-3">
                  <Badge warna={WARNA_PENERIMAAN[p.status_penerimaan as StatusPenerimaan]}>
                    {LABEL_PENERIMAAN[p.status_penerimaan as StatusPenerimaan]}
                  </Badge>
                </td>
                <td className="p-3">
                  <Link href={`/admin/pendaftar/${p.id}`} className="text-emerald-700 underline">
                    Detail
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {(daftar ?? []).length === 0 && (
        <p className="mt-6 text-center text-gray-500">Tidak ada pendaftar yang cocok.</p>
      )}
    </div>
  );
}
