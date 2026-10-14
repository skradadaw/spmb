'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { ChevronRight, LogOut, Menu, ShieldCheck, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { logoutAdminAction } from '@/features/auth/logout-action';
import { cn } from '@/lib/utils';
import { ADMIN_NAV_ITEMS, type AdminSection } from './AdminNavigation';

/** Mobile admin menu, styled like the landing page's MobileNavigation: a full-height sheet under the 68px-tall header. */
export function AdminMobileMenu({ active }: { active: AdminSection }) {
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
        aria-label={isOpen ? 'Tutup menu admin' : 'Buka menu admin'}
        aria-expanded={isOpen}
        aria-controls="admin-mobile-navigation"
        onClick={() => setIsOpen(open => !open)}
        className="size-11 rounded-xl border-public-deep/15 bg-white text-public-deep shadow-sm hover:bg-public-tint hover:text-public-green focus-visible:ring-public-green/20"
      >
        {isOpen ? <X aria-hidden="true" className="size-5" /> : <Menu aria-hidden="true" className="size-5" />}
      </Button>

      {isOpen && (
        <div role="dialog" aria-modal="true" aria-label="Menu admin" className="fixed inset-x-0 bottom-0 top-[68px] z-50 bg-white lg:hidden">
          <div className="h-full overflow-y-auto overscroll-contain border-t border-public-deep/10 bg-gradient-to-b from-white via-white to-public-tint/20 px-4 pt-4 shadow-xl shadow-public-deep/15 sm:px-6">
            <div className="mx-auto flex min-h-full max-w-7xl flex-col justify-between pb-[max(1.25rem,env(safe-area-inset-bottom))]">
              <div className="space-y-4">
                <div className="space-y-2">
                  <p className="px-1 text-xs font-bold uppercase tracking-wider text-public-deep/70">Menu Utama</p>
                  <nav id="admin-mobile-navigation" aria-label="Navigasi admin mobile" className="divide-y divide-slate-100 overflow-hidden rounded-2xl border border-public-deep/10 bg-white shadow-xs">
                    {ADMIN_NAV_ITEMS.map(({ key, href, label, icon: Icon }) => {
                      const current = active === key;
                      return (
                        <Link
                          key={key}
                          href={href}
                          onClick={closeMenu}
                          aria-current={current ? 'page' : undefined}
                          className={cn(
                            'group flex min-h-[54px] items-center justify-between px-4 py-3.5 text-base font-semibold transition-colors hover:bg-public-tint/70 active:bg-public-tint/60 focus-visible:outline-2 focus-visible:outline-offset-[-2px] focus-visible:outline-public-green',
                            current && 'bg-public-tint/60',
                          )}
                        >
                          <span className="flex items-center gap-3">
                            <span
                              aria-hidden="true"
                              className={cn(
                                'flex size-8 shrink-0 items-center justify-center rounded-lg transition-colors',
                                current ? 'bg-public-green text-white' : 'bg-public-tint text-public-green group-hover:bg-public-green group-hover:text-white',
                              )}
                            >
                              <Icon aria-hidden="true" className="size-4" />
                            </span>
                            <span className={cn('transition-colors group-hover:text-public-deep', current ? 'text-public-deep' : 'text-slate-800')}>{label}</span>
                          </span>
                          <ChevronRight
                            aria-hidden="true"
                            className={cn('size-4 shrink-0 transition-all duration-200 group-hover:translate-x-0.5 group-hover:text-public-green', current ? 'text-public-green' : 'text-slate-400')}
                          />
                        </Link>
                      );
                    })}
                  </nav>
                </div>

                <div className="rounded-2xl border border-public-deep/10 bg-gradient-to-br from-public-tint/90 via-public-tint/40 to-public-tint/50 p-4 text-xs text-public-deep shadow-xs">
                  <div className="flex items-center gap-2 font-bold">
                    <ShieldCheck aria-hidden="true" className="size-4 text-public-green" />
                    <span>Sesi administrator</span>
                  </div>
                  <p className="mt-1.5 leading-relaxed text-slate-600">Akses aktif dan dilindungi sesi admin. Keluar setelah selesai, terutama di perangkat bersama.</p>
                </div>
              </div>

              <form action={logoutAdminAction} className="mt-6 border-t border-slate-200/80 pt-4">
                <button
                  type="submit"
                  aria-label="Keluar dari panel admin"
                  className="inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-xl border border-public-deep/15 bg-white px-4 py-2 text-sm font-semibold text-slate-700 transition-colors hover:bg-rose-50 hover:text-rose-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-public-green active:bg-rose-50"
                >
                  <LogOut aria-hidden="true" className="size-[18px]" />
                  Keluar
                </button>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
