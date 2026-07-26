import { describe, it, expect } from "vitest";
import { siswaSchema, ortuSchema, pendaftarSchema } from "@/lib/validation/pendaftar";

const siswaValid = {
  nama_lengkap: "Ahmad Fauzi",
  nik: "3214010101210001",
  tempat_lahir: "Purwakarta",
  tanggal_lahir: "2021-03-15",
  jenis_kelamin: "L",
  alamat: "Jl. Veteran No. 10, Purwakarta",
  asal_tk: "",
};

const ortuValid = {
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

describe("siswaSchema", () => {
  it("menerima data valid", () => {
    expect(siswaSchema.safeParse(siswaValid).success).toBe(true);
  });
  it("menolak NIK bukan 16 digit", () => {
    const r = siswaSchema.safeParse({ ...siswaValid, nik: "123" });
    expect(r.success).toBe(false);
  });
  it("menolak NIK berisi huruf", () => {
    expect(siswaSchema.safeParse({ ...siswaValid, nik: "32140101012100AB" }).success).toBe(false);
  });
  it("menolak tanggal lahir di masa depan", () => {
    expect(siswaSchema.safeParse({ ...siswaValid, tanggal_lahir: "2030-01-01" }).success).toBe(false);
  });
  it("menolak jenis kelamin selain L/P", () => {
    expect(siswaSchema.safeParse({ ...siswaValid, jenis_kelamin: "X" }).success).toBe(false);
  });
  it("menolak nama kosong", () => {
    expect(siswaSchema.safeParse({ ...siswaValid, nama_lengkap: "" }).success).toBe(false);
  });
});

describe("ortuSchema", () => {
  it("menerima data valid (wali kosong)", () => {
    expect(ortuSchema.safeParse(ortuValid).success).toBe(true);
  });
  it("menormalisasi berbagai format nomor WhatsApp menjadi 08...", () => {
    const kasus = [
      "081234567890",
      "+6281234567890",
      "6281234567890",
      "+62 812-3456-7890",
      "0812 3456 7890",
      "006281234567890",
    ];
    for (const no_whatsapp of kasus) {
      const r = ortuSchema.safeParse({ ...ortuValid, no_whatsapp });
      expect(r.success).toBe(true);
      if (r.success) {
        expect(r.data.no_whatsapp).toBe("081234567890");
      }
    }
  });
  it("menolak nomor WhatsApp tanpa awalan 0 atau 62", () => {
    expect(ortuSchema.safeParse({ ...ortuValid, no_whatsapp: "81234567890" }).success).toBe(false);
  });
  it("menolak nomor WhatsApp terlalu pendek", () => {
    expect(ortuSchema.safeParse({ ...ortuValid, no_whatsapp: "0812345" }).success).toBe(false);
  });
  it("menolak nomor WhatsApp terlalu panjang", () => {
    expect(ortuSchema.safeParse({ ...ortuValid, no_whatsapp: "08123456789012345" }).success).toBe(false);
  });
  it("menolak nomor WhatsApp berisi huruf", () => {
    expect(ortuSchema.safeParse({ ...ortuValid, no_whatsapp: "0812abc45678" }).success).toBe(false);
  });
  it("menolak nomor WhatsApp kosong", () => {
    expect(ortuSchema.safeParse({ ...ortuValid, no_whatsapp: "" }).success).toBe(false);
  });
});

describe("pendaftarSchema", () => {
  it("menerima gabungan data valid", () => {
    expect(pendaftarSchema.safeParse({ ...siswaValid, ...ortuValid }).success).toBe(true);
  });
});
