import { ArrowRight } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { ExerciseArt } from "@/components/exercise-art";
import { getExercise } from "@/lib/exercises";
import { PRESETS } from "@/lib/presets";
import { generateRoutine } from "@/lib/routine-generator";
import { FOCUS_LABEL, LOCATION_LABEL, INTENSITY_LABEL } from "@/lib/routine-params";

export const metadata: Metadata = {
  title: "Browse routines",
  description: "Three ready-made movement breaks: a 5-minute desk break, a 2-minute seated reset, and a 10-minute home session. Free and guided.",
  alternates: { canonical: "/routines" },
};

export default function RoutinesPage() {
  return (
    <>
      <SiteHeader />
      <main id="main" className="wrap pt-12 sm:pt-16">
        <p className="mb-4 text-xs font-bold uppercase tracking-[0.2em] text-mint-deep">Ready-made breaks</p>
        <h1 className="font-display max-w-3xl text-[clamp(2.4rem,6vw,4.25rem)] leading-[1] font-semibold tracking-[-0.05em] text-balance">
          Three favourites, ready when you are.
        </h1>
        <p className="mt-5 max-w-xl text-lg leading-relaxed text-muted">
          Each one is a real, playable routine, put together for a common moment in the day. Want something different?{" "}
          <Link href="/#builder" className="font-semibold text-ink underline decoration-lime-deep decoration-2 underline-offset-4">
            Build your own
          </Link>
          .
        </p>

        <ul className="mt-12 grid gap-5">
          {PRESETS.map((preset) => {
            const routine = generateRoutine(preset.config);
            const first = routine.steps.slice(0, 4).map((s) => getExercise(s.exerciseId));
            return (
              <li key={preset.slug}>
                <Link
                  href={`/routines/${preset.slug}`}
                  className="group grid gap-6 rounded-[var(--radius-card)] border border-stroke bg-cream p-6 transition-[border-color,box-shadow] duration-200 hover:border-stroke-strong hover:shadow-[var(--shadow-card)] sm:p-8 md:grid-cols-[minmax(0,1fr)_auto] md:items-center"
                >
                  <div>
                    <div className="flex flex-wrap items-center gap-2 text-xs font-semibold text-mint-deep">
                      {[LOCATION_LABEL[preset.config.location], FOCUS_LABEL[preset.config.focus], INTENSITY_LABEL[preset.config.intensity], preset.config.seatedOnly ? "Seated only" : null]
                        .filter(Boolean)
                        .map((t) => (
                          <span key={t} className="rounded-full bg-mint-soft px-2.5 py-1">
                            {t}
                          </span>
                        ))}
                    </div>
                    <h2 className="font-display mt-4 flex items-baseline gap-3 text-[1.75rem] leading-tight font-semibold tracking-[-0.035em] sm:text-[2rem]">
                      <span className="tabular text-mint-deep">{preset.config.durationMinutes}:00</span>
                      {preset.title.replace(/^\d+-minute /, "")}
                    </h2>
                    <p className="mt-2 max-w-xl leading-relaxed text-muted">{preset.summary}</p>
                    <span className="mt-5 inline-flex items-center gap-1.5 font-semibold">
                      See the full routine <ArrowRight className="size-4 transition-transform group-hover:translate-x-1" aria-hidden="true" />
                    </span>
                  </div>
                  <div className="flex gap-2" aria-hidden="true">
                    {first.map((e, i) => (
                      <span key={`${e.id}-${i}`} className="grid size-16 place-items-center rounded-2xl bg-mint text-ink sm:size-20">
                        <ExerciseArt illustrationKey={e.illustrationKey} sizes="80px" fallbackClassName="size-[88%]" />
                      </span>
                    ))}
                  </div>
                </Link>
              </li>
            );
          })}
        </ul>
      </main>
      <SiteFooter />
    </>
  );
}
