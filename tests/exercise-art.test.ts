import { existsSync, readdirSync } from "node:fs";
import { describe, expect, it } from "vitest";
import { STILL_KEYS } from "@/components/exercise-art";
import { EXERCISES } from "@/lib/exercises";

const dir = new URL("../public/illustrations/", import.meta.url);
const known = new Set([...EXERCISES.map((e) => e.illustrationKey), "celebrate"]);

describe("exercise stills", () => {
  it("every listed still exists on disk and belongs to a real illustration key", () => {
    STILL_KEYS.forEach((key) => {
      expect(known.has(key), key).toBe(true);
      expect(existsSync(new URL(`${key}.webp`, dir)), key).toBe(true);
    });
  });

  it("ships no orphan files", () => {
    const files = readdirSync(dir).map((f) => f.replace(/\.webp$/, ""));
    expect(files.sort()).toEqual(Array.from(STILL_KEYS).sort());
  });
});
