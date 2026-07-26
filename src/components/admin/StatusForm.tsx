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
        ? { ok: true, teks: "Perubahan tersimpan." }
        : { ok: false, teks: hasil.error ?? "Gagal menyimpan." }
    );
  }

  return (
    <form onSubmit={simpan} className="rounded-2xl bg-white p-5 shadow-sm">
      <h2 className="mb-4 font-bold text-emerald-900">Ubah Status</h2>
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
      <Field label="Catatan untuk Pendaftar (tampil di halaman Cek Status)">
        <textarea
          className={inputCls}
          rows={3}
          value={catatan}
          onChange={(e) => setCatatan(e.target.value)}
          placeholder="Contoh: Foto Kartu Keluarga buram, mohon hubungi panitia."
        />
      </Field>
      {pesan && (
        <p className={`mb-3 text-sm ${pesan.ok ? "text-emerald-700" : "text-red-600"}`}>
          {pesan.teks}
        </p>
      )}
      <button
        disabled={memuat}
        className="w-full rounded-xl bg-emerald-700 py-3 font-semibold text-white hover:bg-emerald-800 disabled:opacity-60 sm:w-auto sm:px-6"
      >
        {memuat ? "Menyimpan..." : "Simpan Perubahan"}
      </button>
    </form>
  );
}
