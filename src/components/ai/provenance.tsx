import { Check, PenTool } from "lucide-react";
import type { ReactNode } from "react";
import { cn } from "@/lib/cn";

export function PenNib({ className }: { className?: string }) {
  return (
    <PenTool className={cn("size-4 flex-none", className)} strokeWidth={1.5} aria-hidden="true" />
  );
}

/** The label every AI output carries until a named person approves it. */
export function DraftLabel({
  children = "AI Generated Draft — Clinician Review Required",
  meta,
}: {
  children?: ReactNode;
  meta?: ReactNode;
}) {
  return (
    <div className="flex flex-wrap items-center justify-between gap-2">
      <span className="flex items-center gap-2 text-caption font-semibold text-brass">
        <PenNib className="text-brass" />
        {children}
      </span>
      {meta && <span className="text-caption font-medium text-ink-500">{meta}</span>}
    </div>
  );
}

export function ApprovedLabel({ children, meta }: { children: ReactNode; meta?: ReactNode }) {
  return (
    <div className="flex flex-wrap items-center justify-between gap-2">
      <span className="flex items-center gap-2 text-small font-semibold text-healthy">
        <Check className="size-4" strokeWidth={2} aria-hidden="true" />
        {children}
      </span>
      {meta && <span className="text-caption font-medium text-ink-500">{meta}</span>}
    </div>
  );
}

/** Parchment surface for AI drafts. Switches to a plain card once approved. */
export function draftSurface(approved: boolean) {
  return approved
    ? "rounded-card border border-border bg-surface"
    : "rounded-card border border-border border-l-2 border-l-draft-rule bg-draft";
}
