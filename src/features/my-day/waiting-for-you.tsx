"use client";

import { Check } from "lucide-react";
import { PenNib } from "@/components/ai/provenance";
import { Button } from "@/components/ui/button";
import { Caption, Card } from "@/components/ui/card";
import { hannahDay } from "@/data/my-day";
import { useDemoStore } from "@/state/demo-store";

export function WaitingForYou() {
  const done = useDemoStore((s) => s.myDayFollowUpDone);
  const complete = useDemoStore((s) => s.completeMyDayFollowUp);
  const remaining = hannahDay.drafts.length + (done ? 0 : 1);

  return (
    <Card aria-labelledby="waiting" className="overflow-hidden">
      <div className="flex items-end justify-between gap-3 px-5 pt-4.5 pb-3">
        <h2 id="waiting" className="headline text-h2">
          Waiting for you
        </h2>
        <Caption>{remaining} items</Caption>
      </div>
      {hannahDay.drafts.map((d) => (
        <div
          key={d.client}
          className="flex items-center justify-between gap-3 border-t border-border px-5 py-3"
        >
          <div>
            <div className="flex items-center gap-1.5 font-semibold">
              <PenNib className="size-3.5 text-brass" />
              {d.client}
            </div>
            <Caption>{d.detail}</Caption>
          </div>
          <Button size="sm">Review</Button>
        </div>
      ))}
      <div className="flex items-center justify-between gap-3 border-t border-border px-5 py-3">
        <div>
          <div className={done ? "font-semibold text-ink-400 line-through" : "font-semibold"}>
            {hannahDay.followUp.task}
          </div>
          <Caption>{hannahDay.followUp.detail}</Caption>
        </div>
        {done ? (
          <span className="inline-flex items-center gap-1.5 text-small font-semibold text-healthy">
            <Check className="size-3.5" strokeWidth={2} aria-hidden="true" />
            Done
          </span>
        ) : (
          <Button size="sm" variant="ghost" onClick={complete}>
            Mark done
          </Button>
        )}
      </div>
    </Card>
  );
}
