"use client";

import { Field, inputCls } from "@/components/ui";

type Props = {
  data: Record<string, string>;
  errors: Record<string, string>;
  onChange: (name: string, value: string) => void;
};

export default function StepSiswa({ data, errors, onChange }: Props) {
  return (
    <div>
      <Field label="Nama Lengkap Calon Siswa" error={errors.nama_lengkap}>
        <input
          className={inputCls}
          value={data.nama_lengkap}
          onChange={(e) => onChange("nama_lengkap", e.target.value)}
          placeholder="Sesuai akta kelahiran"
        />
      </Field>
      <Field label="NIK (16 digit, lihat Kartu Keluarga)" error={errors.nik}>
        <input
          className={inputCls}
          inputMode="numeric"
          maxLength={16}
          value={data.nik}
          onChange={(e) => onChange("nik", e.target.value.replace(/\D/g, ""))}
        />
      </Field>
      <Field label="Tempat Lahir" error={errors.tempat_lahir}>
        <input
          className={inputCls}
          value={data.tempat_lahir}
          onChange={(e) => onChange("tempat_lahir", e.target.value)}
        />
      </Field>
      <Field label="Tanggal Lahir" error={errors.tanggal_lahir}>
        <input
          type="date"
          className={inputCls}
          value={data.tanggal_lahir}
          onChange={(e) => onChange("tanggal_lahir", e.target.value)}
        />
      </Field>
      <Field label="Jenis Kelamin" error={errors.jenis_kelamin}>
        <select
          className={inputCls}
          value={data.jenis_kelamin}
          onChange={(e) => onChange("jenis_kelamin", e.target.value)}
        >
          <option value="">-- Pilih --</option>
          <option value="L">Laki-laki</option>
          <option value="P">Perempuan</option>
        </select>
      </Field>
      <Field label="Alamat Lengkap" error={errors.alamat}>
        <textarea
          className={inputCls}
          rows={3}
          value={data.alamat}
          onChange={(e) => onChange("alamat", e.target.value)}
        />
      </Field>
      <Field label="Asal TK/RA (opsional)" error={errors.asal_tk}>
        <input
          className={inputCls}
          value={data.asal_tk}
          onChange={(e) => onChange("asal_tk", e.target.value)}
        />
      </Field>
    </div>
  );
}
