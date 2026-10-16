"use client";

import type { LucideIcon } from "lucide-react";
import { useId } from "react";

export type SegmentOption<T extends string | number> = {
  value: T;
  label: string;
  hint?: string;
  icon?: LucideIcon;
  disabled?: boolean;
};

/**
 * A fieldset of real radio inputs styled as segmented cards.
 * Native radios give arrow-key navigation and form semantics for free.
 */
export function SegmentedField<T extends string | number>({
  number,
  legend,
  name,
  value,
  options,
  onChange,
  columns = 3,
  note,
}: {
  number: string;
  legend: string;
  name: string;
  value: T;
  options: SegmentOption<T>[];
  onChange: (value: T) => void;
  columns?: 2 | 3;
  note?: string;
}) {
  const noteId = useId();
  return (
    <fieldset className="min-w-0" aria-describedby={note ? noteId : undefined}>
      <legend className="mb-3 flex items-baseline gap-2.5 text-[0.9375rem] font-semibold tracking-[-0.01em] text-ink">
        <span className="tabular text-xs font-bold text-leaf">{number}</span>
        {legend}
      </legend>
      <div className={`grid gap-2 ${columns === 3 ? "grid-cols-3" : "grid-cols-1 min-[420px]:grid-cols-2"}`}>
        {options.map((option) => {
          const Icon = option.icon;
          const checked = option.value === value;
          return (
            <label key={String(option.value)} className={`relative ${option.disabled ? "cursor-not-allowed" : "cursor-pointer"}`}>
              <input
                type="radio"
                name={name}
                value={String(option.value)}
                checked={checked}
                disabled={option.disabled}
                onChange={() => onChange(option.value)}
                className="peer sr-only"
              />
              <span
                className={[
                  "flex min-h-[3.25rem] items-center gap-2.5 rounded-[var(--radius-control)] border bg-paper px-3 text-sm font-semibold transition-[border-color,background-color,box-shadow,transform] duration-200",
                  columns === 3 ? "justify-center text-center" : "justify-start",
                  "border-stroke text-muted hover:border-stroke-strong hover:text-ink",
                  "peer-checked:border-mint-deep/50 peer-checked:bg-mint-soft peer-checked:text-mint-deep peer-checked:shadow-[inset_0_0_0_1px_rgb(44_118_88/0.35)]",
                  "peer-focus-visible:outline-3 peer-focus-visible:outline-offset-2 peer-focus-visible:outline-leaf",
                  "peer-disabled:opacity-45 peer-disabled:hover:border-stroke",
                  "active:scale-[0.98]",
                ].join(" ")}
              >
                {Icon && (
                  <span
                    className={`grid size-7 shrink-0 place-items-center rounded-lg transition-colors ${checked ? "bg-mint-deep text-lime" : "bg-canvas text-subtle"}`}
                    aria-hidden="true"
                  >
                    <Icon className="size-4" strokeWidth={2.2} />
                  </span>
                )}
                <span className="flex min-w-0 flex-col leading-tight">
                  <span>{option.label}</span>
                  {option.hint && <span className="mt-0.5 text-xs font-medium">{option.hint}</span>}
                </span>
              </span>
            </label>
          );
        })}
      </div>
      {note && (
        <p id={noteId} className="mt-2 text-xs leading-relaxed text-muted">
          {note}
        </p>
      )}
    </fieldset>
  );
}

export function ToggleRow({
  id,
  label,
  description,
  checked,
  onChange,
}: {
  id: string;
  label: string;
  description: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
}) {
  return (
    <div className="flex items-center justify-between gap-5">
      <div className="min-w-0">
        <label htmlFor={id} className="block cursor-pointer text-[0.9375rem] font-semibold text-ink">
          {label}
        </label>
        <p id={`${id}-desc`} className="mt-0.5 text-sm text-muted">
          {description}
        </p>
      </div>
      <button
        id={id}
        type="button"
        role="switch"
        aria-checked={checked}
        aria-describedby={`${id}-desc`}
        onClick={() => onChange(!checked)}
        className={`relative inline-flex h-8 w-[3.25rem] shrink-0 items-center rounded-full p-1 transition-colors duration-200 before:absolute before:-inset-2 before:content-[''] ${checked ? "bg-mint-deep" : "bg-stroke-strong"}`}
      >
        <span
          className={`block size-6 rounded-full bg-paper shadow-[0_2px_6px_rgb(21_53_50/0.25)] transition-transform duration-200 ${checked ? "translate-x-5" : "translate-x-0"}`}
        />
      </button>
    </div>
  );
}
