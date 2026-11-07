import { attentionClients, countByPriority } from "./attention";
import { clinicians, inScope, type ClinicianScope } from "./clinicians";
import type { Clinician, WeeklySeries } from "./types";
import { sumSeries, weeks } from "./weeks";
import { dt } from "@/lib/clock";

export const organisation = {
  name: "Medisense",
  location: "Brisbane, QLD · home visits & telehealth",
  sites: ["Brisbane North", "Brisbane South"],
  today: dt("Tuesday 20 October 2026"),
} as const;

export const product = {
  name: "Medisense",
  fullName: "Medisense Clinical Operations & Supervision Intelligence Platform",
  tagline: "Clinical Operations & Supervision",
} as const;

export const currentUser = {
  name: "Neil Hensley",
  firstName: "Neil",
  initials: "NH",
  role: "Director",
} as const;

export type Kpi = {
  label: string;
  value: string;
  /** The previous value, shown quietly after something changed it. */
  was?: string;
  caption: string;
  flagged?: boolean;
};

/** Org-wide supervision held on schedule, rolling four weeks, as a share of sessions booked. */
const supervisionCompletionOrg: WeeklySeries = [92, 92, 89, 89, 86, 83, 83, 80, 78, 75, 75, 72];

export function scopedClinicians(scope: ClinicianScope) {
  return clinicians.filter((c) => inScope(c, scope));
}

function sum(list: Clinician[], pick: (c: Clinician) => number) {
  return list.reduce((total, c) => total + pick(c), 0);
}

function supervisionRate(list: Clinician[]) {
  const sessions = list.flatMap((c) => c.supervisionHistory);
  const held = sessions.filter((s) => s === "held").length;
  return {
    held,
    total: sessions.length,
    rate: sessions.length ? (held / sessions.length) * 100 : 0,
  };
}

/** Everything the leadership overview shows, for the clinicians in scope. */
export function summarise(scope: ClinicianScope, adjust?: (c: Clinician) => Clinician) {
  const scoped = scopedClinicians(scope);
  const list = adjust ? scoped.map(adjust) : scoped;
  const names = new Set(list.map((c) => c.name));
  const attention = attentionClients.filter((a) => names.has(a.clinician));
  const active = sum(list, (c) => c.active);
  const capacity = sum(list, (c) => c.capacity);
  const fte = sum(list, (c) => c.fte);
  const overdue = sum(list, (c) => c.notesOverdue);
  const drafts = sum(list, (c) => c.draftsAwaiting);
  const followUps = sum(list, (c) => c.followUpsOverdue);
  const ndis = sum(list, (c) => c.funding.ndis);
  const nearCapacity = list.filter((c) => c.utilisation >= 95).length;
  const supervisionDue = list.filter((c) => c.supervisionDue).length;
  const ot = list.filter((c) => c.discipline === "Occupational Therapy").length;
  const supervision = supervisionRate(list);
  const orgSupervision = supervisionRate(clinicians);

  const activeSeries = sumSeries(list.map((c) => c.history.active));
  const capacitySeries = weeks.map(() => capacity);
  const utilisationSeries = activeSeries.map((a) =>
    capacity ? Math.round((a / capacity) * 100) : 0,
  );
  const notesSeries = sumSeries(list.map((c) => c.history.notesDue));
  const followUpSeries = sumSeries(list.map((c) => c.history.followUpsOverdue));
  const supervisionSeries = supervisionCompletionOrg.map((v) =>
    Math.min(100, Math.round((v * supervision.rate) / orgSupervision.rate)),
  );

  const kpis: Kpi[] = [
    {
      label: "Active clinicians",
      value: String(list.length),
      caption: `${fte.toFixed(1)} FTE · ${ot} OT · ${list.length - ot} Speech Pathology`,
    },
    {
      label: "Active clients",
      value: String(active),
      caption: `${ndis} NDIS · ${active - ndis} aged care`,
    },
    {
      label: "Average caseload",
      value: list.length ? (active / list.length).toFixed(1) : "0",
      caption: `Utilisation ${capacity ? Math.round((active / capacity) * 100) : 0}% of configured capacity`,
    },
    {
      label: "Clinicians near capacity",
      value: String(nearCapacity),
      caption: "At or above 95% of configured capacity",
      flagged: nearCapacity > 0,
    },
    {
      label: "Notes due",
      value: String(overdue + drafts),
      caption: `${overdue} to write · ${drafts} AI drafts awaiting approval`,
    },
    {
      label: "Follow-ups overdue",
      value: String(followUps),
      caption: `${delta(followUpSeries)} over 12 weeks`,
    },
    { label: "Supervision due", value: String(supervisionDue), caption: "Next 14 days" },
    {
      label: "Clients requiring review",
      value: String(attention.length),
      caption: `${countByPriority(attention, "High")} high · ${countByPriority(attention, "Medium")} medium · ${countByPriority(attention, "Review")} review`,
      flagged: attention.length > 0,
    },
  ];

  return {
    list,
    attention,
    active,
    capacity,
    fte,
    ndis,
    agedCare: active - ndis,
    mix: {
      high: sum(list, (c) => c.mix.high),
      medium: sum(list, (c) => c.mix.medium),
      low: sum(list, (c) => c.mix.low),
    },
    supervision,
    kpis,
    series: {
      active: activeSeries,
      capacity: capacitySeries,
      utilisation: utilisationSeries,
      notesDue: notesSeries,
      followUps: followUpSeries,
      supervision: supervisionSeries,
    },
  };
}

function delta(series: WeeklySeries) {
  const first = series[0] ?? 0;
  const last = series[series.length - 1] ?? 0;
  const change = last - first;
  return `${change > 0 ? "+" : change < 0 ? "−" : "±"}${Math.abs(change)}`;
}

export type ImpactMeasure = {
  label: string;
  now: string;
  projected: string;
  change: string;
};

/**
 * Projected outcomes once the AI drafting and follow-up features are in use. These are
 * estimates built from the admin-insights breakdown, not results from a pilot.
 */
export const projectedImpact: ImpactMeasure[] = [
  {
    label: "Team hours returned / week",
    now: "0",
    projected: "≈32",
    change: "≈0.8 FTE of capacity",
  },
  {
    label: "Supervision prep / session",
    now: "45m",
    projected: "10m",
    change: "Brief drafted ahead",
  },
  { label: "Notes overdue", now: "12", projected: "≤5", change: "Drafts ready same day" },
  { label: "Follow-ups overdue", now: "11", projected: "≤4", change: "Surfaced before they lapse" },
  {
    label: "Supervision held on schedule",
    now: "72%",
    projected: "95%",
    change: "Protected time tracked",
  },
];
