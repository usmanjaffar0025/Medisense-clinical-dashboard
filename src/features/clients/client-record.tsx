"use client";

import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { useState, useSyncExternalStore } from "react";
import { ButtonLink } from "@/components/ui/button";
import { Caption, Card, CardTitle } from "@/components/ui/card";
import { PageHeader } from "@/components/ui/page";
import { Tag } from "@/components/ui/tag";
import { clinicians } from "@/data/clinicians";
import { clientRecord } from "@/data/records";
import { formatTime, liveSchedule, scheduleDays, type ScheduleItem } from "@/data/schedule";
import { VisitSheet } from "@/features/schedule/visit-sheet";
import { useDemoStore } from "@/state/demo-store";
import { ClientActions } from "./client-actions";

const stateTone = { Active: "healthy", Paused: "monitor", New: "available" } as const;
const visitTone = { booked: "available", completed: "healthy", cancelled: "over" } as const;

function useHydrated() {
  return useSyncExternalStore(
    (notify) => useDemoStore.persist.onFinishHydration(notify),
    () => useDemoStore.persist.hasHydrated(),
    () => false,
  );
}

export function useLiveVisits() {
  const suggestions = useDemoStore((s) => s.suggestions);
  const bookings = useDemoStore((s) => s.bookings);
  const changes = useDemoStore((s) => s.visitChanges);
  const accepted = Object.entries(suggestions)
    .filter(([, v]) => v === "accepted")
    .map(([id]) => id);
  return liveSchedule(accepted, bookings, changes);
}

export function ClientVisits({ name }: { name: string }) {
  const [openId, setOpenId] = useState<string | null>(null);
  const live = useLiveVisits();
  const visits = live
    .filter((v) => v.title === name)
    .sort((a, b) => a.day - b.day || a.start - b.start);
  const open: ScheduleItem | undefined = visits.find((v) => v.id === openId);

  return (
    <Card aria-labelledby="client-visits" className="px-5 py-5">
      <CardTitle id="client-visits" title="Visits this week" />
      {visits.length === 0 ? (
        <p className="mt-3 text-small text-ink-700">
          No visits booked this week. Use Book visit to add one.
        </p>
      ) : (
        <ul className="mt-3">
          {visits.map((v) => (
            <li key={v.id} className="border-t border-border first:border-t-0">
              <button
                type="button"
                onClick={() => setOpenId(v.id)}
                className="flex w-full cursor-pointer flex-wrap items-center justify-between gap-2 py-2.5 text-left hover:bg-canvas"
              >
                <span className="min-w-0">
                  <span className="block text-small font-semibold">
                    {scheduleDays[v.day]?.label}, {formatTime(v.start)}
                  </span>
                  <Caption>
                    {v.type}
                    {v.suburb ? `, ${v.suburb}` : ""},{" "}
                    {clinicians.find((c) => c.id === v.clinicianId)?.name}
                  </Caption>
                </span>
                <Tag tone={visitTone[v.status]}>
                  {v.status === "booked"
                    ? "Booked"
                    : v.status === "completed"
                      ? "Completed"
                      : "Cancelled"}
                </Tag>
              </button>
            </li>
          ))}
        </ul>
      )}
      {open && <VisitSheet visit={open} onClose={() => setOpenId(null)} />}
    </Card>
  );
}

/** The page for clients without a full profile, including anyone added during the demo. */
export function ClientRecordView({ id }: { id: string }) {
  const hydrated = useHydrated();
  const added = useDemoStore((s) => s.addedClients);
  const edits = useDemoStore((s) => s.clientEdits);
  const client = clientRecord(id, added, edits);

  if (!client) {
    if (!hydrated) return null;
    return (
      <>
        <PageHeader
          eyebrow="Clinical"
          title="Client not found"
          description="This client isn't in the list. Clients added in a demo session are cleared when it's reset."
        />
        <Link href="/clients">Back to all clients</Link>
      </>
    );
  }

  const details = [
    ["Age", client.age === null ? "Not recorded" : `${client.age} yrs`],
    ["Funding", client.funding],
    ["Service", client.service],
    ["Clinician", client.clinician],
    ["Suburb", client.suburb || "Not recorded"],
    ["Region", client.region],
    ["Main contact", client.contactName || "Not recorded"],
    ["Contact details", client.contactPhone || "Not recorded"],
  ];

  return (
    <>
      <PageHeader
        eyebrow={`Client · ${client.funding}`}
        title={client.name}
        description={`${client.service} · ${client.clinician}`}
        actions={
          <>
            <ButtonLink href="/clients">
              <ArrowLeft className="size-4" strokeWidth={1.5} aria-hidden="true" />
              All clients
            </ButtonLink>
            <ClientActions id={id} />
          </>
        }
      />
      <div className="grid items-start gap-6 lg:grid-cols-12">
        <Card aria-labelledby="client-details" className="px-5 py-5 lg:col-span-7">
          <CardTitle
            id="client-details"
            title="Details"
            aside={<Tag tone={stateTone[client.state]}>{client.state}</Tag>}
          />
          <dl className="mt-3 grid gap-x-6 gap-y-3 sm:grid-cols-2">
            {details.map(([label, value]) => (
              <div key={label}>
                <dt className="text-caption font-medium text-ink-500">{label}</dt>
                <dd className="text-small font-medium wrap-break-word">{value}</dd>
              </div>
            ))}
          </dl>
        </Card>
        <div className="lg:col-span-5">
          <ClientVisits name={client.name} />
        </div>
      </div>
    </>
  );
}
