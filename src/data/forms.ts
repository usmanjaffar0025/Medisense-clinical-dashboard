import { dt, wd } from "@/lib/clock";
export type FieldSource =
  "Client profile" | "Approved note" | "Referral" | "NDIS plan" | "Documents" | "Medisense policy";

export type FormField = {
  id: string;
  label: string;
  /** Pre-filled value, or empty when the AI could not find it in verified data. */
  value: string;
  source: FieldSource | null;
  /** Detail of where the value came from, e.g. the note date. */
  sourceDetail?: string;
  required: boolean;
  /** Filled but worth a human check before submission. */
  check?: string;
  multiline?: boolean;
};

export type FormDraft = {
  id: string;
  template: string;
  client: string;
  funding: "NDIS" | "Aged care";
  purpose: string;
  /** The first submission attempt fails, to show exception handling. */
  failFirstSubmission?: boolean;
  fields: FormField[];
};

export const formDrafts: FormDraft[] = [
  {
    id: "home-mod-ruth",
    template: "Home modification funding request",
    client: "Ruth Hallam",
    funding: "Aged care",
    purpose: `Grab rails and shower chair after the ${dt("6 Oct")} home assessment`,
    fields: [
      {
        id: "name",
        label: "Client name",
        value: "Ruth Hallam",
        source: "Client profile",
        required: true,
      },
      {
        id: "dob",
        label: "Date of birth",
        value: "03/07/1948",
        source: "Client profile",
        required: true,
      },
      {
        id: "address",
        label: "Home address",
        value: "14 Kitchener Rd, Ascot QLD 4007",
        source: "Client profile",
        required: true,
      },
      {
        id: "mac-id",
        label: "My Aged Care ID",
        value: "AC 5512 0937",
        source: "Referral",
        sourceDetail: `Referral, ${dt("Jun 2025")}`,
        required: true,
      },
      {
        id: "classification",
        label: "Support at Home classification",
        value: "",
        source: null,
        required: true,
      },
      {
        id: "assessed",
        label: "Assessment date",
        value: dt("6 Oct 2026"),
        source: "Approved note",
        sourceDetail: `Note, ${dt("6 Oct")}`,
        required: true,
      },
      {
        id: "clinician",
        label: "Assessing clinician",
        value: "Sarah Thompson, Occupational Therapist",
        source: "Approved note",
        sourceDetail: `Note, ${dt("6 Oct")}`,
        required: true,
      },
      {
        id: "findings",
        label: "Functional findings",
        value:
          "18 cm step into the shower. Relies on the towel rail for support during transfers. Two near falls in the last month, reported by daughter.",
        source: "Approved note",
        sourceDetail: `Note, ${dt("6 Oct")}`,
        required: true,
        multiline: true,
      },
      {
        id: "recommendation",
        label: "Recommended modifications",
        value: "Two grab rails (shower and toilet) and a shower chair.",
        source: "Approved note",
        sourceDetail: `Note, ${dt("6 Oct")}`,
        required: true,
        multiline: true,
        check: "Confirm rail positions on site; not recorded in the note",
      },
      { id: "quote", label: "Builder quote", value: "", source: null, required: true },
      {
        id: "consent",
        label: "Client consent",
        value: `Signed ${dt("6 Oct 2026")}`,
        source: "Documents",
        required: true,
      },
    ],
  },
  {
    id: "at-ava",
    template: "Assistive technology request (low cost)",
    client: "Ava Mitchell",
    funding: "NDIS",
    purpose: "Slant board and keyboard training software",
    failFirstSubmission: true,
    fields: [
      {
        id: "name",
        label: "Participant name",
        value: "Ava Mitchell",
        source: "Client profile",
        required: true,
      },
      {
        id: "dob",
        label: "Date of birth",
        value: "21/08/2015",
        source: "Client profile",
        required: true,
      },
      {
        id: "ndis",
        label: "NDIS number",
        value: "430 117 652",
        source: "NDIS plan",
        required: true,
      },
      {
        id: "plan",
        label: "Plan dates",
        value: `${dt("1 Mar 2026")} – ${dt("28 Feb 2027")}`,
        source: "NDIS plan",
        required: true,
      },
      {
        id: "management",
        label: "Plan management",
        value: "Self-managed",
        source: "NDIS plan",
        required: true,
      },
      {
        id: "items",
        label: "Items requested",
        value: "Slant board; keyboard training software",
        source: "Approved note",
        sourceDetail: `Note, ${dt("11 Oct")}`,
        required: true,
      },
      {
        id: "justification",
        label: "Clinical justification",
        value:
          "Handwriting is legible but letter size is inconsistent. Word spacing improved with a spacer tool. Ava preferred writing on a slant board during the trial. Typing speed is about 10 words per minute.",
        source: "Approved note",
        sourceDetail: `Note, ${dt("11 Oct")}`,
        required: true,
        multiline: true,
      },
      {
        id: "goal",
        label: "Linked plan goal",
        value: "Take part in written school tasks",
        source: "NDIS plan",
        required: true,
      },
      {
        id: "quote",
        label: "Supplier quote",
        value: "Officeworks quote QW-22817, $89.00",
        source: "Documents",
        required: true,
      },
      {
        id: "teacher",
        label: "Teacher support letter",
        value: "",
        source: null,
        required: false,
      },
    ],
  },
  {
    id: "agreement-leila",
    template: "NDIS service agreement",
    client: "Leila Haddad",
    funding: "NDIS",
    purpose: `New participant from ${wd("Monday")}'s referral`,
    fields: [
      {
        id: "name",
        label: "Participant name",
        value: "Leila Haddad",
        source: "Referral",
        sourceDetail: `Email, ${dt("19 Oct")}`,
        required: true,
      },
      {
        id: "dob",
        label: "Date of birth",
        value: "02/05/2020",
        source: "Referral",
        sourceDetail: `Email, ${dt("19 Oct")}`,
        required: true,
      },
      {
        id: "ndis",
        label: "NDIS number",
        value: "431 882 905",
        source: "Referral",
        sourceDetail: `Email, ${dt("19 Oct")}`,
        required: true,
      },
      {
        id: "plan",
        label: "Plan dates",
        value: `${dt("1 Aug 2026")} – ${dt("31 Jul 2027")}`,
        source: "Referral",
        sourceDetail: `Email, ${dt("19 Oct")}`,
        required: true,
      },
      {
        id: "manager",
        label: "Plan manager",
        value: "Clearview Plan Partners",
        source: "Referral",
        sourceDetail: `Email, ${dt("19 Oct")}`,
        required: true,
      },
      {
        id: "contact",
        label: "Nominee / contact",
        value: "Rana Haddad (mother), 0412 555 018",
        source: "Referral",
        sourceDetail: `Email, ${dt("19 Oct")}`,
        required: true,
      },
      {
        id: "services",
        label: "Supports",
        value: "Occupational therapy and speech pathology, home visits",
        source: "Referral",
        sourceDetail: `Email, ${dt("19 Oct")}`,
        required: true,
      },
      {
        id: "cancellation",
        label: "Cancellation terms",
        value: "48-hour cancellation policy",
        source: "Medisense policy",
        required: true,
      },
      { id: "start", label: "Start date", value: "", source: null, required: true },
      {
        id: "signature",
        label: "Participant or nominee signature",
        value: "",
        source: null,
        required: true,
      },
    ],
  },
];

export const formTemplates = [
  "NDIS service agreement",
  "Home modification funding request",
  "Assistive technology request (low cost)",
  "Consent to share information",
  "Telehealth consent",
  "Change of circumstances",
];

export function formDraftById(id: string) {
  return formDrafts.find((f) => f.id === id);
}
