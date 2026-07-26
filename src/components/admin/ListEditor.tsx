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
};

export default function ListEditor({ judul, kontenKey, fields, awal }: Props) {
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
        ? { ok: true, teks: "Tersimpan." }
        : { ok: false, teks: hasil.error ?? "Gagal menyimpan." }
    );
  }

  return (
    <section className="rounded-2xl bg-white p-5 shadow-sm">
      <h2 className="font-bold text-emerald-900">{judul}</h2>
      <div className="mt-3 space-y-3">
        {baris.map((row, i) => (
          <div key={i} className="rounded-xl border border-gray-200 p-3">
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
            <button type="button" onClick={() => hapus(i)} className="text-sm text-red-600">
              Hapus baris
            </button>
          </div>
        ))}
      </div>
      <div className="mt-3 flex items-center gap-3">
        <button type="button" onClick={tambah} className="text-sm font-medium text-emerald-700">
          + Tambah baris
        </button>
        <button
          type="button"
          onClick={simpan}
          disabled={memuat}
          className="ml-auto rounded-lg bg-emerald-700 px-4 py-2 text-sm font-semibold text-white hover:bg-emerald-800 disabled:opacity-60"
        >
          {memuat ? "Menyimpan..." : "Simpan"}
        </button>
      </div>
      {pesan && (
        <p className={`mt-2 text-sm ${pesan.ok ? "text-emerald-700" : "text-red-600"}`}>
          {pesan.teks}
        </p>
      )}
    </section>
  );
}
