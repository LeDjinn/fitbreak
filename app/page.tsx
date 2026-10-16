import { ArrowRight, Clock3, Package, Play, Plus } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { RoutineBuilder } from "@/components/routine-builder";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { PRESETS } from "@/lib/presets";

export const metadata: Metadata = {
  alternates: { canonical: "/" },
};

const BENEFITS = [
  { icon: Package, title: "No equipment", body: "Your chair, your desk, maybe a wall. That's the whole kit." },
  { icon: Clock3, title: "Fits your day", body: "Two, five or ten minutes, timed exactly. Ends when it says it will." },
  { icon: Play, title: "Just press play", body: "No account, no streaks, no plan to manage. Pick, start, move." },
];

const STEPS = [
  { n: "01", kicker: "Choose", title: "Tell it what fits.", body: "Pick a time, a place, a focus and a pace. The plan on the right changes as you do." },
  { n: "02", kicker: "Move", title: "Follow along.", body: "One move at a time, with a clear timer, simple steps and a short pause between moves." },
  { n: "03", kicker: "Come back", title: "Repeat tomorrow.", body: "Your choices stay in this browser, so the next break is one click away." },
];

const FAQ = [
  {
    q: "Do I need any equipment?",
    a: "No. Desk breaks use your chair and desk. Small-room and home breaks may use a sturdy chair or a clear wall for support, and the plan tells you before you start. Nothing involves lying on the floor.",
  },
  {
    q: "Is it really exactly 2, 5 or 10 minutes?",
    a: "Yes. A 5-minute break is five 50-second moves, each followed by a 10-second pause to reset: 300 seconds in total. A 2-minute break is four 25-second moves with 5-second pauses. The timer runs on your device's clock, so it stays accurate even if you switch tabs.",
  },
  {
    q: "What happens if I switch tabs or my screen locks?",
    a: "A running break keeps time while you're away, the way a kitchen timer would. When you come back you'll see where you are, and a note tells you how long you were gone. Pause first if you need to step away.",
  },
  {
    q: "What does “Stay seated” do?",
    a: "It removes every standing move, so every move happens in your chair. If there aren't enough moves for your focus, it adds gentle full-body ones and never a standing one.",
  },
  {
    q: "Can these movements fix neck or back pain?",
    a: "FitBreak is general movement guidance for healthy adults. It isn't treatment for any condition. Move within a comfortable range and stop if anything hurts or you feel dizzy. If you have an injury, a health condition or ongoing pain, ask a doctor or physiotherapist what's right for you.",
  },
  {
    q: "Do you collect my data?",
    a: "No account, no email, no health questions, and no tracking cookies. Your last choices are saved in your own browser so they're ready next time, and you can reset them any time. We count visits anonymously and in aggregate. The privacy page has the details.",
  },
];

export default function Home() {
  return (
    <>
      <SiteHeader />
      <main id="main">
        <div className="wrap">
          <section className="grid gap-5 pt-9 pb-7 sm:pt-12 lg:grid-cols-[minmax(0,1fr)_22rem] lg:items-end lg:gap-12 lg:pt-12 lg:pb-8">
            <div>
              <p className="mb-4 flex items-center gap-3 text-xs font-bold uppercase tracking-[0.2em] text-mint-deep">
                <span className="h-0.5 w-6 rounded-full bg-leaf" aria-hidden="true" />
                Your daily reset
              </p>
              <h1 className="font-display text-[clamp(2.9rem,7.4vw,4.75rem)] leading-[0.98] font-semibold tracking-[-0.055em] text-balance">
                Feel better in{" "}
                <span className="relative whitespace-nowrap text-mint-deep">
                  five minutes.
                  <svg className="absolute -bottom-2 left-0 h-3 w-full text-lime-deep sm:h-3.5" viewBox="0 0 300 16" preserveAspectRatio="none" aria-hidden="true">
                    <path d="M3 11 C 70 3, 150 3, 297 9" fill="none" stroke="currentColor" strokeWidth="6" strokeLinecap="round" />
                  </svg>
                </span>
              </h1>
            </div>
            <p className="max-w-xl text-[1.0625rem] leading-relaxed text-muted sm:text-lg lg:pb-1">
              A guided movement break designed around your day. Choose your time, press play, and get moving.
            </p>
          </section>

          <RoutineBuilder />

          <section aria-label="Why FitBreak" className="grid gap-3 pt-6 sm:grid-cols-3 sm:gap-4">
            {BENEFITS.map(({ icon: Icon, title, body }) => (
              <article key={title} className="flex gap-4 rounded-3xl border border-stroke/80 bg-mint-soft/50 p-5">
                <span className="grid size-11 shrink-0 place-items-center rounded-2xl bg-paper text-mint-deep shadow-[0_1px_0_rgb(21_53_50/0.05)]" aria-hidden="true">
                  <Icon className="size-5" strokeWidth={2} />
                </span>
                <div>
                  <h2 className="font-semibold tracking-[-0.01em]">{title}</h2>
                  <p className="mt-1 text-sm leading-relaxed text-muted">{body}</p>
                </div>
              </article>
            ))}
          </section>

          <section id="how-it-works" aria-labelledby="how-heading" className="pt-24 sm:pt-28">
            <div className="flex flex-col justify-between gap-4 md:flex-row md:items-end">
              <h2 id="how-heading" className="font-display text-[clamp(2.1rem,4.4vw,3.25rem)] leading-[1.05] font-semibold tracking-[-0.045em]">
                Small break.
                <br />
                Fresh start.
              </h2>
              <p className="max-w-sm leading-relaxed text-muted">
                Not another wellness project to manage. Just a calm few minutes between the things you already do.
              </p>
            </div>
            <ol className="mt-10 grid gap-8 md:grid-cols-3 md:gap-6">
              {STEPS.map((s) => (
                <li key={s.n} className="border-t border-stroke-strong pt-5">
                  <p className="tabular text-xs font-bold tracking-[0.14em] text-leaf uppercase">
                    {s.n} / {s.kicker}
                  </p>
                  <h3 className="font-display mt-4 text-[1.375rem] font-semibold tracking-[-0.03em]">{s.title}</h3>
                  <p className="mt-2 max-w-xs leading-relaxed text-muted">{s.body}</p>
                </li>
              ))}
            </ol>
          </section>

          <section aria-labelledby="presets-heading" className="pt-24 sm:pt-28">
            <div className="flex flex-wrap items-end justify-between gap-4">
              <h2 id="presets-heading" className="font-display text-[clamp(1.75rem,3.4vw,2.5rem)] leading-tight font-semibold tracking-[-0.04em]">
                Or start from a favourite.
              </h2>
              <Link href="/routines" className="inline-flex min-h-11 items-center gap-1.5 font-semibold text-mint-deep hover:text-ink">
                All routines <ArrowRight className="size-4" aria-hidden="true" />
              </Link>
            </div>
            <ul className="mt-8 grid gap-4 md:grid-cols-3">
              {PRESETS.map((p) => (
                <li key={p.slug}>
                  <Link
                    href={`/routines/${p.slug}`}
                    className="group flex h-full flex-col rounded-3xl border border-stroke bg-cream p-6 transition-[border-color,transform,box-shadow] duration-200 hover:-translate-y-0.5 hover:border-stroke-strong hover:shadow-[var(--shadow-card)]"
                  >
                    <span className="tabular font-display text-4xl font-semibold tracking-[-0.05em] text-mint-deep">
                      {p.config.durationMinutes}:00
                    </span>
                    <span className="font-display mt-4 text-xl font-semibold tracking-[-0.03em]">{p.title}</span>
                    <span className="mt-2 flex-1 text-sm leading-relaxed text-muted">{p.summary}</span>
                    <span className="mt-5 inline-flex items-center gap-1.5 text-sm font-semibold text-ink">
                      See the routine <ArrowRight className="size-4 transition-transform group-hover:translate-x-1" aria-hidden="true" />
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          </section>

          <section aria-labelledby="faq-heading" className="grid gap-10 pt-24 sm:pt-28 lg:grid-cols-[0.8fr_1.2fr]">
            <div>
              <h2 id="faq-heading" className="font-display text-[clamp(1.75rem,3.4vw,2.5rem)] leading-tight font-semibold tracking-[-0.04em]">
                Questions, answered.
              </h2>
              <p className="mt-3 max-w-sm leading-relaxed text-muted">
                Short, honest answers. If something isn&apos;t covered, the{" "}
                <Link href="/about" className="font-semibold text-ink underline decoration-lime-deep decoration-2 underline-offset-4">
                  about page
                </Link>{" "}
                has more.
              </p>
            </div>
            <div className="divide-y divide-stroke border-y border-stroke">
              {FAQ.map((item) => (
                <details key={item.q} className="group">
                  <summary className="flex min-h-16 items-center justify-between gap-6 py-4 text-left font-semibold tracking-[-0.01em]">
                    {item.q}
                    <Plus className="size-5 shrink-0 text-leaf transition-transform duration-200 group-open:rotate-45" aria-hidden="true" />
                  </summary>
                  <p className="max-w-2xl pb-6 leading-relaxed text-muted">{item.a}</p>
                </details>
              ))}
            </div>
          </section>
        </div>
      </main>
      <SiteFooter />
    </>
  );
}
