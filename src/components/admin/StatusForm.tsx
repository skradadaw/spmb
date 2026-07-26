"use client";

import { useState } from "react";
import {
  LABEL_PENERIMAAN,
  LABEL_VERIFIKASI,
  STATUS_PENERIMAAN,
  STATUS_VERIFIKASI,
} from "@/lib/status";
import { Field, inputCls } from "@/components/ui";
import { updateStatusPendaftar } from "@/app/admin/(dasbor)/pendaftar/[id]/actions";

type Props = {
  id: string;
  status_verifikasi: string;
  status_penerimaan: string;
  catatan_admin: string;
};

export default function StatusForm(awal: Props) {
  const [verifikasi, setVerifikasi] = useState(awal.status_verifikasi);
  const [penerimaan, setPenerimaan] = useState(awal.status_penerimaan);
  const [catatan, setCatatan] = useState(awal.catatan_admin);
  const [pesan, setPesan] = useState<{ ok: boolean; teks: string } | null>(null);
  const [memuat, setMemuat] = useState(false);

  async function simpan(e: React.FormEvent) {
    e.preventDefault();
    setMemuat(true);
    setPesan(null);
    const hasil = await updateStatusPendaftar(awal.id, {
      status_verifikasi: verifikasi,
      status_penerimaan: penerimaan,
      catatan_admin: catatan,
    });
    setMemuat(false);
    setPesan(
      hasil.ok
        ? { ok: true, teks: "✅ Perubahan status berhasil disimpan!" }
        : { ok: false, teks: hasil.error ?? "Gagal menyimpan." }
    );
  }

  return (
    <form onSubmit={simpan} className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
      <div className="flex items-center gap-2 border-b border-slate-100 pb-3 mb-4">
        <span className="text-xl">⚙️</span>
        <h2 className="font-bold text-slate-900">Ubah Status & Catatan Panitia</h2>
      </div>

      <Field label="Status Verifikasi Berkas">
        <select className={inputCls} value={verifikasi} onChange={(e) => setVerifikasi(e.target.value)}>
          {STATUS_VERIFIKASI.map((s) => (
            <option key={s} value={s}>{LABEL_VERIFIKASI[s]}</option>
          ))}
        </select>
      </Field>

      <Field label="Status Penerimaan">
        <select className={inputCls} value={penerimaan} onChange={(e) => setPenerimaan(e.target.value)}>
          {STATUS_PENERIMAAN.map((s) => (
            <option key={s} value={s}>{LABEL_PENERIMAAN[s]}</option>
          ))}
        </select>
      </Field>

      <Field label="Catatan untuk Pendaftar (Ditampilkan di Cek Status Publik)">
        <textarea
          className={inputCls}
          rows={3}
          value={catatan}
          onChange={(e) => setCatatan(e.target.value)}
          placeholder="Contoh: Foto KK kurang jelas, silakan hubungi panitia..."
        />
      </Field>

      {pesan && (
        <div className={`mb-4 rounded-xl p-3 text-xs font-semibold ${pesan.ok ? "bg-emerald-50 text-emerald-800 border border-emerald-200" : "bg-red-50 text-red-700 border border-red-200"}`}>
          {pesan.teks}
        </div>
      )}

      <button
        disabled={memuat}
        className="w-full rounded-xl bg-emerald-600 py-3 text-sm font-semibold text-white hover:bg-emerald-500 disabled:opacity-60 transition-colors shadow-md"
      >
        {memuat ? "Menyimpan Perubahan..." : "Simpan Perubahan Status"}
      </button>
    </form>
  );
}
