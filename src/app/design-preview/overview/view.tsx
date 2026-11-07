"use client";

import Link from "next/link";
import { useState } from "react";
import { draftSurface } from "@/components/ai/provenance";
import { Button } from "@/components/ui/button";
import { colour } from "@/components/charts/chart-kit";
import { Sparkline } from "@/components/charts/sparkline";
import { CapacityMeter } from "@/components/ui/capacity-meter";
import { ButtonLink } from "@/components/ui/button";
import { Caption, Card } from "@/components/ui/card";
import { TableHeader, TableRow } from "@/components/ui/table";
import { cn } from "@/lib/cn";
import { AiMark, Changed, WorkloadTag } from "../_components/marks";
import { PreviewBar, usePreviewState } from "../_components/preview-bar";
import { ScreenTitle, Shell } from "../_components/shell";
import {
  aiBriefing,
  aiQuestions,
  beforeAfter,
  caseloadRows,
  orgFigures,
  story,
  weekLabels,
  type OverviewStage,
} from "../_fixtures/story";

type State = OverviewStage | "compare";

const COLUMNS = "minmax(150px,1fr) 104px 44px 84px 64px 48px 84px";

const statusColour = {
  "At Risk": colour.over,
  Watch: colour.monitor,
  Healthy: colour.accent,
};

/** The director's written briefing. It explains the figures and recommends; it never acts. */
function AiBriefing({ stage }: { stage: OverviewStage }) {
  const [open, setOpen] = useState<string | null>(null);
  const answer = aiQuestions.find((q) => q.q === open);
  return (
    <section
      aria-labelledby="ai-briefing"
      className={cn(draftSurface(false), "mb-6 px-5 pt-4 pb-4.5")}
    >
      <div className="flex flex-wrap items-start justify-between gap-x-6 gap-y-3">
        <div className="max-w-200 min-w-0 flex-1">
          <h2 id="ai-briefing" className="sr-only">
            AI briefing
          </h2>
          <AiMark state="Draft">AI briefing, recommendation only</AiMark>
          <p className="mt-1.5 headline text-h2 font-normal">{aiBriefing[stage]}</p>
        </div>
        {stage !== "start" && (
          <div className="flex flex-wrap items-center gap-2">
            {stage === "skipped" && (
              <ButtonLink href="/design-preview/time-skip">See what happened overnight</ButtonLink>
            )}
            <ButtonLink href="/design-preview/overview?state=compare" variant="primary">
              See before and after
            </ButtonLink>
          </div>
        )}
      </div>
      <div className="mt-3 flex flex-wrap items-center gap-2 border-t border-border pt-3">
        <span className="text-caption font-medium text-ink-500">Ask Medisense AI</span>
        {aiQuestions.map((q) => (
          <Button
            key={q.q}
            size="sm"
            aria-pressed={open === q.q}
            onClick={() => setOpen(open === q.q ? null : q.q)}
          >
            {q.q}
          </Button>
        ))}
      </div>
      {answer && (
        <div role="status" className="mt-3 max-w-200">
          <p className="text-small leading-5.5">{answer.a}</p>
          <Caption className="mt-0.5">
            {answer.source}. Nothing changes unless you act on it.
          </Caption>
        </div>
      )}
    </section>
  );
}

function Figures({ stage }: { stage: OverviewStage }) {
  return (
    <section
      aria-label="Key figures"
      className="grid grid-cols-2 gap-px overflow-hidden rounded-card border border-border bg-border lg:grid-cols-4"
    >
      {orgFigures.map((f) => {
        const now = f.figure[stage];
        const was = stage === "start" ? undefined : f.figure.start;
        const moved = was !== undefined && was !== now;
        return (
          <div key={f.id} className="flex min-h-33 flex-col gap-2 bg-surface px-6 py-5">
            <div className="text-small font-semibold text-ink-700">{f.label}</div>
            <div className="headline text-kpi font-normal">
              <Changed value={now} was={moved ? was : undefined} />
            </div>
            <Caption>{f.caption[stage]}</Caption>
          </div>
        );
      })}
    </section>
  );
}

function Caseload({ stage }: { stage: OverviewStage }) {
  return (
    <Card aria-labelledby="caseload-health" className="overflow-hidden">
      <div className="px-5 pt-5 pb-4">
        <h2 id="caseload-health" className="headline text-h2">
          Caseload health
        </h2>
        <p className="mt-1 max-w-140 text-small text-ink-700">
          Scored from capacity, complexity, documentation, follow-ups, supervision and admin load.
          The highest 5 of 12 clinicians.
        </p>
      </div>
      <div className="overflow-x-auto" role="table" aria-label="Caseload health by clinician">
        <div className="min-w-170">
          <TableHeader columns={COLUMNS}>
            <div role="columnheader">Clinician</div>
            <div role="columnheader">Capacity</div>
            <div role="columnheader" className="text-right">
              Notes
            </div>
            <div role="columnheader" className="text-right">
              Follow-ups
            </div>
            <div role="columnheader">Trend</div>
            <div role="columnheader" className="text-right">
              Score
            </div>
            <div role="columnheader">Status</div>
          </TableHeader>
          {caseloadRows.map((c) => {
            const score = c.score[stage];
            const notesMoved = c.notes[stage] !== c.notes.start;
            const scoreMoved = score !== c.score.start;
            const utilisation = Math.round((c.active / c.capacity) * 100);
            return (
              <TableRow
                key={c.id}
                columns={COLUMNS}
                className={cn(c.status === "At Risk" && "shadow-rule-over")}
              >
                <div role="cell" className="min-w-0 py-1.5">
                  {c.id === "sarah" ? (
                    <Link
                      href="/caseloads/sarah-thompson"
                      className="block truncate font-semibold text-ink-900 hover:text-accent"
                    >
                      {c.name}
                    </Link>
                  ) : (
                    <div className="truncate font-semibold">{c.name}</div>
                  )}
                  <div className="truncate text-caption text-ink-500">{c.meta}</div>
                </div>
                <div role="cell" className="flex flex-col gap-1.5 pr-1.5">
                  <div className="flex justify-between gap-1.5">
                    <span>
                      {c.active} / {c.capacity}
                    </span>
                    <span
                      className={
                        utilisation > 100 ? "font-semibold text-over" : "font-medium text-ink-700"
                      }
                    >
                      {utilisation}%
                    </span>
                  </div>
                  <CapacityMeter utilisation={utilisation} />
                </div>
                <div role="cell" className="text-right">
                  {c.notes[stage]}
                  {notesMoved && (
                    <span className="block text-caption font-medium text-ink-500">
                      was {c.notes.start}
                    </span>
                  )}
                </div>
                <div role="cell" className="text-right">
                  {c.followUps[stage]}
                </div>
                <div role="cell">
                  <Sparkline
                    values={[...c.history.slice(0, 11), score]}
                    labels={weekLabels}
                    colour={statusColour[c.status]}
                    height={30}
                    unit="score"
                  />
                </div>
                <div role="cell" className="text-right font-serif text-figure">
                  {score}
                  {scoreMoved && (
                    <span className="block font-sans text-caption font-medium text-ink-500">
                      was {c.score.start}
                    </span>
                  )}
                </div>
                <div role="cell">
                  <WorkloadTag status={c.status} />
                </div>
              </TableRow>
            );
          })}
        </div>
      </div>
      <Caption className="px-5 pt-3 pb-3.5">
        Scores come from configured rules, not AI, and AI explains them. They aren&apos;t clinical
        assessments.
      </Caption>
    </Card>
  );
}

function Attention({ stage }: { stage: OverviewStage }) {
  const start = stage === "start";
  const items = [
    {
      id: "capacity",
      urgent: true,
      title: "Sarah Thompson is At Risk.",
      detail: start
        ? "27 clients against a capacity of 25, 6 high-complexity, 4 notes overdue, 5 follow-ups due."
        : "27 clients against a capacity of 25, 6 high-complexity, 3 notes overdue, 5 follow-ups due.",
      action: "Review workload",
      href: "/caseloads/sarah-thompson",
    },
    {
      id: "follow",
      urgent: false,
      title: start ? "5 overdue follow-ups have no owner." : "4 overdue follow-ups have no owner.",
      detail: "Each one needs a person before it can move.",
      action: "Assign owners",
      href: "/clients-requiring-attention",
    },
    {
      id: "clients",
      urgent: false,
      title: "14 clients require review.",
      detail: "2 high priority. Based on visit gaps and plan dates.",
      action: "Open queue",
      href: "/clients-requiring-attention",
    },
  ];
  return (
    <Card aria-labelledby="needs-attention" className="flex h-full flex-col">
      <h2 id="needs-attention" className="px-5 pt-5 pb-3.5 headline text-h2">
        Needs your attention
      </h2>
      {items.map((item) => (
        <div key={item.id} className="flex flex-col gap-1 border-t border-border px-5 py-4">
          <div className={cn("font-semibold", item.urgent && "text-over")}>{item.title}</div>
          <div className="text-small text-ink-700">{item.detail}</div>
          <ButtonLink href={item.href} className="mt-2 self-start">
            {item.action}
          </ButtonLink>
        </div>
      ))}
      <p className="mt-auto rounded-b-card border-t border-border bg-surface-sunken px-5 pt-3.5 pb-4 text-caption font-medium text-ink-500">
        Operational indicators only, not clinical risk assessments.
      </p>
    </Card>
  );
}

function LedgerRow({
  row,
}: {
  row: { measure: string; before: string; after: string; why: string; audit: string };
}) {
  return (
    <div className="grid gap-x-6 gap-y-1 border-t border-border py-4 md:grid-cols-12 md:items-baseline">
      <div className="font-semibold md:col-span-3">{row.measure}</div>
      <div className="flex items-baseline gap-3 md:col-span-2">
        <span className="headline text-stat font-normal text-ink-500">{row.before}</span>
        <span className="sr-only">changed to</span>
        <span aria-hidden="true" className="text-small text-ink-500">
          to
        </span>
        <span className="headline text-stat font-normal">{row.after}</span>
      </div>
      <p className="text-small text-ink-700 md:col-span-5">{row.why}</p>
      <div className="md:col-span-2 md:text-right">
        <Link
          href="/design-preview/time-skip?state=audit"
          className="font-mono text-caption font-medium text-accent hover:underline"
          aria-label={`Open audit entry, ${row.audit}`}
        >
          {row.audit}
        </Link>
      </div>
    </div>
  );
}

function BeforeAndAfter() {
  return (
    <>
      <header className="mb-8 max-w-200">
        <h1 className="headline text-display">Before and after</h1>
        <div className="mt-3">
          <AiMark state="Draft" source="Figures come from rules and the audit trail">
            AI summary
          </AiMark>
        </div>
        <p className="mt-1 text-h2 leading-7 font-normal text-ink-700">
          Sarah approved one note on Tuesday. Four figures moved that morning, and two more moved
          when a day passed. Every change links to its audit entry.
        </p>
      </header>

      <Card aria-labelledby="from-note" className="px-6 pt-5 pb-2">
        <h2 id="from-note" className="headline text-h2">
          Because Sarah approved Oliver Grant&apos;s note
        </h2>
        <p className="mt-0.5 mb-4 text-small text-ink-700">
          Tuesday 20 October. It also prepared a report draft, a form and 3 follow-ups.
        </p>
        <div
          aria-hidden="true"
          className="hidden gap-x-6 pb-2 text-caption font-medium text-ink-500 md:grid md:grid-cols-12"
        >
          <span className="col-span-3">What moved</span>
          <span className="col-span-2">Before, then now</span>
          <span className="col-span-5">Why</span>
          <span className="col-span-2 text-right">Audit entry</span>
        </div>
        {beforeAfter.fromNote.map((r) => (
          <LedgerRow key={r.measure} row={r} />
        ))}
      </Card>

      <div className="mt-6 grid items-start gap-6 xl:grid-cols-12">
        <Card aria-labelledby="from-day" className="px-6 pt-5 pb-2 xl:col-span-8">
          <h2 id="from-day" className="headline text-h2">
            Because a day passed
          </h2>
          <p className="mt-0.5 mb-4 text-small text-ink-700">
            Wednesday 21 October. The platform&apos;s rules acted without anyone having to remember.
          </p>
          {beforeAfter.fromDay.map((r) => (
            <LedgerRow key={r.measure} row={r} />
          ))}
        </Card>
        <Card aria-labelledby="same" className="px-6 pt-5 pb-5 xl:col-span-4">
          <h2 id="same" className="headline text-h2">
            What hasn&apos;t changed
          </h2>
          <p className="mt-2 text-small leading-5.5 text-ink-700">{beforeAfter.unchanged}</p>
          <ButtonLink href="/team-capacity" className="mt-3.5">
            Open team capacity
          </ButtonLink>
        </Card>
      </div>
    </>
  );
}

export function OverviewView() {
  const [state] = usePreviewState<State>("start");
  const skipped = state === "skipped" || state === "compare";

  return (
    <>
      <PreviewBar href="/design-preview/overview" />
      <Shell
        persona="neil"
        active="Overview"
        section="Organisation"
        page={state === "compare" ? "Before and after" : "Overview"}
        date={skipped ? story.tomorrow : story.today}
        bellCount={skipped ? 1 : 0}
      >
        {state === "compare" ? (
          <BeforeAndAfter />
        ) : (
          <>
            <ScreenTitle
              display
              title="Good morning, Neil."
              description="12 clinicians and 184 active clients. One clinician is above configured capacity."
            />
            <AiBriefing stage={state} />
            <Figures stage={state} />
            <div className="mt-6 grid items-stretch gap-6 xl:grid-cols-12">
              <div className="min-w-0 xl:col-span-8">
                <Caseload stage={state} />
              </div>
              <div className="xl:col-span-4">
                <Attention stage={state} />
              </div>
            </div>
          </>
        )}
      </Shell>
    </>
  );
}
