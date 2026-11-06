import type { Metadata } from "next";
import { connection } from "next/server";
import { Suspense, type ReactNode } from "react";
import { IBM_Plex_Mono, Instrument_Sans, Newsreader } from "next/font/google";
import { Sidebar } from "@/components/shell/sidebar";
import { TopBar } from "@/components/shell/top-bar";
import { DemoStoreHydrator } from "@/state/demo-store-hydrator";
import "./globals.css";

const newsreader = Newsreader({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  variable: "--font-newsreader",
});

const instrumentSans = Instrument_Sans({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  variable: "--font-instrument-sans",
});

const plexMono = IBM_Plex_Mono({
  subsets: ["latin"],
  weight: ["400", "500"],
  variable: "--font-plex-mono",
});

export const metadata: Metadata = {
  title: "Medisense · Clinical Operations & Supervision",
  description:
    "Medisense Clinical Operations & Supervision Intelligence Platform: an AI-assisted operational layer for allied health teams.",
};

/**
 * Dates follow today (see `lib/clock`), so pages render per request instead of being frozen
 * at build time; the browser computes the same day, so hydration matches.
 */
async function Today({ children }: { children: ReactNode }) {
  await connection();
  return children;
}

export default function RootLayout({ children }: Readonly<{ children: ReactNode }>) {
  return (
    <html
      lang="en-AU"
      className={`${newsreader.variable} ${instrumentSans.variable} ${plexMono.variable}`}
    >
      <body>
        <DemoStoreHydrator />
        <Suspense fallback={<div className="min-h-screen bg-canvas" />}>
          <Today>
            <div className="flex min-h-screen bg-canvas">
              <Sidebar />
              <div className="flex min-w-0 flex-1 flex-col">
                <TopBar />
                {children}
              </div>
            </div>
          </Today>
        </Suspense>
      </body>
    </html>
  );
}
