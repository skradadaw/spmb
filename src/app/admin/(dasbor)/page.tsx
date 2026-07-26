import Link from "next/link";
import { createAdminClient } from "@/lib/supabase/admin";
import { Badge } from "@/components/ui";
import { LABEL_VERIFIKASI, type StatusVerifikasi } from "@/lib/status";

export const dynamic = "force-dynamic";

export default async function AdminHome() {
  const supabase = createAdminClient();

  const hitung = (filter?: { kolom: string; nilai: string }) => {
    let q = supabase.from("pendaftar").select("id", { count: "exact", head: true });
    if (filter) q = q.eq(filter.kolom, filter.nilai);
    return q;
  };

  const [total, belumVerifikasi, diterima, perluPerbaikan] = await Promise.all([
    hitung(),
    hitung({ kolom: "status_verifikasi", nilai: "menunggu" }),
    hitung({ kolom: "status_penerimaan", nilai: "diterima" }),
    hitung({ kolom: "status_verifikasi", nilai: "perlu_perbaikan" }),
  ]);

  // Query 5 pendaftar terbaru yang belum diverifikasi
  const { data: terbarubelum } = await supabase
    .from("pendaftar")
    .select("id, nomor_pendaftaran, nama_lengkap, asal_tk, created_at, status_verifikasi")
    .eq("status_verifikasi", "menunggu")
    .order("created_at", { ascending: false })
    .limit(5);

  const kartu = [
    {
      label: "Total Pendaftar",
      nilai: total.count ?? 0,
      sub: "Calon Murid Terdaftar",
      icon: "👥",
      color: "border-l-4 border-l-slate-700 bg-white",
      textCol: "text-slate-900",
    },
    {
      label: "Menunggu Verifikasi",
      nilai: belumVerifikasi.count ?? 0,
      sub: "Perlu Tindakan Panitia",
      icon: "⏳",
      color: "border-l-4 border-l-amber-500 bg-white",
      textCol: "text-amber-600",
    },
    {
      label: "Diterima",
      nilai: diterima.count ?? 0,
      sub: "Lulus Seleksi SPMB",
      icon: "🎉",
      color: "border-l-4 border-l-emerald-600 bg-white",
      textCol: "text-emerald-700",
    },
    {
      label: "Perlu Perbaikan Berkas",
      nilai: perluPerbaikan.count ?? 0,
      sub: "Menunggu Upload Ulang",
      icon: "⚠️",
      color: "border-l-4 border-l-rose-500 bg-white",
      textCol: "text-rose-600",
    },
  ];

  return (
    <div className="space-y-8">
      {/* Banner Halo Panitia */}
      <div className="relative overflow-hidden rounded-3xl bg-slate-900 p-6 sm:p-8 text-white shadow-xl">
        <div className="relative z-10 max-w-2xl">
          <span className="inline-block rounded-full bg-emerald-500/20 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-emerald-300">
            Tahun Ajaran 2027/2028
          </span>
          <h1 className="mt-3 text-2xl font-extrabold sm:text-3xl">
            Selamat Datang di Konsol SPMB
          </h1>
          <p className="mt-2 text-sm text-slate-300 sm:text-base">
            Pantau statistik pendaftaran, verifikasi dokumen calon siswa, dan kelola informasi penerimaan secara real-time.
          </p>
          <div className="mt-6 flex flex-wrap gap-3">
            <Link
              href="/admin/pendaftar"
              className="rounded-xl bg-emerald-600 px-5 py-2.5 text-sm font-semibold text-white shadow-md hover:bg-emerald-500 transition-colors"
            >
              Kelola Pendaftar →
            </Link>
            <Link
              href="/admin/pendaftar/export"
              className="rounded-xl border border-slate-700 bg-slate-800/80 px-5 py-2.5 text-sm font-semibold text-slate-200 hover:bg-slate-800 transition-colors"
            >
              📊 Export Excel
            </Link>
          </div>
        </div>
        {/* Latar Dekorasi Hiasan */}
        <div className="absolute -right-10 -bottom-10 h-64 w-64 rounded-full bg-emerald-500/10 blur-3xl" />
      </div>

      {/* Grid Statistik */}
      <div>
        <h2 className="text-lg font-bold text-slate-900">Ringkasan Data</h2>
        <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {kartu.map((k) => (
            <div
              key={k.label}
              className={`rounded-2xl p-5 shadow-sm transition-all hover:shadow-md ${k.color}`}
            >
              <div className="flex items-center justify-between">
                <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                  {k.label}
                </p>
                <span className="text-xl">{k.icon}</span>
              </div>
              <p className={`mt-2 text-3xl font-extrabold tracking-tight ${k.textCol}`}>
                {k.nilai}
              </p>
              <p className="mt-1 text-xs text-slate-500">{k.sub}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Grid Dua Kolom: Pendaftar Baru Menunggu & Akses Cepat */}
      <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
        {/* Kolom Kiri: Pendaftar Terbaru yang Menunggu Verifikasi */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-slate-900">Perlu Verifikasi Segera</h2>
            <Link href="/admin/pendaftar?verifikasi=menunggu" className="text-xs font-semibold text-emerald-700 hover:underline">
              Lihat Semua →
            </Link>
          </div>

          <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
            {(terbarubelum ?? []).length > 0 ? (
              <div className="divide-y divide-slate-100">
                {(terbarubelum ?? []).map((p) => (
                  <div key={p.id} className="flex items-center justify-between p-4 hover:bg-slate-50/80 transition-colors">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-xs font-bold text-emerald-700">{p.nomor_pendaftaran}</span>
                        <Badge warna="abu">{LABEL_VERIFIKASI[p.status_verifikasi as StatusVerifikasi]}</Badge>
                      </div>
                      <p className="mt-1 font-semibold text-slate-900">{p.nama_lengkap}</p>
                      <p className="text-xs text-slate-500">Asal TK: {p.asal_tk || "-"}</p>
                    </div>
                    <Link
                      href={`/admin/pendaftar/${p.id}`}
                      className="rounded-xl border border-emerald-200 bg-emerald-50 px-3.5 py-1.5 text-xs font-semibold text-emerald-700 hover:bg-emerald-100 transition-colors"
                    >
                      Verifikasi
                    </Link>
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-8 text-center text-sm text-slate-500">
                ✨ Semua berkas pendaftar saat ini telah diverifikasi!
              </div>
            )}
          </div>
        </div>

        {/* Kolom Kanan: Akses Pintas Panitia */}
        <div className="space-y-4">
          <h2 className="text-lg font-bold text-slate-900">Pintas Tindakan</h2>
          <div className="space-y-3">
            <Link
              href="/admin/pendaftar"
              className="flex items-center justify-between rounded-2xl border border-slate-200 bg-white p-4 shadow-sm hover:border-emerald-300 hover:shadow-md transition-all group"
            >
              <div className="flex items-center gap-3">
                <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-100 text-emerald-800 font-bold">
                  👥
                </span>
                <div>
                  <p className="font-semibold text-slate-900 group-hover:text-emerald-700">Tabel Pendaftar</p>
                  <p className="text-xs text-slate-500">Cari, filter, dan ubah status</p>
                </div>
              </div>
              <span className="text-slate-400 group-hover:translate-x-1 transition-transform">→</span>
            </Link>

            <Link
              href="/admin/konten"
              className="flex items-center justify-between rounded-2xl border border-slate-200 bg-white p-4 shadow-sm hover:border-emerald-300 hover:shadow-md transition-all group"
            >
              <div className="flex items-center gap-3">
                <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-100 text-blue-800 font-bold">
                  📝
                </span>
                <div>
                  <p className="font-semibold text-slate-900 group-hover:text-emerald-700">Editor Konten</p>
                  <p className="text-xs text-slate-500">Jadwal, syarat, biaya & FAQ</p>
                </div>
              </div>
              <span className="text-slate-400 group-hover:translate-x-1 transition-transform">→</span>
            </Link>

            <Link
              href="/admin/pendaftar/export"
              className="flex items-center justify-between rounded-2xl border border-slate-200 bg-white p-4 shadow-sm hover:border-emerald-300 hover:shadow-md transition-all group"
            >
              <div className="flex items-center gap-3">
                <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-100 text-amber-800 font-bold">
                  📊
                </span>
                <div>
                  <p className="font-semibold text-slate-900 group-hover:text-emerald-700">Unduh Excel (.xlsx)</p>
                  <p className="text-xs text-slate-500">Export rekapitulasi pendaftar</p>
                </div>
              </div>
              <span className="text-slate-400 group-hover:translate-x-1 transition-transform">→</span>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
