type SectionHeadingProps = {
  id: string;
  eyebrow: string;
  title: string;
  description?: string;
  tone?: 'light' | 'dark';
  align?: 'left' | 'center';
  children?: React.ReactNode;
};

export default function SectionHeading({
  id,
  eyebrow,
  title,
  description,
  tone = 'light',
  align = 'left',
  children,
}: SectionHeadingProps) {
  const dark = tone === 'dark';

  return (
    <div className={align === 'center' ? 'mx-auto max-w-2xl text-center' : 'max-w-2xl'}>
      <p
        className={`inline-flex items-center gap-2 text-xs font-bold uppercase tracking-[0.16em] ${
          dark ? 'text-amber-300' : 'text-public-green'
        }`}
      >
        <span aria-hidden="true" className="h-1 w-6 rounded-full bg-amber-400" />
        {eyebrow}
      </p>
      <h2
        id={id}
        className={`mt-3 text-balance text-3xl font-black tracking-[-0.02em] sm:text-4xl ${
          dark ? 'text-white' : 'text-slate-950'
        }`}
      >
        {title}
      </h2>
      {description && (
        <p
          className={`mt-4 max-w-[65ch] text-base leading-7 ${
            align === 'center' ? 'mx-auto' : ''
          } ${dark ? 'text-emerald-50/85' : 'text-slate-600'}`}
        >
          {description}
        </p>
      )}
      {children}
    </div>
  );
}
