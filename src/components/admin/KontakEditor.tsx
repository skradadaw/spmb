"use client";

import { useState } from "react";
import { Field, inputCls } from "@/components/ui";
import { simpanKonten } from "@/app/admin/(dasbor)/konten/actions";
import type { Kontak } from "@/lib/types";

export default function KontakEditor({ awal }: { awal: Kontak }) {
  const [kontak, setKontak] = useState(awal);
  const [pesan, setPesan] = useState<{ ok: boolean; teks: string } | null>(null);
  const [memuat, setMemuat] = useState(false);

  async function simpan() {
    setMemuat(true);
    setPesan(null);
    const hasil = await simpanKonten("kontak", kontak);
    setMemuat(false);
    setPesan(
      hasil.ok
        ? { ok: true, teks: "✅ Kontak panitia berhasil diperbarui!" }
        : { ok: false, teks: hasil.error ?? "Gagal menyimpan." }
    );
  }

  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
      <div className="flex items-center gap-2 border-b border-slate-100 pb-3 mb-4">
        <span className="text-xl">📞</span>
        <h2 className="font-bold text-slate-900">Kontak Panitia SPMB</h2>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <Field label="Nomor WhatsApp Panitia">
          <input
            className={inputCls}
            value={kontak.whatsapp}
            onChange={(e) => setKontak({ ...kontak, whatsapp: e.target.value })}
            placeholder="081234567890"
          />
        </Field>
        <Field label="Nomor Telepon Sekolah">
          <input
            className={inputCls}
            value={kontak.telepon}
            onChange={(e) => setKontak({ ...kontak, telepon: e.target.value })}
            placeholder="(0264) 123456"
          />
        </Field>
      </div>

      <Field label="Alamat Lengkap Sekolah">
        <textarea
          className={inputCls}
          rows={2}
          value={kontak.alamat}
          onChange={(e) => setKontak({ ...kontak, alamat: e.target.value })}
        />
      </Field>

      <div className="mt-4 flex justify-end">
        <button
          type="button"
          onClick={simpan}
          disabled={memuat}
          className="rounded-xl bg-emerald-600 px-5 py-2 text-xs font-semibold text-white hover:bg-emerald-500 disabled:opacity-60 transition-colors shadow-sm"
        >
          {memuat ? "Menyimpan..." : "Simpan Kontak"}
        </button>
      </div>

      {pesan && (
        <div className={`mt-3 rounded-xl p-3 text-xs font-semibold ${pesan.ok ? "bg-emerald-50 text-emerald-800 border border-emerald-200" : "bg-red-50 text-red-700 border border-red-200"}`}>
          {pesan.teks}
        </div>
      )}
    </section>
  );
}
