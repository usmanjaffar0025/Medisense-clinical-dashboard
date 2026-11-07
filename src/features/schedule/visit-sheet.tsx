"use client";

import { Check } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Sheet } from "@/components/ui/sheet";
import { Tag } from "@/components/ui/tag";
import { caseNotes } from "@/data/case-note";
import { clinicians } from "@/data/clinicians";
import { liveDirectory } from "@/data/records";
import { formatTime, scheduleDays, TODAY, type ScheduleItem } from "@/data/schedule";
import { useDemoStore } from "@/state/demo-store";

const statusTag = {
  booked: { tone: "available", label: "Booked" },
  completed: { tone: "healthy", label: "Completed" },
  cancelled: { tone: "over", label: "Cancelled" },
} as const;

/** One visit: complete it, which asks the clinician for a note, or cancel it, which opens the slot. */
export function VisitSheet({ visit, onClose }: { visit: ScheduleItem; onClose: () => void }) {
  const added = useDemoStore((s) => s.addedClients);
  const edits = useDemoStore((s) => s.clientEdits);
  const complete = useDemoStore((s) => s.completeVisit);
  const cancel = useDemoStore((s) => s.cancelVisit);
  const live = useDemoStore((s) => s.visitChanges[visit.id]);
  const [confirming, setConfirming] = useState(false);

  const status = live ?? visit.status;
  const clinician = clinicians.find((c) => c.id === visit.clinicianId);
  const client = liveDirectory(added, edits).find((c) => c.name === visit.title);
  const note = caseNotes.find((n) => n.client === visit.title);
  const canComplete = visit.day <= TODAY;
  const tag = statusTag[status];

  const details = [
    ["When", `${scheduleDays[visit.day]?.label ?? ""}, ${formatTime(visit.start)}`],
    ["Length", `${visit.duration} minutes`],
    ["Type", visit.type],
    ["Clinician", clinician?.name ?? ""],
    ...(visit.suburb ? [["Suburb", visit.suburb]] : []),
  ];

  return (
    <Sheet
      title={visit.title}
      description={<Tag tone={tag.tone}>{tag.label}</Tag>}
      onClose={onClose}
      footer={
        status === "booked" ? (
          confirming ? (
            <>
              <Button
                variant="primary"
                onClick={() => {
                  cancel(visit);
                  setConfirming(false);
                }}
              >
                Cancel this visit
              </Button>
              <Button onClick={() => setConfirming(false)}>Keep visit</Button>
            </>
          ) : (
            <>
              <Button variant="primary" disabled={!canComplete} onClick={() => complete(visit)}>
                Mark session complete
              </Button>
              <Button onClick={() => setConfirming(true)}>Cancel visit</Button>
            </>
          )
        ) : (
          <Button onClick={onClose}>Close</Button>
        )
      }
    >
      <dl className="flex flex-col">
        {details.map(([label, value]) => (
          <div
            key={label}
            className="grid grid-cols-[96px_minmax(0,1fr)] gap-3 border-b border-border py-2 last:border-b-0"
          >
            <dt className="text-small text-ink-500">{label}</dt>
            <dd className="text-small font-medium">{value}</dd>
          </div>
        ))}
      </dl>

      {status === "booked" && !canComplete && (
        <p className="mt-3 text-small text-ink-700">
          This visit hasn&apos;t happened yet, so it can&apos;t be marked complete.
        </p>
      )}
      {status === "booked" && confirming && (
        <p className="mt-3 text-small text-ink-700">
          The slot opens up again, and the visit stays on the schedule as cancelled.
        </p>
      )}
      {status === "completed" && (
        <div role="status" className="mt-4 rounded-control bg-healthy-bg px-3.5 py-3 text-small">
          <p className="flex items-center gap-1.5 font-semibold text-healthy">
            <Check className="size-4" strokeWidth={2} aria-hidden="true" />
            Session complete
          </p>
          <p className="mt-1 text-ink-700">
            A task to write the session note has gone to {clinician?.name}.
          </p>
        </div>
      )}
      {status === "cancelled" && (
        <p
          role="status"
          className="mt-4 rounded-control bg-over-bg px-3.5 py-3 text-small text-over"
        >
          Visit cancelled. The slot is open again.
        </p>
      )}

      <div className="mt-4 flex flex-wrap gap-x-4 gap-y-2 text-small font-semibold">
        {visit.type === "Telehealth" && status !== "cancelled" && canComplete && (
          <Link href={`/telehealth?visit=${visit.id}`}>Start video visit</Link>
        )}
        {client && <Link href={`/clients/${client.id}`}>Open client</Link>}
        {status === "completed" && note && (
          <Link href={`/case-notes/${note.id}`}>Write note with AI</Link>
        )}
        {status === "completed" && <Link href="/tasks">View tasks</Link>}
      </div>
    </Sheet>
  );
}
