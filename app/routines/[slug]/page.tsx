import { ArrowLeft, ArrowUpRight, Check } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { RoutineStepList } from "@/components/routine-step-list";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { TrackView } from "@/components/track-view";
import { getPreset, PRESETS } from "@/lib/presets";
import { generateRoutine } from "@/lib/routine-generator";
import { FOCUS_LABEL, INTENSITY_LABEL, LOCATION_LABEL, sessionHref } from "@/lib/routine-params";

export function generateStaticParams() {
  return PRESETS.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({ params }: PageProps<"/routines/[slug]">): Promise<Metadata> {
  const { slug } = await params;
  const preset = getPreset(slug);
  if (!preset) return {};
  return {
    title: preset.title,
    description: preset.metaDescription,
    alternates: { canonical: `/routines/${preset.slug}` },
  };
}

export default function PresetPage({ params }: PageProps<"/routines/[slug]">) {
  return (
    <>
      <SiteHeader />
      <Suspense fallback={<main id="main" className="wrap min-h-[70vh] pt-12" aria-busy="true" />}>
        <PresetContent params={params} />
      </Suspense>
      <SiteFooter />
    </>
  );
}

async function PresetContent({ params }: { params: PageProps<"/routines/[slug]">["params"] }) {
  const { slug } = await params;
  const preset = getPreset(slug);
  if (!preset) notFound();
  const routine = generateRoutine(preset.config);
  const href = sessionHref(preset.config, preset.slug);
  const facts = [
    ["Length", `${preset.config.durationMinutes} minutes, exactly`],
    ["Where", LOCATION_LABEL[preset.config.location]],
    ["Focus", FOCUS_LABEL[preset.config.focus]],
    ["Pace", INTENSITY_LABEL[preset.config.intensity]],
    ["Posture", preset.config.seatedOnly ? "Seated only" : "Seated and standing"],
  ];

  return (
    <>
      <TrackView name="preset_viewed" props={{ origin: `preset:${preset.slug}`, duration: preset.config.durationMinutes, location: preset.config.location, focus: preset.config.focus, intensity: preset.config.intensity }} />
      <main id="main" className="wrap pt-8 sm:pt-12">
        <Link href="/routines" className="inline-flex min-h-11 items-center gap-1.5 text-sm font-semibold text-muted hover:text-ink">
          <ArrowLeft className="size-4" aria-hidden="true" /> All routines
        </Link>

        <div className="mt-6 grid gap-8 lg:grid-cols-[minmax(0,1.15fr)_minmax(0,0.85fr)] lg:items-start lg:gap-12">
          <div>
            <p className="tabular font-display text-5xl font-semibold tracking-[-0.05em] text-mint-deep sm:text-6xl">
              {preset.config.durationMinutes}:00
            </p>
            <h1 className="font-display mt-3 text-[clamp(2.4rem,6vw,4rem)] leading-[1] font-semibold tracking-[-0.05em] text-balance">
              {preset.title}
            </h1>
            <p className="mt-5 max-w-xl text-lg leading-relaxed text-muted">{preset.summary}</p>
            <Link
              href={href}
              className="group mt-8 inline-flex min-h-[3.75rem] w-full items-center justify-between gap-6 rounded-2xl bg-ink px-6 text-[1.0625rem] font-semibold text-on-panel shadow-[0_14px_30px_-12px_rgb(21_53_50/0.6)] transition-[background-color,transform] hover:-translate-y-0.5 hover:bg-mint-deep sm:w-auto"
            >
              Start this break
              <span className="grid size-9 place-items-center rounded-xl bg-lime text-ink transition-transform group-hover:rotate-45">
                <ArrowUpRight className="size-5" aria-hidden="true" />
              </span>
            </Link>
          </div>

          <aside className="rounded-[var(--radius-card)] border border-stroke bg-cream p-6 sm:p-7" aria-label="Routine details">
            <dl className="divide-y divide-stroke">
              {facts.map(([k, v]) => (
                <div key={k} className="flex justify-between gap-4 py-3 text-sm first:pt-0 last:pb-0">
                  <dt className="text-muted">{k}</dt>
                  <dd className="text-right font-semibold">{v}</dd>
                </div>
              ))}
            </dl>
            <h2 className="mt-6 text-sm font-semibold">Good for</h2>
            <ul className="mt-2 space-y-1.5 text-sm text-muted">
              {preset.goodFor.map((g) => (
                <li key={g} className="flex gap-2">
                  <Check className="mt-0.5 size-4 shrink-0 text-leaf" aria-hidden="true" strokeWidth={3} />
                  {g}
                </li>
              ))}
            </ul>
          </aside>
        </div>

        <section aria-labelledby="plan-heading" className="pt-16">
          <h2 id="plan-heading" className="font-display text-3xl font-semibold tracking-[-0.04em]">
            The plan
          </h2>
          <p className="mt-2 max-w-2xl leading-relaxed text-muted">{preset.whatToExpect}</p>
          <div className="mt-8">
            <RoutineStepList routine={routine} />
          </div>
          <p className="mt-8 max-w-2xl text-sm leading-relaxed text-muted">
            Move gently and comfortably. Stop if you feel pain, dizziness, or unwell. This is general movement guidance, not medical advice.
          </p>
        </section>
      </main>
    </>
  );
}
