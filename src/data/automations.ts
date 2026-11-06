import { ESCALATE_AFTER_DAYS, escalationOwner } from "./tasks";
import { dt } from "@/lib/clock";

export type AutomationCategory =
  "Documentation" | "Follow-ups" | "Intake" | "Reports" | "Compliance" | "Scheduling";

export type AutomationOutput = "Draft for review" | "Creates a task" | "Notifies a person";

export type AutomationRule = {
  id: string;
  name: string;
  category: AutomationCategory;
  trigger: string;
  condition: string;
  action: string;
  output: AutomationOutput;
  enabled: boolean;
  runs30d: number;
  hoursSaved30d: number;
  lastRun: string;
  /** Runs per week, last 12 weeks. */
  weekly: number[];
  custom?: boolean;
};

export const automationCategories: AutomationCategory[] = [
  "Documentation",
  "Follow-ups",
  "Intake",
  "Reports",
  "Compliance",
  "Scheduling",
];

/** Runs per week rising from `start` to `end` with a little variation. */
function weekly(start: number, end: number) {
  const wobble = [0, 1, -1, 0, 1, -1, 1, 0, -1, 1, 0, 0];
  return wobble.map((w, i) => Math.max(0, Math.round(start + ((end - start) * i) / 11) + w));
}

export const automationRules: AutomationRule[] = [
  {
    id: "note-overdue",
    name: "Overdue note reminder with AI draft",
    category: "Documentation",
    trigger: "Session ends without an approved note",
    condition: "Note not approved after 2 days",
    action: "Remind the clinician and prepare an AI draft from their raw notes",
    output: "Draft for review",
    enabled: true,
    runs30d: 64,
    hoursSaved30d: 21,
    lastRun: "Today, 9:02 am",
    weekly: weekly(9, 17),
  },
  {
    id: "task-escalation",
    name: "Escalate overdue tasks",
    category: "Follow-ups",
    trigger: "Task passes its due date",
    condition: `Still open after ${ESCALATE_AFTER_DAYS} days`,
    action: `Escalate to ${escalationOwner} and flag on the Tasks screen`,
    output: "Notifies a person",
    enabled: true,
    runs30d: 23,
    hoursSaved30d: 4,
    lastRun: "Today, 7:00 am",
    weekly: weekly(4, 6),
  },
  {
    id: "no-visit",
    name: "Rebook clients with no recent visit",
    category: "Follow-ups",
    trigger: "Daily caseload check",
    condition: "No appointment for 21 days and nothing booked",
    action: "Create a rebook task for the treating clinician",
    output: "Creates a task",
    enabled: true,
    runs30d: 17,
    hoursSaved30d: 3,
    lastRun: "Today, 7:00 am",
    weekly: weekly(3, 5),
  },
  {
    id: "referral-extract",
    name: "Read new referrals",
    category: "Intake",
    trigger: "Referral arrives by email, web form or upload",
    condition: "Always",
    action: "Extract client details, check for duplicates and list missing information",
    output: "Draft for review",
    enabled: true,
    runs30d: 29,
    hoursSaved30d: 12,
    lastRun: "Today, 8:47 am",
    weekly: weekly(5, 8),
  },
  {
    id: "referral-missing",
    name: "Request missing referral information",
    category: "Intake",
    trigger: "Referral extracted",
    condition: "Required fields missing",
    action: "Draft a request email for the admin team to review and send",
    output: "Draft for review",
    enabled: true,
    runs30d: 11,
    hoursSaved30d: 3,
    lastRun: "Yesterday, 4:15 pm",
    weekly: weekly(2, 3),
  },
  {
    id: "plan-review",
    name: "Prepare for NDIS plan reviews",
    category: "Reports",
    trigger: "Daily plan date check",
    condition: "NDIS plan ends within 60 days",
    action: "Create a report task and an AI draft from approved notes and goals",
    output: "Draft for review",
    enabled: true,
    runs30d: 14,
    hoursSaved30d: 28,
    lastRun: "Today, 7:00 am",
    weekly: weekly(2, 5),
  },
  {
    id: "supervision-brief",
    name: "Prepare supervision briefs",
    category: "Follow-ups",
    trigger: "Supervision session scheduled",
    condition: "Two days before the session",
    action: "Prepare a brief with caseload, notes and open actions for the supervisor",
    output: "Draft for review",
    enabled: true,
    runs30d: 8,
    hoursSaved30d: 6,
    lastRun: "Today, 9:15 am",
    weekly: weekly(2, 2),
  },
  {
    id: "staff-expiry",
    name: "Staff compliance reminders",
    category: "Compliance",
    trigger: "Daily compliance check",
    condition: "Blue Card, screening, registration or first aid expires within 30 days",
    action: "Notify the staff member and the practice manager",
    output: "Notifies a person",
    enabled: true,
    runs30d: 6,
    hoursSaved30d: 2,
    lastRun: "Today, 7:00 am",
    weekly: weekly(1, 2),
  },
  {
    id: "form-retry",
    name: "Retry failed form syncs",
    category: "Intake",
    trigger: "Form submission fails",
    condition: "Up to 3 retries",
    action: "Retry, then alert the admin team with the error",
    output: "Notifies a person",
    enabled: true,
    runs30d: 5,
    hoursSaved30d: 1,
    lastRun: "Today, 10:19 am",
    weekly: weekly(1, 2),
  },
  {
    id: "cancellations",
    name: "Flag repeated cancellations",
    category: "Follow-ups",
    trigger: "Appointment cancelled",
    condition: "Second cancellation within 30 days",
    action: "Add the client to Clients Requiring Attention for review",
    output: "Notifies a person",
    enabled: false,
    runs30d: 0,
    hoursSaved30d: 0,
    lastRun: "Not yet run",
    weekly: Array(12).fill(0) as number[],
  },
  {
    id: "route-reorder",
    name: "Suggest shorter visit routes",
    category: "Scheduling",
    trigger: "Next day's schedule is final",
    condition: "Driving over 90 minutes in the day",
    action: "Suggest a visit order with less driving for the clinician to accept",
    output: "Draft for review",
    enabled: false,
    runs30d: 0,
    hoursSaved30d: 0,
    lastRun: "Not yet run",
    weekly: Array(12).fill(0) as number[],
  },
];

/** Options for the rule builder, with how many current records each trigger would match. */
export const builderTriggers = [
  { id: "note", label: "A session note is not approved", matches: 17, category: "Documentation" },
  { id: "plan", label: "An NDIS plan is ending", matches: 9, category: "Reports" },
  { id: "visit", label: "A client has no upcoming visit", matches: 6, category: "Follow-ups" },
  { id: "referral", label: "A referral arrives", matches: 7, category: "Intake" },
  { id: "expiry", label: "A staff check is expiring", matches: 4, category: "Compliance" },
] as const;

export const builderConditions = [
  "after 2 days",
  "within 30 days",
  "within 60 days",
  "and the client is High priority",
  "and the clinician is At Risk",
];

export const builderActions: { label: string; output: AutomationOutput }[] = [
  { label: "Prepare an AI draft for review", output: "Draft for review" },
  { label: "Create a task for the clinician", output: "Creates a task" },
  { label: "Create a task for the admin team", output: "Creates a task" },
  { label: "Notify the clinical supervisor", output: "Notifies a person" },
];

export const recentRuns = [
  {
    time: "10:19",
    rule: "Retry failed form syncs",
    object: "Ava Mitchell · AT request",
    outcome: "Retrying (1 of 3)",
  },
  {
    time: "09:15",
    rule: "Prepare supervision briefs",
    object: `Sarah Thompson · ${dt("22 Oct")}`,
    outcome: "Draft ready for Grace Liu",
  },
  {
    time: "09:02",
    rule: "Overdue note reminder with AI draft",
    object: "4 notes · Sarah Thompson",
    outcome: "4 drafts prepared",
  },
  {
    time: "08:47",
    rule: "Read new referrals",
    object: "Leila Haddad",
    outcome: "Extracted · 2 items missing",
  },
  {
    time: "07:00",
    rule: "Escalate overdue tasks",
    object: "6 tasks",
    outcome: `Escalated to ${escalationOwner}`,
  },
  {
    time: "07:00",
    rule: "Rebook clients with no recent visit",
    object: "James Thompson",
    outcome: "Task created for Sarah Thompson",
  },
  {
    time: "07:00",
    rule: "Prepare for NDIS plan reviews",
    object: "Emily Carter",
    outcome: "Report draft prepared",
  },
  {
    time: "07:00",
    rule: "Staff compliance reminders",
    object: "Liam Patel · Blue Card",
    outcome: "Reminder sent",
  },
];
