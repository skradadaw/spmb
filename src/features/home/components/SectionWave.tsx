/**
 * Wave edge in the hero's style. Drawn in the colour of the neighbouring
 * section (set through `className`'s text colour) so the two blend.
 */
export default function SectionWave({
  edge,
  className,
}: {
  edge: 'top' | 'bottom';
  className: string;
}) {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 1440 80"
      preserveAspectRatio="none"
      className={`absolute left-0 h-12 w-full sm:h-16 ${
        edge === 'top' ? 'top-0 rotate-180' : 'bottom-0'
      } ${className}`}
    >
      <path
        d="M0 32L120 44C240 56 480 70 720 52C960 34 1200 12 1320 22L1440 32V80H0Z"
        fill="currentColor"
      />
    </svg>
  );
}
