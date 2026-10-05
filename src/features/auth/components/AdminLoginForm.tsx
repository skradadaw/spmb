'use client';

import React, { useState, useTransition } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Eye, EyeOff, LockKeyhole, Loader2, ArrowLeft, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
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
    <div className="flex w-full flex-1 items-center justify-center p-6 sm:p-10 lg:w-1/2">
      <Card className="w-full max-w-md border-slate-200 bg-white p-2 shadow-xl sm:p-4">
        <CardHeader className="space-y-2 text-center">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-50 text-[#007A10] shadow-sm ring-8 ring-emerald-50/50">
            <LockKeyhole className="h-7 w-7" />
          </div>
          <CardTitle className="pt-2 text-2xl font-black tracking-tight text-slate-900 sm:text-3xl">
            Masuk Panel Admin
          </CardTitle>
          <CardDescription className="text-sm leading-relaxed text-slate-600">
            Masukkan PIN keamanan panitia untuk mengakses dan mengelola seluruh data pendaftaran SPMB.
          </CardDescription>
        </CardHeader>

        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-5">
            {errorMessage && (
              <Alert variant="destructive" className="flex items-start gap-2.5">
                <AlertCircle className="h-4 w-4 shrink-0" />
                <AlertDescription className="text-xs font-medium sm:text-sm">
                  {errorMessage}
                </AlertDescription>
              </Alert>
            )}

            <div className="space-y-2">
              <label
                htmlFor="admin-pin-input"
                className="block text-xs font-bold uppercase tracking-wider text-slate-700"
              >
                PIN Keamanan
              </label>

              <div className="relative">
                <Input
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
                  className="h-14 pr-12 text-center font-mono text-2xl font-bold tracking-[0.35em] text-slate-900 placeholder:font-sans placeholder:text-sm placeholder:tracking-normal placeholder:text-slate-400 focus-visible:ring-[#007A10]"
                />

                <button
                  type="button"
                  aria-label={showPin ? 'Sembunyikan PIN' : 'Tampilkan PIN'}
                  onClick={() => setShowPin((prev) => !prev)}
                  tabIndex={-1}
                  className="absolute right-3 top-1/2 -translate-y-1/2 p-1.5 text-slate-400 transition-colors hover:text-slate-700 focus:outline-none"
                >
                  {showPin ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
              </div>
              <p className="text-[11px] text-slate-500">
                Gunakan PIN 6 digit yang telah diberikan oleh tim administrasi sekolah.
              </p>
            </div>

            <Button
              type="submit"
              disabled={isPending || pin.length === 0}
              className="h-12 w-full text-base font-bold shadow-md shadow-emerald-900/10"
            >
              {isPending ? (
                <>
                  <Loader2 className="h-5 w-5 animate-spin" />
                  <span>Memverifikasi...</span>
                </>
              ) : (
                'Masuk ke Panel Admin'
              )}
            </Button>
          </form>
        </CardContent>

        <CardFooter className="flex justify-center border-t border-slate-100 pt-4">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-xs font-semibold text-slate-500 transition-colors hover:text-[#007A10]"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            <span>Kembali ke Beranda SPMB</span>
          </Link>
        </CardFooter>
      </Card>
    </div>
  );
}
