"use client";

import { Mic, Square } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
import { PenNib } from "@/components/ai/provenance";
import { Button } from "@/components/ui/button";
import { Caption, Card, CardTitle } from "@/components/ui/card";
import { noteText, type CaseNoteSample } from "@/data/case-note";
import { MAX_NOTE_CHARS } from "@/lib/ai/case-note-contract";
import { cn } from "@/lib/cn";
import { useDemoStore } from "@/state/demo-store";
import { useDictation } from "./use-dictation";
import { useGenerateNote } from "./use-generate-note";

function toLines(text: string) {
  return text
    .split("\n")
    .map((l) => l.trim())
    .filter(Boolean);
}

const idle = { mode: "empty", changes: 0, rawNotes: "", generation: null } as const;

export function TherapistNotes({ sample }: { sample: CaseNoteSample }) {
  const { mode, changes, rawNotes, generation } = useDemoStore(
    (s) => s.caseNotes[sample.id] ?? idle,
  );
  const setRawNotes = useDemoStore((s) => s.setRawNotes);
  const resetRawNotes = useDemoStore((s) => s.resetRawNotes);
  const generate = useGenerateNote(sample.id);
  const [editing, setEditing] = useState(false);
  const [playing, setPlaying] = useState(false);
  const timers = useRef<number[]>([]);

  const appendLine = useCallback(
    (text: string) => {
      const current = useDemoStore.getState().caseNotes[sample.id]?.rawNotes.trimEnd() ?? "";
      setRawNotes(
        sample.id,
        current
          ? `${current}
${text}`
          : text,
      );
    },
    [sample.id, setRawNotes],
  );
  const dictation = useDictation(appendLine);

  useEffect(() => {
    const pending = timers.current;
    return () => pending.forEach((t) => window.clearTimeout(t));
  }, []);

  /** Replays the sample note phrase by phrase, for rooms where a live microphone is unreliable. */
  function playSampleDictation() {
    setRawNotes(sample.id, "");
    setPlaying(true);
    timers.current = sample.rawLines.map((line, i) =>
      window.setTimeout(
        () => {
          appendLine(line);
          if (i === sample.rawLines.length - 1) setPlaying(false);
        },
        700 * (i + 1),
      ),
    );
  }

  const lines = toLines(rawNotes);
  const showEditor = mode === "empty" || editing;
  const generating = mode === "generating";
  const paired = mode === "draft" && changes === 0 ? generation?.pairedLine : null;
  const isSample = lines.join("\n") === toLines(noteText(sample)).join("\n");

  return (
    <Card
      id="sources"
      aria-labelledby="therapist-notes"
      className="flex flex-col gap-3.5 px-5 pt-5 pb-4.5"
    >
      <CardTitle
        id="therapist-notes"
        title="Therapist notes"
        description={
          isSample
            ? `Entered by ${sample.clinician} · ${sample.enteredAt} · Unstructured`
            : "Edited in this session · Unstructured"
        }
        aside={<Caption className="pt-1.5">{lines.length} lines</Caption>}
      />

      {showEditor ? (
        <div className="flex flex-col gap-1.5 border-t border-border pt-3">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <label htmlFor="raw-notes" className="text-caption font-semibold text-ink-700">
              Type, paste or dictate the session note
            </label>
            <div className="flex items-center gap-1.5">
              {dictation.supported && (
                <Button
                  size="sm"
                  variant={dictation.listening ? "primary" : "secondary"}
                  disabled={generating || playing}
                  onClick={dictation.listening ? dictation.stop : dictation.start}
                >
                  {dictation.listening ? (
                    <Square className="size-3.5" strokeWidth={2} aria-hidden="true" />
                  ) : (
                    <Mic className="size-3.5" strokeWidth={1.5} aria-hidden="true" />
                  )}
                  {dictation.listening ? "Stop" : "Dictate"}
                </Button>
              )}
              <Button
                size="sm"
                variant="ghost"
                disabled={generating || playing || dictation.listening}
                onClick={playSampleDictation}
              >
                {playing ? "Dictating…" : "Sample dictation"}
              </Button>
            </div>
          </div>
          {(dictation.listening || playing) && (
            <p
              className="flex items-center gap-2 text-caption font-semibold text-over"
              role="status"
            >
              <span
                className="size-2 flex-none animate-pulse rounded-full bg-over-dot"
                aria-hidden="true"
              />
              Listening · English (Australia)
              {dictation.interim && (
                <span className="font-normal text-ink-500 italic">{dictation.interim}</span>
              )}
            </p>
          )}
          {dictation.error && <p className="text-caption text-over">{dictation.error}</p>}
          <textarea
            id="raw-notes"
            rows={9}
            maxLength={MAX_NOTE_CHARS}
            value={rawNotes}
            disabled={generating}
            onChange={(e) => setRawNotes(sample.id, e.target.value)}
            className="w-full resize-y rounded-control border border-border-strong bg-surface-raised px-3 py-2.5 font-mono text-small leading-6 text-ink-900 outline-none focus:border-accent focus:shadow-focus disabled:opacity-60"
          />
          <div className="flex justify-between">
            <Caption>
              {rawNotes.length} / {MAX_NOTE_CHARS} characters · speech is converted in the browser
              and audio is not stored
            </Caption>
            {!isSample && (
              <button
                type="button"
                onClick={() => resetRawNotes(sample.id)}
                className="cursor-pointer text-caption font-semibold text-accent hover:underline"
              >
                Restore sample note
              </button>
            )}
          </div>
        </div>
      ) : (
        <ol className="flex flex-col gap-0.5 border-t border-border pt-2.5">
          {lines.map((line, index) => {
            const isPaired = paired === index + 1;
            return (
              <li
                key={`${index}-${line}`}
                className={cn(
                  "grid grid-cols-[24px_minmax(0,1fr)] gap-2.5 rounded-control px-2.5 py-2 transition-colors duration-160 ease-out",
                  isPaired && "bg-accent-tint shadow-rule-accent",
                )}
              >
                <span
                  className={cn(
                    "text-right font-mono text-caption leading-5.25",
                    isPaired ? "font-medium text-accent" : "text-ink-400",
                  )}
                >
                  {index + 1}
                </span>
                <span>{line}</span>
              </li>
            );
          })}
        </ol>
      )}

      <p className="rounded-control bg-surface-sunken px-3 py-2.5 text-caption font-medium text-ink-700">
        Uses only this note. Nothing is saved to the clinical record until you approve.
      </p>
      <div className="flex flex-wrap items-center gap-3">
        <Button
          variant={mode === "empty" || editing ? "primary" : "secondary"}
          disabled={generating || lines.length === 0}
          onClick={() => {
            setEditing(false);
            void generate();
          }}
        >
          <PenNib className={generating ? "animate-pulse" : undefined} />
          {generating
            ? "Drafting…"
            : mode === "empty"
              ? "Generate structured summary"
              : "Generate again"}
        </Button>
        {mode !== "empty" && !generating && (
          <Button variant="ghost" onClick={() => setEditing(!editing)}>
            {editing ? "Done editing" : "Edit note"}
          </Button>
        )}
        <Caption>
          {generating ? `Structuring ${lines.length} lines…` : "Takes a few seconds"}
        </Caption>
      </div>
    </Card>
  );
}
