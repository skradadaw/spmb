"use client";

import { useState } from "react";
import { simpanKonten } from "@/app/admin/(dasbor)/konten/actions";
import AdminIcon, { type AdminIconName } from "@/components/admin/AdminIcon";
import { AdminCard, AdminFeedback, AdminField } from "@/components/admin/AdminUI";
import {
  adminDangerButtonCls,
  adminInputCls,
  adminPrimaryButtonCls,
  adminSecondaryButtonCls,
} from "@/components/admin/styles";
import type { KontenKey } from "@/lib/types";

type FieldDef = { name: string; label: string; textarea?: boolean };

type Props = {
  judul: string;
  kontenKey: KontenKey;
  fields: FieldDef[];
  awal: Record<string, string>[];
  icon: AdminIconName;
};

export default function ListEditor({ judul, kontenKey, fields, awal, icon }: Props) {
  const [baris, setBaris] = useState<Record<string, string>[]>(awal);
  const [pesan, setPesan] = useState<{ ok: boolean; teks: string } | null>(null);
  const [memuat, setMemuat] = useState(false);
  const [dirty, setDirty] = useState(false);

  function ubah(i: number, name: string, value: string) {
    setBaris((b) => b.map((row, j) => (j === i ? { ...row, [name]: value } : row)));
    setDirty(true);
  }

  function tambah() {
    setBaris((b) => [...b, Object.fromEntries(fields.map((f) => [f.name, ""]))]);
    setDirty(true);
  }

  function hapus(i: number) {
    setBaris((b) => b.filter((_, j) => j !== i));
    setDirty(true);
  }

  async function simpan() {
    setMemuat(true);
    setPesan(null);
    const hasil = await simpanKonten(kontenKey, baris);
    setMemuat(false);
    if (hasil.ok) setDirty(false);
    setPesan(
      hasil.ok
        ? { ok: true, teks: `${judul} berhasil disimpan.` }
        : { ok: false, teks: hasil.error ?? "Gagal menyimpan." }
    );
  }

  return (
    <AdminCard className="p-5 sm:p-6">
      <div className="mb-5 flex items-start justify-between gap-4 border-b border-slate-200 pb-4">
        <div className="flex items-start gap-3">
          <span className="flex min-h-11 min-w-11 items-center justify-center rounded-xl bg-green-50 text-[#00880F]">
            <AdminIcon name={icon} />
          </span>
          <div>
            <h2 className="admin-display text-xl font-bold text-[#101820]">{judul}</h2>
            {dirty && <span className="text-xs font-semibold text-amber-700">Perubahan belum disimpan</span>}
          </div>
        </div>
        <span className="shrink-0 text-xs font-semibold text-[#667085]">{baris.length} Item</span>
      </div>

      <div className="space-y-4">
        {baris.map((row, i) => (
          <div key={i} className="rounded-xl border border-slate-200 bg-slate-50/50 p-4">
            <div className="mb-3 flex items-center justify-between gap-3">
              <span className="text-xs font-bold text-[#667085]">Item {i + 1}</span>
              <button type="button" onClick={() => hapus(i)} className={`${adminDangerButtonCls} px-3 text-xs`}>
                <AdminIcon name="trash" className="h-4 w-4" />
                Hapus Item
              </button>
            </div>
            <div className="space-y-3">
              {fields.map((f) => {
                const inputId = `${kontenKey}-${i}-${f.name}`;

                return (
                  <AdminField key={f.name} id={inputId} label={f.label}>
                    {f.textarea ? (
                      <textarea
                        id={inputId}
                        className={adminInputCls}
                        rows={3}
                        placeholder={f.label}
                        value={row[f.name] ?? ""}
                        onChange={(e) => ubah(i, f.name, e.target.value)}
                      />
                    ) : (
                      <input
                        id={inputId}
                        className={adminInputCls}
                        placeholder={f.label}
                        value={row[f.name] ?? ""}
                        onChange={(e) => ubah(i, f.name, e.target.value)}
                      />
                    )}
                  </AdminField>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      <div className="mt-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <button type="button" onClick={tambah} className={`${adminSecondaryButtonCls} w-full sm:w-auto`}>
          <AdminIcon name="plus" className="h-4 w-4" />
          Tambah Item Baru
        </button>
        <button type="button" onClick={simpan} disabled={memuat} className={`${adminPrimaryButtonCls} w-full sm:w-auto`}>
          {memuat ? "Menyimpan..." : "Simpan Perubahan"}
        </button>
      </div>

      {pesan && <div className="mt-4"><AdminFeedback ok={pesan.ok}>{pesan.teks}</AdminFeedback></div>}
    </AdminCard>
  );
}
