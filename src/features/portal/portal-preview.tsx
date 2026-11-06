"use client";

import { CalendarDays, Check, FileText, Lock, MessageCircle, Send } from "lucide-react";
import { useState, type ReactNode } from "react";
import { Button } from "@/components/ui/button";
import { Caption, Card, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { portalFamily, portalSettings } from "@/data/portal";
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
    <section className="rounded-card border border-border bg-surface px-5 py-4">
      <h3 className="mb-3 flex items-center gap-2 font-serif text-section font-medium">
        <Icon className="size-4 text-accent" strokeWidth={1.5} aria-hidden="true" />
        {title}
      </h3>
      {children}
    </section>
  );
}

export function PortalPreview() {
  const settings = useDemoStore((s) => s.portalSettings);
  const toggleSetting = useDemoStore((s) => s.togglePortalSetting);
  const messages = useDemoStore((s) => s.portalMessages);
  const sendMessage = useDemoStore((s) => s.sendPortalMessage);
  const appointment = useDemoStore((s) => s.portalAppointment);
  const respond = useDemoStore((s) => s.respondToAppointment);
  const reportApproved = useDemoStore((s) => s.report.approved);
  const [done, setDone] = useState<string[]>(["hp1"]);
  const [draft, setDraft] = useState("");

  const family = portalFamily;
  const sent = messages.length - family.messages.length;

  return (
    <div className="grid items-start gap-6 lg:grid-cols-12">
      <div className="flex flex-col gap-6 lg:col-span-4">
        <Card aria-labelledby="portal-controls" className="overflow-hidden">
          <div className="px-5 pt-5 pb-3">
            <CardTitle
              id="portal-controls"
              title="What families can see"
              description="Set by the clinic; changes show instantly in the preview"
            />
          </div>
          {portalSettings.map((s) => (
            <div key={s.id} className="flex items-start gap-3 border-t border-border px-5 py-3">
              <Switch
                on={settings[s.id]}
                label={`${s.label}: ${settings[s.id] ? "on" : "off"}`}
                onToggle={() => toggleSetting(s.id)}
              />
              <div>
                <div className="text-small font-semibold">{s.label}</div>
                <Caption>{s.detail}</Caption>
              </div>
            </div>
          ))}
        </Card>

        <Card aria-labelledby="portal-activity" className="px-5 py-5">
          <CardTitle id="portal-activity" title="What the clinic sees" />
          <ul className="mt-3 flex flex-col gap-2 text-small">
            <li className="flex justify-between">
              <span className="text-ink-700">Appointment</span>
              <b className="font-semibold">
                {appointment === "confirmed"
                  ? "Confirmed by family"
                  : appointment === "change-requested"
                    ? "Change requested → admin task"
                    : "Awaiting confirmation"}
              </b>
            </li>
            <li className="flex justify-between">
              <span className="text-ink-700">Home program this week</span>
              <b className="font-semibold">
                {done.length} of {family.homeProgram.length} practised
              </b>
            </li>
            <li className="flex justify-between">
              <span className="text-ink-700">New family messages</span>
              <b className="font-semibold">{sent ? `${sent} → reply task for Hannah` : "None"}</b>
            </li>
            <li className="flex justify-between">
              <span className="text-ink-700">Progress report</span>
              <b className="font-semibold">{reportApproved ? "Shared" : "Hidden until approved"}</b>
            </li>
          </ul>
          <Caption className="mt-3 border-t border-border pt-3">
            Families only ever see approved, plain-language content. AI never replies to families;
            messages become tasks for the clinician.
          </Caption>
        </Card>
      </div>

      <div className="lg:col-span-8">
        <div className="overflow-hidden rounded-sheet border border-border-strong bg-canvas shadow-overlay">
          <div className="flex items-center gap-2 border-b border-border bg-surface-sunken px-4 py-2.5">
            <span aria-hidden="true" className="flex gap-1.5">
              <i className="size-2.5 rounded-full bg-border-strong" />
              <i className="size-2.5 rounded-full bg-border-strong" />
              <i className="size-2.5 rounded-full bg-border-strong" />
            </span>
            <span className="mx-auto flex items-center gap-1.5 rounded-control bg-surface px-3 py-1 text-caption text-ink-500">
              <Lock className="size-3" strokeWidth={1.5} aria-hidden="true" />
              family.medisense.com.au
            </span>
            <span className="text-caption font-semibold text-accent">Preview</span>
          </div>

          <div className="flex flex-col gap-4 px-6 py-6">
            <div>
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
                  {family.upcoming.slice(1).map((u) => (
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
                              onChange={() =>
                                setDone((d) =>
                                  ticked ? d.filter((x) => x !== h.id) : [...d, h.id],
                                )
                              }
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
                            className={cn(
                              "block text-small font-semibold",
                              hidden && "text-ink-500",
                            )}
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
                          <Lock
                            className="size-4 text-ink-400"
                            strokeWidth={1.5}
                            aria-hidden="true"
                          />
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
        </div>
      </div>
    </div>
  );
}
