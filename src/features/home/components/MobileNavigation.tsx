'use client';

import { useEffect, useState } from 'react';
import {
  BookOpen,
  CalendarDays,
  ChevronRight,
  CircleArrowRight,
  LockKeyhole,
  School,
  Menu,
  MessageCircleQuestion,
  Sparkles,
  WalletCards,
  X,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { actionClass } from './actionStyles';

type MobileNavigationProps = {
  items: ReadonlyArray<readonly [label: string, href: string]>;
};

const navigationIcons: Record<
  string,
  React.ComponentType<{ className?: string; 'aria-hidden'?: boolean | 'true' | 'false' }>
> = {
  Jadwal: CalendarDays,
  Alur: BookOpen,
  Kelas: School,
  'Biaya dan Berkas': WalletCards,
  FAQ: MessageCircleQuestion,
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
        className="size-11 rounded-xl border-public-deep/15 bg-white text-public-deep shadow-sm hover:bg-public-tint hover:text-public-green focus-visible:ring-public-green/20"
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
            className="h-full overflow-y-auto overscroll-contain border-t border-public-deep/10 bg-gradient-to-b from-white via-white to-public-tint/20 px-4 pt-4 shadow-xl shadow-public-deep/15 sm:px-6"
          >
            <div className="mx-auto flex min-h-full max-w-7xl flex-col justify-between pb-[max(1.25rem,env(safe-area-inset-bottom))]">
              <div className="space-y-4">
                <div className="space-y-2">
                  <p className="px-1 text-xs font-bold uppercase tracking-wider text-public-deep/70">Menu Utama</p>
                  {/* Menu items card with dividers */}
                  <div className="overflow-hidden rounded-2xl border border-public-deep/10 bg-white shadow-xs divide-y divide-slate-100">
                    {items.map(([label, href]) => {
                      const IconComponent = navigationIcons[label] || CircleArrowRight;
                      return (
                        <a
                          key={href}
                          href={href}
                          onClick={closeMenu}
                          className="group flex min-h-[54px] items-center justify-between px-4 py-3.5 text-base font-semibold text-slate-700 transition-colors hover:bg-public-tint/70 hover:text-public-deep active:bg-public-tint/60 focus-visible:outline-2 focus-visible:outline-offset-[-2px] focus-visible:outline-public-green"
                        >
                          <span className="flex items-center gap-3">
                            <span
                              aria-hidden="true"
                              className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-public-tint text-public-green transition-colors group-hover:bg-public-green group-hover:text-white"
                            >
                              <IconComponent aria-hidden="true" className="size-4" />
                            </span>
                            <span className="font-semibold text-slate-800 transition-colors group-hover:text-public-deep">
                              {label}
                            </span>
                          </span>
                          <ChevronRight
                            aria-hidden="true"
                            className="size-4 shrink-0 text-slate-400 transition-all duration-200 group-hover:translate-x-0.5 group-hover:text-public-green"
                          />
                        </a>
                      );
                    })}
                  </div>
                </div>

                {/* Helpful registration announcement card */}
                <div className="rounded-2xl border border-public-deep/10 bg-gradient-to-br from-public-tint/90 via-public-tint/40 to-public-tint/50 p-4 text-xs text-public-deep shadow-xs">
                  <div className="flex items-center gap-2 font-bold text-public-deep">
                    <Sparkles aria-hidden="true" className="size-4 text-public-green" />
                    <span>Informasi Open Booking</span>
                  </div>
                  <p className="mt-1.5 leading-relaxed text-slate-600">
                    Kuota setiap Pilihan Kelas terbatas. Segera lengkapi formulir pendaftaran dan unggah Berkas sebelum kuota terpenuhi.
                  </p>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="mt-6 grid gap-2.5 border-t border-slate-200/80 pt-4 sm:grid-cols-2">
                <Link
                  href="/login"
                  aria-label="Login Panitia"
                  onClick={closeMenu}
                  className={actionClass('outline')}
                >
                  <LockKeyhole aria-hidden="true" />
                  Login Panitia
                </Link>
                <Link
                  href="/pendaftaran"
                  aria-label="Daftar Sekarang"
                  onClick={closeMenu}
                  className={actionClass('primary')}
                >
                  <CircleArrowRight aria-hidden="true" className="text-amber-100" />
                  Daftar Sekarang
                </Link>
              </div>
            </div>
          </nav>
        </div>
      )}
    </div>
  );
}
