"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { siswaSchema, ortuSchema, petaError } from "@/lib/validation/pendaftar";
import { JENIS_DOKUMEN, LABEL_DOKUMEN, validasiDokumen, type JenisDokumen } from "@/lib/files";
import { submitPendaftaran } from "@/app/(publik)/daftar/actions";
import StepSiswa from "./StepSiswa";
import StepOrtu from "./StepOrtu";
import StepDokumen from "./StepDokumen";

const SISWA_KOSONG: Record<string, string> = {
  nama_lengkap: "", nik: "", tempat_lahir: "", tanggal_lahir: "",
  jenis_kelamin: "", alamat: "", asal_tk: "",
};
const ORTU_KOSONG: Record<string, string> = {
  nama_ayah: "", pekerjaan_ayah: "", pendidikan_ayah: "",
  nama_ibu: "", pekerjaan_ibu: "", pendidikan_ibu: "",
  nama_wali: "", pekerjaan_wali: "", no_whatsapp: "",
};
const JUDUL_STEP = ["Data Calon Siswa", "Data Orang Tua / Wali", "Upload Dokumen"];

export default function FormPendaftaran() {
  const router = useRouter();
  const [step, setStep] = useState(0);
  const [siswa, setSiswa] = useState(SISWA_KOSONG);
  const [ortu, setOrtu] = useState(ORTU_KOSONG);
  const [files, setFiles] = useState<Partial<Record<JenisDokumen, File>>>({});
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [serverError, setServerError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  function lanjut() {
    const schema = step === 0 ? siswaSchema : ortuSchema;
    const data = step === 0 ? siswa : ortu;
    const parsed = schema.safeParse(data);
    if (!parsed.success) {
      setErrors(petaError(parsed.error));
      return;
    }
    setErrors({});
    setStep(step + 1);
    window.scrollTo({ top: 0 });
  }

  function kembali() {
    setErrors({});
    setStep(step - 1);
    window.scrollTo({ top: 0 });
  }

  async function kirim() {
    const errFiles: Record<string, string> = {};
    for (const jenis of JENIS_DOKUMEN) {
      const f = files[jenis];
      if (!f) errFiles[jenis] = `${LABEL_DOKUMEN[jenis]} belum diunggah`;
      else {
        const e = validasiDokumen(f);
        if (e) errFiles[jenis] = e;
      }
    }
    if (Object.keys(errFiles).length > 0) {
      setErrors(errFiles);
      return;
    }

    setSubmitting(true);
    setServerError("");
    const fd = new FormData();
    for (const [k, v] of Object.entries({ ...siswa, ...ortu })) fd.set(k, v);
    for (const jenis of JENIS_DOKUMEN) fd.set(`dokumen_${jenis}`, files[jenis]!);

    const hasil = await submitPendaftaran(fd);
    if (hasil.ok) {
      sessionStorage.setItem(
        "spmb_bukti",
        JSON.stringify({ nomor: hasil.nomor_pendaftaran, siswa, ortu })
      );
      router.push("/daftar/sukses");
      return;
    }
    setSubmitting(false);
    setServerError(hasil.error);
    if (hasil.fieldErrors) {
      setErrors(hasil.fieldErrors);
      const fieldPertama = Object.keys(hasil.fieldErrors)[0];
      if (fieldPertama in SISWA_KOSONG) setStep(0);
      else if (fieldPertama in ORTU_KOSONG) setStep(1);
    }
  }

  return (
    <div className="py-6">
      {/* Indikator langkah */}
      <ol className="mb-6 flex items-center justify-center gap-2">
        {JUDUL_STEP.map((judul, i) => (
          <li key={judul} className="flex items-center gap-2">
            <span
              className={`flex h-8 w-8 items-center justify-center rounded-full text-sm font-bold ${
                i <= step ? "bg-emerald-700 text-white" : "bg-gray-200 text-gray-500"
              }`}
            >
              {i + 1}
            </span>
            {i < JUDUL_STEP.length - 1 && <span className="h-px w-6 bg-gray-300" />}
          </li>
        ))}
      </ol>
      <h2 className="mb-4 text-center text-lg font-bold text-emerald-900">
        {JUDUL_STEP[step]}
      </h2>

      <div className="rounded-2xl bg-white p-5 shadow-sm">
        {step === 0 && (
          <StepSiswa data={siswa} errors={errors} onChange={(n, v) => setSiswa((s) => ({ ...s, [n]: v }))} />
        )}
        {step === 1 && (
          <StepOrtu data={ortu} errors={errors} onChange={(n, v) => setOrtu((o) => ({ ...o, [n]: v }))} />
        )}
        {step === 2 && (
          <StepDokumen
            files={files}
            errors={errors}
            onChange={(jenis, file) => setFiles((f) => ({ ...f, [jenis]: file }))}
          />
        )}

        {serverError && (
          <p className="mt-4 rounded-lg bg-red-50 p-3 text-sm text-red-700">{serverError}</p>
        )}

        <div className="mt-6 flex gap-3">
          {step > 0 && (
            <button
              type="button"
              onClick={kembali}
              disabled={submitting}
              className="w-1/3 rounded-xl border border-gray-300 py-3 font-medium text-gray-700"
            >
              Kembali
            </button>
          )}
          {step < 2 ? (
            <button
              type="button"
              onClick={lanjut}
              className="flex-1 rounded-xl bg-emerald-700 py-3 font-semibold text-white hover:bg-emerald-800"
            >
              Lanjut
            </button>
          ) : (
            <button
              type="button"
              onClick={kirim}
              disabled={submitting}
              className="flex-1 rounded-xl bg-emerald-700 py-3 font-semibold text-white hover:bg-emerald-800 disabled:opacity-60"
            >
              {submitting ? "Mengirim..." : "Kirim Pendaftaran"}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
