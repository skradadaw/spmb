import { Metadata } from 'next';
import { LoginHero, AdminLoginForm } from '@/features/auth';

export const metadata: Metadata = {
  title: 'Masuk Panel Admin | SPMB SD Plus 3 Al-Muhajirin',
  description: 'Halaman masuk khusus panitia dan administrator SPMB SD Plus 3 Al-Muhajirin.',
};

export default function LoginPage() {
  return (
    <main className="relative flex h-dvh min-h-0 w-full overflow-hidden bg-[#F5F9F6] lg:min-h-screen lg:flex-row">
      <LoginHero />

      <section aria-label="Form masuk administrator" className="relative z-10 flex h-dvh min-h-0 w-full flex-col overflow-y-auto p-2 sm:min-h-screen sm:px-10 sm:py-8 lg:min-h-0 lg:w-1/2 lg:overflow-hidden lg:px-12 lg:py-6 xl:px-20 xl:py-8">
        <div aria-hidden="true" className="pointer-events-none absolute -right-40 -top-40 h-[28rem] w-[28rem] rounded-full bg-emerald-200/25 blur-3xl" />
        <div aria-hidden="true" className="pointer-events-none absolute inset-0 opacity-35 bg-[linear-gradient(rgba(6,74,24,0.035)_1px,transparent_1px),linear-gradient(90deg,rgba(6,74,24,0.035)_1px,transparent_1px)] [background-size:48px_48px] [mask-image:linear-gradient(to_bottom_left,black,transparent_58%)]" />

        <div className="relative mx-auto flex w-full max-w-[31rem] flex-1 items-center sm:py-8 lg:min-h-0 lg:py-0">
          <div data-login-card className="relative mx-auto flex min-h-[80dvh] w-full max-w-[31rem] overflow-hidden rounded-[1.5rem] border border-emerald-950/[0.08] bg-white p-4 shadow-[0_24px_60px_-34px_rgba(6,74,24,0.38)] sm:min-h-0 sm:rounded-3xl sm:p-9 lg:max-h-[calc(100dvh-3rem)] lg:p-7 xl:p-8">
            <div aria-hidden="true" className="absolute inset-x-8 top-0 h-px bg-gradient-to-r from-transparent via-[#00AA13]/55 to-transparent lg:hidden" />
            <div aria-hidden="true" className="absolute -right-14 -top-14 h-32 w-32 rounded-full bg-emerald-100/45 blur-2xl lg:hidden" />
            <AdminLoginForm />
          </div>
        </div>

      </section>
    </main>
  );
}
