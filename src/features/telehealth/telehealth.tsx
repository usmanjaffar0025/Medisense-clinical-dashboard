"use client";

import {
  Camera,
  CameraOff,
  CircleCheck,
  MessageSquare,
  Mic,
  MicOff,
  PhoneOff,
  Send,
  UserRound,
  Video,
} from "lucide-react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { AiMark } from "@/components/ai/marks";
import { draftSurface } from "@/components/ai/provenance";
import { Button, ButtonLink } from "@/components/ui/button";
import { Caption, Card, CardTitle } from "@/components/ui/card";
import { Avatar } from "@/components/ui/premium";
import { Segmented } from "@/components/ui/segmented";
import { inputClass } from "@/components/ui/sheet";
import { StatRow } from "@/components/ui/stat-row";
import { Tag } from "@/components/ui/tag";
import { clinicians } from "@/data/clinicians";
import { liveDirectory } from "@/data/records";
import { formatTime, TODAY, type ScheduleItem } from "@/data/schedule";
import { useLiveVisits } from "@/features/clients/client-record";
import { cn } from "@/lib/cn";
import { noteSectionTitles, type SessionNote } from "@/lib/story/types";
import { useDemoStore } from "@/state/demo-store";
import { callStory } from "@/state/use-story-ai";

const clinicianName = (id: string) => clinicians.find((c) => c.id === id)?.name ?? "";

function clock(seconds: number) {
  return `${Math.floor(seconds / 60)}:${String(seconds % 60).padStart(2, "0")}`;
}

function DockButton({
  on,
  label,
  onClick,
  children,
  danger,
}: {
  on?: boolean;
  label: string;
  onClick: () => void;
  children: React.ReactNode;
  danger?: boolean;
}) {
  return (
    <button
      type="button"
      aria-label={label}
      aria-pressed={on}
      title={label}
      onClick={onClick}
      className={cn(
        "flex size-12 cursor-pointer items-center justify-center rounded-full text-white transition-colors",
        danger
          ? "bg-over-dot hover:brightness-110"
          : on
            ? "bg-white/30"
            : "bg-white/12 hover:bg-white/20",
      )}
    >
      {children}
    </button>
  );
}

function NotePanel({ visit, ended }: { visit: ScheduleItem; ended: boolean }) {
  const completeTask = useDemoStore((s) => s.completeTask);
  const setOp = useDemoStore((s) => s.setOp);
  const approved = useDemoStore((s) => s.ops[`telehealth:${visit.id}`] === "approved");
  const [text, setText] = useState("");
  const [note, setNote] = useState<SessionNote | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function write() {
    const lines = text
      .split(/\r?\n/)
      .map((l) => l.trim())
      .filter(Boolean);
    if (lines.length === 0) {
      setError("Add what happened on the visit first.");
      return;
    }
    setBusy(true);
    setError(null);
    const result = await callStory<SessionNote>({
      kind: "note",
      lines,
      context: `${visit.title}, telehealth visit with ${clinicianName(visit.clinicianId)}.`,
    });
    setBusy(false);
    if ("error" in result) {
      setError(`The note couldn't be written: ${result.error}. Your text is still here.`);
      return;
    }
    setNote(result.data);
  }

  if (approved) {
    return (
      <p role="status" className="flex items-center gap-2 text-small font-semibold text-healthy">
        <CircleCheck className="size-4" strokeWidth={2} aria-hidden="true" />
        Note approved. The note task is closed.
      </p>
    );
  }
  if (note) {
    return (
      <div className="flex flex-col gap-3">
        <AiMark>AI draft, needs your approval</AiMark>
        {noteSectionTitles.map(({ id, title }) =>
          note.sections[id].length ? (
            <div key={id}>
              <h4 className="headline text-section">{title}</h4>
              <ul className="mt-1 flex flex-col gap-1 text-small">
                {note.sections[id].map((s) => (
                  <li key={s.id}>{s.text}</li>
                ))}
              </ul>
            </div>
          ) : null,
        )}
        <div className="flex gap-2">
          <Button
            variant="primary"
            onClick={() => {
              setOp(
                `telehealth:${visit.id}`,
                "approved",
                "Approved AI session note for telehealth visit",
                visit.title,
              );
              completeTask(`t-note-${visit.id}`);
            }}
          >
            Approve note
          </Button>
          <Button onClick={() => setNote(null)}>Change my notes</Button>
        </div>
      </div>
    );
  }
  return (
    <div className="flex flex-col gap-3">
      <AiMark>AI session note</AiMark>
      <label className="flex flex-col gap-1 text-caption font-semibold text-ink-700">
        What happened on this visit?
        <textarea
          rows={9}
          value={text}
          onChange={(e) => setText(e.target.value)}
          className="w-full rounded-control border border-border-strong bg-surface-raised px-3 py-2 text-small font-normal text-ink-900 outline-none focus:border-accent focus:shadow-focus"
        />
      </label>
      {error && (
        <p role="alert" className="text-small font-medium text-over">
          {error}
        </p>
      )}
      <Button variant="primary" disabled={busy} onClick={() => void write()}>
        {busy ? "AI is writing the note…" : "Write note with AI"}
      </Button>
      {!ended && (
        <Caption>You can take notes during the visit, or write them when it ends.</Caption>
      )}
    </div>
  );
}

function ClientPanel({ visit }: { visit: ScheduleItem }) {
  const added = useDemoStore((s) => s.addedClients);
  const edits = useDemoStore((s) => s.clientEdits);
  const client = liveDirectory(added, edits).find((c) => c.name === visit.title);
  const rows = client
    ? [
        ["Funding", client.funding],
        ["Service", client.service],
        ["Clinician", client.clinician],
        ["Age", client.age === null ? "Not recorded" : `${client.age} yrs`],
      ]
    : [["Visit", visit.type]];
  return (
    <div>
      <div className="mb-3 flex items-center gap-3">
        <Avatar name={visit.title} size={48} />
        <div>
          <p className="headline text-h2">{visit.title}</p>
          <Caption>
            {formatTime(visit.start)}, {visit.duration} minutes
          </Caption>
        </div>
      </div>
      <dl className="divide-y divide-border">
        {rows.map(([k, v]) => (
          <div key={k} className="flex justify-between gap-3 py-2 text-small">
            <dt className="text-ink-500">{k}</dt>
            <dd className="text-right font-medium">{v}</dd>
          </div>
        ))}
      </dl>
      {client && (
        <Link href={`/clients/${client.id}`} className="mt-3 inline-block text-small font-semibold">
          Open client record
        </Link>
      )}
    </div>
  );
}

function ChatPanel() {
  const [messages, setMessages] = useState<string[]>([]);
  const [draft, setDraft] = useState("");
  return (
    <div>
      <Caption>Share a link or instruction during the visit. Messages aren&apos;t saved.</Caption>
      <ul className="mt-3 flex min-h-32 flex-col gap-2">
        {messages.map((m, i) => (
          <li key={i} className="self-end rounded-control bg-accent-tint px-3 py-2 text-small">
            {m}
          </li>
        ))}
      </ul>
      <form
        className="mt-3 flex gap-2"
        onSubmit={(e) => {
          e.preventDefault();
          if (!draft.trim()) return;
          setMessages((list) => [...list, draft.trim()]);
          setDraft("");
        }}
      >
        <input
          aria-label="Chat message"
          className={inputClass}
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
        />
        <Button
          variant="primary"
          type="submit"
          aria-label="Send chat message"
          disabled={!draft.trim()}
        >
          <Send className="size-4" strokeWidth={1.5} aria-hidden="true" />
        </Button>
      </form>
    </div>
  );
}

function Room({ visit, onLeave }: { visit: ScheduleItem; onLeave: () => void }) {
  const complete = useDemoStore((s) => s.completeVisit);
  const [ended, setEnded] = useState(visit.status === "completed");
  const [seconds, setSeconds] = useState(0);
  const [muted, setMuted] = useState(false);
  const [cameraOn, setCameraOn] = useState(false);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [panel, setPanel] = useState<"note" | "client" | "chat">("note");
  const video = useRef<HTMLVideoElement>(null);
  const stream = useRef<MediaStream | null>(null);

  const stopCamera = () => {
    stream.current?.getTracks().forEach((t) => t.stop());
    stream.current = null;
    setCameraOn(false);
  };

  useEffect(() => {
    if (ended) return undefined;
    const timer = window.setInterval(() => setSeconds((s) => s + 1), 1000);
    return () => window.clearInterval(timer);
  }, [ended]);

  useEffect(
    () => () => {
      stream.current?.getTracks().forEach((t) => t.stop());
    },
    [],
  );

  async function toggleCamera() {
    if (cameraOn) {
      stopCamera();
      return;
    }
    try {
      const media = await navigator.mediaDevices.getUserMedia({ video: true });
      stream.current = media;
      if (video.current) video.current.srcObject = media;
      setCameraOn(true);
      setCameraError(null);
    } catch {
      setCameraError("Your camera couldn't be opened. Check the browser's camera permission.");
    }
  }

  return (
    <div className="grid items-start gap-6 lg:grid-cols-12">
      <div className="lg:col-span-8">
        <div className="relative aspect-video overflow-hidden rounded-sheet bg-[radial-gradient(circle_at_30%_20%,var(--room-glow),var(--room-deep)_60%)] text-white shadow-overlay">
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 text-center">
            <Avatar name={visit.title} size={112} className="ring-4 ring-white/25" />
            <p className="headline text-h1">{visit.title}</p>
            <p className="text-small text-white/80">{ended ? "Visit ended" : "Waiting to join"}</p>
          </div>
          <video
            ref={video}
            autoPlay
            muted
            playsInline
            aria-label="Your camera"
            className={cn(
              "absolute top-4 right-4 aspect-video w-1/4 rounded-card object-cover ring-2 ring-white/70",
              !cameraOn && "hidden",
            )}
          />
          <span className="bg-black/35 absolute top-4 left-4 flex items-center gap-2 rounded-full px-3 py-1 text-caption font-semibold backdrop-blur">
            {!ended && <i aria-hidden="true" className="size-2 rounded-full bg-over-dot" />}
            {ended ? "Ended" : clock(seconds)}
          </span>
          {!ended && (
            <div className="absolute inset-x-0 bottom-4 flex justify-center">
              <div className="bg-black/40 flex items-center gap-2 rounded-full p-2 backdrop-blur">
                <DockButton
                  on={muted}
                  label={muted ? "Unmute" : "Mute"}
                  onClick={() => setMuted(!muted)}
                >
                  {muted ? (
                    <MicOff className="size-5" aria-hidden="true" />
                  ) : (
                    <Mic className="size-5" aria-hidden="true" />
                  )}
                </DockButton>
                <DockButton
                  on={cameraOn}
                  label={cameraOn ? "Turn camera off" : "Turn camera on"}
                  onClick={() => void toggleCamera()}
                >
                  {cameraOn ? (
                    <Camera className="size-5" aria-hidden="true" />
                  ) : (
                    <CameraOff className="size-5" aria-hidden="true" />
                  )}
                </DockButton>
                <DockButton
                  danger
                  label="End visit"
                  onClick={() => {
                    stopCamera();
                    setEnded(true);
                    if (visit.status === "booked") complete(visit);
                  }}
                >
                  <PhoneOff className="size-5" aria-hidden="true" />
                </DockButton>
              </div>
            </div>
          )}
        </div>
        {cameraError && (
          <p role="alert" className="mt-2 text-center text-small font-medium text-over">
            {cameraError}
          </p>
        )}
        <div className="mt-3 flex flex-wrap items-center justify-between gap-2">
          <Caption>
            With {clinicianName(visit.clinicianId)}.{" "}
            {ended ? "A note task has been created." : "Your camera preview stays on this device."}
          </Caption>
          <Button variant="ghost" onClick={onLeave}>
            Back to today&apos;s visits
          </Button>
        </div>
      </div>

      <div className={cn(draftSurface(false), "flex flex-col gap-4 px-5 py-5 lg:col-span-4")}>
        <div className="flex">
          <Segmented
            label="Visit panel"
            value={panel}
            onChange={setPanel}
            options={[
              { id: "note", label: "Note" },
              { id: "client", label: "Client" },
              { id: "chat", label: "Chat" },
            ]}
          />
        </div>
        <div className={panel === "note" ? "" : "hidden"}>
          <NotePanel visit={visit} ended={ended} />
        </div>
        {panel === "client" && <ClientPanel visit={visit} />}
        <div className={panel === "chat" ? "" : "hidden"}>
          <ChatPanel />
        </div>
      </div>
    </div>
  );
}

export function Telehealth() {
  const params = useSearchParams();
  const ops = useDemoStore((s) => s.ops);
  const visits = useLiveVisits()
    .filter((v) => v.type === "Telehealth" && v.day === TODAY)
    .sort((a, b) => a.start - b.start);
  const [openId, setOpenId] = useState(params.get("visit"));
  const open = visits.find((v) => v.id === openId);

  if (open) return <Room key={open.id} visit={open} onLeave={() => setOpenId(null)} />;

  const booked = visits.filter((v) => v.status === "booked");
  const completed = visits.filter((v) => v.status === "completed");
  const notes = completed.filter((v) => ops[`telehealth:${v.id}`] !== "approved").length;
  const next = booked[0];

  return (
    <>
      <StatRow
        label="Telehealth summary"
        stats={[
          { label: "Today's video visits", value: visits.length, caption: "Across the team" },
          {
            label: "Still to start",
            value: booked.length,
            caption: next ? `Next at ${formatTime(next.start)}` : "None left",
          },
          { label: "Completed", value: completed.length, caption: "Today" },
          { label: "Notes to approve", value: notes, caption: "From finished visits" },
        ]}
      />
      {next && (
        <section
          aria-label="Next video visit"
          className="mt-6 flex flex-wrap items-center gap-5 rounded-sheet border border-border bg-surface p-5 surface-lift"
        >
          <Avatar name={next.title} size={64} />
          <div className="min-w-0 flex-1">
            <p className="text-caption font-semibold text-accent">
              Next up, {formatTime(next.start)}
            </p>
            <h2 className="headline text-h1">{next.title}</h2>
            <Caption>
              {clinicianName(next.clinicianId)}, {next.duration} minutes
            </Caption>
          </div>
          <Button variant="primary" onClick={() => setOpenId(next.id)}>
            <Video className="size-4" strokeWidth={1.5} aria-hidden="true" />
            Start video visit
          </Button>
        </section>
      )}
      <Card aria-labelledby="telehealth-today" className="mt-6 overflow-hidden">
        <div className="px-5 pt-5 pb-3">
          <CardTitle
            id="telehealth-today"
            title="All video visits today"
            aside={<ButtonLink href="/schedule">Open schedule</ButtonLink>}
          />
        </div>
        {visits.length === 0 ? (
          <p className="border-t border-border px-5 py-5 text-small text-ink-700">
            No video visits today. Use + New to book one as Telehealth.
          </p>
        ) : (
          <ul>
            {visits.map((v) => (
              <li
                key={v.id}
                className="flex flex-wrap items-center gap-3 border-t border-border px-5 py-3"
              >
                <Avatar name={v.title} />
                <span className="min-w-0 flex-1">
                  <span className="block font-semibold">{v.title}</span>
                  <Caption>
                    {formatTime(v.start)}, {clinicianName(v.clinicianId)}
                  </Caption>
                </span>
                {v.status === "cancelled" ? (
                  <Tag tone="over">Cancelled</Tag>
                ) : v.status === "completed" ? (
                  <Button onClick={() => setOpenId(v.id)}>
                    <UserRound className="size-4" strokeWidth={1.5} aria-hidden="true" />
                    Open note
                  </Button>
                ) : (
                  <Button onClick={() => setOpenId(v.id)}>
                    <MessageSquare className="size-4" strokeWidth={1.5} aria-hidden="true" />
                    Join
                  </Button>
                )}
              </li>
            ))}
          </ul>
        )}
      </Card>
    </>
  );
}
