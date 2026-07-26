"use client";

import { useActionState } from "react";
import { login } from "./actions";
import { Field, inputCls } from "@/components/ui";

export default function AdminLoginPage() {
  const [state, formAction, isPending] = useActionState(login, null);

  return (
    <div className="relative flex min-h-screen items-center justify-center bg-slate-950 px-4 py-12 text-slate-100 font-sans">
      {/* Background Ambient Glows */}
      <div className="absolute top-1/4 left-1/2 h-96 w-96 -translate-x-1/2 -translate-y-1/2 rounded-full bg-emerald-600/10 blur-[120px]" />

      <div className="relative z-10 w-full max-w-md space-y-6">
        {/* Header Logo */}
        <div className="text-center">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-emerald-600 font-extrabold text-white text-xl shadow-xl shadow-emerald-950">
            SD3
          </div>
          <h1 className="mt-4 text-2xl font-extrabold text-white sm:text-3xl">
            SPMB Admin Console
          </h1>
          <p className="mt-1 text-xs text-slate-400">
            SD Plus 3 Al-Muhajirin — TA 2027/2028
          </p>
        </div>

        {/* Login Card */}
        <div className="rounded-3xl border border-slate-800 bg-slate-900/90 p-8 shadow-2xl backdrop-blur-xl">
          <form action={formAction} className="space-y-4">
            <Field label="Alamat Email Admin">
              <input
                type="email"
                name="email"
                required
                className={`${inputCls} border-slate-700 bg-slate-800 text-white placeholder-slate-500 focus:border-emerald-500 focus:ring-emerald-500/20`}
                placeholder="admin@sdplus3almuhajirin.sch.id"
              />
            </Field>

            <Field label="Kata Sandi">
              <input
                type="password"
                name="password"
                required
                className={`${inputCls} border-slate-700 bg-slate-800 text-white placeholder-slate-500 focus:border-emerald-500 focus:ring-emerald-500/20`}
                placeholder="••••••••"
              />
            </Field>

            {state?.error && (
              <div className="rounded-xl border border-rose-500/30 bg-rose-950/40 p-3 text-xs font-semibold text-rose-300">
                ⚠️ {state.error}
              </div>
            )}

            <button
              disabled={isPending}
              className="mt-2 w-full rounded-xl bg-emerald-600 py-3 text-sm font-semibold text-white shadow-lg shadow-emerald-950 hover:bg-emerald-500 disabled:opacity-60 transition-all"
            >
              {isPending ? "Memverifikasi..." : "Masuk Konsol Admin →"}
            </button>
          </form>
        </div>

        {/* Footer info */}
        <p className="text-center text-xs text-slate-500">
          Akses terbatas hanya untuk panitia resmi SPMB SD Plus 3 Al-Muhajirin.
        </p>
      </div>
    </div>
  );
}
