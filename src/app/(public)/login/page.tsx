import { Metadata } from 'next';
import { LoginHero, AdminLoginForm } from '@/features/auth';

export const metadata: Metadata = {
  title: 'Masuk Panel Admin | SPMB SD Plus 3 Al-Muhajirin',
  description: 'Halaman masuk khusus panitia dan administrator SPMB SD Plus 3 Al-Muhajirin.',
};

export default function LoginPage() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-between bg-[#F7F9FA] px-4 py-8 sm:px-6 sm:py-12 lg:px-8">
      <div className="my-auto flex w-full max-w-5xl flex-col items-center justify-center gap-10 lg:flex-row lg:items-center lg:justify-between lg:gap-14">
        <LoginHero />
        <AdminLoginForm />
      </div>

      <footer className="mt-8 text-center text-xs text-gray-400">
        <span>© 2026 SD Plus 3 Al-Muhajirin</span>
        <span className="mx-2">|</span>
        <span className="text-[#00AA13] font-medium">Sistem Penerimaan Murid Baru</span>
      </footer>
    </main>
  );
}
