'use client';

import React, { useState, useTransition } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Eye, EyeOff, Loader2, ArrowLeft, AlertCircle, ShieldAlert } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { verifyAdminPinAction } from '@/features/auth/actions';

export function AdminLoginForm() {
  const router = useRouter();
  const [pin, setPin] = useState('');
  const [showPin, setShowPin] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const handlePinChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    // Hanya izinkan angka, maksimal 8 digit
    if (/^\d*$/.test(value) && value.length <= 8) {
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
    <div className="relative flex w-full flex-1 items-center justify-center p-6 sm:p-10 lg:w-1/2 bg-slate-50/70 overflow-hidden">
      {/* Background Dot Matrix Pattern */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(#cbd5e1_1px,transparent_1px)] [background-size:24px_24px] opacity-60"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -right-20 -top-20 h-72 w-72 rounded-full bg-emerald-200/40 blur-3xl"
      />

      <Card className="relative z-10 w-full max-w-md rounded-3xl border border-slate-200/80 bg-white/95 p-4 sm:p-6 shadow-2xl shadow-slate-900/10 backdrop-blur-xl">
        <CardHeader className="space-y-4 text-center pb-6">
          {/* Sized, Sharp Official School Logo */}
          <div className="mx-auto flex h-24 w-24 items-center justify-center overflow-hidden rounded-full bg-white p-1.5 shadow-xl ring-4 ring-emerald-500/15">
            <Image
              src="/logo.png"
              alt="Logo SD Plus 3 Al-Muhajirin"
              width={96}
              height={96}
              className="h-full w-full object-contain"
              priority
            />
          </div>

          <div className="space-y-1.5">
            <div className="inline-flex items-center gap-1.5 rounded-full border border-emerald-500/20 bg-emerald-50/90 px-3 py-1 text-[11px] font-bold uppercase tracking-wider text-[#007A10]">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-600 animate-pulse" />
              <span>Portal Panitia SPMB</span>
            </div>

            <CardTitle className="pt-2 text-2xl font-black tracking-tight text-slate-900 sm:text-3xl">
              Masuk Panel Admin
            </CardTitle>
            <p className="text-xs font-bold text-[#007A10]">
              SD Plus 3 Al-Muhajirin
            </p>
          </div>

          <CardDescription className="text-xs sm:text-sm leading-relaxed text-slate-600 max-w-xs mx-auto">
            Masukkan PIN keamanan panitia untuk mengakses dan mengelola seluruh data pendaftaran SPMB.
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-5">
          <form onSubmit={handleSubmit} className="space-y-5">
            {errorMessage && (
              <Alert variant="destructive" className="flex items-start gap-2.5 rounded-xl border-rose-200 bg-rose-50/90 p-3.5 text-rose-900 shadow-sm">
                <AlertCircle className="h-4 w-4 shrink-0 mt-0.5 text-rose-600" />
                <AlertDescription className="text-xs font-semibold leading-relaxed">
                  {errorMessage}
                </AlertDescription>
              </Alert>
            )}

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label
                  htmlFor="admin-pin-input"
                  className="block text-xs font-bold uppercase tracking-wider text-slate-700"
                >
                  PIN Keamanan
                </label>
                <span className="text-[11px] font-semibold text-slate-400">
                  Angka Rahasia
                </span>
              </div>

              {/* Styled High-Tech PIN Input Box */}
              <div className="relative rounded-2xl border-2 border-slate-200/90 bg-slate-50/80 transition-all focus-within:border-[#007A10] focus-within:bg-white focus-within:shadow-md focus-within:ring-4 focus-within:ring-emerald-500/10">
                <input
                  id="admin-pin-input"
                  name="pin"
                  type={showPin ? 'text' : 'password'}
                  inputMode="numeric"
                  pattern="[0-9]*"
                  autoComplete="current-password"
                  placeholder="Masukkan PIN"
                  value={pin}
                  onChange={handlePinChange}
                  disabled={isPending}
                  autoFocus
                  className="h-14 w-full bg-transparent px-4 pr-12 text-center font-mono text-2xl font-black tracking-[0.4em] text-slate-900 placeholder:font-sans placeholder:text-sm placeholder:font-medium placeholder:tracking-normal placeholder:text-slate-400 focus:outline-none"
                />

                <button
                  type="button"
                  aria-label={showPin ? 'Sembunyikan PIN' : 'Tampilkan PIN'}
                  onClick={() => setShowPin((prev) => !prev)}
                  tabIndex={-1}
                  className="absolute right-3 top-1/2 -translate-y-1/2 rounded-xl p-2 text-slate-400 transition-colors hover:bg-slate-200/70 hover:text-slate-700 focus:outline-none"
                >
                  {showPin ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
              </div>

              <div className="flex items-center gap-1.5 text-[11px] text-slate-500 pt-0.5">
                <ShieldAlert className="h-3.5 w-3.5 text-emerald-600 shrink-0" />
                <span>Gunakan PIN 6 digit resmi panitia administrasi sekolah.</span>
              </div>
            </div>

            <Button
              type="submit"
              disabled={isPending || pin.length === 0}
              className="h-13 w-full rounded-2xl bg-gradient-to-r from-[#007A10] to-[#009614] hover:from-[#00550B] hover:to-[#007A10] text-base font-bold text-white shadow-lg shadow-emerald-700/20 active:scale-[0.99] transition-all disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
            >
              {isPending ? (
                <>
                  <Loader2 className="h-5 w-5 animate-spin" />
                  <span>Memverifikasi Akses...</span>
                </>
              ) : (
                'Masuk ke Panel Admin'
              )}
            </Button>
          </form>
        </CardContent>

        <CardFooter className="flex justify-center border-t border-slate-100 pt-5 pb-2">
          <Link
            href="/"
            className="group inline-flex items-center gap-2 text-xs font-bold text-slate-500 transition-colors hover:text-[#007A10]"
          >
            <ArrowLeft className="h-3.5 w-3.5 transition-transform group-hover:-translate-x-1" />
            <span>Kembali ke Beranda SPMB</span>
          </Link>
        </CardFooter>
      </Card>
    </div>
  );
}
