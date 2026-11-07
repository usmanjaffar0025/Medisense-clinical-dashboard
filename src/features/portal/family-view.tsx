"use client";

import { CalendarDays, Check, FileText, Lock, MessageCircle, Send } from "lucide-react";
import { useState, type ReactNode } from "react";
import { Button } from "@/components/ui/button";
import { Caption } from "@/components/ui/card";
import { portalFamily } from "@/data/portal";
import { formatTime, scheduleDays } from "@/data/schedule";
import { cn } from "@/lib/cn";
import { useDemoStore } from "@/state/demo-store";

function PortalSection({
  title,
  icon: Icon,
  children,
}: {
  title: string;
  icon: typeof CalendarDays;
  children: ReactNode;
}) {
  return (
    <section className="rounded-card border border-border bg-surface px-5 py-4 surface-lift">
      <h3 className="mb-3 flex items-center gap-2 font-serif text-section font-medium">
        <Icon className="size-4 text-accent" strokeWidth={1.5} aria-hidden="true" />
        {title}
      </h3>
      {children}
    </section>
  );
}

/** What the family sees, in the clinic's preview and after they sign in to the portal. */
export function FamilyView() {
  const settings = useDemoStore((s) => s.portalSettings);
  const messages = useDemoStore((s) => s.portalMessages);
  const sendMessage = useDemoStore((s) => s.sendPortalMessage);
  const appointment = useDemoStore((s) => s.portalAppointment);
  const respond = useDemoStore((s) => s.respondToAppointment);
  const reportApproved = useDemoStore((s) => s.report.approved);
  const done = useDemoStore((s) => s.portalHomeDone);
  const toggleHome = useDemoStore((s) => s.togglePortalHome);
  const bookings = useDemoStore((s) => s.bookings);
  const changes = useDemoStore((s) => s.visitChanges);
  const [draft, setDraft] = useState("");
  const family = portalFamily;
  const fullName = "Emily Carter";
  const booked = bookings
    .filter((b) => b.title === fullName && !changes[b.id])
    .map((b) => ({
      when: `${scheduleDays[b.day]?.label ?? ""}, ${formatTime(b.start)}`,
      what: b.suburb ? `${b.type} · ${b.suburb}` : b.type,
    }));

  return (
    <div className="flex flex-col gap-4 px-6 py-6">
      <div className="page-hero">
        <p className="eyebrow">Medisense family portal</p>
        <h2 className="mt-1 headline text-h1">Hi {family.viewer.split(" ")[0]},</h2>
        <p className="mt-1 text-small text-ink-700">
          Here is how {family.client} is going with {family.clinician},{" "}
          {family.clinicianRole.toLowerCase()}.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <PortalSection title="Next visit" icon={CalendarDays}>
          <div className="headline text-h2 font-normal">{family.nextAppointment.when}</div>
          <Caption>
            {family.nextAppointment.where} · with {family.nextAppointment.with}
          </Caption>
          <div className="mt-3 flex flex-wrap gap-2">
            {appointment === "pending" ? (
              <>
                <Button size="sm" variant="primary" onClick={() => respond("confirmed")}>
                  Confirm
                </Button>
                {settings.rebook && (
                  <Button size="sm" onClick={() => respond("change-requested")}>
                    Request a change
                  </Button>
                )}
              </>
            ) : (
              <span className="inline-flex items-center gap-1 text-small font-semibold text-healthy">
                <Check className="size-3.5" strokeWidth={2} aria-hidden="true" />
                {appointment === "confirmed"
                  ? "Confirmed. See you then!"
                  : "Request sent. We'll be in touch."}
              </span>
            )}
          </div>
          <ul className="mt-3 flex flex-col border-t border-border pt-2">
            {[...booked, ...family.upcoming.slice(1)].map((u) => (
              <li key={u.when} className="py-1 text-small">
                <b className="font-semibold">{u.when}</b>
                <span className="text-ink-700"> · {u.what}</span>
              </li>
            ))}
          </ul>
        </PortalSection>

        {settings.program && (
          <PortalSection title="Practice at home" icon={Check}>
            <ul className="flex flex-col gap-1.5">
              {family.homeProgram.map((h) => {
                const ticked = done.includes(h.id);
                return (
                  <li key={h.id}>
                    <label className="flex cursor-pointer items-start gap-2.5">
                      <input
                        type="checkbox"
                        checked={ticked}
                        onChange={() => toggleHome(h.id)}
                        className="mt-0.5 size-4 accent-[var(--color-accent-fill)]"
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
          </PortalSection>
        )}
      </div>

      {settings.goals && (
        <PortalSection title={`${family.client}'s goals`} icon={FileText}>
          <ul className="grid gap-4 md:grid-cols-3">
            {family.goals.map((g) => (
              <li key={g.text} className="flex flex-col gap-1.5">
                <span className="text-small font-semibold">{g.text}</span>
                <div className="relative h-2 rounded-full bg-surface-sunken">
                  <span
                    className="absolute inset-y-0 left-0 rounded-full bg-accent-fill"
                    style={{ width: `${g.progress}%` }}
                  />
                </div>
                <Caption>{g.plain}</Caption>
              </li>
            ))}
          </ul>
        </PortalSection>
      )}

      <div className="grid gap-4 md:grid-cols-2">
        <PortalSection title="Documents" icon={FileText}>
          <ul className="flex flex-col">
            {family.documents.map((d) => {
              const hidden = d.gated && (!reportApproved || !settings.reports);
              return (
                <li
                  key={d.name}
                  className="flex items-center justify-between gap-3 border-b border-border py-2 last:border-b-0"
                >
                  <span>
                    <span
                      className={cn("block text-small font-semibold", hidden && "text-ink-500")}
                    >
                      {d.name}
                    </span>
                    <Caption>
                      {hidden
                        ? `Available once ${family.clinician.split(" ")[0]} approves it`
                        : d.date}
                    </Caption>
                  </span>
                  {hidden ? (
                    <Lock className="size-4 text-ink-400" strokeWidth={1.5} aria-hidden="true" />
                  ) : (
                    <span className="text-small font-semibold text-accent">View</span>
                  )}
                </li>
              );
            })}
          </ul>
        </PortalSection>

        {settings.messages && (
          <PortalSection
            title={`Messages with ${family.clinician.split(" ")[0]}`}
            icon={MessageCircle}
          >
            <ul className="flex max-h-64 flex-col gap-2 overflow-y-auto">
              {messages.map((m) => {
                const mine = m.from === family.viewer;
                return (
                  <li
                    key={`${m.at}-${m.text}`}
                    className={cn(
                      "max-w-[85%] rounded-control px-3 py-2 text-small",
                      mine ? "self-end bg-accent-tint" : "self-start bg-surface-sunken",
                    )}
                  >
                    {m.text}
                    <span className="mt-0.5 block text-eyebrow text-ink-500">
                      {m.from.split(" ")[0]} · {m.at}
                    </span>
                  </li>
                );
              })}
            </ul>
            <form
              className="mt-3 flex gap-2"
              onSubmit={(e) => {
                e.preventDefault();
                if (!draft.trim()) return;
                sendMessage(draft.trim());
                setDraft("");
              }}
            >
              <input
                value={draft}
                onChange={(e) => setDraft(e.target.value)}
                placeholder="Write a message"
                aria-label="Message"
                className="h-8 min-w-0 flex-1 rounded-control border border-border-strong bg-surface-raised px-2.5 text-small outline-none focus:border-accent"
              />
              <Button size="sm" variant="primary" type="submit" disabled={!draft.trim()}>
                <Send className="size-3.5" strokeWidth={1.5} aria-hidden="true" />
                Send
              </Button>
            </form>
          </PortalSection>
        )}
      </div>
    </div>
  );
}
