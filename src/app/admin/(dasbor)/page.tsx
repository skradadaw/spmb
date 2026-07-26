import Link from "next/link";
import { createAdminClient } from "@/lib/supabase/admin";
import { Badge } from "@/components/ui";
import { LABEL_VERIFIKASI, type StatusVerifikasi } from "@/lib/status";
import MagloHeaderCards from "@/components/admin/MagloHeaderCards";
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

  const [total, belumVerifikasi, diterima] = await Promise.all([
    hitung(),
    hitung({ kolom: "status_verifikasi", nilai: "menunggu" }),
    hitung({ kolom: "status_penerimaan", nilai: "diterima" }),
  ]);

  const totalVal = total.count ?? 0;
  const belumVal = belumVerifikasi.count ?? 0;
  const diterimaVal = diterima.count ?? 0;

  // Query 5 pendaftar terbaru yang belum diverifikasi
  const { data: terbarubelum } = await supabase
    .from("pendaftar")
    .select("id, nomor_pendaftaran, nama_lengkap, asal_tk, created_at, status_verifikasi")
    .eq("status_verifikasi", "menunggu")
    .order("created_at", { ascending: false })
    .limit(5);

  return (
    <div className="space-y-8">
      {/* Maglo Header Cards (Unified 3-Section Stat Header) */}
      <MagloHeaderCards total={totalVal} menunggu={belumVal} diterima={diterimaVal} />

      {/* Maglo Main Grid Layout (2 Span Content + 1 Span Right Wallet Deck) */}
      <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
        {/* Left Column (2 Span) */}
        <div className="lg:col-span-2 space-y-8">
          {/* Dual Curved Line Working Capital Chart */}
          <ApplicantChart />

          {/* Maglo Recent Transactions Table */}
          <div className="rounded-3xl border border-slate-200/80 dark:border-[#282541] bg-white dark:bg-[#201e34] p-6 shadow-sm">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-[#282541] pb-4 mb-4">
              <div>
                <h3 className="text-base font-black text-[#1c1a2e] dark:text-white">Pendaftar Terbaru (Perlu Verifikasi)</h3>
                <p className="text-xs font-medium text-slate-400">Berkas calon siswa yang menunggu pemeriksaan panitia</p>
              </div>
              <Link href="/admin/pendaftar?verifikasi=menunggu" className="text-xs font-bold text-[#14b8a6] hover:underline">
                Lihat Semua →
              </Link>
            </div>

            {(terbarubelum ?? []).length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs font-semibold">
                  <thead className="border-b border-slate-100 dark:border-[#282541] text-[10px] font-bold uppercase tracking-wider text-slate-400">
                    <tr>
                      <th className="pb-3">Siswa / No. pendaftaran</th>
                      <th className="pb-3">Asal TK</th>
                      <th className="pb-3">Status</th>
                      <th className="pb-3 text-right">Aksi</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-[#282541]">
                    {(terbarubelum ?? []).map((p) => (
                      <tr key={p.id} className="hover:bg-slate-50/60 dark:hover:bg-[#282541]/40 transition-colors">
                        <td className="py-3.5">
                          <div className="flex items-center gap-3">
                            <div className="flex h-9 w-9 items-center justify-center rounded-2xl bg-[#c8ee44] text-[#1c1a2e] font-black">
                              👤
                            </div>
                            <div>
                              <p className="font-extrabold text-[#1c1a2e] dark:text-white">{p.nama_lengkap}</p>
                              <p className="font-mono text-[10px] text-slate-400">{p.nomor_pendaftaran}</p>
                            </div>
                          </div>
                        </td>
                        <td className="py-3.5 text-slate-500 font-medium">{p.asal_tk || "-"}</td>
                        <td className="py-3.5">
                          <Badge warna="abu">{LABEL_VERIFIKASI[p.status_verifikasi as StatusVerifikasi]}</Badge>
                        </td>
                        <td className="py-3.5 text-right">
                          <Link
                            href={`/admin/pendaftar/${p.id}`}
                            className="rounded-xl bg-[#c8ee44] px-3.5 py-1.5 text-xs font-black text-[#1c1a2e] hover:bg-[#b5da35] transition-all shadow-sm"
                          >
                            Verifikasi →
                          </Link>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="p-8 text-center text-xs text-slate-400 font-medium">
                ✨ Semua berkas pendaftar saat ini telah diverifikasi!
              </div>
            )}
          </div>
        </div>

        {/* Right Column (1 Span: Maglo Wallet Deck) */}
        <div>
          <QuickActionDeck pendingCount={belumVal} totalCount={totalVal} />
        </div>
      </div>
    </div>
  );
}
