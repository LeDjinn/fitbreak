"use client";

import { useSearchParams } from "next/navigation";
import { useMemo } from "react";
import { getPreset } from "@/lib/presets";
import { searchToConfig } from "@/lib/routine-params";
import { SessionPlayer } from "./session-player";

export function SessionFromParams() {
  const params = useSearchParams();
  const key = params.toString();
  const { config, adjusted } = useMemo(() => searchToConfig(new URLSearchParams(key)), [key]);
  const preset = getPreset(params.get("p") ?? "");
  // Remount the player whenever the routine itself changes.
  return (
    <SessionPlayer
      key={key}
      config={config}
      adjusted={adjusted}
      origin={preset ? `preset:${preset.slug}` : "builder"}
      exitHref={preset ? `/routines/${preset.slug}` : "/"}
    />
  );
}
