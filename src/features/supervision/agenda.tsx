"use client";

import { ChevronRight, Plus } from "lucide-react";
import Link from "next/link";
import { ApprovedLabel, DraftLabel, draftSurface } from "@/components/ai/provenance";
import { Button } from "@/components/ui/button";
import { Caption } from "@/components/ui/card";
import { sarahSupervision, suggestedAgenda } from "@/data/supervision";
import { cn } from "@/lib/cn";
import { useDemoStore } from "@/state/demo-store";

export function SuggestedAgenda() {
  const { included, approved } = useDemoStore((s) => s.agenda);
  const toggle = useDemoStore((s) => s.toggleAgendaItem);
  const approve = useDemoStore((s) => s.approveAgenda);
  const regenerate = useDemoStore((s) => s.regenerateAgenda);
  const includedCount = included.filter(Boolean).length;

  return (
    <section
      aria-labelledby="agenda-title"
      className={cn(draftSurface(approved), "px-6 pt-5 pb-4.5")}
    >
      {approved ? (
        <ApprovedLabel meta="Audit entry created · Ready to share with Sarah">
          Agenda approved by {sarahSupervision.supervisor}
        </ApprovedLabel>
      ) : (
        <DraftLabel meta={sarahSupervision.generatedAt}>
          AI Suggested Agenda — Supervisor Review Required
        </DraftLabel>
      )}

      <h2 id="agenda-title" className="mt-3.5 mb-1.5 headline text-h2">
        Discussion items
      </h2>

      <ol>
        {suggestedAgenda.map((item, index) => {
          const isIncluded = included[index] ?? true;
          return (
            <li
              key={item.text}
              className="grid grid-cols-[36px_minmax(0,1fr)_auto] items-start gap-3.5 border-t border-border py-4"
            >
              <span className="font-serif text-report-title leading-7 text-brass">{index + 1}</span>
              <div className="flex flex-col gap-1.5">
                <div className={cn("font-semibold", !isIncluded && "text-ink-400 line-through")}>
                  {item.text}
                </div>
                {item.details && (
                  <ul className="flex list-disc flex-col gap-0.5 pl-4 text-small text-ink-700">
                    {item.details.map((d) => (
                      <li key={d.client}>
                        <b className="font-semibold text-ink-900">{d.client}:</b> {d.change}
                      </li>
                    ))}
                  </ul>
                )}
                <Link
                  href={item.href}
                  className="inline-flex items-center gap-1 self-start text-small font-semibold"
                >
                  {item.evidence}
                  <ChevronRight className="size-3.5" strokeWidth={1.5} aria-hidden="true" />
                </Link>
              </div>
              <div className="flex flex-col items-end gap-2 pt-1">
                <label className="flex cursor-pointer items-center gap-1.5 text-caption font-semibold text-ink-700">
                  <input
                    type="checkbox"
                    checked={isIncluded}
                    disabled={approved}
                    onChange={() => toggle(index)}
                    className="m-0 size-4 accent-accent"
                  />
                  Include
                </label>
                {!approved && (
                  <button
                    type="button"
                    onClick={() => toggle(index)}
                    className="cursor-pointer text-caption font-semibold text-ink-500 hover:text-ink-700 hover:underline"
                  >
                    {isIncluded ? "Remove" : "Restore"}
                  </button>
                )}
              </div>
            </li>
          );
        })}
      </ol>

      <div className="flex flex-wrap items-center justify-between gap-3 border-t border-border pt-3.5">
        <div className="flex flex-wrap gap-2">
          <Button disabled={approved}>
            <Plus className="size-4" strokeWidth={1.5} aria-hidden="true" />
            Add item
          </Button>
          <Button variant="ghost" onClick={regenerate}>
            Regenerate
          </Button>
        </div>
        <div className="flex items-center gap-3">
          <Caption>
            {includedCount} of {suggestedAgenda.length} included
          </Caption>
          {!approved && (
            <Button variant="primary" onClick={approve} disabled={includedCount === 0}>
              Approve agenda
            </Button>
          )}
        </div>
      </div>
    </section>
  );
}
