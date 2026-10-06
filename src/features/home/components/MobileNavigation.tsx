'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import {
  BookOpen,
  CalendarDays,
  ChevronRight,
  CircleArrowRight,
  ClipboardCheck,
  LockKeyhole,
  Menu,
  Sparkles,
  WalletCards,
  X,
} from 'lucide-react';
import { Button } from '@/components/ui/button';

type MobileNavigationProps = {
  items: ReadonlyArray<readonly [label: string, href: string]>;
};

const navigationIcons: Record<
  string,
  React.ComponentType<{ className?: string; 'aria-hidden'?: boolean | 'true' | 'false' }>
> = {
  Jadwal: CalendarDays,
  'Cara Daftar': BookOpen,
  Biaya: WalletCards,
  Persyaratan: ClipboardCheck,
};

export default function MobileNavigation({ items }: MobileNavigationProps) {
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    if (!isOpen) return;

    const previousOverflow = document.body.style.overflow;
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setIsOpen(false);
    };

    document.body.style.overflow = 'hidden';
    window.addEventListener('keydown', closeOnEscape);
    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener('keydown', closeOnEscape);
    };
  }, [isOpen]);

  const closeMenu = () => setIsOpen(false);

  return (
    <div className="lg:hidden">
      <Button
        type="button"
        variant="outline"
        size="icon"
        aria-label={isOpen ? 'Tutup menu navigasi' : 'Buka menu navigasi'}
        aria-expanded={isOpen}
        aria-controls="mobile-navigation"
        onClick={() => setIsOpen((open) => !open)}
        className="size-11 rounded-xl border-emerald-900/15 bg-white text-emerald-950 shadow-sm hover:bg-emerald-50 hover:text-[#007A10] focus-visible:ring-[#007A10]/20"
      >
        {isOpen ? <X aria-hidden="true" className="size-5" /> : <Menu aria-hidden="true" className="size-5" />}
      </Button>

      {isOpen && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label="Menu navigasi"
          className="fixed inset-x-0 bottom-0 top-[76px] z-50 h-[calc(100dvh-76px)] bg-white lg:hidden"
        >
          <nav
            id="mobile-navigation"
            aria-label="Navigasi seluler"
            className="h-full overflow-y-auto overscroll-contain border-t border-emerald-950/10 bg-white px-4 pt-4 shadow-xl shadow-emerald-950/15 sm:px-6"
          >
            <div className="mx-auto flex min-h-full max-w-7xl flex-col justify-between pb-[max(1.25rem,env(safe-area-inset-bottom))]">
              <div className="space-y-4">
                {/* Menu items card with dividers */}
                <div className="overflow-hidden rounded-2xl border border-emerald-950/10 bg-white shadow-xs divide-y divide-slate-100">
                  {items.map(([label, href]) => {
                    const IconComponent = navigationIcons[label] || CircleArrowRight;
                    return (
                      <a
                        key={href}
                        href={href}
                        onClick={closeMenu}
                        className="group flex min-h-[54px] items-center justify-between px-4 py-3.5 text-base font-semibold text-slate-700 transition-colors hover:bg-emerald-50/70 hover:text-emerald-950 active:bg-emerald-100/60 focus-visible:outline-2 focus-visible:outline-offset-[-2px] focus-visible:outline-[#007A10]"
                      >
                        <span className="flex items-center gap-3">
                          <span
                            aria-hidden="true"
                            className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-emerald-50 text-[#007A10] transition-colors group-hover:bg-[#007A10] group-hover:text-white"
                          >
                            <IconComponent aria-hidden="true" className="size-4" />
                          </span>
                          <span className="font-semibold text-slate-800 transition-colors group-hover:text-emerald-950">
                            {label}
                          </span>
                        </span>
                        <ChevronRight
                          aria-hidden="true"
                          className="size-4 shrink-0 text-slate-400 transition-all duration-200 group-hover:translate-x-0.5 group-hover:text-emerald-700"
                        />
                      </a>
                    );
                  })}
                </div>

                {/* Helpful registration announcement card */}
                <div className="rounded-2xl border border-emerald-900/10 bg-gradient-to-br from-emerald-50/90 via-emerald-50/40 to-lime-50/50 p-4 text-xs text-emerald-950 shadow-xs">
                  <div className="flex items-center gap-2 font-bold text-emerald-900">
                    <Sparkles aria-hidden="true" className="size-4 text-emerald-700" />
                    <span>Informasi Pendaftaran</span>
                  </div>
                  <p className="mt-1.5 leading-relaxed text-slate-600">
                    Kuota penerimaan murid baru terbatas. Segera lengkapi formulir pendaftaran dan unggah berkas sebelum kuota terpenuhi.
                  </p>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="mt-6 grid gap-2.5 border-t border-slate-200/80 pt-4 sm:grid-cols-2">
                <Button
                  variant="outline"
                  render={<Link href="/login" aria-label="Login Panitia" onClick={closeMenu} />}
                  className="h-12 justify-center gap-2 rounded-xl border-emerald-900/15 bg-white font-semibold text-slate-700 hover:bg-emerald-50 hover:text-emerald-950"
                >
                  <LockKeyhole aria-hidden="true" className="size-4" />
                  Login Panitia
                </Button>
                <Button
                  render={<Link href="/pendaftaran" aria-label="Daftar Sekarang" onClick={closeMenu} />}
                  className="h-12 justify-center gap-2 rounded-xl bg-[#008A12] font-bold text-white shadow-sm hover:bg-[#006F0E] hover:text-white"
                >
                  <CircleArrowRight aria-hidden="true" className="size-[17px] text-amber-100" />
                  Daftar Sekarang
                </Button>
              </div>
            </div>
          </nav>
        </div>
      )}
    </div>
  );
}
