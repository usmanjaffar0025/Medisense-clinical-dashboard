import type { Funding, Site } from "./types";
import { dt, mo } from "@/lib/clock";

export type GoalStatus = "Achieved" | "On track" | "Progressing" | "At risk";

export type ClientGoal = {
  id: string;
  text: string;
  domain: string;
  measure: string;
  baseline: string;
  current: string;
  target: string;
  /** Progress from baseline to target, 0–100. */
  progress: number;
  /** Progress at the end of each of the last six months (May → Oct). */
  history: number[];
  status: GoalStatus;
};

export type TimelineKind = "note" | "report" | "task" | "referral" | "contact" | "form" | "visit";

export type TimelineEvent = {
  date: string;
  kind: TimelineKind;
  title: string;
  detail: string;
  href?: string;
};

export type ClientProfile = {
  id: string;
  name: string;
  initials: string;
  age: number;
  funding: Funding;
  service: string;
  clinician: string;
  region: Site;
  suburb: string;
  visitType: string;
  clientSince: string;
  plan: { label: string; start: string; end: string; review: string; daysToReview: number };
  nextAppointment: string;
  contacts: { role: string; name: string; detail: string }[];
  alerts: { tone: "over" | "monitor" | "neutral"; text: string }[];
  summary: string;
  goals: ClientGoal[];
  budget: {
    label: string;
    total: number;
    spent: number;
    months: { month: string; spent: number; expected: number }[];
    insight: string;
  };
  attendance: { month: string; attended: number; cancelled: number }[];
  timeline: TimelineEvent[];
  documents: {
    name: string;
    kind: string;
    date: string;
    status: "Current" | "Expiring" | "Draft" | "Missing";
  }[];
  links: { label: string; href: string }[];
};

export const goalMonths = [
  mo("May"),
  mo("Jun"),
  mo("Jul"),
  mo("Aug"),
  mo("Sep"),
  mo("Oct"),
] as const;

/** Cumulative spend against an even spread of a 12-month plan budget. */
function burn(months: string[], total: number, monthly: number[]) {
  let spent = 0;
  return months.map((month, i) => {
    spent += monthly[i] ?? 0;
    return { month, spent, expected: Math.round((total / 12) * (i + 1)) };
  });
}

const ndisMonths = [
  mo("Nov"),
  mo("Dec"),
  mo("Jan"),
  mo("Feb"),
  mo("Mar"),
  mo("Apr"),
  mo("May"),
  mo("Jun"),
  mo("Jul"),
  mo("Aug"),
  mo("Sep"),
  mo("Oct"),
];
const fyMonths = [mo("Jul"), mo("Aug"), mo("Sep"), mo("Oct")];

export const clientProfiles: ClientProfile[] = [
  {
    id: "emily-carter",
    name: "Emily Carter",
    initials: "EC",
    age: 8,
    funding: "NDIS",
    service: "Paediatric Occupational Therapy",
    clinician: "Hannah Wright",
    region: "Brisbane North",
    suburb: "Kedron",
    visitType: "Home visits · 2 school visits",
    clientSince: dt("Nov 2024"),
    plan: {
      label: "NDIS plan · Capacity Building, Improved Daily Living",
      start: dt("6 Nov 2025"),
      end: dt("6 Nov 2026"),
      review: dt("Fri 6 Nov"),
      daysToReview: 17,
    },
    nextAppointment: `${dt("Tue 27 Oct")}, 8:30 am · home visit`,
    contacts: [
      { role: "Parent", name: "Rachel Carter", detail: "Primary contact · prefers SMS" },
      { role: "Support coordinator", name: "Mark Daley", detail: "Northside Coordination" },
      { role: "School", name: "Kedron State School", detail: "Year 3 teacher · Ms Patel" },
    ],
    alerts: [
      {
        tone: "over",
        text: `NDIS plan review in 17 days. Progress report due ${dt("Fri 23 Oct")}.`,
      },
      { tone: "monitor", text: "$2,960 of plan budget unspent with 2½ weeks left." },
    ],
    summary: `Emily has made strong progress in dressing (now about 17 minutes, close to the 15-minute goal) and handwriting is legible for 2 of 3 sentences. Self-regulation during transitions still needs about 2 prompts. Attendance is 92%. The plan review on ${dt("6 Nov")} is the next milestone; the progress report draft is ready for Hannah's review.`,
    goals: [
      {
        id: "g1",
        text: "Dress independently for school within 15 minutes",
        domain: "Self-care",
        measure: "Minutes to dress (parent report)",
        baseline: "30 min",
        current: "17 min",
        target: "15 min",
        progress: 87,
        history: [22, 38, 51, 64, 78, 87],
        status: "On track",
      },
      {
        id: "g2",
        text: "Produce legible handwriting for a 3-sentence task",
        domain: "School participation",
        measure: "Legible sentences of 3",
        baseline: "0 of 3",
        current: "2 of 3",
        target: "3 of 3",
        progress: 67,
        history: [10, 18, 33, 41, 55, 67],
        status: "Progressing",
      },
      {
        id: "g3",
        text: "Use a self-regulation strategy in transitions with ≤1 prompt",
        domain: "Self-regulation",
        measure: "Prompts needed (teacher report)",
        baseline: "4 prompts",
        current: "2 prompts",
        target: "≤1 prompt",
        progress: 58,
        history: [8, 15, 27, 35, 46, 58],
        status: "Progressing",
      },
    ],
    budget: {
      label: `Capacity Building · ${dt("6 Nov 2025")} – ${dt("6 Nov 2026")}`,
      total: 9850,
      spent: 6890,
      months: burn(ndisMonths, 9850, [520, 410, 380, 640, 660, 600, 640, 590, 610, 620, 600, 620]),
      insight:
        "Spend is 70% of budget at month 12 of 12. Consider recommending continued funding at a similar level in the plan review report.",
    },
    attendance: [
      { month: mo("May"), attended: 2, cancelled: 0 },
      { month: mo("Jun"), attended: 2, cancelled: 1 },
      { month: mo("Jul"), attended: 2, cancelled: 0 },
      { month: mo("Aug"), attended: 2, cancelled: 0 },
      { month: mo("Sep"), attended: 2, cancelled: 0 },
      { month: mo("Oct"), attended: 1, cancelled: 0 },
    ],
    timeline: [
      {
        date: dt("20 Oct"),
        kind: "report",
        title: "Progress report drafted by AI",
        detail: "From 12 approved notes, 3 goals and COPM",
        href: "/progress-reports/emily-carter",
      },
      {
        date: dt("20 Oct"),
        kind: "visit",
        title: "Home visit, Kedron",
        detail: "Hannah Wright · 50 min",
      },
      {
        date: dt("16 Oct"),
        kind: "note",
        title: "Session note approved",
        detail: "Dressing practice with visual sequence",
      },
      {
        date: dt("9 Oct"),
        kind: "visit",
        title: "School visit",
        detail: "Teacher liaison on transitions",
      },
      {
        date: dt("2 Oct"),
        kind: "contact",
        title: "Call with parent",
        detail: "Agreed plan review priorities",
      },
      {
        date: dt("18 Sep"),
        kind: "task",
        title: "COPM re-assessment completed",
        detail: "Performance 4.3 → 7.0",
      },
    ],
    documents: [
      { name: "NDIS plan 2025–26", kind: "Plan", date: dt("6 Nov 2025"), status: "Expiring" },
      { name: "Service agreement", kind: "Agreement", date: dt("12 Nov 2025"), status: "Expiring" },
      {
        name: "Consent to share with school",
        kind: "Consent",
        date: dt("3 Feb 2026"),
        status: "Current",
      },
      {
        name: `Progress report, ${dt("Oct 2026")}`,
        kind: "Report",
        date: dt("20 Oct 2026"),
        status: "Draft",
      },
      {
        name: `COPM, ${dt("Sep 2026")}`,
        kind: "Assessment",
        date: dt("18 Sep 2026"),
        status: "Current",
      },
    ],
    links: [
      { label: "Open progress report", href: "/progress-reports/emily-carter" },
      { label: "Hannah's day", href: "/my-day" },
    ],
  },
  {
    id: "ruth-hallam",
    name: "Ruth Hallam",
    initials: "RH",
    age: 78,
    funding: "Aged care",
    service: "Home modifications · falls prevention",
    clinician: "Sarah Thompson",
    region: "Brisbane North",
    suburb: "Aspley",
    visitType: "Home visits",
    clientSince: dt("Aug 2025"),
    plan: {
      label: "Support at Home · allied health allocation",
      start: dt("1 Jul 2026"),
      end: dt("30 Jun 2027"),
      review: dt("Mon 16 Nov"),
      daysToReview: 27,
    },
    nextAppointment: "Not booked · appointments paused",
    contacts: [
      { role: "Daughter", name: "Karen Hallam", detail: "Primary contact · decision maker" },
      { role: "Care partner", name: "Linh Tran", detail: "Support at Home provider" },
      { role: "GP", name: "Dr Andrew Moss", detail: "Aspley Family Practice" },
    ],
    alerts: [
      { tone: "over", text: `Session note from ${dt("6 Oct")} is 14 days overdue.` },
      { tone: "over", text: "Two near falls reported in the past month." },
      { tone: "monitor", text: "Home modification funding request missing the builder quote." },
    ],
    summary: `Ruth has an 18 cm step into the shower and relies on the towel rail for support; her daughter reports two near falls this month. Two grab rails and a shower chair are recommended. Appointments are paused while the family decides whether Ruth moves in with her daughter. Next steps: approve the ${dt("6 Oct")} note, get the builder quote, and call Karen within two weeks.`,
    goals: [
      {
        id: "g1",
        text: "Shower safely with rails and a shower chair",
        domain: "Self-care",
        measure: "Independent, safe shower transfers",
        baseline: "Uses towel rail",
        current: "Assessed, awaiting rails",
        target: "Independent with rails",
        progress: 35,
        history: [0, 0, 10, 20, 30, 35],
        status: "At risk",
      },
      {
        id: "g2",
        text: "No falls over the next three months",
        domain: "Safety",
        measure: "Falls and near falls per month",
        baseline: "1 fall / month",
        current: "2 near falls",
        target: "0",
        progress: 25,
        history: [30, 40, 45, 40, 30, 25],
        status: "At risk",
      },
      {
        id: "g3",
        text: "Walk to the letterbox daily with a four-wheeled walker",
        domain: "Mobility",
        measure: "Days per week",
        baseline: "2 days",
        current: "5 days",
        target: "7 days",
        progress: 60,
        history: [10, 22, 35, 44, 55, 60],
        status: "Progressing",
      },
    ],
    budget: {
      label: "Support at Home · allied health · FY 2026–27",
      total: 4200,
      spent: 1640,
      months: burn(fyMonths, 4200, [380, 440, 540, 280]),
      insight:
        "Spend is ahead of an even spread because of the home assessment. The rails and chair will come from the home modifications budget, not allied health.",
    },
    attendance: [
      { month: mo("May"), attended: 2, cancelled: 0 },
      { month: mo("Jun"), attended: 1, cancelled: 1 },
      { month: mo("Jul"), attended: 2, cancelled: 0 },
      { month: mo("Aug"), attended: 2, cancelled: 0 },
      { month: mo("Sep"), attended: 1, cancelled: 1 },
      { month: mo("Oct"), attended: 1, cancelled: 0 },
    ],
    timeline: [
      {
        date: dt("20 Oct"),
        kind: "form",
        title: "Home modification request pre-filled",
        detail: "3 fields still missing",
        href: "/forms?form=home-mod-ruth",
      },
      {
        date: dt("19 Oct"),
        kind: "task",
        title: "Request builder quote",
        detail: "Admin team · open",
      },
      {
        date: dt("6 Oct"),
        kind: "visit",
        title: "Home visit, Aspley",
        detail: "Bathroom access assessment · daughter present",
      },
      {
        date: dt("6 Oct"),
        kind: "note",
        title: "Session note overdue",
        detail: "AI draft available",
        href: "/case-notes/ruth-hallam",
      },
      {
        date: dt("22 Sep"),
        kind: "contact",
        title: "Call from care partner",
        detail: "Reported near fall in the bathroom",
      },
      { date: dt("8 Sep"), kind: "visit", title: "Home visit, Aspley", detail: "Walker review" },
    ],
    documents: [
      {
        name: "Support at Home care plan",
        kind: "Plan",
        date: dt("1 Jul 2026"),
        status: "Current",
      },
      { name: "Service agreement", kind: "Agreement", date: dt("14 Aug 2025"), status: "Current" },
      {
        name: "Home safety assessment",
        kind: "Assessment",
        date: dt("6 Oct 2026"),
        status: "Draft",
      },
      { name: "Builder quote", kind: "Quote", date: "—", status: "Missing" },
    ],
    links: [
      { label: "Open case note", href: "/case-notes/ruth-hallam" },
      { label: "Home modification form", href: "/forms?form=home-mod-ruth" },
    ],
  },
  {
    id: "mia-robinson",
    name: "Mia Robinson",
    initials: "MR",
    age: 7,
    funding: "NDIS",
    service: "Paediatric OT · Daily routines",
    clinician: "Sarah Thompson",
    region: "Brisbane North",
    suburb: "Chermside",
    visitType: "Home visits",
    clientSince: dt("Nov 2025"),
    plan: {
      label: "NDIS plan · Capacity Building, Improved Daily Living",
      start: dt("2 Mar 2026"),
      end: dt("1 Mar 2027"),
      review: dt("Mon 1 Feb"),
      daysToReview: 104,
    },
    nextAppointment: "Today, 3:30 pm · home visit",
    contacts: [
      { role: "Parent", name: "Jess Robinson", detail: "Primary contact · email" },
      { role: "Plan manager", name: "Clearpath Plan Management", detail: "Invoices monthly" },
    ],
    alerts: [
      { tone: "monitor", text: `AI draft of the ${dt("13 Oct")} note is waiting for approval.` },
    ],
    summary:
      "Mia is following her visual morning schedule on most school days and now manages buttons with verbal prompts. Hair brushing is still distressing. Sessions focus on graded sensory tolerance and parent coaching. Funding use is on track.",
    goals: [
      {
        id: "g1",
        text: "Complete the morning routine using a visual schedule",
        domain: "Daily routines",
        measure: "School days per week without adult help",
        baseline: "0 days",
        current: "4 days",
        target: "5 days",
        progress: 80,
        history: [15, 30, 45, 60, 70, 80],
        status: "On track",
      },
      {
        id: "g2",
        text: "Fasten buttons and zips independently",
        domain: "Self-care",
        measure: "Fasteners managed alone",
        baseline: "Zips only",
        current: "Buttons with prompts",
        target: "All, no prompts",
        progress: 55,
        history: [10, 20, 28, 36, 47, 55],
        status: "Progressing",
      },
      {
        id: "g3",
        text: "Tolerate hair brushing for 2 minutes",
        domain: "Sensory",
        measure: "Minutes tolerated",
        baseline: "15 sec",
        current: "45 sec",
        target: "2 min",
        progress: 28,
        history: [5, 9, 14, 18, 22, 28],
        status: "Progressing",
      },
    ],
    budget: {
      label: `Capacity Building · ${dt("2 Mar 2026")} – ${dt("1 Mar 2027")}`,
      total: 8400,
      spent: 5050,
      months: burn(
        [mo("Mar"), mo("Apr"), mo("May"), mo("Jun"), mo("Jul"), mo("Aug"), mo("Sep"), mo("Oct")],
        8400,
        [620, 640, 610, 650, 640, 630, 620, 640],
      ),
      insight: "Spend is 60% of budget at month 8 of 12, in line with the plan.",
    },
    attendance: [
      { month: mo("May"), attended: 4, cancelled: 0 },
      { month: mo("Jun"), attended: 3, cancelled: 1 },
      { month: mo("Jul"), attended: 4, cancelled: 0 },
      { month: mo("Aug"), attended: 4, cancelled: 0 },
      { month: mo("Sep"), attended: 4, cancelled: 0 },
      { month: mo("Oct"), attended: 2, cancelled: 0 },
    ],
    timeline: [
      {
        date: dt("20 Oct"),
        kind: "visit",
        title: "Home visit booked",
        detail: "Today, 3:30 pm · Chermside",
      },
      {
        date: dt("13 Oct"),
        kind: "note",
        title: "AI draft waiting",
        detail: "Morning routine and buttons",
        href: "/case-notes/mia-robinson",
      },
      {
        date: dt("13 Oct"),
        kind: "visit",
        title: "Home visit, Chermside",
        detail: "50 min · parent present",
      },
      {
        date: dt("6 Oct"),
        kind: "note",
        title: "Session note approved",
        detail: "Sensory tolerance plan",
      },
      {
        date: dt("29 Sep"),
        kind: "contact",
        title: "Email to parent",
        detail: "Visual schedule printouts",
      },
    ],
    documents: [
      { name: "NDIS plan 2026–27", kind: "Plan", date: dt("2 Mar 2026"), status: "Current" },
      { name: "Service agreement", kind: "Agreement", date: dt("9 Mar 2026"), status: "Current" },
      { name: "Sensory profile", kind: "Assessment", date: dt("16 Mar 2026"), status: "Current" },
    ],
    links: [{ label: "Open case note", href: "/case-notes/mia-robinson" }],
  },
  {
    id: "james-thompson",
    name: "James Thompson",
    initials: "JT",
    age: 9,
    funding: "NDIS",
    service: "Paediatric OT · Sensory processing",
    clinician: "Sarah Thompson",
    region: "Brisbane North",
    suburb: "Nundah",
    visitType: "Home visits",
    clientSince: dt("Aug 2024"),
    plan: {
      label: "NDIS plan · Capacity Building, Improved Daily Living",
      start: dt("14 Jan 2026"),
      end: dt("13 Jan 2027"),
      review: dt("Mon 14 Dec"),
      daysToReview: 55,
    },
    nextAppointment: `Not booked · last visit ${dt("29 Sep")}`,
    contacts: [
      { role: "Parent", name: "Daniel Thompson", detail: "Primary contact · phone after 3 pm" },
      { role: "Support coordinator", name: "Amy Liu", detail: "Brightpath Supports" },
    ],
    alerts: [
      { tone: "over", text: "No appointment for 21 days. Rebook task is 4 days overdue." },
      {
        tone: "monitor",
        text: "Sarah's caseload is At Risk; consider continuity before any transfer.",
      },
    ],
    summary: `James has been seen for over two years and responds well to a predictable sensory diet. He has not been seen since ${dt("29 Sep")} because of two cancellations and no rebooking. Progress on regulation goals has stalled this month. Rebooking within the week is the priority.`,
    goals: [
      {
        id: "g1",
        text: "Use a sensory break card at school without adult prompt",
        domain: "Self-regulation",
        measure: "Independent uses per week",
        baseline: "0",
        current: "2",
        target: "5",
        progress: 40,
        history: [20, 28, 34, 40, 42, 40],
        status: "At risk",
      },
      {
        id: "g2",
        text: "Sit for a 15-minute homework block",
        domain: "School participation",
        measure: "Minutes seated",
        baseline: "4 min",
        current: "10 min",
        target: "15 min",
        progress: 55,
        history: [25, 33, 41, 50, 55, 55],
        status: "Progressing",
      },
    ],
    budget: {
      label: `Capacity Building · ${dt("14 Jan 2026")} – ${dt("13 Jan 2027")}`,
      total: 11200,
      spent: 6310,
      months: burn(
        [
          mo("Jan"),
          mo("Feb"),
          mo("Mar"),
          mo("Apr"),
          mo("May"),
          mo("Jun"),
          mo("Jul"),
          mo("Aug"),
          mo("Sep"),
          mo("Oct"),
        ],
        11200,
        [640, 700, 690, 720, 700, 680, 710, 690, 600, 180],
      ),
      insight:
        "Spend dropped in October after missed sessions; the plan is now below an even spread.",
    },
    attendance: [
      { month: mo("May"), attended: 4, cancelled: 0 },
      { month: mo("Jun"), attended: 4, cancelled: 0 },
      { month: mo("Jul"), attended: 3, cancelled: 1 },
      { month: mo("Aug"), attended: 4, cancelled: 0 },
      { month: mo("Sep"), attended: 2, cancelled: 2 },
      { month: mo("Oct"), attended: 0, cancelled: 1 },
    ],
    timeline: [
      {
        date: dt("16 Oct"),
        kind: "task",
        title: "Rebook appointment (automation)",
        detail: "Sarah Thompson · 4 days overdue",
        href: "/tasks",
      },
      { date: dt("8 Oct"), kind: "contact", title: "Cancelled by parent", detail: "Illness" },
      {
        date: dt("29 Sep"),
        kind: "visit",
        title: "Home visit, Nundah",
        detail: "Sensory diet review",
      },
      { date: dt("22 Sep"), kind: "contact", title: "Cancelled by parent", detail: "School event" },
      {
        date: dt("15 Sep"),
        kind: "note",
        title: "Session note approved",
        detail: "Break card introduced at school",
      },
    ],
    documents: [
      { name: "NDIS plan 2026–27", kind: "Plan", date: dt("14 Jan 2026"), status: "Current" },
      { name: "Service agreement", kind: "Agreement", date: dt("20 Jan 2026"), status: "Current" },
      { name: "Consent to share with school", kind: "Consent", date: "—", status: "Missing" },
    ],
    links: [
      { label: "Schedule a visit", href: "/schedule" },
      { label: "Sarah's caseload", href: "/caseloads/sarah-thompson" },
    ],
  },
];

export function clientProfileById(id: string) {
  return clientProfiles.find((c) => c.id === id);
}
