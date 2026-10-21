import type { ReactNode } from "react";
import type { CaseloadStatus, Priority } from "@/data/types";
import { cn } from "@/lib/cn";

export type TagTone = "healthy" | "monitor" | "over" | "available" | "neutral" | "outline" | "live";

const tones: Record<TagTone, { tag: string; dot: string }> = {
  healthy: { tag: "bg-healthy-bg text-healthy", dot: "bg-healthy-dot" },
  monitor: { tag: "bg-monitor-bg text-monitor", dot: "bg-monitor-dot" },
  over: { tag: "bg-over-bg text-over", dot: "bg-over-dot" },
  available: { tag: "bg-available-bg text-available", dot: "bg-available-dot" },
  neutral: { tag: "bg-surface-sunken text-ink-700", dot: "bg-ink-400" },
  outline: { tag: "text-ink-700 ring-1 ring-border-strong ring-inset", dot: "bg-available-dot" },
  live: { tag: "bg-accent-tint text-accent", dot: "bg-accent" },
};

export function Tag({ tone, children }: { tone: TagTone; children: ReactNode }) {
  return (
    <span
      className={cn(
        "inline-flex h-5.5 items-center gap-1.5 rounded-tag px-2 text-caption leading-none font-semibold whitespace-nowrap",
        tones[tone].tag,
      )}
    >
      <i className={cn("size-2 flex-none rounded-full", tones[tone].dot)} aria-hidden="true" />
      {children}
    </span>
  );
}

const statusLabels: Record<CaseloadStatus, string> = {
  healthy: "Healthy",
  monitor: "Monitor",
  over: "Over Capacity",
};

export function StatusTag({ status }: { status: CaseloadStatus }) {
  return <Tag tone={status}>{statusLabels[status]}</Tag>;
}

export const priorityTone: Record<Priority, TagTone> = {
  High: "over",
  Medium: "monitor",
  Low: "neutral",
};

export function PriorityTag({ priority }: { priority: Priority }) {
  return <Tag tone={priorityTone[priority]}>{priority}</Tag>;
}
