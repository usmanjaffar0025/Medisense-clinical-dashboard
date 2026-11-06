import { attentionClients } from "./attention";
import { sarahClients } from "./caseload";
import { clientProfiles } from "./client-profiles";
import { clinicians } from "./clinicians";
import type { Funding, Priority, Site } from "./types";
import { seedFrom } from "./weeks";
import { mo } from "@/lib/clock";

export type DirectoryClient = {
  id: string;
  name: string;
  age: number | null;
  funding: Funding;
  clinician: string;
  region: Site;
  service: string;
  state: "Active" | "Paused" | "New";
  /** Days until the funding plan review; a negative number means it has passed. */
  planReviewDays: number;
  priority: Priority | null;
  hasProfile: boolean;
};

const profileIds = new Set(clientProfiles.map((p) => p.id));
const regionOf = (name: string): Site =>
  clinicians.find((c) => c.name === name)?.site ?? "Brisbane North";

/** Plan reviews spread over the next six months, fixed per client so the table never reshuffles. */
function reviewDays(id: string) {
  return (seedFrom(id) % 170) + 6;
}

const fromCaseload: DirectoryClient[] = sarahClients.map((c) => ({
  id: c.id,
  name: c.name,
  age: c.age,
  funding: c.funding,
  clinician: "Sarah Thompson",
  region: "Brisbane North",
  service: c.service,
  state: c.nextAppointment.kind === "paused" ? "Paused" : c.tenureMonths < 2 ? "New" : "Active",
  planReviewDays: reviewDays(c.id),
  priority: c.attention.kind === "requires-review" ? c.attention.priority : null,
  hasProfile: profileIds.has(c.id),
}));

const known = new Set(fromCaseload.map((c) => c.id));

const fromAttention: DirectoryClient[] = attentionClients
  .filter((c) => !known.has(c.id))
  .map((c) => ({
    id: c.id,
    name: c.name,
    age: null,
    funding: c.funding,
    clinician: c.clinician,
    region: regionOf(c.clinician),
    service: c.funding === "NDIS" ? "Therapy supports" : "Aged care allied health",
    state: "Active",
    planReviewDays: c.reasonTypes.includes("review") ? 12 : reviewDays(c.id),
    priority: c.priority,
    hasProfile: profileIds.has(c.id),
  }));

const others: DirectoryClient[] = [
  ["emily-carter", "Emily Carter", 8, "NDIS", "Hannah Wright", "Paediatric OT", "Active", 17],
  ["leo-banks", "Leo Banks", 41, "NDIS", "Hannah Wright", "Upper-limb function", "Active", 63],
  ["poppy-shaw", "Poppy Shaw", 4, "NDIS", "Hannah Wright", "Early childhood OT", "Active", 88],
  [
    "george-adams",
    "George Adams",
    82,
    "Aged care",
    "Hannah Wright",
    "Falls prevention",
    "Active",
    41,
  ],
  ["nina-fischer", "Nina Fischer", 29, "NDIS", "Hannah Wright", "Community access", "Active", 120],
  [
    "leila-haddad",
    "Leila Haddad",
    6,
    "NDIS",
    "Emma Clarke",
    "OT & Speech · early childhood",
    "New",
    158,
  ],
  ["doris-kemp", "Doris Kemp", 81, "Aged care", "Ben Holloway", "Home safety", "New", 140],
  ["oscar-lin", "Oscar Lin", 5, "NDIS", "Priya Raman", "Speech · early language", "New", 172],
  ["harper-quinn", "Harper Quinn", 6, "NDIS", "Marcus Bell", "Speech · articulation", "Active", 34],
  ["eli-morgan", "Eli Morgan", 12, "NDIS", "Liam Patel", "Speech · stuttering", "Active", 76],
  [
    "margaret-ellis",
    "Margaret Ellis",
    76,
    "Aged care",
    "Tom Fitzgerald",
    "Swallowing review",
    "Active",
    22,
  ],
  [
    "frank-delaney",
    "Frank Delaney",
    84,
    "Aged care",
    "Aisha Karim",
    "Communication after stroke",
    "Active",
    49,
  ],
  [
    "chloe-nash",
    "Chloe Nash",
    15,
    "NDIS",
    "Daniel Okafor",
    "Driving & community access",
    "Active",
    97,
  ],
].map(([id, name, age, funding, clinician, service, state, days]) => ({
  id: id as string,
  name: name as string,
  age: age as number,
  funding: funding as Funding,
  clinician: clinician as string,
  region: regionOf(clinician as string),
  service: service as string,
  state: state as DirectoryClient["state"],
  planReviewDays: days as number,
  priority: null,
  hasProfile: profileIds.has(id as string),
}));

export const directoryClients: DirectoryClient[] = [
  ...fromCaseload,
  ...fromAttention,
  ...others,
].filter((c, i, all) => all.findIndex((x) => x.id === c.id) === i);

/** Org totals the directory is a sample of; matches the overview KPIs. */
export const clientTotals = { all: 184, ndis: 128, agedCare: 56 };

/** Monthly plan reviews across all 184 clients, next six months. */
export const planReviewsByMonth = [
  { month: mo("Nov"), ndis: 14, agedCare: 5 },
  { month: mo("Dec"), ndis: 11, agedCare: 4 },
  { month: mo("Jan"), ndis: 9, agedCare: 6 },
  { month: mo("Feb"), ndis: 12, agedCare: 3 },
  { month: mo("Mar"), ndis: 10, agedCare: 5 },
  { month: mo("Apr"), ndis: 8, agedCare: 4 },
];

/** Active clients by region and funding across the whole organisation. */
export const clientsByRegion = [
  { region: "Brisbane North", ndis: 74, agedCare: 31 },
  { region: "Brisbane South", ndis: 54, agedCare: 25 },
];
