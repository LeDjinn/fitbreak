import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  cacheComponents: true,
  // One public address: send the default Vercel hostname to the custom domain.
  // Only this exact host matches, so preview deployments are unaffected.
  async redirects() {
    return [
      {
        source: "/:path*",
        has: [{ type: "host", value: "fitbreak.vercel.app" }],
        destination: "https://www.bestfittips.com/:path*",
        permanent: true,
      },
    ];
  },
  partialPrefetching: true,
  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
};

export default nextConfig;
