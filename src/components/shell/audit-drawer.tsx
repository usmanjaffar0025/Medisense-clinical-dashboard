"use client";

import { X } from "lucide-react";
import { useEffect, useRef } from "react";
import { PenNib } from "@/components/ai/provenance";
import { Button } from "@/components/ui/button";
import { auditDayLabels } from "@/data/audit";
import type { AuditEntry } from "@/data/types";
import { cn } from "@/lib/cn";
import { useDemoStore } from "@/state/demo-store";

function groupByDay(entries: AuditEntry[]) {
  const sorted = [...entries].sort((a, b) =>
    a.day === b.day ? b.time.localeCompare(a.time) : b.day.localeCompare(a.day),
  );
  const days = [...new Set(sorted.map((e) => e.day))];
  return days.map((day) => ({ day, items: sorted.filter((e) => e.day === day) }));
}

export function AuditDrawer({ open, onClose }: { open: boolean; onClose: () => void }) {
  const audit = useDemoStore((s) => s.audit);
  const resetDemo = useDemoStore((s) => s.resetDemo);
  const closeRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!open) return;
    closeRef.current?.focus();
    const onKey = (event: KeyboardEvent) => event.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  if (!open) return null;

  const groups = groupByDay(audit);

  return (
    <>
      <button
        type="button"
        aria-label="Close audit trail"
        tabIndex={-1}
        onClick={onClose}
        className="fixed inset-0 z-40 cursor-default bg-ink-900/16"
      />
      <aside
        role="dialog"
        aria-modal="true"
        aria-label="Audit trail"
        className="fixed inset-y-0 right-0 z-41 flex w-105 max-w-full flex-col rounded-l-sheet border-l border-border bg-surface-raised shadow-overlay"
      >
        <div className="flex items-start justify-between gap-3 border-b border-border px-6 pt-6 pb-5">
          <div>
            <p className="eyebrow">Audit trail</p>
            <h2 className="mt-1.5 headline text-h2">Recent activity</h2>
            <p className="mt-1 text-small text-ink-700">
              Every AI generation and every human approval is recorded.
            </p>
          </div>
          <button
            ref={closeRef}
            type="button"
            aria-label="Close audit trail"
            onClick={onClose}
            className="flex size-8 cursor-pointer items-center justify-center rounded-control hover:bg-canvas"
          >
            <X className="size-4 text-ink-700" strokeWidth={1.5} aria-hidden="true" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-6 pt-5 pb-6">
          {groups.map(({ day, items }) => (
            <div key={day} className="mb-5">
              <div className="mb-3 eyebrow">{auditDayLabels[day]}</div>
              <ol className="ml-11.5 border-l border-border">
                {items.map((e) => (
                  <li key={e.id} className="relative flex gap-3.5 pb-4.5 pl-4.5">
                    <span className="absolute top-px -left-16 w-12 text-right font-mono text-caption leading-4.5 text-ink-700">
                      {e.time}
                    </span>
                    <span
                      aria-hidden="true"
                      className={cn(
                        "absolute top-1.5 -left-1 size-1.75 rounded-full",
                        e.isAi ? "bg-brass" : "bg-accent",
                      )}
                    />
                    <div className="flex min-w-0 flex-col gap-0.5">
                      <div
                        className={cn(
                          "flex items-center gap-1.5 text-small font-semibold",
                          e.isAi ? "text-brass" : "text-ink-900",
                        )}
                      >
                        {e.isAi && <PenNib className="size-3.5 text-brass" />}
                        {e.actor}
                      </div>
                      <div className="text-small text-ink-900">{e.action}</div>
                      <div className="text-caption text-ink-500">{e.object}</div>
                    </div>
                  </li>
                ))}
              </ol>
            </div>
          ))}
        </div>

        <div className="flex items-center justify-between gap-3 rounded-bl-sheet border-t border-border bg-surface px-6 py-3.5">
          <span className="text-caption font-medium text-ink-500">
            {audit.length} entries · 19–20 Oct
          </span>
          <div className="flex gap-2">
            <Button size="sm" variant="ghost" onClick={resetDemo}>
              Reset demo
            </Button>
            <Button size="sm">Export log</Button>
          </div>
        </div>
      </aside>
    </>
  );
}
