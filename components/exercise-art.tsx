import Image from "next/image";
import { MovementIllustration } from "./movement-illustration";

/**
 * Illustration keys with a reviewed still in `public/illustrations/<key>.webp`
 * (see docs/illustrations/QA.md). Every other key keeps its line figure.
 */
export const STILL_KEYS: ReadonlySet<string> = new Set([
  "breathing",
  "celebrate",
  "chest-opener",
  "forward-reach",
  "mini-squat",
  "seated-overhead-reach",
  "seated-rotation",
  "seated-side-reach",
  "shoulder-rolls",
  "sit-to-stand",
  "standing-reach",
  "standing-side-reach",
]);

/**
 * Static exercise artwork for cards and lists. Fills its (mint, rounded) tile;
 * the stills share that mint background so the edge is invisible.
 */
export function ExerciseArt({
  illustrationKey,
  sizes,
  fallbackClassName,
}: {
  illustrationKey: string;
  /** Rendered CSS width, for responsive image selection, e.g. "96px". */
  sizes: string;
  /** Size of the line figure when no still exists. */
  fallbackClassName: string;
}) {
  if (!STILL_KEYS.has(illustrationKey)) {
    return <MovementIllustration illustrationKey={illustrationKey} className={fallbackClassName} />;
  }
  return (
    <Image
      src={`/illustrations/${illustrationKey}.webp`}
      alt=""
      width={512}
      height={512}
      sizes={sizes}
      className="size-full rounded-[inherit] object-cover"
    />
  );
}
