"use client";

import { JENIS_DOKUMEN, LABEL_DOKUMEN, validasiDokumen, type JenisDokumen } from "@/lib/files";
import { Field } from "@/components/ui";

type Props = {
  files: Partial<Record<JenisDokumen, File>>;
  errors: Record<string, string>;
  onChange: (jenis: JenisDokumen, file: File | undefined) => void;
};

export default function StepDokumen({ files, errors, onChange }: Props) {
  return (
    <div>
      <p className="mb-4 text-sm text-gray-600">
        Unggah foto/scan dokumen berikut. Format JPG, PNG, atau PDF, maksimal 2 MB per file.
        Dari HP, Anda bisa langsung memotret dokumen.
      </p>
      {JENIS_DOKUMEN.map((jenis) => {
        const file = files[jenis];
        const errValidasi = file ? validasiDokumen(file) : null;
        return (
          <Field key={jenis} label={LABEL_DOKUMEN[jenis]} error={errors[jenis] ?? errValidasi ?? undefined}>
            <input
              type="file"
              accept="image/jpeg,image/png,application/pdf"
              className="block w-full text-sm file:mr-3 file:rounded-lg file:border-0 file:bg-emerald-700 file:px-4 file:py-2.5 file:font-medium file:text-white"
              onChange={(e) => onChange(jenis, e.target.files?.[0])}
            />
            {file && !errValidasi && (
              <p className="mt-1 text-sm text-emerald-700">
                ✓ {file.name} ({(file.size / 1024).toFixed(0)} KB)
              </p>
            )}
          </Field>
        );
      })}
    </div>
  );
}
