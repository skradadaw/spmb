"use client";

import { useEffect } from "react";
import AdminIcon from "@/components/admin/AdminIcon";
import { AdminCard } from "@/components/admin/AdminUI";
import { adminPrimaryButtonCls } from "@/components/admin/styles";

export default function AdminError({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="admin-scope flex min-h-[60vh] items-center justify-center py-8">
      <AdminCard className="w-full max-w-lg p-6 text-center sm:p-8">
        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-amber-100 text-amber-700">
          <AdminIcon name="warning" className="h-6 w-6" />
        </div>
        <h1 className="admin-display mt-5 text-2xl font-bold tracking-[-0.015em] text-[#101820]">
          Tidak dapat memuat halaman
        </h1>
        <p className="mt-3 text-sm leading-6 text-[#667085]">
          Periksa koneksi internet Anda, lalu coba lagi. Jika masalah berlanjut, hubungi panitia SPMB.
        </p>
        <button type="button" onClick={() => reset()} className={`${adminPrimaryButtonCls} mt-6 w-full sm:w-auto`} autoFocus>
          Coba lagi
        </button>
      </AdminCard>
    </div>
  );
}
