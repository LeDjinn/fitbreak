import type { Metadata } from "next";
import { ProsePage } from "@/components/prose-page";

export const metadata: Metadata = {
  title: "Privacy",
  description: "FitBreak needs no account and asks no health questions. Here is exactly what stays in your browser.",
  alternates: { canonical: "/privacy" },
};

export default function PrivacyPage() {
  return (
    <ProsePage eyebrow="Privacy" title="Your break stays on your device.">
      <p>
        <strong>Short version:</strong> FitBreak doesn&apos;t need an account, doesn&apos;t ask for your email, and never asks about
        your health, age or weight. There are no ads, no tracking cookies, and no third-party analytics.
      </p>
      <h2>What we store, and where</h2>
      <p>
        FitBreak uses your browser&apos;s <strong>local storage</strong>, which stays on your own device, for two small things:
      </p>
      <ul>
        <li>
          <strong>Your last break choices:</strong> duration, place, focus, pace and the seated setting. This is why the form remembers
          you next time. Use <strong>Reset choices</strong> under the start button to clear it.
        </li>
        <li>
          <strong>Your sound preference:</strong> whether you turned audio cues on.
        </li>
      </ul>
      <p>
        Nothing is sent to us. You can also clear it at any time by clearing this site&apos;s data in your browser settings. A break in
        progress isn&apos;t saved. If you refresh in the middle of one, it starts again.
      </p>
      <h2>Analytics</h2>
      <p>
        Right now FitBreak doesn&apos;t connect to any analytics service. If we add privacy-friendly, aggregate analytics later, this
        page will be updated first. It would only ever count things like &ldquo;a 5-minute break was started&rdquo;, never who
        started it, and never any health information.
      </p>
      <h2>Share links</h2>
      <p>
        A share link only contains your break settings, such as <code className="rounded bg-mint-soft px-1.5 py-0.5 text-sm text-ink">d=5&amp;l=desk</code>. It
        contains nothing about you.
      </p>
    </ProsePage>
  );
}
