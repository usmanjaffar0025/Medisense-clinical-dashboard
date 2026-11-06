import { clinicians } from "./clinicians";
import { seedFrom } from "./weeks";
import { dt, mo } from "@/lib/clock";

export type ComplianceState = "Expired" | "Due ≤30 days" | "Due ≤60 days" | "Current";

export type ExpiryItem = {
  id: string;
  kind: "Client" | "Staff";
  category: string;
  subject: string;
  owner: string;
  expires: string;
  daysLeft: number;
};

export function stateFor(daysLeft: number): ComplianceState {
  if (daysLeft < 0) return "Expired";
  if (daysLeft <= 30) return "Due ≤30 days";
  if (daysLeft <= 60) return "Due ≤60 days";
  return "Current";
}

/** Staff requirements for allied health home visiting in Queensland. */
export const staffRequirements = [
  { id: "registration", label: "Registration", detail: "AHPRA (OT) or SPA certification (Speech)" },
  { id: "bluecard", label: "Blue Card", detail: "Working with children check, QLD" },
  { id: "screening", label: "NDIS Worker Screening", detail: "Renews every 5 years" },
  { id: "firstaid", label: "First aid & CPR", detail: "CPR yearly, first aid 3-yearly" },
  { id: "vehicle", label: "Licence & vehicle insurance", detail: "Required for home visits" },
] as const;

export type RequirementId = (typeof staffRequirements)[number]["id"];

/** Fixed exceptions the demo story relies on; everything else is current. */
const staffExceptions: Partial<Record<string, Partial<Record<RequirementId, [string, number]>>>> = {
  "liam-patel": { bluecard: [dt("1 Nov 2026"), 12] },
  "ben-holloway": { firstaid: [dt("16 Oct 2026"), -4] },
  "aisha-karim": { registration: [dt("14 Nov 2026"), 25] },
  "tom-fitzgerald": { vehicle: [dt("29 Nov 2026"), 40] },
  "priya-raman": { firstaid: [dt("9 Dec 2026"), 50] },
  "jessica-nguyen": { screening: [dt("18 Nov 2026"), 29] },
};

const months = [
  mo("Feb"),
  mo("Mar"),
  mo("Apr"),
  mo("May"),
  mo("Jun"),
  mo("Jul"),
  mo("Aug"),
  mo("Sep"),
];

export const staffCompliance = clinicians.map((c) => ({
  clinician: c,
  items: staffRequirements.map((r) => {
    const fixed = staffExceptions[c.id]?.[r.id];
    const seed = seedFrom(`${c.id}-${r.id}`);
    const daysLeft = fixed?.[1] ?? 70 + (seed % 600);
    const expires =
      fixed?.[0] ?? `${(seed % 27) + 1} ${months[seed % months.length]} ${2027 + (seed % 2)}`;
    return {
      id: `${c.id}-${r.id}`,
      requirement: r.id,
      label: r.label,
      expires,
      daysLeft,
      state: stateFor(daysLeft),
    };
  }),
}));

const staffDue: ExpiryItem[] = staffCompliance.flatMap(({ clinician, items }) =>
  items
    .filter((i) => i.daysLeft <= 60)
    .map((i) => ({
      id: i.id,
      kind: "Staff" as const,
      category: i.label,
      subject: clinician.name,
      owner: "Practice manager",
      expires: i.expires,
      daysLeft: i.daysLeft,
    })),
);

const clientDue: ExpiryItem[] = [
  ["emily-plan", "NDIS plan ends", "Emily Carter", "Hannah Wright", dt("6 Nov 2026"), 17],
  ["emily-agreement", "Service agreement", "Emily Carter", "Admin team", dt("12 Nov 2026"), 23],
  ["kai-plan", "NDIS plan ends", "Kai Robertson", "Jessica Nguyen", dt("1 Nov 2026"), 12],
  ["daniel-plan", "NDIS plan ends", "Daniel Lee", "Sarah Thompson", dt("9 Nov 2026"), 20],
  ["james-consent", "Consent to share with school", "James Thompson", "Admin team", "Missing", -1],
  [
    "ruth-quote",
    "Builder quote for home modifications",
    "Ruth Hallam",
    "Admin team",
    `Requested ${dt("19 Oct")}`,
    0,
  ],
  [
    "george-careplan",
    "Support at Home care plan review",
    "George Adams",
    "Hannah Wright",
    dt("27 Nov 2026"),
    38,
  ],
  ["sophie-agreement", "Service agreement", "Sophie Williams", "Admin team", dt("30 Oct 2026"), 10],
  [
    "margaret-consent",
    "Consent for telehealth",
    "Margaret Ellis",
    "Admin team",
    dt("14 Oct 2026"),
    -6,
  ],
  ["harper-plan", "NDIS plan ends", "Harper Quinn", "Marcus Bell", dt("15 Dec 2026"), 56],
  [
    "frank-careplan",
    "Support at Home care plan review",
    "Frank Delaney",
    "Aisha Karim",
    dt("4 Dec 2026"),
    45,
  ],
  ["chloe-agreement", "Service agreement", "Chloe Nash", "Admin team", dt("3 Dec 2026"), 44],
].map(([id, category, subject, owner, expires, daysLeft]) => ({
  id: id as string,
  kind: "Client" as const,
  category: category as string,
  subject: subject as string,
  owner: owner as string,
  expires: expires as string,
  daysLeft: daysLeft as number,
}));

export const expiryItems: ExpiryItem[] = [...clientDue, ...staffDue].sort(
  (a, b) => a.daysLeft - b.daysLeft,
);

/** Expiries across all 184 clients and 12 staff, by month. */
export const expiriesByMonth = [
  { month: mo("Oct"), client: 6, staff: 1 },
  { month: mo("Nov"), client: 17, staff: 4 },
  { month: mo("Dec"), client: 13, staff: 2 },
  { month: mo("Jan"), client: 11, staff: 1 },
  { month: mo("Feb"), client: 14, staff: 3 },
  { month: mo("Mar"), client: 9, staff: 2 },
];

/** Admin requests handled per week, by kind, last 12 weeks. */
export const adminQueueByWeek = [
  [18, 22, 9, 14],
  [20, 21, 10, 15],
  [17, 24, 11, 13],
  [22, 23, 10, 16],
  [21, 26, 12, 15],
  [24, 25, 11, 17],
  [23, 27, 13, 16],
  [26, 28, 12, 18],
  [25, 30, 14, 17],
  [27, 29, 13, 19],
  [28, 31, 15, 18],
  [29, 33, 14, 20],
].map(([referrals, documents, forms, scheduling]) => ({ referrals, documents, forms, scheduling }));

/** Average hours to first response on a new referral, last 12 weeks. */
export const referralResponseHours = [30, 31, 29, 33, 34, 32, 35, 36, 33, 37, 38, 36];
