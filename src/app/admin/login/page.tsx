"use client";

import { useActionState } from "react";
import { login } from "./actions";
import { Field, inputCls } from "@/components/ui";

export default function AdminLoginPage() {
  const [state, formAction, isPending] = useActionState(login, null);

  return (
    <div className="relative flex min-h-screen items-center justify-center bg-[#1c1a2e] px-4 py-12 text-white font-sans">
      {/* Background Ambient Glow Maglo Lime */}
      <div className="absolute top-1/3 left-1/2 h-96 w-96 -translate-x-1/2 -translate-y-1/2 rounded-full bg-[#c8ee44]/10 blur-[130px]" />

      <div className="relative z-10 w-full max-w-md space-y-6">
        {/* Header Logo */}
        <div className="text-center">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-3xl bg-[#c8ee44] font-black text-[#1c1a2e] text-2xl shadow-xl shadow-[#c8ee44]/20">
            SD3
          </div>
          <h1 className="mt-5 text-2xl font-black text-white sm:text-3xl tracking-tight">
            SPMB Admin Console
          </h1>
          <p className="mt-1 text-xs font-medium text-slate-400">
            SD Plus 3 Al-Muhajirin — TA 2027/2028
          </p>
        </div>

        {/* Login Card Maglo Style */}
        <div className="rounded-3xl border border-[#282541] bg-[#201e34]/90 p-8 shadow-2xl backdrop-blur-xl">
          <form action={formAction} className="space-y-4">
            <Field label="Alamat Email Admin">
              <input
                type="email"
                name="email"
                required
                className={`${inputCls} admin-login-input border-[#282541] bg-[#1c1a2e] placeholder-slate-500 focus:border-[#c8ee44] focus:ring-[#c8ee44]/20`}
                placeholder="admin@sdplus3almuhajirin.sch.id"
              />
            </Field>

            <Field label="Kata Sandi">
              <input
                type="password"
                name="password"
                required
                className={`${inputCls} admin-login-input border-[#282541] bg-[#1c1a2e] placeholder-slate-500 focus:border-[#c8ee44] focus:ring-[#c8ee44]/20`}
                placeholder="••••••••"
              />
            </Field>

            {state?.error && (
              <div className="rounded-2xl border border-rose-500/30 bg-rose-950/40 p-3 text-xs font-bold text-rose-300">
                ⚠️ {state.error}
              </div>
            )}

            <button
              disabled={isPending}
              className="mt-3 w-full rounded-2xl bg-[#c8ee44] py-3.5 text-sm font-black text-[#1c1a2e] shadow-lg shadow-[#c8ee44]/20 hover:bg-[#b5da35] disabled:opacity-60 transition-all"
            >
              {isPending ? "Memverifikasi Sesi..." : "Masuk Konsol Admin →"}
            </button>
          </form>
        </div>

        {/* Footer info */}
        <p className="text-center text-xs font-medium text-slate-500">
          Akses terbatas hanya untuk panitia resmi SPMB SD Plus 3 Al-Muhajirin.
        </p>
      </div>
    </div>
  );
}
