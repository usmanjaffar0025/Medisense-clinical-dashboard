"use client";

import { Check, Clock } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Caption, Card, CardTitle } from "@/components/ui/card";
import { Avatar, Ring } from "@/components/ui/premium";
import { Segmented } from "@/components/ui/segmented";
import { Sheet } from "@/components/ui/sheet";
import { StatRow } from "@/components/ui/stat-row";
import { Tag, type TagTone } from "@/components/ui/tag";
import {
  inpatients,
  inpatientStages,
  theatreList,
  wardBeds,
  type InpatientStage,
} from "@/data/operations";
import { cn } from "@/lib/cn";
import { useDemoStore } from "@/state/demo-store";

const stageTone: Record<InpatientStage, TagTone> = {
  New: "over",
  Accepted: "monitor",
  Seen: "available",
  "Ready for discharge": "healthy",
};
const stageRule: Record<InpatientStage, string> = {
  New: "bg-over-dot",
  Accepted: "bg-monitor-dot",
  Seen: "bg-available-dot",
  "Ready for discharge": "bg-healthy-dot",
};
const nextLabel: Partial<Record<InpatientStage, string>> = {
  New: "Accept referral",
  Accepted: "Mark as seen",
  Seen: "Ready for discharge",
};

export function HospitalOperations() {
  const ops = useDemoStore((s) => s.ops);
  const setOp = useDemoStore((s) => s.setOp);
  const [view, setView] = useState<"board" | "wards" | "theatre">("board");
  const [openId, setOpenId] = useState<string | null>(null);
  const [draft, setDraft] = useState("");
  const stageOf = (id: string, seed: InpatientStage) =>
    (ops[`inpatient:${id}`] as InpatientStage | undefined) ?? seed;
  const patients = inpatients.map((p) => ({ ...p, current: stageOf(p.id, p.stage) }));
  const count = (stage: InpatientStage) => patients.filter((p) => p.current === stage).length;
  const reviewed = theatreList.filter((t) => ops[`theatre:${t.id}`] === "done").length;
  const open = patients.find((p) => p.id === openId);

  const advance = (p: (typeof patients)[number]) => {
    const next = inpatientStages[inpatientStages.indexOf(p.current) + 1];
    if (next) setOp(`inpatient:${p.id}`, next, `Inpatient moved to ${next}`, p.name);
  };

  return (
    <>
      <StatRow
        label="Hospital summary"
        stats={[
          { label: "New referrals", value: count("New"), caption: "Waiting to be accepted" },
          { label: "Waiting to be seen", value: count("Accepted"), caption: "Accepted" },
          {
            label: "Ready for discharge",
            value: count("Ready for discharge"),
            caption: "Allied health complete",
          },
          {
            label: "Pre-op reviews",
            value: `${reviewed} of ${theatreList.length}`,
            caption: "On today's theatre list",
          },
        ]}
      />
      <div className="mt-6 flex">
        <Segmented
          label="Hospital view"
          value={view}
          onChange={setView}
          options={[
            { id: "board", label: "Referral board" },
            { id: "wards", label: "Wards" },
            { id: "theatre", label: "Theatre" },
          ]}
        />
      </div>

      {view === "board" && (
        <div className="mt-4 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {inpatientStages.map((stage) => {
            const column = patients.filter((p) => p.current === stage);
            return (
              <section
                key={stage}
                aria-label={stage}
                className="flex flex-col gap-2.5 rounded-card bg-canvas p-3"
              >
                <header className="flex items-center justify-between gap-2 px-1">
                  <h2 className="flex items-center gap-2 text-small font-semibold">
                    <i aria-hidden="true" className={cn("size-2 rounded-full", stageRule[stage])} />
                    {stage}
                  </h2>
                  <span className="text-caption font-semibold text-ink-500">{column.length}</span>
                </header>
                {column.length === 0 && (
                  <p className="px-1 py-3 text-caption text-ink-500">No patients here.</p>
                )}
                {column.map((p) => (
                  <article
                    key={p.id}
                    className="rounded-control border border-border bg-surface p-3 surface-lift"
                  >
                    <button
                      type="button"
                      aria-label={p.name}
                      onClick={() => setOpenId(p.id)}
                      className="flex w-full cursor-pointer items-center gap-2.5 text-left"
                    >
                      <Avatar name={p.name} size={34} />
                      <span className="min-w-0">
                        <span className="block truncate text-small font-semibold">{p.name}</span>
                        <span className="block text-caption text-ink-500">
                          {p.ward}, bed {p.bed}
                        </span>
                      </span>
                    </button>
                    <p className="mt-2 text-caption text-ink-700">{p.need}</p>
                    {nextLabel[stage] && (
                      <Button size="sm" className="mt-2.5 w-full" onClick={() => advance(p)}>
                        {nextLabel[stage]}
                      </Button>
                    )}
                  </article>
                ))}
              </section>
            );
          })}
        </div>
      )}

      {view === "wards" && (
        <div className="mt-4 grid gap-4 md:grid-cols-2">
          {wardBeds.map((w) => {
            const list = patients.filter((p) => p.ward === w.ward);
            const percent = Math.round((w.occupied / w.beds) * 100);
            return (
              <Card key={w.ward} aria-labelledby={`ward-${w.ward}`} className="px-5 py-5">
                <CardTitle
                  id={`ward-${w.ward}`}
                  title={w.ward}
                  description={`${w.specialty}, ${list.length} with allied health`}
                  aside={
                    <Ring
                      percent={percent}
                      size={60}
                      stroke={6}
                      label={`${percent}% of beds occupied`}
                    >
                      <span className="text-caption font-bold">{percent}%</span>
                    </Ring>
                  }
                />
                <div
                  role="img"
                  aria-label={`${w.occupied} of ${w.beds} beds occupied`}
                  className="mt-4 grid grid-cols-12 gap-1"
                >
                  {Array.from({ length: w.beds }, (_, i) => (
                    <i
                      key={i}
                      className={cn(
                        "h-5 rounded-tag",
                        i < w.occupied
                          ? "bg-accent-fill"
                          : "bg-canvas ring-1 ring-border ring-inset",
                      )}
                    />
                  ))}
                </div>
                <Caption className="mt-2">
                  {w.occupied} of {w.beds} beds occupied
                </Caption>
              </Card>
            );
          })}
        </div>
      )}

      {view === "theatre" && (
        <Card aria-labelledby="theatre-list" className="mt-4 px-6 py-6">
          <CardTitle
            id="theatre-list"
            title="Today's theatre list"
            description="Allied health review before each procedure"
          />
          <ol className="relative mt-5 flex flex-col gap-3 border-l-2 border-border pl-6">
            {theatreList.map((t) => {
              const done = ops[`theatre:${t.id}`] === "done";
              return (
                <li
                  key={t.id}
                  className="relative flex flex-wrap items-center justify-between gap-3 rounded-control bg-canvas px-4 py-3"
                >
                  <span
                    aria-hidden="true"
                    className={cn(
                      "absolute top-5 -left-7.75 size-3 rounded-full ring-4 ring-surface",
                      done ? "bg-healthy-dot" : "bg-accent-fill",
                    )}
                  />
                  <span className="min-w-0">
                    <span className="flex items-center gap-1.5 text-caption font-semibold text-accent">
                      <Clock className="size-3.5" strokeWidth={1.75} aria-hidden="true" />
                      {t.time}, {t.room}
                    </span>
                    <span className="block font-semibold">{t.patient}</span>
                    <Caption>{t.procedure}</Caption>
                  </span>
                  {done ? (
                    <Tag tone="healthy">Review done</Tag>
                  ) : (
                    <Button
                      size="sm"
                      onClick={() =>
                        setOp(`theatre:${t.id}`, "done", "Completed pre-op review", t.patient)
                      }
                    >
                      Complete review
                    </Button>
                  )}
                </li>
              );
            })}
          </ol>
        </Card>
      )}
      <Caption className="mt-4">
        Sample hospital records. No hospital system is connected yet.
      </Caption>

      {open && (
        <Sheet
          title={open.name}
          description={`${open.ward}, bed ${open.bed}`}
          onClose={() => setOpenId(null)}
          footer={
            nextLabel[open.current] ? (
              <Button variant="primary" onClick={() => advance(open)}>
                {nextLabel[open.current]}
              </Button>
            ) : undefined
          }
        >
          <Tag tone={stageTone[open.current]}>{open.current}</Tag>
          <p className="mt-3 text-small text-ink-700">{open.need}</p>
          <ol className="mt-4 flex flex-col gap-2">
            {inpatientStages.map((stage, i) => {
              const reached = i <= inpatientStages.indexOf(open.current);
              return (
                <li
                  key={stage}
                  className={cn("flex items-center gap-2 text-small", !reached && "text-ink-500")}
                >
                  <span
                    aria-hidden="true"
                    className={cn(
                      "flex size-5 items-center justify-center rounded-full",
                      reached ? "bg-accent-fill text-on-accent" : "bg-canvas",
                    )}
                  >
                    {reached && <Check className="size-3" strokeWidth={3} />}
                  </span>
                  {stage}
                </li>
              );
            })}
          </ol>
          <h3 className="mt-5 mb-1 text-small font-semibold">Team note</h3>
          {ops[`inpatient-note:${open.id}`] && (
            <p className="mb-2 rounded-control bg-canvas px-3 py-2 text-small">
              {ops[`inpatient-note:${open.id}`]}
            </p>
          )}
          <textarea
            rows={3}
            aria-label="Team note"
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            className="w-full rounded-control border border-border-strong bg-surface-raised px-3 py-2 text-small outline-none focus:border-accent focus:shadow-focus"
          />
          <Button
            size="sm"
            className="mt-2"
            disabled={!draft.trim()}
            onClick={() => {
              setOp(`inpatient-note:${open.id}`, draft.trim(), "Added team note", open.name);
              setDraft("");
            }}
          >
            Save note
          </Button>
        </Sheet>
      )}
    </>
  );
}
