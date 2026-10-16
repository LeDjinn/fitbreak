import type { Metadata } from "next";
import Link from "next/link";
import { ProsePage } from "@/components/prose-page";

export const metadata: Metadata = {
  title: "About",
  description: "Why FitBreak exists, how routines are put together, and what it is not.",
  alternates: { canonical: "/about" },
};

export default function AboutPage() {
  return (
    <ProsePage eyebrow="About FitBreak" title="A better break, in a few minutes.">
      <p>
        Lots of us sit for hours at a desk, a kitchen table or a laptop on the sofa. We know a short break to move would help, but it
        rarely happens because it takes effort to plan. FitBreak takes that effort away. Pick how long you have and where you are, press
        play, and follow along.
      </p>
      <h2>How routines are put together</h2>
      <p>
        Every routine comes from a small, hand-written library of gentle, equipment-free movements. A simple, predictable set of rules
        builds your break. It isn&apos;t AI and it isn&apos;t random:
      </p>
      <ul>
        <li>Only movements that suit where you are. Desk breaks never use the floor or need open space.</li>
        <li>&ldquo;Stay seated&rdquo; means every move is seated, with no exceptions.</li>
        <li>Moves that match your focus come first, then gentle full-body moves fill any gaps.</li>
        <li>Breaks open and close with the easiest moves, and no move runs twice in a row.</li>
        <li>The timing is exact. A 5-minute break lasts 300 seconds, pauses between moves included.</li>
      </ul>
      <p>
        The same choices always give you the same plan, so you can come back to a break you liked. Press <strong>Shuffle</strong> when
        you want something new.
      </p>
      <h2>What FitBreak is not</h2>
      <p>
        It isn&apos;t a treatment, a diagnosis, or a training programme. The movements are general guidance for healthy adults, and
        nothing here promises to fix pain or burn calories. Move within a comfortable range. Stop if you feel pain, dizziness or unwell.
        If you have an injury or a health condition, a doctor or physiotherapist can tell you what&apos;s right for you.
      </p>
      <h2>Who makes it</h2>
      <p>
        FitBreak is a small, independent project by BestFitTips. It&apos;s free, with no account and no ads. See the{" "}
        <Link href="/privacy">privacy page</Link> for what stays on your device.
      </p>
    </ProsePage>
  );
}
