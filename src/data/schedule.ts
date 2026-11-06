import { sarahClients } from "./caseload";
import { clinicians } from "./clinicians";
import { hannahDay } from "./my-day";
import type { Clinician, Site } from "./types";
import { seedFrom } from "./weeks";
import { dayLabel, wd } from "@/lib/clock";

export type AppointmentType = "Home visit" | "Telehealth" | "Supervision" | "Team meeting";

export type ScheduleItem = {
  id: string;
  clinicianId: string;
  day: number;
  /** Minutes after midnight. */
  start: number;
  duration: number;
  type: AppointmentType;
  title: string;
  suburb?: string;
  /** Driving minutes before this visit. */
  travel: number;
  status: "completed" | "booked" | "cancelled";
  fromSuggestion?: boolean;
};

/** Yesterday through three days ahead, so "today" is always the second column. */
export const scheduleDays = [-1, 0, 1, 2, 3].map((offset, id) => {
  const label = dayLabel(offset);
  return { id, label, short: label.split(" ")[0] ?? "" };
});

export const TODAY = 1;
/** "Now" on the demo day: 10:15 am. */
export const NOW = 615;
export const DAY_START = 480;
export const DAY_END = 1050;

export const suburbs: Record<Site, string[]> = {
  "Brisbane North": [
    "Kedron",
    "Chermside",
    "Aspley",
    "Nundah",
    "Stafford",
    "Everton Park",
    "Albany Creek",
    "Wavell Heights",
    "Geebung",
    "Bracken Ridge",
  ],
  "Brisbane South": [
    "Carindale",
    "Sunnybank",
    "Mt Gravatt",
    "Holland Park",
    "Coorparoo",
    "Annerley",
    "Moorooka",
    "Wishart",
    "Eight Mile Plains",
    "Camp Hill",
  ],
};

/** Names used only in generated visits; none of them is a client elsewhere in the demo. */
const clientPool = [
  "Ivy Chen",
  "Mason Clarke",
  "Evie Turner",
  "Jacob Hughes",
  "Olive Bennett",
  "Ted Lawson",
  "Grace Kelly",
  "Hugo Marsh",
  "Lily Watson",
  "Max Fraser",
  "Rosa Diaz",
  "Arlo Byrne",
  "Noor Haddid",
  "Felix Wood",
  "Maya Singh",
  "Theo Grant",
  "Ella Brooks",
  "Jonah Reid",
  "Zoe Hartley",
  "Leon Vu",
];

/** Session start times; the lunch gap holds Wednesday's team meeting. */
const SLOTS = [510, 600, 690, 840, 930];

function workDays(fte: number) {
  if (fte >= 1) return [0, 1, 2, 3, 4];
  if (fte >= 0.8) return [0, 1, 2, 3];
  if (fte >= 0.6) return [0, 1, 3];
  if (fte >= 0.5) return [1, 3];
  return [0, 2];
}

function statusAt(day: number, start: number): ScheduleItem["status"] {
  if (day < TODAY || (day === TODAY && start + 45 <= NOW)) return "completed";
  return "booked";
}

function clinicianWeek(c: Clinician): ScheduleItem[] {
  const seed = seedFrom(c.id);
  const sessionLength = c.discipline === "Speech Pathology" ? 45 : 60;
  const busy = c.status !== "healthy";
  const names = c.id === "sarah-thompson" ? sarahClients.map((s) => s.name) : clientPool;
  const places = suburbs[c.site];
  const items: ScheduleItem[] = [];
  let n = seed;

  for (const day of workDays(c.fte)) {
    const dropped = busy ? -1 : (seed + day) % SLOTS.length;
    SLOTS.forEach((start, slot) => {
      if (slot === dropped) return;
      n += 7;
      const telehealth = n % 5 === 0;
      const cancelled = n % 17 === 0;
      items.push({
        id: `${c.id}-${day}-${slot}`,
        clinicianId: c.id,
        day,
        start,
        duration: sessionLength,
        type: telehealth ? "Telehealth" : "Home visit",
        title: names[n % names.length] ?? "Client",
        suburb: telehealth ? undefined : places[n % places.length],
        travel: telehealth ? 0 : 14 + (n % 4) * 6,
        status: cancelled ? "cancelled" : statusAt(day, start),
      });
    });
    if (day === 2) {
      items.push({
        id: `${c.id}-${day}-team`,
        clinicianId: c.id,
        day,
        start: 765,
        duration: 45,
        type: "Team meeting",
        title: "Team meeting · video call",
        travel: 0,
        status: statusAt(day, 765),
      });
    }
  }
  return items;
}

const hannahSuburbs = ["Kedron", "Chermside", "Aspley", "Nundah"];

/** Hannah's Tuesday matches My Day exactly. */
const hannahTuesday: ScheduleItem[] = hannahDay.appointments.map((a, i) => {
  const telehealth = a.detail.includes("Telehealth");
  const start = SLOTS[i] ?? 510;
  return {
    id: `hannah-wright-1-${i}`,
    clinicianId: "hannah-wright",
    day: 1,
    start,
    duration: 60,
    type: telehealth ? "Telehealth" : "Home visit",
    title: a.client,
    suburb: telehealth ? undefined : hannahSuburbs[i],
    travel: telehealth ? 0 : 18,
    status: statusAt(1, start),
  };
});

/** Fixed events the demo story relies on. */
const overrides: Record<string, Partial<ScheduleItem>> = {
  "sarah-thompson-3-0": { title: "Henry Ng", suburb: "Wavell Heights", status: "booked" },
  "sarah-thompson-3-1": {
    title: "Oliver Grant",
    status: "cancelled",
    type: "Home visit",
    suburb: "Kedron",
  },
  "sarah-thompson-3-3": {
    title: "Supervision with Grace Liu · video call",
    type: "Supervision",
    suburb: undefined,
    travel: 0,
    status: "booked",
  },
  "sarah-thompson-4-4": {
    title: "Zara Ahmed",
    status: "cancelled",
    type: "Telehealth",
    suburb: undefined,
    travel: 0,
  },
  "jessica-nguyen-2-4": { title: "Sophie Williams", status: "cancelled" },
};

export const baseSchedule: ScheduleItem[] = clinicians
  .flatMap(clinicianWeek)
  .filter(
    (item) =>
      !(item.clinicianId === "hannah-wright" && item.day === 1 && item.type !== "Team meeting"),
  )
  .concat(hannahTuesday)
  .map((item) => ({ ...item, ...overrides[item.id] }));

export type ScheduleSuggestion = {
  id: string;
  title: string;
  detail: string;
  benefit: string;
  clinicianId: string;
  day: number;
  /** The open (cancelled) slot this suggestion fills, or the day whose route it reorders. */
  slotId?: string;
  booking?: Pick<ScheduleItem, "title" | "type" | "suburb" | "travel">;
  /** Driving minutes saved across the day when the suggestion only reorders the route. */
  travelSaved?: number;
  /** A task the suggestion resolves. */
  taskId?: string;
};

export const scheduleSuggestions: ScheduleSuggestion[] = [
  {
    id: "rebook-james",
    title: `Book James Thompson into Sarah's open ${wd("Thu")} 10:00 slot`,
    detail: `No visit for 21 days. Oliver Grant cancelled ${wd("Thursday")} 10:00; Sarah's 8:30 visit is in Wavell Heights, 8 minutes from James in Nundah.`,
    benefit: "Closes a 4-day overdue rebook task · 8 min drive",
    clinicianId: "sarah-thompson",
    day: 3,
    slotId: "sarah-thompson-3-1",
    booking: { title: "James Thompson", type: "Home visit", suburb: "Nundah", travel: 8 },
    taskId: "t-james-rebook",
  },
  {
    id: "ruth-telehealth",
    title: `Telehealth check-in with Ruth Hallam's daughter, ${wd("Fri")} 3:30 pm`,
    detail:
      "Appointments are paused while the family decides on living arrangements. The approved note asks for a call within two weeks; Zara Ahmed's telehealth slot is free.",
    benefit: "Keeps a paused client from slipping · no travel",
    clinicianId: "sarah-thompson",
    day: 4,
    slotId: "sarah-thompson-4-4",
    booking: { title: "Ruth Hallam · call with Karen", type: "Telehealth", travel: 0 },
  },
  {
    id: "kai-review",
    title: `Use Jessica's open ${wd("Wed")} 3:30 pm slot for Kai Robertson`,
    detail:
      "NDIS plan review in 12 days and documents still outstanding. Sophie Williams cancelled; Kai lives in Stafford, on Jessica's afternoon route.",
    benefit: "Collect plan review documents before the deadline",
    clinicianId: "jessica-nguyen",
    day: 2,
    slotId: "jessica-nguyen-2-4",
    booking: { title: "Kai Robertson", type: "Home visit", suburb: "Stafford", travel: 12 },
    taskId: "t-kai-plan-review",
  },
  {
    id: "marcus-route",
    title: `Reorder Marcus Bell's ${wd("Thursday")} visits`,
    detail:
      "Visiting Carindale and Camp Hill back to back, then Holland Park, avoids crossing the M1 twice.",
    benefit: "Saves ≈38 min of driving",
    clinicianId: "marcus-bell",
    day: 3,
    travelSaved: 38,
  },
];

/** The week with any accepted suggestions applied. */
export function scheduleWith(accepted: string[]): ScheduleItem[] {
  const applied = scheduleSuggestions.filter((s) => accepted.includes(s.id));
  return baseSchedule.map((item) => {
    const fill = applied.find((s) => s.slotId === item.id);
    if (fill?.booking) {
      return { ...item, ...fill.booking, status: "booked", fromSuggestion: true };
    }
    const route = applied.find(
      (s) => s.travelSaved && s.clinicianId === item.clinicianId && s.day === item.day,
    );
    if (route?.travelSaved && item.travel > 0) {
      const visits = baseSchedule.filter(
        (i) => i.clinicianId === item.clinicianId && i.day === item.day && i.travel > 0,
      ).length;
      return { ...item, travel: Math.max(item.travel - Math.round(route.travelSaved / visits), 4) };
    }
    return item;
  });
}

export function formatTime(minutes: number) {
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  const suffix = h >= 12 ? "pm" : "am";
  const hour = h > 12 ? h - 12 : h;
  return `${hour}:${String(m).padStart(2, "0")} ${suffix}`;
}
