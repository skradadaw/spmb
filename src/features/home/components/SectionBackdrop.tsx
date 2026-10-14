/**
 * The one decoration every landing section shares: dots fading in from the top, without coloured glows.
 * Sections alternate white and canvas around it. The parent section must be `relative isolate overflow-hidden`.
 */
export default function SectionBackdrop() {
  return (
    <div aria-hidden="true" data-section-backdrop className="pointer-events-none absolute inset-0 -z-10">
      <div className="texture-dots absolute inset-x-0 top-0 h-64" />
    </div>
  );
}
