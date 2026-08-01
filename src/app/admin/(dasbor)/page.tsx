import Link from "next/link";
import { AdminQuickActions } from "@/components/admin/AdminQuickActions";
import { AdminStatCard } from "@/components/admin/AdminStatCard";
import { EnrollmentJourney } from "@/components/admin/EnrollmentJourney";
import { createAdminClient } from "@/lib/supabase/admin";

export const dynamic = "force-dynamic";

export default async function AdminHome() {
  const supabase = createAdminClient();
  const [totalResult, verifiedResult, decidedResult, acceptedResult, waitingResult] = await Promise.all([
    supabase.from("pendaftar").select("id", { count: "exact", head: true }),
    supabase.from("pendaftar").select("id", { count: "exact", head: true }).eq("status_verifikasi", "terverifikasi"),
    supabase.from("pendaftar").select("id", { count: "exact", head: true }).neq("status_penerimaan", "menunggu"),
    supabase.from("pendaftar").select("id", { count: "exact", head: true }).eq("status_penerimaan", "diterima"),
    supabase.from("pendaftar").select("id", { count: "exact", head: true }).eq("status_verifikasi", "menunggu"),
  ]);

  const total = totalResult.count ?? 0;
  const verified = verifiedResult.count ?? 0;
  const decided = decidedResult.count ?? 0;
  const accepted = acceptedResult.count ?? 0;
  const waiting = waitingResult.count ?? 0;

  const { data: waitingApplicants } = await supabase
    .from("pendaftar")
    .select("id, nomor_pendaftaran, nama_lengkap, asal_tk, created_at")
    .eq("status_verifikasi", "menunggu")
    .order("created_at", { ascending: false })
    .limit(5);

  return (
    <div className="space-y-8">
      <header>
        <p className="text-sm text-[#667085]">Ringkasan penerimaan murid baru tahun ajaran 2027/2028.</p>
      </header>

      <div className="grid gap-4 md:grid-cols-3">
        <AdminStatCard label="Total Pendaftar" value={total} helper="Seluruh calon siswa terdaftar" icon="users" tone="neutral" />
        <AdminStatCard label="Menunggu Verifikasi" value={waiting} helper="Perlu Ditindaklanjuti" icon="clock" tone="warning" />
        <AdminStatCard label="Diterima" value={accepted} helper="Calon siswa yang telah diterima" icon="check" tone="success" />
      </div>

      <EnrollmentJourney total={total} terverifikasi={verified} diputuskan={decided} diterima={accepted} />

      <div className="grid gap-6 lg:grid-cols-[minmax(0,2fr)_minmax(280px,1fr)]">
        <section className="overflow-hidden rounded-[20px] border border-slate-200/80 bg-white shadow-[0_1px_2px_rgba(16,24,32,0.04)]" aria-labelledby="pendaftar-menunggu-title">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200/80 px-5 py-4 sm:px-6">
            <div>
              <h2 id="pendaftar-menunggu-title" className="admin-display text-lg text-[#101820]">Pendaftar menunggu verifikasi</h2>
              <p className="mt-1 text-sm text-[#667085]">Lima pendaftar terbaru yang membutuhkan pemeriksaan berkas.</p>
            </div>
            <Link href="/admin/pendaftar?verifikasi=menunggu" className="text-sm font-semibold text-[#00880F] hover:underline focus:outline-none focus:ring-4 focus:ring-[#00AA13]/15">
              Lihat semua
            </Link>
          </div>

          {(waitingApplicants ?? []).length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[680px] text-left text-sm">
                <thead className="bg-[#F6F7F5] text-xs font-semibold text-[#667085]">
                  <tr>
                    <th className="px-5 py-3 sm:px-6">Nama</th>
                    <th className="px-5 py-3">Nomor Pendaftaran</th>
                    <th className="px-5 py-3">Asal TK/RA</th>
                    <th className="px-5 py-3">Tanggal</th>
                    <th className="px-5 py-3 text-right sm:px-6">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {(waitingApplicants ?? []).map((applicant) => (
                    <tr key={applicant.id} className="transition-colors hover:bg-[#F6F7F5]">
                      <td className="px-5 py-4 font-semibold text-[#101820] sm:px-6">{applicant.nama_lengkap}</td>
                      <td className="px-5 py-4 font-mono text-xs text-[#667085]">{applicant.nomor_pendaftaran}</td>
                      <td className="px-5 py-4 text-[#667085]">{applicant.asal_tk || "-"}</td>
                      <td className="whitespace-nowrap px-5 py-4 text-[#667085]">
                        {new Intl.DateTimeFormat("id-ID", { day: "2-digit", month: "short", year: "numeric" }).format(new Date(applicant.created_at))}
                      </td>
                      <td className="px-5 py-4 text-right sm:px-6">
                        <Link href={`/admin/pendaftar/${applicant.id}`} className="inline-flex min-h-9 items-center rounded-lg px-2.5 text-sm font-semibold text-[#00880F] hover:bg-[#E9F8EB] focus:outline-none focus:ring-4 focus:ring-[#00AA13]/15">
                          Detail
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="px-6 py-10 text-center">
              <p className="font-semibold text-[#101820]">Tidak ada pendaftar yang menunggu verifikasi.</p>
              <p className="mt-1 text-sm text-[#667085]">Semua berkas yang masuk sudah ditindaklanjuti.</p>
            </div>
          )}
        </section>

        <AdminQuickActions />
      </div>
    </div>
  );
}
