"use client";

import { ArrowUpRight, Flame, Leaf, Activity, Footprints, Sparkles, Check, RotateCcw, Zap } from "lucide-react";
import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";
import { track, type AnalyticsProps } from "@/lib/analytics";
import { clearPreferences, loadPreferences, savePreferences } from "@/lib/preferences";
import { generateRoutine } from "@/lib/routine-generator";
import { DEFAULT_CONFIG, FOCUS_LABEL, LOCATION_LABEL, sessionHref } from "@/lib/routine-params";
import type { DurationMinutes, Focus, Intensity, Location, RoutineConfig } from "@/lib/types";
import { RoutinePreview } from "./routine-preview";
import { SegmentedField, ToggleRow } from "./segmented-field";

const sameChoices = (a: RoutineConfig, b: RoutineConfig) =>
  a.durationMinutes === b.durationMinutes &&
  a.location === b.location &&
  a.focus === b.focus &&
  a.intensity === b.intensity &&
  a.seatedOnly === b.seatedOnly;

export function RoutineBuilder() {
  const [config, setConfig] = useState<RoutineConfig>(DEFAULT_CONFIG);
  const [restored, setRestored] = useState(false);
  const [liveMessage, setLiveMessage] = useState("");
  const [showSticky, setShowSticky] = useState(false);
  const ctaRef = useRef<HTMLAnchorElement>(null);
  const sectionRef = useRef<HTMLElement>(null);
  const hydrated = useRef(false);

  const routine = useMemo(() => generateRoutine(config), [config]);
  const href = sessionHref(config);

  // Restore saved preferences once, after hydration (localStorage is client-only).
  useEffect(() => {
    const saved = loadPreferences();
    hydrated.current = true;
    track("landing_view", { origin: "home" });
    if (saved) {
      // eslint-disable-next-line react-hooks/set-state-in-effect -- syncing from localStorage, an external store
      setConfig(saved);
      setRestored(!sameChoices(saved, DEFAULT_CONFIG));
    }
  }, []);

  useEffect(() => {
    if (!hydrated.current) return;
    savePreferences(config);
    track("routine_preview_generated", {
      duration: config.durationMinutes,
      location: config.location,
      focus: config.focus,
      intensity: config.intensity,
      seatedOnly: config.seatedOnly,
      origin: "builder",
    });
  }, [config]);

  // Mobile: show a sticky Start bar once the main button scrolls away while the builder is on screen.
  useEffect(() => {
    const cta = ctaRef.current;
    const section = sectionRef.current;
    if (!cta || !section || typeof IntersectionObserver === "undefined") return;
    let ctaVisible = true;
    let sectionVisible = false;
    const update = () => setShowSticky(!ctaVisible && sectionVisible);
    const ctaObserver = new IntersectionObserver(([entry]) => {
      ctaVisible = entry.isIntersecting;
      update();
    });
    const sectionObserver = new IntersectionObserver(([entry]) => {
      sectionVisible = entry.isIntersecting;
      update();
    }, { rootMargin: "0px 0px -40% 0px" });
    ctaObserver.observe(cta);
    sectionObserver.observe(section);
    return () => {
      ctaObserver.disconnect();
      sectionObserver.disconnect();
    };
  }, []);

  function update<K extends keyof RoutineConfig>(key: K, value: RoutineConfig[K], field: AnalyticsProps["field"]) {
    setConfig((prev) => {
      if (prev[key] === value) return prev;
      return { ...prev, [key]: value, variation: 0 };
    });
    setRestored(false);
    track("routine_config_changed", { field, origin: "builder" });
    setLiveMessage("Plan updated.");
  }

  function shuffle() {
    setConfig((prev) => ({ ...prev, variation: (prev.variation + 1) % 10000 }));
    track("routine_config_changed", { field: "shuffle", origin: "builder" });
    setLiveMessage("Plan shuffled. New movements below.");
  }

  function reset() {
    setConfig(clearPreferences());
    setRestored(false);
    track("routine_config_changed", { field: "reset", origin: "builder" });
    setLiveMessage("Choices reset to the defaults.");
  }

  const isDefault = sameChoices(config, DEFAULT_CONFIG) && config.variation === 0;

  return (
    <section
      ref={sectionRef}
      id="builder"
      aria-label="Build your movement break"
      className="grid items-stretch gap-4 lg:grid-cols-[minmax(0,1.1fr)_minmax(0,0.9fr)] lg:gap-5"
    >
      <div className="rounded-[var(--radius-card)] border border-stroke bg-cream p-5 shadow-[var(--shadow-card)] sm:p-8">
        <div className="mb-6 flex flex-wrap items-start justify-between gap-3">
          <div>
            <h2 className="font-display text-[1.75rem] leading-tight font-semibold tracking-[-0.035em]">Make it yours.</h2>
            <p className="mt-1 text-sm text-muted">Four quick choices. Your plan updates as you go.</p>
          </div>
          {restored ? (
            <p className="inline-flex items-center gap-1.5 rounded-full bg-lime/60 px-3 py-1.5 text-xs font-semibold text-ink">
              <Check className="size-3.5" aria-hidden="true" /> Welcome back, your last choices are kept
            </p>
          ) : (
            <p className="inline-flex items-center gap-1.5 rounded-full bg-mint-soft px-3 py-1.5 text-xs font-semibold text-mint-deep">
              <Sparkles className="size-3.5" aria-hidden="true" /> Ready in seconds
            </p>
          )}
        </div>

        <form
          className="space-y-6"
          onSubmit={(e) => {
            e.preventDefault();
            ctaRef.current?.click();
          }}
        >
          <SegmentedField<DurationMinutes>
            number="01"
            legend="How much time do you have?"
            name="duration"
            value={config.durationMinutes}
            onChange={(v) => update("durationMinutes", v, "duration")}
            options={[
              { value: 2, label: "2 min", hint: "4 moves" },
              { value: 5, label: "5 min", hint: "5 moves" },
              { value: 10, label: "10 min", hint: "10 moves" },
            ]}
          />
          <SegmentedField<Location>
            number="02"
            legend="Where are you moving?"
            name="location"
            value={config.location}
            onChange={(v) => update("location", v, "location")}
            options={[
              { value: "desk", label: LOCATION_LABEL.desk },
              { value: "small-room", label: LOCATION_LABEL["small-room"] },
              { value: "home", label: LOCATION_LABEL.home },
            ]}
            note={
              config.location === "desk"
                ? "Everything fits beside a desk and chair. Nothing on the floor."
                : config.location === "small-room"
                  ? "A step or two of space. Some moves may use a wall or chair."
                  : "A little room to step and march. Still nothing on the floor."
            }
          />
          <SegmentedField<Focus>
            number="03"
            legend="What needs a reset?"
            name="focus"
            columns={2}
            value={config.focus}
            onChange={(v) => update("focus", v, "focus")}
            options={[
              { value: "full", label: FOCUS_LABEL.full, icon: Sparkles },
              { value: "neck-shoulders", label: FOCUS_LABEL["neck-shoulders"], icon: Activity },
              { value: "lower-body", label: FOCUS_LABEL["lower-body"], icon: Footprints },
              { value: "energy", label: FOCUS_LABEL.energy, icon: Zap },
            ]}
          />
          <SegmentedField<Intensity>
            number="04"
            legend="Set the pace"
            name="intensity"
            columns={2}
            value={config.intensity}
            onChange={(v) => update("intensity", v, "intensity")}
            options={[
              { value: "gentle", label: "Gentle", hint: "Slow and easy", icon: Leaf },
              { value: "energizing", label: "Energizing", hint: "A little livelier", icon: Flame },
            ]}
          />

          <div className="border-t border-stroke pt-6">
            <ToggleRow
              id="seated-only"
              label="Stay seated throughout"
              description={
                config.seatedOnly
                  ? config.location === "desk"
                    ? "Every move happens in your chair."
                    : "Every move happens in a chair, so have a sturdy one nearby."
                  : "Turn on for a break with zero standing moves."
              }
              checked={config.seatedOnly}
              onChange={(v) => update("seatedOnly", v, "seated")}
            />
          </div>

          <div>
            <Link
              ref={ctaRef}
              href={href}
              className="group flex min-h-[3.75rem] w-full items-center justify-between rounded-2xl bg-ink px-6 text-[1.0625rem] font-semibold text-on-panel shadow-[0_14px_30px_-12px_rgb(21_53_50/0.6)] transition-[background-color,transform,box-shadow] duration-200 hover:-translate-y-0.5 hover:bg-mint-deep active:translate-y-0"
            >
              <span>Start my break</span>
              <span className="flex items-center gap-3">
                <span className="tabular text-sm font-medium text-on-panel-muted">{config.durationMinutes}:00</span>
                <span className="grid size-9 place-items-center rounded-xl bg-lime text-ink transition-transform duration-200 group-hover:rotate-45">
                  <ArrowUpRight className="size-5" aria-hidden="true" />
                </span>
              </span>
            </Link>
            <div className="mt-4 flex flex-wrap items-center justify-center gap-x-5 gap-y-2 text-xs font-medium text-subtle">
              {["No equipment", "No signup", "Just movement"].map((t) => (
                <span key={t} className="inline-flex items-center gap-1.5">
                  <Check className="size-3.5 text-leaf" aria-hidden="true" strokeWidth={3} />
                  {t}
                </span>
              ))}
              {!isDefault && (
                <button
                  type="button"
                  onClick={reset}
                  className="inline-flex min-h-11 items-center gap-1.5 rounded-full px-2 font-semibold text-muted underline-offset-4 hover:text-ink hover:underline"
                >
                  <RotateCcw className="size-3.5" aria-hidden="true" />
                  Reset choices
                </button>
              )}
            </div>
          </div>
        </form>
      </div>

      <RoutinePreview routine={routine} onShuffle={shuffle} liveMessage={liveMessage} />

      {/* Sticky start bar: full-width on mobile, a floating pill on desktop. Shown only while the main button is off-screen. */}
      <div
        className={`fixed inset-x-0 bottom-0 z-40 border-t border-ink/10 bg-canvas/95 px-4 pt-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] backdrop-blur-md transition-[transform,opacity] duration-300 lg:inset-x-auto lg:bottom-6 lg:left-1/2 lg:-translate-x-1/2 lg:rounded-[1.375rem] lg:border lg:border-white/10 lg:bg-ink lg:p-1.5 lg:shadow-[var(--shadow-panel)] ${showSticky ? "translate-y-0 opacity-100" : "pointer-events-none translate-y-full opacity-0 lg:translate-y-[calc(100%+2rem)]"}`}
        aria-hidden={!showSticky}
        data-testid="sticky-start"
      >
        <Link
          href={href}
          tabIndex={showSticky ? 0 : -1}
          className="flex min-h-14 items-center justify-between gap-8 rounded-2xl bg-ink px-5 font-semibold text-on-panel lg:min-h-12 lg:pr-1.5 lg:pl-5"
        >
          <span>Start my break</span>
          <span className="flex items-center gap-3 text-sm text-on-panel-muted">
            {config.durationMinutes} min · {LOCATION_LABEL[config.location].replace("At my ", "").replace("At ", "").toLowerCase()}
            <span className="grid size-9 place-items-center rounded-xl bg-lime text-ink">
              <ArrowUpRight className="size-5" aria-hidden="true" />
            </span>
          </span>
        </Link>
      </div>
    </section>
  );
}
