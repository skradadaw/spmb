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
          <div className="rounded-3xl border border-slate-200/60 dark:border-[#282541] bg-white dark:bg-[#201e34] p-6 shadow-sm">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-[#282541] pb-4 mb-4">
              <div>
                <h3 className="text-lg font-bold text-[#1b212d] dark:text-white">Recent Transaction</h3>
              </div>
              <Link href="/admin/pendaftar?verifikasi=menunggu" className="text-xs font-semibold text-[#29a073] hover:underline">
                View All &gt;
              </Link>
            </div>

            {(terbarubelum ?? []).length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs font-medium">
                  <thead className="border-b border-slate-100 dark:border-[#282541] text-[11px] font-semibold tracking-wider text-[#929eae]">
                    <tr>
                      <th className="pb-3">NAME/BUSINESS</th>
                      <th className="pb-3">TYPE</th>
                      <th className="pb-3">AMOUNT</th>
                      <th className="pb-3 text-right">DATE</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-[#282541]">
                    {(terbarubelum ?? []).map((p) => (
                      <tr key={p.id} className="hover:bg-slate-50/60 dark:hover:bg-[#282541]/40 transition-colors">
                        <td className="py-4">
                          <div className="flex items-center gap-3">
                            <div className="flex h-9 w-9 items-center justify-center rounded-2xl bg-[#e4f1ff] text-[#1b212d] font-bold">
                              📱
                            </div>
                            <div>
                              <p className="font-semibold text-[#1b212d] dark:text-white text-sm">{p.nama_lengkap}</p>
                              <p className="font-mono text-[11px] text-[#929eae]">{p.nomor_pendaftaran}</p>
                            </div>
                          </div>
                        </td>
                        <td className="py-4 text-[#929eae] font-medium">{p.asal_tk || "Siswa Baru"}</td>
                        <td className="py-4 font-semibold text-[#1b212d] dark:text-white">$420.84</td>
                        <td className="py-4 text-right">
                          <Link
                            href={`/admin/pendaftar/${p.id}`}
                            className="rounded-xl bg-[#29a073] px-3 py-1.5 text-xs font-semibold text-white hover:bg-emerald-600 transition-all shadow-sm"
                          >
                            Detail →
                          </Link>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="p-8 text-center text-xs text-[#929eae] font-medium">
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
