/**
 * Wave edge at the bottom of a section, drawn in the colour of the section
 * below it (set through `className`'s text colour) so the two blend.
 */
export default function SectionWave({ className }: { className: string }) {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 1440 80"
      preserveAspectRatio="none"
      className={`absolute bottom-0 left-0 h-12 w-full sm:h-16 ${className}`}
    >
      <path
        d="M0 32L120 44C240 56 480 70 720 52C960 34 1200 12 1320 22L1440 32V80H0Z"
        fill="currentColor"
      />
    </svg>
  );
}
