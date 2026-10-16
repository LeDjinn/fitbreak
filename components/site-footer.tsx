import Link from "next/link";
import { BrandMark } from "./brand";

export function SiteFooter() {
  return (
    <footer className="mt-24 border-t border-ink/[0.07]">
      <div className="wrap grid gap-8 py-10 text-sm text-muted md:grid-cols-[1fr_auto] md:items-start">
        <div className="max-w-md space-y-3">
          <div className="flex items-center gap-2.5 text-ink">
            <BrandMark className="size-7" />
            <span className="font-display text-lg font-bold tracking-[-0.03em]">FitBreak</span>
            <span className="text-subtle">by BestFitTips</span>
          </div>
          <p className="leading-relaxed">
            Move gently and comfortably. Stop if you feel pain, dizziness, or unwell. This is general movement
            guidance, not medical advice.
          </p>
        </div>
        <nav aria-label="Footer">
          <ul className="flex flex-wrap gap-x-1 gap-y-1">
            {[
              ["/routines", "Routines"],
              ["/about", "About"],
              ["/privacy", "Privacy"],
            ].map(([href, label]) => (
              <li key={href}>
                <Link href={href} className="inline-flex min-h-11 items-center rounded-full px-3 font-semibold hover:text-ink">
                  {label}
                </Link>
              </li>
            ))}
          </ul>
          <p className="px-3 pt-2 text-xs text-subtle">© 2026 BestFitTips</p>
        </nav>
      </div>
    </footer>
  );
}
