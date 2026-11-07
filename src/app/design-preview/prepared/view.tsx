"use client";

import { AlertCircle, Check, CircleDashed } from "lucide-react";
import Link from "next/link";
import { useEffect, useRef, useState, type ReactNode } from "react";
import { Button, ButtonLink } from "@/components/ui/button";
import { Caption, Card } from "@/components/ui/card";
import { SelectField } from "@/components/ui/segmented";
import { Tag } from "@/components/ui/tag";
import { cn } from "@/lib/cn";
import { AiMark } from "../_components/marks";
import { PreviewBar, usePreviewState } from "../_components/preview-bar";
import { ScreenTitle, Shell } from "../_components/shell";
import { noteSections, prepared } from "../_fixtures/story";

type State = "preparing" | "prepared" | "confirmed" | "partial" | "nothing";
type Selection = "report" | "form" | "upload" | "program" | "supervision";

const sourcesOf: Record<Selection, string[]> = {
  report: prepared.report.sources,
  form: prepared.form.sources,
  upload: ["s2"],
  program: ["p1"],
  supervision: ["p2"],
};

const reportDrafts = [
  [
    "Observed progress",
    "Oliver now copies circles and crosses accurately. Squares are not yet achieved. He is using his grip aid at school, and his mother reports less frustration.",
  ],
  [
    "Barriers",
    "He tires after about 10 minutes of table-top work and settles after a movement break. Endurance appears to limit table-top work more than grip at this stage.",
  ],
];

const formFields = [
  ["Client name", "Oliver Grant", "Client record"],
  ["Date of birth", "12/03/2020", "Client record"],
  ["NDIS number", "430 118 276", "NDIS plan"],
  ["Plan dates", "1 Aug 2026 to 31 Jul 2027", "NDIS plan"],
  ["Parent or guardian", "Claire Grant", "Client record"],
  ["Contact number", "0400 555 014", "Client record"],
  ["Treating clinician", "Sarah Thompson, OT", "Staff record"],
  ["Reason for request", "Paediatrician recommends further assessment", "This note, Subjective"],
  ["Paediatrician report date", "14 October 2026", "This note, Subjective"],
];

/**
 * Draws one quiet line from each source sentence to the selected item. It is the only decorative
 * element on the page, and the same links are also written out in text for screen readers.
 */
function useThread(selected: Selection | null, enabled: boolean) {
  const stage = useRef<HTMLDivElement>(null);
  const svg = useRef<SVGSVGElement>(null);

  useEffect(() => {
    const host = stage.current;
    const canvas = svg.current;
    if (!host || !canvas) return;

    const draw = () => {
      canvas.replaceChildren();
      if (!selected || !enabled || window.innerWidth < 1024) return;
      const origin = host.getBoundingClientRect();
      const target = host.querySelector(`[data-item="${selected}"]`)?.getBoundingClientRect();
      if (!target) return;
      const endX = target.left - origin.left;
      const endY = target.top - origin.top + 26;
      sourcesOf[selected].forEach((id) => {
        const box = host.querySelector(`[data-sentence="${id}"]`)?.getBoundingClientRect();
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
  }, [selected, enabled]);

  return { stage, svg };
}

function ApprovedNote({ selected }: { selected: Selection | null }) {
  const lit = selected ? sourcesOf[selected] : [];
  return (
    <section aria-labelledby="the-note" className="rounded-card border border-border bg-surface">
      <div className="border-b border-border px-5 pt-4.5 pb-3.5">
        <h2 id="the-note" className="headline text-h2">
          Oliver&apos;s approved note
        </h2>
        <div className="mt-1">
          <AiMark state="Approved">Approved by Sarah Thompson, 10:46 am</AiMark>
        </div>
      </div>
      <div className="flex flex-col gap-4 px-5 pt-4 pb-5">
        {noteSections.map((section) => (
          <div key={section.id}>
            <h3 className="mb-1 font-serif text-section font-medium">{section.title}</h3>
            <div className="flex flex-col gap-1">
              {section.sentences.map((s) => (
                <p
                  key={s.id}
                  data-sentence={s.id}
                  className={cn(
                    "-mx-2 rounded-control px-2 py-1 text-small leading-5.5 transition-colors duration-160 ease-out motion-reduce:transition-none",
                    lit.includes(s.id) && "bg-accent-tint shadow-rule-accent",
                  )}
                >
                  {s.edited ?? s.text}
                </p>
              ))}
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

function ReportItem({ selected, onSelect }: { selected: boolean; onSelect: () => void }) {
  const [open, setOpen] = useState(false);
  const r = prepared.report;
  return (
    <section
      data-item="report"
      aria-label="Progress report draft"
      className="rounded-card border border-l-2 border-border border-l-draft-rule bg-draft px-5 pt-4.5 pb-4"
    >
      <ItemHead
        title={r.title}
        detail={`${r.period}. AI drafted 4 of 5 sections from 6 approved notes.`}
        tag={<Tag tone="live">Ready for review</Tag>}
      >
        <SourceToggle active={selected} label="the report" onSelect={onSelect} />
      </ItemHead>
      <ul className="mt-3 grid gap-x-6 gap-y-1 border-t border-border pt-3 md:grid-cols-2">
        {r.sections.map((s) => (
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
          {reportDrafts.map(([heading, text]) => (
            <div key={heading}>
              <h4 className="font-serif text-section font-medium">{heading}</h4>
              <p className="mt-0.5 text-small leading-5.5">{text}</p>
            </div>
          ))}
        </div>
      )}
      <div className="mt-3.5 flex items-center gap-3">
        <Button variant="primary" onClick={() => setOpen(!open)} aria-expanded={open}>
          {open ? "Close report" : "Review report"}
        </Button>
        <Caption>Won&apos;t be sent until you approve it.</Caption>
      </div>
    </section>
  );
}

function FormItem({
  selected,
  onSelect,
  failed,
  onRetry,
}: {
  selected: boolean;
  onSelect: () => void;
  failed: boolean;
  onRetry: () => void;
}) {
  const [open, setOpen] = useState(false);
  const f = prepared.form;

  if (failed) {
    return (
      <section
        data-item="form"
        aria-label="Form could not be prefilled"
        className="rounded-card border border-border bg-surface px-5 pt-4.5 pb-4"
      >
        <ItemHead
          title={f.title}
          detail="This one needs something from you first."
          tag={<Tag tone="over">Not prefilled</Tag>}
        >
          {null}
        </ItemHead>
        <p
          role="alert"
          className="mt-3 flex items-start gap-2 rounded-control bg-over-bg px-3 py-2.5 text-small text-over"
        >
          <AlertCircle className="mt-0.5 size-4 flex-none" strokeWidth={1.5} aria-hidden="true" />
          The form wasn&apos;t prefilled because Oliver&apos;s plan end date is missing from his
          record. Add the date, then try again.
        </p>
        <div className="mt-3.5 flex items-center gap-2">
          <ButtonLink href="/clients" variant="primary">
            Add plan date
          </ButtonLink>
          <Button onClick={onRetry}>Try again</Button>
        </div>
      </section>
    );
  }

  return (
    <section
      data-item="form"
      aria-label="Prefilled form"
      className="rounded-card border border-l-2 border-border border-l-draft-rule bg-draft px-5 pt-4.5 pb-4"
    >
      <ItemHead
        title={f.title}
        detail={`${f.filled} of ${f.total} fields filled by AI from verified records. ${f.needsPerson.length} need you.`}
        tag={<Tag tone="neutral">Draft</Tag>}
      >
        <SourceToggle active={selected} label="the form" onSelect={onSelect} />
      </ItemHead>
      <div
        className="mt-3 flex h-1.5 gap-0.5"
        role="img"
        aria-label={`${f.filled} of ${f.total} fields filled`}
      >
        {Array.from({ length: f.total }, (_, i) => (
          <span
            key={i}
            className={cn("flex-1 rounded-full", i < f.filled ? "bg-accent" : "bg-border-strong")}
          />
        ))}
      </div>
      <p className="mt-2.5 text-small">
        <span className="font-semibold">Still needs a person: </span>
        {f.needsPerson.join(", ")}.
      </p>
      {open && (
        <dl className="mt-3 border-t border-border pt-2">
          {formFields.map(([label, value, from]) => (
            <div
              key={label}
              className="grid gap-x-3 border-b border-border py-1.5 text-small last:border-b-0 md:grid-cols-[150px_minmax(0,1fr)_130px]"
            >
              <dt className="text-ink-700">{label}</dt>
              <dd className="font-medium">{value}</dd>
              <dd className="text-caption font-medium text-ink-500 md:text-right">{from}</dd>
            </div>
          ))}
        </dl>
      )}
      <div className="mt-3.5 flex items-center gap-3">
        <Button onClick={() => setOpen(!open)} aria-expanded={open}>
          {open ? "Close form" : "Check form"}
        </Button>
        <Caption>Won&apos;t be submitted until you approve it.</Caption>
      </div>
    </section>
  );
}

function TaskRow({
  task,
  selected,
  onSelect,
  confirmed,
  onConfirm,
}: {
  task: (typeof prepared.tasks)[number];
  selected: boolean;
  onSelect: () => void;
  confirmed: boolean;
  onConfirm: () => void;
}) {
  const [owner, setOwner] = useState(task.owner);
  const [dismissed, setDismissed] = useState(false);
  const sentence = noteSections.flatMap((s) => s.sentences).find((s) => s.id === task.source);

  if (dismissed) {
    return (
      <li className="flex items-center justify-between gap-3 border-t border-border px-5 py-2.5">
        <Caption>Dismissed: {task.title}</Caption>
        <Button size="sm" variant="ghost" onClick={() => setDismissed(false)}>
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
          {confirmed ? <Tag tone="neutral">Scheduled</Tag> : <Tag tone="neutral">Draft</Tag>}
        </div>
      </div>
      <p className="mt-1 border-l-2 border-border-strong pl-2.5 text-small text-ink-700">
        {sentence?.text}
      </p>
      {confirmed ? (
        <div
          role="status"
          className="mt-2.5 flex flex-wrap items-center justify-between gap-2 rounded-control bg-healthy-bg px-3 py-2"
        >
          <span className="flex items-center gap-1.5 text-small font-semibold text-healthy">
            <Check className="size-3.5" strokeWidth={2} aria-hidden="true" />
            Task confirmed. It&apos;s in the admin work queue, due {task.due}.
          </span>
          <Link href="/design-preview/admin-queue" className="text-small font-semibold">
            View work queue
          </Link>
        </div>
      ) : (
        <div className="mt-2.5 flex flex-wrap items-center gap-x-4 gap-y-2">
          <SelectField label="Owner" value={owner} onChange={setOwner}>
            <option>Admin team</option>
            <option>Sarah Thompson</option>
            <option>Grace Liu</option>
          </SelectField>
          <span className="text-small text-ink-700">
            <span className="text-caption font-medium text-ink-500">Due </span>
            {task.due}
          </span>
          <span className="ml-auto flex items-center gap-1">
            <Button size="sm" variant="ghost" onClick={() => setDismissed(true)}>
              Dismiss
            </Button>
            <Button size="sm" variant="primary" onClick={onConfirm}>
              Confirm task
            </Button>
          </span>
        </div>
      )}
    </li>
  );
}

function Preparing() {
  const steps = [
    "AI is adding today's session to the NDIS progress report",
    "AI is filling the further assessment request from verified records",
    "AI is finding follow-ups in the note",
  ];
  return (
    <section aria-busy="true" aria-label="Preparing" className="max-w-200">
      <Card className="px-6 py-5">
        <h2 className="headline text-h2">Note approved. AI is preparing what follows from it.</h2>
        <ul className="mt-4 flex flex-col gap-3">
          {steps.map((s) => (
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

export function PreparedView() {
  const [state, setState] = usePreviewState<State>("prepared");
  const [selected, setSelected] = useState<Selection | null>("report");
  const showItems = state === "prepared" || state === "confirmed" || state === "partial";
  const { stage, svg } = useThread(selected, showItems);
  const toggle = (id: Selection) => setSelected(selected === id ? null : id);

  return (
    <>
      <PreviewBar href="/design-preview/prepared" />
      <Shell persona="sarah" active="AI notes" section="AI notes" page="Oliver Grant">
        {state === "preparing" && <Preparing />}

        {state === "nothing" && (
          <section className="max-w-200">
            <ScreenTitle
              title="Note approved. AI found nothing else to prepare."
              description="AI checked this note for report updates, forms and follow-ups, and none were needed."
            />
            <ButtonLink href="/design-preview/my-day?state=approved" variant="primary">
              Back to My Day
            </ButtonLink>
          </section>
        )}

        {showItems && (
          <>
            <ScreenTitle
              display
              title="What AI prepared from Oliver's note"
              description="You approved one note. AI prepared what usually follows it. Nothing has been sent or submitted, and each item waits for you."
            />

            <div className="mb-6 flex flex-wrap items-center gap-x-2 gap-y-1 text-small text-ink-700">
              <AiMark state="Draft">AI read</AiMark>
              <span>
                Oliver&apos;s approved note, 5 earlier notes, his NDIS plan and his client record.
              </span>
            </div>

            <div
              ref={stage}
              className="relative grid items-start gap-6 lg:grid-cols-12 lg:gap-x-16"
            >
              <svg
                ref={svg}
                aria-hidden="true"
                className="pointer-events-none absolute inset-0 hidden size-full overflow-visible lg:block"
              />
              <div className="lg:col-span-5">
                <ApprovedNote selected={selected} />
              </div>

              <div className="flex min-w-0 flex-col gap-4 lg:col-span-7">
                <ReportItem selected={selected === "report"} onSelect={() => toggle("report")} />
                <FormItem
                  selected={selected === "form"}
                  onSelect={() => toggle("form")}
                  failed={state === "partial"}
                  onRetry={() => setState("prepared")}
                />
                <section
                  aria-labelledby="follow-ups"
                  className="rounded-card border border-l-2 border-border border-l-draft-rule bg-draft"
                >
                  <div className="px-5 pt-4.5 pb-3.5">
                    <h3 id="follow-ups" className="headline text-h2">
                      3 follow-ups AI found
                    </h3>
                    <p className="text-small text-ink-700">
                      AI found each one in a sentence of the note. None is created until you confirm
                      it.
                    </p>
                  </div>
                  <ul>
                    {prepared.tasks.map((t) => (
                      <TaskRow
                        key={t.id}
                        task={t}
                        selected={selected === t.id}
                        onSelect={() => toggle(t.id as Selection)}
                        confirmed={t.id === "upload" && state === "confirmed"}
                        onConfirm={() => {
                          if (t.id === "upload") setState("confirmed");
                        }}
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
                <ButtonLink href="/design-preview/my-day?state=approved" className="mt-3">
                  Back to My Day
                </ButtonLink>
              </div>
              <ul className="grid gap-x-6 gap-y-2 md:grid-cols-2 lg:col-span-7">
                {prepared.notRepeated.map((step) => (
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
        )}
      </Shell>
    </>
  );
}
