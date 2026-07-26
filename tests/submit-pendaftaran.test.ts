import { describe, it, expect, vi, beforeEach } from "vitest";

// --- Fake klien Supabase yang bisa dikonfigurasi per test ---
type FakeOpts = {
  existingNik?: boolean;
  insertErrorCode?: string;
  uploadFailsAt?: number; // upload ke-N (1-based) gagal
};

const state: {
  opts: FakeOpts;
  deletedPendaftar: string[];
  removedPaths: string[];
  uploads: string[];
} = { opts: {}, deletedPendaftar: [], removedPaths: [], uploads: [] };

function fakeClient() {
  let uploadCount = 0;
  return {
    from(table: string) {
      return {
        select: () => ({
          eq: () => ({
            maybeSingle: async () => ({
              data: state.opts.existingNik ? { id: "dup" } : null,
              error: null,
            }),
          }),
        }),
        insert: (_row: unknown) => {
          if (table === "dokumen") {
            return Promise.resolve({ error: null });
          }
          return {
            select: () => ({
              single: async () =>
                state.opts.insertErrorCode
                  ? { data: null, error: { code: state.opts.insertErrorCode } }
                  : {
                      data: { id: "p1", nomor_pendaftaran: "SPMB-2728-0001" },
                      error: null,
                    },
            }),
          };
        },
        delete: () => ({
          eq: async (_c: string, v: string) => {
            state.deletedPendaftar.push(v);
            return { error: null };
          },
        }),
      };
    },
    storage: {
      from: () => ({
        upload: async (path: string) => {
          uploadCount++;
          if (state.opts.uploadFailsAt === uploadCount) {
            return { error: { message: "gagal" } };
          }
          state.uploads.push(path);
          return { error: null };
        },
        remove: async (paths: string[]) => {
          state.removedPaths.push(...paths);
          return { error: null };
        },
      }),
    },
  };
}

vi.mock("@/lib/supabase/admin", () => ({ createAdminClient: () => fakeClient() }));
vi.mock("server-only", () => ({}));

import { submitPendaftaran } from "@/app/daftar/actions";

function fileValid(nama: string) {
  return new File([new Uint8Array(1024)], nama, { type: "image/jpeg" });
}

function formValid(override: Record<string, string | File> = {}) {
  const fd = new FormData();
  const data: Record<string, string> = {
    nama_lengkap: "Ahmad Fauzi",
    nik: "3214010101210001",
    tempat_lahir: "Purwakarta",
    tanggal_lahir: "2021-03-15",
    jenis_kelamin: "L",
    alamat: "Jl. Veteran No. 10, Purwakarta",
    asal_tk: "TK Melati",
    nama_ayah: "Budi Santoso",
    pekerjaan_ayah: "Karyawan Swasta",
    pendidikan_ayah: "S1",
    nama_ibu: "Siti Aminah",
    pekerjaan_ibu: "Ibu Rumah Tangga",
    pendidikan_ibu: "SMA/Sederajat",
    nama_wali: "",
    pekerjaan_wali: "",
    no_whatsapp: "081234567890",
  };
  for (const [k, v] of Object.entries(data)) fd.set(k, v);
  fd.set("dokumen_kartu_keluarga", fileValid("kk.jpg"));
  fd.set("dokumen_akta_kelahiran", fileValid("akta.jpg"));
  fd.set("dokumen_pas_foto", fileValid("foto.jpg"));
  for (const [k, v] of Object.entries(override)) fd.set(k, v);
  return fd;
}

beforeEach(() => {
  state.opts = {};
  state.deletedPendaftar = [];
  state.removedPaths = [];
  state.uploads = [];
});

describe("submitPendaftaran", () => {
  it("sukses: mengembalikan nomor pendaftaran dan mengupload 3 dokumen", async () => {
    const r = await submitPendaftaran(formValid());
    expect(r).toEqual({ ok: true, nomor_pendaftaran: "SPMB-2728-0001" });
    expect(state.uploads).toHaveLength(3);
    expect(state.uploads[0]).toBe("p1/kartu_keluarga.jpg");
  });

  it("menolak data tidak valid dengan fieldErrors", async () => {
    const r = await submitPendaftaran(formValid({ nik: "123" }));
    expect(r.ok).toBe(false);
    if (!r.ok) expect(r.fieldErrors?.nik).toMatch(/16 digit/);
  });

  it("menolak NIK yang sudah terdaftar", async () => {
    state.opts.existingNik = true;
    const r = await submitPendaftaran(formValid());
    expect(r.ok).toBe(false);
    if (!r.ok) expect(r.error).toMatch(/sudah terdaftar/);
  });

  it("menolak jika ada dokumen yang hilang", async () => {
    const fd = formValid();
    fd.delete("dokumen_pas_foto");
    const r = await submitPendaftaran(fd);
    expect(r.ok).toBe(false);
    if (!r.ok) expect(r.error).toMatch(/Pas Foto/);
  });

  it("menolak dokumen dengan tipe salah", async () => {
    const salah = new File([new Uint8Array(10)], "kk.gif", { type: "image/gif" });
    const r = await submitPendaftaran(formValid({ dokumen_kartu_keluarga: salah }));
    expect(r.ok).toBe(false);
  });

  it("membersihkan data saat upload gagal (tidak ada data setengah jadi)", async () => {
    state.opts.uploadFailsAt = 2;
    const r = await submitPendaftaran(formValid());
    expect(r.ok).toBe(false);
    expect(state.deletedPendaftar).toContain("p1");
    expect(state.removedPaths).toContain("p1/kartu_keluarga.jpg");
  });

  it("menangani race NIK ganda dari constraint unik (kode 23505)", async () => {
    state.opts.insertErrorCode = "23505";
    const r = await submitPendaftaran(formValid());
    expect(r.ok).toBe(false);
    if (!r.ok) expect(r.error).toMatch(/sudah terdaftar/);
  });
});
