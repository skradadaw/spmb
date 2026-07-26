import { describe, it, expect, vi, beforeEach } from "vitest";

const state: { row: unknown } = { row: null };

vi.mock("@/lib/supabase/admin", () => ({
  createAdminClient: () => ({
    from: () => ({
      select: () => ({
        eq: () => ({
          eq: () => ({
            maybeSingle: async () => ({ data: state.row, error: null }),
          }),
        }),
      }),
    }),
  }),
}));
vi.mock("server-only", () => ({}));

import { cekStatus } from "@/app/(publik)/cek-status/actions";

beforeEach(() => {
  state.row = null;
});

describe("cekStatus", () => {
  it("mengembalikan status jika nomor + tanggal lahir cocok", async () => {
    state.row = {
      nama_lengkap: "Ahmad Fauzi",
      status_verifikasi: "terverifikasi",
      status_penerimaan: "diterima",
      catatan_admin: null,
    };
    const r = await cekStatus({ nomor: "SPMB-2728-0001", tanggal_lahir: "2021-03-15" });
    expect(r).toEqual({ ok: true, ...state.row });
  });

  it("gagal jika tidak ada yang cocok", async () => {
    const r = await cekStatus({ nomor: "SPMB-2728-9999", tanggal_lahir: "2021-03-15" });
    expect(r.ok).toBe(false);
    if (!r.ok) expect(r.error).toMatch(/tidak ditemukan/i);
  });

  it("menolak format nomor yang salah tanpa menyentuh database", async () => {
    const r = await cekStatus({ nomor: "ABC-123", tanggal_lahir: "2021-03-15" });
    expect(r.ok).toBe(false);
  });

  it("menolak tanggal lahir kosong", async () => {
    const r = await cekStatus({ nomor: "SPMB-2728-0001", tanggal_lahir: "" });
    expect(r.ok).toBe(false);
  });
});
