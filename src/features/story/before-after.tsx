"use client";

import { AiMark } from "@/components/ai/marks";
import { ButtonLink } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { preparedBriefing } from "@/data/story";
import { useDemoStore } from "@/state/demo-store";
import { figures, startFigures, type StoryFigures } from "@/state/story-selectors";
import { useStoryAi } from "@/state/use-story-ai";

type Row = {
  measure: string;
  key: keyof StoryFigures;
  why: string;
  time: string;
};

const fromNote: Row[] = [
  {
    measure: "Sarah's notes to write",
    key: "sarahNotes",
    why: "Sarah approved a note.",
    time: "10:46",
  },
  {
    measure: "Notes due across the team",
    key: "teamNotes",
    why: "The same approval, counted once for the team.",
    time: "10:46",
  },
  {
    measure: "Follow-ups with no owner",
    key: "unowned",
    why: "Sarah confirmed a task for the admin team.",
    time: "10:49",
  },
  {
    measure: "Sarah's workload score",
    key: "sarahScore",
    why: "Documentation carries fewer points. At Risk starts at 80.",
    time: "10:46",
  },
];

const fromDay: Row[] = [
  {
    measure: "Tasks escalated",
    key: "escalated",
    why: "A task passed 3 working days late and went to Grace Liu.",
    time: "08:00",
  },
  {
    measure: "Follow-ups overdue",
    key: "followUps",
    why: "A client follow-up was due yesterday and is still open.",
    time: "08:00",
  },
];

function LedgerRow({ row, now, onAudit }: { row: Row; now: StoryFigures; onAudit: () => void }) {
  return (
    <div className="grid gap-x-6 gap-y-1 border-t border-border py-4 md:grid-cols-12 md:items-baseline">
      <div className="font-semibold md:col-span-3">{row.measure}</div>
      <div className="flex items-baseline gap-3 md:col-span-2">
        <span className="headline text-stat font-normal text-ink-500">
          {String(startFigures[row.key])}
        </span>
        <span className="text-small text-ink-500">to</span>
        <span className="headline text-stat font-normal">{String(now[row.key])}</span>
      </div>
      <p className="text-small text-ink-700 md:col-span-5">{row.why}</p>
      <div className="md:col-span-2 md:text-right">
        <button
          type="button"
          onClick={onAudit}
          aria-label={`Open audit trail, entry at ${row.time}`}
          className="cursor-pointer font-mono text-caption font-medium text-accent hover:underline"
        >
          {row.time}
        </button>
      </div>
    </div>
  );
}

export function BeforeAfter() {
  const caseNotes = useDemoStore((s) => s.caseNotes);
  const tasks = useDemoStore((s) => s.tasks);
  const story = useDemoStore((s) => s.story);
  const openAudit = useDemoStore((s) => s.setAuditOpen);

  const now = figures({ caseNotes, tasks, story });
  const moved = (r: Row) => now[r.key] !== startFigures[r.key];
  const noteRows = fromNote.filter(moved);
  const dayRows = fromDay.filter(moved);
  const changes = [...noteRows, ...dayRows].map((r) => ({
    measure: r.measure,
    before: startFigures[r.key],
    now: now[r.key],
  }));

  const summary = useStoryAi<string>(
    `before-after:${JSON.stringify(changes)}`,
    {
      kind: "change",
      facts: {
        changes,
        cause: "Sarah Thompson, the treating clinician, approved Oliver Grant's session note",
        stillTrue:
          "Sarah has 27 active clients against a capacity of 25, including 6 high-complexity clients",
      },
    },
    preparedBriefing.changed,
  );

  if (changes.length === 0) {
    return (
      <section className="max-w-200">
        <h1 className="headline text-display">Before and after</h1>
        <p className="mt-2 text-body text-ink-700">
          Nothing has changed yet. Approve a note or move a follow-up, and what changes will appear
          here with the reason and its audit entry.
        </p>
        <ButtonLink href="/" className="mt-4">
          Back to Overview
        </ButtonLink>
      </section>
    );
  }

  return (
    <>
      <header className="mb-8 max-w-200">
        <h1 className="headline text-display">Before and after</h1>
        <div className="mt-3">
          <AiMark source="Figures come from rules and the audit trail">AI summary</AiMark>
        </div>
        <p className="mt-1 text-h2 leading-7 font-normal text-ink-700">
          {summary.data ?? "AI is summarising what changed…"}
        </p>
      </header>

      {noteRows.length > 0 && (
        <Card aria-labelledby="from-note" className="px-6 pt-5 pb-2">
          <h2 id="from-note" className="headline text-h2">
            Because of what Sarah approved and confirmed
          </h2>
          <p className="mt-0.5 mb-4 text-small text-ink-700">
            It also prepared a report draft, a form and proposed follow-ups.
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
          {noteRows.map((r) => (
            <LedgerRow key={r.measure} row={r} now={now} onAudit={() => openAudit(true)} />
          ))}
        </Card>
      )}

      <div className="mt-6 grid items-start gap-6 xl:grid-cols-12">
        {dayRows.length > 0 && (
          <Card aria-labelledby="from-day" className="px-6 pt-5 pb-2 xl:col-span-8">
            <h2 id="from-day" className="headline text-h2">
              Because a day passed
            </h2>
            <p className="mt-0.5 mb-4 text-small text-ink-700">
              Automation rules acted without anyone having to remember.
            </p>
            {dayRows.map((r) => (
              <LedgerRow key={r.measure} row={r} now={now} onAudit={() => openAudit(true)} />
            ))}
          </Card>
        )}
        <Card aria-labelledby="same" className="px-6 pt-5 pb-5 xl:col-span-4">
          <h2 id="same" className="headline text-h2">
            What hasn&apos;t changed
          </h2>
          <p className="mt-2 text-small leading-5.5 text-ink-700">
            Sarah still has 27 active clients against a capacity of 25, including 6 high-complexity
            clients. That needs a caseload decision, not a tidier backlog.
          </p>
          <ButtonLink href="/team-capacity" className="mt-3.5">
            Open team capacity
          </ButtonLink>
        </Card>
      </div>
    </>
  );
}
