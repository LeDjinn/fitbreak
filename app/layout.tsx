import type { Metadata, Viewport } from "next";
import { Bricolage_Grotesque, Inter } from "next/font/google";
import { Suspense } from "react";
import { ErrorReporting } from "@/components/error-reporting";
import { SiteAnalytics } from "@/components/site-analytics";
import "./globals.css";

const display = Bricolage_Grotesque({
  variable: "--font-display-face",
  subsets: ["latin"],
  display: "swap",
});

const body = Inter({
  variable: "--font-body",
  subsets: ["latin"],
  display: "swap",
});

// The production domain is not verified yet. Set NEXT_PUBLIC_SITE_URL when deploying.
const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "FitBreak · A better break, in a few minutes",
    template: "%s · FitBreak",
  },
  description:
    "Build a guided 2, 5 or 10-minute movement break for your desk, a small room or home. Free, no equipment, no signup. Just press play.",
  applicationName: "FitBreak",
  openGraph: {
    type: "website",
    siteName: "FitBreak by BestFitTips",
    title: "FitBreak · A better break, in a few minutes",
    description: "A guided movement break designed around your day. Choose your time, press play, and get moving.",
  },
};

export const viewport: Viewport = {
  themeColor: "#f7f7f2",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className={`${display.variable} ${body.variable}`}>
      <body className="min-h-dvh">
        <a
          href="#main"
          className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-50 focus:rounded-full focus:bg-ink focus:px-5 focus:py-3 focus:text-sm focus:font-semibold focus:text-on-panel"
        >
          Skip to content
        </a>
        {children}
        <Suspense fallback={null}>
          <SiteAnalytics />
        </Suspense>
        <ErrorReporting />
      </body>
    </html>
  );
}
