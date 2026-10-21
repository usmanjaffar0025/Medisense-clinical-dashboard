"use client";

import { PenNib } from "@/components/ai/provenance";
import { Button } from "@/components/ui/button";
import { Caption, Card, CardTitle } from "@/components/ui/card";
import { miaCaseNote } from "@/data/case-note";
import { cn } from "@/lib/cn";
import { useDemoStore } from "@/state/demo-store";

const hints = {
  empty: "Takes a few seconds",
  draft: "Draft generated 20 Oct, 10:42",
  edit: "Draft generated 20 Oct, 10:42",
  approved: "Summary approved",
};

export function TherapistNotes() {
  const { mode, changes } = useDemoStore((s) => s.caseNote);
  const generateNote = useDemoStore((s) => s.generateNote);
  const showPairing = mode === "draft" && changes === 0;

  return (
    <Card
      id="sources"
      aria-labelledby="therapist-notes"
      className="flex flex-col gap-3.5 px-5 pt-5 pb-4.5"
    >
      <CardTitle
        id="therapist-notes"
        title="Therapist notes"
        description={miaCaseNote.enteredBy}
        aside={<Caption className="pt-1.5">{miaCaseNote.rawLines.length} lines</Caption>}
      />
      <ol className="flex flex-col gap-0.5 border-t border-border pt-2.5">
        {miaCaseNote.rawLines.map((line, index) => {
          const paired = showPairing && index === miaCaseNote.pairedLine;
          return (
            <li
              key={line}
              className={cn(
                "grid grid-cols-[24px_minmax(0,1fr)] gap-2.5 rounded-control px-2.5 py-2 transition-colors duration-160 ease-out",
                paired && "bg-accent-tint shadow-rule-accent",
              )}
            >
              <span
                className={cn(
                  "text-right font-mono text-caption leading-5.25",
                  paired ? "font-medium text-accent" : "text-ink-400",
                )}
              >
                {index + 1}
              </span>
              <span>{line}</span>
            </li>
          );
        })}
      </ol>
      <p className="rounded-control bg-surface-sunken px-3 py-2.5 text-caption font-medium text-ink-700">
        Uses only this note. Nothing is saved until you approve.
      </p>
      <div className="flex flex-wrap items-center gap-3">
        <Button variant={mode === "empty" ? "primary" : "secondary"} onClick={generateNote}>
          <PenNib />
          Generate structured summary
        </Button>
        <Caption>{hints[mode]}</Caption>
      </div>
    </Card>
  );
}
