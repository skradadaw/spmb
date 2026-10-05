import Image from 'next/image';
import { LayoutDashboard, LogOut, ShieldCheck } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { logoutAdminAction } from '@/features/auth/logout-action';

export function DashboardSidebar() {
  return (
    <aside className="fixed inset-y-0 left-0 z-20 hidden w-[272px] flex-col overflow-hidden bg-[#07551A] text-white lg:flex">
      <div aria-hidden="true" className="pointer-events-none absolute inset-0 opacity-35 [background-image:radial-gradient(circle_at_20%_10%,rgba(57,209,85,0.32),transparent_35%),linear-gradient(145deg,transparent_50%,rgba(255,255,255,0.05))]" />
      <div className="relative flex h-full flex-col px-5 py-6">
        <div className="flex items-center gap-3 px-2">
          <Image src="/logo.png" alt="Logo SD Plus 3 Al-Muhajirin" width={52} height={52} className="h-[52px] w-[52px] object-contain drop-shadow-[0_5px_9px_rgba(0,0,0,0.24)]" priority />
          <div className="min-w-0">
            <p className="truncate text-sm font-bold tracking-[-0.02em]">SD Plus 3 Al-Muhajirin</p>
            <p className="mt-1 text-[9px] font-bold uppercase tracking-[0.14em] text-emerald-200">Panel Administrasi SPMB</p>
          </div>
        </div>
        <Separator decorative className="my-6 bg-white/12" />
        <div className="px-2 text-[10px] font-bold uppercase tracking-[0.16em] text-emerald-200/70">Menu utama</div>
        <nav aria-label="Navigasi admin" className="mt-3">
          <a href="/admin" aria-current="page" className="flex h-11 items-center gap-3 rounded-xl bg-white/12 px-3 text-sm font-semibold text-white ring-1 ring-inset ring-white/10">
            <LayoutDashboard aria-hidden="true" className="h-[18px] w-[18px]" />
            Ringkasan
          </a>
        </nav>
        <div className="mt-auto">
          <div className="mb-4 rounded-2xl border border-white/10 bg-black/10 p-4">
            <div className="flex items-center gap-2 text-xs font-semibold"><ShieldCheck aria-hidden="true" className="h-4 w-4 text-emerald-200" />Sesi administrator</div>
            <p className="mt-2 text-[10px] leading-4 text-emerald-100/70">Akses aktif dan dilindungi sesi terenkripsi.</p>
          </div>
          <form action={logoutAdminAction}>
            <Button type="submit" variant="ghost" aria-label="Keluar dari panel admin" className="h-11 w-full justify-start bg-white/5 px-3 text-white hover:bg-white/12 hover:text-white">
              <LogOut aria-hidden="true" className="h-[18px] w-[18px]" />Keluar
            </Button>
          </form>
        </div>
      </div>
    </aside>
  );
}
