import Eyebrow from './Eyebrow';

type SectionHeadingProps = {
  id: string;
  eyebrow: string;
  title: string;
  description?: string;
  tone?: 'light' | 'dark';
};

export default function SectionHeading({
  id,
  eyebrow,
  title,
  description,
  tone = 'light',
}: SectionHeadingProps) {
  const dark = tone === 'dark';

  return (
    <div className="max-w-2xl">
      <Eyebrow tone={tone}>{eyebrow}</Eyebrow>
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
            dark ? 'text-public-mint/85' : 'text-slate-600'
          }`}
        >
          {description}
        </p>
      )}
    </div>
  );
}
