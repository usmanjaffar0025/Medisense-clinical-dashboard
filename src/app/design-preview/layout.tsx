import type { Metadata } from "next";
import type { ReactNode } from "react";
import { CoverRootShell } from "./_components/cover-root-shell";
import { proposedTokens } from "./_components/proposed-tokens";

export const metadata: Metadata = { title: "Design preview · Medisense" };

/**
 * The root layout's shell can't change in this phase, so the preview sits over it. That lets each
 * mock-up show the proposed shell at full width without touching existing screens.
 */
export default function DesignPreviewLayout({ children }: { children: ReactNode }) {
  return (
    <div
      id="design-preview"
      style={proposedTokens}
      className="fixed inset-0 z-50 flex flex-col overflow-hidden bg-canvas text-ink-900"
    >
      <CoverRootShell />
      {children}
    </div>
  );
}
