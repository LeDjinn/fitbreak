import Link from "next/link";

/** Original mark: a timer sweep around a resting dot, tilted like a breath. */
export function BrandMark({ className = "size-9", tone = "light" }: { className?: string; tone?: "light" | "dark" }) {
  const bg = tone === "light" ? "var(--color-ink)" : "var(--color-lime)";
  const fg = tone === "light" ? "var(--color-lime)" : "var(--color-ink)";
  return (
    <svg viewBox="0 0 40 40" className={className} aria-hidden="true">
      <rect x="1" y="1" width="38" height="38" rx="12" fill={bg} transform="rotate(-6 20 20)" />
      <path d="M20 9.5a10.5 10.5 0 1 1-9.6 6.2" fill="none" stroke={fg} strokeWidth="3.4" strokeLinecap="round" />
      <circle cx="20" cy="20" r="3.6" fill={fg} />
    </svg>
  );
}

export function BrandLink({ tone = "light" }: { tone?: "light" | "dark" }) {
  return (
    <Link
      href="/"
      className={`group inline-flex min-h-11 items-center gap-2.5 rounded-xl ${tone === "dark" ? "text-on-panel" : "text-ink"}`}
      aria-label="BestFitTips FitBreak home"
    >
      <BrandMark tone={tone} className="size-9 transition-transform duration-300 group-hover:-rotate-6" />
      <span className="font-display text-[1.375rem] font-bold leading-none tracking-[-0.04em]">
        bestfit<span className={tone === "dark" ? "text-lime" : "text-leaf"}>tips</span>.
      </span>
    </Link>
  );
}
