"use client";

import { useState } from "react";
import { cekStatus, type CekStatusResult } from "./actions";
import { LABEL_PENERIMAAN, LABEL_VERIFIKASI } from "@/lib/status";
import { Badge, Field, inputCls } from "@/components/ui";

const WARNA_VERIFIKASI = { menunggu: "abu", terverifikasi: "hijau", perlu_perbaikan: "kuning" } as const;
const WARNA_PENERIMAAN = { menunggu: "abu", diterima: "hijau", tidak_diterima: "merah" } as const;

export default function CekStatusPage() {
  const [nomor, setNomor] = useState("");
  const [tanggal, setTanggal] = useState("");
  const [hasil, setHasil] = useState<CekStatusResult | null>(null);
  const [memuat, setMemuat] = useState(false);

  async function periksa(e: React.FormEvent) {
    e.preventDefault();
    setMemuat(true);
    setHasil(await cekStatus({ nomor: nomor.toUpperCase(), tanggal_lahir: tanggal }));
    setMemuat(false);
  }

  return (
    <div className="py-8">
      <div className="mx-auto max-w-lg">
        <h1 className="text-center text-xl font-bold text-emerald-900">Cek Status Pendaftaran</h1>
        <form onSubmit={periksa} className="mt-6 rounded-2xl bg-white p-5 shadow-sm">
          <Field label="Nomor Pendaftaran">
            <input
              className={inputCls}
              placeholder="SPMB-2728-0001"
              value={nomor}
              onChange={(e) => setNomor(e.target.value)}
            />
          </Field>
          <Field label="Tanggal Lahir Calon Siswa">
            <input
              type="date"
              className={inputCls}
              value={tanggal}
              onChange={(e) => setTanggal(e.target.value)}
            />
          </Field>
          <button
            type="submit"
            disabled={memuat}
            className="w-full rounded-xl bg-emerald-700 py-3 font-semibold text-white hover:bg-emerald-800 disabled:opacity-60"
          >
            {memuat ? "Memeriksa..." : "Periksa Status"}
          </button>
        </form>

        {hasil && !hasil.ok && (
          <p className="mt-4 rounded-lg bg-red-50 p-3 text-sm text-red-700">{hasil.error}</p>
        )}

        {hasil && hasil.ok && (
          <div className="mt-4 rounded-2xl bg-white p-5 shadow-sm">
            <p className="font-semibold">{hasil.nama_lengkap}</p>
            <div className="mt-3 space-y-2 text-sm">
              <p className="flex items-center justify-between">
                <span className="text-gray-500">Status Berkas</span>
                <Badge warna={WARNA_VERIFIKASI[hasil.status_verifikasi]}>
                  {LABEL_VERIFIKASI[hasil.status_verifikasi]}
                </Badge>
              </p>
              <p className="flex items-center justify-between">
                <span className="text-gray-500">Status Penerimaan</span>
                <Badge warna={WARNA_PENERIMAAN[hasil.status_penerimaan]}>
                  {LABEL_PENERIMAAN[hasil.status_penerimaan]}
                </Badge>
              </p>
              {hasil.catatan_admin && (
                <div className="mt-3 rounded-lg bg-amber-50 p-3 text-amber-800">
                  <p className="font-medium">Catatan panitia:</p>
                  <p>{hasil.catatan_admin}</p>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
