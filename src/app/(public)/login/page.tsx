import { Metadata } from 'next';
import { ShieldCheck } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader } from '@/components/ui/card';
import { LoginHero, MobileLoginHeader, AdminLoginForm, LoginSupportLink } from '@/features/auth';

export const metadata: Metadata = {
  title: 'Masuk Panel Admin | SPMB SD Plus 3 Al-Muhajirin',
  description: 'Halaman masuk khusus Admin SPMB SD Plus 3 Al-Muhajirin.',
};

export default function LoginPage() {
  return (
    <main className="relative flex min-h-dvh w-full bg-public-canvas lg:h-dvh lg:flex-row lg:overflow-hidden">
      <LoginHero />

      <section aria-label="Form masuk administrator" className="relative flex min-h-dvh w-full flex-col lg:min-h-0 lg:w-1/2 lg:items-center lg:justify-center lg:px-12 lg:py-6 xl:px-20 xl:py-8">
        <div aria-hidden="true" className="pointer-events-none absolute -right-40 -top-40 hidden h-[28rem] w-[28rem] rounded-full bg-emerald-200/25 blur-3xl lg:block" />
        <div aria-hidden="true" className="pointer-events-none absolute inset-0 hidden opacity-35 bg-[linear-gradient(rgba(6,74,24,0.035)_1px,transparent_1px),linear-gradient(90deg,rgba(6,74,24,0.035)_1px,transparent_1px)] [background-size:48px_48px] [mask-image:linear-gradient(to_bottom_left,black,transparent_58%)] lg:block" />

        <MobileLoginHeader />

        <Card
          data-login-card
          className="relative z-10 mx-4 -mt-14 rounded-[1.75rem] border-public-deep/10 shadow-xl shadow-public-deep/10 sm:mx-auto sm:w-full sm:max-w-[28rem] lg:mt-0 lg:max-w-[31rem] lg:rounded-3xl"
        >
          <CardHeader className="hidden space-y-1.5 px-7 pb-5 pt-7 lg:flex xl:px-8 xl:pt-8">
            <h2 className="text-[2rem] font-extrabold leading-tight tracking-[-0.035em] text-public-deep">Masuk Panel Admin</h2>
            <CardDescription className="leading-6 text-slate-600">
              Masukkan 6 digit PIN Admin untuk mengelola pendaftaran SPMB.
            </CardDescription>
          </CardHeader>
          <CardContent className="px-5 pb-5 pt-6 sm:px-7 sm:pb-7 lg:pt-0 xl:px-8 xl:pb-8">
            <AdminLoginForm />
          </CardContent>
        </Card>

        <footer className="mt-auto flex flex-col items-center gap-3 px-5 pb-[max(1.5rem,env(safe-area-inset-bottom))] pt-10 lg:hidden">
          <p className="inline-flex items-center gap-2 rounded-full bg-public-tint px-4 py-2 text-sm font-semibold text-public-deep">
            <ShieldCheck aria-hidden="true" className="h-4 w-4 text-public-green" />
            Khusus panitia &amp; admin SPMB
          </p>
          <LoginSupportLink />
        </footer>
      </section>
    </main>
  );
}
