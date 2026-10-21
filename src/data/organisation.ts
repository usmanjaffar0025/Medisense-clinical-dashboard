export const organisation = {
  name: "Kestrel Allied Health",
  location: "Melbourne (2 sites)",
  sites: ["Richmond", "Box Hill"],
  today: "Tuesday 20 October 2026",
  activeClients: 201,
  totalCapacity: 224,
  utilisation: 90,
} as const;

export const currentUser = {
  name: "Neil Hensley",
  firstName: "Neil",
  initials: "NH",
  role: "Director of Clinical Services",
} as const;

export type Kpi = {
  label: string;
  value: string;
  caption: string;
  flagged?: boolean;
};

export const organisationKpis: Kpi[] = [
  { label: "Active clinicians", value: "10", caption: "9.3 FTE across 2 sites" },
  { label: "Total active clients", value: "201", caption: "↑ 9 in last 6 weeks" },
  { label: "Average caseload", value: "20.1", caption: "Organisation utilisation 90%" },
  {
    label: "Clinicians near capacity",
    value: "3",
    caption: "At or above 95% of capacity",
    flagged: true,
  },
  {
    label: "Clients requiring attention",
    value: "14",
    caption: "2 high · 7 medium · 5 low",
    flagged: true,
  },
  {
    label: "Notes awaiting completion",
    value: "23",
    caption: "15 overdue · 8 drafts awaiting approval",
  },
  { label: "Supervision sessions due", value: "5", caption: "Next 14 days" },
  { label: "Client follow-ups overdue", value: "9", caption: "↓ 3 vs last week" },
];

export type ImpactMeasure = {
  label: string;
  before: string;
  now: string;
  change: string;
};

export const pilotImpact: ImpactMeasure[] = [
  { label: "Overdue notes", before: "41", now: "15", change: "−63%" },
  { label: "Missed / overdue follow-ups", before: "17", now: "9", change: "−47%" },
  {
    label: "Clinicians over capacity",
    before: "3",
    now: "1",
    change: "2 fewer clinicians over capacity",
  },
  {
    label: "Supervision held on schedule",
    before: "70%",
    now: "100%",
    change: "All sessions held on schedule",
  },
  {
    label: "Admin hours / clinician / week",
    before: "10.4",
    now: "8.1",
    change: "−2.3h · ≈21h team-wide returned to client care",
  },
];
