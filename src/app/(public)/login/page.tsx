import { Metadata } from 'next';
import { LoginHero, MobileLoginHeader, AdminLoginForm } from '@/features/auth';

export const metadata: Metadata = {
  title: 'Masuk Panel Admin | SPMB SD Plus 3 Al-Muhajirin',
  description: 'Halaman masuk khusus Admin SPMB SD Plus 3 Al-Muhajirin.',
};

export default function LoginPage() {
  return (
    <main className="relative flex min-h-dvh w-full bg-white lg:h-dvh lg:flex-row lg:overflow-hidden lg:bg-[#F5F9F6]">
      <LoginHero />

      <section aria-label="Form masuk administrator" className="relative flex min-h-dvh w-full flex-col lg:min-h-0 lg:w-1/2 lg:items-center lg:justify-center lg:px-12 lg:py-6 xl:px-20 xl:py-8">
        <div aria-hidden="true" className="pointer-events-none absolute -right-40 -top-40 hidden h-[28rem] w-[28rem] rounded-full bg-emerald-200/25 blur-3xl lg:block" />
        <div aria-hidden="true" className="pointer-events-none absolute inset-0 hidden opacity-35 bg-[linear-gradient(rgba(6,74,24,0.035)_1px,transparent_1px),linear-gradient(90deg,rgba(6,74,24,0.035)_1px,transparent_1px)] [background-size:48px_48px] [mask-image:linear-gradient(to_bottom_left,black,transparent_58%)] lg:block" />

        <MobileLoginHeader />

        <div
          data-login-card
          className="relative z-10 -mt-6 flex-1 rounded-t-[1.75rem] bg-white px-5 pb-[max(1.5rem,env(safe-area-inset-bottom))] pt-8 shadow-[0_-16px_32px_-24px_rgba(2,44,13,0.6)] sm:px-10 lg:mt-0 lg:w-full lg:max-w-[31rem] lg:flex-none lg:rounded-3xl lg:border lg:border-emerald-950/[0.08] lg:p-7 lg:shadow-[0_24px_60px_-34px_rgba(6,74,24,0.38)] xl:p-8"
        >
          <div className="mx-auto w-full max-w-[26rem] lg:max-w-none">
            <AdminLoginForm />
          </div>
        </div>
      </section>
    </main>
  );
}
