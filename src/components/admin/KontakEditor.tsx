"use client";

import { useState } from "react";
import { simpanKonten } from "@/app/admin/(dasbor)/konten/actions";
import AdminIcon from "@/components/admin/AdminIcon";
import { AdminCard, AdminFeedback, AdminField } from "@/components/admin/AdminUI";
import { adminInputCls, adminPrimaryButtonCls } from "@/components/admin/styles";
import type { Kontak } from "@/lib/types";

export default function KontakEditor({ awal }: { awal: Kontak }) {
  const [kontak, setKontak] = useState(awal);
  const [pesan, setPesan] = useState<{ ok: boolean; teks: string } | null>(null);
  const [memuat, setMemuat] = useState(false);
  const [dirty, setDirty] = useState(false);

  function ubah(name: keyof Kontak, value: string) {
    setKontak((current) => ({ ...current, [name]: value }));
    setDirty(true);
  }

  async function simpan() {
    setMemuat(true);
    setPesan(null);
    const hasil = await simpanKonten("kontak", kontak);
    setMemuat(false);
    if (hasil.ok) setDirty(false);
    setPesan(
      hasil.ok
        ? { ok: true, teks: "Kontak panitia berhasil disimpan." }
        : { ok: false, teks: hasil.error ?? "Gagal menyimpan." }
    );
  }

  return (
    <AdminCard className="p-5 sm:p-6">
      <div className="mb-5 flex items-start gap-3 border-b border-slate-200 pb-4">
        <span className="flex min-h-11 min-w-11 items-center justify-center rounded-xl bg-green-50 text-[#00880F]">
          <AdminIcon name="users" />
        </span>
        <div>
          <h2 className="admin-display text-xl font-bold text-[#101820]">Kontak Panitia SPMB</h2>
          <p className="mt-1 text-sm text-[#667085]">Perbarui informasi yang dapat dihubungi calon siswa dan wali.</p>
          {dirty && <span className="text-xs font-semibold text-amber-700">Perubahan belum disimpan</span>}
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <AdminField id="kontak-whatsapp" label="Nomor WhatsApp Panitia">
          <input
            id="kontak-whatsapp"
            className={adminInputCls}
            value={kontak.whatsapp}
            onChange={(e) => ubah("whatsapp", e.target.value)}
            placeholder="081234567890"
          />
        </AdminField>
        <AdminField id="kontak-telepon" label="Nomor Telepon Sekolah">
          <input
            id="kontak-telepon"
            className={adminInputCls}
            value={kontak.telepon}
            onChange={(e) => ubah("telepon", e.target.value)}
            placeholder="(0264) 123456"
          />
        </AdminField>
      </div>

      <div className="mt-4">
        <AdminField id="kontak-alamat" label="Alamat Lengkap Sekolah">
          <textarea
            id="kontak-alamat"
            className={adminInputCls}
            rows={3}
            value={kontak.alamat}
            onChange={(e) => ubah("alamat", e.target.value)}
          />
        </AdminField>
      </div>

      <div className="mt-5 flex justify-end">
        <button type="button" onClick={simpan} disabled={memuat} className={`${adminPrimaryButtonCls} w-full sm:w-auto`}>
          {memuat ? "Menyimpan..." : "Simpan Kontak"}
        </button>
      </div>

      {pesan && <div className="mt-4"><AdminFeedback ok={pesan.ok}>{pesan.teks}</AdminFeedback></div>}
    </AdminCard>
  );
}
