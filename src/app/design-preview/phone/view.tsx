"use client";

import { CalendarDays, Car, Check, FileText, ListChecks, Mic, Pause, Square } from "lucide-react";
import { Fragment, type ReactNode } from "react";
import { PenNib } from "@/components/ai/provenance";
import { Tag } from "@/components/ui/tag";
import { cn } from "@/lib/cn";
import { PreviewBar } from "../_components/preview-bar";
import { dictation, noteSections, sarahDay } from "../_fixtures/story";

/** Proposed `size="lg"` button: the 44 px touch target the existing sizes don't reach. */
const touch =
  "inline-flex h-11 min-w-11 cursor-pointer items-center justify-center gap-2 rounded-control border px-4 text-body font-semibold whitespace-nowrap";
const touchPrimary = `${touch} border-accent-fill bg-accent-fill text-on-accent`;
const touchSecondary = `${touch} border-border-strong bg-surface text-ink-900`;

function Tabs({ active }: { active: string }) {
  const tabs = [
    { label: "My day", icon: CalendarDays },
    { label: "AI notes", icon: FileText },
    { label: "Tasks", icon: ListChecks },
    { label: "Ask AI", icon: PenNib },
  ];
  return (
    <nav aria-label="Phone navigation" className="grid h-16 flex-none grid-cols-4 bg-sidebar">
      {tabs.map(({ label, icon: Icon }) => (
        <span
          key={label}
          aria-current={label === active ? "page" : undefined}
          className={cn(
            "flex flex-col items-center justify-center gap-1 text-caption font-medium",
            label === active ? "text-accent-fill" : "text-sidebar-muted",
          )}
        >
          <Icon className="size-5" />
          {label}
        </span>
      ))}
    </nav>
  );
}

function Device({ title, children }: { title: string; children: ReactNode }) {
  return (
    <figure className="m-0 flex-none">
      <figcaption className="mb-2 font-mono text-caption text-ink-700">{title}</figcaption>
      <div className="flex h-211 w-97.5 flex-col overflow-hidden rounded-sheet border border-border-strong bg-canvas shadow-overlay">
        {children}
      </div>
    </figure>
  );
}

function PhoneHeader({ title, detail }: { title: string; detail?: string }) {
  return (
    <header className="flex-none border-b border-border bg-surface px-4 pt-4 pb-3">
      <h2 className="headline text-h2">{title}</h2>
      {detail && <p className="text-small text-ink-700">{detail}</p>}
    </header>
  );
}

function MyDayPhone() {
  return (
    <Device title="1. My Day">
      <PhoneHeader
        title="Good morning, Sarah."
        detail="Five visits, about 50 minutes of driving."
      />
      <div className="min-h-0 flex-1 overflow-y-auto">
        {sarahDay.map((v) => (
          <Fragment key={v.id}>
            {v.driveBefore > 0 && (
              <p className="flex items-center gap-1.5 border-y border-border bg-surface-sunken px-4 py-1.5 text-caption font-medium text-ink-500">
                <Car className="size-3.5" strokeWidth={1.5} aria-hidden="true" />
                {v.driveBefore} min drive
              </p>
            )}
            <div
              className={cn(
                "px-4 py-3",
                v.state === "just-finished" && "bg-accent-tint py-4 shadow-rule-accent",
              )}
            >
              <div className="flex items-baseline justify-between gap-3">
                <span className="font-semibold">{v.client}</span>
                <span className="font-serif text-figure">{v.start}</span>
              </div>
              <p className="text-small text-ink-700">
                {v.place}
                {v.state === "done" && ", note approved"}
              </p>
              {v.state === "just-finished" && (
                <button type="button" className={cn(touchPrimary, "mt-3 w-full")}>
                  Write note with AI
                </button>
              )}
            </div>
          </Fragment>
        ))}
      </div>
      <Tabs active="My day" />
    </Device>
  );
}

function DictatePhone() {
  return (
    <Device title="2. Dictate">
      <PhoneHeader title="Oliver Grant" detail="Today, 9:30 to 10:15 am, Kedron" />
      <div className="min-h-0 flex-1 overflow-y-auto px-4 pt-4">
        <ol className="flex flex-col gap-2 text-body">
          {dictation.slice(0, 4).map((l) => (
            <li key={l}>{l}</li>
          ))}
          <li className="text-ink-500 italic">He tires after about ten</li>
        </ol>
      </div>
      {/* The bottom third of the screen is what a thumb reaches one-handed. */}
      <div className="flex-none border-t border-border bg-surface px-4 pt-3 pb-5">
        <p className="flex items-center justify-center gap-2 text-small font-semibold">
          <span aria-hidden="true" className="size-2 rounded-full bg-over-dot" />
          AI scribe listening, 0:48
        </p>
        <div className="mt-3 grid grid-cols-[1fr_auto_1fr] items-center gap-3">
          <button type="button" className={touchSecondary} aria-label="Type instead">
            Type
          </button>
          <button
            type="button"
            aria-label="Pause dictation"
            className="flex size-18 cursor-pointer items-center justify-center rounded-full border border-accent-fill bg-accent-fill text-on-accent"
          >
            <Pause className="size-7" strokeWidth={1.5} aria-hidden="true" />
          </button>
          <button type="button" className={touchSecondary}>
            <Square className="size-3.5" strokeWidth={2} aria-hidden="true" />
            Finish
          </button>
        </div>
      </div>
    </Device>
  );
}

function ReviewPhone() {
  return (
    <Device title="3. Review and approve">
      <PhoneHeader title="Oliver Grant" detail="AI draft, needs your approval" />
      <div className="min-h-0 flex-1 overflow-y-auto bg-draft px-4 pt-3 pb-4">
        {noteSections.map((section) => (
          <div key={section.id} className="border-b border-border py-3 last:border-b-0">
            <div className="flex items-center justify-between">
              <h3 className="font-serif text-section font-medium">{section.title}</h3>
              <button
                type="button"
                className="flex h-11 min-w-11 cursor-pointer items-center justify-end text-small font-semibold text-accent"
              >
                Edit
              </button>
            </div>
            <div className="flex flex-col gap-1.5">
              {section.sentences.map((s) => (
                <p key={s.id} className="text-body">
                  {s.edited ?? s.text}
                  <span className="ml-1 font-mono text-eyebrow font-medium text-accent">
                    L{s.line}
                  </span>
                </p>
              ))}
            </div>
          </div>
        ))}
      </div>
      <div className="flex-none border-t border-border bg-surface px-4 pt-3 pb-5">
        <button type="button" className={cn(touchPrimary, "w-full")}>
          Approve note
        </button>
      </div>
    </Device>
  );
}

function ApprovedPhone() {
  return (
    <Device title="4. What AI prepared">
      <PhoneHeader
        title="Note approved"
        detail="AI prepared these. Nothing has been sent or submitted."
      />
      <div className="min-h-0 flex-1 overflow-y-auto">
        {[
          [
            "NDIS progress report",
            "AI drafted 4 of 5 sections",
            "Review report",
            "Ready for review",
          ],
          [
            "Further assessment request",
            "AI filled 9 of 12 fields, 3 need you",
            "Check form",
            "Draft",
          ],
        ].map(([title, detail, action, tag]) => (
          <div key={title} className="border-b border-border bg-draft px-4 py-3.5">
            <div className="flex items-start justify-between gap-2">
              <span className="font-semibold">{title}</span>
              <Tag tone={tag === "Draft" ? "neutral" : "live"}>{tag}</Tag>
            </div>
            <p className="text-small text-ink-700">{detail}</p>
            <button type="button" className={cn(touchSecondary, "mt-2.5 w-full")}>
              {action}
            </button>
          </div>
        ))}
        <div className="bg-draft px-4 py-3.5">
          <span className="font-semibold">Upload the paediatrician report</span>
          <p className="text-small text-ink-700">Admin team, due Wed 21 Oct</p>
          <p className="mt-1 border-l-2 border-border-strong pl-2.5 text-small text-ink-700">
            She provided a new paediatrician report dated 14 October
          </p>
          <button type="button" className={cn(touchPrimary, "mt-2.5 w-full")}>
            <Check className="size-4" strokeWidth={2} aria-hidden="true" />
            Confirm task
          </button>
          <p className="mt-2 text-center text-small font-semibold text-accent">
            2 more follow-ups AI found
          </p>
        </div>
      </div>
      <Tabs active="AI notes" />
    </Device>
  );
}

const shellRules = [
  ["1280 px and up", "248 px sidebar with labels, 40 px page padding, 12-column grid."],
  [
    "1024 to 1279 px",
    "64 px icon rail with labels in tooltips, 24 px padding. Main column 960 px at 1024.",
  ],
  [
    "768 to 1023 px",
    "64 px icon rail, 24 px padding, content in one column. Main column 704 px at 768.",
  ],
  ["Below 768 px", "No rail. Bottom tab bar, 16 px padding, wide tables become stacked rows."],
];

export function PhoneView() {
  return (
    <>
      <PreviewBar href="/design-preview/phone" />
      <main data-scroll className="min-h-0 flex-1 overflow-y-auto px-4 py-8 md:px-10">
        <div className="flex flex-wrap gap-8 pb-4">
          <MyDayPhone />
          <DictatePhone />
          <ReviewPhone />
          <ApprovedPhone />
        </div>
        <section
          aria-labelledby="collapse"
          className="mt-8 max-w-240 border-t border-border-strong pt-5"
        >
          <h2 id="collapse" className="headline text-h2">
            How the desktop shell collapses
          </h2>
          <p className="mt-1 text-small text-ink-700">
            The other preview screens use these rules, so resizing the window shows them working.
            The phone frames above are static.
          </p>
          <dl className="mt-3">
            {shellRules.map(([size, rule]) => (
              <div
                key={size}
                className="grid gap-x-6 gap-y-0.5 border-t border-border py-2.5 text-small md:grid-cols-[160px_minmax(0,1fr)]"
              >
                <dt className="font-semibold">{size}</dt>
                <dd className="text-ink-700">{rule}</dd>
              </div>
            ))}
          </dl>
          <p className="mt-3 inline-flex items-center gap-2 font-mono text-caption text-ink-700">
            <Mic className="size-3.5" strokeWidth={1.5} aria-hidden="true" />
            Touch targets on these screens are at least 44 px. The dictation control is 72 px.
          </p>
        </section>
      </main>
    </>
  );
}
