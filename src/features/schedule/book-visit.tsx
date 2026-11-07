"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Field, inputClass, Sheet } from "@/components/ui/sheet";
import { clinicians } from "@/data/clinicians";
import { clientRecord, liveDirectory, type ClientRecord } from "@/data/records";
import {
  DAY_END,
  DAY_START,
  findClash,
  formatTime,
  liveSchedule,
  nextFreeStart,
  NOW,
  scheduleDays,
  TODAY,
} from "@/data/schedule";
import { useDemoStore } from "@/state/demo-store";

const STEP = 15;
const times = Array.from({ length: (DAY_END - DAY_START) / STEP }, (_, i) => DAY_START + i * STEP);
const bookableDays = scheduleDays.filter((d) => d.id >= TODAY);

/** Books a visit into a clinician's week. A rule blocks double-booking and offers the next free time. */
export function BookVisitSheet({
  client,
  onClose,
  onBooked,
}: {
  client?: ClientRecord;
  onClose: () => void;
  onBooked?: (clinicianId: string) => void;
}) {
  const added = useDemoStore((s) => s.addedClients);
  const edits = useDemoStore((s) => s.clientEdits);
  const suggestions = useDemoStore((s) => s.suggestions);
  const bookings = useDemoStore((s) => s.bookings);
  const changes = useDemoStore((s) => s.visitChanges);
  const book = useDemoStore((s) => s.bookVisit);

  const accepted = Object.entries(suggestions)
    .filter(([, v]) => v === "accepted")
    .map(([id]) => id);
  const items = liveSchedule(accepted, bookings, changes);

  const directory = liveDirectory(added, edits).sort((a, b) => a.name.localeCompare(b.name));
  const [clientId, setClientId] = useState(client?.id ?? "");
  const chosen = client ?? (clientId ? clientRecord(clientId, added, edits) : null);

  const clinicianOf = (name?: string) => clinicians.find((c) => c.name === name)?.id;
  const [clinicianId, setClinicianId] = useState(
    clinicianOf(client?.clinician) ?? clinicians[0]?.id ?? "",
  );
  const [day, setDay] = useState<number>(TODAY);
  const [duration, setDuration] = useState(45);
  const [type, setType] = useState<"Home visit" | "Telehealth">("Home visit");
  const [start, setStart] = useState(
    () => nextFreeStart(items, clinicianId, TODAY, 45, NOW + (STEP - (NOW % STEP))) ?? DAY_START,
  );
  const [missingClient, setMissingClient] = useState(false);

  const clash = findClash(items, clinicianId, day, start, duration);
  const free = clash
    ? (nextFreeStart(items, clinicianId, day, duration, start) ??
      nextFreeStart(items, clinicianId, day, duration))
    : null;
  const fits = start + duration <= DAY_END;
  const clinicianName = clinicians.find((c) => c.id === clinicianId)?.name ?? "";

  function submit() {
    if (!chosen) {
      setMissingClient(true);
      return;
    }
    if (clash || !fits) return;
    book({
      clinicianId,
      day,
      start,
      duration,
      type,
      title: chosen.name,
      suburb: type === "Home visit" ? chosen.suburb || undefined : undefined,
      travel: type === "Home visit" ? 15 : 0,
    });
    onBooked?.(clinicianId);
    onClose();
  }

  return (
    <Sheet
      title="Book visit"
      description={client ? client.name : "Choose the client, the time and who is visiting."}
      onClose={onClose}
      footer={
        <>
          <Button variant="primary" onClick={submit} disabled={Boolean(clash) || !fits}>
            Book visit
          </Button>
          <Button onClick={onClose}>Cancel</Button>
        </>
      }
    >
      <div className="grid gap-4 sm:grid-cols-2">
        {!client && (
          <div className="sm:col-span-2">
            <Field label="Client" error={missingClient ? "Choose a client" : undefined}>
              <select
                className={inputClass}
                value={clientId}
                onChange={(e) => {
                  setClientId(e.target.value);
                  setMissingClient(false);
                  const next = clientRecord(e.target.value, added, edits);
                  const owner = clinicianOf(next?.clinician);
                  if (owner) setClinicianId(owner);
                }}
              >
                <option value="">Choose a client</option>
                {directory.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </Field>
          </div>
        )}
        <div className="sm:col-span-2">
          <Field label="Clinician">
            <select
              className={inputClass}
              value={clinicianId}
              onChange={(e) => setClinicianId(e.target.value)}
            >
              {clinicians.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}, {c.discipline}
                </option>
              ))}
            </select>
          </Field>
        </div>
        <Field label="Day">
          <select
            className={inputClass}
            value={day}
            onChange={(e) => setDay(Number(e.target.value))}
          >
            {bookableDays.map((d) => (
              <option key={d.id} value={d.id}>
                {d.label}
              </option>
            ))}
          </select>
        </Field>
        <Field label="Start time">
          <select
            className={inputClass}
            value={start}
            onChange={(e) => setStart(Number(e.target.value))}
          >
            {times.map((t) => (
              <option key={t} value={t}>
                {formatTime(t)}
              </option>
            ))}
          </select>
        </Field>
        <Field label="Length">
          <select
            className={inputClass}
            value={duration}
            onChange={(e) => setDuration(Number(e.target.value))}
          >
            {[30, 45, 60, 90].map((m) => (
              <option key={m} value={m}>
                {m} minutes
              </option>
            ))}
          </select>
        </Field>
        <Field label="Type">
          <select
            className={inputClass}
            value={type}
            onChange={(e) => setType(e.target.value as "Home visit" | "Telehealth")}
          >
            <option>Home visit</option>
            <option>Telehealth</option>
          </select>
        </Field>
      </div>

      {clash && (
        <div role="alert" className="mt-4 rounded-control bg-over-bg px-3.5 py-3 text-small">
          <p className="font-semibold text-over">
            {clinicianName} is already booked at this time: {clash.title}, {formatTime(clash.start)}
            .
          </p>
          {free !== null ? (
            <Button size="sm" className="mt-2" onClick={() => setStart(free)}>
              Use next free time, {formatTime(free)}
            </Button>
          ) : (
            <p className="mt-1 text-ink-700">There are no free times left that day.</p>
          )}
        </div>
      )}
      {!fits && !clash && (
        <p
          role="alert"
          className="mt-4 rounded-control bg-over-bg px-3.5 py-3 text-small text-over"
        >
          This visit would finish after {formatTime(DAY_END)}. Choose an earlier time.
        </p>
      )}
    </Sheet>
  );
}
