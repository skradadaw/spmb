'use client';

import React, { useEffect, useRef, useState, useTransition } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Eye, EyeOff, Loader2, AlertCircle, HelpCircle, ArrowLeft, ShieldCheck } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { verifyAdminPinAction } from '@/features/auth/actions';

const PIN_LENGTH = 6;

export function AdminLoginForm() {
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);
  const [pin, setPin] = useState('');
  const [showPin, setShowPin] = useState(false);
  const [isFocused, setIsFocused] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  // Di mobile keyboard tidak langsung dibuka agar halaman tampil utuh.
  useEffect(() => {
    if (window.matchMedia?.('(min-width: 1024px)').matches) inputRef.current?.focus();
  }, []);

  // Setelah PIN ditolak, kotak dikosongkan dan fokus kembali ke awal.
  useEffect(() => {
    if (errorMessage && !isPending) inputRef.current?.focus();
  }, [errorMessage, isPending]);

  const submitPin = (value: string) => {
    startTransition(async () => {
      try {
        const result = await verifyAdminPinAction(value);
        if (result.success) {
          router.push(result.redirectUrl);
        } else {
          setPin('');
          setErrorMessage(result.error);
        }
      } catch {
        setPin('');
        setErrorMessage('Terjadi kesalahan koneksi. Silakan coba beberapa saat lagi.');
      }
    });
  };

  const handlePinChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    // Hanya angka, maksimal 6 digit; tempelan seperti "12 34 56" ikut dirapikan.
    const value = e.target.value.replace(/\D/g, '').slice(0, PIN_LENGTH);
    setPin(value);
    if (errorMessage) setErrorMessage(null);
    if (value.length === PIN_LENGTH && pin.length !== PIN_LENGTH) submitPin(value);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (pin.length === PIN_LENGTH && !isPending) submitPin(pin);
  };

  const keepCaretAtEnd = (e: React.SyntheticEvent<HTMLInputElement>) => {
    const input = e.currentTarget;
    input.setSelectionRange(input.value.length, input.value.length);
  };

  return (
    <div data-testid="admin-login-form" className="flex w-full flex-col">
      <div className="hidden pb-6 lg:block xl:pb-7">
        <h2 className="text-[2rem] font-bold leading-tight tracking-[-0.035em] text-slate-950">Masuk Panel Admin</h2>
        <p className="mt-2 text-sm leading-6 text-slate-500">Masukkan PIN Admin untuk melanjutkan.</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">
        <div className="space-y-2.5">
          <div className="flex items-center justify-between">
            <label htmlFor="admin-pin-input" className="text-sm font-semibold text-slate-800">
              PIN Admin
            </label>
            <button
              type="button"
              aria-label={showPin ? 'Sembunyikan PIN' : 'Tampilkan PIN'}
              onClick={() => setShowPin((prev) => !prev)}
              className="-mr-2 flex h-9 items-center gap-1.5 rounded-lg px-2 text-xs font-semibold text-slate-500 transition-colors hover:bg-emerald-50 hover:text-[#087A20] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#087A20] cursor-pointer"
            >
              {showPin ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              <span aria-hidden="true">{showPin ? 'Sembunyikan' : 'Tampilkan'}</span>
            </button>
          </div>

          <div data-testid="pin-boxes" className="relative grid grid-cols-6 gap-2 sm:gap-2.5">
            {Array.from({ length: PIN_LENGTH }, (_, index) => {
              const digit = pin[index];
              const isActive = isFocused && !isPending && index === Math.min(pin.length, PIN_LENGTH - 1);
              return (
                <div
                  key={index}
                  aria-hidden="true"
                  className={`flex h-14 items-center justify-center rounded-xl border bg-white text-xl font-bold text-slate-950 transition-colors duration-150 ${
                    errorMessage
                      ? 'border-rose-300 bg-rose-50/60'
                      : isActive
                        ? 'border-[#087A20] ring-4 ring-[#00AA13]/10'
                        : digit
                          ? 'border-emerald-300'
                          : 'border-slate-200'
                  }`}
                >
                  {digit && (showPin ? digit : <span className="h-2.5 w-2.5 rounded-full bg-slate-900" />)}
                </div>
              );
            })}

            <input
              ref={inputRef}
              id="admin-pin-input"
              name="pin"
              type={showPin ? 'text' : 'password'}
              inputMode="numeric"
              pattern="[0-9]*"
              maxLength={PIN_LENGTH}
              autoComplete="current-password"
              aria-invalid={errorMessage ? true : undefined}
              aria-describedby={errorMessage ? 'admin-pin-error' : undefined}
              value={pin}
              onChange={handlePinChange}
              onFocus={() => setIsFocused(true)}
              onBlur={() => setIsFocused(false)}
              onSelect={keepCaretAtEnd}
              disabled={isPending}
              className="absolute inset-0 h-full w-full cursor-text bg-transparent text-base text-transparent caret-transparent opacity-0 focus:outline-none"
            />
          </div>

          {errorMessage && (
            <div id="admin-pin-error" role="alert" className="flex items-start gap-2 pt-0.5 text-sm font-medium text-rose-700">
              <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-rose-600" />
              <p className="leading-snug">{errorMessage}</p>
            </div>
          )}
        </div>

        <Button
          type="submit"
          disabled={isPending || pin.length !== PIN_LENGTH}
          className={`h-12 w-full rounded-xl bg-[#087A20] text-sm font-bold text-white transition-colors hover:bg-[#066A1B] active:bg-[#064A18] disabled:opacity-100 cursor-pointer ${
            isPending ? '' : 'disabled:bg-slate-100 disabled:text-slate-400'
          }`}
        >
          {isPending ? (
            <span className="flex items-center justify-center gap-2">
              <Loader2 className="h-4 w-4 animate-spin" />
              Memverifikasi…
            </span>
          ) : (
            'Masuk ke Panel Admin'
          )}
        </Button>

        <p className="flex items-center justify-center gap-1.5 text-xs text-slate-500 lg:hidden">
          <ShieldCheck className="h-4 w-4 shrink-0 text-[#087A20]" />
          Jangan bagikan PIN Admin kepada siapa pun.
        </p>
      </form>

      <div
        data-testid="login-support"
        className="mt-8 flex items-center justify-center border-t border-slate-100 pt-4 lg:mt-7 lg:justify-between"
      >
        <Link
          href="/"
          className="hidden items-center gap-1.5 rounded-lg px-2 py-2 text-sm font-medium text-slate-500 transition-colors hover:text-[#064A18] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#087A20] lg:-ml-2 lg:inline-flex"
        >
          <ArrowLeft className="h-4 w-4" />
          Kembali ke beranda
        </Link>
        <a
          href="https://wa.me/6287723487776"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1.5 rounded-lg px-2 py-2 text-sm font-medium text-slate-500 transition-colors hover:text-[#00880F] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#00AA13] lg:-mr-2"
        >
          <HelpCircle className="h-4 w-4 text-[#00AA13]" />
          <span>
            Butuh bantuan? <strong className="font-semibold text-[#087A20]">Hubungi Support</strong>
          </span>
        </a>
      </div>
    </div>
  );
}
