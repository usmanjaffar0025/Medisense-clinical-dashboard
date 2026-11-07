"use client";

import { ChevronLeft, ChevronRight, History, SendHorizontal } from "lucide-react";
import Link from "next/link";
import { useRef, useState } from "react";
import { AiMark } from "@/components/ai/marks";
import { resolveQuestion } from "@/components/shell/assistant-panel";
import { aiQuestions } from "@/data/story";
import { clinicians } from "@/data/clinicians";
import { currentUser } from "@/data/organisation";
import { TODAY } from "@/lib/clock";
import { cn } from "@/lib/cn";
import { useDemoStore } from "@/state/demo-store";
import { Panel } from "./blue-overview";

const DAY = 86_400_000;
const WEEKDAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const MONTHS = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

export function MonthCalendar({ className }: { className?: string }) {
  const dayOffset = useDemoStore((s) => s.story.dayOffset);
  const today = new Date(TODAY + dayOffset * DAY);
  const [shift, setShift] = useState(0);
  const first = new Date(Date.UTC(today.getUTCFullYear(), today.getUTCMonth() + shift, 1));
  const year = first.getUTCFullYear();
  const month = first.getUTCMonth();
  const start = first.getUTCDay();
  const length = new Date(Date.UTC(year, month + 1, 0)).getUTCDate();
  const isThisMonth = shift === 0;
  const cells = Array.from(
    { length: Math.ceil((start + length) / 7) * 7 },
    (_, i) => i - start + 1,
  );

  return (
    <section
      aria-label="Calendar"
      className={cn(
        "flex flex-col rounded-card border border-border bg-surface p-5 surface-lift",
        className,
      )}
    >
      <div className="mb-4 flex items-center justify-between">
        <h2 className="headline text-section" aria-live="polite">
          {MONTHS[month]} {year}
        </h2>
        <div className="flex gap-1">
          <button
            type="button"
            aria-label="Previous month"
            onClick={() => setShift(shift - 1)}
            className="flex size-7 cursor-pointer items-center justify-center rounded-control text-ink-700 hover:bg-canvas"
          >
            <ChevronLeft className="size-4" aria-hidden="true" />
          </button>
          <button
            type="button"
            aria-label="Next month"
            onClick={() => setShift(shift + 1)}
            className="flex size-7 cursor-pointer items-center justify-center rounded-control text-ink-700 hover:bg-canvas"
          >
            <ChevronRight className="size-4" aria-hidden="true" />
          </button>
        </div>
      </div>
      <div className="grid flex-1 grid-cols-7 content-between gap-y-1 text-center text-caption">
        {WEEKDAYS.map((d) => (
          <span key={d} className="pb-1 font-medium text-ink-500">
            {d}
          </span>
        ))}
        {cells.map((n, i) => {
          const inMonth = n >= 1 && n <= length;
          const display = new Date(Date.UTC(year, month, n)).getUTCDate();
          const current = inMonth && isThisMonth && n === today.getUTCDate();
          return (
            <span
              key={i}
              aria-current={current ? "date" : undefined}
              className={cn(
                "mx-auto flex size-7 items-center justify-center rounded-full",
                current && "bg-accent-fill font-semibold text-on-accent",
                !current && !inMonth && "text-ink-400 opacity-60",
              )}
            >
              {display}
            </span>
          );
        })}
      </div>
    </section>
  );
}

/** Real upcoming supervision: no sessions fall on the demo day, so today alone would be empty. */
export function UpcomingSupervision({ className }: { className?: string }) {
  const daysAway = (note: string) => Number(note.match(/\d+/)?.[0] ?? 99);
  const due = clinicians
    .filter((c) => c.supervisionDue)
    .sort((a, b) => daysAway(a.supervisionNote) - daysAway(b.supervisionNote))
    .slice(0, 4);
  return (
    <Panel
      className={className}
      title="Upcoming supervision"
      action={{ href: "/schedule", label: "View calendar" }}
    >
      <ul className="divide-y divide-border">
        {due.map((c) => (
          <li key={c.id} className="flex items-center gap-3 py-2.5 first:pt-0 last:pb-0">
            <span className="w-20 flex-none text-caption font-medium whitespace-nowrap text-ink-700">
              {c.nextSupervision}
            </span>
            <i aria-hidden="true" className="h-8 w-0.5 flex-none rounded-full bg-available-dot" />
            <span className="min-w-0 flex-1">
              <Link
                href={`/supervision/${c.id}`}
                className="block truncate text-small font-medium text-ink-900"
              >
                {c.name}
              </Link>
              <span className="block truncate text-caption text-ink-500">{c.discipline}</span>
            </span>
            <span className="flex-none rounded-tag bg-monitor-bg px-1.5 py-0.5 text-eyebrow leading-4 font-semibold text-monitor">
              {c.supervisionNote}
            </span>
          </li>
        ))}
      </ul>
    </Panel>
  );
}

export function Notifications({ className }: { className?: string }) {
  const notices = useDemoStore((s) => s.story.notices).filter((n) => n.to === "Leadership");
  const audit = useDemoStore((s) => s.audit);
  const setAuditOpen = useDemoStore((s) => s.setAuditOpen);
  const activity = audit.slice(0, Math.max(0, 3 - notices.length));
  return (
    <section
      aria-label="Notifications"
      className={cn("rounded-card border border-border bg-surface p-5 surface-lift", className)}
    >
      <div className="mb-4 flex items-center justify-between gap-3">
        <h2 className="headline text-section">Notifications</h2>
        <button
          type="button"
          onClick={() => setAuditOpen(true)}
          className="cursor-pointer text-caption font-medium text-accent hover:text-accent-hover"
        >
          View all
        </button>
      </div>
      <ul className="flex flex-col gap-3">
        {notices.slice(0, 3).map((n) => (
          <li key={n.id} className="text-caption leading-4">
            <Link href={n.href} className="font-medium text-ink-900">
              {n.text}
            </Link>
          </li>
        ))}
        {activity.map((a) => (
          <li key={a.id} className="flex gap-2.5">
            <span
              aria-hidden="true"
              className="flex size-7 flex-none items-center justify-center rounded-full bg-accent-tint text-accent"
            >
              <History className="size-3.5" strokeWidth={1.75} />
            </span>
            <span className="min-w-0 text-caption leading-4">
              <span className="line-clamp-2 text-ink-900">
                {a.action}: {a.object}
              </span>
              <span className="text-ink-500">
                {a.time}, {a.actor}
              </span>
            </span>
          </li>
        ))}
      </ul>
    </section>
  );
}

type Message = { id: number; question: string; title?: string; intro?: string };

/** The same assistant as the panel in the top bar, kept on the page. */
export function AssistantCard({ className }: { className?: string }) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [draft, setDraft] = useState("");
  const nextId = useRef(0);

  function ask(question: string) {
    const q = question.trim();
    if (!q) return;
    const id = nextId.current++;
    setDraft("");
    setMessages((m) => [...m, { id, question: q }]);
    void resolveQuestion(q).then((r) => {
      setMessages((m) =>
        m.map((x) =>
          x.id === id
            ? { ...x, title: r.answer?.title ?? "", intro: r.answer?.intro ?? "No answer found." }
            : x,
        ),
      );
    });
  }

  const latest = messages[messages.length - 1];

  return (
    <section
      aria-label="Ask Medisense AI"
      className={cn(
        "flex flex-col rounded-card border border-border bg-surface p-5 surface-lift",
        className,
      )}
    >
      <AiMark>Ask Medisense AI</AiMark>
      <div className="mt-3 flex-1" role="status">
        {latest ? (
          <>
            <p className="ml-auto w-fit max-w-[90%] rounded-control bg-canvas px-2.5 py-1.5 text-caption">
              {latest.question}
            </p>
            {latest.intro === undefined ? (
              <p className="mt-2 text-caption text-ink-500">AI is reading your records…</p>
            ) : (
              <div className="mt-2 rounded-control bg-accent-tint px-2.5 py-2 text-caption leading-4.5">
                {latest.title && <p className="font-semibold">{latest.title}</p>}
                <p>{latest.intro}</p>
              </div>
            )}
          </>
        ) : (
          <p className="w-fit rounded-control bg-accent-tint px-2.5 py-2 text-caption leading-4.5">
            Hello {currentUser.firstName}. What would you like to know about your team?
          </p>
        )}
      </div>
      <div className="mt-3 flex flex-wrap gap-1.5">
        {aiQuestions.map((q) => (
          <button
            key={q}
            type="button"
            onClick={() => ask(q)}
            className="cursor-pointer rounded-control bg-accent-tint px-2.5 py-1.5 text-left text-caption font-medium text-accent hover:text-accent-hover"
          >
            {q}
          </button>
        ))}
      </div>
      <form
        onSubmit={(e) => {
          e.preventDefault();
          ask(draft);
        }}
        className="mt-3 flex h-10 items-center gap-1 rounded-control border border-border-strong pr-1 pl-3 focus-within:shadow-focus"
      >
        <input
          type="text"
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          aria-label="Ask anything about your team"
          placeholder="Ask anything…"
          className="min-w-0 flex-1 border-0 bg-transparent text-small outline-none placeholder:text-ink-500 focus-visible:shadow-none"
        />
        <button
          type="submit"
          aria-label="Send question"
          className="flex size-8 flex-none cursor-pointer items-center justify-center rounded-control text-accent hover:bg-accent-tint"
        >
          <SendHorizontal className="size-4" strokeWidth={1.75} aria-hidden="true" />
        </button>
      </form>
    </section>
  );
}
