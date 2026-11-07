"use client";

import {
  CalendarDays,
  Check,
  ChevronRight,
  FileText,
  House,
  Lock,
  MessageCircle,
  Send,
  Target,
  UserRound,
} from "lucide-react";
import { useState, useSyncExternalStore } from "react";
import { Button } from "@/components/ui/button";
import { Caption } from "@/components/ui/card";
import { Avatar, Ring } from "@/components/ui/premium";
import { Field, inputClass } from "@/components/ui/sheet";
import { Switch } from "@/components/ui/switch";
import { portalFamily as family } from "@/data/portal";
import { formatTime, scheduleDays } from "@/data/schedule";
import { SignIn } from "@/features/portal/family-portal";
import { cn } from "@/lib/cn";
import { useDemoStore } from "@/state/demo-store";
import { AppCard, AppHeader, AppSheet, PhoneFrame } from "./phone-frame";

const tabs = [
  { id: "home", label: "Home", icon: House },
  { id: "visits", label: "Visits", icon: CalendarDays },
  { id: "progress", label: "Progress", icon: Target },
  { id: "messages", label: "Messages", icon: MessageCircle },
  { id: "more", label: "More", icon: UserRound },
];
const firstName = family.viewer.split(" ")[0] ?? "";
const clinicianFirst = family.clinician.split(" ")[0] ?? "";

function ChangePanel({ onClose }: { onClose: () => void }) {
  const respond = useDemoStore((s) => s.respondToAppointment);
  const send = useDemoStore((s) => s.sendPortalMessage);
  const [reason, setReason] = useState("");
  return (
    <AppSheet
      title="Request a change"
      onClose={onClose}
      footer={
        <Button
          variant="primary"
          className="flex-1"
          onClick={() => {
            respond("change-requested");
            if (reason.trim())
              send(`About the visit on ${family.nextAppointment.when}: ${reason.trim()}`);
            onClose();
          }}
        >
          Send request
        </Button>
      }
    >
      <p className="mb-3 text-small text-ink-700">
        The team will contact you. Your visit stays booked until they do.
      </p>
      <Field label="What would suit you better? (optional)">
        <textarea
          rows={4}
          value={reason}
          onChange={(e) => setReason(e.target.value)}
          className="w-full rounded-control border border-border-strong bg-surface-raised px-3 py-2 text-small text-ink-900 outline-none focus:border-accent focus:shadow-focus"
        />
      </Field>
    </AppSheet>
  );
}

function VisitCard({ onChange }: { onChange: () => void }) {
  const appointment = useDemoStore((s) => s.portalAppointment);
  const respond = useDemoStore((s) => s.respondToAppointment);
  const canChange = useDemoStore((s) => s.portalSettings.rebook);
  return (
    <AppCard title="Next visit">
      <div className="flex items-center gap-3">
        <Avatar name={family.clinician} size={48} />
        <div className="min-w-0">
          <p className="headline text-section">{family.nextAppointment.when}</p>
          <Caption>
            {family.nextAppointment.where}, with {family.nextAppointment.with}
          </Caption>
        </div>
      </div>
      {appointment === "pending" ? (
        <div className="mt-3 flex gap-2">
          <Button variant="primary" className="flex-1" onClick={() => respond("confirmed")}>
            Confirm
          </Button>
          {canChange && (
            <Button className="flex-1" onClick={onChange}>
              Request a change
            </Button>
          )}
        </div>
      ) : (
        <p className="mt-3 flex items-center gap-1.5 text-small font-semibold text-healthy">
          <Check className="size-4" strokeWidth={2} aria-hidden="true" />
          {appointment === "confirmed"
            ? "Confirmed. See you then!"
            : "Request sent. We'll be in touch."}
        </p>
      )}
    </AppCard>
  );
}

function HomeProgram() {
  const done = useDemoStore((s) => s.portalHomeDone);
  const toggle = useDemoStore((s) => s.togglePortalHome);
  return (
    <ul className="flex flex-col gap-3">
      {family.homeProgram.map((h) => {
        const ticked = done.includes(h.id);
        return (
          <li key={h.id}>
            <label className="flex cursor-pointer items-start gap-3">
              <input
                type="checkbox"
                checked={ticked}
                onChange={() => toggle(h.id)}
                className="mt-0.5 size-5 accent-[var(--color-accent-fill)]"
              />
              <span>
                <span
                  className={cn(
                    "block text-small font-semibold",
                    ticked && "text-ink-500 line-through",
                  )}
                >
                  {h.task}
                </span>
                <Caption>{h.detail}</Caption>
              </span>
            </label>
          </li>
        );
      })}
    </ul>
  );
}

function HomeTab({ onChange, onTab }: { onChange: () => void; onTab: (id: string) => void }) {
  const done = useDemoStore((s) => s.portalHomeDone);
  const program = useDemoStore((s) => s.portalSettings.program);
  const percent = (done.length / family.homeProgram.length) * 100;
  return (
    <>
      <AppHeader eyebrow="Medisense family app" title={`Hi ${firstName}`}>
        <div className="mt-4 flex items-center gap-4">
          <Ring
            percent={percent}
            light
            label={`${done.length} of ${family.homeProgram.length} home activities done`}
          >
            <span className="headline text-h2 text-white">
              {done.length}/{family.homeProgram.length}
            </span>
            <span className="text-[10px] text-white/80">this week</span>
          </Ring>
          <p className="min-w-0 text-small text-ink-700">
            Here&apos;s how {family.client} is going with {clinicianFirst}.
          </p>
        </div>
      </AppHeader>
      <div className="p-3.5">
        <VisitCard onChange={onChange} />
        {program && (
          <AppCard title="Practice at home">
            <HomeProgram />
          </AppCard>
        )}
        <button
          type="button"
          onClick={() => onTab("progress")}
          className="flex w-full cursor-pointer items-center justify-between gap-3 rounded-card border border-border bg-surface p-4 text-left surface-lift"
        >
          <span>
            <span className="block headline text-section">{family.client}&apos;s goals</span>
            <Caption>{family.goals.length} goals in progress</Caption>
          </span>
          <ChevronRight className="size-5 text-ink-500" strokeWidth={1.5} aria-hidden="true" />
        </button>
      </div>
    </>
  );
}

function VisitsTab({ onChange }: { onChange: () => void }) {
  const bookings = useDemoStore((s) => s.bookings);
  const changes = useDemoStore((s) => s.visitChanges);
  const booked = bookings
    .filter((b) => b.title === "Emily Carter" && !changes[b.id])
    .map((b) => ({
      when: `${scheduleDays[b.day]?.label ?? ""}, ${formatTime(b.start)}`,
      what: b.suburb ? `${b.type}, ${b.suburb}` : b.type,
    }));
  return (
    <>
      <AppHeader eyebrow={`With ${family.clinician}`} title="Visits" />
      <div className="p-3.5">
        <VisitCard onChange={onChange} />
        <AppCard title="Coming up">
          <ol className="relative flex flex-col gap-4 border-l-2 border-border pl-4">
            {[...booked, ...family.upcoming.slice(1)].map((u) => (
              <li key={u.when} className="relative">
                <span
                  aria-hidden="true"
                  className="absolute top-1 -left-5.5 size-2.5 rounded-full bg-accent-fill ring-4 ring-surface"
                />
                <p className="text-small font-semibold">{u.when}</p>
                <Caption>{u.what}</Caption>
              </li>
            ))}
          </ol>
        </AppCard>
      </div>
    </>
  );
}

function ProgressTab() {
  const goals = useDemoStore((s) => s.portalSettings.goals);
  const average = Math.round(
    family.goals.reduce((s, g) => s + g.progress, 0) / family.goals.length,
  );
  return (
    <>
      <AppHeader eyebrow="In plain language" title={`${family.client}'s progress`}>
        <p className="mt-3 text-small text-ink-700">
          {average}% of the way to these goals on average.
        </p>
      </AppHeader>
      <div className="p-3.5">
        {goals ? (
          family.goals.map((g) => (
            <AppCard key={g.text}>
              <div className="flex items-center gap-3.5">
                <Ring percent={g.progress} size={64} stroke={6} label={`${g.progress}% of the way`}>
                  <span className="text-small font-bold">{g.progress}%</span>
                </Ring>
                <div className="min-w-0">
                  <p className="text-small font-semibold">{g.text}</p>
                  <Caption>{g.plain}</Caption>
                </div>
              </div>
            </AppCard>
          ))
        ) : (
          <AppCard>
            <p className="text-small text-ink-700">Goals aren&apos;t being shared at the moment.</p>
          </AppCard>
        )}
      </div>
    </>
  );
}

function MessagesTab() {
  const messages = useDemoStore((s) => s.portalMessages);
  const send = useDemoStore((s) => s.sendPortalMessage);
  const allowed = useDemoStore((s) => s.portalSettings.messages);
  const [draft, setDraft] = useState("");
  return (
    <>
      <AppHeader
        eyebrow={family.clinicianRole}
        title={clinicianFirst}
        aside={<Avatar name={family.clinician} size={48} />}
      />
      <ul className="flex flex-col gap-2 p-3.5">
        {messages.map((m) => {
          const mine = m.from === family.viewer;
          return (
            <li
              key={`${m.at}-${m.text}`}
              className={cn(
                "max-w-[84%] rounded-[18px] px-3.5 py-2.5 text-small",
                mine
                  ? "primary-glow self-end rounded-br-md bg-accent-fill text-on-accent"
                  : "self-start rounded-bl-md border border-border bg-surface",
              )}
            >
              {m.text}
              <span
                className={cn("mt-1 block text-[10.5px]", mine ? "opacity-80" : "text-ink-500")}
              >
                {m.at}
              </span>
            </li>
          );
        })}
      </ul>
      {allowed && (
        <form
          className="sticky bottom-0 flex gap-2 bg-canvas px-3.5 py-2"
          onSubmit={(e) => {
            e.preventDefault();
            if (!draft.trim()) return;
            send(draft.trim());
            setDraft("");
          }}
        >
          <input
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            aria-label="Message"
            placeholder="Write a message"
            className={inputClass}
          />
          <Button
            variant="primary"
            type="submit"
            aria-label="Send message"
            disabled={!draft.trim()}
          >
            <Send className="size-4" strokeWidth={1.5} aria-hidden="true" />
          </Button>
        </form>
      )}
    </>
  );
}

const documentDetail: Record<string, string> = {
  "Service agreement": `The agreement between your family and Medisense for ${family.client}'s therapy, including services and how they're funded.`,
  "Home program (October)":
    "The activities to practise at home this month. They're also on your Home screen.",
  "Progress report for plan review": `${clinicianFirst}'s report on ${family.client}'s progress for the plan review.`,
};

function MoreTab() {
  const approved = useDemoStore((s) => s.report.approved);
  const shareReports = useDemoStore((s) => s.portalSettings.reports);
  const signOut = useDemoStore((s) => s.setFamilySignedIn);
  const ops = useDemoStore((s) => s.ops);
  const setOp = useDemoStore((s) => s.setOp);
  const [openDoc, setOpenDoc] = useState<string | null>(null);
  const reminders = ops["family:reminders"] !== "off";
  const doc = family.documents.find((d) => d.name === openDoc);
  return (
    <>
      <AppHeader
        eyebrow={family.viewerRole}
        title={family.viewer}
        aside={<Avatar name={family.viewer} size={52} />}
      />
      <div className="p-3.5">
        <AppCard title="Documents">
          <ul className="divide-y divide-border">
            {family.documents.map((d) => {
              const hidden = d.gated && (!approved || !shareReports);
              return (
                <li key={d.name}>
                  <button
                    type="button"
                    disabled={hidden}
                    onClick={() => setOpenDoc(d.name)}
                    className="flex w-full cursor-pointer items-center gap-3 py-2.5 text-left disabled:cursor-default"
                  >
                    <span className="flex size-9 flex-none items-center justify-center rounded-full bg-accent-tint text-accent">
                      {hidden ? (
                        <Lock className="size-4" strokeWidth={1.5} aria-hidden="true" />
                      ) : (
                        <FileText className="size-4" strokeWidth={1.5} aria-hidden="true" />
                      )}
                    </span>
                    <span className="min-w-0 flex-1">
                      <span
                        className={cn("block text-small font-semibold", hidden && "text-ink-500")}
                      >
                        {d.name}
                      </span>
                      <Caption>
                        {hidden ? `Available once ${clinicianFirst} approves it` : d.date}
                      </Caption>
                    </span>
                  </button>
                </li>
              );
            })}
          </ul>
        </AppCard>
        <AppCard title="Your care team">
          <div className="flex items-center gap-3">
            <Avatar name={family.clinician} />
            <div>
              <p className="text-small font-semibold">{family.clinician}</p>
              <Caption>{family.clinicianRole}</Caption>
            </div>
          </div>
        </AppCard>
        <AppCard title="Settings">
          <div className="flex items-center gap-3">
            <Switch
              on={reminders}
              label={`Visit reminders: ${reminders ? "on" : "off"}`}
              onToggle={() => setOp("family:reminders", reminders ? "off" : "on")}
            />
            <span className="text-small font-medium">Visit reminders</span>
          </div>
        </AppCard>
        <Button className="w-full" onClick={() => signOut(false)}>
          Sign out
        </Button>
      </div>
      {doc && (
        <AppSheet title={doc.name} onClose={() => setOpenDoc(null)}>
          <Caption>{doc.date}</Caption>
          <p className="mt-2 text-small text-ink-700">{documentDetail[doc.name]}</p>
        </AppSheet>
      )}
    </>
  );
}

export function FamilyApp() {
  const signedIn = useDemoStore((s) => s.familySignedIn);
  const [tab, setTab] = useState("home");
  const [changing, setChanging] = useState(false);
  const hydrated = useSyncExternalStore(
    (notify) => useDemoStore.persist.onFinishHydration(notify),
    () => useDemoStore.persist.hasHydrated(),
    () => false,
  );

  if (!hydrated) return <div className="hero-page min-h-dvh bg-canvas" />;
  if (!signedIn) return <SignIn />;

  return (
    <PhoneFrame
      name="Family app"
      description="A calm place for families to follow their child's therapy, in plain language."
      features={[
        "Confirm visits or ask to change them",
        "Tick off practice at home",
        "See progress towards goals",
        "Message the therapist and open approved documents",
      ]}
      tabs={tabs}
      active={tab}
      onTab={setTab}
      overlay={changing ? <ChangePanel onClose={() => setChanging(false)} /> : undefined}
    >
      {tab === "home" && <HomeTab onChange={() => setChanging(true)} onTab={setTab} />}
      {tab === "visits" && <VisitsTab onChange={() => setChanging(true)} />}
      {tab === "progress" && <ProgressTab />}
      {tab === "messages" && <MessagesTab />}
      {tab === "more" && <MoreTab />}
    </PhoneFrame>
  );
}
