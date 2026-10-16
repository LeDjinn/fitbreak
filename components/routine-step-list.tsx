import { getExercise } from "@/lib/exercises";
import type { GeneratedRoutine } from "@/lib/types";
import { MovementIllustration } from "./movement-illustration";

/** Server-rendered, full routine with steps — used on preset pages. */
export function RoutineStepList({ routine }: { routine: GeneratedRoutine }) {
  return (
    <ol className="grid gap-3 sm:grid-cols-2">
      {routine.steps.map((step, index) => {
        const e = getExercise(step.exerciseId);
        return (
          <li key={step.id} className="flex gap-4 rounded-3xl border border-stroke bg-cream p-4 sm:p-5">
            <div className="relative grid size-20 shrink-0 place-items-center rounded-2xl bg-mint text-ink sm:size-24">
              <MovementIllustration illustrationKey={e.illustrationKey} className="size-[88%]" />
              <span className="tabular absolute -top-1.5 -left-1.5 grid size-6 place-items-center rounded-full bg-ink text-xs font-bold text-lime">
                {index + 1}
              </span>
            </div>
            <div className="min-w-0">
              <h3 className="font-semibold tracking-[-0.01em]">{e.name}</h3>
              <p className="mt-0.5 text-xs font-semibold text-leaf">
                {step.activeSeconds} sec · {e.posture === "seated" ? "Seated" : "Standing"}
                {e.equipment === "chair" ? (e.posture === "seated" ? "" : " · Chair or desk for support") : e.equipment === "wall" ? " · Wall" : ""}
              </p>
              <p className="mt-1.5 text-sm leading-relaxed text-muted">{e.shortInstruction}</p>
            </div>
          </li>
        );
      })}
    </ol>
  );
}
