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
    <div className="relative flex w-full flex-1 items-center justify-center p-6 sm:p-10 lg:w-1/2 bg-slate-50">
      <Card className="relative z-10 w-full max-w-md rounded-2xl border border-slate-200 bg-white p-6 sm:p-8 shadow-xl shadow-slate-200/50">
        <CardHeader className="space-y-4 text-center pb-6">
          {/* Official School Logo */}
          <div className="mx-auto flex h-20 w-20 items-center justify-center">
            <Image
              src="/logo.png"
              alt="Logo SD Plus 3 Al-Muhajirin"
              width={80}
              height={80}
              className="h-full w-full object-contain drop-shadow-sm"
              priority
            />
          </div>

          <div className="space-y-1.5">
            <div className="inline-flex items-center gap-1.5 rounded-full border border-emerald-500/20 bg-emerald-50 px-3 py-1 text-[11px] font-semibold tracking-wide text-[#00880F]">
              <span className="h-1.5 w-1.5 rounded-full bg-[#00AA13]" />
              <span>Portal Panitia SPMB</span>
            </div>

            <CardTitle className="pt-1.5 text-2xl font-bold tracking-tight text-slate-900 sm:text-[26px]">
              Masuk Panel Admin
            </CardTitle>
            <p className="text-xs font-semibold text-[#00880F] tracking-wide">
              SD Plus 3 Al-Muhajirin
            </p>
          </div>

          <CardDescription className="text-xs sm:text-sm leading-relaxed text-slate-500 max-w-xs mx-auto">
            Masukkan PIN keamanan panitia untuk mengakses dan mengelola seluruh data pendaftaran SPMB.
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-5">
          <form onSubmit={handleSubmit} className="space-y-5">
            {errorMessage && (
              <Alert variant="destructive" className="flex items-start gap-2.5 rounded-xl border-rose-200 bg-rose-50 p-3.5 text-rose-900 shadow-xs">
                <AlertCircle className="h-4 w-4 shrink-0 mt-0.5 text-rose-600" />
                <AlertDescription className="text-xs font-medium leading-relaxed">
                  {errorMessage}
                </AlertDescription>
              </Alert>
            )}

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label
                  htmlFor="admin-pin-input"
                  className="block text-xs font-semibold uppercase tracking-wider text-slate-700"
                >
                  PIN Keamanan
                </label>
                <span className="text-[11px] font-medium text-slate-400">
                  Angka Rahasia
                </span>
              </div>

              {/* PIN Input Box with Gojek Green Focus */}
              <div className="relative rounded-xl border border-slate-200 bg-white transition-all focus-within:border-[#00AA13] focus-within:ring-4 focus-within:ring-[#00AA13]/15">
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
                  className="h-12 w-full bg-transparent px-4 pr-12 text-center font-mono text-xl font-bold tracking-[0.3em] text-slate-900 placeholder:font-sans placeholder:text-sm placeholder:font-normal placeholder:tracking-normal placeholder:text-slate-400 focus:outline-none"
                />

                <button
                  type="button"
                  aria-label={showPin ? 'Sembunyikan PIN' : 'Tampilkan PIN'}
                  onClick={() => setShowPin((prev) => !prev)}
                  tabIndex={-1}
                  className="absolute right-3 top-1/2 -translate-y-1/2 rounded-lg p-1.5 text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-700 focus:outline-none cursor-pointer"
                >
                  {showPin ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>

              <div className="flex items-center gap-1.5 text-[11px] text-slate-500 pt-0.5">
                <ShieldAlert className="h-3.5 w-3.5 text-[#00880F] shrink-0" />
                <span>Gunakan PIN 6 digit resmi panitia administrasi sekolah.</span>
              </div>
            </div>

            <Button
              type="submit"
              disabled={isPending || pin.length === 0}
              className="h-11 w-full rounded-xl bg-[#00AA13] hover:bg-[#00880F] active:bg-[#007A10] text-sm font-semibold text-white shadow-sm transition-all disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
            >
              {isPending ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span>Memverifikasi Akses...</span>
                </>
              ) : (
                'Masuk ke Panel Admin'
              )}
            </Button>
          </form>
        </CardContent>

        <CardFooter className="flex justify-center border-t border-slate-100 pt-5 pb-1">
          <Link
            href="/"
            className="group inline-flex items-center gap-2 text-xs font-semibold text-slate-500 transition-colors hover:text-[#00AA13]"
          >
            <ArrowLeft className="h-3.5 w-3.5 transition-transform group-hover:-translate-x-1" />
            <span>Kembali ke Beranda SPMB</span>
          </Link>
        </CardFooter>
      </Card>
    </div>
  );
}
