"use client";

import { AlertCircle, Lock, Mic, MicOff, Pause, Play, Square } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";
import { AiMark, SourceLink } from "@/components/ai/marks";
import { draftSurface } from "@/components/ai/provenance";
import { Button, ButtonLink } from "@/components/ui/button";
import { Caption, Card } from "@/components/ui/card";
import { Tag } from "@/components/ui/tag";
import { oliverGoals, preparedNote, sampleDictation, visitDetails } from "@/data/story";
import { useDictation } from "@/features/case-notes/use-dictation";
import { cn } from "@/lib/cn";
import { noteSectionTitles, type NoteSectionId, type SessionNote as Note } from "@/lib/story/types";
import { useDemoStore } from "@/state/demo-store";
import { callStory } from "@/state/use-story-ai";

const toLines = (text: string) =>
  text
    .split("\n")
    .map((l) => l.trim())
    .filter(Boolean);

function Transcript({
  lines,
  interim,
  highlight,
}: {
  lines: string[];
  interim?: string;
  highlight?: number | null;
}) {
  return (
    <ol className="flex flex-col gap-0.5" aria-live={interim !== undefined ? "polite" : undefined}>
      {lines.map((line, i) => (
        <li
          key={`${i}-${line}`}
          className={cn(
            "grid grid-cols-[24px_minmax(0,1fr)] gap-2.5 rounded-control px-2.5 py-1.5 text-small transition-colors duration-160 ease-out motion-reduce:transition-none",
            highlight === i + 1 && "bg-accent-tint shadow-rule-accent",
          )}
        >
          <span className="text-right font-mono text-caption leading-5 text-ink-500">{i + 1}</span>
          <span>{line}</span>
        </li>
      ))}
      {interim && (
        <li className="grid grid-cols-[24px_minmax(0,1fr)] gap-2.5 px-2.5 py-1.5 text-small">
          <span className="text-right font-mono text-caption leading-5 text-ink-500">
            {lines.length + 1}
          </span>
          <span className="text-ink-500 italic">{interim}</span>
        </li>
      )}
    </ol>
  );
}

function DictationStage({ onTypeInstead }: { onTypeInstead: () => void }) {
  const transcript = useDemoStore((s) => s.story.transcript);
  const setTranscript = useDemoStore((s) => s.setTranscript);
  const finish = useDemoStore((s) => s.finishDictation);
  const [mode, setMode] = useState<"ready" | "listening" | "paused">("ready");
  const [seconds, setSeconds] = useState(0);
  const [playing, setPlaying] = useState(false);
  const timers = useRef<number[]>([]);

  const append = useCallback(
    (text: string) => {
      const current = useDemoStore.getState().story.transcript.trimEnd();
      setTranscript(current ? `${current}\n${text}` : text);
    },
    [setTranscript],
  );
  const dictation = useDictation(append);
  const { listening: micOn, start: startMic, stop: stopMic } = dictation;
  const active = mode === "listening";

  useEffect(() => {
    if (!active) return undefined;
    const tick = window.setInterval(() => setSeconds((v) => v + 1), 1000);
    return () => window.clearInterval(tick);
  }, [active]);

  useEffect(() => {
    const pending = timers.current;
    return () => pending.forEach((t) => window.clearTimeout(t));
  }, []);

  function startListening() {
    if (dictation.supported) startMic();
    setMode("listening");
  }

  function pause() {
    if (micOn) stopMic();
    setMode("paused");
  }

  function playSample() {
    setTranscript("");
    setMode("listening");
    setPlaying(true);
    timers.current = sampleDictation.map((line, i) =>
      window.setTimeout(
        () => {
          append(line);
          if (i === sampleDictation.length - 1) {
            setPlaying(false);
            setMode("paused");
          }
        },
        900 * (i + 1),
      ),
    );
  }

  function finishDictating() {
    if (micOn) stopMic();
    finish();
  }

  const lines = toLines(transcript);
  const time = `${Math.floor(seconds / 60)}:${String(seconds % 60).padStart(2, "0")}`;
  const ready = mode === "ready";

  return (
    <div className="grid gap-x-10 gap-y-6 lg:grid-cols-12">
      <section aria-labelledby="dictate" className="lg:col-span-8">
        <h2 id="dictate" className="headline text-h1">
          {ready
            ? "What happened on this visit?"
            : active
              ? "AI scribe is listening. Keep going."
              : "Paused. Pick up when you're ready."}
        </h2>
        <p className="mt-1.5 max-w-140 text-body text-ink-700">
          {ready
            ? "Say it the way you'd tell a colleague. AI writes the note, and you check it."
            : "Your words appear below as you speak. You can correct them before the note is written."}
        </p>

        {dictation.error && (
          <p role="alert" className="mt-3 text-small text-over">
            {dictation.error}
          </p>
        )}

        <div
          className={cn(
            "mt-6 flex flex-wrap items-center gap-5",
            !ready &&
              "max-md:sticky max-md:bottom-16 max-md:z-10 max-md:border-t max-md:border-border max-md:bg-canvas max-md:py-3",
          )}
        >
          {ready ? (
            <button
              type="button"
              onClick={startListening}
              disabled={!dictation.supported}
              aria-label="Start dictating"
              className="flex size-20 flex-none cursor-pointer items-center justify-center rounded-full bg-accent-fill text-on-accent transition-colors duration-160 ease-out hover:bg-accent-fill-hover disabled:cursor-not-allowed disabled:opacity-60 motion-reduce:transition-none"
            >
              <Mic className="size-8" strokeWidth={1.5} aria-hidden="true" />
            </button>
          ) : (
            <button
              type="button"
              disabled={playing}
              onClick={active ? pause : startListening}
              aria-label={active ? "Pause dictation" : "Resume dictation"}
              className="flex size-20 flex-none cursor-pointer items-center justify-center rounded-full border border-accent-fill bg-surface text-accent transition-colors duration-160 ease-out hover:bg-accent-tint disabled:cursor-wait motion-reduce:transition-none"
            >
              {active ? (
                <Pause className="size-8" strokeWidth={1.5} aria-hidden="true" />
              ) : (
                <Play className="size-8" strokeWidth={1.5} aria-hidden="true" />
              )}
            </button>
          )}
          <div className="flex flex-col items-start gap-2">
            {ready ? (
              <>
                <span className="font-semibold">
                  {dictation.supported ? "Start dictating" : "Dictation needs Chrome or Edge"}
                </span>
                <div className="flex flex-wrap items-center gap-1">
                  <Button size="sm" onClick={onTypeInstead}>
                    Type instead
                  </Button>
                  <Button size="sm" variant="ghost" onClick={playSample}>
                    Use sample dictation
                  </Button>
                </div>
              </>
            ) : (
              <>
                <span className="flex items-center gap-2 text-small font-semibold">
                  <span
                    aria-hidden="true"
                    className={cn("size-2 rounded-full", active ? "bg-over-dot" : "bg-ink-400")}
                  />
                  {active ? `Recording, ${time}` : `Paused at ${time}`}
                </span>
                <Button
                  variant="primary"
                  disabled={playing || (lines.length === 0 && !dictation.interim)}
                  onClick={finishDictating}
                >
                  <Square className="size-3.5" strokeWidth={2} aria-hidden="true" />
                  Finish dictating
                </Button>
              </>
            )}
          </div>
        </div>

        {!ready && (
          <div className="mt-6 border-t border-border pt-4">
            {lines.length === 0 && !dictation.interim ? (
              <Caption>Nothing heard yet.</Caption>
            ) : (
              <Transcript lines={lines} interim={dictation.interim} />
            )}
          </div>
        )}
      </section>

      <aside aria-label="Oliver's goals" className="lg:col-span-4">
        <Card className="px-5 pt-4.5 pb-4.5">
          <h3 className="text-h3 font-semibold">Oliver&apos;s goals</h3>
          <ul className="mt-2 flex list-disc flex-col gap-1.5 pl-4.5 text-small text-ink-700">
            {oliverGoals.map((g) => (
              <li key={g}>{g}</li>
            ))}
          </ul>
          <Caption className="mt-3 border-t border-border pt-3">
            From his NDIS plan, in case they help you remember what to mention.
          </Caption>
        </Card>
      </aside>
    </div>
  );
}

function Prompt({ id, text }: { id: string; text: string }) {
  const addToPlan = useDemoStore((s) => s.addToPlan);
  const handle = useDemoStore((s) => s.handlePrompt);
  const [adding, setAdding] = useState(false);
  const [value, setValue] = useState("");
  return (
    <li className="py-1">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <span className="text-small">{text}</span>
        {!adding && (
          <span className="flex gap-1">
            <Button size="sm" onClick={() => setAdding(true)}>
              Add to note
            </Button>
            <Button size="sm" variant="ghost" onClick={() => handle(id)}>
              Not needed
            </Button>
          </span>
        )}
      </div>
      {adding && (
        <form
          className="mt-1.5 flex flex-wrap items-center gap-2"
          onSubmit={(e) => {
            e.preventDefault();
            if (value.trim()) addToPlan(id, value.trim());
          }}
        >
          <input
            autoFocus
            value={value}
            onChange={(e) => setValue(e.target.value)}
            aria-label="What to add to the plan"
            placeholder="Add this to the plan"
            className="h-8 min-w-0 flex-1 rounded-control border border-border-strong bg-surface-raised px-2.5 text-small text-ink-900 outline-none placeholder:text-ink-500 focus:border-accent"
          />
          <Button size="sm" variant="primary" type="submit" disabled={!value.trim()}>
            Add to note
          </Button>
          <Button size="sm" onClick={() => setAdding(false)}>
            Cancel
          </Button>
        </form>
      )}
    </li>
  );
}

function SectionEditor({
  section,
  note,
  onClose,
}: {
  section: NoteSectionId;
  note: Note;
  onClose: () => void;
}) {
  const edit = useDemoStore((s) => s.editSentence);
  const sentences = note.sections[section];
  const [values, setValues] = useState(() => sentences.map((s) => s.text));
  return (
    <div className="flex flex-col gap-2 py-1">
      {sentences.map((s, i) => (
        <textarea
          key={s.id}
          rows={2}
          autoFocus={i === 0}
          aria-label={`Edit sentence ${i + 1}`}
          value={values[i] ?? ""}
          onChange={(e) => setValues(values.map((v, j) => (j === i ? e.target.value : v)))}
          className="w-full resize-y rounded-control border border-border-strong bg-surface-raised px-3 py-2 text-body text-ink-900 outline-none focus:border-accent"
        />
      ))}
      <div className="flex items-center gap-2">
        <Button
          size="sm"
          variant="primary"
          onClick={() => {
            sentences.forEach((s, i) => {
              const value = (values[i] ?? "").trim();
              if (value && value !== s.text) edit(section, s.id, value);
            });
            onClose();
          }}
        >
          Save changes
        </Button>
        <Button size="sm" onClick={onClose}>
          Cancel
        </Button>
      </div>
    </div>
  );
}

function SkeletonLines() {
  return (
    <>
      <span className="block h-3 w-11/12 animate-pulse rounded-full bg-border motion-reduce:animate-none" />
      <span className="mt-2 block h-3 w-3/4 animate-pulse rounded-full bg-border motion-reduce:animate-none" />
    </>
  );
}

function Generating({ lines }: { lines: string[] }) {
  return (
    <div className="grid items-start gap-6 lg:grid-cols-12">
      <Card className="px-3 pt-4.5 pb-3 lg:col-span-4">
        <h2 className="px-2.5 pb-2 text-h3 font-semibold">What you dictated</h2>
        <Transcript lines={lines} />
      </Card>
      <section
        aria-label="AI is writing the note"
        aria-busy="true"
        className={cn(draftSurface(false), "flex flex-col gap-5 px-6 pt-5 pb-6 lg:col-span-8")}
      >
        <AiMark source={`Using your ${lines.length} dictated lines`}>
          AI is writing your note
        </AiMark>
        {noteSectionTitles.map((s) => (
          <div key={s.id}>
            <span className="mb-2 block font-serif text-section font-medium text-ink-500">
              {s.title}
            </span>
            <SkeletonLines />
          </div>
        ))}
      </section>
    </div>
  );
}

function ReviewedNote({
  note,
  revealed,
  onRegenerate,
  onApprove,
}: {
  note: Note;
  revealed: number;
  onRegenerate: () => void;
  onApprove: () => void;
}) {
  const stage = useDemoStore((s) => s.story.stage);
  const transcript = useDemoStore((s) => s.story.transcript);
  const edits = useDemoStore((s) => s.story.edits);
  const approvedAt = useDemoStore((s) => s.story.approvedAt);
  const handled = useDemoStore((s) => s.story.handledPrompts);
  const noteMeta = useDemoStore((s) => s.story.noteMeta);
  const role = useDemoStore((s) => s.role);
  const reopen = useDemoStore((s) => s.reopenSessionNote);
  const [line, setLine] = useState<number | null>(null);
  const [editing, setEditing] = useState<NoteSectionId | null>(null);
  const [confirmReopen, setConfirmReopen] = useState(false);

  const approved = stage === "approved";
  const canApprove = role === "Clinician";
  const open = note.missing.filter((m) => !handled.includes(m.id));
  const lines = toLines(transcript);

  return (
    <div className="grid items-start gap-6 lg:grid-cols-12">
      <aside aria-labelledby="dictated" className="lg:sticky lg:top-6 lg:col-span-4">
        <Card className="px-3 pt-4.5 pb-3">
          <h2 id="dictated" className="px-2.5 pb-2 text-h3 font-semibold">
            What you dictated
          </h2>
          <Transcript lines={lines} highlight={line} />
        </Card>
      </aside>

      <section
        aria-labelledby="note-title"
        className={cn(draftSurface(approved), "flex flex-col gap-5 px-6 pt-5 pb-4.5 lg:col-span-8")}
      >
        {approved ? (
          <AiMark
            state="Approved"
            source={
              edits ? `Edited by you, ${edits} ${edits === 1 ? "change" : "changes"}` : undefined
            }
          >
            Note approved by Sarah Thompson, {approvedAt}
          </AiMark>
        ) : (
          <AiMark
            source={
              noteMeta?.latencyMs
                ? `Written from your dictation in ${(noteMeta.latencyMs / 1000).toFixed(1)} s`
                : "Written from your dictation"
            }
          />
        )}
        <h2 id="note-title" className="sr-only">
          Structured note
        </h2>

        {noteSectionTitles.map((section, index) => {
          const sentences = note.sections[section.id];
          const shown = index < revealed;
          return (
            <div key={section.id}>
              <div className="mb-1 flex items-baseline justify-between gap-2">
                <h3 className={cn("font-serif text-section font-medium", !shown && "text-ink-500")}>
                  {section.title}
                </h3>
                {!approved && shown && editing !== section.id && sentences.length > 0 && (
                  <Button
                    size="sm"
                    variant="ghost"
                    aria-label={`Edit ${section.title}`}
                    onClick={() => setEditing(section.id)}
                  >
                    Edit
                  </Button>
                )}
              </div>
              {!shown ? (
                <SkeletonLines />
              ) : editing === section.id ? (
                <SectionEditor section={section.id} note={note} onClose={() => setEditing(null)} />
              ) : sentences.length === 0 ? (
                <p className="text-small text-ink-500 italic">Nothing dictated for this section.</p>
              ) : (
                <div className="flex flex-col gap-1">
                  {sentences.map((s) => (
                    <p key={s.id} className="leading-5.5">
                      {s.text}
                      {s.line !== null && (
                        <SourceLink
                          line={s.line}
                          active={line === s.line}
                          onSelect={() => setLine(s.line)}
                        />
                      )}
                      {s.edited && (
                        <span className="ml-1.5 text-caption font-semibold text-brass">
                          Edited by you
                        </span>
                      )}
                    </p>
                  ))}
                </div>
              )}
            </div>
          );
        })}

        {!approved && revealed >= noteSectionTitles.length && open.length > 0 && (
          <section
            aria-labelledby="check"
            className="rounded-control border border-border bg-monitor-bg px-4 py-3"
          >
            <h3 id="check" className="text-small font-semibold text-monitor">
              AI found {open.length} {open.length === 1 ? "thing" : "things"} to check before you
              approve
            </h3>
            <ul className="mt-1.5 flex flex-col">
              {open.map((m) => (
                <Prompt key={m.id} id={m.id} text={m.text} />
              ))}
            </ul>
          </section>
        )}

        {confirmReopen && (
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
              <Button
                size="sm"
                variant="primary"
                onClick={() => {
                  reopen();
                  setConfirmReopen(false);
                }}
              >
                Reopen for editing
              </Button>
              <Button size="sm" onClick={() => setConfirmReopen(false)}>
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
                {!confirmReopen && (
                  <Button variant="ghost" onClick={() => setConfirmReopen(true)}>
                    Reopen for editing
                  </Button>
                )}
                <ButtonLink href="/sessions/oliver-grant/prepared" variant="primary">
                  See what AI prepared
                </ButtonLink>
              </div>
            </>
          ) : (
            <>
              <div className="flex items-center gap-2">
                <Button variant="primary" disabled={!canApprove} onClick={onApprove}>
                  Approve note
                </Button>
                <Button variant="ghost" onClick={onRegenerate}>
                  Regenerate with AI
                </Button>
              </div>
              <Caption>
                {canApprove
                  ? "Nothing goes on Oliver's record until you approve."
                  : "Only Sarah Thompson can approve this note."}
              </Caption>
            </>
          )}
        </div>
      </section>
    </div>
  );
}

export function SessionNote() {
  const router = useRouter();
  const stage = useDemoStore((s) => s.story.stage);
  const transcript = useDemoStore((s) => s.story.transcript);
  const note = useDemoStore((s) => s.story.note);
  const error = useDemoStore((s) => s.story.error);
  const setTranscript = useDemoStore((s) => s.setTranscript);
  const finish = useDemoStore((s) => s.finishDictation);
  const begin = useDemoStore((s) => s.beginSessionNote);
  const complete = useDemoStore((s) => s.completeSessionNote);
  const fail = useDemoStore((s) => s.failSessionNote);
  const approve = useDemoStore((s) => s.approveSessionNote);
  const startOver = useDemoStore((s) => s.resetStoryNote);
  const [typing, setTyping] = useState(false);
  const [revealed, setRevealed] = useState<number>(noteSectionTitles.length);

  const lines = toLines(transcript);

  async function generate() {
    begin();
    const result = await callStory<Note>({ kind: "note", lines });
    if ("error" in result) {
      const unchanged = lines.join("\n") === sampleDictation.join("\n");
      if (unchanged) {
        complete(preparedNote, { source: "prepared", model: null, latencyMs: null });
        reveal();
      } else {
        fail(result.error);
      }
      return;
    }
    complete(result.data, result.meta);
    reveal();
  }

  /** The note appears one section at a time, so people can follow what AI wrote. */
  function reveal() {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    setRevealed(0);
    noteSectionTitles.forEach((_, i) => {
      window.setTimeout(() => setRevealed(i + 1), 350 * (i + 1));
    });
  }

  const tag =
    stage === "approved"
      ? { label: "Approved", tone: "healthy" as const }
      : stage === "draft"
        ? { label: "Ready for review", tone: "live" as const }
        : null;

  return (
    <>
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
        {tag && <Tag tone={tag.tone}>{tag.label}</Tag>}
      </header>

      {stage === "ready" && !typing && <DictationStage onTypeInstead={() => setTyping(true)} />}

      {stage === "ready" && typing && (
        <section aria-labelledby="type-note" className="max-w-200">
          <p className="flex items-start gap-2 rounded-control bg-surface-sunken px-4 py-3 text-small text-ink-700">
            <MicOff className="mt-0.5 size-4 flex-none" strokeWidth={1.5} aria-hidden="true" />
            Typing instead of dictating. If your microphone isn&apos;t working, allow access in your
            browser settings.
          </p>
          <h2 id="type-note" className="mt-5 headline text-h2">
            What happened on this visit?
          </h2>
          <textarea
            aria-labelledby="type-note"
            rows={8}
            value={transcript}
            onChange={(e) => setTranscript(e.target.value)}
            placeholder="One thought per line works best."
            className="mt-2 w-full resize-y rounded-control border border-border-strong bg-surface-raised px-3 py-2.5 text-body leading-6 text-ink-900 outline-none placeholder:text-ink-500 focus:border-accent"
          />
          <div className="mt-3 flex items-center gap-2">
            <Button
              variant="primary"
              disabled={lines.length === 0}
              onClick={() => {
                finish();
                void generate();
              }}
            >
              Write note with AI
            </Button>
            <Button variant="ghost" onClick={() => setTyping(false)}>
              Back to dictation
            </Button>
          </div>
        </section>
      )}

      {stage === "complete" && (
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
            value={transcript}
            onChange={(e) => setTranscript(e.target.value)}
            className="mt-3 w-full resize-y rounded-control border border-border-strong bg-surface-raised px-3 py-2.5 text-body leading-6 text-ink-900 outline-none focus:border-accent"
          />
          <div className="mt-3 flex flex-wrap items-center gap-2">
            <Button variant="primary" disabled={lines.length === 0} onClick={() => void generate()}>
              Write note with AI
            </Button>
            <Button onClick={startOver}>
              <Mic className="size-4" strokeWidth={1.5} aria-hidden="true" />
              Start again
            </Button>
          </div>
        </section>
      )}

      {stage === "generating" && <Generating lines={lines} />}

      {stage === "error" && (
        <section className="max-w-200">
          <p
            role="alert"
            className="flex items-start gap-2 rounded-control bg-over-bg px-4 py-3 text-small text-over"
          >
            <AlertCircle className="mt-0.5 size-4 flex-none" strokeWidth={1.5} aria-hidden="true" />
            <span>
              <b className="font-semibold">AI couldn&apos;t write the draft.</b> {error}. Your
              dictation is saved. Try again, or edit your dictation first.
            </span>
          </p>
          <div className="mt-3 flex items-center gap-2">
            <Button variant="primary" onClick={() => void generate()}>
              Try again
            </Button>
            <Button onClick={finish}>Edit dictation</Button>
          </div>
        </section>
      )}

      {(stage === "draft" || stage === "approved") && note && (
        <ReviewedNote
          note={note}
          revealed={revealed}
          onRegenerate={() => void generate()}
          onApprove={() => {
            approve();
            router.push("/sessions/oliver-grant/prepared");
          }}
        />
      )}

      {stage === "ready" && (
        <p className="mt-8 text-caption font-medium text-ink-500">
          Older notes are in{" "}
          <Link href="/case-notes/mia-robinson" className="font-semibold">
            AI notes
          </Link>
          .
        </p>
      )}
    </>
  );
}
