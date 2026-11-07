"use client";

import { dt } from "@/lib/clock";
import { AlertCircle, ArrowRight, Check } from "lucide-react";
import Link from "next/link";
import { useState, type ReactNode } from "react";
import { ApprovedLabel, DraftLabel, PenNib, draftSurface } from "@/components/ai/provenance";
import { Button } from "@/components/ui/button";
import { Segmented } from "@/components/ui/segmented";
import { caseNoteGeneratedAt, caseNotes, type CaseNoteSample } from "@/data/case-note";
import { cn } from "@/lib/cn";
import { useDemoStore, type CaseNoteDraft, type CaseNoteGeneration } from "@/state/demo-store";
import { FollowUpSuggestions, MissingInformation, VersionHistory } from "./note-extras";
import { useGenerateNote } from "./use-generate-note";

const SECTIONS: { key: keyof CaseNoteDraft; label: string; rows: number }[] = [
  { key: "summary", label: "Session Summary", rows: 4 },
  { key: "interventions", label: "Interventions", rows: 3 },
  { key: "observations", label: "Progress / Observations", rows: 3 },
  { key: "nextActions", label: "Next Actions", rows: 3 },
];

function lines(text: string) {
  return text
    .split("\n")
    .map((l) => l.trim())
    .filter(Boolean);
}

function firstSentence(text: string) {
  const match = /^.+?[.!?](\s|$)/.exec(text);
  return match ? match[0].trim() : text;
}

function Section({ title, children }: { title: string; children: ReactNode }) {
  return (
    <div>
      <h3 className="mb-1.5 font-serif text-section font-medium">{title}</h3>
      {children}
    </div>
  );
}

function List({ items }: { items: string[] }) {
  if (items.length === 0)
    return <p className="text-small text-ink-500 italic">Nothing recorded in the note.</p>;
  return (
    <ul className="flex list-disc flex-col gap-0.5 pl-4.5">
      {items.map((item) => (
        <li key={item}>{item}</li>
      ))}
    </ul>
  );
}

function Summary({ text, pairedLine }: { text: string; pairedLine: number | null }) {
  const lead = firstSentence(text);
  if (!pairedLine || lead === text) return <p className="leading-5.5">{text}</p>;
  return (
    <p className="leading-5.5">
      <span className="rounded-xs bg-accent-tint py-px shadow-underline-accent">{lead}</span>{" "}
      <span className="inline-flex h-4.5 items-center rounded-tag bg-accent-fill px-1.5 align-baseline text-eyebrow font-semibold text-on-accent">
        Line {pairedLine}
      </span>{" "}
      {text.slice(lead.length).trim()}
    </p>
  );
}

function provenance(g: CaseNoteGeneration | null, sample: CaseNoteSample) {
  const source = `Source: therapist note, ${sample.sessionDate}`;
  if (!g || g.source === "scripted") return `${caseNoteGeneratedAt} · ${source}`;
  const seconds = g.latencyMs ? ` in ${(g.latencyMs / 1000).toFixed(1)}s` : "";
  return `Written by AI${seconds} · ${source}`;
}

function EmptyState({ error }: { error: string | null }) {
  return (
    <div className="flex min-h-130 flex-col items-start justify-center gap-2.5 rounded-card border border-dashed border-border-strong bg-surface p-10">
      <PenNib className="size-5 text-brass" />
      <p className="max-w-95 headline text-h2 text-ink-700">
        The structured draft will appear here for your review.
      </p>
      <p className="max-w-95 text-small text-ink-500">
        Session summary, interventions, progress and observations, and next actions, each traceable
        to a line in the therapist’s note.
      </p>
      {error && <ErrorNotice error={error} />}
    </div>
  );
}

function ErrorNotice({ error }: { error: string }) {
  return (
    <p
      role="alert"
      className="flex items-start gap-2 rounded-control bg-over-bg px-3 py-2.5 text-small text-over"
    >
      <AlertCircle className="mt-0.5 size-4 flex-none" strokeWidth={1.5} aria-hidden="true" />
      <span>{error}. Your note is saved. Try again, or restore the sample note.</span>
    </p>
  );
}

function Generating() {
  return (
    <section
      aria-label="Drafting"
      aria-busy="true"
      className={cn(draftSurface(false), "flex min-h-130 flex-col gap-5 px-6 pt-5 pb-4.5")}
    >
      <DraftLabel meta="Drafting from the therapist note…" />
      {SECTIONS.map((s) => (
        <div key={s.key} className="flex flex-col gap-2">
          <span className="font-serif text-section font-medium text-ink-400">{s.label}</span>
          <span className="h-3 w-11/12 animate-pulse rounded-full bg-surface-sunken" />
          <span className="h-3 w-3/4 animate-pulse rounded-full bg-surface-sunken" />
        </div>
      ))}
    </section>
  );
}

function EditForm({ id, draft }: { id: string; draft: CaseNoteDraft }) {
  const saveNote = useDemoStore((s) => s.saveNote);
  const cancelNoteEdit = useDemoStore((s) => s.cancelNoteEdit);
  const [value, setValue] = useState(draft);

  return (
    <section
      aria-label="Editing AI draft"
      className={cn(draftSurface(false), "flex flex-col gap-4 px-6 pt-5 pb-4.5")}
    >
      <DraftLabel meta="Your changes are tracked in the audit trail">
        AI Generated Draft — Editing
      </DraftLabel>
      {SECTIONS.map((field, index) => (
        <label key={field.key} className="flex flex-col gap-1.5">
          <span className="font-serif text-section font-medium">{field.label}</span>
          <textarea
            rows={field.rows}
            autoFocus={index === 0}
            value={value[field.key]}
            onChange={(e) => setValue({ ...value, [field.key]: e.target.value })}
            className="w-full resize-y rounded-control border border-border-strong bg-surface-raised px-3 py-2.5 text-body text-ink-900 outline-none focus:border-accent focus:shadow-focus"
          />
        </label>
      ))}
      <div className="flex flex-wrap items-center gap-2 border-t border-border pt-3.5">
        <Button variant="primary" onClick={() => saveNote(id, value)}>
          Save changes
        </Button>
        <Button onClick={() => cancelNoteEdit(id)}>Cancel</Button>
        <span className="ml-2 text-caption font-medium text-ink-500">
          Saving returns the draft for your final approval.
        </span>
      </div>
    </section>
  );
}

export function NoteDraft({ sample }: { sample: CaseNoteSample }) {
  const note = useDemoStore((s) => s.caseNotes[sample.id]);
  const allNotes = useDemoStore((s) => s.caseNotes);
  const approveNote = useDemoStore((s) => s.approveNote);
  const editNote = useDemoStore((s) => s.editNote);
  const regenerate = useGenerateNote(sample.id);
  const [template, setTemplate] = useState<"structured" | "soap">("structured");

  if (!note || note.mode === "empty") return <EmptyState error={note?.error ?? null} />;
  const { mode, draft, changes, generation, error } = note;
  if (mode === "generating") return <Generating />;
  if (mode === "edit") return <EditForm id={sample.id} draft={draft} />;

  const nextCase = caseNotes.find((c) => c.id !== sample.id && allNotes[c.id]?.mode !== "approved");

  const approved = mode === "approved";
  const unedited = changes === 0;
  const paired = !approved && unedited ? (generation?.pairedLine ?? null) : null;

  return (
    <section
      aria-label={approved ? "Approved summary" : "AI generated draft"}
      className={cn(draftSurface(approved), "flex flex-col gap-4.5 px-6 pt-5 pb-4.5")}
    >
      {approved ? (
        <ApprovedLabel
          meta={
            unedited
              ? "Approved without edits"
              : `Edited by clinician · ${changes} ${changes === 1 ? "change" : "changes"}`
          }
        >
          Approved by {sample.clinician} · {dt("20 Oct 2026")}
        </ApprovedLabel>
      ) : (
        <DraftLabel meta={provenance(generation, sample)} />
      )}

      <div className="flex flex-wrap items-center justify-between gap-2">
        <span className="text-caption font-medium text-ink-500">Note template</span>
        <Segmented
          label="Note template"
          value={template}
          onChange={setTemplate}
          options={[
            { id: "structured", label: "Structured" },
            { id: "soap", label: "SOAP" },
          ]}
        />
      </div>

      {!approved && error && <ErrorNotice error={error} />}

      {template === "structured" ? (
        <>
          <Section title="Session Summary">
            <Summary text={draft.summary} pairedLine={paired} />
          </Section>
          <Section title="Interventions">
            <List items={lines(draft.interventions)} />
          </Section>
          <Section title="Progress / Observations">
            <List items={lines(draft.observations)} />
          </Section>
          <Section title="Next Actions">
            <List items={lines(draft.nextActions)} />
          </Section>
        </>
      ) : (
        <>
          <Section title="S · Subjective">
            <List items={generation?.subjective ?? []} />
          </Section>
          <Section title="O · Objective">
            <List items={[...lines(draft.interventions), ...lines(draft.observations)]} />
          </Section>
          <Section title="A · Assessment">
            <Summary text={draft.summary} pairedLine={paired} />
          </Section>
          <Section title="P · Plan">
            <List items={lines(draft.nextActions)} />
          </Section>
        </>
      )}

      {!approved && <MissingInformation items={generation?.missingInformation ?? []} />}
      {approved && (
        <FollowUpSuggestions
          sample={sample}
          generation={generation}
          nextActions={lines(draft.nextActions)}
        />
      )}
      <VersionHistory sample={sample} />

      <div className="flex flex-wrap items-center justify-between gap-3 border-t border-border pt-3.5">
        {approved ? (
          <>
            <span className="text-caption font-medium text-ink-700">
              Added to clinical record · Audit entry created
            </span>
            <Link
              href={nextCase ? `/case-notes/${nextCase.id}` : "/clients-requiring-attention"}
              className="inline-flex items-center gap-1.5 text-small font-semibold text-accent"
            >
              {nextCase ? `Next note: ${nextCase.client}` : "Next: clients requiring attention"}
              <ArrowRight className="size-4" strokeWidth={1.5} aria-hidden="true" />
            </Link>
          </>
        ) : (
          <>
            <div className="flex flex-wrap items-center gap-2">
              <Button variant="primary" onClick={() => approveNote(sample.id)}>
                <Check className="size-4" strokeWidth={2} aria-hidden="true" />
                Approve note
              </Button>
              <Button onClick={() => editNote(sample.id)}>Edit</Button>
              <Button variant="ghost" onClick={() => void regenerate()}>
                Regenerate with AI
              </Button>
              <a href="#sources" className="ml-1 text-small font-semibold text-accent">
                View sources
              </a>
            </div>
            <span className="text-caption font-medium text-ink-500">
              Est. {sample.minutesSaved} minutes saved
            </span>
          </>
        )}
      </div>
    </section>
  );
}
