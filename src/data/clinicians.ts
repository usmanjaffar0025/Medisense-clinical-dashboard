import type {
  CaseloadStatus,
  Clinician,
  Complexity,
  ComplexityMix,
  Discipline,
  Site,
  SupervisionOutcome,
  WeeklySeries,
} from "./types";
import { ramp, seedFrom } from "./weeks";
import { dt } from "@/lib/clock";

/** Complexity weights used for every capacity calculation. */
export const complexityWeights = { high: 2.5, medium: 1.5, low: 1.0 } as const;

/** Configured capacity is set for a medium-complexity caseload. */
const CAPACITY_WEIGHT = complexityWeights.medium;

/** Free weighted units at which a clinician is tagged as having available capacity. */
const AVAILABLE_UNITS = 6;

export const scoreThresholds = { monitor: 60, atRisk: 80 };

/** Weekly admin hours target for a 1.0 FTE clinician; pro-rated by FTE. */
export const ADMIN_TARGET_PER_FTE = 7;

type ClinicianInput = {
  id: string;
  name: string;
  role?: string;
  discipline: Discipline;
  site: Site;
  fte: number;
  active: number;
  capacity: number;
  mix: ComplexityMix;
  notesOverdue: number;
  draftsAwaiting: number;
  followUpsOverdue: number;
  ndis: number;
  nextSupervision: string;
  supervisionNote: string;
  supervisionDue: boolean;
  supervisionHistory: SupervisionOutcome[];
  score: number;
  adminHours: number;
  start: { active: number; notesDue: number; followUps: number; score: number; admin: number };
  history?: { active?: WeeklySeries; score?: WeeklySeries; adminHours?: WeeklySeries };
};

function statusFor(score: number): CaseloadStatus {
  if (score >= scoreThresholds.atRisk) return "at-risk";
  if (score >= scoreThresholds.monitor) return "monitor";
  return "healthy";
}

function complexityLabel(mix: ComplexityMix, active: number): Complexity {
  if (mix.high / active >= 0.2) return "High";
  if (mix.low / active >= 0.45) return "Low";
  return "Medium";
}

function clinician(input: ClinicianInput): Clinician {
  const { mix } = input;
  const weightedUnits =
    mix.high * complexityWeights.high +
    mix.medium * complexityWeights.medium +
    mix.low * complexityWeights.low;
  const weightedCapacity = input.capacity * CAPACITY_WEIGHT;
  const notesDue = input.notesOverdue + input.draftsAwaiting;
  const seed = seedFrom(input.id);
  const roleByDiscipline =
    input.discipline === "Occupational Therapy" ? "Occupational Therapist" : "Speech Pathologist";

  return {
    id: input.id,
    name: input.name,
    firstName: input.name.split(" ")[0] ?? input.name,
    role: input.role ?? roleByDiscipline,
    discipline: input.discipline,
    site: input.site,
    fte: input.fte,
    active: input.active,
    capacity: input.capacity,
    utilisation: Math.round((input.active / input.capacity) * 100),
    complexity: complexityLabel(mix, input.active),
    mix,
    highComplexity: mix.high,
    weightedUnits,
    weightedCapacity,
    notesOverdue: input.notesOverdue,
    draftsAwaiting: input.draftsAwaiting,
    notesDue,
    followUpsOverdue: input.followUpsOverdue,
    funding: { ndis: input.ndis, agedCare: input.active - input.ndis },
    adminHours: input.adminHours,
    adminTarget: Math.round(ADMIN_TARGET_PER_FTE * input.fte * 10) / 10,
    nextSupervision: input.nextSupervision,
    supervisionNote: input.supervisionNote,
    supervisionDue: input.supervisionDue,
    supervisionHistory: input.supervisionHistory,
    score: input.score,
    status: statusFor(input.score),
    available: weightedCapacity - weightedUnits >= AVAILABLE_UNITS,
    history: {
      active:
        input.history?.active ?? ramp(input.start.active, input.active, { smooth: true, seed }),
      notesDue: ramp(input.start.notesDue, notesDue, { seed: seed + 1 }),
      followUpsOverdue: ramp(input.start.followUps, input.followUpsOverdue, { seed: seed + 2 }),
      score: input.history?.score ?? ramp(input.start.score, input.score, { seed: seed + 3 }),
      adminHours:
        input.history?.adminHours ??
        ramp(input.start.admin, input.adminHours, { decimals: 1, seed }),
    },
  };
}

export const clinicians: Clinician[] = [
  clinician({
    id: "sarah-thompson",
    name: "Sarah Thompson",
    discipline: "Occupational Therapy",
    site: "Brisbane North",
    fte: 1.0,
    active: 27,
    capacity: 25,
    mix: { high: 6, medium: 12, low: 9 },
    notesOverdue: 4,
    draftsAwaiting: 1,
    followUpsOverdue: 3,
    ndis: 23,
    nextSupervision: dt("Thu 22 Oct"),
    supervisionNote: "In 2 days",
    supervisionDue: true,
    supervisionHistory: ["rescheduled", "cancelled", "held"],
    score: 83,
    adminHours: 9.0,
    start: { active: 20, notesDue: 1, followUps: 1, score: 61, admin: 5.8 },
    history: {
      active: [20, 20, 21, 21, 22, 22, 23, 24, 24, 25, 26, 27],
      score: [61, 62, 64, 65, 67, 69, 71, 73, 75, 78, 81, 83],
      adminHours: [5.8, 6.0, 6.1, 6.3, 6.2, 6.4, 6.5, 7.0, 6.8, 8.2, 8.7, 9.0],
    },
  }),
  clinician({
    id: "jessica-nguyen",
    name: "Jessica Nguyen",
    discipline: "Occupational Therapy",
    site: "Brisbane North",
    fte: 1.0,
    active: 24,
    capacity: 24,
    mix: { high: 5, medium: 11, low: 8 },
    notesOverdue: 3,
    draftsAwaiting: 1,
    followUpsOverdue: 2,
    ndis: 18,
    nextSupervision: dt("Mon 26 Oct"),
    supervisionNote: "In 6 days",
    supervisionDue: true,
    supervisionHistory: ["held", "rescheduled", "held"],
    score: 72,
    adminHours: 8.5,
    start: { active: 21, notesDue: 1, followUps: 1, score: 60, admin: 6.6 },
  }),
  clinician({
    id: "marcus-bell",
    name: "Marcus Bell",
    discipline: "Speech Pathology",
    site: "Brisbane South",
    fte: 1.0,
    active: 23,
    capacity: 24,
    mix: { high: 3, medium: 12, low: 8 },
    notesOverdue: 2,
    draftsAwaiting: 0,
    followUpsOverdue: 2,
    ndis: 17,
    nextSupervision: dt("Thu 29 Oct"),
    supervisionNote: "In 9 days",
    supervisionDue: true,
    supervisionHistory: ["held", "held", "rescheduled"],
    score: 66,
    adminHours: 8.1,
    start: { active: 21, notesDue: 1, followUps: 1, score: 55, admin: 6.9 },
  }),
  clinician({
    id: "daniel-okafor",
    name: "Daniel Okafor",
    discipline: "Occupational Therapy",
    site: "Brisbane South",
    fte: 1.0,
    active: 22,
    capacity: 25,
    mix: { high: 3, medium: 11, low: 8 },
    notesOverdue: 1,
    draftsAwaiting: 0,
    followUpsOverdue: 1,
    ndis: 14,
    nextSupervision: dt("Thu 12 Nov"),
    supervisionNote: "Scheduled",
    supervisionDue: false,
    supervisionHistory: ["held", "rescheduled", "held"],
    score: 49,
    adminHours: 7.4,
    start: { active: 21, notesDue: 1, followUps: 1, score: 46, admin: 6.8 },
  }),
  clinician({
    id: "hannah-wright",
    name: "Hannah Wright",
    discipline: "Occupational Therapy",
    site: "Brisbane North",
    fte: 0.8,
    active: 15,
    capacity: 18,
    mix: { high: 2, medium: 8, low: 5 },
    notesOverdue: 0,
    draftsAwaiting: 2,
    followUpsOverdue: 0,
    ndis: 11,
    nextSupervision: dt("Thu 22 Oct"),
    supervisionNote: "In 2 days",
    supervisionDue: true,
    supervisionHistory: ["held", "held", "rescheduled"],
    score: 44,
    adminHours: 6.2,
    start: { active: 14, notesDue: 1, followUps: 0, score: 41, admin: 5.6 },
  }),
  clinician({
    id: "priya-raman",
    name: "Priya Raman",
    discipline: "Speech Pathology",
    site: "Brisbane South",
    fte: 0.6,
    active: 12,
    capacity: 14,
    mix: { high: 2, medium: 6, low: 4 },
    notesOverdue: 1,
    draftsAwaiting: 0,
    followUpsOverdue: 1,
    ndis: 8,
    nextSupervision: dt("Thu 5 Nov"),
    supervisionNote: "Scheduled",
    supervisionDue: false,
    supervisionHistory: ["held", "cancelled", "held"],
    score: 42,
    adminHours: 4.6,
    start: { active: 11, notesDue: 0, followUps: 0, score: 40, admin: 4.0 },
  }),
  clinician({
    id: "grace-liu",
    name: "Grace Liu",
    role: "Senior OT & Clinical Supervisor",
    discipline: "Occupational Therapy",
    site: "Brisbane North",
    fte: 0.5,
    active: 10,
    capacity: 12,
    mix: { high: 3, medium: 5, low: 2 },
    notesOverdue: 0,
    draftsAwaiting: 1,
    followUpsOverdue: 0,
    ndis: 7,
    nextSupervision: dt("Wed 18 Nov"),
    supervisionNote: "External supervisor",
    supervisionDue: false,
    supervisionHistory: ["held", "held", "held"],
    score: 40,
    adminHours: 4.1,
    start: { active: 10, notesDue: 1, followUps: 0, score: 41, admin: 3.8 },
  }),
  clinician({
    id: "tom-fitzgerald",
    name: "Tom Fitzgerald",
    discipline: "Speech Pathology",
    site: "Brisbane South",
    fte: 0.5,
    active: 9,
    capacity: 11,
    mix: { high: 1, medium: 4, low: 4 },
    notesOverdue: 1,
    draftsAwaiting: 0,
    followUpsOverdue: 1,
    ndis: 5,
    nextSupervision: dt("Wed 11 Nov"),
    supervisionNote: "Scheduled",
    supervisionDue: false,
    supervisionHistory: ["held", "cancelled", "held"],
    score: 38,
    adminHours: 3.8,
    start: { active: 8, notesDue: 1, followUps: 1, score: 36, admin: 3.4 },
  }),
  clinician({
    id: "liam-patel",
    name: "Liam Patel",
    discipline: "Speech Pathology",
    site: "Brisbane North",
    fte: 0.6,
    active: 11,
    capacity: 14,
    mix: { high: 1, medium: 6, low: 4 },
    notesOverdue: 0,
    draftsAwaiting: 0,
    followUpsOverdue: 1,
    ndis: 7,
    nextSupervision: dt("Thu 19 Nov"),
    supervisionNote: "Scheduled",
    supervisionDue: false,
    supervisionHistory: ["held", "held", "rescheduled"],
    score: 36,
    adminHours: 4.3,
    start: { active: 10, notesDue: 0, followUps: 0, score: 35, admin: 4.0 },
  }),
  clinician({
    id: "ben-holloway",
    name: "Ben Holloway",
    discipline: "Occupational Therapy",
    site: "Brisbane South",
    fte: 0.6,
    active: 7,
    capacity: 9,
    mix: { high: 1, medium: 3, low: 3 },
    notesOverdue: 0,
    draftsAwaiting: 0,
    followUpsOverdue: 0,
    ndis: 3,
    nextSupervision: dt("Mon 16 Nov"),
    supervisionNote: "Scheduled",
    supervisionDue: false,
    supervisionHistory: ["held", "held", "held"],
    score: 33,
    adminHours: 4.2,
    start: { active: 7, notesDue: 0, followUps: 0, score: 30, admin: 3.9 },
  }),
  clinician({
    id: "emma-clarke",
    name: "Emma Clarke",
    discipline: "Occupational Therapy",
    site: "Brisbane North",
    fte: 1.0,
    active: 18,
    capacity: 24,
    mix: { high: 3, medium: 14, low: 1 },
    notesOverdue: 0,
    draftsAwaiting: 0,
    followUpsOverdue: 0,
    ndis: 11,
    nextSupervision: dt("Wed 4 Nov"),
    supervisionNote: "Scheduled",
    supervisionDue: false,
    supervisionHistory: ["held", "held", "held"],
    score: 31,
    adminHours: 7.0,
    start: { active: 17, notesDue: 0, followUps: 0, score: 34, admin: 7.2 },
  }),
  clinician({
    id: "aisha-karim",
    name: "Aisha Karim",
    discipline: "Speech Pathology",
    site: "Brisbane South",
    fte: 0.4,
    active: 6,
    capacity: 8,
    mix: { high: 0, medium: 3, low: 3 },
    notesOverdue: 0,
    draftsAwaiting: 0,
    followUpsOverdue: 0,
    ndis: 4,
    nextSupervision: dt("Tue 10 Nov"),
    supervisionNote: "Scheduled",
    supervisionDue: false,
    supervisionHistory: ["held", "rescheduled", "held"],
    score: 27,
    adminHours: 2.9,
    start: { active: 5, notesDue: 0, followUps: 0, score: 22, admin: 2.5 },
  }),
];

export function clinicianById(id: string) {
  return clinicians.find((c) => c.id === id);
}

export const sarah = clinicians[0] as Clinician;
export const emma = clinicianById("emma-clarke") as Clinician;

export const disciplines: Discipline[] = ["Occupational Therapy", "Speech Pathology"];
export const sites: Site[] = ["Brisbane North", "Brisbane South"];

export type ClinicianScope = { site: "all" | Site; discipline: "all" | Discipline };

export const allScope: ClinicianScope = { site: "all", discipline: "all" };

export function inScope(c: Clinician, scope: ClinicianScope) {
  return (
    (scope.site === "all" || c.site === scope.site) &&
    (scope.discipline === "all" || c.discipline === scope.discipline)
  );
}

export function statusCounts(list: Clinician[]) {
  return {
    all: list.length,
    "at-risk": list.filter((c) => c.status === "at-risk").length,
    monitor: list.filter((c) => c.status === "monitor").length,
    healthy: list.filter((c) => c.status === "healthy").length,
  };
}

/** Order used in the Team Capacity table: the four clinicians named in the proposal first. */
export const capacityTableOrder = [
  "sarah-thompson",
  "jessica-nguyen",
  "daniel-okafor",
  "emma-clarke",
  "marcus-bell",
  "hannah-wright",
  "priya-raman",
  "grace-liu",
  "liam-patel",
  "tom-fitzgerald",
  "ben-holloway",
  "aisha-karim",
];

export function formatFte(fte: number) {
  return `${fte.toFixed(1)} FTE`;
}

export function formatUnits(units: number) {
  return units.toFixed(1);
}
