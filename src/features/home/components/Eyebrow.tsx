export default function Eyebrow({
  tone = 'light',
  children,
}: {
  tone?: 'light' | 'dark';
  children: React.ReactNode;
}) {
  return (
    <p
      className={`inline-flex items-center gap-2 text-xs font-bold uppercase tracking-[0.16em] ${
        tone === 'dark' ? 'text-amber-300' : 'text-public-green'
      }`}
    >
      <span aria-hidden="true" className="h-1 w-6 rounded-full bg-amber-400" />
      {children}
    </p>
  );
}
