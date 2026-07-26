"use client";

import { Field, inputCls } from "@/components/ui";

const OPSI_PENDIDIKAN = ["SD/Sederajat", "SMP/Sederajat", "SMA/Sederajat", "Diploma", "S1", "S2/S3"];

type Props = {
  data: Record<string, string>;
  errors: Record<string, string>;
  onChange: (name: string, value: string) => void;
};

function PilihPendidikan({
  value,
  onChange,
}: {
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <select className={inputCls} value={value} onChange={(e) => onChange(e.target.value)}>
      <option value="">-- Pilih --</option>
      {OPSI_PENDIDIKAN.map((p) => (
        <option key={p} value={p}>
          {p}
        </option>
      ))}
    </select>
  );
}

export default function StepOrtu({ data, errors, onChange }: Props) {
  return (
    <div>
      <h3 className="mb-3 font-semibold text-emerald-900">Data Ayah</h3>
      <Field label="Nama Ayah" error={errors.nama_ayah}>
        <input className={inputCls} value={data.nama_ayah} onChange={(e) => onChange("nama_ayah", e.target.value)} />
      </Field>
      <Field label="Pekerjaan Ayah" error={errors.pekerjaan_ayah}>
        <input className={inputCls} value={data.pekerjaan_ayah} onChange={(e) => onChange("pekerjaan_ayah", e.target.value)} />
      </Field>
      <Field label="Pendidikan Ayah" error={errors.pendidikan_ayah}>
        <PilihPendidikan value={data.pendidikan_ayah} onChange={(v) => onChange("pendidikan_ayah", v)} />
      </Field>

      <h3 className="mb-3 mt-6 font-semibold text-emerald-900">Data Ibu</h3>
      <Field label="Nama Ibu" error={errors.nama_ibu}>
        <input className={inputCls} value={data.nama_ibu} onChange={(e) => onChange("nama_ibu", e.target.value)} />
      </Field>
      <Field label="Pekerjaan Ibu" error={errors.pekerjaan_ibu}>
        <input className={inputCls} value={data.pekerjaan_ibu} onChange={(e) => onChange("pekerjaan_ibu", e.target.value)} />
      </Field>
      <Field label="Pendidikan Ibu" error={errors.pendidikan_ibu}>
        <PilihPendidikan value={data.pendidikan_ibu} onChange={(v) => onChange("pendidikan_ibu", v)} />
      </Field>

      <h3 className="mb-3 mt-6 font-semibold text-emerald-900">Wali (opsional, isi jika pengasuh utama bukan orang tua)</h3>
      <Field label="Nama Wali" error={errors.nama_wali}>
        <input className={inputCls} value={data.nama_wali} onChange={(e) => onChange("nama_wali", e.target.value)} />
      </Field>
      <Field label="Pekerjaan Wali" error={errors.pekerjaan_wali}>
        <input className={inputCls} value={data.pekerjaan_wali} onChange={(e) => onChange("pekerjaan_wali", e.target.value)} />
      </Field>

      <h3 className="mb-3 mt-6 font-semibold text-emerald-900">Kontak</h3>
      <Field label="Nomor WhatsApp Aktif" error={errors.no_whatsapp}>
        <input
          className={inputCls}
          inputMode="numeric"
          placeholder="081234567890"
          value={data.no_whatsapp}
          onChange={(e) => onChange("no_whatsapp", e.target.value.replace(/\D/g, ""))}
        />
      </Field>
    </div>
  );
}
