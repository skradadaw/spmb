import { AlertCircle, RefreshCw } from 'lucide-react';
import { redirect } from 'next/navigation';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { AdminDashboard } from '@/features/admin';
import { AdminDashboardLoadError, createAdminDashboardRepository } from '@/features/admin/server/dashboardRepository';
import { getAdminSession } from '@/features/auth/session';
import { getSupabaseAdmin, SupabaseConfigurationError } from '@/features/registration/server/supabaseAdmin';

function DashboardErrorState() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-[var(--admin-canvas)] px-4">
      <Alert variant="destructive" className="max-w-lg rounded-2xl p-6 shadow-lg shadow-rose-950/5">
        <AlertCircle aria-hidden="true" className="h-5 w-5" />
        <AlertTitle className="text-base">Dashboard belum dapat dimuat</AlertTitle>
        <AlertDescription className="mt-2 leading-6 text-rose-700">Terjadi kendala saat mengambil ringkasan pendaftaran. Silakan muat ulang halaman atau hubungi pengelola sistem.</AlertDescription>
        <form action="/admin">
          <Button type="submit" variant="outline" className="mt-5 border-rose-200 bg-white text-rose-700 hover:bg-rose-100">
            <RefreshCw aria-hidden="true" className="h-4 w-4" />Muat ulang halaman
          </Button>
        </form>
      </Alert>
    </main>
  );
}

export default async function AdminPage() {
  if (!await getAdminSession()) redirect('/login');

  let summary;
  try {
    const repository = createAdminDashboardRepository(getSupabaseAdmin());
    summary = await repository.getSummary();
  } catch (error) {
    const safeType = error instanceof AdminDashboardLoadError || error instanceof SupabaseConfigurationError
      ? error.name
      : 'UnexpectedAdminDashboardError';
    console.error('Admin dashboard load failed.', safeType);
    return <DashboardErrorState />;
  }
  return <AdminDashboard summary={summary} />;
}
