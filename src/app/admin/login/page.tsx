import AdminIcon from "@/components/admin/AdminIcon";
import LoginForm from "@/components/admin/LoginForm";

const routeSteps = ["Daftar", "Verifikasi", "Seleksi", "Diterima"];

export default async function AdminLoginPage({
  searchParams,
}: {
  searchParams: Promise<{ reason?: string }>;
}) {
  const { reason } = await searchParams;
  const notice = reason === "auth-required"
    ? "Sesi Anda tidak aktif. Silakan masuk untuk melanjutkan."
    : undefined;

  return (
    <main className="admin-scope min-h-screen bg-[#F6F7F5] px-4 py-6 sm:px-6 lg:flex lg:items-center lg:justify-center lg:p-8">
      <section className="mx-auto w-full max-w-6xl overflow-hidden rounded-[24px] border border-slate-200 bg-white shadow-[0_24px_64px_rgba(16,24,32,0.10)] lg:grid lg:grid-cols-2">
        <aside className="bg-[#00AA13] px-6 py-6 text-white sm:px-10 lg:flex lg:min-h-[680px] lg:flex-col lg:justify-between lg:p-12">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-white/15">
              <AdminIcon name="student" className="h-6 w-6" />
            </div>
            <div>
              <p className="text-sm font-semibold">SD Plus 3 Al-Muhajirin</p>
              <p className="text-xs text-white/75">Tahun Ajaran 2027/2028</p>
            </div>
          </div>

          <div className="hidden lg:block">
            <p className="text-sm font-semibold text-white/75">Jalur Pendaftaran Siswa</p>
            <h1 className="admin-display mt-3 max-w-md text-4xl font-bold leading-tight">
              Selamat datang di ruang kerja panitia SPMB.
            </h1>
            <p className="mt-5 max-w-md text-base leading-7 text-white/80">
              Kelola perjalanan calon siswa dalam satu dasbor yang rapi dan terarah.
            </p>
          </div>

          <ol className="mt-5 grid grid-cols-4 gap-2 lg:mt-12 lg:block lg:space-y-5">
            {routeSteps.map((step, index) => (
              <li key={step} className="flex items-center gap-3 text-xs font-semibold lg:text-sm">
                <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full border border-white/50 bg-white/10 text-xs">
                  {index + 1}
                </span>
                <span className="hidden lg:inline">{step}</span>
              </li>
            ))}
          </ol>
        </aside>

        <div className="flex items-center px-6 py-10 sm:px-10 lg:px-14 lg:py-12">
          <div className="w-full max-w-md">
            <p className="text-sm font-semibold text-[#00AA13]">Portal Panitia SPMB</p>
            <h2 className="admin-display mt-2 text-3xl font-bold tracking-tight text-[#101820]">
              Masuk ke Dasbor
            </h2>
            <p className="mt-3 text-sm leading-6 text-[#667085]">
              Gunakan akun panitia resmi untuk melanjutkan pengelolaan pendaftaran.
            </p>
            <div className="mt-8">
              <LoginForm notice={notice} />
            </div>
            <p className="mt-8 text-xs leading-5 text-[#667085]">
              Akses terbatas hanya untuk panitia resmi SPMB SD Plus 3 Al-Muhajirin.
            </p>
          </div>
        </div>
      </section>
    </main>
  );
}
