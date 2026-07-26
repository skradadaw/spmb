"use client";

import { useState } from "react";
import { inputCls } from "@/components/ui";
import { simpanKonten } from "@/app/admin/(dasbor)/konten/actions";
import type { KontenKey } from "@/lib/types";

type FieldDef = { name: string; label: string; textarea?: boolean };

type Props = {
  judul: string;
  kontenKey: KontenKey;
  fields: FieldDef[];
  awal: Record<string, string>[];
  icon?: string;
};

export default function ListEditor({ judul, kontenKey, fields, awal, icon = "📝" }: Props) {
  const [baris, setBaris] = useState<Record<string, string>[]>(awal);
  const [pesan, setPesan] = useState<{ ok: boolean; teks: string } | null>(null);
  const [memuat, setMemuat] = useState(false);

  function ubah(i: number, name: string, value: string) {
    setBaris((b) => b.map((row, j) => (j === i ? { ...row, [name]: value } : row)));
  }

  function tambah() {
    setBaris((b) => [...b, Object.fromEntries(fields.map((f) => [f.name, ""]))]);
  }

  function hapus(i: number) {
    setBaris((b) => b.filter((_, j) => j !== i));
  }

  async function simpan() {
    setMemuat(true);
    setPesan(null);
    const hasil = await simpanKonten(kontenKey, baris);
    setMemuat(false);
    setPesan(
      hasil.ok
        ? { ok: true, teks: "✅ Perubahan berhasil tersimpan di situs publik!" }
        : { ok: false, teks: hasil.error ?? "Gagal menyimpan." }
    );
  }

  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
      <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-4">
        <div className="flex items-center gap-2">
          <span className="text-xl">{icon}</span>
          <h2 className="font-bold text-slate-900">{judul}</h2>
        </div>
        <span className="text-xs font-semibold text-slate-400">{baris.length} Item</span>
      </div>

      <div className="space-y-4">
        {baris.map((row, i) => (
          <div key={i} className="relative rounded-xl border border-slate-200 bg-slate-50/50 p-4 pt-3">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold text-slate-400"># Item {i + 1}</span>
              <button
                type="button"
                onClick={() => hapus(i)}
                className="text-xs font-semibold text-rose-600 hover:underline"
              >
                Hapus Item
              </button>
            </div>
            {fields.map((f) =>
              f.textarea ? (
                <textarea
                  key={f.name}
                  className={`${inputCls} mb-2`}
                  rows={2}
                  placeholder={f.label}
                  value={row[f.name] ?? ""}
                  onChange={(e) => ubah(i, f.name, e.target.value)}
                />
              ) : (
                <input
                  key={f.name}
                  className={`${inputCls} mb-2`}
                  placeholder={f.label}
                  value={row[f.name] ?? ""}
                  onChange={(e) => ubah(i, f.name, e.target.value)}
                />
              )
            )}
          </div>
        ))}
      </div>

      <div className="mt-4 flex items-center justify-between gap-3 pt-2">
        <button
          type="button"
          onClick={tambah}
          className="inline-flex items-center gap-1 text-xs font-bold text-emerald-700 hover:text-emerald-800 bg-emerald-50 px-3 py-2 rounded-xl border border-emerald-200"
        >
          <span>+</span>
          <span>Tambah Item Baru</span>
        </button>
        <button
          type="button"
          onClick={simpan}
          disabled={memuat}
          className="rounded-xl bg-emerald-600 px-5 py-2 text-xs font-semibold text-white hover:bg-emerald-500 disabled:opacity-60 transition-colors shadow-sm"
        >
          {memuat ? "Menyimpan..." : "Simpan Perubahan"}
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
