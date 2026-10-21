import type { Metadata } from "next";
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
  title: "Medisense · Clinical Operations",
  description: "Clinical operations and supervision dashboard for allied health leadership.",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html
      lang="en-AU"
      className={`${newsreader.variable} ${instrumentSans.variable} ${plexMono.variable}`}
    >
      <body>
        <DemoStoreHydrator />
        <div className="flex min-h-screen bg-canvas">
          <Sidebar />
          <div className="flex min-w-0 flex-1 flex-col">
            <TopBar />
            {children}
          </div>
        </div>
      </body>
    </html>
  );
}
