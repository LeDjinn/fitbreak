import { SiteFooter } from "./site-footer";
import { SiteHeader } from "./site-header";

export function ProsePage({ eyebrow, title, children }: { eyebrow: string; title: string; children: React.ReactNode }) {
  return (
    <>
      <SiteHeader />
      <main id="main" className="wrap pt-12 sm:pt-16">
        <p className="mb-4 text-xs font-bold uppercase tracking-[0.2em] text-mint-deep">{eyebrow}</p>
        <h1 className="font-display max-w-3xl text-[clamp(2.4rem,6vw,4rem)] leading-[1] font-semibold tracking-[-0.05em] text-balance">{title}</h1>
        <div className="mt-10 max-w-2xl space-y-5 text-[1.0625rem] leading-relaxed text-muted [&_a]:font-semibold [&_a]:text-ink [&_a]:underline [&_a]:decoration-lime-deep [&_a]:decoration-2 [&_a]:underline-offset-4 [&_h2]:font-display [&_h2]:pt-6 [&_h2]:text-2xl [&_h2]:font-semibold [&_h2]:tracking-[-0.03em] [&_h2]:text-ink [&_strong]:text-ink [&_ul]:list-disc [&_ul]:space-y-2 [&_ul]:pl-5">
          {children}
        </div>
      </main>
      <SiteFooter />
    </>
  );
}
