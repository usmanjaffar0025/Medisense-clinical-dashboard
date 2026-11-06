import type { Role } from "@/lib/navigation";
import { dt } from "@/lib/clock";

export const permissionRoles: Role[] = ["Leadership", "Admin", "Supervisor", "Clinician"];

export type Permission = {
  id: string;
  label: string;
  detail: string;
  /** Default access per role. */
  roles: Record<Role, boolean>;
  /** Locked permissions cannot be changed in the demo; they protect clinical safety. */
  locked?: boolean;
};

export const permissions: Permission[] = [
  {
    id: "view-all",
    label: "See all caseloads",
    detail: "Every clinician's clients and workload",
    roles: { Leadership: true, Admin: true, Supervisor: true, Clinician: false },
  },
  {
    id: "view-own",
    label: "See own caseload",
    detail: "Clients the person treats",
    roles: { Leadership: true, Admin: true, Supervisor: true, Clinician: true },
    locked: true,
  },
  {
    id: "clinical-notes",
    label: "Read clinical notes",
    detail: "Full session notes and assessments",
    roles: { Leadership: false, Admin: false, Supervisor: true, Clinician: true },
  },
  {
    id: "approve-notes",
    label: "Approve AI drafts",
    detail: "Notes and reports become part of the record",
    roles: { Leadership: false, Admin: false, Supervisor: true, Clinician: true },
    locked: true,
  },
  {
    id: "intake",
    label: "Process referrals and forms",
    detail: "Verify AI extraction, submit forms",
    roles: { Leadership: true, Admin: true, Supervisor: false, Clinician: false },
  },
  {
    id: "automations",
    label: "Change automation rules",
    detail: "Turn rules on or off and create new ones",
    roles: { Leadership: true, Admin: false, Supervisor: false, Clinician: false },
  },
  {
    id: "compliance",
    label: "Manage staff compliance",
    detail: "Blue Card, screening, registration dates",
    roles: { Leadership: true, Admin: true, Supervisor: false, Clinician: false },
  },
  {
    id: "audit",
    label: "View the audit trail",
    detail: "Every AI output and human decision",
    roles: { Leadership: true, Admin: false, Supervisor: true, Clinician: false },
  },
  {
    id: "export",
    label: "Export data",
    detail: "Reports and CSV downloads",
    roles: { Leadership: true, Admin: true, Supervisor: false, Clinician: false },
  },
  {
    id: "portal",
    label: "Manage the family portal",
    detail: "What families can see and do",
    roles: { Leadership: true, Admin: false, Supervisor: false, Clinician: true },
  },
];

export const aiGuardrails = [
  {
    id: "approval",
    label: "A person approves every AI draft",
    detail: "Notes, reports, emails and forms stay drafts until a named person approves them.",
    on: true,
    locked: true,
  },
  {
    id: "no-send",
    label: "AI never contacts clients or families",
    detail: "Messages are drafted for staff to review and send.",
    on: true,
    locked: true,
  },
  {
    id: "sources",
    label: "Show sources on every AI output",
    detail: "Each draft lists the approved records it was built from.",
    on: true,
  },
  {
    id: "redact",
    label: "Remove names and contact details before AI processing",
    detail: "Identifiers are replaced with placeholders and restored after.",
    on: true,
  },
  {
    id: "no-training",
    label: "Client data is never used to train AI models",
    detail: "Covered by the AI provider's commercial terms.",
    on: true,
    locked: true,
  },
  {
    id: "diagnosis",
    label: "AI may suggest diagnoses",
    detail: "Off by default; clinical judgement stays with clinicians.",
    on: false,
  },
];

export type Integration = {
  id: string;
  name: string;
  detail: string;
  status: "Connected" | "Available";
  lastSync?: string;
  direction: string;
};

/** Kept generic: the demo does not name Medisense's current software. */
export const integrations: Integration[] = [
  {
    id: "pms",
    name: "Practice management system",
    detail: "Clients, appointments, notes and invoices",
    status: "Connected",
    lastSync: "Synced 4 min ago",
    direction: "Reads and writes approved records",
  },
  {
    id: "email",
    name: "Email & calendar",
    detail: "Referral inbox and clinician calendars",
    status: "Connected",
    lastSync: "Synced 2 min ago",
    direction: "Reads referrals, drafts replies",
  },
  {
    id: "web-form",
    name: "Website referral form",
    detail: "Referrals from medisense.com.au",
    status: "Connected",
    lastSync: "Last referral 8:47 am",
    direction: "Receives new referrals",
  },
  {
    id: "sms",
    name: "SMS reminders",
    detail: "Appointment reminders and confirmations",
    status: "Available",
    direction: "Sends approved reminders",
  },
  {
    id: "ndis",
    name: "NDIS claims export",
    detail: "Claim files for the NDIS portal",
    status: "Available",
    direction: "Exports delivered sessions",
  },
  {
    id: "accounting",
    name: "Accounting software",
    detail: "Invoices and payments",
    status: "Available",
    direction: "Exports invoices",
  },
];

export const securityFacts = [
  { label: "Data location", value: "Australia", detail: "Hosted in Sydney; backups stay onshore" },
  {
    label: "Sign-in",
    value: "MFA required",
    detail: "Single sign-on with your Microsoft or Google accounts",
  },
  { label: "Encryption", value: "In transit & at rest", detail: "TLS 1.2+ and AES-256" },
  { label: "Audit retention", value: "7 years", detail: "Every AI output and decision" },
  { label: "Session timeout", value: "30 min", detail: "Idle sessions sign out automatically" },
];

export const staffAccess = [
  { name: "Neil Hensley", role: "Leadership" as Role, lastActive: "Today, 10:52 am", mfa: true },
  { name: "Grace Liu", role: "Supervisor" as Role, lastActive: "Today, 10:58 am", mfa: true },
  { name: "Admin team (2)", role: "Admin" as Role, lastActive: "Today, 10:21 am", mfa: true },
  { name: "Sarah Thompson", role: "Clinician" as Role, lastActive: "Today, 10:46 am", mfa: true },
  { name: "Hannah Wright", role: "Clinician" as Role, lastActive: "Today, 11:12 am", mfa: true },
  { name: "Jessica Nguyen", role: "Clinician" as Role, lastActive: "Today, 9:40 am", mfa: true },
  { name: "Marcus Bell", role: "Clinician" as Role, lastActive: "Yesterday, 5:02 pm", mfa: true },
  { name: "Aisha Karim", role: "Clinician" as Role, lastActive: dt("Mon 12 Oct"), mfa: false },
];
