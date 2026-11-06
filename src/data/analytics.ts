import { ramp } from "./weeks";

/**
 * Organisation-wide weekly measures, last 12 weeks. Counts scale with the filtered team's share
 * of active clients; rates are shown as they are.
 */
export const weeklyMeasures = {
  sessions: ramp(152, 171, { seed: 11 }),
  cancelled: ramp(16, 15, { seed: 12 }),
  ndisHours: ramp(118, 131, { seed: 13 }),
  agedCareHours: ramp(41, 47, { seed: 14 }),
  utilisation: ramp(88, 94, { seed: 15 }),
  notesOnTime: ramp(71, 64, { seed: 16 }),
  daysToFirstVisit: ramp(16, 19, { decimals: 1, seed: 17 }),
  goalsOt: ramp(64, 68, { seed: 18 }),
  goalsSpeech: ramp(70, 72, { seed: 19 }),
};

/** All 428 active goals across 184 clients, by status. */
export const goalStatusTotals = [
  { id: "Achieved", value: 62 },
  { id: "On track", value: 141 },
  { id: "Progressing", value: 187 },
  { id: "At risk", value: 38 },
] as const;

/** Share of goals on track or achieved, by service. */
export const outcomesByService = [
  { service: "Speech · paediatric", value: 74, clients: 41 },
  { service: "Paediatric OT", value: 71, clients: 58 },
  { service: "Speech · adult & swallowing", value: 69, clients: 22 },
  { service: "Adult OT · daily living", value: 64, clients: 37 },
  { service: "Home modifications & falls", value: 58, clients: 26 },
];

/** Where new clients come from, last 90 days. */
export const referralSources = [
  { source: "Support coordinators", value: 31 },
  { source: "Website form", value: 22 },
  { source: "GPs", value: 14 },
  { source: "Aged care providers", value: 11 },
  { source: "Schools & families", value: 9 },
];
