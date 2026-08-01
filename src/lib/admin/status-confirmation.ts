export function needsStatusConfirmation(previous: string, next: string): boolean {
  return previous !== "tidak_diterima" && next === "tidak_diterima";
}
