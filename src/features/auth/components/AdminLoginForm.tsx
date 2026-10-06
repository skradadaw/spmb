'use client';

import React, { useState, useTransition } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Eye, EyeOff, Loader2, AlertCircle, HelpCircle, Lock, ArrowRight, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { verifyAdminPinAction } from '@/features/auth/actions';

export function AdminLoginForm() {
  const router = useRouter();
  const [pin, setPin] = useState('');
  const [showPin, setShowPin] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const handlePinChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    // Hanya izinkan PIN resmi 6 digit.
    if (/^\d*$/.test(value) && value.length <= 6) {
      setPin(value);
      if (errorMessage) setErrorMessage(null);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!pin) {
      setErrorMessage('Silakan masukkan PIN keamanan');
      return;
    }

    startTransition(async () => {
      try {
        const result = await verifyAdminPinAction(pin);
        if (result.success) {
          router.push(result.redirectUrl);
        } else {
          setErrorMessage(result.error);
        }
      } catch {
        setErrorMessage('Terjadi kesalahan koneksi. Silakan coba beberapa saat lagi.');
      }
    });
  };

  return (
    <div data-testid="admin-login-form" className="flex h-full w-full flex-col justify-center">
      <div data-testid="mobile-school-identity" className="relative mb-4 flex items-center justify-center gap-3 border-b border-emerald-900/10 pb-3 sm:mb-6 sm:gap-3.5 sm:pb-5 lg:hidden">
        <span aria-hidden="true" className="absolute inset-x-0 bottom-[-1px] h-px bg-gradient-to-r from-[#00AA13]/60 via-emerald-300/35 to-transparent" />
        <div className="flex h-12 w-12 shrink-0 items-center justify-center sm:h-14 sm:w-14">
          <Image src="/logo.png" alt="" width={56} height={56} className="h-full w-full object-contain drop-shadow-[0_5px_8px_rgba(6,74,24,0.22)]" priority />
        </div>
        <span aria-hidden="true" className="h-9 w-px shrink-0 bg-gradient-to-b from-transparent via-emerald-900/15 to-transparent" />
        <div>
          <p className="text-sm font-bold leading-tight tracking-[-0.02em] text-slate-900">SD PLUS 3 AL-MUHAJIRIN</p>
          <p className="mt-1 text-[9px] font-bold uppercase tracking-[0.14em] text-[#087A20]">SISTEM PENERIMAAN MURID BARU</p>
        </div>
      </div>

      {/* Header Form */}
      <div className="space-y-3 pb-4 text-left sm:space-y-5 sm:pb-8 lg:space-y-3 lg:pb-5 xl:space-y-4 xl:pb-6">
        <div className="inline-flex items-center gap-2 rounded-full border border-emerald-200 bg-emerald-50/80 px-3 py-1 text-[10px] font-bold text-[#087A20] sm:py-1.5 sm:text-[11px]">
          <span className="h-1.5 w-1.5 rounded-full bg-[#00AA13] shadow-[0_0_0_3px_rgba(0,170,19,0.10)]" />
          <span>Akses Administrator</span>
        </div>
        <div className="relative space-y-2.5 pt-2.5">
          <span
            data-testid="login-heading-accent"
            aria-hidden="true"
            className="absolute left-0 top-0 h-1 w-10 rounded-full bg-gradient-to-r from-[#087A20] via-[#00AA13] to-emerald-300 shadow-[0_3px_10px_rgba(0,170,19,0.24)]"
          />
          <h2 className="text-2xl font-bold leading-tight tracking-[-0.035em] text-slate-950 sm:text-[2rem]">
            Masuk Panel Admin
          </h2>
          <p className="max-w-md text-xs leading-5 text-slate-500 sm:text-sm sm:leading-6">
            Masukkan PIN keamanan panitia untuk mengakses dan mengelola seluruh data pendaftaran SPMB.
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-3 sm:space-y-4.5 lg:space-y-3.5">
        {/* Error Notification */}
        {errorMessage && (
          <div
            id="admin-pin-error"
            role="alert"
            className="flex items-center gap-2.5 rounded-xl border border-rose-200 bg-rose-50 px-3.5 py-2.5 text-[11px] font-semibold text-rose-700 sm:py-3 sm:text-xs"
          >
            <AlertCircle className="h-4 w-4 shrink-0 text-rose-600" />
            <p className="leading-snug">{errorMessage}</p>
          </div>
        )}

        {/* PIN Input Field */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between">
            <label
              htmlFor="admin-pin-input"
              className="block text-xs font-bold text-slate-700"
            >
              PIN Keamanan
            </label>
            <span className="text-[11px] font-medium text-slate-400">6 angka</span>
          </div>

          {/* Elevated SaaS PIN Input Box */}
          <div
            className={`relative flex items-center rounded-xl border bg-white transition-all duration-200 ${
              errorMessage
                ? 'border-rose-300 bg-rose-50/30 ring-4 ring-rose-100/70 focus-within:border-rose-500'
                : 'border-slate-200 shadow-sm shadow-slate-900/[0.03] hover:border-emerald-300 focus-within:border-[#087A20] focus-within:ring-4 focus-within:ring-[#00AA13]/10'
            }`}
          >
            <div className="pointer-events-none absolute left-3.5 flex items-center text-gray-400">
              <Lock className="h-4 w-4" />
            </div>

            <input
              id="admin-pin-input"
              name="pin"
              type={showPin ? 'text' : 'password'}
              inputMode="numeric"
              pattern="[0-9]*"
              autoComplete="current-password"
              aria-invalid={errorMessage ? true : undefined}
              aria-describedby={errorMessage ? 'admin-pin-hint admin-pin-error' : 'admin-pin-hint'}
              placeholder="Masukkan PIN"
              value={pin}
              onChange={handlePinChange}
              disabled={isPending}
              autoFocus
              className="h-12 w-full rounded-xl bg-transparent px-11 text-center font-mono text-lg font-bold tracking-[0.32em] text-slate-950 placeholder:font-sans placeholder:text-sm placeholder:font-medium placeholder:tracking-normal placeholder:text-slate-400 focus:outline-none sm:h-13"
            />

            <button
              type="button"
              aria-label={showPin ? 'Sembunyikan PIN' : 'Tampilkan PIN'}
              onClick={() => setShowPin((prev) => !prev)}
              className="absolute right-2 rounded-lg p-2.5 text-slate-400 transition-all duration-200 hover:bg-emerald-50 hover:text-[#087A20] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#087A20] focus-visible:ring-offset-1 cursor-pointer"
            >
              {showPin ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          </div>

          <p id="admin-pin-hint" className="pt-0.5 text-[11px] leading-5 text-slate-400">
            Gunakan PIN 6 digit resmi panitia administrasi sekolah.
          </p>
        </div>

        {/* Primary CTA Button */}
        <Button
          type="submit"
          disabled={isPending || pin.length !== 6}
          className={`group h-11 w-full rounded-xl text-sm font-bold transition-all duration-200 cursor-pointer sm:h-12 ${
            pin.length !== 6
              ? 'bg-gray-100 text-gray-400 hover:bg-gray-100 border border-gray-200/80 cursor-not-allowed shadow-none'
              : 'bg-[#087A20] text-white shadow-[0_12px_24px_-14px_rgba(6,74,24,0.72)] hover:-translate-y-0.5 hover:bg-[#066A1B] hover:shadow-[0_16px_28px_-14px_rgba(6,74,24,0.78)] active:translate-y-0 active:scale-[0.99]'
          }`}
        >
          {isPending ? (
            <div className="flex items-center justify-center gap-2">
              <Loader2 className="h-4 w-4 animate-spin" />
              <span>Memverifikasi Akses...</span>
            </div>
          ) : (
            <div className="flex items-center justify-center gap-2">
              <span>Masuk ke Panel Admin</span>
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
            </div>
          )}
        </Button>

        {/* Secondary Navigation Button */}
        <Link
          href="/"
          className="group flex h-11 w-full items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white text-sm font-semibold text-slate-600 transition-all duration-200 hover:border-emerald-300 hover:bg-emerald-50/60 hover:text-[#064A18] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#087A20] focus-visible:ring-offset-2 active:scale-[0.99] sm:h-12"
        >
          <ArrowLeft className="h-4 w-4 text-gray-400 transition-transform group-hover:-translate-x-0.5" />
          <span>Kembali ke Beranda SPMB</span>
        </Link>
      </form>

      {/* Footer Support Info */}
      <div data-testid="login-support" className="mt-4 border-t border-slate-100 pt-3 text-center sm:mt-7 sm:pt-5 lg:mt-4 lg:pt-3">
        <a
          href="https://wa.me/6287723487776"
          target="_blank"
          rel="noopener noreferrer"
          className="group inline-flex items-center gap-2 rounded-xl px-3 py-1.5 text-[11px] font-semibold text-slate-500 transition-colors hover:bg-emerald-50 hover:text-[#00880F] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#00AA13] focus-visible:ring-offset-2 sm:py-2 sm:text-xs"
        >
          <HelpCircle className="h-3.5 w-3.5 text-[#00AA13] transition-transform group-hover:scale-110" />
          <span>
            Butuh bantuan panitia?{' '}
            <strong className="text-[#00AA13] group-hover:underline">Hubungi Support</strong>
          </span>
        </a>
      </div>
    </div>
  );
}
