"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

type Bukti = {
  nomor: string;
  siswa: Record<string, string>;
  ortu: Record<string, string>;
};

export default function SuksesPage() {
  const [bukti, setBukti] = useState<Bukti | null | undefined>(undefined);

  useEffect(() => {
    const raw = sessionStorage.getItem("spmb_bukti");
    setBukti(raw ? (JSON.parse(raw) as Bukti) : null);
  }, []);

  if (bukti === undefined) return null;

  if (bukti === null) {
    return (
      <div className="py-16 text-center">
        <p className="text-gray-700">Data bukti pendaftaran tidak ditemukan di perangkat ini.</p>
        <Link href="/cek-status" className="mt-3 inline-block font-medium text-emerald-700 underline">
          Gunakan halaman Cek Status
        </Link>
      </div>
    );
  }

  const baris: [string, string][] = [
    ["Nama Calon Siswa", bukti.siswa.nama_lengkap],
    ["NIK", bukti.siswa.nik],
    ["Tempat, Tanggal Lahir", `${bukti.siswa.tempat_lahir}, ${bukti.siswa.tanggal_lahir}`],
    ["Jenis Kelamin", bukti.siswa.jenis_kelamin === "L" ? "Laki-laki" : "Perempuan"],
    ["Nama Ayah", bukti.ortu.nama_ayah],
    ["Nama Ibu", bukti.ortu.nama_ibu],
    ["No. WhatsApp", bukti.ortu.no_whatsapp],
  ];

  return (
    <div className="py-8">
      <div className="mx-auto max-w-lg rounded-2xl bg-white p-6 shadow-sm">
        <p className="text-center text-4xl">✅</p>
        <h1 className="mt-2 text-center text-xl font-bold text-emerald-900">
          Pendaftaran Berhasil
        </h1>
        <p className="mt-4 text-center text-sm text-gray-600">Nomor Pendaftaran Anda</p>
        <p className="text-center text-2xl font-bold tracking-wide text-emerald-700">
          {bukti.nomor}
        </p>
        <p className="mt-2 text-center text-sm text-red-600">
          Simpan nomor ini. Nomor dibutuhkan untuk mengecek status pendaftaran.
        </p>

        <table className="mt-6 w-full text-sm">
          <tbody>
            {baris.map(([label, nilai]) => (
              <tr key={label} className="border-b border-gray-100">
                <td className="py-2 pr-3 text-gray-500">{label}</td>
                <td className="py-2 font-medium">{nilai}</td>
              </tr>
            ))}
          </tbody>
        </table>

        <div className="no-print mt-6 flex flex-col gap-3">
          <button
            onClick={() => window.print()}
            className="rounded-xl bg-emerald-700 py-3 font-semibold text-white hover:bg-emerald-800"
          >
            Cetak / Simpan PDF
          </button>
          <Link href="/" className="text-center text-sm text-emerald-700 underline">
            Kembali ke Beranda
          </Link>
        </div>
      </div>
    </div>
  );
}
