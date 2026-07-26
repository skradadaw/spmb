import Link from "next/link";
import { createAdminClient } from "@/lib/supabase/admin";
import { Badge } from "@/components/ui";
import { LABEL_VERIFIKASI, type StatusVerifikasi } from "@/lib/status";
import MagloStatCard from "@/components/admin/MagloStatCard";
import ApplicantChart from "@/components/admin/ApplicantChart";
import QuickActionDeck from "@/components/admin/QuickActionDeck";

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

  const totalVal = total.count ?? 0;
  const belumVal = belumVerifikasi.count ?? 0;
  const diterimaVal = diterima.count ?? 0;
  const perbaikanVal = perluPerbaikan.count ?? 0;

  // Query 5 pendaftar terbaru yang belum diverifikasi
  const { data: terbarubelum } = await supabase
    .from("pendaftar")
    .select("id, nomor_pendaftaran, nama_lengkap, asal_tk, created_at, status_verifikasi")
    .eq("status_verifikasi", "menunggu")
    .order("created_at", { ascending: false })
    .limit(5);

  // Data analitik dummy chart berbasis data riil
  const chartData = [
    { label: "Okt 26", terverifikasi: 2, menunggu: 1, diterima: 2 },
    { label: "Nov 26", terverifikasi: 3, menunggu: 1, diterima: 2 },
    { label: "Des 26", terverifikasi: 4, menunggu: 2, diterima: 3 },
    { label: "Jan 27", terverifikasi: totalVal, menunggu: belumVal, diterima: diterimaVal },
  ];

  return (
    <div className="space-y-8">
      {/* Maglo Baris 1: Grid Kartu Statistik Metrik */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
        <MagloStatCard
          title="Total Calon Siswa"
          value={totalVal}
          total={totalVal}
          icon="👥"
          trendText="+100% TA 27/28"
          colorTheme="dark"
        />
        <MagloStatCard
          title="Menunggu Verifikasi"
          value={belumVal}
          total={totalVal}
          icon="⏳"
          trendText="Tindakan Panitia"
          colorTheme="amber"
        />
        <MagloStatCard
          title="Siswa Diterima"
          value={diterimaVal}
          total={totalVal}
          icon="🎉"
          trendText="Lulus Seleksi"
          colorTheme="lime"
        />
      </div>

      {/* Maglo Baris 2: Grid Utam (Kiri 2 Span: Analitik & Tabel; Kanan 1 Span: Side Deck) */}
      <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
        {/* Konten Kiri (2 Span) */}
        <div className="lg:col-span-2 space-y-8">
          {/* Grafik Analitik Tren Pendaftaran */}
          <ApplicantChart data={chartData} />

          {/* Tabel Pendaftar Perlu Verifikasi Segera */}
          <div className="rounded-3xl border border-slate-200/80 bg-white p-6 shadow-sm">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4 mb-4">
              <div>
                <h3 className="text-base font-bold text-slate-900">Perlu Verifikasi Segera</h3>
                <p className="text-xs text-slate-400">Berkas pendaftar baru yang menunggu tindakan panitia</p>
              </div>
              <Link href="/admin/pendaftar?verifikasi=menunggu" className="text-xs font-bold text-emerald-700 hover:underline">
                Lihat Semua →
              </Link>
            </div>

            {(terbarubelum ?? []).length > 0 ? (
              <div className="divide-y divide-slate-100">
                {(terbarubelum ?? []).map((p) => (
                  <div key={p.id} className="flex flex-wrap items-center justify-between gap-3 py-3.5 hover:bg-slate-50/50 px-2 rounded-xl transition-colors">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-xs font-bold text-emerald-700">{p.nomor_pendaftaran}</span>
                        <Badge warna="abu">{LABEL_VERIFIKASI[p.status_verifikasi as StatusVerifikasi]}</Badge>
                      </div>
                      <p className="mt-1 font-bold text-slate-900 text-sm">{p.nama_lengkap}</p>
                      <p className="text-xs text-slate-400">TK: {p.asal_tk || "-"}</p>
                    </div>
                    <Link
                      href={`/admin/pendaftar/${p.id}`}
                      className="rounded-xl bg-emerald-600 px-4 py-2 text-xs font-semibold text-white hover:bg-emerald-500 transition-colors shadow-sm"
                    >
                      Verifikasi Berkas →
                    </Link>
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-8 text-center text-xs text-slate-500">
                ✨ Semua berkas pendaftar saat ini telah diverifikasi!
              </div>
            )}
          </div>
        </div>

        {/* Panel Samping Kanan (1 Span: QuickActionDeck Maglo) */}
        <div>
          <QuickActionDeck pendingCount={belumVal} totalCount={totalVal} />
        </div>
      </div>
    </div>
  );
}
