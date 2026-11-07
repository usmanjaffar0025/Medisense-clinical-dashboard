"use client";

import { Check, CircleDashed } from "lucide-react";
import Link from "next/link";
import { useEffect, useRef, useState, type ReactNode } from "react";
import { AiMark } from "@/components/ai/marks";
import { Button, ButtonLink } from "@/components/ui/button";
import { Caption, Card } from "@/components/ui/card";
import { ScreenTitle } from "@/components/ui/page";
import { SelectField } from "@/components/ui/segmented";
import { Tag } from "@/components/ui/tag";
import {
  formPersonFields,
  formRecordFields,
  formTitle,
  notRepeatedSteps,
  preparedOutputs,
  reportFixedSections,
  reportPeriod,
  reportTitle,
} from "@/data/story";
import { cn } from "@/lib/cn";
import { workingDayLabel } from "@/lib/clock";
import {
  allSentences,
  noteSectionTitles,
  type Prepared,
  type SessionNote,
} from "@/lib/story/types";
import { useDemoStore } from "@/state/demo-store";
import { callStory } from "@/state/use-story-ai";

let preparing = false;

/** Draws one quiet line from each source sentence to the selected item. */
function useThread(selected: string | null, sources: string[], enabled: boolean) {
  const stage = useRef<HTMLDivElement>(null);
  const svg = useRef<SVGSVGElement>(null);
  const key = sources.join(",");

  useEffect(() => {
    const host = stage.current;
    const canvas = svg.current;
    if (!host || !canvas) return undefined;

    const draw = () => {
      canvas.replaceChildren();
      if (!selected || !enabled || window.innerWidth < 1024) return;
      const origin = host.getBoundingClientRect();
      const target = host.querySelector(`[data-item="${selected}"]`)?.getBoundingClientRect();
      if (!target) return;
      const endX = target.left - origin.left;
      const endY = target.top - origin.top + 26;
      key.split(",").forEach((id) => {
        const box = id && host.querySelector(`[data-sentence="${id}"]`)?.getBoundingClientRect();
        if (!box) return;
        const startX = box.right - origin.left + 4;
        const startY = box.top - origin.top + box.height / 2;
        const bend = (endX - startX) * 0.55;
        const path = document.createElementNS("http://www.w3.org/2000/svg", "path");
        path.setAttribute(
          "d",
          `M${startX} ${startY} C${startX + bend} ${startY} ${endX - bend} ${endY} ${endX} ${endY}`,
        );
        path.setAttribute("fill", "none");
        path.setAttribute("stroke", "var(--color-accent-fill)");
        path.setAttribute("stroke-width", "1.5");
        canvas.append(path);
      });
    };

    draw();
    const observer = new ResizeObserver(draw);
    observer.observe(host);
    return () => observer.disconnect();
  }, [selected, key, enabled]);

  return { stage, svg };
}

function ApprovedNote({
  note,
  lit,
  approvedAt,
}: {
  note: SessionNote;
  lit: string[];
  approvedAt: string;
}) {
  return (
    <section
      aria-labelledby="the-note"
      className="rounded-card border border-border bg-surface surface-lift"
    >
      <div className="border-b border-border px-5 pt-4.5 pb-3.5">
        <h2 id="the-note" className="headline text-h2">
          Oliver&apos;s approved note
        </h2>
        <div className="mt-1">
          <AiMark state="Approved">Approved by Sarah Thompson, {approvedAt}</AiMark>
        </div>
      </div>
      <div className="flex flex-col gap-4 px-5 pt-4 pb-5">
        {noteSectionTitles.map((section) => (
          <div key={section.id}>
            <h3 className="mb-1 font-serif text-section font-medium">{section.title}</h3>
            <div className="flex flex-col gap-1">
              {note.sections[section.id].map((s) => (
                <p
                  key={s.id}
                  data-sentence={s.id}
                  className={cn(
                    "-mx-2 rounded-control px-2 py-1 text-small leading-5.5 transition-colors duration-160 ease-out motion-reduce:transition-none",
                    lit.includes(s.id) && "bg-accent-tint shadow-rule-accent",
                  )}
                >
                  {s.text}
                </p>
              ))}
              {note.sections[section.id].length === 0 && (
                <p className="text-small text-ink-500 italic">Nothing recorded.</p>
              )}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

function SourceToggle({
  active,
  label,
  onSelect,
}: {
  active: boolean;
  label: string;
  onSelect: () => void;
}) {
  return (
    <button
      type="button"
      aria-pressed={active}
      aria-label={`Show where ${label} came from in the note`}
      onClick={onSelect}
      className={cn(
        "cursor-pointer rounded-tag px-1.5 py-0.5 text-caption font-semibold",
        active ? "bg-accent-tint text-accent" : "text-accent hover:bg-accent-tint",
      )}
    >
      {active ? "Showing source" : "Show source"}
    </button>
  );
}

function ItemHead({
  title,
  detail,
  tag,
  children,
}: {
  title: ReactNode;
  detail: ReactNode;
  tag: ReactNode;
  children: ReactNode;
}) {
  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-x-3 gap-y-1">
        <h3 className="headline text-h2">{title}</h3>
        <div className="flex items-center gap-2">
          {children}
          {tag}
        </div>
      </div>
      <p className="mt-0.5 text-small text-ink-700">{detail}</p>
    </div>
  );
}

function ReportItem({
  prepared,
  selected,
  onSelect,
}: {
  prepared: Prepared;
  selected: boolean;
  onSelect: () => void;
}) {
  const status = useDemoStore((s) => s.story.reportStatus);
  const edits = useDemoStore((s) => s.story.reportEdits);
  const editSection = useDemoStore((s) => s.editReportSection);
  const approve = useDemoStore((s) => s.approveStoryReport);
  const [open, setOpen] = useState(false);
  const approved = status === "approved";
  const sections = prepared.report;
  const nextSteps = edits["Recommended next steps"] ?? "";

  return (
    <section
      data-item="report"
      aria-label="Progress report draft"
      className={cn(
        "rounded-card border border-border px-5 pt-4.5 pb-4",
        approved ? "bg-surface" : "border-l-2 border-l-draft-rule bg-draft",
      )}
    >
      <ItemHead
        title={reportTitle}
        detail={`${reportPeriod}. AI drafted ${sections.length + 1} of ${sections.length + 2} sections from 6 approved notes.`}
        tag={
          approved ? <Tag tone="healthy">Approved</Tag> : <Tag tone="live">Ready for review</Tag>
        }
      >
        <SourceToggle active={selected} label="the report" onSelect={onSelect} />
      </ItemHead>
      <ul className="mt-3 grid gap-x-6 gap-y-1 border-t border-border pt-3 md:grid-cols-2">
        {[
          {
            name: reportFixedSections[0]?.name ?? "",
            from: reportFixedSections[0]?.from ?? "",
            filled: true,
          },
          ...sections.map((s) => ({ name: s.name, from: s.from, filled: true })),
          {
            name: reportFixedSections[1]?.name ?? "",
            from: reportFixedSections[1]?.from ?? "",
            filled: Boolean(nextSteps),
          },
        ].map((s) => (
          <li key={s.name} className="flex items-start gap-2 text-small">
            {s.filled ? (
              <Check
                className="mt-0.5 size-3.5 flex-none text-healthy"
                strokeWidth={2}
                aria-hidden="true"
              />
            ) : (
              <CircleDashed
                className="mt-0.5 size-3.5 flex-none text-ink-500"
                strokeWidth={1.5}
                aria-hidden="true"
              />
            )}
            <span>
              {s.name}
              <span className="block text-caption font-medium text-ink-500">{s.from}</span>
            </span>
          </li>
        ))}
      </ul>
      {open && (
        <div className="mt-3 flex flex-col gap-3 border-t border-border pt-3">
          {sections.map((s) => (
            <label key={s.name} className="flex flex-col gap-1">
              <span className="font-serif text-section font-medium">{s.name}</span>
              <textarea
                rows={3}
                disabled={approved}
                value={edits[s.name] ?? s.text}
                onChange={(e) => editSection(s.name, e.target.value)}
                className="w-full resize-y rounded-control border border-border-strong bg-surface-raised px-3 py-2 text-small leading-5.5 text-ink-900 outline-none focus:border-accent disabled:bg-surface-sunken"
              />
            </label>
          ))}
          <label className="flex flex-col gap-1">
            <span className="font-serif text-section font-medium">Recommended next steps</span>
            <textarea
              rows={2}
              disabled={approved}
              value={nextSteps}
              placeholder="AI leaves this to you."
              onChange={(e) => editSection("Recommended next steps", e.target.value)}
              className="w-full resize-y rounded-control border border-border-strong bg-surface-raised px-3 py-2 text-small leading-5.5 text-ink-900 outline-none placeholder:text-ink-500 focus:border-accent disabled:bg-surface-sunken"
            />
          </label>
        </div>
      )}
      <div className="mt-3.5 flex flex-wrap items-center gap-3">
        <Button
          variant={open ? "secondary" : "primary"}
          aria-expanded={open}
          onClick={() => setOpen(!open)}
        >
          {open ? "Close report" : "Review report"}
        </Button>
        {open && !approved && (
          <Button variant="primary" disabled={!nextSteps.trim()} onClick={approve}>
            Approve report
          </Button>
        )}
        <Caption>
          {approved
            ? "Report approved. It hasn't been sent."
            : open
              ? nextSteps.trim()
                ? "Won't be sent until you approve it."
                : "Add your next steps to approve the report."
              : "Won't be sent until you approve it."}
        </Caption>
      </div>
    </section>
  );
}

function FormItem({
  prepared,
  selected,
  onSelect,
}: {
  prepared: Prepared;
  selected: boolean;
  onSelect: () => void;
}) {
  const values = useDemoStore((s) => s.story.formValues);
  const status = useDemoStore((s) => s.story.formStatus);
  const setValue = useDemoStore((s) => s.setStoryFormValue);
  const approve = useDemoStore((s) => s.approveStoryForm);
  const [open, setOpen] = useState(false);
  const approved = status === "approved";
  const reason = values.reason ?? prepared.formReason;
  const total = formRecordFields.length + 1 + formPersonFields.length;
  const missing = formPersonFields.filter((f) => !values[f.id]?.trim());
  const filled = total - missing.length - (reason ? 0 : 1);

  return (
    <section
      data-item="form"
      aria-label="Prefilled form"
      className={cn(
        "rounded-card border border-border px-5 pt-4.5 pb-4",
        approved ? "bg-surface" : "border-l-2 border-l-draft-rule bg-draft",
      )}
    >
      <ItemHead
        title={formTitle}
        detail={`${filled} of ${total} fields filled by AI from verified records. ${missing.length} need you.`}
        tag={approved ? <Tag tone="healthy">Approved</Tag> : <Tag tone="neutral">Draft</Tag>}
      >
        <SourceToggle active={selected} label="the form" onSelect={onSelect} />
      </ItemHead>
      <div
        className="mt-3 flex h-1.5 gap-0.5"
        role="img"
        aria-label={`${filled} of ${total} fields filled`}
      >
        {Array.from({ length: total }, (_, i) => (
          <span
            key={i}
            className={cn("flex-1 rounded-full", i < filled ? "bg-accent" : "bg-border-strong")}
          />
        ))}
      </div>
      {missing.length > 0 && (
        <p className="mt-2.5 text-small">
          <span className="font-semibold">Still needs a person: </span>
          {missing.map((f) => f.label).join(", ")}.
        </p>
      )}
      {open && (
        <dl className="mt-3 border-t border-border pt-2">
          {formRecordFields.map((f) => (
            <div
              key={f.label}
              className="grid gap-x-3 border-b border-border py-1.5 text-small md:grid-cols-[150px_minmax(0,1fr)_130px]"
            >
              <dt className="text-ink-700">{f.label}</dt>
              <dd className="font-medium">{f.value}</dd>
              <dd className="text-caption font-medium text-ink-500 md:text-right">{f.from}</dd>
            </div>
          ))}
          <div className="grid items-center gap-x-3 border-b border-border py-1.5 text-small md:grid-cols-[150px_minmax(0,1fr)_130px]">
            <dt className="text-ink-700">Reason for request</dt>
            <dd>
              <input
                aria-label="Reason for request"
                disabled={approved}
                value={reason}
                onChange={(e) => setValue("reason", e.target.value)}
                className="h-8 w-full rounded-control border border-border-strong bg-surface-raised px-2.5 text-small text-ink-900 outline-none focus:border-accent disabled:bg-surface-sunken"
              />
            </dd>
            <dd className="text-caption font-medium text-brass md:text-right">
              AI, from this note
            </dd>
          </div>
          {formPersonFields.map((f) => (
            <div
              key={f.id}
              className={cn(
                "grid items-center gap-x-3 border-b border-border py-1.5 text-small last:border-b-0 md:grid-cols-[150px_minmax(0,1fr)_130px]",
                !values[f.id]?.trim() && "bg-monitor-bg",
              )}
            >
              <dt className="text-ink-700">{f.label}</dt>
              <dd>
                <input
                  aria-label={f.label}
                  disabled={approved}
                  value={values[f.id] ?? ""}
                  placeholder="Type to complete"
                  onChange={(e) => setValue(f.id, e.target.value)}
                  className="h-8 w-full rounded-control border border-border-strong bg-surface-raised px-2.5 text-small text-ink-900 outline-none placeholder:text-ink-500 focus:border-accent disabled:bg-surface-sunken"
                />
              </dd>
              <dd className="text-caption font-medium text-ink-500 md:text-right">
                Needs a person
              </dd>
            </div>
          ))}
        </dl>
      )}
      <div className="mt-3.5 flex flex-wrap items-center gap-3">
        <Button aria-expanded={open} onClick={() => setOpen(!open)}>
          {open ? "Close form" : "Check form"}
        </Button>
        {open && !approved && (
          <Button variant="primary" disabled={missing.length > 0} onClick={approve}>
            Approve form
          </Button>
        )}
        <Caption>
          {approved
            ? "Form approved. It hasn't been submitted."
            : "Won't be submitted until you approve it."}
        </Caption>
      </div>
    </section>
  );
}

function TaskRow({
  task,
  note,
  selected,
  onSelect,
}: {
  task: Prepared["tasks"][number];
  note: SessionNote;
  selected: boolean;
  onSelect: () => void;
}) {
  const choice = useDemoStore((s) => s.story.taskChoices[task.id] ?? "draft");
  const ownerOverride = useDemoStore((s) => s.story.taskOwners[task.id]);
  const dayOffset = useDemoStore((s) => s.story.dayOffset);
  const setOwner = useDemoStore((s) => s.setTaskOwner);
  const confirm = useDemoStore((s) => s.confirmStoryTask);
  const dismiss = useDemoStore((s) => s.dismissStoryTask);
  const restore = useDemoStore((s) => s.restoreStoryTask);
  const owner = ownerOverride ?? task.owner;
  const due = workingDayLabel(dayOffset, task.dueInWorkingDays);
  const sentence = allSentences(note).find((s) => s.id === task.sentenceId);
  const adminOwned = owner === "Admin team";

  if (choice === "dismissed") {
    return (
      <li className="flex items-center justify-between gap-3 border-t border-border px-5 py-2.5">
        <Caption>Dismissed: {task.title}</Caption>
        <Button size="sm" variant="ghost" onClick={() => restore(task.id)}>
          Undo
        </Button>
      </li>
    );
  }

  return (
    <li data-item={task.id} className="border-t border-border px-5 py-3.5">
      <div className="flex flex-wrap items-start justify-between gap-x-3 gap-y-1">
        <span className="font-semibold">{task.title}</span>
        <div className="flex items-center gap-2">
          <SourceToggle active={selected} label="this task" onSelect={onSelect} />
          <Tag tone="neutral">{choice === "confirmed" ? "Scheduled" : "Draft"}</Tag>
        </div>
      </div>
      {sentence && (
        <p className="mt-1 border-l-2 border-border-strong pl-2.5 text-small text-ink-700">
          {sentence.text}
        </p>
      )}
      {choice === "confirmed" ? (
        <div
          role="status"
          className="mt-2.5 flex flex-wrap items-center justify-between gap-2 rounded-control bg-healthy-bg px-3 py-2"
        >
          <span className="flex items-center gap-1.5 text-small font-semibold text-healthy">
            <Check className="size-3.5" strokeWidth={2} aria-hidden="true" />
            {adminOwned
              ? `Task confirmed. It's in the admin work queue, due ${due}.`
              : `Task confirmed. It's with ${owner}, due ${due}.`}
          </span>
          {adminOwned && (
            <Link href="/admin-queue" className="text-small font-semibold">
              View work queue
            </Link>
          )}
        </div>
      ) : (
        <div className="mt-2.5 flex flex-wrap items-center gap-x-4 gap-y-2">
          <SelectField label="Owner" value={owner} onChange={(v) => setOwner(task.id, v)}>
            <option>Admin team</option>
            <option>Sarah Thompson</option>
            <option>Grace Liu</option>
          </SelectField>
          <span className="text-small text-ink-700">
            <span className="text-caption font-medium text-ink-500">Due </span>
            {due}
          </span>
          <span className="ml-auto flex items-center gap-1">
            <Button size="sm" variant="ghost" onClick={() => dismiss(task.id)}>
              Dismiss
            </Button>
            <Button size="sm" variant="primary" onClick={() => confirm(task.id)}>
              Confirm task
            </Button>
          </span>
        </div>
      )}
    </li>
  );
}

/** Keeps prepared output usable with a live note whose sentence ids may differ. */
function preparedFor(note: SessionNote): Prepared {
  const ids = new Set(allSentences(note).map((s) => s.id));
  return {
    report: preparedOutputs.report.map((r) => ({
      ...r,
      sources: r.sources.filter((id) => ids.has(id)),
    })),
    formReason: preparedOutputs.formReason,
    formSources: preparedOutputs.formSources.filter((id) => ids.has(id)),
    tasks: preparedOutputs.tasks.filter((t) => ids.has(t.sentenceId)),
  };
}

export function PreparedView() {
  const stage = useDemoStore((s) => s.story.stage);
  const note = useDemoStore((s) => s.story.note);
  const approvedAt = useDemoStore((s) => s.story.approvedAt);
  const status = useDemoStore((s) => s.story.prepareStatus);
  const prepared = useDemoStore((s) => s.story.prepared);
  const outdated = useDemoStore((s) => s.story.outdated);
  const complete = useDemoStore((s) => s.completePrepare);
  const approved = stage === "approved";
  const [selected, setSelected] = useState<string | null>("report");

  useEffect(() => {
    if (!approved || !note || preparing) return;
    if (status === "ready" && prepared && !outdated) return;
    preparing = true;
    void callStory<Prepared>({ kind: "prepare", note }).then((result) => {
      preparing = false;
      if ("error" in result) {
        complete(preparedFor(note), { source: "prepared", model: null, latencyMs: null });
      } else {
        complete(result.data, result.meta);
      }
    });
  }, [approved, note, status, prepared, outdated, complete]);

  const sourcesOf = (id: string | null): string[] => {
    if (!prepared || !id) return [];
    if (id === "report") return [...new Set(prepared.report.flatMap((r) => r.sources))];
    if (id === "form") return prepared.formSources;
    const task = prepared.tasks.find((t) => t.id === id);
    return task ? [task.sentenceId] : [];
  };
  const lit = sourcesOf(selected);
  const ready = approved && status === "ready" && prepared !== null;
  const { stage: host, svg } = useThread(selected, lit, ready);
  const toggle = (id: string) => setSelected(selected === id ? null : id);

  if (!note || (!approved && !prepared)) {
    return (
      <section className="max-w-200">
        <ScreenTitle
          title="Nothing prepared yet"
          description="Approve Oliver's note first. AI then prepares what follows from it."
        />
        <ButtonLink href="/sessions/oliver-grant" variant="primary">
          Go to the note
        </ButtonLink>
      </section>
    );
  }

  if (!approved && prepared) {
    return (
      <section className="max-w-200">
        <ScreenTitle
          title="This is out of date"
          description="The note was reopened, so what AI prepared may no longer match it. Approve the note again and AI will prepare it again."
        />
        <ButtonLink href="/sessions/oliver-grant" variant="primary">
          Go to the note
        </ButtonLink>
      </section>
    );
  }

  if (!ready || !prepared) {
    return (
      <section aria-busy="true" aria-label="Preparing" className="max-w-200">
        <Card className="px-6 py-5">
          <h2 className="headline text-h2">Note approved. AI is preparing what follows from it.</h2>
          <ul className="mt-4 flex flex-col gap-3">
            {[
              "AI is adding today's session to the NDIS progress report",
              "AI is filling the further assessment request from verified records",
              "AI is finding follow-ups in the note",
            ].map((s) => (
              <li key={s}>
                <span className="text-small">{s}</span>
                <span className="mt-1.5 block h-1 w-full animate-pulse rounded-full bg-border motion-reduce:animate-none" />
              </li>
            ))}
          </ul>
          <Caption className="mt-4">
            You can leave this page. Everything will be waiting on My Day.
          </Caption>
        </Card>
      </section>
    );
  }

  const nothing =
    prepared.report.length === 0 && prepared.tasks.length === 0 && !prepared.formReason;
  if (nothing) {
    return (
      <section className="max-w-200">
        <ScreenTitle
          title="Note approved. AI found nothing else to prepare."
          description="AI checked this note for report updates, forms and follow-ups, and none were needed."
        />
        <ButtonLink href="/my-day" variant="primary">
          Back to My Day
        </ButtonLink>
      </section>
    );
  }

  return (
    <>
      <ScreenTitle
        display
        title="What AI prepared from Oliver's note"
        description="You approved one note. AI prepared what usually follows it. Nothing has been sent or submitted, and each item waits for you."
      />

      <div className="mb-6 flex flex-wrap items-center gap-x-2 gap-y-1 text-small text-ink-700">
        <AiMark>AI read</AiMark>
        <span>
          Oliver&apos;s approved note, 5 earlier notes, his NDIS plan and his client record.
        </span>
      </div>

      <div ref={host} className="relative grid items-start gap-6 lg:grid-cols-12 lg:gap-x-16">
        <svg
          ref={svg}
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 hidden size-full overflow-visible lg:block"
        />
        <div className="lg:col-span-5">
          <ApprovedNote note={note} lit={lit} approvedAt={approvedAt ?? ""} />
        </div>

        <div className="flex min-w-0 flex-col gap-4 lg:col-span-7">
          <ReportItem
            prepared={prepared}
            selected={selected === "report"}
            onSelect={() => toggle("report")}
          />
          <FormItem
            prepared={prepared}
            selected={selected === "form"}
            onSelect={() => toggle("form")}
          />
          <section
            aria-labelledby="follow-ups"
            className="rounded-card border border-l-2 border-border border-l-draft-rule bg-draft"
          >
            <div className="px-5 pt-4.5 pb-3.5">
              <h3 id="follow-ups" className="headline text-h2">
                {prepared.tasks.length} {prepared.tasks.length === 1 ? "follow-up" : "follow-ups"}{" "}
                AI found
              </h3>
              <p className="text-small text-ink-700">
                AI found each one in a sentence of the note. None is created until you confirm it.
              </p>
            </div>
            <ul>
              {prepared.tasks.map((t) => (
                <TaskRow
                  key={t.id}
                  task={t}
                  note={note}
                  selected={selected === t.id}
                  onSelect={() => toggle(t.id)}
                />
              ))}
            </ul>
          </section>
        </div>
      </div>

      <section
        aria-labelledby="not-repeated"
        className="mt-8 grid gap-x-16 gap-y-3 border-t border-border-strong pt-5 lg:grid-cols-12"
      >
        <div className="lg:col-span-5">
          <h2 id="not-repeated" className="headline text-h2">
            Steps you didn&apos;t have to repeat
          </h2>
          <ButtonLink href="/my-day" className="mt-3">
            Back to My Day
          </ButtonLink>
        </div>
        <ul className="grid gap-x-6 gap-y-2 md:grid-cols-2 lg:col-span-7">
          {notRepeatedSteps.map((step) => (
            <li key={step} className="flex items-start gap-2 text-small">
              <Check
                className="mt-0.5 size-3.5 flex-none text-ink-500"
                strokeWidth={2}
                aria-hidden="true"
              />
              {step}
            </li>
          ))}
        </ul>
      </section>
    </>
  );
}
