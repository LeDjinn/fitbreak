import Link from "next/link";
import { BrandLink } from "./brand";

const NAV = [
  { href: "/#how-it-works", label: "How it works" },
  { href: "/routines", label: "Browse routines" },
];

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-30 border-b border-ink/[0.06] bg-canvas/85 backdrop-blur-md supports-[backdrop-filter]:bg-canvas/70">
      <nav aria-label="Main" className="wrap flex h-16 items-center justify-between gap-4 sm:h-[4.5rem]">
        <BrandLink />
        <div className="flex items-center gap-1 sm:gap-6">
          <ul className="hidden items-center gap-1 md:flex">
            {NAV.map((item) => (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className="inline-flex min-h-11 items-center rounded-full px-4 text-sm font-semibold text-muted transition-colors hover:bg-ink/[0.04] hover:text-ink"
                >
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
          <Link
            href="/routines"
            className="inline-flex min-h-11 items-center rounded-full px-3 text-sm font-semibold text-muted hover:text-ink md:hidden"
          >
            Routines
          </Link>
          <span className="inline-flex items-center gap-2 rounded-full border border-mint-deep/15 max-[359px]:hidden bg-mint-soft px-3 py-2 text-[0.6875rem] font-bold uppercase tracking-[0.08em] text-mint-deep">
            <span className="size-1.5 rounded-full bg-leaf shadow-[0_0_0_3px_rgb(77_154_114/0.18)]" aria-hidden="true" />
            <span className="hidden min-[400px]:inline">Free, no account</span>
            <span className="min-[400px]:hidden">Free</span>
          </span>
        </div>
      </nav>
    </header>
  );
}
