"use client";

import { Check } from "lucide-react";
import type { ReactNode } from "react";
import { Tag, type TagTone } from "@/components/ui/tag";
import { cn } from "@/lib/cn";
import { PenNib } from "./provenance";

export type ContentState = "Draft" | "Approved";

/** One marker for AI-prepared content: who prepared it, its state and where it came from. */
export function AiMark({
  state = "Draft",
  source,
  children,
}: {
  state?: ContentState;
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
        {children ?? "AI draft, needs your approval"}
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

export type TaskStatus = "Scheduled" | "Due today" | "Overdue" | "Escalated" | "Done";

const taskTone: Record<TaskStatus, TagTone> = {
  Scheduled: "neutral",
  "Due today": "monitor",
  Overdue: "over",
  Escalated: "over",
  Done: "healthy",
};

export function TaskTag({ status }: { status: TaskStatus }) {
  return <Tag tone={taskTone[status]}>{status}</Tag>;
}

/** A moved value with the previous one beside it. One colour transition, no count-up. */
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
