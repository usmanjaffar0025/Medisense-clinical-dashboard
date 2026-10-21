import { ArrowRight, ChevronRight, UserCheck } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { Fragment } from "react";
import { PenNib } from "@/components/ai/provenance";
import { Button } from "@/components/ui/button";
import { Caption, Card } from "@/components/ui/card";
import { PageContainer, PageHeader } from "@/components/ui/page";
import { hannahDay, type Appointment } from "@/data/my-day";
import { organisation } from "@/data/organisation";
import { WaitingForYou } from "@/features/my-day/waiting-for-you";
import { cn } from "@/lib/cn";

export const metadata: Metadata = { title: "My Day · Medisense" };

const shortcutClass =
  "flex w-full items-center gap-3 border-t border-border px-5 py-3.5 text-body font-medium text-ink-900 transition-colors duration-160 ease-out hover:bg-canvas hover:text-ink-900 hover:no-underline";

const rowState: Record<Appointment["state"], string> = {
  past: "text-ink-500",
  current: "bg-accent-tint shadow-rule-accent",
  next: "shadow-rule-accent",
  upcoming: "",
};

function AppointmentRow({ appointment: a }: { appointment: Appointment }) {
  return (
    <div
      className={cn(
        "grid grid-cols-[96px_minmax(0,1fr)_auto] items-center gap-4 border-t border-border px-5 py-4",
        rowState[a.state],
      )}
    >
      <span
        className={cn(
          "headline text-h2 leading-6 font-normal",
          a.state === "past" && "text-ink-400",
          a.state === "current" && "text-accent",
        )}
      >
        {a.time}
      </span>
      <div>
        <div className="font-semibold text-ink-900">{a.client}</div>
        <div className={cn("text-small", a.state === "past" ? "text-ink-500" : "text-ink-700")}>
          {a.detail}
        </div>
      </div>
      {a.note?.href ? (
        <Link href={a.note.href} className="text-small font-semibold">
          {a.note.label}
        </Link>
      ) : a.note ? (
        <Caption className={cn(a.state === "current" && "font-semibold text-accent")}>
          {a.note.label}
        </Caption>
      ) : (
        <span />
      )}
    </div>
  );
}

export default function MyDayPage() {
  return (
    <>
      <div className="flex flex-wrap items-center justify-center gap-3 border-b border-border bg-surface-sunken px-10 py-2 text-small">
        <span className="text-ink-700">
          Viewing as Clinician · <b className="font-semibold text-ink-900">{hannahDay.name}</b> ·
          own caseload only
        </span>
        <Link href="/" className="font-semibold">
          Return to Leadership view
        </Link>
      </div>

      <PageContainer>
        <PageHeader
          display
          eyebrow={organisation.today}
          title={`Good morning, ${hannahDay.firstName}.`}
          description={hannahDay.summary}
        />

        <section aria-label="Today at a glance">
          <div className="grid grid-cols-2 gap-px overflow-hidden rounded-t-card border border-border bg-border lg:grid-cols-4">
            {hannahDay.tiles.map((t) => (
              <div key={t.label} className="flex flex-col gap-2.5 bg-surface px-6 py-5">
                <div className="eyebrow">{t.label}</div>
                <div className="headline text-kpi font-normal">{t.value}</div>
                <Caption>{t.caption}</Caption>
              </div>
            ))}
          </div>
          <div className="flex flex-wrap items-center justify-between gap-3 rounded-b-card border border-t-0 border-border bg-surface-sunken px-6 py-3">
            <span className="flex items-center gap-2 text-small">
              <UserCheck className="size-4 text-ink-500" strokeWidth={1.5} aria-hidden="true" />
              <b className="font-semibold">Supervision Thursday</b> · {hannahDay.supervision}
            </span>
            <Button variant="ghost" size="sm">
              Prepare my supervision
              <ArrowRight className="size-4" strokeWidth={1.5} aria-hidden="true" />
            </Button>
          </div>
        </section>

        <div className="mt-8 grid items-start gap-6 lg:grid-cols-12">
          <Card aria-labelledby="today" className="overflow-hidden lg:col-span-7">
            <div className="flex items-end justify-between gap-3 px-5 pt-4.5 pb-3.5">
              <h2 id="today" className="headline text-h2">
                Today
              </h2>
              <Caption>{hannahDay.scheduleNote}</Caption>
            </div>
            {hannahDay.appointments.map((a) => (
              <Fragment key={a.time}>
                <AppointmentRow appointment={a} />
                {a.state === "current" && (
                  <div className="relative h-0" aria-label={hannahDay.nowLabel}>
                    <span className="absolute -top-2.5 left-5 z-1 h-5 rounded-tag bg-accent px-2 text-eyebrow leading-5 font-semibold text-white">
                      {hannahDay.nowLabel}
                    </span>
                    <span className="absolute top-0 right-5 left-5 border-t border-accent" />
                  </div>
                )}
              </Fragment>
            ))}
          </Card>

          <div className="flex flex-col gap-6 lg:col-span-5">
            <Card aria-labelledby="assistant" className="overflow-hidden">
              <div className="px-5 pt-4.5 pb-3">
                <h2 id="assistant" className="headline text-h2">
                  AI Assistant
                </h2>
                <Caption className="mt-1">Drafts always need your approval.</Caption>
              </div>
              {hannahDay.shortcuts.map((s) => {
                const content = (
                  <>
                    <PenNib className="text-brass" />
                    <span className="flex-1">{s.label}</span>
                    <ChevronRight
                      className="size-4 text-ink-500"
                      strokeWidth={1.5}
                      aria-hidden="true"
                    />
                  </>
                );
                return s.href ? (
                  <Link key={s.label} href={s.href} className={shortcutClass}>
                    {content}
                  </Link>
                ) : (
                  <button
                    key={s.label}
                    type="button"
                    className={cn(shortcutClass, "cursor-pointer text-left")}
                  >
                    {content}
                  </button>
                );
              })}
            </Card>

            <WaitingForYou />
          </div>
        </div>
      </PageContainer>
    </>
  );
}
