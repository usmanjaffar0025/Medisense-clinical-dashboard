"use client";

import { Eye, EyeOff } from "lucide-react";
import Link from "next/link";
import { PenNib } from "@/components/ai/provenance";
import { Button } from "@/components/ui/button";
import { Caption, Card } from "@/components/ui/card";
import { capacityRecommendation, rebalanceScenario } from "@/data/capacity";
import { useDemoStore } from "@/state/demo-store";

function Side({
  name,
  load,
  note,
  tone,
}: {
  name: string;
  load: string;
  note: string;
  tone: "over" | "available";
}) {
  return (
    <div className="flex flex-1 flex-col gap-0.5 rounded-card border border-border bg-surface px-3.5 py-3">
      <span className="eyebrow">{name}</span>
      <span className="headline text-stat-sm font-normal">{load}</span>
      <span
        className={`text-caption font-medium ${tone === "over" ? "text-over" : "text-available"}`}
      >
        {note}
      </span>
    </div>
  );
}

export function Recommendation({
  previewing,
  onTogglePreview,
}: {
  previewing: boolean;
  onTogglePreview: () => void;
}) {
  const state = useDemoStore((s) => s.recommendation);
  const review = useDemoStore((s) => s.reviewRecommendation);
  const dismiss = useDemoStore((s) => s.dismissRecommendation);
  const { from, to, continuity } = capacityRecommendation;
  const { sarah, emma } = rebalanceScenario;

  return (
    <Card
      aria-labelledby="recommendation"
      className="flex h-full flex-col gap-3.5 px-5 pt-5 pb-4.5"
    >
      <div className="flex items-center justify-between gap-2">
        <span className="flex items-center gap-1.5 eyebrow text-brass">
          <PenNib className="size-3.5 text-brass" />
          Suggestion
        </span>
        <Caption>
          {capacityRecommendation.generatedAt} · {state === "pending" ? "Not applied" : "Reviewed"}
        </Caption>
      </div>
      <h2 id="recommendation" className="headline text-figure">
        Rebalancing for review
      </h2>
      <p>{capacityRecommendation.text}</p>

      <div className="flex items-stretch gap-2">
        <Side {...from} tone="over" />
        <div aria-hidden="true" className="flex items-center">
          <svg
            viewBox="0 0 32 12"
            className="h-3 w-8 fill-none stroke-ink-500"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M1 6h29" />
            <path d="m25 1 5 5-5 5" />
          </svg>
        </div>
        <Side {...to} tone="available" />
      </div>

      <div className="rounded-control border border-border bg-surface-sunken px-3.5 py-3">
        <div className="mb-1.5 eyebrow">Continuity of care</div>
        <ul className="flex list-disc flex-col gap-1 pl-4 text-small text-ink-700">
          {continuity.map((c) => (
            <li key={c}>{c}</li>
          ))}
        </ul>
      </div>

      <Button variant="secondary" onClick={onTogglePreview} aria-pressed={previewing}>
        {previewing ? (
          <EyeOff className="size-4" strokeWidth={1.5} aria-hidden="true" />
        ) : (
          <Eye className="size-4" strokeWidth={1.5} aria-hidden="true" />
        )}
        {previewing ? "Hide scenario preview" : "Preview scenario"}
      </Button>
      {previewing && (
        <p className="rounded-control bg-accent-tint px-3.5 py-2.5 text-small text-accent">
          Preview only: moving {rebalanceScenario.moved} newer clients would take Sarah from{" "}
          {sarah.before.utilisation}% to {sarah.after.utilisation}% and Emma from{" "}
          {emma.before.utilisation}% to {emma.after.utilisation}%. Nothing has changed.
        </p>
      )}

      {state === "pending" && (
        <div className="flex flex-wrap gap-2">
          <Button variant="primary" onClick={review}>
            Review with supervisor
          </Button>
          <Button variant="ghost" onClick={dismiss}>
            Dismiss
          </Button>
        </div>
      )}
      {state === "reviewed" && (
        <div
          role="status"
          className="flex flex-col gap-1.5 rounded-control bg-healthy-bg px-3.5 py-3"
        >
          <span className="text-small font-semibold text-healthy">
            Sent to Grace Liu for review · Logged to audit trail
          </span>
          <Link href="/" className="text-small font-semibold">
            Return to overview
          </Link>
        </div>
      )}
      {state === "dismissed" && (
        <div
          role="status"
          className="rounded-control bg-surface-sunken px-3.5 py-3 text-small text-ink-700"
        >
          Suggestion dismissed. No changes were made.{" "}
          <Link href="/" className="font-semibold">
            Return to overview
          </Link>
        </div>
      )}

      <Caption className="border-t border-border pt-3">
        Recommendation only. Requires leadership review. No clients are reassigned automatically.
      </Caption>
    </Card>
  );
}
