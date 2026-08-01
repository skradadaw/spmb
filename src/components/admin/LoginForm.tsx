"use client";

import { useActionState } from "react";
import { login } from "@/app/admin/login/actions";
import { AdminFeedback, AdminField } from "./AdminUI";
import { adminInputCls, adminPrimaryButtonCls } from "./styles";

export default function LoginForm({ notice }: { notice?: string }) {
  const [state, formAction, isPending] = useActionState(login, null);

  return (
    <form action={formAction} className="admin-login-form space-y-5">
      {notice && <AdminFeedback ok>{notice}</AdminFeedback>}
      {state?.error && <AdminFeedback ok={false}>{state.error}</AdminFeedback>}

      <AdminField id="admin-email" label="Alamat Email Admin">
        <input
          id="admin-email"
          type="email"
          name="email"
          required
          autoComplete="email"
          className={adminInputCls}
          placeholder="admin@sdplus3almuhajirin.sch.id"
        />
      </AdminField>

      <AdminField id="admin-password" label="Kata Sandi">
        <input
          id="admin-password"
          type="password"
          name="password"
          required
          autoComplete="current-password"
          className={adminInputCls}
          placeholder="Masukkan kata sandi"
        />
      </AdminField>

      <button disabled={isPending} className={`${adminPrimaryButtonCls} w-full`}>
        {isPending ? "Memeriksa akun…" : "Masuk ke Dasbor"}
      </button>
    </form>
  );
}
