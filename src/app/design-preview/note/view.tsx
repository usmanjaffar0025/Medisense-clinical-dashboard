"use client";

import { AlertCircle, Lock, Mic, MicOff, Pause, Play, Square } from "lucide-react";
import { useState } from "react";
import { draftSurface } from "@/components/ai/provenance";
import { Button, ButtonLink } from "@/components/ui/button";
import { Caption, Card } from "@/components/ui/card";
import { Tag, type TagTone } from "@/components/ui/tag";
import { cn } from "@/lib/cn";
import { AiMark, SourceLink } from "../_components/marks";
import { PreviewBar, usePreviewState } from "../_components/preview-bar";
import { Shell } from "../_components/shell";
import { dictation, missingPrompts, noteSections, visitDetails } from "../_fixtures/story";

type State =
  | "ready"
  | "listening"
  | "paused"
  | "complete"
  | "generating"
  | "draft"
  | "editing"
  | "edited"
  | "error"
  | "no-mic"
  | "approved"
  | "reopen";

const statusFor: Record<State, { label: string; tone: TagTone } | null> = {
  ready: null,
  listening: null,
  paused: null,
  complete: null,
  generating: null,
  error: null,
  "no-mic": null,
  draft: { label: "Ready for review", tone: "live" },
  editing: { label: "Ready for review", tone: "live" },
  edited: { label: "Ready for review", tone: "live" },
  approved: { label: "Approved", tone: "healthy" },
  reopen: { label: "Approved", tone: "healthy" },
};

function Transcript({
  count,
  interim,
  highlight,
  numbered = true,
}: {
  count: number;
  interim?: string;
  highlight?: number | null;
  numbered?: boolean;
}) {
  return (
    <ol className="flex flex-col gap-0.5" aria-live={interim ? "polite" : undefined}>
      {dictation.slice(0, count).map((line, i) => (
        <li
          key={line}
          className={cn(
            "grid grid-cols-[24px_minmax(0,1fr)] gap-2.5 rounded-control px-2.5 py-1.5 text-small transition-colors duration-160 ease-out motion-reduce:transition-none",
            highlight === i + 1 && "bg-accent-tint shadow-rule-accent",
          )}
        >
          {numbered && (
            <span className="text-right font-mono text-caption leading-5 text-ink-500">
              {i + 1}
            </span>
          )}
          <span>{line}</span>
        </li>
      ))}
      {interim && (
        <li className="grid grid-cols-[24px_minmax(0,1fr)] gap-2.5 px-2.5 py-1.5 text-small">
          <span className="text-right font-mono text-caption leading-5 text-ink-500">
            {count + 1}
          </span>
          <span className="text-ink-500 italic">{interim}</span>
        </li>
      )}
    </ol>
  );
}

/** Dictation is the one large control on the page, so starting is never in doubt. */
function DictationStage({
  state,
  setState,
}: {
  state: "ready" | "listening" | "paused";
  setState: (s: State) => void;
}) {
  const ready = state === "ready";
  const listening = state === "listening";
  return (
    <div className="grid gap-x-10 gap-y-6 lg:grid-cols-12">
      <section aria-labelledby="dictate" className="lg:col-span-8">
        <h2 id="dictate" className="headline text-h1">
          {ready
            ? "What happened on this visit?"
            : listening
              ? "AI scribe is listening. Keep going."
              : "Paused. Pick up when you're ready."}
        </h2>
        <p className="mt-1.5 max-w-140 text-body text-ink-700">
          {ready
            ? "Say it the way you'd tell a colleague. AI writes the note, and you check it."
            : "Your words appear below as you speak. You can correct them before the note is written."}
        </p>

        <div className="mt-6 flex flex-wrap items-center gap-5">
          {ready ? (
            <button
              type="button"
              onClick={() => setState("listening")}
              className="flex size-20 flex-none cursor-pointer items-center justify-center rounded-full bg-accent-fill text-on-accent transition-colors duration-160 ease-out hover:bg-accent-fill-hover motion-reduce:transition-none"
              aria-label="Start dictating"
            >
              <Mic className="size-8" strokeWidth={1.5} aria-hidden="true" />
            </button>
          ) : (
            <button
              type="button"
              onClick={() => setState(listening ? "paused" : "listening")}
              className="flex size-20 flex-none cursor-pointer items-center justify-center rounded-full border border-accent-fill bg-surface text-accent transition-colors duration-160 ease-out hover:bg-accent-tint motion-reduce:transition-none"
              aria-label={listening ? "Pause dictation" : "Resume dictation"}
            >
              {listening ? (
                <Pause className="size-8" strokeWidth={1.5} aria-hidden="true" />
              ) : (
                <Play className="size-8" strokeWidth={1.5} aria-hidden="true" />
              )}
            </button>
          )}
          <div className="flex flex-col items-start gap-2">
            {ready ? (
              <>
                <span className="font-semibold">Start dictating</span>
                <div className="flex flex-wrap items-center gap-1">
                  <Button size="sm" onClick={() => setState("no-mic")}>
                    Type instead
                  </Button>
                  <Button size="sm" variant="ghost" onClick={() => setState("listening")}>
                    Use sample dictation
                  </Button>
                </div>
              </>
            ) : (
              <>
                <span className="flex items-center gap-2 text-small font-semibold">
                  <span
                    aria-hidden="true"
                    className={cn("size-2 rounded-full", listening ? "bg-over-dot" : "bg-ink-400")}
                  />
                  {listening ? "Recording, 1:12" : "Paused at 1:12"}
                </span>
                <div className="flex flex-wrap items-center gap-2">
                  <Button variant="primary" onClick={() => setState("complete")}>
                    <Square className="size-3.5" strokeWidth={2} aria-hidden="true" />
                    Finish dictating
                  </Button>
                </div>
              </>
            )}
          </div>
        </div>

        {!ready && (
          <div className="mt-6 border-t border-border pt-4">
            <Transcript
              count={state === "listening" ? 5 : 6}
              interim={listening ? "I think endurance is holding him" : undefined}
            />
          </div>
        )}
      </section>

      <aside aria-label="Oliver's goals" className="lg:col-span-4">
        <Card className="px-5 pt-4.5 pb-4.5">
          <h3 className="text-h3 font-semibold">Oliver&apos;s goals</h3>
          <ul className="mt-2 flex list-disc flex-col gap-1.5 pl-4.5 text-small text-ink-700">
            <li>Hold a pencil with a mature grip for a full school task</li>
            <li>Copy basic shapes well enough to start letter formation</li>
          </ul>
          <Caption className="mt-3 border-t border-border pt-3">
            From his NDIS plan, in case they help you remember what to mention.
          </Caption>
        </Card>
      </aside>
    </div>
  );
}

/** The note fills in section by section, so people can see the AI working from their words. */
function Generating() {
  return (
    <section
      aria-label="AI is writing the note"
      aria-busy="true"
      className={cn(draftSurface(false), "flex flex-col gap-5 px-6 pt-5 pb-6")}
    >
      <AiMark state="Draft" source="Using your 8 dictated lines">
        AI is writing your note
      </AiMark>
      {noteSections.map((s, i) => (
        <div key={s.id} className="flex flex-col gap-1.5">
          <span
            className={cn(
              "font-serif text-section font-medium",
              i > 1 ? "text-ink-500" : "text-ink-900",
            )}
          >
            {s.title}
          </span>
          {i === 0 && s.sentences.map((x) => <p key={x.id}>{x.text}</p>)}
          {i === 1 && <p>{s.sentences[0]?.text}</p>}
          {i >= 1 && (
            <>
              <span className="h-3 w-11/12 animate-pulse rounded-full bg-border motion-reduce:animate-none" />
              <span className="h-3 w-3/4 animate-pulse rounded-full bg-border motion-reduce:animate-none" />
            </>
          )}
        </div>
      ))}
    </section>
  );
}

function Prompts() {
  const [handled, setHandled] = useState<string[]>([]);
  const open = missingPrompts.filter((p) => !handled.includes(p.id));
  if (open.length === 0) return null;
  return (
    <section
      aria-labelledby="check"
      className="rounded-control border border-border bg-monitor-bg px-4 py-3"
    >
      <h3 id="check" className="text-small font-semibold text-monitor">
        AI found 2 things to check before you approve
      </h3>
      <ul className="mt-1.5 flex flex-col">
        {open.map((p) => (
          <li key={p.id} className="flex flex-wrap items-center justify-between gap-2 py-1">
            <span className="text-small">{p.text}</span>
            <span className="flex gap-1">
              <Button size="sm" onClick={() => setHandled([...handled, p.id])}>
                Add to note
              </Button>
              <Button size="sm" variant="ghost" onClick={() => setHandled([...handled, p.id])}>
                Not needed
              </Button>
            </span>
          </li>
        ))}
      </ul>
    </section>
  );
}

function ReviewedNote({ state, setState }: { state: State; setState: (s: State) => void }) {
  const [line, setLine] = useState<number | null>(5);
  const approved = state === "approved" || state === "reopen";
  const showEdit = approved || state === "edited";

  return (
    <div className="grid items-start gap-6 lg:grid-cols-12">
      <aside aria-labelledby="dictated" className="lg:sticky lg:top-24 lg:col-span-4">
        <Card className="px-3 pt-4.5 pb-3">
          <h2 id="dictated" className="px-2.5 pb-2 text-h3 font-semibold">
            What you dictated
          </h2>
          <Transcript count={dictation.length} highlight={line} />
        </Card>
      </aside>

      <section
        aria-labelledby="note-title"
        className={cn(draftSurface(approved), "flex flex-col gap-5 px-6 pt-5 pb-4.5 lg:col-span-8")}
      >
        {approved ? (
          <AiMark state="Approved" source="Edited by you, 1 line">
            Note approved by Sarah Thompson, 10:46 am
          </AiMark>
        ) : (
          <AiMark state="Draft" source="Written from your dictation, 10:42 am" />
        )}
        <h2 id="note-title" className="sr-only">
          Structured note
        </h2>

        {noteSections.map((section) => (
          <div key={section.id}>
            <div className="mb-1 flex items-baseline justify-between gap-2">
              <h3 className="font-serif text-section font-medium">{section.title}</h3>
              {!approved && (
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => setState("editing")}
                  aria-label={`Edit ${section.title}`}
                >
                  Edit
                </Button>
              )}
            </div>
            <div className="flex flex-col gap-1">
              {section.sentences.map((s) =>
                s.edited && state === "editing" ? (
                  <div key={s.id} className="flex flex-col gap-2 py-1">
                    <label htmlFor={s.id} className="sr-only">
                      Edit this line
                    </label>
                    <textarea
                      id={s.id}
                      rows={2}
                      defaultValue={s.edited}
                      autoFocus
                      className="w-full resize-y rounded-control border border-border-strong bg-surface-raised px-3 py-2 text-body text-ink-900 outline-none focus:border-accent"
                    />
                    <div className="flex items-center gap-2">
                      <Button size="sm" variant="primary" onClick={() => setState("edited")}>
                        Save line
                      </Button>
                      <Button size="sm" onClick={() => setState("draft")}>
                        Cancel
                      </Button>
                    </div>
                  </div>
                ) : (
                  <p key={s.id} className="leading-5.5">
                    {s.edited && showEdit ? s.edited : s.text}
                    <SourceLink
                      line={s.line}
                      active={line === s.line}
                      onSelect={() => setLine(s.line)}
                    />
                    {s.edited && showEdit && (
                      <span className="ml-1.5 text-caption font-semibold text-brass">
                        Edited by you
                      </span>
                    )}
                  </p>
                ),
              )}
            </div>
          </div>
        ))}

        {!approved && <Prompts />}

        {state === "reopen" && (
          <div
            role="group"
            aria-labelledby="reopen-title"
            className="rounded-control border border-border-strong bg-surface-sunken px-4 py-3"
          >
            <h3 id="reopen-title" className="text-small font-semibold">
              Reopen this note for editing?
            </h3>
            <p className="mt-0.5 text-small text-ink-700">
              The report draft, form and tasks prepared from it will be marked out of date until you
              approve the note again. A new version is kept in the audit trail.
            </p>
            <div className="mt-2.5 flex items-center gap-2">
              <Button size="sm" variant="primary" onClick={() => setState("draft")}>
                Reopen for editing
              </Button>
              <Button size="sm" onClick={() => setState("approved")}>
                Keep approved
              </Button>
            </div>
          </div>
        )}

        <div className="flex flex-wrap items-center justify-between gap-3 border-t border-border pt-3.5">
          {approved ? (
            <>
              <span className="inline-flex items-center gap-1.5 text-caption font-medium text-ink-700">
                <Lock className="size-3.5" strokeWidth={1.5} aria-hidden="true" />
                Approved notes can&apos;t be changed or regenerated by AI.
              </span>
              <div className="flex items-center gap-2">
                {state === "approved" && (
                  <Button variant="ghost" onClick={() => setState("reopen")}>
                    Reopen for editing
                  </Button>
                )}
                <ButtonLink href="/design-preview/prepared" variant="primary">
                  See what AI prepared
                </ButtonLink>
              </div>
            </>
          ) : (
            <>
              <div className="flex items-center gap-2">
                <Button variant="primary" onClick={() => setState("approved")}>
                  Approve note
                </Button>
                <Button variant="ghost" onClick={() => setState("generating")}>
                  Regenerate with AI
                </Button>
              </div>
              <Caption>Nothing goes on Oliver&apos;s record until you approve.</Caption>
            </>
          )}
        </div>
      </section>
    </div>
  );
}

export function NoteView() {
  const [state, setState] = usePreviewState<State>("ready");
  const status = statusFor[state];

  return (
    <>
      <PreviewBar href="/design-preview/note" />
      <Shell persona="sarah" active="AI notes" section="AI notes" page="Oliver Grant">
        <header className="mb-6 flex flex-wrap items-start justify-between gap-3 border-b border-border pb-4">
          <div>
            <h1 className="headline text-h1">AI session note</h1>
            <dl className="mt-2 flex flex-wrap gap-x-8 gap-y-1.5">
              {visitDetails.map((d) => (
                <div key={d.label}>
                  <dt className="text-caption font-medium text-ink-500">{d.label}</dt>
                  <dd className="text-small font-semibold">{d.value}</dd>
                </div>
              ))}
            </dl>
          </div>
          {status && <Tag tone={status.tone}>{status.label}</Tag>}
        </header>

        {(state === "ready" || state === "listening" || state === "paused") && (
          <DictationStage state={state} setState={setState} />
        )}

        {state === "complete" && (
          <section aria-labelledby="transcript" className="max-w-200">
            <h2 id="transcript" className="headline text-h2">
              Here&apos;s what you said
            </h2>
            <p className="mt-1 text-small text-ink-700">
              Fix anything the microphone misheard, then ask AI to write the note.
            </p>
            <textarea
              aria-label="Your dictation"
              rows={10}
              defaultValue={dictation.join("\n")}
              className="mt-3 w-full resize-y rounded-control border border-border-strong bg-surface-raised px-3 py-2.5 text-body leading-6 text-ink-900 outline-none focus:border-accent"
            />
            <div className="mt-3 flex flex-wrap items-center gap-2">
              <Button variant="primary" onClick={() => setState("generating")}>
                Write note with AI
              </Button>
              <Button onClick={() => setState("listening")}>
                <Mic className="size-4" strokeWidth={1.5} aria-hidden="true" />
                Dictate more
              </Button>
              <Caption className="ml-1">Audio isn&apos;t kept, only the text above.</Caption>
            </div>
          </section>
        )}

        {state === "generating" && (
          <div className="grid items-start gap-6 lg:grid-cols-12">
            <Card className="px-3 pt-4.5 pb-3 lg:col-span-4">
              <h2 className="px-2.5 pb-2 text-h3 font-semibold">What you dictated</h2>
              <Transcript count={dictation.length} />
            </Card>
            <div className="lg:col-span-8">
              <Generating />
            </div>
          </div>
        )}

        {state === "error" && (
          <section className="max-w-200">
            <p
              role="alert"
              className="flex items-start gap-2 rounded-control bg-over-bg px-4 py-3 text-small text-over"
            >
              <AlertCircle
                className="mt-0.5 size-4 flex-none"
                strokeWidth={1.5}
                aria-hidden="true"
              />
              <span>
                <b className="font-semibold">AI couldn&apos;t write the draft.</b> The connection
                dropped. Your dictation is saved. Try again, or write the note yourself.
              </span>
            </p>
            <div className="mt-3 flex items-center gap-2">
              <Button variant="primary" onClick={() => setState("generating")}>
                Try again
              </Button>
              <Button onClick={() => setState("no-mic")}>Write it myself</Button>
            </div>
          </section>
        )}

        {state === "no-mic" && (
          <section aria-labelledby="type-note" className="max-w-200">
            <p
              role="alert"
              className="flex items-start gap-2 rounded-control bg-monitor-bg px-4 py-3 text-small text-monitor"
            >
              <MicOff className="mt-0.5 size-4 flex-none" strokeWidth={1.5} aria-hidden="true" />
              <span>
                Your microphone isn&apos;t available. Allow microphone access in your browser
                settings, or type your note below.
              </span>
            </p>
            <h2 id="type-note" className="mt-5 headline text-h2">
              What happened on this visit?
            </h2>
            <textarea
              aria-labelledby="type-note"
              rows={8}
              placeholder="One thought per line works best."
              className="mt-2 w-full resize-y rounded-control border border-border-strong bg-surface-raised px-3 py-2.5 text-body leading-6 text-ink-900 outline-none placeholder:text-ink-500 focus:border-accent"
            />
            <div className="mt-3 flex items-center gap-2">
              <Button variant="primary" onClick={() => setState("generating")}>
                Write note with AI
              </Button>
              <Button variant="ghost" onClick={() => setState("listening")}>
                Use sample dictation
              </Button>
            </div>
          </section>
        )}

        {(state === "draft" ||
          state === "editing" ||
          state === "edited" ||
          state === "approved" ||
          state === "reopen") && <ReviewedNote state={state} setState={setState} />}
      </Shell>
    </>
  );
}
