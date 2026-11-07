import type { NextConfig } from "next";

const sectionHomes = [
  ["/caseloads", "/caseloads/sarah-thompson"],
  ["/supervision", "/supervision/sarah-thompson"],
  ["/case-notes", "/case-notes/mia-robinson"],
  ["/progress-reports", "/progress-reports/emily-carter"],
] as const;

/** The design mock-ups were replaced by the real screens, so their old links lead there. */
const previewHomes = [
  ["/design-preview", "/"],
  ["/design-preview/overview", "/"],
  ["/design-preview/presenter", "/"],
  ["/design-preview/my-day", "/my-day"],
  ["/design-preview/phone", "/my-day"],
  ["/design-preview/note", "/sessions/oliver-grant"],
  ["/design-preview/prepared", "/sessions/oliver-grant/prepared"],
  ["/design-preview/admin-queue", "/admin-queue"],
  ["/design-preview/time-skip", "/since-yesterday"],
  ["/design-preview/supervision", "/supervision/sarah-thompson"],
  ["/design-preview/roadmap", "/roadmap"],
  ["/future-hospital", "/hospital"],
  ["/future-finance", "/billing"],
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
    return [...sectionHomes, ...previewHomes].map(([source, destination]) => ({
      source,
      destination,
      permanent: false,
    }));
  },
};

export default nextConfig;
