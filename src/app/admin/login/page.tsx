"use client";

import { useState } from "react";
import { login } from "./actions";
import { Field, inputCls } from "@/components/ui";

export default function LoginPage() {
  const [error, setError] = useState("");
  const [memuat, setMemuat] = useState(false);

  async function masuk(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setMemuat(true);
    setError("");
    const hasil = await login(new FormData(e.currentTarget));
    // login() redirect saat sukses; sampai sini berarti gagal
    setMemuat(false);
    if (hasil?.error) setError(hasil.error);
  }

  return (
    <div className="py-16">
      <form onSubmit={masuk} className="mx-auto max-w-sm rounded-2xl bg-white p-6 shadow-sm">
        <h1 className="mb-4 text-center text-lg font-bold text-emerald-900">Login Panitia</h1>
        <Field label="Email">
          <input name="email" type="email" required className={inputCls} />
        </Field>
        <Field label="Password">
          <input name="password" type="password" required className={inputCls} />
        </Field>
        {error && <p className="mb-3 text-sm text-red-600">{error}</p>}
        <button
          type="submit"
          disabled={memuat}
          className="w-full rounded-xl bg-emerald-700 py-3 font-semibold text-white hover:bg-emerald-800 disabled:opacity-60"
        >
          {memuat ? "Memproses..." : "Masuk"}
        </button>
      </form>
    </div>
  );
}
