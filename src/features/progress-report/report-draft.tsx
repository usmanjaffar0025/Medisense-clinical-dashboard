"use client";

import type { ReactNode } from "react";
import { ApprovedLabel, DraftLabel, PenNib, draftSurface } from "@/components/ai/provenance";
import { Button } from "@/components/ui/button";
import { Caption, Card } from "@/components/ui/card";
import { emilyReport } from "@/data/progress-report";
import { cn } from "@/lib/cn";
import { useDemoStore } from "@/state/demo-store";

const goalStatusDot: Record<string, string> = {
  "Largely achieved": "bg-healthy-dot",
  Progressing: "bg-chart-sand",
};

function ReportSection({
  title,
  editable,
  children,
}: {
  title: string;
  editable: boolean;
  children: ReactNode;
}) {
  return (
    <section className="group relative border-t border-border py-5">
      <span
        aria-hidden="true"
        className="pointer-events-none absolute -inset-x-4 inset-y-0 rounded-control bg-draft-rule/12 opacity-0 transition-opacity duration-160 ease-out group-hover:opacity-100"
      />
      {editable && (
        <div className="absolute top-4 right-0 flex gap-1 opacity-0 transition-opacity duration-160 ease-out group-focus-within:opacity-100 group-hover:opacity-100">
          <Button size="sm">Edit</Button>
          <Button size="sm" variant="ghost">
            Regenerate section
          </Button>
        </div>
      )}
      <h3 className="relative mb-2.5 font-serif text-report-heading font-medium">{title}</h3>
      <div className="relative">{children}</div>
    </section>
  );
}

function Bullets({ items }: { items: string[] }) {
  return (
    <ul className="flex list-disc flex-col gap-1 pl-4.5">
      {items.map((i) => (
        <li key={i}>{i}</li>
      ))}
    </ul>
  );
}

function CopmFigure() {
  return (
    <figure className="m-0 mt-4 rounded-control border border-border bg-surface px-4 py-3.5">
      <figcaption className="mb-2.5 flex justify-between gap-3">
        <span className="eyebrow">COPM · scored 1–10</span>
        <span className="flex gap-3 text-caption font-medium text-ink-500">
          <span className="flex items-center gap-1.5">
            <span className="h-1.5 w-2.5 rounded-full bg-ink-400" />
            Apr 2026
          </span>
          <span className="flex items-center gap-1.5">
            <span className="h-1.5 w-2.5 rounded-full bg-accent" />
            Oct 2026
          </span>
        </span>
      </figcaption>
      {emilyReport.copm.map((m, i) => (
        <div
          key={m.measure}
          className={cn(
            "grid grid-cols-[100px_minmax(0,1fr)_92px] items-center gap-3 text-small",
            i === 0 && "mb-2",
          )}
        >
          <span className="font-semibold">{m.measure}</span>
          <div
            className="relative h-4.5"
            role="img"
            aria-label={`${m.measure} ${m.before} to ${m.after}`}
          >
            <span
              className="absolute top-0.5 left-0 h-1.5 rounded-full bg-ink-400"
              style={{ width: `${m.before * 10}%` }}
            />
            <span
              className="absolute top-2.5 left-0 h-1.5 rounded-full bg-accent"
              style={{ width: `${m.after * 10}%` }}
            />
          </div>
          <span className="text-right">
            <span className="text-ink-500">{m.before}</span> →{" "}
            <b className="font-semibold">{m.after}</b>{" "}
            <span className="text-caption font-medium text-ink-500">
              +{(m.after - m.before).toFixed(1)}
            </span>
          </span>
        </div>
      ))}
    </figure>
  );
}

export function ReportSources() {
  const regenerate = useDemoStore((s) => s.regenerateReport);

  return (
    <Card aria-labelledby="sources" className="px-5 pt-5 pb-4.5">
      <h2 id="sources" className="headline text-h2">
        Approved sources
      </h2>
      <Caption className="mt-1 mb-3">Only approved clinical information is used.</Caption>
      <div className="border-t border-border-strong">
        {emilyReport.sources.map((s) => (
          <label
            key={s.label}
            className="grid grid-cols-[20px_minmax(0,1fr)_auto] items-center gap-2.5 border-b border-border py-3"
          >
            <input type="checkbox" defaultChecked className="m-0 size-4 accent-accent" />
            <span>
              <span className="font-semibold">{s.label}</span>
              <span className="block text-caption font-medium text-ink-500">{s.detail}</span>
            </span>
            <span className="text-small font-semibold text-accent">View</span>
          </label>
        ))}
      </div>
      <Button className="mt-4 w-full" onClick={regenerate}>
        <PenNib />
        Generate draft report
      </Button>
      <Caption className="mt-2.5">
        Draft generated from {emilyReport.sources.length} sources. Regenerating replaces unedited
        sections only.
      </Caption>
    </Card>
  );
}

export function ReportDraft() {
  const { reviewed, approved } = useDemoStore((s) => s.report);
  const setReviewed = useDemoStore((s) => s.setReportReviewed);
  const approve = useDemoStore((s) => s.approveReport);

  return (
    <div className="flex flex-col gap-4">
      <article
        aria-label="Draft progress report"
        className={cn(draftSurface(approved), "px-10 pt-6 pb-7")}
      >
        <div className="pb-4.5">
          {approved ? (
            <ApprovedLabel meta="Audit entry created">
              Approved by {emilyReport.clinician} · Finalised
            </ApprovedLabel>
          ) : (
            <DraftLabel meta={emilyReport.generatedAt} />
          )}
        </div>

        <p className="eyebrow">Kestrel Allied Health · Occupational Therapy</p>
        <h2 className="mt-1.5 mb-4 headline text-report-title">Progress Report</h2>
        <dl className="mb-2 grid overflow-hidden rounded-control border border-border bg-surface sm:grid-cols-2">
          {emilyReport.details.map((d, i) => (
            <div
              key={d.label}
              className={cn(
                "grid grid-cols-[116px_minmax(0,1fr)] gap-3 border-border px-3.5 py-2.25 text-small",
                i < emilyReport.details.length - 2 && "border-b",
              )}
            >
              <dt className="text-ink-500">{d.label}</dt>
              <dd className="m-0">{d.value}</dd>
            </div>
          ))}
        </dl>

        <ReportSection title="Current Goals" editable={!approved}>
          {emilyReport.goals.map((g, i) => (
            <div
              key={g.text}
              className="grid grid-cols-[24px_minmax(0,1fr)_150px] items-baseline gap-2.5 py-1.5"
            >
              <span className="font-serif text-report-heading text-ink-500">{i + 1}</span>
              <span>{g.text}</span>
              <span className="inline-flex items-center gap-1.5 text-caption font-semibold text-ink-700">
                <i
                  className={cn("size-2 rounded-full", goalStatusDot[g.status])}
                  aria-hidden="true"
                />
                {g.status}
              </span>
            </div>
          ))}
        </ReportSection>
        <ReportSection title="Interventions Delivered" editable={!approved}>
          <Bullets items={emilyReport.interventions} />
        </ReportSection>
        <ReportSection title="Observed Progress" editable={!approved}>
          <Bullets items={emilyReport.progress} />
          <CopmFigure />
        </ReportSection>
        <ReportSection title="Barriers" editable={!approved}>
          <p>{emilyReport.barriers}</p>
        </ReportSection>
        <ReportSection title="Recommended Next Steps" editable={!approved}>
          <Bullets items={emilyReport.nextSteps} />
        </ReportSection>
      </article>

      <Card className="flex flex-wrap items-center justify-between gap-3 px-5 py-3.5">
        <label className="flex cursor-pointer items-center gap-2.5 text-small">
          <input
            type="checkbox"
            checked={reviewed}
            disabled={approved}
            onChange={(e) => setReviewed(e.target.checked)}
            className="m-0 size-4 accent-accent"
          />
          <span className="font-semibold">I have reviewed all sections</span>
        </label>
        <div className="flex flex-wrap gap-2">
          <Button variant="ghost">Export PDF</Button>
          <Button disabled={approved}>Save draft</Button>
          <Button variant="primary" disabled={!reviewed || approved} onClick={approve}>
            {approved ? "Finalised" : "Approve & finalise"}
          </Button>
        </div>
      </Card>
    </div>
  );
}
