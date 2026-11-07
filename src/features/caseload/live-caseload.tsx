"use client";

import { MetricBand } from "@/components/ui/metric-band";
import { StatusTag } from "@/components/ui/tag";
import { sarahMetrics, sarahScoreFactors } from "@/data/caseload";
import { scoreThresholds } from "@/data/clinicians";
import { useDemoStore } from "@/state/demo-store";
import { figures, startFigures } from "@/state/story-selectors";
import { ScoreBreakdown } from "./score-breakdown";

function useSarah() {
  const caseNotes = useDemoStore((s) => s.caseNotes);
  const tasks = useDemoStore((s) => s.tasks);
  const story = useDemoStore((s) => s.story);
  return figures({ caseNotes, tasks, story });
}

export function LiveScoreTag() {
  const f = useSarah();
  return (
    <div className="flex items-center gap-3 border-r border-border pr-5">
      <StatusTag status={f.sarahStatus} />
      <span className="headline text-stat font-normal">{f.sarahScore}</span>
    </div>
  );
}

/** Sarah's figures, following what has been approved and who now owns which follow-up. */
export function LiveMetrics() {
  const f = useSarah();
  const unownedSarah = 2 - (startFigures.unowned - f.unowned);
  const metrics = sarahMetrics.map((m) => {
    if (m.label === "Notes overdue") {
      return { ...m, label: "Notes to write", value: String(f.sarahNotes) };
    }
    if (m.label === "Follow-ups due") {
      return { ...m, caption: `3 overdue, ${unownedSarah} with no owner` };
    }
    return m;
  });
  return <MetricBand label="Caseload metrics" metrics={metrics} />;
}

export function LiveScoreBreakdown() {
  const f = useSarah();
  const cleared = startFigures.sarahNotes - f.sarahNotes;
  const factors = sarahScoreFactors.map((factor) =>
    factor.label === "Overdue documentation"
      ? {
          ...factor,
          points: factor.points - cleared * 3,
          detail: `${f.sarahNotes} ${f.sarahNotes === 1 ? "note" : "notes"} to write`,
        }
      : factor,
  );
  return <ScoreBreakdown factors={factors} thresholds={scoreThresholds} />;
}
