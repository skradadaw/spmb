"use client";

import { useState } from "react";
import {
  LABEL_PENERIMAAN,
  LABEL_VERIFIKASI,
  STATUS_PENERIMAAN,
  STATUS_VERIFIKASI,
} from "@/lib/status";
import { needsStatusConfirmation } from "@/lib/admin/status-confirmation";
import { updateStatusPendaftar } from "@/app/admin/(dasbor)/pendaftar/[id]/actions";
import AdminIcon from "@/components/admin/AdminIcon";
import { AdminFeedback, AdminField } from "@/components/admin/AdminUI";
import { adminCardCls, adminInputCls, adminPrimaryButtonCls } from "@/components/admin/styles";

type Props = {
  id: string;
  status_verifikasi: string;
  status_penerimaan: string;
  catatan_admin: string;
};

export default function StatusForm(awal: Props) {
  const [verifikasi, setVerifikasi] = useState(awal.status_verifikasi);
  const [penerimaan, setPenerimaan] = useState(awal.status_penerimaan);
  const [savedPenerimaan, setSavedPenerimaan] = useState(awal.status_penerimaan);
  const [catatan, setCatatan] = useState(awal.catatan_admin);
  const [pesan, setPesan] = useState<{ ok: boolean; teks: string } | null>(null);
  const [memuat, setMemuat] = useState(false);

  async function simpan(e: React.FormEvent) {
    e.preventDefault();
    if (
      needsStatusConfirmation(savedPenerimaan, penerimaan) &&
      !window.confirm("Tetapkan calon siswa sebagai tidak diterima?")
    ) return;

    setMemuat(true);
    setPesan(null);
    const hasil = await updateStatusPendaftar(awal.id, {
      status_verifikasi: verifikasi,
      status_penerimaan: penerimaan,
      catatan_admin: catatan,
    });
    setMemuat(false);
    if (hasil.ok) setSavedPenerimaan(penerimaan);
    setPesan(
      hasil.ok
        ? { ok: true, teks: "Perubahan pendaftar berhasil disimpan." }
        : { ok: false, teks: hasil.error ?? "Gagal menyimpan." }
    );
  }

  return (
    <form onSubmit={simpan} className={`${adminCardCls} p-5 sm:p-6`}>
      <div className="mb-5 flex items-start gap-3 border-b border-slate-200 pb-4">
        <span className="flex min-h-11 min-w-11 items-center justify-center rounded-xl bg-green-50 text-[#00880F]">
          <AdminIcon name="check" />
        </span>
        <div>
          <h2 className="admin-display text-xl font-bold text-[#101820]">Keputusan Panitia</h2>
          <p className="mt-1 text-sm text-[#667085]">Tinjau status berkas dan hasil penerimaan calon siswa.</p>
        </div>
      </div>

      <div className="space-y-4">
      <AdminField id="status-verifikasi" label="Status Verifikasi Berkas">
        <select id="status-verifikasi" className={adminInputCls} value={verifikasi} onChange={(e) => setVerifikasi(e.target.value)}>
          {STATUS_VERIFIKASI.map((s) => (
            <option key={s} value={s}>{LABEL_VERIFIKASI[s]}</option>
          ))}
        </select>
      </AdminField>

      <AdminField id="status-penerimaan" label="Status Penerimaan">
        <select id="status-penerimaan" className={adminInputCls} value={penerimaan} onChange={(e) => setPenerimaan(e.target.value)}>
          {STATUS_PENERIMAAN.map((s) => (
            <option key={s} value={s}>{LABEL_PENERIMAAN[s]}</option>
          ))}
        </select>
      </AdminField>

      <AdminField id="catatan-admin" label="Catatan untuk pendaftar" hint="Ditampilkan di halaman cek status publik.">
        <textarea
          id="catatan-admin"
          className={adminInputCls}
          rows={3}
          value={catatan}
          onChange={(e) => setCatatan(e.target.value)}
          placeholder="Contoh: Foto KK kurang jelas, silakan hubungi panitia..."
        />
      </AdminField>
      </div>

      {pesan && (
        <AdminFeedback ok={pesan.ok}>{pesan.teks}</AdminFeedback>
      )}

      <button
        disabled={memuat}
        className={`${adminPrimaryButtonCls} mt-5 w-full`}
      >
        {memuat ? "Menyimpan perubahan..." : "Simpan perubahan"}
      </button>
    </form>
  );
}
