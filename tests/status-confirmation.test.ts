import { describe, expect, it } from "vitest";
import { needsStatusConfirmation } from "@/lib/admin/status-confirmation";

describe("needsStatusConfirmation", () => {
  it("requires confirmation only when changing to tidak_diterima", () => {
    expect(needsStatusConfirmation("menunggu", "tidak_diterima")).toBe(true);
    expect(needsStatusConfirmation("diterima", "tidak_diterima")).toBe(true);
    expect(needsStatusConfirmation("tidak_diterima", "tidak_diterima")).toBe(false);
    expect(needsStatusConfirmation("menunggu", "diterima")).toBe(false);
  });
});
