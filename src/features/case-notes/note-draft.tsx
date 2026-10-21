"use client";

import { ArrowRight, Check } from "lucide-react";
import Link from "next/link";
import { useState, type ReactNode } from "react";
import { ApprovedLabel, DraftLabel, PenNib, draftSurface } from "@/components/ai/provenance";
import { Button } from "@/components/ui/button";
import { miaCaseNote } from "@/data/case-note";
import { cn } from "@/lib/cn";
import { useDemoStore, type CaseNoteDraft } from "@/state/demo-store";

function lines(text: string) {
  return text
    .split("\n")
    .map((l) => l.trim())
    .filter(Boolean);
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
  return (
    <ul className="flex list-disc flex-col gap-0.5 pl-4.5">
      {items.map((item) => (
        <li key={item}>{item}</li>
      ))}
    </ul>
  );
}

function Summary({ text, paired }: { text: string; paired: boolean }) {
  const lead = miaCaseNote.draft.summaryLead;
  if (!paired || !text.startsWith(lead)) return <p className="leading-5.5">{text}</p>;
  return (
    <p className="leading-5.5">
      <span className="rounded-xs bg-accent-tint py-px shadow-underline-accent">{lead}</span>{" "}
      <span className="inline-flex h-4.5 items-center rounded-tag bg-accent px-1.5 align-baseline text-eyebrow font-semibold text-white">
        Line {miaCaseNote.pairedLine + 1}
      </span>{" "}
      {text.slice(lead.length).trim()}
    </p>
  );
}

function EmptyState() {
  return (
    <div className="flex min-h-130 flex-col items-start justify-center gap-2.5 rounded-card border border-dashed border-border-strong bg-surface p-10">
      <PenNib className="size-5 text-brass" />
      <p className="max-w-95 headline text-h2 text-ink-700">
        The structured draft will appear here for your review.
      </p>
      <p className="max-w-95 text-small text-ink-500">
        Session summary, interventions and next actions, each traceable to a line in the therapist’s
        note.
      </p>
    </div>
  );
}

function EditForm({ draft }: { draft: CaseNoteDraft }) {
  const saveNote = useDemoStore((s) => s.saveNote);
  const cancelNoteEdit = useDemoStore((s) => s.cancelNoteEdit);
  const [value, setValue] = useState(draft);

  const fields: { key: keyof CaseNoteDraft; label: string; rows: number }[] = [
    { key: "summary", label: "Session Summary", rows: 4 },
    { key: "interventions", label: "Interventions", rows: 3 },
    { key: "nextActions", label: "Next Actions", rows: 3 },
  ];

  return (
    <section
      aria-label="Editing AI draft"
      className={cn(draftSurface(false), "flex flex-col gap-4 px-6 pt-5 pb-4.5")}
    >
      <DraftLabel meta="Your changes are tracked in the audit trail">
        AI Generated Draft — Editing
      </DraftLabel>
      {fields.map((field, index) => (
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
        <Button variant="primary" onClick={() => saveNote(value)}>
          Save changes
        </Button>
        <Button onClick={cancelNoteEdit}>Cancel</Button>
        <span className="ml-2 text-caption font-medium text-ink-500">
          Saving returns the draft for your final approval.
        </span>
      </div>
    </section>
  );
}

export function NoteDraft() {
  const { mode, draft, changes } = useDemoStore((s) => s.caseNote);
  const approveNote = useDemoStore((s) => s.approveNote);
  const editNote = useDemoStore((s) => s.editNote);
  const regenerateNote = useDemoStore((s) => s.regenerateNote);

  if (mode === "empty") return <EmptyState />;
  if (mode === "edit") return <EditForm draft={draft} />;

  const approved = mode === "approved";
  const unedited = changes === 0;

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
          Approved by {miaCaseNote.clinician} · 20 Oct 2026, 10:46
        </ApprovedLabel>
      ) : (
        <DraftLabel meta={miaCaseNote.generatedAt} />
      )}

      <Section title="Session Summary">
        <Summary text={draft.summary} paired={!approved && unedited} />
      </Section>
      <Section title="Interventions">
        <List items={lines(draft.interventions)} />
      </Section>
      <Section title="Next Actions">
        <List items={lines(draft.nextActions)} />
      </Section>

      <div className="flex flex-wrap items-center justify-between gap-3 border-t border-border pt-3.5">
        {approved ? (
          <>
            <span className="text-caption font-medium text-ink-700">
              Added to clinical record · Audit entry created
            </span>
            <Link
              href="/clients-requiring-attention"
              className="inline-flex items-center gap-1.5 text-small font-semibold text-accent"
            >
              Next: clients requiring attention
              <ArrowRight className="size-4" strokeWidth={1.5} aria-hidden="true" />
            </Link>
          </>
        ) : (
          <>
            <div className="flex flex-wrap items-center gap-2">
              <Button variant="primary" onClick={approveNote}>
                <Check className="size-4" strokeWidth={2} aria-hidden="true" />
                Accept
              </Button>
              <Button onClick={editNote}>Edit</Button>
              <Button variant="ghost" onClick={regenerateNote}>
                Regenerate
              </Button>
              <a href="#sources" className="ml-1 text-small font-semibold text-accent">
                View sources
              </a>
            </div>
            <span className="text-caption font-medium text-ink-500">{miaCaseNote.timeSaved}</span>
          </>
        )}
      </div>
    </section>
  );
}
