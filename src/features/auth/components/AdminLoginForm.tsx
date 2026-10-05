'use client';

import React, { useState, useTransition } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Eye, EyeOff, Loader2, AlertCircle, HelpCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
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
    <div className="flex w-full items-center justify-center lg:w-1/2">
      <Card className="w-full max-w-[420px] rounded-2xl border border-gray-100 bg-white p-7 sm:p-9 shadow-xl shadow-gray-200/50">
        <CardHeader className="space-y-2 p-0 pb-6 text-left">
          <CardTitle className="text-2xl sm:text-3xl font-bold tracking-tight text-gray-900">
            Masuk Panel Admin
          </CardTitle>
          <CardDescription className="text-xs sm:text-sm text-gray-500 leading-relaxed">
            Masuk menggunakan PIN keamanan panitia yang terdaftar.
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-5 p-0">
          <form onSubmit={handleSubmit} className="space-y-4">
            {errorMessage && (
              <Alert variant="destructive" className="flex items-start gap-2.5 rounded-lg border-rose-200 bg-rose-50 p-3 text-rose-900 shadow-xs">
                <AlertCircle className="h-4 w-4 shrink-0 mt-0.5 text-rose-600" />
                <AlertDescription className="text-xs font-medium leading-relaxed">
                  {errorMessage}
                </AlertDescription>
              </Alert>
            )}

            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label
                  htmlFor="admin-pin-input"
                  className="block text-xs font-semibold text-gray-700"
                >
                  PIN Keamanan
                </label>
                <span className="text-[11px] font-medium text-gray-400">
                  Angka Rahasia
                </span>
              </div>

              {/* Clean Input Box (GoFood Style) */}
              <div className="relative rounded-lg border border-gray-300 bg-white transition-all focus-within:border-[#00AA13] focus-within:ring-2 focus-within:ring-[#00AA13]/20">
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
                  className="h-11 w-full bg-transparent px-3.5 pr-11 text-center font-mono text-lg font-bold tracking-[0.3em] text-gray-900 placeholder:font-sans placeholder:text-sm placeholder:font-normal placeholder:tracking-normal placeholder:text-gray-400 focus:outline-none"
                />

                <button
                  type="button"
                  aria-label={showPin ? 'Sembunyikan PIN' : 'Tampilkan PIN'}
                  onClick={() => setShowPin((prev) => !prev)}
                  tabIndex={-1}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 rounded-md p-1.5 text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-600 focus:outline-none cursor-pointer"
                >
                  {showPin ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>

              <p className="text-[11px] text-gray-500 pt-0.5">
                Gunakan PIN 6 digit resmi panitia administrasi sekolah.
              </p>
            </div>

            {/* Primary Action Button (GoFood Green) */}
            <Button
              type="submit"
              disabled={isPending || pin.length === 0}
              className={`h-11 w-full rounded-lg text-sm font-semibold transition-all cursor-pointer ${
                pin.length === 0
                  ? 'bg-gray-100 text-gray-400 hover:bg-gray-100 cursor-not-allowed'
                  : 'bg-[#00AA13] text-white hover:bg-[#00880F] active:bg-[#007A10] shadow-xs'
              }`}
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

            {/* Secondary Action: Outlined Green Button (Like GoFood "Daftar GoFood Merchant") */}
            <Link
              href="/"
              className="flex h-11 w-full items-center justify-center rounded-lg border border-[#00AA13] text-sm font-semibold text-[#00AA13] hover:bg-[#00AA13]/5 transition-colors"
            >
              Kembali ke Beranda SPMB
            </Link>
          </form>

          {/* Terms & Privacy Note (GoFood style) */}
          <div className="pt-4 border-t border-gray-100 text-center space-y-3">
            <p className="text-[11px] leading-relaxed text-gray-400">
              Dengan masuk, Anda menyetujui protokol keamanan dan kerahasiaan data calon murid SD Plus 3 Al-Muhajirin.
            </p>

            <a
              href="https://wa.me/6281234567890"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#00AA13] hover:underline"
            >
              <HelpCircle className="h-3.5 w-3.5" />
              <span>Butuh bantuan?</span>
            </a>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
