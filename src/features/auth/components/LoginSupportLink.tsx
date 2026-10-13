export function LoginSupportLink({ className = '' }: { className?: string }) {
  return (
    <a
      href="https://wa.me/6287723487776"
      target="_blank"
      rel="noopener noreferrer"
      className={`inline-flex items-center rounded-lg px-2 py-2 text-sm text-slate-500 transition-colors hover:text-public-deep focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-public-green ${className}`}
    >
      <span>
        Kendala masuk? <strong className="font-semibold text-public-green">Hubungi Support</strong>
      </span>
    </a>
  );
}
