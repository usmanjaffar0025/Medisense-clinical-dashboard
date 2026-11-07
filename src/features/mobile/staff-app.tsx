"use client";

import {
  ArrowLeft,
  CalendarDays,
  Car,
  Check,
  CircleUserRound,
  ListChecks,
  MapPin,
  Mic,
  MicOff,
  Phone,
  Plus,
  Search,
  Users,
  Video,
  House,
} from "lucide-react";
import { useState } from "react";
import { AiMark } from "@/components/ai/marks";
import { Button, ButtonLink } from "@/components/ui/button";
import { Avatar, Ring } from "@/components/ui/premium";
import { Field, inputClass } from "@/components/ui/sheet";
import { Switch } from "@/components/ui/switch";
import { Tag } from "@/components/ui/tag";
import { clinicianById, sarah } from "@/data/clinicians";
import { clientRecord, liveDirectory, newClientId, type ClientRecord } from "@/data/records";
import {
  DAY_END,
  DAY_START,
  findClash,
  formatTime,
  nextFreeStart,
  scheduleDays,
  TODAY,
  type ScheduleItem,
} from "@/data/schedule";
import { preparedNote, sampleDictation, sarahDay } from "@/data/story";
import type { Funding } from "@/data/types";
import { useDictation } from "@/features/case-notes/use-dictation";
import { useLiveVisits } from "@/features/clients/client-record";
import { longDate } from "@/lib/clock";
import { cn } from "@/lib/cn";
import { noteSectionTitles, type SessionNote } from "@/lib/story/types";
import { useDemoStore } from "@/state/demo-store";
import { callStory } from "@/state/use-story-ai";
import { AppCard, AppHeader, AppSheet, PhoneFrame } from "./phone-frame";
import { Select } from "@/components/ui/select";

const OWNER = sarah.name;
const tabs = [
  { id: "home", label: "Home", icon: House },
  { id: "schedule", label: "Schedule", icon: CalendarDays },
  { id: "clients", label: "Clients", icon: Users },
  { id: "tasks", label: "Tasks", icon: ListChecks },
  { id: "me", label: "Me", icon: CircleUserRound },
];

const mapsLink = (place: string) =>
  `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${place}, Brisbane QLD`)}`;

function HomeTab({ onNote, onTab }: { onNote: () => void; onTab: (id: string) => void }) {
  const dayOffset = useDemoStore((s) => s.story.dayOffset);
  const stage = useDemoStore((s) => s.story.stage);
  const tasks = useDemoStore((s) => s.tasks);
  const notes = useDemoStore((s) => s.caseNotes);
  const noteApproved = stage === "approved";
  const done = sarahDay.filter((v) => v.state === "done").length + (noteApproved ? 1 : 0);
  const next = sarahDay.find((v) => v.state === "next" || v.state === "later");
  const finished = sarahDay.find((v) => v.state === "just-finished");
  const driving = sarahDay.reduce((sum, v) => sum + v.driveBefore, 0);
  const openTasks = tasks.filter((t) => t.owner === OWNER && !t.done).length;
  const notesLeft = Object.values(notes).filter((n) => n.mode !== "approved").length;
  const stats = [
    { label: "Notes to write", value: notesLeft, tab: "tasks" },
    { label: "Open tasks", value: openTasks, tab: "tasks" },
    { label: "Minutes driving", value: driving, tab: "schedule" },
  ];

  return (
    <>
      <AppHeader eyebrow={longDate(dayOffset)} title="Good morning, Sarah">
        <div className="mt-4 flex items-center gap-4">
          <Ring
            percent={(done / sarahDay.length) * 100}
            light
            label={`${done} of ${sarahDay.length} visits done`}
          >
            <span className="headline text-h2 text-white">
              {done}/{sarahDay.length}
            </span>
            <span className="text-[10px] text-white/80">visits</span>
          </Ring>
          <p className="min-w-0 text-small text-ink-700">
            {noteApproved
              ? "Oliver's note is approved. Your next visit is Isla Murphy."
              : "Oliver's note is the one to do now, while the visit is fresh."}
          </p>
        </div>
      </AppHeader>
      <div className="p-3.5">
        <div className="mb-3 grid grid-cols-3 gap-2">
          {stats.map((s) => (
            <button
              key={s.label}
              type="button"
              onClick={() => onTab(s.tab)}
              className="cursor-pointer rounded-card border border-border bg-surface px-2.5 py-3 text-left surface-lift"
            >
              <span className="block headline text-h1">{s.value}</span>
              <span className="block text-caption leading-3.5 text-ink-500">{s.label}</span>
            </button>
          ))}
        </div>
        {finished && !noteApproved && (
          <AppCard title="Just finished">
            <div className="flex items-center gap-3">
              <Avatar name={finished.client} />
              <div className="min-w-0">
                <p className="font-semibold">{finished.client}</p>
                <p className="truncate text-small text-ink-700">{finished.service}</p>
              </div>
            </div>
            <Button variant="primary" className="mt-3 w-full" onClick={onNote}>
              <Mic className="size-4" strokeWidth={1.75} aria-hidden="true" />
              Write note with AI
            </Button>
          </AppCard>
        )}
        {next && (
          <AppCard title="Next visit" action={<Tag tone="available">{next.start}</Tag>}>
            <div className="flex items-center gap-3">
              <Avatar name={next.client} />
              <div className="min-w-0">
                <p className="font-semibold">{next.client}</p>
                <p className="truncate text-small text-ink-700">
                  {next.service}, {next.place}
                </p>
              </div>
            </div>
            {next.leaveBy && (
              <p className="mt-2 flex items-center gap-1.5 text-small font-medium text-monitor">
                <Car className="size-4" strokeWidth={1.5} aria-hidden="true" />
                Leave by {next.leaveBy}
              </p>
            )}
            {next.note && <p className="mt-1.5 text-small text-ink-700">{next.note}</p>}
            <a
              href={mapsLink(next.place)}
              target="_blank"
              rel="noreferrer"
              className="mt-3 flex h-9 items-center justify-center gap-2 rounded-control border border-border-strong text-small font-semibold text-ink-900 hover:no-underline"
            >
              <MapPin className="size-4" strokeWidth={1.5} aria-hidden="true" />
              Directions
            </a>
          </AppCard>
        )}
      </div>
    </>
  );
}

function ScheduleTab({ onNote }: { onNote: () => void }) {
  const [day, setDay] = useState<number>(TODAY);
  const [openId, setOpenId] = useState<string | null>(null);
  const stage = useDemoStore((s) => s.story.stage);
  const complete = useDemoStore((s) => s.completeVisit);
  const cancel = useDemoStore((s) => s.cancelVisit);
  const live = useLiveVisits().filter(
    (v) => v.clinicianId === sarah.id && (v.type === "Home visit" || v.type === "Telehealth"),
  );
  const seededToday = day === TODAY;
  const bookedHere = live.filter(
    (v) => v.day === day && (!seededToday || v.id.startsWith("booked-")),
  );
  const items = bookedHere.sort((a, b) => a.start - b.start);
  const open = live.find((v) => v.id === openId);

  return (
    <>
      <AppHeader eyebrow="Your week" title="Schedule">
        <div className="mt-4 grid grid-cols-5 gap-1.5" role="group" aria-label="Choose a day">
          {scheduleDays.map((d) => {
            const [weekday, date] = d.label.split(" ");
            return (
              <button
                key={d.id}
                type="button"
                aria-pressed={day === d.id}
                onClick={() => setDay(d.id)}
                className={cn(
                  "flex cursor-pointer flex-col items-center rounded-control! py-2 text-white",
                  day === d.id ? "bg-white text-[var(--hero-ink)]!" : "bg-white/12",
                )}
              >
                <span className="text-[11px] font-medium opacity-85">{weekday?.slice(0, 3)}</span>
                <span className="headline text-h2">{date}</span>
              </button>
            );
          })}
        </div>
      </AppHeader>
      <div className="p-3.5">
        {seededToday &&
          sarahDay.map((v) => (
            <div key={v.id}>
              {v.driveBefore > 0 && (
                <p className="mb-2 flex items-center gap-1.5 px-1 text-caption text-ink-500">
                  <Car className="size-3.5" strokeWidth={1.5} aria-hidden="true" />
                  {v.driveBefore} min drive
                </p>
              )}
              <AppCard>
                <div className="flex items-start gap-3">
                  <Avatar name={v.client} />
                  <div className="min-w-0 flex-1">
                    <p className="text-caption font-semibold text-accent">
                      {v.start} to {v.end}
                    </p>
                    <p className="font-semibold">{v.client}</p>
                    <p className="flex items-center gap-1 text-small text-ink-700">
                      {v.kind === "Telehealth" && (
                        <Video className="size-3.5" strokeWidth={1.5} aria-hidden="true" />
                      )}
                      {v.service}, {v.place}
                    </p>
                  </div>
                  {(v.state === "done" ||
                    (v.state === "just-finished" && stage === "approved")) && (
                    <Tag tone="healthy">Done</Tag>
                  )}
                </div>
                {v.state === "just-finished" && stage !== "approved" && (
                  <Button variant="primary" className="mt-3 w-full" onClick={onNote}>
                    Write note with AI
                  </Button>
                )}
              </AppCard>
            </div>
          ))}
        {items.map((v) => (
          <button
            key={v.id}
            type="button"
            onClick={() => setOpenId(v.id)}
            className="mb-3 flex w-full cursor-pointer items-center gap-3 rounded-card border border-border bg-surface p-4 text-left surface-lift"
          >
            <Avatar name={v.title} />
            <span className="min-w-0 flex-1">
              <span className="block text-caption font-semibold text-accent">
                {formatTime(v.start)}
              </span>
              <span className="block truncate font-semibold">{v.title}</span>
              <span className="block truncate text-small text-ink-700">
                {v.type}
                {v.suburb ? `, ${v.suburb}` : ""}
              </span>
            </span>
            <Tag
              tone={
                v.status === "booked" ? "available" : v.status === "completed" ? "healthy" : "over"
              }
            >
              {v.status === "booked" ? "Booked" : v.status === "completed" ? "Done" : "Cancelled"}
            </Tag>
          </button>
        ))}
        {!seededToday && items.length === 0 && (
          <AppCard>
            <p className="text-small text-ink-700">No visits booked this day.</p>
          </AppCard>
        )}
      </div>
      {open && (
        <VisitPanel
          visit={open}
          onClose={() => setOpenId(null)}
          onComplete={() => complete(open)}
          onCancel={() => cancel(open)}
        />
      )}
    </>
  );
}

function VisitPanel({
  visit,
  onClose,
  onComplete,
  onCancel,
}: {
  visit: ScheduleItem;
  onClose: () => void;
  onComplete: () => void;
  onCancel: () => void;
}) {
  const booked = visit.status === "booked";
  return (
    <AppSheet
      title={visit.title}
      onClose={onClose}
      footer={
        booked ? (
          <>
            <Button
              variant="primary"
              className="flex-1"
              disabled={visit.day > TODAY}
              onClick={onComplete}
            >
              Mark complete
            </Button>
            <Button className="flex-1" onClick={onCancel}>
              Cancel visit
            </Button>
          </>
        ) : undefined
      }
    >
      <p className="text-small text-ink-700">
        {scheduleDays[visit.day]?.label}, {formatTime(visit.start)}, {visit.duration} minutes
      </p>
      <p className="mt-1 text-small text-ink-700">
        {visit.type}
        {visit.suburb ? `, ${visit.suburb}` : ""}
      </p>
      {visit.day > TODAY && booked && (
        <p className="mt-2 text-small text-ink-500">
          It can be marked complete once it has happened.
        </p>
      )}
      {visit.status === "completed" && (
        <p className="mt-3 flex items-center gap-1.5 text-small font-semibold text-healthy">
          <Check className="size-4" strokeWidth={2} aria-hidden="true" />
          Visit complete. A note task is in your tasks.
        </p>
      )}
      {visit.status === "cancelled" && (
        <p className="mt-3 text-small font-semibold text-over">Visit cancelled.</p>
      )}
    </AppSheet>
  );
}

function ClientForm({
  initial,
  title,
  submit,
  onClose,
  onSave,
}: {
  initial: ClientRecord;
  title: string;
  submit: string;
  onClose: () => void;
  onSave: (client: ClientRecord) => void;
}) {
  const [form, setForm] = useState(initial);
  const [age, setAge] = useState(initial.age === null ? "" : String(initial.age));
  const [tried, setTried] = useState(false);
  const set = (key: keyof ClientRecord, value: string) => setForm((f) => ({ ...f, [key]: value }));
  const ageNumber = age.trim() === "" ? null : Number(age);
  const ageBad =
    ageNumber !== null && (!Number.isInteger(ageNumber) || ageNumber < 0 || ageNumber > 120);
  const valid = form.name.trim() && form.service.trim() && !ageBad;

  return (
    <AppSheet
      title={title}
      onClose={onClose}
      footer={
        <Button
          variant="primary"
          className="flex-1"
          onClick={() => {
            setTried(true);
            if (valid)
              onSave({
                ...form,
                name: form.name.trim(),
                service: form.service.trim(),
                age: ageNumber,
              });
          }}
        >
          {submit}
        </Button>
      }
    >
      <div className="flex flex-col gap-3">
        <Field
          label="Full name"
          error={tried && !form.name.trim() ? "Enter the client's name" : undefined}
        >
          <input
            className={inputClass}
            value={form.name}
            onChange={(e) => set("name", e.target.value)}
          />
        </Field>
        <div className="grid grid-cols-2 gap-3">
          <Field label="Age" error={tried && ageBad ? "Whole years only" : undefined}>
            <input
              className={inputClass}
              inputMode="numeric"
              value={age}
              onChange={(e) => setAge(e.target.value)}
            />
          </Field>
          <Field label="Funding">
            <Select
              className={inputClass}
              value={form.funding}
              onChange={(e) => set("funding", e.target.value as Funding)}
            >
              <option>NDIS</option>
              <option>Aged care</option>
            </Select>
          </Field>
        </div>
        <Field
          label="Service"
          error={tried && !form.service.trim() ? "Enter the service" : undefined}
        >
          <input
            className={inputClass}
            value={form.service}
            onChange={(e) => set("service", e.target.value)}
          />
        </Field>
        <Field label="Suburb">
          <input
            className={inputClass}
            value={form.suburb}
            onChange={(e) => set("suburb", e.target.value)}
          />
        </Field>
        <Field label="Main contact">
          <input
            className={inputClass}
            value={form.contactName}
            onChange={(e) => set("contactName", e.target.value)}
          />
        </Field>
        <Field label="Contact phone">
          <input
            className={inputClass}
            inputMode="tel"
            value={form.contactPhone}
            onChange={(e) => set("contactPhone", e.target.value)}
          />
        </Field>
      </div>
    </AppSheet>
  );
}

function BookPanel({ client, onClose }: { client: ClientRecord; onClose: () => void }) {
  const book = useDemoStore((s) => s.bookVisit);
  const live = useLiveVisits();
  const [day, setDay] = useState<number>(TODAY + 1);
  const [start, setStart] = useState(
    () => nextFreeStart(live, sarah.id, TODAY + 1, 45) ?? DAY_START,
  );
  const [type, setType] = useState<"Home visit" | "Telehealth">("Home visit");
  const clinicianId = sarah.id;
  const clash = findClash(live, clinicianId, day, start, 45);
  const times = Array.from(
    { length: (DAY_END - DAY_START) / 15 - 3 },
    (_, i) => DAY_START + i * 15,
  );
  return (
    <AppSheet
      title="Book visit"
      onClose={onClose}
      footer={
        <Button
          variant="primary"
          className="flex-1"
          disabled={Boolean(clash)}
          onClick={() => {
            book({
              clinicianId,
              day,
              start,
              duration: 45,
              type,
              title: client.name,
              suburb: type === "Home visit" ? client.suburb || undefined : undefined,
              travel: type === "Home visit" ? 15 : 0,
            });
            onClose();
          }}
        >
          Book visit
        </Button>
      }
    >
      <div className="flex flex-col gap-3">
        <Field label="Day">
          <Select
            className={inputClass}
            value={day}
            onChange={(e) => setDay(Number(e.target.value))}
          >
            {scheduleDays
              .filter((d) => d.id >= TODAY)
              .map((d) => (
                <option key={d.id} value={d.id}>
                  {d.label}
                </option>
              ))}
          </Select>
        </Field>
        <Field label="Start time">
          <Select
            className={inputClass}
            value={start}
            onChange={(e) => setStart(Number(e.target.value))}
          >
            {times.map((t) => (
              <option key={t} value={t}>
                {formatTime(t)}
              </option>
            ))}
          </Select>
        </Field>
        <Field label="Type">
          <Select
            className={inputClass}
            value={type}
            onChange={(e) => setType(e.target.value as "Home visit" | "Telehealth")}
          >
            <option>Home visit</option>
            <option>Telehealth</option>
          </Select>
        </Field>
        {clash && (
          <p role="alert" className="text-small font-medium text-over">
            You already have {clash.title} at {formatTime(clash.start)}. Choose another time.
          </p>
        )}
      </div>
    </AppSheet>
  );
}

function ClientsTab() {
  const added = useDemoStore((s) => s.addedClients);
  const edits = useDemoStore((s) => s.clientEdits);
  const addClient = useDemoStore((s) => s.addClient);
  const updateClient = useDemoStore((s) => s.updateClient);
  const live = useLiveVisits();
  const [query, setQuery] = useState("");
  const [panel, setPanel] = useState<"add" | "edit" | "book" | null>(null);
  const [openId, setOpenId] = useState<string | null>(null);
  const mine = liveDirectory(added, edits)
    .filter((c) => c.clinician === OWNER)
    .filter((c) => `${c.name} ${c.service}`.toLowerCase().includes(query.trim().toLowerCase()));
  const client = openId ? clientRecord(openId, added, edits) : null;
  const visits = client
    ? live.filter((v) => v.title === client.name).sort((a, b) => a.day - b.day || a.start - b.start)
    : [];

  const blank: ClientRecord = {
    id: "",
    name: "",
    age: null,
    funding: "NDIS",
    clinician: OWNER,
    region: sarah.site,
    suburb: "",
    service: "",
    contactName: "",
    contactPhone: "",
    state: "New",
  };

  return (
    <>
      <AppHeader
        eyebrow={`${mine.length} on your caseload`}
        title="Clients"
        aside={
          <Button variant="secondary" aria-label="Add client" onClick={() => setPanel("add")}>
            <Plus className="size-4" strokeWidth={2} aria-hidden="true" />
            Add
          </Button>
        }
      >
        <label className="relative mt-4 block rounded-control">
          <Search
            className="absolute top-2.5 left-3 size-4 text-ink-500"
            strokeWidth={1.75}
            aria-hidden="true"
          />
          <input
            aria-label="Search clients"
            placeholder="Search clients"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="h-9 w-full rounded-control bg-surface pr-3 pl-9 text-small text-ink-900 outline-none"
          />
        </label>
      </AppHeader>
      <div className="p-3.5">
        {mine.map((c) => (
          <button
            key={c.id}
            type="button"
            onClick={() => setOpenId(c.id)}
            className="mb-2.5 flex w-full cursor-pointer items-center gap-3 rounded-card border border-border bg-surface p-3.5 text-left surface-lift"
          >
            <Avatar name={c.name} />
            <span className="min-w-0 flex-1">
              <span className="block truncate font-semibold">{c.name}</span>
              <span className="block truncate text-small text-ink-700">{c.service}</span>
            </span>
            <Tag
              tone={c.state === "New" ? "available" : c.state === "Paused" ? "monitor" : "healthy"}
            >
              {c.state}
            </Tag>
          </button>
        ))}
        {mine.length === 0 && (
          <AppCard>
            <p className="text-small text-ink-700">No clients match your search.</p>
          </AppCard>
        )}
      </div>

      {client && !panel && (
        <AppSheet
          title={client.name}
          onClose={() => setOpenId(null)}
          footer={
            <>
              <Button variant="primary" className="flex-1" onClick={() => setPanel("book")}>
                Book visit
              </Button>
              <Button className="flex-1" onClick={() => setPanel("edit")}>
                Edit
              </Button>
            </>
          }
        >
          <p className="text-small text-ink-700">
            {client.age === null ? "" : `${client.age} yrs, `}
            {client.funding}, {client.service}
          </p>
          <p className="mt-1 text-small text-ink-700">{client.suburb || "Suburb not recorded"}</p>
          {client.contactPhone && /\d/.test(client.contactPhone) ? (
            <a
              href={`tel:${client.contactPhone.replace(/[^\d+]/g, "")}`}
              className="mt-3 flex h-9 items-center justify-center gap-2 rounded-control border border-border-strong text-small font-semibold text-ink-900 hover:no-underline"
            >
              <Phone className="size-4" strokeWidth={1.5} aria-hidden="true" />
              Call {client.contactName || "contact"}
            </a>
          ) : (
            <p className="mt-3 text-small text-ink-500">No contact phone recorded.</p>
          )}
          <h4 className="mt-4 mb-1 text-small font-semibold">Visits this week</h4>
          {visits.length === 0 ? (
            <p className="text-small text-ink-500">None booked.</p>
          ) : (
            <ul className="divide-y divide-border">
              {visits.map((v) => (
                <li key={v.id} className="flex justify-between gap-2 py-2 text-small">
                  <span>
                    {scheduleDays[v.day]?.short} {formatTime(v.start)}
                  </span>
                  <span className="text-ink-500">{v.status === "booked" ? v.type : v.status}</span>
                </li>
              ))}
            </ul>
          )}
        </AppSheet>
      )}
      {panel === "add" && (
        <ClientForm
          title="Add client"
          submit="Create client"
          initial={blank}
          onClose={() => setPanel(null)}
          onSave={(next) => {
            const id = newClientId(next.name, added);
            addClient({ ...next, id });
            setPanel(null);
            setOpenId(id);
          }}
        />
      )}
      {panel === "edit" && client && (
        <ClientForm
          title="Edit client"
          submit="Save changes"
          initial={client}
          onClose={() => setPanel(null)}
          onSave={(next) => {
            updateClient(client.id, next);
            setPanel(null);
          }}
        />
      )}
      {panel === "book" && client && <BookPanel client={client} onClose={() => setPanel(null)} />}
    </>
  );
}

function TasksTab({ offline, queued }: { offline: boolean; queued: string[] }) {
  const tasks = useDemoStore((s) => s.tasks);
  const completeTask = useDemoStore((s) => s.completeTask);
  const setOp = useDemoStore((s) => s.setOp);
  const [show, setShow] = useState<"open" | "overdue" | "done">("open");
  const mine = tasks.filter((t) => t.owner === OWNER);
  const list = mine.filter((t) =>
    show === "done" ? t.done : show === "overdue" ? !t.done && t.daysOverdue > 0 : !t.done,
  );
  const filters = [
    { id: "open", label: "Open" },
    { id: "overdue", label: "Overdue" },
    { id: "done", label: "Done" },
  ] as const;
  return (
    <>
      <AppHeader eyebrow={`${mine.filter((t) => !t.done).length} still open`} title="Tasks">
        <div role="group" aria-label="Show tasks" className="mt-4 flex gap-1.5">
          {filters.map((f) => (
            <button
              key={f.id}
              type="button"
              aria-pressed={show === f.id}
              onClick={() => setShow(f.id)}
              className={cn(
                "h-8 cursor-pointer rounded-full px-3.5 text-small font-semibold text-white",
                show === f.id ? "bg-white text-[var(--hero-ink)]!" : "bg-white/12",
              )}
            >
              {f.label}
            </button>
          ))}
        </div>
      </AppHeader>
      <div className="p-3.5">
        {list.length === 0 && (
          <AppCard>
            <p className="text-small text-ink-700">Nothing here.</p>
          </AppCard>
        )}
        {list.map((t) => {
          const saved = queued.includes(t.id);
          return (
            <AppCard key={t.id}>
              <div className="flex items-start justify-between gap-2">
                <p className="min-w-0 font-semibold">{t.title}</p>
                {t.daysOverdue > 0 && !t.done && <Tag tone="over">{t.daysOverdue}d late</Tag>}
              </div>
              <p className="text-small text-ink-700">
                {t.client}, due {t.due}
              </p>
              {saved ? (
                <p className="mt-2 text-small font-medium text-monitor">
                  Saved on this phone. It sends when you&apos;re back online.
                </p>
              ) : t.done ? (
                <p className="mt-2 text-small font-semibold text-healthy">Done</p>
              ) : (
                <Button
                  size="sm"
                  className="mt-2.5"
                  onClick={() =>
                    offline
                      ? setOp("staff:queued", [...queued, t.id].join(","))
                      : completeTask(t.id)
                  }
                >
                  Mark done
                </Button>
              )}
            </AppCard>
          );
        })}
      </div>
    </>
  );
}

function MeTab({
  offline,
  queued,
  onOffline,
}: {
  offline: boolean;
  queued: number;
  onOffline: () => void;
}) {
  const notices = useDemoStore((s) => s.story.notices).filter((n) => n.to === "Clinician");
  const me = clinicianById(sarah.id) ?? sarah;
  const facts = [
    ["Active clients", `${me.active} of ${me.capacity}`],
    ["Notes overdue", String(me.notesOverdue)],
    ["Next supervision", me.nextSupervision],
  ];
  return (
    <>
      <AppHeader eyebrow={me.role} title={me.name} aside={<Avatar name={me.name} size={52} />} />
      <div className="p-3.5">
        <AppCard title="Connection">
          <div className="flex items-center gap-3">
            <Switch
              on={offline}
              label={`Offline mode: ${offline ? "on" : "off"}`}
              onToggle={onOffline}
            />
            <div className="min-w-0">
              <p className="text-small font-semibold">Offline mode</p>
              <p className="text-caption text-ink-500">
                {offline
                  ? `${sarahDay.length} visits saved${queued ? `, ${queued} to send` : ""}`
                  : "Turn on before you lose signal"}
              </p>
            </div>
          </div>
        </AppCard>
        <AppCard title="My work">
          <dl className="divide-y divide-border">
            {facts.map(([k, v]) => (
              <div key={k} className="flex justify-between gap-3 py-2 text-small">
                <dt className="text-ink-500">{k}</dt>
                <dd className="font-semibold">{v}</dd>
              </div>
            ))}
          </dl>
        </AppCard>
        <AppCard title="Notifications">
          {notices.length === 0 ? (
            <p className="text-small text-ink-500">Nothing new.</p>
          ) : (
            <ul className="flex flex-col gap-2 text-small">
              {notices.map((n) => (
                <li key={n.id}>{n.text}</li>
              ))}
            </ul>
          )}
        </AppCard>
        <ButtonLink href="/my-day" className="w-full">
          Open full Medisense
        </ButtonLink>
      </div>
    </>
  );
}

function NoteView({ offline, onBack }: { offline: boolean; onBack: () => void }) {
  const story = useDemoStore((s) => s.story);
  const setTranscript = useDemoStore((s) => s.setTranscript);
  const finish = useDemoStore((s) => s.finishDictation);
  const begin = useDemoStore((s) => s.beginSessionNote);
  const complete = useDemoStore((s) => s.completeSessionNote);
  const fail = useDemoStore((s) => s.failSessionNote);
  const approve = useDemoStore((s) => s.approveSessionNote);
  const reopen = useDemoStore((s) => s.reopenSessionNote);
  const [text, setText] = useState(story.transcript);
  const dictation = useDictation((heard) =>
    setText((t) => (t.trim() ? `${t.trimEnd()}\n${heard}` : heard)),
  );

  async function write() {
    const lines = text
      .split(/\r?\n/)
      .map((l) => l.trim())
      .filter(Boolean);
    if (lines.length === 0) return;
    if (dictation.listening) dictation.stop();
    setTranscript(lines.join("\n"));
    finish();
    begin();
    const result = await callStory<SessionNote>({ kind: "note", lines });
    if (!("error" in result)) complete(result.data, result.meta);
    else if (lines.join("\n") === sampleDictation.join("\n")) {
      complete(preparedNote, { source: "prepared", model: null, latencyMs: null });
    } else fail(`The note couldn't be written: ${result.error}. Your text is still here.`);
  }

  const hasNote = story.note && (story.stage === "draft" || story.stage === "approved");
  const approved = story.stage === "approved";

  return (
    <div className="absolute inset-0 z-20 overflow-y-auto bg-canvas pb-6">
      <AppHeader
        eyebrow="Oliver Grant, today's visit"
        title={hasNote ? (approved ? "Note approved" : "Check your note") : "AI session note"}
        aside={
          <button
            type="button"
            onClick={onBack}
            aria-label="Back"
            className="flex size-9 flex-none cursor-pointer items-center justify-center rounded-full bg-white/15 text-ink-900"
          >
            <ArrowLeft className="size-5" strokeWidth={1.75} aria-hidden="true" />
          </button>
        }
      />
      <div className="p-3.5">
        {story.stage === "generating" ? (
          <AppCard>
            <p role="status" className="text-small text-ink-700">
              AI is writing the note…
            </p>
          </AppCard>
        ) : hasNote && story.note ? (
          <>
            {!approved && (
              <div className="mb-3">
                <AiMark>AI draft, needs your approval</AiMark>
              </div>
            )}
            {noteSectionTitles.map(({ id, title }) =>
              story.note?.sections[id].length ? (
                <AppCard key={id} title={title}>
                  <ul className="flex flex-col gap-1.5 text-small">
                    {story.note.sections[id].map((s) => (
                      <li key={s.id}>{s.text}</li>
                    ))}
                  </ul>
                </AppCard>
              ) : null,
            )}
            {story.note.missing.length > 0 && !approved && (
              <AppCard title="AI thinks this may be missing">
                <ul className="flex list-disc flex-col gap-1 pl-4 text-small">
                  {story.note.missing.map((m) => (
                    <li key={m.id}>{m.text}</li>
                  ))}
                </ul>
              </AppCard>
            )}
            {!approved && (
              <div className="flex gap-2">
                <Button variant="primary" className="flex-1" onClick={approve}>
                  <Check className="size-4" strokeWidth={2} aria-hidden="true" />
                  Approve note
                </Button>
                <Button onClick={reopen}>Start again</Button>
              </div>
            )}
          </>
        ) : (
          <>
            <div className="mb-3 flex flex-col items-center gap-2 py-3">
              <button
                type="button"
                aria-label={dictation.listening ? "Stop dictating" : "Start dictating"}
                disabled={!dictation.supported}
                onClick={() => (dictation.listening ? dictation.stop() : dictation.start())}
                className="primary-glow flex size-22 cursor-pointer items-center justify-center rounded-full bg-accent-fill text-on-accent disabled:cursor-not-allowed disabled:opacity-50"
              >
                {dictation.listening ? (
                  <MicOff className="size-8" strokeWidth={1.5} aria-hidden="true" />
                ) : (
                  <Mic className="size-8" strokeWidth={1.5} aria-hidden="true" />
                )}
              </button>
              <p className="text-small text-ink-700">
                {!dictation.supported
                  ? "Dictation isn't available in this browser. Type instead."
                  : dictation.listening
                    ? "Listening…"
                    : "Tap and talk through the visit"}
              </p>
            </div>
            <AppCard>
              <label className="flex flex-col gap-1 text-caption font-semibold text-ink-700">
                What happened on this visit?
                <textarea
                  rows={8}
                  value={text}
                  onChange={(e) => setText(e.target.value)}
                  className="w-full rounded-control border border-border-strong bg-surface-raised px-3 py-2 text-small font-normal text-ink-900 outline-none focus:border-accent focus:shadow-focus"
                />
              </label>
              {story.error && (
                <p role="alert" className="mt-2 text-small font-medium text-over">
                  {story.error}
                </p>
              )}
              {offline && (
                <p className="mt-2 text-small text-monitor">
                  AI needs a connection. Your text stays here until you&apos;re back online.
                </p>
              )}
              <div className="mt-3 flex flex-col gap-2">
                <Button
                  variant="primary"
                  disabled={offline || !text.trim()}
                  onClick={() => void write()}
                >
                  Write note with AI
                </Button>
                <Button onClick={() => setText(sampleDictation.join("\n"))}>
                  Use sample dictation
                </Button>
              </div>
            </AppCard>
          </>
        )}
      </div>
    </div>
  );
}

export function StaffApp() {
  const offline = useDemoStore((s) => s.ops["staff:offline"] === "on");
  const queuedValue = useDemoStore((s) => s.ops["staff:queued"] ?? "");
  const setOp = useDemoStore((s) => s.setOp);
  const completeTask = useDemoStore((s) => s.completeTask);
  const [tab, setTab] = useState("home");
  const [noteOpen, setNoteOpen] = useState(false);
  const queued = queuedValue ? queuedValue.split(",") : [];

  function toggleOffline() {
    if (offline) {
      queued.forEach(completeTask);
      setOp("staff:queued", "");
    }
    setOp("staff:offline", offline ? "off" : "on");
  }

  return (
    <PhoneFrame
      name="Staff app"
      description="Everything a therapist needs between home visits, from the car or the client's lounge room."
      features={[
        "Today's visits, directions and when to leave",
        "Talk through the visit and AI writes the note",
        "Add clients and book visits on the go",
        "Tasks and notifications in one place",
      ]}
      tabs={tabs}
      active={tab}
      onTab={setTab}
      overlay={
        noteOpen ? <NoteView offline={offline} onBack={() => setNoteOpen(false)} /> : undefined
      }
    >
      {offline && (
        <p
          role="status"
          className="sticky top-0 z-10 bg-monitor py-1 text-center text-caption font-semibold text-white"
        >
          Offline{queued.length ? `, ${queued.length} waiting to send` : ""}
        </p>
      )}
      {tab === "home" && <HomeTab onNote={() => setNoteOpen(true)} onTab={setTab} />}
      {tab === "schedule" && <ScheduleTab onNote={() => setNoteOpen(true)} />}
      {tab === "clients" && <ClientsTab />}
      {tab === "tasks" && <TasksTab offline={offline} queued={queued} />}
      {tab === "me" && <MeTab offline={offline} queued={queued.length} onOffline={toggleOffline} />}
    </PhoneFrame>
  );
}
