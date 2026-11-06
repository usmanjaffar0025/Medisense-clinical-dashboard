import type { Funding } from "./types";
import { dt } from "@/lib/clock";

export type ReportType =
  | "Progress report"
  | "NDIS plan review report"
  | "Functional capacity assessment"
  | "Home modification report"
  | "Assistive technology assessment"
  | "Speech & language assessment"
  | "Discharge summary";

export type ReportStatus = "Not started" | "AI draft" | "In review" | "Approved" | "Sent";

export type LibraryReport = {
  id: string;
  client: string;
  clinician: string;
  type: ReportType;
  funding: Funding;
  due: string;
  /** Days until due at demo "today"; negative means overdue. */
  dueInDays: number;
  status: ReportStatus;
  /** Approved notes, assessments and documents the draft is built from. */
  sources: { label: string; count: number }[];
  sections: string[];
  href?: string;
};

export const reportTypes: ReportType[] = [
  "Progress report",
  "NDIS plan review report",
  "Functional capacity assessment",
  "Home modification report",
  "Assistive technology assessment",
  "Speech & language assessment",
  "Discharge summary",
];

export const reportStatuses: ReportStatus[] = [
  "Not started",
  "AI draft",
  "In review",
  "Approved",
  "Sent",
];

const sectionsFor: Record<ReportType, string[]> = {
  "Progress report": [
    "Client details",
    "Goals and progress",
    "Interventions",
    "Outcome measures",
    "Recommendations",
  ],
  "NDIS plan review report": [
    "Participant details",
    "Progress against plan goals",
    "Functional impact",
    "Funding used and requested",
    "Recommended supports",
  ],
  "Functional capacity assessment": [
    "Background",
    "Assessment tools",
    "Domains: self-care, mobility, community",
    "Risks",
    "Recommended supports and hours",
  ],
  "Home modification report": [
    "Home environment",
    "Observed transfers",
    "Risks",
    "Recommended modifications",
    "Quotes",
  ],
  "Assistive technology assessment": [
    "Current function",
    "Trials completed",
    "Options compared",
    "Recommended item",
    "Value for money",
  ],
  "Speech & language assessment": [
    "Case history",
    "Standardised scores",
    "Observations",
    "Diagnosis",
    "Therapy plan",
  ],
  "Discharge summary": ["Episode of care", "Goals achieved", "Home program", "Referrals onward"],
};

type Row = [
  string,
  string,
  string,
  ReportType,
  Funding,
  string,
  number,
  ReportStatus,
  number,
  string?,
];

const rows: Row[] = [
  [
    "emily-carter",
    "Emily Carter",
    "Hannah Wright",
    "Progress report",
    "NDIS",
    dt("Fri 23 Oct"),
    3,
    "AI draft",
    12,
    "/progress-reports/emily-carter",
  ],
  [
    "daniel-lee",
    "Daniel Lee",
    "Sarah Thompson",
    "NDIS plan review report",
    "NDIS",
    dt("Mon 26 Oct"),
    6,
    "Not started",
    9,
  ],
  [
    "kai-robertson",
    "Kai Robertson",
    "Jessica Nguyen",
    "NDIS plan review report",
    "NDIS",
    dt("Fri 30 Oct"),
    10,
    "Not started",
    11,
  ],
  [
    "ruth-hallam",
    "Ruth Hallam",
    "Sarah Thompson",
    "Home modification report",
    "Aged care",
    dt("Wed 28 Oct"),
    8,
    "Not started",
    4,
  ],
  [
    "ava-mitchell",
    "Ava Mitchell",
    "Sarah Thompson",
    "Assistive technology assessment",
    "NDIS",
    dt("Thu 22 Oct"),
    2,
    "In review",
    6,
  ],
  [
    "william-foster",
    "William Foster",
    "Sarah Thompson",
    "Functional capacity assessment",
    "NDIS",
    dt("Fri 16 Oct"),
    -4,
    "In review",
    14,
  ],
  [
    "harper-quinn",
    "Harper Quinn",
    "Marcus Bell",
    "Speech & language assessment",
    "NDIS",
    dt("Tue 27 Oct"),
    7,
    "AI draft",
    5,
  ],
  [
    "eli-morgan",
    "Eli Morgan",
    "Liam Patel",
    "Progress report",
    "NDIS",
    dt("Mon 2 Nov"),
    13,
    "Not started",
    8,
  ],
  [
    "sophie-williams",
    "Sophie Williams",
    "Jessica Nguyen",
    "Progress report",
    "NDIS",
    dt("Tue 27 Oct"),
    7,
    "Not started",
    10,
  ],
  [
    "margaret-ellis",
    "Margaret Ellis",
    "Tom Fitzgerald",
    "Discharge summary",
    "Aged care",
    dt("Mon 19 Oct"),
    -1,
    "AI draft",
    7,
  ],
  [
    "chloe-nash",
    "Chloe Nash",
    "Daniel Okafor",
    "Functional capacity assessment",
    "NDIS",
    dt("Fri 6 Nov"),
    17,
    "Not started",
    6,
  ],
  [
    "frank-delaney",
    "Frank Delaney",
    "Aisha Karim",
    "Speech & language assessment",
    "Aged care",
    dt("Thu 15 Oct"),
    -5,
    "Approved",
    4,
  ],
  [
    "amelia-scott",
    "Amelia Scott",
    "Marcus Bell",
    "NDIS plan review report",
    "NDIS",
    dt("Tue 13 Oct"),
    -7,
    "Sent",
    13,
  ],
  [
    "charlotte-king",
    "Charlotte King",
    "Sarah Thompson",
    "Progress report",
    "Aged care",
    dt("Fri 9 Oct"),
    -11,
    "Sent",
    6,
  ],
  [
    "george-adams",
    "George Adams",
    "Hannah Wright",
    "Home modification report",
    "Aged care",
    dt("Wed 7 Oct"),
    -13,
    "Sent",
    5,
  ],
  [
    "leo-banks",
    "Leo Banks",
    "Hannah Wright",
    "Assistive technology assessment",
    "NDIS",
    dt("Mon 12 Oct"),
    -8,
    "Approved",
    7,
  ],
  [
    "nina-fischer",
    "Nina Fischer",
    "Hannah Wright",
    "Progress report",
    "NDIS",
    dt("Fri 13 Nov"),
    24,
    "Not started",
    9,
  ],
  [
    "oscar-lin",
    "Oscar Lin",
    "Priya Raman",
    "Speech & language assessment",
    "NDIS",
    dt("Fri 20 Nov"),
    31,
    "Not started",
    1,
  ],
];

export const libraryReports: LibraryReport[] = rows.map(
  ([id, client, clinician, type, funding, due, dueInDays, status, notes, href]) => ({
    id,
    client,
    clinician,
    type,
    funding,
    due,
    dueInDays,
    status,
    sources: [
      { label: "Approved session notes", count: notes },
      { label: "Goals", count: type === "Discharge summary" ? 2 : 3 },
      { label: "Assessments & measures", count: type.includes("assessment") ? 3 : 1 },
    ],
    sections: sectionsFor[type],
    href,
  }),
);

/** Average working days from a report being requested to it being sent, last 12 weeks. */
export const turnaroundByWeek = [
  13.5, 13.1, 13.8, 12.9, 12.6, 12.2, 11.7, 11.1, 10.4, 9.6, 9.1, 8.4,
];

export const reportTemplates = [
  { name: "NDIS progress report", uses: 46, sections: 5, updated: dt("Aug 2026") },
  { name: "NDIS plan review report", uses: 31, sections: 5, updated: dt("Sep 2026") },
  { name: "Functional capacity assessment", uses: 18, sections: 5, updated: dt("Jul 2026") },
  { name: "Home modification report", uses: 14, sections: 5, updated: dt("Jun 2026") },
  { name: "Assistive technology assessment", uses: 12, sections: 5, updated: dt("Sep 2026") },
  { name: "Speech & language assessment", uses: 21, sections: 5, updated: dt("May 2026") },
  { name: "Discharge summary", uses: 25, sections: 4, updated: dt("Mar 2026") },
];
