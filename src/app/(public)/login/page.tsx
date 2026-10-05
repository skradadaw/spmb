import { Metadata } from 'next';
import { LoginHero, AdminLoginForm } from '@/features/auth';

export const metadata: Metadata = {
  title: 'Masuk Panel Admin | SPMB SD Plus 3 Al-Muhajirin',
  description: 'Halaman masuk khusus panitia dan administrator SPMB SD Plus 3 Al-Muhajirin.',
};

export default function LoginPage() {
  return (
    <main className="flex min-h-screen flex-col lg:flex-row bg-slate-50/50">
      <LoginHero />
      <AdminLoginForm />
    </main>
  );
}
