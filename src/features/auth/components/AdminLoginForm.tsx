'use client';

import React, { useEffect, useRef, useState, useTransition } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Eye, EyeOff, Loader2, AlertCircle, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { InputOTP, InputOTPGroup, InputOTPSlot } from '@/components/ui/input-otp';
import { cn } from '@/lib/utils';
import { verifyAdminPinAction } from '@/features/auth/actions';
import { LoginSupportLink } from './LoginSupportLink';

const PIN_LENGTH = 6;
const FORGOT_PIN_URL = `https://wa.me/6287723487776?text=${encodeURIComponent('Assalamualaikum, saya lupa PIN Admin SPMB.')}`;
const onlyDigits = (value: string) => value.replace(/\D/g, '').slice(0, PIN_LENGTH);

export function AdminLoginForm() {
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);
  const [pin, setPin] = useState('');
  const [showPin, setShowPin] = useState(false);
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

  const handlePinChange = (raw: string) => {
    // Hanya angka, maksimal 6 digit.
    const value = onlyDigits(raw);
    setPin(value);
    if (errorMessage) setErrorMessage(null);
    if (value.length === PIN_LENGTH && pin.length !== PIN_LENGTH) submitPin(value);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (pin.length === PIN_LENGTH && !isPending) submitPin(pin);
  };

  return (
    <div data-testid="admin-login-form" className="flex w-full flex-col">
      <form onSubmit={handleSubmit} className="space-y-5">
        <div className="space-y-4">
          <div className="flex items-start justify-between gap-4">
            <div>
              <label htmlFor="admin-pin-input" className="block text-lg font-extrabold tracking-tight text-slate-900">
                Masukkan PIN
              </label>
              <p className="mt-0.5 text-sm text-slate-500">6 digit PIN admin Anda</p>
            </div>
            <button
              type="button"
              aria-label={showPin ? 'Sembunyikan PIN' : 'Tampilkan PIN'}
              aria-pressed={showPin}
              onClick={() => setShowPin((prev) => !prev)}
              className="tap-press flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-public-tint text-slate-700 transition-colors hover:bg-public-mint hover:text-public-deep focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-public-green cursor-pointer"
            >
              {showPin ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
            </button>
          </div>

          <InputOTP
            ref={inputRef}
            id="admin-pin-input"
            name="pin"
            type={showPin ? 'text' : 'password'}
            inputMode="numeric"
            autoComplete="current-password"
            maxLength={PIN_LENGTH}
            pasteTransformer={onlyDigits}
            aria-invalid={errorMessage ? true : undefined}
            aria-describedby={errorMessage ? 'admin-pin-error' : undefined}
            value={pin}
            onChange={handlePinChange}
            disabled={isPending}
            containerClassName="w-full has-disabled:opacity-100"
          >
            <InputOTPGroup data-testid="pin-boxes" className="grid w-full grid-cols-6 gap-2 sm:gap-2.5">
              {Array.from({ length: PIN_LENGTH }, (_, index) => (
                <InputOTPSlot
                  key={index}
                  index={index}
                  masked={!showPin}
                  className={cn(
                    'size-auto h-14 rounded-xl border border-slate-200 bg-slate-50 text-xl font-bold text-slate-950 first:rounded-xl last:rounded-xl',
                    'data-[active=true]:border-public-green data-[active=true]:bg-white data-[active=true]:ring-4 data-[active=true]:ring-public-green/15',
                    pin[index] && 'border-public-line bg-public-tint/60',
                    errorMessage && 'border-rose-300 bg-rose-50/60'
                  )}
                />
              ))}
            </InputOTPGroup>
          </InputOTP>

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
          className="tap-press h-[3.25rem] w-full rounded-full bg-gradient-to-b from-public-green to-[#006B0E] text-base font-bold text-white shadow-lg shadow-public-green/25 transition-[filter,opacity] hover:brightness-110 disabled:opacity-85 disabled:shadow-md cursor-pointer"
        >
          {isPending ? (
            <span className="flex items-center justify-center gap-2">
              <Loader2 className="h-4 w-4 animate-spin" />
              Memverifikasi…
            </span>
          ) : (
            'Masuk'
          )}
        </Button>

        <div className="flex justify-center">
          <a
            href={FORGOT_PIN_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="rounded-lg px-2 py-1.5 text-sm font-semibold text-public-green transition-colors hover:text-public-deep focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-public-green"
          >
            Lupa PIN?
          </a>
        </div>
      </form>

      <div
        data-testid="login-support"
        className="mt-7 hidden items-center justify-between border-t border-slate-100 pt-4 lg:flex"
      >
        <Link
          href="/"
          className="-ml-2 inline-flex items-center gap-1.5 rounded-lg px-2 py-2 text-sm font-medium text-slate-500 transition-colors hover:text-public-deep focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-public-green"
        >
          <ArrowLeft className="h-4 w-4" />
          Kembali ke beranda
        </Link>
        <LoginSupportLink className="-mr-2" />
      </div>
    </div>
  );
}
