"use client";

import { ArrowRight, CornerDownLeft, Lock, X } from "lucide-react";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { PenNib } from "@/components/ai/provenance";
import { Caption } from "@/components/ui/card";
import type { KeyStatus } from "@/lib/ai/engine";
import { answerQuestion, roleQuestions } from "@/lib/assistant";
import { answerLocally, smallTalk } from "@/lib/knowledge/local";
import type { Answer, LiveState } from "@/lib/knowledge/state";
import { useDemoStore } from "@/state/demo-store";

type Exchange = {
  id: number;
  question: string;
  answer: Answer | null;
  engine: string;
  toolCalls: string[];
  notice: string | null;
};

type LiveResponse =
  | {
      ok: true;
      answer: Answer;
      provider: string;
      model: string;
      toolCalls: string[];
      mode: "instant" | "records-first" | "tool-loop";
    }
  | { ok: false; error: string };

type Resolved = Omit<Exchange, "id" | "question">;

const modeLabel = { instant: "no AI call", "records-first": "1 AI call", "tool-loop": "tool loop" };

/** Answers for this tab, keyed by question and demo state: asking again costs no call. */
const answerCache = new Map<string, Resolved>();

function liveState(): LiveState {
  const s = useDemoStore.getState();
  return {
    role: s.role,
    tasks: s.tasks,
    referralStatus: s.referrals,
    noteModes: Object.fromEntries(Object.entries(s.caseNotes).map(([id, n]) => [id, n.mode])),
    forms: s.forms,
    suggestions: s.suggestions,
    reminders: s.reminders,
    reports: s.reports,
    reportApproved: s.report.approved,
    automations: s.automations,
    audit: s.audit.slice(0, 40),
  };
}

let statusRequest: Promise<KeyStatus | null> | null = null;

function aiStatus() {
  statusRequest ??= fetch("/api/ai/status")
    .then((res) => res.json() as Promise<KeyStatus>)
    .catch(() => null);
  return statusRequest;
}

/**
 * Cheapest path first: small talk and repeat questions answer instantly; everything else goes
 * to live AI (records fetched first, one call) or, without a working key, to the local tools.
 */
export async function resolveQuestion(question: string): Promise<Resolved> {
  const state = liveState();
  const talk = smallTalk(question, state);
  if (talk) return { answer: talk, engine: "Instant · no AI call", toolCalls: [], notice: null };

  // Drafting an email keeps its prepared draft so the text box always appears.
  if (/\bemail\b|write to|message to/i.test(question)) {
    return {
      answer: answerQuestion(question, state),
      engine: "Prepared draft",
      toolCalls: [],
      notice: null,
    };
  }

  // Any demo action adds an audit entry, so the cache never serves a stale answer.
  const key = `${state.role}|${state.audit.length}|${question.trim().toLowerCase()}`;
  const cached = answerCache.get(key);
  if (cached) return { ...cached, engine: `${cached.engine} · cached` };

  const status = await aiStatus();
  let notice: string | null = null;
  if (status?.state === "valid") {
    try {
      const res = await fetch("/api/assistant", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ question, state }),
      });
      const data = (await res.json()) as LiveResponse;
      if (data.ok) {
        const resolved: Resolved = {
          answer: data.answer,
          engine: `Live AI · ${data.provider} · ${data.model} · ${modeLabel[data.mode]}`,
          toolCalls: data.toolCalls,
          notice: null,
        };
        answerCache.set(key, resolved);
        return resolved;
      }
      notice = `Live AI unavailable (${data.error}). Answered from records instead.`;
    } catch {
      notice = "Live AI unreachable. Answered from records instead.";
    }
  }

  const local = answerLocally(question, state);
  return {
    answer: local.answer,
    engine: status?.state === "valid" ? "Records" : "Records · no AI key",
    toolCalls: local.toolCalls.filter((t) => t !== "curated"),
    notice,
  };
}

const pending = (question: string): Exchange => ({
  id: Date.now() + Math.random(),
  question,
  answer: null,
  engine: "",
  toolCalls: [],
  notice: null,
});

/**
 * "Ask Medisense": answers any question about the demo records. With a provider key the model
 * reads the records through tools (like an MCP server); without one, the tools run locally.
 * It reads only; people act. Mounted fresh each time it opens.
 */
export function AssistantPanel({
  initialQuestion,
  onClose,
}: {
  initialQuestion: string;
  onClose: () => void;
}) {
  const [question, setQuestion] = useState("");
  // A question typed in the top bar starts resolving as soon as the panel opens.
  const [initial] = useState(() => {
    const text = initialQuestion.trim();
    return text ? { exchange: pending(text), result: resolveQuestion(text) } : null;
  });
  const [history, setHistory] = useState<Exchange[]>(() => (initial ? [initial.exchange] : []));
  const inputRef = useRef<HTMLInputElement>(null);
  const role = useDemoStore((s) => s.role);
  const questions = roleQuestions[role];
  const asked = new Set(history.map((h) => h.question));
  const next = questions.filter((q) => !asked.has(q)).slice(0, 3);
  const busy = history.some((h) => !h.answer);

  async function fill(exchange: Exchange) {
    const result = await resolveQuestion(exchange.question);
    setHistory((h) => h.map((x) => (x.id === exchange.id ? { ...x, ...result } : x)));
  }

  function ask(q: string) {
    const text = q.trim();
    if (!text || busy) return;
    const exchange = pending(text);
    setHistory((h) => [exchange, ...h]);
    setQuestion("");
    void fill(exchange);
  }

  useEffect(() => {
    if (!initial) return;
    let active = true;
    void initial.result.then((result) => {
      if (active) {
        setHistory((h) => h.map((x) => (x.id === initial.exchange.id ? { ...x, ...result } : x)));
      }
    });
    return () => {
      active = false;
    };
  }, [initial]);

  useEffect(() => {
    inputRef.current?.focus();
    const onKey = (event: KeyboardEvent) => event.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  const [featured, ...popular] = questions;

  return (
    <>
      <button
        type="button"
        aria-label="Close assistant"
        tabIndex={-1}
        onClick={onClose}
        className="fixed inset-0 z-40 cursor-default bg-ink-900/24"
      />
      <aside
        role="dialog"
        aria-modal="true"
        aria-label="Ask Medisense AI"
        className="fixed inset-y-0 right-0 z-41 flex w-130 max-w-full flex-col overflow-hidden rounded-l-sheet bg-canvas shadow-overlay"
      >
        <header className="bg-sidebar px-6 pt-6 pb-5">
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-center gap-3">
              <span className="flex size-10 flex-none items-center justify-center rounded-full border border-accent-fill/40 bg-accent-fill/10">
                <PenNib className="size-4 text-accent-fill" />
              </span>
              <div>
                <p className="eyebrow text-accent-fill">Medisense intelligence</p>
                <h2 className="mt-0.5 font-serif text-h2 font-medium text-sidebar-ink">
                  Ask Medisense AI
                </h2>
              </div>
            </div>
            <button
              type="button"
              aria-label="Close assistant"
              onClick={onClose}
              className="flex size-8 cursor-pointer items-center justify-center rounded-control text-sidebar-muted hover:bg-sidebar-hover hover:text-sidebar-ink"
            >
              <X className="size-4" strokeWidth={1.5} aria-hidden="true" />
            </button>
          </div>
          <p className="mt-3 text-small text-sidebar-muted">
            Your practice, in plain English. Ask about clients, the team, the schedule, reports or
            compliance.
          </p>
          <form
            className="mt-4 flex items-center gap-1.5 rounded-card border border-sidebar-border bg-sidebar-hover p-1.5 transition-colors focus-within:border-accent-fill/60"
            onSubmit={(e) => {
              e.preventDefault();
              ask(question);
            }}
          >
            <input
              ref={inputRef}
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              placeholder="e.g. Which NDIS clients have a plan review this month?"
              aria-label="Question"
              className="h-9 min-w-0 flex-1 bg-transparent px-2.5 text-small text-sidebar-ink outline-none placeholder:text-sidebar-faint focus-visible:shadow-none focus-visible:outline-none"
            />
            <button
              type="submit"
              disabled={!question.trim() || busy}
              className="flex h-9 cursor-pointer items-center gap-1.5 rounded-control bg-accent-fill px-3.5 text-small font-semibold text-on-accent transition-colors hover:bg-accent-fill-hover disabled:cursor-not-allowed disabled:opacity-40"
            >
              Ask
              <CornerDownLeft className="size-3.5" strokeWidth={1.75} aria-hidden="true" />
            </button>
          </form>
        </header>

        <div className="flex-1 overflow-y-auto px-6 py-5">
          {history.length === 0 && (
            <div>
              {featured && (
                <button
                  type="button"
                  onClick={() => ask(featured)}
                  className="group block w-full cursor-pointer rounded-card border border-accent-fill/50 bg-accent-tint px-4 py-3.5 text-left transition-colors hover:border-accent-fill"
                >
                  <span className="eyebrow text-accent">Start here</span>
                  <span className="mt-1 flex items-center justify-between gap-3 font-serif text-section font-medium text-ink-900">
                    {featured}
                    <ArrowRight
                      className="size-4 flex-none text-accent transition-transform group-hover:translate-x-0.5"
                      strokeWidth={1.5}
                      aria-hidden="true"
                    />
                  </span>
                  <span className="mt-0.5 block text-caption text-ink-700">
                    What Medisense does for your team, in one answer.
                  </span>
                </button>
              )}

              <div className="mt-6 mb-2 eyebrow">Most asked by {role.toLowerCase()}</div>
              <ol className="overflow-hidden rounded-card border border-border bg-surface surface-lift">
                {popular.map((q, i) => (
                  <li key={q} className="border-t border-border first:border-t-0">
                    <button
                      type="button"
                      onClick={() => ask(q)}
                      className="group flex w-full cursor-pointer items-center gap-3 px-4 py-3 text-left transition-colors hover:bg-canvas"
                    >
                      <span className="w-5 flex-none font-serif text-small text-accent">
                        {String(i + 1).padStart(2, "0")}
                      </span>
                      <span className="flex-1 text-small font-medium text-ink-900">{q}</span>
                      <ArrowRight
                        className="size-3.5 flex-none text-ink-400 transition-transform group-hover:translate-x-0.5 group-hover:text-accent"
                        strokeWidth={1.5}
                        aria-hidden="true"
                      />
                    </button>
                  </li>
                ))}
              </ol>
              <p className="mt-3 text-caption text-ink-500">
                Or ask in your own words. Every answer comes from your Medisense records and takes
                you straight to where you can act.
              </p>
            </div>
          )}

          {history.map(({ id, question: q, answer, engine, toolCalls, notice }, index) => (
            <section key={id} className="mb-7">
              <div className="flex justify-end">
                <p className="max-w-[85%] rounded-card rounded-br-control bg-sidebar px-3.5 py-2 text-small text-sidebar-ink">
                  {q}
                </p>
              </div>

              <article className="mt-3 overflow-hidden rounded-card border border-l-2 border-border border-l-accent-fill bg-surface shadow-hairline">
                <div className="flex items-center justify-between gap-3 border-b border-border px-4 py-2.5">
                  <span className="flex items-center gap-1.5 eyebrow text-brass">
                    <PenNib className="size-3.5 text-brass" />
                    Medisense AI
                  </span>
                  {answer && (
                    <span
                      className="text-caption text-ink-500"
                      title={[engine, toolCalls.join(", "), notice].filter(Boolean).join(" · ")}
                    >
                      From Medisense records
                    </span>
                  )}
                </div>

                {!answer ? (
                  <div className="flex flex-col gap-2.5 px-4 py-4" aria-label="Reading the records">
                    <span className="h-4 w-3/5 animate-pulse rounded-tag bg-surface-sunken" />
                    <span className="h-3 w-full animate-pulse rounded-tag bg-surface-sunken" />
                    <span className="h-3 w-4/5 animate-pulse rounded-tag bg-surface-sunken" />
                    <span className="mt-1 text-caption text-ink-500">Reading your records…</span>
                  </div>
                ) : (
                  <div className="px-4 pt-3.5 pb-3">
                    <h3 className="font-serif text-section font-medium text-ink-900">
                      {answer.title}
                    </h3>
                    <p className="mt-1.5 text-small leading-relaxed text-ink-700">{answer.intro}</p>

                    {answer.items.length > 0 && (
                      <ol className="mt-3 flex flex-col gap-0.5">
                        {answer.items.map((item, i) => {
                          const marker = (
                            <span className="mt-0.5 flex size-5 flex-none items-center justify-center rounded-full bg-accent-tint text-eyebrow font-semibold text-accent">
                              {i + 1}
                            </span>
                          );
                          return (
                            <li key={`${i}-${item.label}`}>
                              {item.href ? (
                                <Link
                                  href={item.href}
                                  onClick={onClose}
                                  className="group -mx-2 flex items-start gap-2.5 rounded-control px-2 py-2 transition-colors hover:bg-canvas hover:no-underline"
                                >
                                  {marker}
                                  <span className="min-w-0 flex-1">
                                    <span className="block text-small font-semibold text-ink-900 group-hover:text-accent">
                                      {item.label}
                                    </span>
                                    {item.detail && <Caption>{item.detail}</Caption>}
                                  </span>
                                  <ArrowRight
                                    className="mt-1 size-3.5 flex-none text-ink-400 transition-transform group-hover:translate-x-0.5 group-hover:text-accent"
                                    strokeWidth={1.5}
                                    aria-hidden="true"
                                  />
                                </Link>
                              ) : item.detail ? (
                                <div className="-mx-2 flex items-start gap-2.5 px-2 py-2">
                                  {marker}
                                  <span className="min-w-0 flex-1">
                                    <span className="block text-small font-semibold text-ink-900">
                                      {item.label}
                                    </span>
                                    <Caption>{item.detail}</Caption>
                                  </span>
                                </div>
                              ) : (
                                <button
                                  type="button"
                                  onClick={() => ask(item.label)}
                                  className="group -mx-2 flex w-[calc(100%+1rem)] cursor-pointer items-center gap-2.5 rounded-control px-2 py-2 text-left transition-colors hover:bg-canvas"
                                >
                                  {marker}
                                  <span className="flex-1 text-small font-semibold text-ink-900 group-hover:text-accent">
                                    {item.label}
                                  </span>
                                  <ArrowRight
                                    className="size-3.5 flex-none text-ink-400 group-hover:text-accent"
                                    strokeWidth={1.5}
                                    aria-hidden="true"
                                  />
                                </button>
                              )}
                            </li>
                          );
                        })}
                      </ol>
                    )}

                    {answer.draft && (
                      <textarea
                        readOnly
                        rows={10}
                        value={answer.draft}
                        aria-label="Draft email"
                        className="mt-3 w-full resize-y rounded-control border border-border-strong bg-surface-sunken px-3 py-2 text-small text-ink-900"
                      />
                    )}

                    <p className="mt-3 border-t border-border pt-2.5 text-caption text-ink-500">
                      AI answer. Check before acting; a person makes every decision.
                    </p>
                  </div>
                )}
              </article>

              {index === 0 && answer && next.length > 0 && (
                <div className="mt-4">
                  <div className="mb-2 eyebrow">Ask next</div>
                  <div className="flex flex-wrap gap-1.5">
                    {next.map((n) => (
                      <button
                        key={n}
                        type="button"
                        onClick={() => ask(n)}
                        disabled={busy}
                        className="cursor-pointer rounded-full border border-border bg-surface px-3 py-1.5 text-left text-caption font-semibold text-ink-700 transition-colors hover:border-accent-fill hover:bg-accent-tint hover:text-accent disabled:cursor-wait disabled:opacity-60"
                      >
                        {n}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </section>
          ))}
        </div>

        <footer className="flex items-center gap-2 border-t border-border bg-surface px-6 py-3 text-caption text-ink-500">
          <Lock className="size-3.5 text-accent" strokeWidth={1.5} aria-hidden="true" />
          Private to Medisense · read-only · every answer is logged
        </footer>
      </aside>
    </>
  );
}
