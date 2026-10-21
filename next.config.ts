import type { NextConfig } from "next";

const sectionHomes = [
  ["/caseloads", "/caseloads/sarah-thompson"],
  ["/supervision", "/supervision/sarah-thompson"],
  ["/case-notes", "/case-notes/mia-robinson"],
  ["/progress-reports", "/progress-reports/emily-carter"],
] as const;

const nextConfig: NextConfig = {
  cacheComponents: true,
  devIndicators: false,
  partialPrefetching: true,
  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
  async redirects() {
    return sectionHomes.map(([source, destination]) => ({ source, destination, permanent: false }));
  },
};

export default nextConfig;
