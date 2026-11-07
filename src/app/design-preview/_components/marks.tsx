"use client";

import { Check } from "lucide-react";
import type { ReactNode } from "react";
import { PenNib } from "@/components/ai/provenance";
import { Tag, type TagTone } from "@/components/ui/tag";
import { cn } from "@/lib/cn";
import type { QueueStatus, WorkloadStatus } from "../_fixtures/story";

export type ContentState = "Draft" | "Edited" | "Approved";

/** One marker for all AI-prepared content: who prepared it, its state, and where it came from. */
export function AiMark({
  state,
  source,
  children,
}: {
  state: ContentState;
  source?: ReactNode;
  children?: ReactNode;
}) {
  return (
    <div className="flex flex-wrap items-center justify-between gap-x-3 gap-y-1">
      <span
        className={cn(
          "flex items-center gap-1.5 text-caption font-semibold",
          state === "Approved" ? "text-healthy" : "text-brass",
        )}
      >
        {state === "Approved" ? (
          <Check className="size-3.5" strokeWidth={2} aria-hidden="true" />
        ) : (
          <PenNib className="size-3.5 text-brass" />
        )}
        {children ?? (state === "Draft" ? "AI draft, needs your approval" : `${state} by you`)}
      </span>
      {source && <span className="text-caption font-medium text-ink-500">{source}</span>}
    </div>
  );
}

/** A focusable link from AI content back to the dictated line it came from. */
export function SourceLink({
  line,
  active,
  onSelect,
}: {
  line: number;
  active?: boolean;
  onSelect?: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onSelect}
      aria-pressed={active}
      aria-label={`Show dictated line ${line}`}
      className={cn(
        "ml-1 inline-flex h-4.5 cursor-pointer items-center rounded-tag px-1 align-baseline font-mono text-eyebrow font-medium",
        active
          ? "bg-accent-fill text-on-accent"
          : "bg-accent-tint text-accent hover:bg-accent-fill hover:text-on-accent",
      )}
    >
      L{line}
    </button>
  );
}

const workloadTone: Record<WorkloadStatus, TagTone> = {
  "At Risk": "over",
  Watch: "monitor",
  Healthy: "healthy",
};

export function WorkloadTag({ status }: { status: WorkloadStatus }) {
  return <Tag tone={workloadTone[status]}>{status}</Tag>;
}

const taskTone: Record<QueueStatus, TagTone> = {
  Scheduled: "neutral",
  "Due today": "monitor",
  Overdue: "over",
  Escalated: "over",
  Done: "healthy",
};

export function TaskTag({ status }: { status: QueueStatus }) {
  return <Tag tone={taskTone[status]}>{status}</Tag>;
}

/** The new value with the previous one beside it. One colour transition, no count-up. */
export function Changed({
  value,
  was,
  className,
}: {
  value: ReactNode;
  was?: ReactNode;
  className?: string;
}) {
  return (
    <span className={cn("inline-flex items-baseline gap-1.5", className)}>
      <span className="transition-colors duration-160 ease-out motion-reduce:transition-none">
        {value}
      </span>
      {was !== undefined && (
        <span className="font-sans text-caption font-medium whitespace-nowrap text-ink-500">
          was {was}
        </span>
      )}
    </span>
  );
}
