"use client";

import { ArrowRight, CalendarPlus, Check, Copy, FileText, Mail, Plus, Users } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { BarList } from "@/components/charts/bar-list";
import { colour } from "@/components/charts/chart-kit";
import { DraftLabel, PenNib, draftSurface } from "@/components/ai/provenance";
import { Button } from "@/components/ui/button";
import { Caption, Card, CardTitle } from "@/components/ui/card";
import { Tag, type TagTone } from "@/components/ui/tag";
import {
  referralStages,
  referrals as seededReferrals,
  seedExtraction,
  stageLabels,
  type Referral,
  type ReferralStatus,
} from "@/data/referrals";
import {
  clientRecord,
  findDuplicate,
  liveDirectory,
  newClientId,
  regionForSuburb,
  type ClientRecord,
} from "@/data/records";
import { ClientFormSheet } from "@/features/clients/client-form";
import { BookVisitSheet } from "@/features/schedule/book-visit";
import { cn } from "@/lib/cn";
import type { ReferralExtraction } from "@/lib/story/types";
import { useDemoStore } from "@/state/demo-store";
import { useStoryAi } from "@/state/use-story-ai";
import { NewReferralSheet } from "./new-referral";

const statusTone: Record<ReferralStatus, TagTone> = {
  New: "live",
  "Needs verification": "monitor",
  "Missing information": "over",
  "Possible duplicate": "over",
  "Ready to create": "available",
  "Info requested": "neutral",
  "Profile created": "healthy",
  Merged: "healthy",
  "First visit booked": "healthy",
};

const done: ReferralStatus[] = ["Profile created", "Merged", "First visit booked"];

function ageLabel(hours: number) {
  if (hours === 0) return "just now";
  return hours < 24 ? `${hours} h ago` : `${Math.round(hours / 24)} d ago`;
}

export function IntakeWorkspace() {
  const statuses = useDemoStore((s) => s.referrals);
  const addedReferrals = useDemoStore((s) => s.addedReferrals);
  const referrals = [...addedReferrals, ...seededReferrals];
  const [selectedId, setSelectedId] = useState(
    addedReferrals[0]?.id ?? seededReferrals[0]?.id ?? "",
  );
  const [adding, setAdding] = useState(false);
  const selected = referrals.find((r) => r.id === selectedId);
  const statusOf = (r: Referral) => statuses[r.id] ?? r.status;

  const waiting = referrals.filter(
    (r) => !done.includes(statusOf(r)) && statusOf(r) !== "Ready to create",
  );
  const missing = referrals.filter((r) => statusOf(r) === "Missing information");
  const duplicates = referrals.filter((r) => statusOf(r) === "Possible duplicate");
  const fields = referrals.flatMap((r) => r.fields);
  const confident = fields.filter((f) => f.confidence === "High").length;

  const pipeline = referralStages.map((stage, i) => ({
    id: stageLabels[i] ?? String(i),
    label: stageLabels[i] ?? "",
    value: referrals.filter((r) => stage.includes(statusOf(r))).length,
    colour: i === 0 ? colour.series2 : colour.series1,
  }));

  const sources = [...new Set(referrals.map((r) => r.source))].map((src) => ({
    id: src,
    label: src,
    value: referrals.filter((r) => r.source === src).length,
    colour: colour.series3,
  }));

  const metrics = [
    {
      label: "Referrals this week",
      value: String(referrals.length),
      caption: "Email, web form, GP and school",
    },
    {
      label: "Awaiting verification",
      value: String(waiting.length),
      caption: "AI-extracted, needs a person",
    },
    {
      label: "Missing information",
      value: String(missing.length),
      caption: "Request drafted by AI",
    },
    {
      label: "Possible duplicates",
      value: String(duplicates.length),
      caption: "Matched on name, DOB, phone",
    },
    {
      label: "Fields auto-extracted",
      value: `${Math.round((confident / fields.length) * 100)}%`,
      caption: `${confident} of ${fields.length} at high confidence`,
    },
  ];

  return (
    <>
      <section
        aria-label="Intake summary"
        className="stat-band grid grid-cols-2 gap-px overflow-hidden rounded-card border border-border bg-border lg:grid-cols-5"
      >
        {metrics.map((m) => (
          <div key={m.label} className="flex flex-col gap-1.5 bg-surface px-5 py-4">
            <span className="eyebrow">{m.label}</span>
            <span className="headline text-stat font-normal">{m.value}</span>
            <Caption>{m.caption}</Caption>
          </div>
        ))}
      </section>

      <div className="mt-6 grid items-stretch gap-6 lg:grid-cols-12">
        <Card aria-labelledby="pipeline" className="px-6 pt-5 pb-4 lg:col-span-7">
          <CardTitle
            id="pipeline"
            title="Referral pipeline"
            description="From received to first home visit · this week"
          />
          <div className="mt-3">
            <BarList label="Referrals by stage" data={pipeline} labelWidth={150} unit="referrals" />
          </div>
        </Card>
        <Card aria-labelledby="by-source" className="px-6 pt-5 pb-4 lg:col-span-5">
          <CardTitle
            id="by-source"
            title="Where referrals come from"
            description="All read by the same AI intake step"
          />
          <div className="mt-3">
            <BarList label="Referrals by source" data={sources} labelWidth={110} unit="referrals" />
          </div>
        </Card>
      </div>

      <div className="mt-6 grid items-start gap-6 lg:grid-cols-12">
        <Card aria-labelledby="queue" className="overflow-hidden lg:col-span-4">
          <div className="px-5 pt-5 pb-3">
            <CardTitle
              id="queue"
              title="Referral queue"
              description="Newest first · select to review"
              aside={
                <Button size="sm" variant="primary" onClick={() => setAdding(true)}>
                  <Plus className="size-3.5" strokeWidth={1.5} aria-hidden="true" />
                  New referral
                </Button>
              }
            />
          </div>
          <ul>
            {referrals.map((r) => {
              const status = statusOf(r);
              const active = r.id === selectedId;
              return (
                <li key={r.id}>
                  <button
                    type="button"
                    onClick={() => setSelectedId(r.id)}
                    aria-pressed={active}
                    className={cn(
                      "flex w-full cursor-pointer flex-col gap-1 border-t border-border px-5 py-3 text-left hover:bg-canvas",
                      active && "bg-accent-tint shadow-rule-accent",
                    )}
                  >
                    <span className="flex items-center justify-between gap-2">
                      <span className="font-semibold">
                        {r.client}
                        {r.age === null ? "" : `, ${r.age}`}
                      </span>
                      <Tag tone={statusTone[status]}>{status}</Tag>
                    </span>
                    <span className="text-caption text-ink-500">
                      {r.funding} · {r.services}
                    </span>
                    <span className="text-caption text-ink-500">
                      {r.source} · {r.suburb} · {ageLabel(r.ageHours)}
                    </span>
                  </button>
                </li>
              );
            })}
          </ul>
        </Card>

        <div className="lg:col-span-8">
          {selected && (
            <ReferralDetailLoader
              key={selected.id}
              referral={selected}
              status={statusOf(selected)}
            />
          )}
        </div>
      </div>
      {adding && <NewReferralSheet onClose={() => setAdding(false)} onAdded={setSelectedId} />}
    </>
  );
}

/** Seeded referrals are read by AI the first time they're opened; new ones already have been. */
function ReferralDetailLoader({
  referral,
  status,
}: {
  referral: Referral;
  status: ReferralStatus;
}) {
  const isSeeded = seededReferrals.some((r) => r.id === referral.id);
  return isSeeded ? (
    <SeededReferral referral={referral} status={status} />
  ) : (
    <ReferralDetail
      referral={referral}
      status={status}
      extraction={seedExtraction(referral)}
      missing={referral.missing}
      loading={false}
    />
  );
}

function SeededReferral({ referral, status }: { referral: Referral; status: ReferralStatus }) {
  const ai = useStoryAi<ReferralExtraction>(
    `referral:${referral.id}`,
    { kind: "referral", lines: referral.document },
    seedExtraction(referral),
  );
  const extraction = ai.data ?? seedExtraction(referral);
  // A seeded referral with nothing missing stays that way; AI only rewords what is missing.
  const missing =
    referral.missing.length === 0
      ? []
      : extraction.missing.length
        ? extraction.missing
        : referral.missing;
  return (
    <ReferralDetail
      referral={referral}
      status={status}
      extraction={extraction}
      missing={missing}
      loading={ai.loading}
    />
  );
}

function fallbackRequest(missing: string[]) {
  return `Hello,

Thanks for your referral. Before we book a first visit, could you please send us:

${missing.map((m) => `- ${m}`).join("\n")}

Kind regards,
Medisense intake team`;
}

function ReferralDetail({
  referral,
  status,
  extraction,
  missing,
  loading,
}: {
  referral: Referral;
  status: ReferralStatus;
  extraction: ReferralExtraction;
  missing: string[];
  loading: boolean;
}) {
  const requestInfo = useDemoStore((s) => s.requestReferralInfo);
  const verify = useDemoStore((s) => s.verifyReferral);
  const merge = useDemoStore((s) => s.mergeReferral);
  const [hoverLine, setHoverLine] = useState<number | null>(null);
  const [showEmail, setShowEmail] = useState(false);
  const [email, setEmail] = useState("");
  const [sheet, setSheet] = useState<"verify" | "book" | null>(null);
  const clearDuplicate = useDemoStore((s) => s.clearDuplicate);
  const added = useDemoStore((s) => s.addedClients);
  const edits = useDemoStore((s) => s.clientEdits);
  const requestEmail = extraction.requestEmail || fallbackRequest(missing);
  const existing = findDuplicate(referral.client, added);
  // A referral confirmed as a different person gets its own record, even with the same name.
  const reusesRecord = existing && !referral.duplicate;
  const draftClient: ClientRecord = {
    id: reusesRecord ? existing.id : "",
    name: referral.client === "Name not stated" ? "" : referral.client,
    age: referral.age,
    funding: referral.funding,
    clinician: referral.suggestedClinician ?? "",
    region: regionForSuburb(referral.suburb) ?? referral.region,
    suburb: referral.suburb === "Suburb not stated" ? "" : referral.suburb,
    service: referral.services === "Not stated" ? "" : referral.services,
    contactName: referral.contactName ?? extraction.contactName,
    contactPhone: referral.contactPhone ?? extraction.contactPhone,
    state: "New",
  };
  const directoryMatch = liveDirectory(added, edits).find((c) => c.name === referral.client);
  const client = directoryMatch ? clientRecord(directoryMatch.id, added, edits) : null;

  const finished = done.includes(status);
  const canVerify =
    !finished &&
    status !== "Possible duplicate" &&
    (missing.length === 0 || status === "Info requested");

  return (
    <Card aria-labelledby="referral-title" className="overflow-hidden">
      <div className="flex flex-wrap items-start justify-between gap-3 px-6 pt-5 pb-4">
        <div>
          <p className="eyebrow">
            {referral.sourceDetail} · {referral.received}
          </p>
          <h2 id="referral-title" className="mt-1.5 headline text-h2">
            {referral.client}
            {referral.age === null ? "" : `, ${referral.age}`}
          </h2>
          <Caption className="mt-1">
            {referral.funding} · {referral.services} · {referral.suburb} ({referral.region})
          </Caption>
        </div>
        <Tag tone={statusTone[status]}>{status}</Tag>
      </div>

      <div className="grid gap-px border-t border-border bg-border lg:grid-cols-2">
        <div className="bg-surface px-5 py-4">
          <div className="mb-2 flex items-center gap-1.5 eyebrow">
            <FileText className="size-3.5" strokeWidth={1.5} aria-hidden="true" />
            Original referral
          </div>
          <ol className="flex flex-col gap-0.5">
            {referral.document.map((line, i) => (
              <li
                key={line}
                className={cn(
                  "grid grid-cols-[20px_minmax(0,1fr)] gap-2 rounded-control px-2 py-1 text-small transition-colors duration-160",
                  hoverLine === i + 1 && "bg-accent-tint shadow-rule-accent",
                )}
              >
                <span className="text-right font-mono text-caption leading-5 text-ink-400">
                  {i + 1}
                </span>
                <span>{line}</span>
              </li>
            ))}
          </ol>
        </div>

        <div className="bg-surface px-5 py-4">
          <div className="mb-2 flex items-center justify-between gap-2">
            <span className="flex items-center gap-1.5 eyebrow text-brass">
              <PenNib className="size-3.5 text-brass" />
              AI-extracted details
            </span>
            <Caption>Hover to see the source line</Caption>
          </div>
          {loading ? (
            <div aria-busy="true" className="flex flex-col gap-3 py-2">
              <Caption>AI is reading this referral…</Caption>
              {[0, 1, 2, 3, 4].map((n) => (
                <span
                  key={n}
                  className="block h-3 w-5/6 animate-pulse rounded-full bg-border motion-reduce:animate-none"
                />
              ))}
            </div>
          ) : (
            <dl className="flex flex-col">
              {extraction.fields.map((f) => (
                <div
                  key={f.label}
                  onMouseEnter={() => setHoverLine(f.line)}
                  onMouseLeave={() => setHoverLine(null)}
                  className="grid cursor-default grid-cols-[112px_minmax(0,1fr)_auto] items-start gap-2 border-b border-border py-1.5 last:border-b-0"
                >
                  <dt className="text-caption font-semibold text-ink-500">{f.label}</dt>
                  <dd className="text-small">{f.value}</dd>
                  <span className="flex items-center gap-1">
                    <span className="font-mono text-eyebrow text-ink-400">L{f.line}</span>
                    {f.confidence === "Check" && <Tag tone="monitor">Check</Tag>}
                  </span>
                </div>
              ))}
            </dl>
          )}
        </div>
      </div>

      <div className="flex flex-col gap-3 border-t border-border px-6 py-4">
        {referral.duplicate && status === "Possible duplicate" && (
          <div className="flex flex-wrap items-center justify-between gap-3 rounded-control bg-over-bg px-4 py-3">
            <span className="flex items-start gap-2 text-small text-over">
              <Users className="mt-0.5 size-4 flex-none" strokeWidth={1.5} aria-hidden="true" />
              <span>
                <b className="font-semibold">Possible duplicate:</b> {referral.duplicate.client}.{" "}
                {referral.duplicate.reason}.
              </span>
            </span>
            <span className="flex flex-wrap gap-2">
              <Button size="sm" onClick={() => clearDuplicate(referral.id)}>
                It&apos;s a different person
              </Button>
              <Button size="sm" variant="primary" onClick={() => merge(referral.id)}>
                Add {referral.services} to existing profile
              </Button>
            </span>
          </div>
        )}

        {missing.length > 0 && !finished && (
          <div className="rounded-control border border-border bg-monitor-bg px-4 py-3">
            <div className="mb-1 text-small font-semibold text-monitor">
              Missing before the first visit · {missing.length}
            </div>
            <ul className="flex list-disc flex-col gap-0.5 pl-4.5 text-small">
              {missing.map((m) => (
                <li key={m}>{m}</li>
              ))}
            </ul>
            {status !== "Info requested" && !showEmail && !loading && (
              <Button
                size="sm"
                className="mt-2.5"
                onClick={() => {
                  setEmail(requestEmail);
                  setShowEmail(true);
                }}
              >
                <Mail className="size-3.5" strokeWidth={1.5} aria-hidden="true" />
                Draft request for missing information
              </Button>
            )}
            {status === "Info requested" && (
              <p className="mt-2 flex items-center gap-1.5 text-small font-semibold text-healthy">
                <Check className="size-3.5" strokeWidth={2} aria-hidden="true" />
                Request sent · logged to audit trail. Profile can now be created with gaps flagged.
              </p>
            )}
          </div>
        )}

        {showEmail && status !== "Info requested" && (
          <section className={cn(draftSurface(false), "flex flex-col gap-2.5 px-4 py-3")}>
            <DraftLabel meta="Review before sending">AI Drafted Email — Review Required</DraftLabel>
            <textarea
              rows={9}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              aria-label="Request email"
              className="w-full resize-y rounded-control border border-border-strong bg-surface-raised px-3 py-2 text-small text-ink-900 outline-none focus:border-accent focus:shadow-focus"
            />
            <div className="flex gap-2">
              <Button
                size="sm"
                variant="primary"
                onClick={() => {
                  requestInfo(referral.id);
                  setShowEmail(false);
                }}
              >
                Send request
              </Button>
              <Button size="sm" onClick={() => setShowEmail(false)}>
                Cancel
              </Button>
            </div>
          </section>
        )}

        {referral.suggestedClinician && (
          <p className="text-small text-ink-700">
            <b className="font-semibold text-ink-900">Suggested clinician:</b>{" "}
            {referral.suggestedClinician}
            <span className="text-ink-500">
              {" "}
              · based on discipline, region and weighted capacity
            </span>
          </p>
        )}

        {finished ? (
          <div
            role="status"
            className="flex flex-wrap items-center justify-between gap-3 rounded-control bg-healthy-bg px-4 py-3"
          >
            <span className="flex items-center gap-2 text-small font-semibold text-healthy">
              <Check className="size-4" strokeWidth={2} aria-hidden="true" />
              {status === "Merged"
                ? "Service added to the existing profile. No duplicate record created."
                : status === "First visit booked"
                  ? "Profile created and first visit booked."
                  : "Profile created from verified details · task “Book first home visit” assigned to Admin team."}
            </span>
            <span className="flex gap-3">
              <Link
                href="/tasks"
                className="inline-flex items-center gap-1 text-small font-semibold"
              >
                Tasks
                <ArrowRight className="size-3.5" strokeWidth={1.5} aria-hidden="true" />
              </Link>
              {status === "Profile created" && client && (
                <button
                  type="button"
                  onClick={() => setSheet("book")}
                  className="inline-flex cursor-pointer items-center gap-1 text-small font-semibold text-accent hover:text-accent-hover"
                >
                  <CalendarPlus className="size-3.5" strokeWidth={1.5} aria-hidden="true" />
                  Book first visit
                </button>
              )}
              {client && (
                <Link
                  href={`/clients/${client.id}`}
                  className="inline-flex items-center gap-1 text-small font-semibold"
                >
                  Open client
                  <ArrowRight className="size-3.5" strokeWidth={1.5} aria-hidden="true" />
                </Link>
              )}
              {referral.id === "leila-haddad" && (
                <Link
                  href="/forms?form=agreement-leila"
                  className="inline-flex items-center gap-1 text-small font-semibold"
                >
                  Prepare service agreement
                  <ArrowRight className="size-3.5" strokeWidth={1.5} aria-hidden="true" />
                </Link>
              )}
            </span>
          </div>
        ) : (
          <div className="flex flex-wrap items-center gap-3 border-t border-border pt-3">
            <Button variant="primary" disabled={!canVerify} onClick={() => setSheet("verify")}>
              <Copy className="size-4" strokeWidth={1.5} aria-hidden="true" />
              Verify &amp; create client profile
            </Button>
            <Caption>
              {canVerify
                ? "A person confirms every extracted field before the profile is created."
                : status === "Possible duplicate"
                  ? "Resolve the duplicate first."
                  : "Request the missing information first."}
            </Caption>
          </div>
        )}
      </div>
      {sheet === "verify" && (
        <ClientFormSheet
          title="Check details and create client"
          description="AI filled this in from the referral. Correct anything that's wrong."
          initial={draftClient}
          submitLabel="Create client"
          onClose={() => setSheet(null)}
          onSubmit={(next) => {
            verify(referral.id, next.id ? next : { ...next, id: newClientId(next.name, added) });
            setSheet(null);
          }}
        />
      )}
      {sheet === "book" && client && (
        <BookVisitSheet client={client} onClose={() => setSheet(null)} />
      )}
    </Card>
  );
}
