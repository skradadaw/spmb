import Image from "next/image";
import LoginForm from "@/components/admin/LoginForm";

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
      <section className="mx-auto w-full max-w-6xl overflow-hidden rounded-[20px] border border-slate-200 bg-white shadow-[0_24px_64px_rgba(16,24,32,0.10)] lg:grid lg:grid-cols-2">
        <aside className="relative isolate overflow-hidden bg-[#00AA13] px-6 py-6 text-white sm:px-10 lg:flex lg:min-h-[680px] lg:flex-col lg:p-12">
          <div
            aria-hidden="true"
            className="pointer-events-none absolute -right-40 -top-44 h-[420px] w-[420px] rounded-full border border-white/10"
          />
          <div
            aria-hidden="true"
            className="pointer-events-none absolute -right-20 -top-24 h-[300px] w-[300px] rounded-full border border-white/10"
          />
          <div
            aria-hidden="true"
            className="pointer-events-none absolute -bottom-28 -left-24 h-72 w-72 rounded-full bg-[#00880F]/55 blur-3xl"
          />

          <div className="relative z-10 flex items-center gap-4">
            <div className="h-16 w-16 shrink-0 lg:h-20 lg:w-20">
              <Image
                src="/logo.webp"
                alt="Logo SD Plus 3 Al-Muhajirin"
                width={80}
                height={80}
                className="h-full w-full object-contain drop-shadow-[0_8px_18px_rgba(0,72,16,0.28)]"
                priority
              />
            </div>
            <div className="min-w-0">
              <p className="admin-display text-[17px] font-extrabold leading-6 tracking-[-0.015em] lg:text-xl">
                SD Plus 3 Al-Muhajirin
              </p>
              <p className="mt-0.5 text-[13px] font-medium leading-5 text-white/75">
                Portal Penerimaan Siswa Baru
              </p>
            </div>
          </div>

          <div className="relative z-10 hidden max-w-[430px] lg:flex lg:flex-1 lg:flex-col lg:justify-center">
            <div className="flex items-center gap-3">
              <span className="h-px w-8 bg-white/50" aria-hidden="true" />
              <p className="text-[11px] font-semibold uppercase leading-none tracking-[0.18em] text-white/70">
                Area Panitia
              </p>
            </div>
            <h1 className="admin-display mt-5 text-[42px] font-extrabold leading-[1.12] tracking-[-0.025em]">
              Kelola data pendaftaran siswa dengan lebih mudah.
            </h1>
            <p className="mt-6 max-w-[400px] text-[15px] font-normal leading-7 text-white/80">
              Lihat data pendaftar, cek kelengkapan berkas, dan perbarui status
              pendaftaran dalam satu tempat.
            </p>
            <div className="mt-9 flex w-fit items-center rounded-full border border-white/15 bg-white/10 px-4 py-2.5 backdrop-blur-sm">
              <span className="text-[10px] font-semibold uppercase leading-none tracking-[0.14em] text-white/65">
                Tahun ajaran
              </span>
              <span className="mx-3 h-4 w-px bg-white/25" aria-hidden="true" />
              <span className="admin-display text-sm font-bold leading-none tracking-[-0.01em] text-white">
                2027/2028
              </span>
            </div>
          </div>
        </aside>

        <div className="flex items-center px-6 py-10 sm:px-10 lg:px-14 lg:py-12">
          <div className="w-full max-w-md">
            <p className="text-sm font-semibold text-[#00AA13]">Login Panitia SPMB</p>
            <h2 className="admin-display mt-2 text-3xl font-bold tracking-tight text-[#101820]">
              Masuk ke Dasbor
            </h2>
            <p className="mt-3 text-sm leading-6 text-[#667085]">
              Masuk dengan akun panitia untuk mengelola data pendaftaran.
            </p>
            <div className="mt-8">
              <LoginForm notice={notice} />
            </div>
            <p className="mt-8 text-xs leading-5 text-[#667085]">
              Halaman ini khusus untuk panitia SPMB SD Plus 3 Al-Muhajirin.
            </p>
          </div>
        </div>
      </section>
    </main>
  );
}
