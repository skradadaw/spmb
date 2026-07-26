import { describe, it, expect } from "vitest";
import { validasiDokumen, MAX_FILE_SIZE, JENIS_DOKUMEN, ALLOWED_TYPES } from "@/lib/files";

describe("validasiDokumen", () => {
  it("menerima JPG di bawah 2 MB", () => {
    expect(validasiDokumen({ type: "image/jpeg", size: 500_000 })).toBeNull();
  });
  it("menerima PNG dan PDF", () => {
    expect(validasiDokumen({ type: "image/png", size: 1000 })).toBeNull();
    expect(validasiDokumen({ type: "application/pdf", size: 1000 })).toBeNull();
  });
  it("menolak tipe lain", () => {
    expect(validasiDokumen({ type: "image/webp", size: 1000 })).toMatch(/JPG, PNG, atau PDF/);
  });
  it("menolak file lebih dari 2 MB", () => {
    expect(validasiDokumen({ type: "image/jpeg", size: MAX_FILE_SIZE + 1 })).toMatch(/2 MB/);
  });
  it("menolak file kosong", () => {
    expect(validasiDokumen({ type: "image/jpeg", size: 0 })).not.toBeNull();
  });
});

describe("konstanta", () => {
  it("tiga jenis dokumen", () => {
    expect(JENIS_DOKUMEN).toEqual(["kartu_keluarga", "akta_kelahiran", "pas_foto"]);
  });
  it("peta mime ke ekstensi", () => {
    expect(ALLOWED_TYPES["image/jpeg"]).toBe("jpg");
    expect(ALLOWED_TYPES["application/pdf"]).toBe("pdf");
  });
});
