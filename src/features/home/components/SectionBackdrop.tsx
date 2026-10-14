/**
 * The one decoration every landing section shares: dots fading in from the top, a soft green glow on
 * the left and an amber glow on the right. Sections alternate white and canvas around it.
 * The parent section must be `relative isolate overflow-hidden`.
 */
export default function SectionBackdrop() {
  return (
    <div aria-hidden="true" data-section-backdrop className="pointer-events-none absolute inset-0 -z-10">
      <div className="texture-dots absolute inset-x-0 top-0 h-64" />
      <div className="absolute -left-28 top-1/4 h-80 w-80 rounded-full bg-public-line/35 blur-3xl" />
      <div className="absolute -bottom-20 -right-24 h-80 w-80 rounded-full bg-amber-200/30 blur-3xl" />
    </div>
  );
}
