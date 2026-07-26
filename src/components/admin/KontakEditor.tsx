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
        ? { ok: true, teks: "Tersimpan." }
        : { ok: false, teks: hasil.error ?? "Gagal menyimpan." }
    );
  }

  return (
    <section className="rounded-2xl bg-white p-5 shadow-sm">
      <h2 className="mb-3 font-bold text-emerald-900">Kontak Panitia</h2>
      <Field label="Nomor WhatsApp">
        <input
          className={inputCls}
          value={kontak.whatsapp}
          onChange={(e) => setKontak({ ...kontak, whatsapp: e.target.value })}
        />
      </Field>
      <Field label="Telepon">
        <input
          className={inputCls}
          value={kontak.telepon}
          onChange={(e) => setKontak({ ...kontak, telepon: e.target.value })}
        />
      </Field>
      <Field label="Alamat">
        <textarea
          className={inputCls}
          rows={2}
          value={kontak.alamat}
          onChange={(e) => setKontak({ ...kontak, alamat: e.target.value })}
        />
      </Field>
      <button
        type="button"
        onClick={simpan}
        disabled={memuat}
        className="rounded-lg bg-emerald-700 px-4 py-2 text-sm font-semibold text-white hover:bg-emerald-800 disabled:opacity-60"
      >
        {memuat ? "Menyimpan..." : "Simpan"}
      </button>
      {pesan && (
        <p className={`mt-2 text-sm ${pesan.ok ? "text-emerald-700" : "text-red-600"}`}>
          {pesan.teks}
        </p>
      )}
    </section>
  );
}
