import type { Funding, Site } from "./types";
import { dt } from "@/lib/clock";
import type { ReferralExtraction } from "@/lib/story/types";

export type ReferralStatus =
  | "New"
  | "Needs verification"
  | "Missing information"
  | "Possible duplicate"
  | "Ready to create"
  | "Info requested"
  | "Profile created"
  | "Merged"
  | "First visit booked";

export type ReferralSource = "Email" | "Web form" | "GP letter" | "Phone intake" | "School letter";

export type ExtractedField = {
  label: string;
  value: string;
  /** 1-based line of the source document the value came from. */
  line: number;
  confidence: "High" | "Check";
};

export type Referral = {
  id: string;
  client: string;
  age: number | null;
  funding: Funding;
  services: string;
  region: Site;
  suburb: string;
  source: ReferralSource;
  sourceDetail: string;
  received: string;
  /** Hours since received, at demo "today". */
  ageHours: number;
  status: ReferralStatus;
  document: string[];
  fields: ExtractedField[];
  missing: string[];
  duplicate?: { client: string; reason: string };
  suggestedClinician?: string;
  contactName?: string;
  contactPhone?: string;
  requestEmail?: string;
};

export const referrals: Referral[] = [
  {
    id: "leila-haddad",
    client: "Leila Haddad",
    age: 6,
    funding: "NDIS",
    services: "Occupational Therapy, Speech Pathology",
    region: "Brisbane North",
    suburb: "Kedron",
    source: "Email",
    sourceDetail: "Email from support coordinator, Brightpath",
    received: `${dt("Mon 19 Oct")}, 4:52 pm`,
    ageHours: 17,
    status: "Needs verification",
    document: [
      "Hi Medisense team,",
      "I'd like to refer Leila Haddad (DOB 02/05/2020) for OT and speech therapy.",
      `Leila is an NDIS participant, number 431 882 905. Her plan runs ${dt("1 Aug 2026")} to ${dt("31 Jul 2027")} and is plan-managed by Clearview Plan Partners.`,
      "Main concerns: delayed speech, difficulty with dressing and toileting routines, sensory sensitivities.",
      "Mum is Rana Haddad, 0412 555 018, and prefers home visits in the afternoon. They live in Kedron.",
      "Leila attends Kedron Early Learning three days a week.",
      "Plan goals: improve independence in daily routines; communicate needs with family and educators.",
      "Kind regards, Tom Ellis, Support Coordinator, Brightpath",
    ],
    fields: [
      { label: "Client name", value: "Leila Haddad", line: 2, confidence: "High" },
      { label: "Date of birth", value: "02/05/2020 (6 yrs)", line: 2, confidence: "High" },
      {
        label: "Services requested",
        value: "Occupational Therapy, Speech Pathology",
        line: 2,
        confidence: "High",
      },
      { label: "Funding", value: "NDIS, plan-managed", line: 3, confidence: "High" },
      { label: "NDIS number", value: "431 882 905", line: 3, confidence: "High" },
      {
        label: "Plan dates",
        value: `${dt("1 Aug 2026")} – ${dt("31 Jul 2027")}`,
        line: 3,
        confidence: "High",
      },
      { label: "Plan manager", value: "Clearview Plan Partners", line: 3, confidence: "High" },
      {
        label: "Presenting needs",
        value: "Delayed speech; dressing and toileting routines; sensory sensitivities",
        line: 4,
        confidence: "High",
      },
      {
        label: "Primary contact",
        value: "Rana Haddad (mother) · 0412 555 018",
        line: 5,
        confidence: "High",
      },
      {
        label: "Visit preference",
        value: "Home visits, afternoons · Kedron (Brisbane North)",
        line: 5,
        confidence: "Check",
      },
      {
        label: "Plan goals",
        value: "Independence in daily routines; communicating needs with family and educators",
        line: 7,
        confidence: "High",
      },
      {
        label: "Referrer",
        value: "Tom Ellis, Support Coordinator, Brightpath",
        line: 8,
        confidence: "High",
      },
    ],
    missing: [
      "Consent to share information with the early learning centre",
      "Copy of the NDIS plan (capacity building budget)",
      "Street address (only the suburb was given)",
    ],
    suggestedClinician:
      "Emma Clarke (OT, Brisbane North, ≈6.5 units free) with Liam Patel (Speech)",
    requestEmail:
      "Hi Tom,\n\nThank you for referring Leila Haddad. To book her first home visit we need:\n• signed consent to share information with Kedron Early Learning\n• a copy of Leila's NDIS plan (capacity building budget)\n• the family's street address\n\nOnce we have these we'll contact Rana to arrange an afternoon visit.\n\nKind regards,\nMedisense Intake",
  },
  {
    id: "arthur-bennett",
    client: "Arthur Bennett",
    age: 81,
    funding: "Aged care",
    services: "Occupational Therapy · home safety and falls prevention",
    region: "Brisbane North",
    suburb: "Wavell Heights",
    source: "GP letter",
    sourceDetail: "GP referral letter (PDF), Nundah Medical Centre",
    received: `${dt("Mon 19 Oct")}, 11:20 am`,
    ageHours: 23,
    status: "Missing information",
    document: [
      "Dear Medisense,",
      "Re: Arthur Bennett, DOB 14/09/1945, 22 Rose St, Wavell Heights.",
      "Please assess Mr Bennett for home safety and falls prevention.",
      `He had a fall in the bathroom on ${dt("2 October")}; no fracture.`,
      "He lives alone and his son visits weekly.",
      "He has been assessed by My Aged Care; funding details to follow.",
      "Regards, Dr S. Patel, Nundah Medical Centre",
    ],
    fields: [
      { label: "Client name", value: "Arthur Bennett", line: 2, confidence: "High" },
      { label: "Date of birth", value: "14/09/1945 (81 yrs)", line: 2, confidence: "High" },
      {
        label: "Address",
        value: "22 Rose St, Wavell Heights (Brisbane North)",
        line: 2,
        confidence: "High",
      },
      {
        label: "Services requested",
        value: "OT home safety and falls prevention",
        line: 3,
        confidence: "High",
      },
      {
        label: "Recent history",
        value: `Bathroom fall on ${dt("2 Oct")}, no fracture`,
        line: 4,
        confidence: "High",
      },
      {
        label: "Living situation",
        value: "Lives alone; son visits weekly",
        line: 5,
        confidence: "High",
      },
      {
        label: "Funding",
        value: "Aged care, classification not yet known",
        line: 6,
        confidence: "Check",
      },
      {
        label: "Referrer",
        value: "Dr S. Patel, Nundah Medical Centre",
        line: 7,
        confidence: "High",
      },
    ],
    missing: [
      "Support at Home classification and funding level",
      "My Aged Care ID",
      "Son's name and phone number (next of kin)",
    ],
    suggestedClinician: "Grace Liu (Senior OT, Brisbane North)",
    requestEmail:
      "Dear Dr Patel,\n\nThank you for referring Mr Arthur Bennett. Before we book his home safety assessment, could you or the family send:\n• his My Aged Care ID\n• his Support at Home classification\n• his son's contact details\n\nKind regards,\nMedisense Intake",
  },
  {
    id: "isla-murphy-sp",
    client: "Isla Murphy",
    age: 5,
    funding: "NDIS",
    services: "Speech Pathology",
    region: "Brisbane North",
    suburb: "Stafford",
    source: "Web form",
    sourceDetail: "Medisense website referral form",
    received: `${dt("Tue 20 Oct")}, 8:05 am`,
    ageHours: 2,
    status: "Possible duplicate",
    document: [
      "Child name: Isla Murphy",
      "Date of birth: 14/03/2021",
      "Parent: Claire Murphy, 0433 210 774",
      "Service: Speech pathology",
      "Funding: NDIS (self-managed)",
      "Concern: speech clarity, gets frustrated when not understood",
    ],
    fields: [
      { label: "Client name", value: "Isla Murphy", line: 1, confidence: "High" },
      { label: "Date of birth", value: "14/03/2021 (5 yrs)", line: 2, confidence: "High" },
      {
        label: "Primary contact",
        value: "Claire Murphy (parent) · 0433 210 774",
        line: 3,
        confidence: "High",
      },
      { label: "Services requested", value: "Speech Pathology", line: 4, confidence: "High" },
      { label: "Funding", value: "NDIS, self-managed", line: 5, confidence: "High" },
      {
        label: "Presenting needs",
        value: "Speech clarity; frustration when not understood",
        line: 6,
        confidence: "High",
      },
    ],
    missing: [],
    duplicate: {
      client: "Isla Murphy (existing client, OT with Sarah Thompson)",
      reason: "Same name, date of birth and parent phone number",
    },
    suggestedClinician: "Liam Patel (Speech, Brisbane North)",
  },
  {
    id: "hamza-ali",
    client: "Hamza Ali",
    age: 4,
    funding: "NDIS",
    services: "Speech Pathology",
    region: "Brisbane South",
    suburb: "Sunnybank",
    source: "Web form",
    sourceDetail: "Medisense website referral form",
    received: `${dt("Tue 20 Oct")}, 7:40 am`,
    ageHours: 3,
    status: "New",
    document: [
      "Child name: Hamza Ali",
      "Date of birth: 19/06/2022",
      "Parent: Sana Ali, 0421 908 336",
      "Service: Speech pathology",
      "Funding: NDIS (agency-managed)",
      "Concern: limited words for his age; early childhood partner recommended therapy",
    ],
    fields: [
      { label: "Client name", value: "Hamza Ali", line: 1, confidence: "High" },
      { label: "Date of birth", value: "19/06/2022 (4 yrs)", line: 2, confidence: "High" },
      {
        label: "Primary contact",
        value: "Sana Ali (parent) · 0421 908 336",
        line: 3,
        confidence: "High",
      },
      { label: "Services requested", value: "Speech Pathology", line: 4, confidence: "High" },
      { label: "Funding", value: "NDIS, agency-managed", line: 5, confidence: "High" },
      {
        label: "Presenting needs",
        value: "Limited expressive vocabulary for age",
        line: 6,
        confidence: "High",
      },
    ],
    missing: ["NDIS number", "Suburb confirmed as Sunnybank from phone area only"],
    suggestedClinician: "Aisha Karim (Speech, Brisbane South)",
    requestEmail:
      "Hi Sana,\n\nThank you for contacting Medisense about Hamza. Could you reply with Hamza's NDIS number and your home address so we can arrange a home visit?\n\nKind regards,\nMedisense Intake",
  },
  {
    id: "tom-reyes",
    client: "Tom Reyes",
    age: 34,
    funding: "NDIS",
    services: "Occupational Therapy · daily living skills",
    region: "Brisbane South",
    suburb: "Moorooka",
    source: "Phone intake",
    sourceDetail: "Phone call, notes typed by admin",
    received: `${dt("Fri 16 Oct")}, 2:15 pm`,
    ageHours: 92,
    status: "Ready to create",
    document: [
      "Caller: Tom Reyes, self-referral, 0438 772 104",
      "DOB 30/11/1991, lives in Moorooka",
      "NDIS participant 430 556 201, psychosocial disability, plan-managed",
      "Wants help with cooking and keeping a weekly routine",
      "Prefers telehealth first, then home visits",
    ],
    fields: [
      { label: "Client name", value: "Tom Reyes", line: 1, confidence: "High" },
      { label: "Date of birth", value: "30/11/1991 (34 yrs)", line: 2, confidence: "High" },
      { label: "Funding", value: "NDIS, plan-managed", line: 3, confidence: "High" },
      { label: "NDIS number", value: "430 556 201", line: 3, confidence: "High" },
      {
        label: "Presenting needs",
        value: "Meal preparation; weekly routine",
        line: 4,
        confidence: "High",
      },
      {
        label: "Visit preference",
        value: "Telehealth first, then home visits",
        line: 5,
        confidence: "High",
      },
    ],
    missing: [],
    suggestedClinician: "Ben Holloway (OT, Brisbane South)",
  },
  {
    id: "doris-kemp",
    client: "Doris Kemp",
    age: 74,
    funding: "Aged care",
    services: "Occupational Therapy · equipment prescription",
    region: "Brisbane South",
    suburb: "Holland Park",
    source: "Email",
    sourceDetail: "Email from aged care assessor",
    received: `${dt("Thu 15 Oct")}, 10:05 am`,
    ageHours: 120,
    status: "Profile created",
    document: [
      "Referral for Doris Kemp, DOB 02/02/1952, Holland Park.",
      "Support at Home classification confirmed; requires shower chair and bed rail assessment.",
      "Daughter Jane Kemp is the contact, 0407 118 450.",
    ],
    fields: [
      { label: "Client name", value: "Doris Kemp", line: 1, confidence: "High" },
      { label: "Date of birth", value: "02/02/1952 (74 yrs)", line: 1, confidence: "High" },
      { label: "Services requested", value: "Equipment prescription", line: 2, confidence: "High" },
      {
        label: "Primary contact",
        value: "Jane Kemp (daughter) · 0407 118 450",
        line: 3,
        confidence: "High",
      },
    ],
    missing: [],
    suggestedClinician: "Daniel Okafor (OT, Brisbane South)",
  },
  {
    id: "oscar-lin",
    client: "Oscar Lin",
    age: 9,
    funding: "NDIS",
    services: "Occupational Therapy · handwriting",
    region: "Brisbane South",
    suburb: "Mount Gravatt",
    source: "School letter",
    sourceDetail: "Letter from school learning support teacher",
    received: `${dt("Mon 12 Oct")}, 3:30 pm`,
    ageHours: 211,
    status: "First visit booked",
    document: [
      "Oscar Lin (Year 4) has difficulty with handwriting speed and legibility.",
      "Parents Wei and Mei Lin consent to this referral.",
      "NDIS plan in place; family will provide details.",
    ],
    fields: [
      { label: "Client name", value: "Oscar Lin", line: 1, confidence: "High" },
      {
        label: "Presenting needs",
        value: "Handwriting speed and legibility",
        line: 1,
        confidence: "High",
      },
      { label: "Consent", value: "Parents consent to referral", line: 2, confidence: "High" },
    ],
    missing: [],
    suggestedClinician: `Daniel Okafor (OT) · first visit ${dt("Thu 22 Oct")}`,
  },
];

export const referralStages: ReferralStatus[][] = [
  ["New", "Needs verification", "Missing information", "Possible duplicate", "Info requested"],
  ["Ready to create"],
  ["Profile created", "Merged"],
  ["First visit booked"],
];

export const stageLabels = [
  "Awaiting verification",
  "Verified",
  "Profile created",
  "First visit booked",
];

export function referralById(id: string) {
  return referrals.find((r) => r.id === id);
}

/** Breaks pasted text into numbered lines, so each extracted detail can point back to its source. */
export function referralLines(text: string) {
  return text
    .split(/\r?\n/)
    .flatMap((line) => (line.length > 220 ? line.split(/(?<=[.!?])\s+/) : [line]))
    .map((line) => line.trim())
    .filter(Boolean)
    .slice(0, 60);
}

/** What the seeded referrals show if a live read of them fails. */
export function seedExtraction(r: Referral): ReferralExtraction {
  return {
    client: r.client,
    age: r.age,
    funding: r.funding,
    services: r.services,
    suburb: r.suburb,
    contactName: "",
    contactPhone: "",
    fields: r.fields,
    missing: r.missing,
    requestEmail: r.requestEmail ?? "",
  };
}

/** A fictional referral for demonstrating intake without typing one. */
export const sampleReferralText = `Hello Medisense team,
Please accept this referral for Theo Marsden, aged 7, who lives in Nundah.
Theo is an NDIS participant and his plan is self-managed.
His school has raised concerns about handwriting, attention at the desk and getting ready for the day.
We are requesting an occupational therapy assessment, preferably at home after school.
His dad is Paul Marsden, phone 0400 555 217.
Thanks, Dana Whitfield, Support Coordinator, Northside Supports`;

/** Used only if a live read of the sample above fails, never for text a person typed. */
export const preparedSampleExtraction: ReferralExtraction = {
  client: "Theo Marsden",
  age: 7,
  funding: "NDIS",
  services: "Occupational Therapy",
  suburb: "Nundah",
  contactName: "Paul Marsden",
  contactPhone: "0400 555 217",
  fields: [
    { label: "Client name", value: "Theo Marsden", line: 2, confidence: "High" },
    { label: "Age", value: "7", line: 2, confidence: "High" },
    { label: "Suburb", value: "Nundah", line: 2, confidence: "High" },
    { label: "Funding", value: "NDIS, self-managed", line: 3, confidence: "High" },
    {
      label: "Concerns",
      value: "Handwriting, attention at the desk, getting ready for the day",
      line: 4,
      confidence: "High",
    },
    { label: "Service", value: "Occupational therapy assessment", line: 5, confidence: "High" },
    { label: "Visit preference", value: "At home after school", line: 5, confidence: "High" },
    { label: "Contact", value: "Paul Marsden (father), 0400 555 217", line: 6, confidence: "High" },
  ],
  missing: ["NDIS participant number", "Date of birth", "Plan start and end dates"],
  requestEmail: `Hi Dana,

Thanks for referring Theo Marsden. Before we book a first visit, could you please send us:

- Theo's NDIS participant number
- His date of birth
- His plan start and end dates

Kind regards,
Medisense intake team`,
};
