import type { MetadataRoute } from "next";
import { PRESETS } from "@/lib/presets";

// Set NEXT_PUBLIC_SITE_URL to the verified production origin before deploying.
const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";

export default function sitemap(): MetadataRoute.Sitemap {
  const paths = ["/", "/routines", ...PRESETS.map((p) => `/routines/${p.slug}`), "/about", "/privacy"];
  return paths.map((path) => ({ url: `${siteUrl}${path}` }));
}
