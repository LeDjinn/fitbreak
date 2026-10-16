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
        your health, age or weight. There are no ads and no tracking cookies. We count visits in aggregate (see Analytics below).
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
        These choices aren&apos;t sent to us. You can also clear them at any time by clearing this site&apos;s data in your browser settings. A break in
        progress isn&apos;t saved. If you refresh in the middle of one, it starts again.
      </p>
      <h2>Analytics</h2>
      <p>
        We use <strong>Vercel Web Analytics</strong> to count visits in aggregate: which pages are viewed, roughly where visitors
        come from (country, referring site) and what kind of device they use. It uses no third-party cookies and stores nothing on
        your device. Vercel recognises a visit by a hash of the incoming request, and discards it after 24 hours. We never see who you
        are.
      </p>
      <p>
        When you start a break, the visit to the session page includes your break settings (for example a 5-minute desk break),
        so we can see which breaks are popular. Nothing else from the address is kept. We don&apos;t record your name, email or
        IP address, or any health information.
      </p>
      <h2>Error reports</h2>
      <p>
        If something breaks, an automatic error report is sent to <strong>Rollbar</strong>, our error-tracking service, so we can
        fix it. A report contains the technical error, the page it happened on (with the same address clean-up as above), your
        browser type and the app version. It doesn&apos;t include your IP address, anything you clicked or typed, or anything else that
        identifies you.
      </p>
      <h2>Share links</h2>
      <p>
        A share link only contains your break settings, such as <code className="rounded bg-mint-soft px-1.5 py-0.5 text-sm text-ink">d=5&amp;l=desk</code>. It
        contains nothing about you.
      </p>
    </ProsePage>
  );
}
