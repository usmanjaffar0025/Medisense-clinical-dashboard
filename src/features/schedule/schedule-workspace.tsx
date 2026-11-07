"use client";

import { CalendarPlus, Car, Check, Video } from "lucide-react";
import { useState, type CSSProperties } from "react";
import { DraftLabel, PenNib, draftSurface } from "@/components/ai/provenance";
import { BarList } from "@/components/charts/bar-list";
import { colour } from "@/components/charts/chart-kit";
import { StackedColumns } from "@/components/charts/stacked-columns";
import { Button } from "@/components/ui/button";
import { Caption, Card, CardTitle } from "@/components/ui/card";
import { FilterBar, FilterField, Segmented, SelectField } from "@/components/ui/segmented";
import { clinicians, sites } from "@/data/clinicians";
import {
  DAY_END,
  DAY_START,
  NOW,
  TODAY,
  formatTime,
  scheduleDays,
  liveSchedule,
  scheduleSuggestions,
  type AppointmentType,
  type ScheduleItem,
} from "@/data/schedule";
import { cn } from "@/lib/cn";
import { useDemoStore } from "@/state/demo-store";
import { BookVisitSheet } from "./book-visit";
import { VisitSheet } from "./visit-sheet";

const typeColour: Record<AppointmentType, string> = {
  "Home visit": colour.series1,
  Telehealth: colour.series3,
  Supervision: colour.series2,
  "Team meeting": colour.series4,
};

const HOURS = Array.from({ length: (DAY_END - DAY_START) / 60 + 1 }, (_, i) => DAY_START + i * 60);
const PX_PER_MIN = 1.05;

function blockStyle(item: ScheduleItem): CSSProperties {
  const c = typeColour[item.type];
  if (item.status === "cancelled") {
    return {
      background:
        "repeating-linear-gradient(135deg, var(--color-surface-sunken) 0 6px, var(--color-surface) 6px 12px)",
      borderLeft: "3px solid var(--color-border-strong)",
    };
  }
  return {
    background: `color-mix(in srgb, ${c} ${item.status === "completed" ? 9 : 16}%, var(--color-surface))`,
    borderLeft: `3px solid ${c}`,
  };
}

function Legend() {
  return (
    <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 text-caption font-medium text-ink-700">
      {(Object.keys(typeColour) as AppointmentType[]).map((t) => (
        <span key={t} className="flex items-center gap-1.5">
          <span
            aria-hidden="true"
            className="size-2.5 rounded-xs"
            style={{ backgroundColor: typeColour[t] }}
          />
          {t}
        </span>
      ))}
      <span className="flex items-center gap-1.5">
        <span
          aria-hidden="true"
          className="size-2.5 rounded-xs border border-border-strong bg-surface-sunken"
        />
        Open slot (cancelled)
      </span>
      <span className="flex items-center gap-1.5">
        <PenNib className="size-3 text-brass" />
        Booked from AI suggestion
      </span>
    </div>
  );
}

function Block({
  item,
  compact = false,
  onOpen,
}: {
  item: ScheduleItem;
  compact?: boolean;
  onOpen: (item: ScheduleItem) => void;
}) {
  const cancelled = item.status === "cancelled";
  const isVisit = item.type === "Home visit" || item.type === "Telehealth";
  const Tag = isVisit ? "button" : "div";
  return (
    <Tag
      {...(isVisit ? { type: "button" as const, onClick: () => onOpen(item) } : {})}
      title={`${formatTime(item.start)} · ${item.title}${item.suburb ? ` · ${item.suburb}` : ""}`}
      className={cn(
        "block h-full w-full overflow-hidden rounded-[6px] px-2 py-1 text-left text-caption leading-tight",
        isVisit && "cursor-pointer hover:brightness-95",
        item.fromSuggestion && "ring-2 ring-accent-fill",
      )}
      style={blockStyle(item)}
    >
      <div
        className={cn(
          "flex items-center gap-1 font-semibold text-ink-900",
          cancelled && "text-ink-500 line-through",
        )}
      >
        {item.fromSuggestion && <PenNib className="size-3 text-brass" />}
        <span className="truncate">{item.title}</span>
      </div>
      {!compact && (
        <div className="flex items-center gap-1 truncate text-ink-500">
          {formatTime(item.start)}
          {item.type === "Telehealth" && (
            <Video className="size-3" strokeWidth={1.5} aria-hidden="true" />
          )}
          {item.suburb && <span className="truncate">· {item.suburb}</span>}
          {cancelled && <span>· open</span>}
        </div>
      )}
    </Tag>
  );
}

function WeekCalendar({
  items,
  onOpen,
}: {
  items: ScheduleItem[];
  onOpen: (item: ScheduleItem) => void;
}) {
  const height = (DAY_END - DAY_START) * PX_PER_MIN;
  return (
    <div className="overflow-x-auto">
      <div className="grid min-w-200 grid-cols-[56px_repeat(5,minmax(0,1fr))]">
        <div />
        {scheduleDays.map((d) => (
          <div
            key={d.id}
            className={cn(
              "border-b border-border px-2 pb-2 text-small font-semibold",
              d.id === TODAY ? "text-accent" : "text-ink-700",
            )}
          >
            {d.label}
            {d.id === TODAY && <span className="ml-1.5 text-caption font-medium">· Today</span>}
          </div>
        ))}
        <div className="relative" style={{ height }}>
          {HOURS.map((h) => (
            <span
              key={h}
              className="absolute right-2 -translate-y-1/2 text-eyebrow text-ink-500"
              style={{ top: (h - DAY_START) * PX_PER_MIN }}
            >
              {formatTime(h).replace(":00", "")}
            </span>
          ))}
        </div>
        {scheduleDays.map((d) => {
          const dayItems = items.filter((i) => i.day === d.id);
          const travel = dayItems.reduce(
            (s, i) => s + (i.status === "cancelled" ? 0 : i.travel),
            0,
          );
          return (
            <div
              key={d.id}
              className={cn(
                "relative border-l border-border",
                d.id === TODAY && "bg-accent-tint/40",
              )}
              style={{ height }}
            >
              {HOURS.map((h) => (
                <span
                  key={h}
                  aria-hidden="true"
                  className="absolute inset-x-0 border-t border-grid"
                  style={{ top: (h - DAY_START) * PX_PER_MIN }}
                />
              ))}
              {d.id === TODAY && (
                <span
                  aria-hidden="true"
                  className="absolute inset-x-0 z-10 border-t-2 border-over"
                  style={{ top: (NOW - DAY_START) * PX_PER_MIN }}
                />
              )}
              {dayItems.map((item) => (
                <div key={item.id}>
                  {item.travel > 0 && item.status !== "cancelled" && (
                    <div
                      aria-hidden="true"
                      className="absolute right-1.5 left-1.5 flex items-center justify-center gap-1 text-eyebrow text-ink-400"
                      style={{
                        top: Math.max(item.start - item.travel - DAY_START, 0) * PX_PER_MIN,
                        height: item.travel * PX_PER_MIN,
                      }}
                    >
                      <Car className="size-3" strokeWidth={1.5} />
                      {item.travel}m
                    </div>
                  )}
                  <div
                    className="absolute right-1.5 left-1.5"
                    style={{
                      top: (item.start - DAY_START) * PX_PER_MIN,
                      height: item.duration * PX_PER_MIN - 2,
                    }}
                  >
                    <Block item={item} onOpen={onOpen} />
                  </div>
                </div>
              ))}
              {dayItems.length > 0 && (
                <span className="absolute right-1.5 bottom-1 left-1.5 text-center text-eyebrow text-ink-500">
                  {(travel / 60).toFixed(1)} h driving
                </span>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

function TeamDay({
  items,
  team,
  day,
  onOpen,
}: {
  items: ScheduleItem[];
  team: typeof clinicians;
  day: number;
  onOpen: (item: ScheduleItem) => void;
}) {
  const span = DAY_END - DAY_START;
  const pct = (m: number) => `${((m - DAY_START) / span) * 100}%`;
  return (
    <div className="overflow-x-auto">
      <div className="min-w-220">
        <div className="relative ml-40 h-6 border-b border-border">
          {HOURS.map((h) => (
            <span
              key={h}
              className="absolute -translate-x-1/2 text-eyebrow text-ink-500"
              style={{ left: pct(h) }}
            >
              {formatTime(h).replace(":00", "")}
            </span>
          ))}
        </div>
        {team.map((c) => {
          const rowItems = items.filter((i) => i.clinicianId === c.id && i.day === day);
          return (
            <div key={c.id} className="flex items-center border-b border-border">
              <div className="w-40 flex-none py-2 pr-3">
                <div className="truncate text-small font-semibold">{c.name}</div>
                <Caption>
                  {rowItems.length ? c.site.replace("Brisbane ", "") : "Not working"}
                </Caption>
              </div>
              <div className="relative h-12 flex-1">
                {HOURS.map((h) => (
                  <span
                    key={h}
                    aria-hidden="true"
                    className="absolute inset-y-0 border-l border-grid"
                    style={{ left: pct(h) }}
                  />
                ))}
                {day === TODAY && (
                  <span
                    aria-hidden="true"
                    className="absolute inset-y-0 z-10 border-l-2 border-over"
                    style={{ left: pct(NOW) }}
                  />
                )}
                {rowItems.map((item) => (
                  <div
                    key={item.id}
                    className="absolute inset-y-1.5"
                    style={{ left: pct(item.start), width: `${(item.duration / span) * 100}%` }}
                  >
                    <Block item={item} compact onOpen={onOpen} />
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export function ScheduleWorkspace() {
  const suggestions = useDemoStore((s) => s.suggestions);
  const accept = useDemoStore((s) => s.acceptSuggestion);
  const dismiss = useDemoStore((s) => s.dismissSuggestion);
  const [region, setRegion] = useState("all");
  const [view, setView] = useState<"week" | "team">("week");
  const [clinicianId, setClinicianId] = useState("sarah-thompson");
  const [day, setDay] = useState<number>(TODAY);
  const [booking, setBooking] = useState(false);
  const [openVisitId, setOpenVisitId] = useState<string | null>(null);
  const bookings = useDemoStore((s) => s.bookings);
  const visitChanges = useDemoStore((s) => s.visitChanges);

  const accepted = Object.entries(suggestions)
    .filter(([, v]) => v === "accepted")
    .map(([id]) => id);
  const team = clinicians.filter((c) => region === "all" || c.site === region);
  const teamIds = new Set(team.map((c) => c.id));
  const allItems = liveSchedule(accepted, bookings, visitChanges);
  const items = allItems.filter((i) => teamIds.has(i.clinicianId));
  const openVisit = allItems.find((i) => i.id === openVisitId);
  const sessions = items.filter((i) => i.type === "Home visit" || i.type === "Telehealth");
  const live = sessions.filter((i) => i.status !== "cancelled");
  const homeVisits = live.filter((i) => i.type === "Home visit");
  const open = sessions.filter((i) => i.status === "cancelled");
  const travelHours = items.reduce((s, i) => s + (i.status === "cancelled" ? 0 : i.travel), 0) / 60;
  const pending = scheduleSuggestions.filter((s) => !suggestions[s.id]);

  const metrics = [
    {
      label: "Sessions this week",
      value: live.length,
      caption: `${team.length} clinicians · 5 days`,
    },
    {
      label: "Home visits",
      value: `${live.length ? Math.round((homeVisits.length / live.length) * 100) : 0}%`,
      caption: `${homeVisits.length} visits · ${live.length - homeVisits.length} telehealth`,
    },
    { label: "Driving", value: `${travelHours.toFixed(0)} h`, caption: "Between home visits" },
    {
      label: "Open slots",
      value: open.length,
      caption: "From cancellations",
      over: open.length > 0,
    },
    { label: "AI suggestions", value: pending.length, caption: "Waiting for a decision" },
  ];

  const byDay = scheduleDays.map((d) => ({
    day: d.short,
    home: live.filter((i) => i.day === d.id && i.type === "Home visit").length,
    telehealth: live.filter((i) => i.day === d.id && i.type === "Telehealth").length,
    open: open.filter((i) => i.day === d.id).length,
  }));

  const travelByClinician = team
    .map((c) => ({
      id: c.id,
      label: c.name,
      value:
        Math.round(
          (items
            .filter((i) => i.clinicianId === c.id && i.status !== "cancelled")
            .reduce((s, i) => s + i.travel, 0) /
            60) *
            10,
        ) / 10,
      colour: colour.series3,
    }))
    .sort((a, b) => b.value - a.value);

  const load = team.map((c) => ({
    clinician: c,
    days: scheduleDays.map(
      (d) =>
        items
          .filter((i) => i.clinicianId === c.id && i.day === d.id && i.status !== "cancelled")
          .reduce((s, i) => s + i.duration + i.travel, 0) / 60,
    ),
  }));

  const selected = clinicians.find((c) => c.id === clinicianId);
  const weekItems = items.filter((i) => i.clinicianId === clinicianId);

  return (
    <>
      <FilterBar
        aside={`${scheduleDays[0]?.label} to ${scheduleDays[4]?.label} · now ${scheduleDays[TODAY]?.short} 10:15 am`}
      >
        <SelectField label="Region" value={region} onChange={setRegion}>
          <option value="all">All regions</option>
          {sites.map((s) => (
            <option key={s}>{s}</option>
          ))}
        </SelectField>
        <Button size="sm" variant="primary" onClick={() => setBooking(true)}>
          <CalendarPlus className="size-3.5" strokeWidth={1.5} aria-hidden="true" />
          Book visit
        </Button>
      </FilterBar>

      <section
        aria-label="Schedule summary"
        className="stat-band grid grid-cols-2 gap-px overflow-hidden rounded-card border border-border bg-border lg:grid-cols-5"
      >
        {metrics.map((m) => (
          <div key={m.label} className="flex flex-col gap-1.5 bg-surface px-5 py-4">
            <span className="eyebrow">{m.label}</span>
            <span className={cn("headline text-stat font-normal", m.over && "text-over")}>
              {m.value}
            </span>
            <Caption>{m.caption}</Caption>
          </div>
        ))}
      </section>

      <div className="mt-6 grid items-stretch gap-6 lg:grid-cols-12">
        <div className={cn(draftSurface(false), "flex flex-col gap-3 px-5 py-5 lg:col-span-5")}>
          <DraftLabel meta="From cancellations, follow-ups and routes">
            AI schedule suggestions — a person decides
          </DraftLabel>
          <ul className="flex flex-col gap-2.5">
            {scheduleSuggestions.map((s) => {
              const state = suggestions[s.id];
              return (
                <li
                  key={s.id}
                  className={cn(
                    "rounded-control border border-border bg-surface-raised px-3.5 py-3",
                    state === "dismissed" && "opacity-55",
                  )}
                >
                  <div className="text-small font-semibold">{s.title}</div>
                  <p className="mt-0.5 text-caption text-ink-700">{s.detail}</p>
                  <div className="mt-2 flex flex-wrap items-center justify-between gap-2">
                    <span className="text-caption font-semibold text-accent">{s.benefit}</span>
                    {state === "accepted" ? (
                      <span className="inline-flex items-center gap-1 text-small font-semibold text-healthy">
                        <Check className="size-3.5" strokeWidth={2} aria-hidden="true" />
                        {s.travelSaved ? "Route updated" : "Booked"}
                        {s.taskId && " · task closed"}
                      </span>
                    ) : state === "dismissed" ? (
                      <span className="text-caption text-ink-500">Dismissed</span>
                    ) : (
                      <span className="flex gap-1.5">
                        <Button size="sm" variant="ghost" onClick={() => dismiss(s.id)}>
                          Dismiss
                        </Button>
                        <Button
                          size="sm"
                          variant="primary"
                          onClick={() => {
                            accept(s.id);
                            setClinicianId(s.clinicianId);
                            setView("week");
                          }}
                        >
                          Accept
                        </Button>
                      </span>
                    )}
                  </div>
                </li>
              );
            })}
          </ul>
        </div>

        <Card aria-labelledby="by-day" className="flex flex-col px-6 pt-5 pb-4 lg:col-span-4">
          <CardTitle
            id="by-day"
            title="Sessions by day"
            description="Home visits, telehealth and open slots"
          />
          <div className="mt-3 flex flex-1 flex-col">
            <StackedColumns
              label="Sessions by day"
              height="fill"
              data={byDay}
              xKey="day"
              series={[
                { key: "home", label: "Home visit", colour: typeColour["Home visit"] },
                { key: "telehealth", label: "Telehealth", colour: typeColour.Telehealth },
                { key: "open", label: "Open slot", colour: colour.stone },
              ]}
            />
          </div>
        </Card>

        <Card aria-labelledby="driving" className="flex flex-col px-6 pt-5 pb-4 lg:col-span-3">
          <CardTitle id="driving" title="Driving this week" description="Hours per clinician" />
          <div className="mt-3">
            <BarList
              label="Driving hours per clinician"
              data={travelByClinician}
              labelWidth={112}
              format={(v) => `${v} h`}
              unit="hours driving"
              selected={null}
              onSelect={(id) => {
                if (id) {
                  setClinicianId(id);
                  setView("week");
                }
              }}
            />
          </div>
        </Card>
      </div>

      <Card aria-labelledby="team-load" className="mt-6 overflow-hidden">
        <div className="px-5 pt-5 pb-3">
          <CardTitle
            id="team-load"
            title="Team load"
            description="Booked hours including driving · click a clinician to open their week"
          />
        </div>
        <div className="overflow-x-auto">
          <div className="min-w-180">
            <div className="grid grid-cols-[180px_repeat(5,minmax(0,1fr))_96px] border-y border-border bg-surface-sunken px-5 py-2 eyebrow">
              <span>Clinician</span>
              {scheduleDays.map((d) => (
                <span key={d.id} className="text-center">
                  {d.short}
                </span>
              ))}
              <span className="text-right">Week</span>
            </div>
            {load.map(({ clinician: c, days }) => {
              const total = days.reduce((s, h) => s + h, 0);
              return (
                <button
                  key={c.id}
                  type="button"
                  onClick={() => {
                    setClinicianId(c.id);
                    setView("week");
                  }}
                  className={cn(
                    "grid w-full cursor-pointer grid-cols-[180px_repeat(5,minmax(0,1fr))_96px] items-center gap-1 border-b border-border px-5 py-1.5 text-left hover:bg-canvas",
                    c.id === clinicianId && view === "week" && "bg-accent-tint/50",
                  )}
                >
                  <span className="truncate text-small font-semibold">{c.name}</span>
                  {days.map((h, i) => (
                    <span
                      key={i}
                      className="mx-0.5 flex h-7 items-center justify-center rounded-[5px] text-caption font-semibold"
                      style={{
                        background: h
                          ? `color-mix(in srgb, ${h > 7.5 ? colour.over : colour.series1} ${Math.round(12 + (h / 9) * 40)}%, var(--color-surface))`
                          : "var(--color-surface-sunken)",
                        color: h ? "var(--color-ink-900)" : "var(--color-ink-400)",
                      }}
                    >
                      {h ? `${h.toFixed(1)}h` : "—"}
                    </span>
                  ))}
                  <span className="text-right text-small">{total.toFixed(1)} h</span>
                </button>
              );
            })}
          </div>
        </div>
        <Caption className="px-5 py-3">
          Red cells mean more than 7.5 hours booked, including driving.
        </Caption>
      </Card>

      <Card aria-labelledby="calendar" className="mt-6 px-5 pt-5 pb-5">
        <CardTitle
          id="calendar"
          title={
            view === "week"
              ? `${selected?.name ?? ""} · week`
              : `Team day · ${scheduleDays[day]?.label ?? ""}`
          }
          description={
            view === "week"
              ? `${selected?.role ?? ""} · ${selected?.site ?? ""}`
              : "Every clinician on one timeline"
          }
          aside={
            <div className="flex flex-wrap items-center gap-3">
              <Segmented
                label="Calendar view"
                value={view}
                onChange={setView}
                options={[
                  { id: "week", label: "Clinician week" },
                  { id: "team", label: "Team day" },
                ]}
              />
              {view === "week" ? (
                <SelectField label="Clinician" value={clinicianId} onChange={setClinicianId}>
                  {team.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
                </SelectField>
              ) : (
                <FilterField label="Day">
                  <Segmented
                    label="Day"
                    value={String(day)}
                    onChange={(v) => setDay(Number(v))}
                    options={scheduleDays.map((d) => ({ id: String(d.id), label: d.short }))}
                  />
                </FilterField>
              )}
            </div>
          }
        />
        <div className="mt-3 mb-4">
          <Legend />
        </div>
        {view === "week" ? (
          <WeekCalendar items={weekItems} onOpen={(i) => setOpenVisitId(i.id)} />
        ) : (
          <TeamDay items={items} team={team} day={day} onOpen={(i) => setOpenVisitId(i.id)} />
        )}
      </Card>
      {booking && (
        <BookVisitSheet
          onClose={() => setBooking(false)}
          onBooked={(id) => {
            setClinicianId(id);
            setView("week");
          }}
        />
      )}
      {openVisit && <VisitSheet visit={openVisit} onClose={() => setOpenVisitId(null)} />}
    </>
  );
}
