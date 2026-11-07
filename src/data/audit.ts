import type { AuditEntry } from "./types";
import { dt } from "@/lib/clock";

/** Activity recorded before the demo starts. Actions taken during the demo are appended. */
export const initialAuditEntries: AuditEntry[] = [
  {
    id: "form-sync-failed",
    day: dt("2026-10-20"),
    time: "10:19",
    actor: "Automation",
    isAi: false,
    action:
      "Sync to practice management system failed (timeout): Assistive technology request (low cost)",
    object: "Ava Mitchell",
  },
  {
    id: "supervision-brief",
    day: dt("2026-10-20"),
    time: "09:15",
    actor: "Medisense AI",
    isAi: true,
    action: "Prepared supervision brief",
    object: `Sarah Thompson, ${dt("22 Oct")}`,
  },
  {
    id: "discussion-item",
    day: dt("2026-10-19"),
    time: "16:20",
    actor: "Grace Liu",
    isAi: false,
    action: "Added discussion item",
    object: "Supervision · Sarah Thompson",
  },
  {
    id: "capacity-recommendation",
    day: dt("2026-10-19"),
    time: "15:02",
    actor: "Medisense AI",
    isAi: true,
    action: "Generated capacity recommendation (not applied)",
    object: "Team capacity",
  },
];

/** Scripted timestamps keep the audit trail in a believable order whichever path the demo takes. */
export const demoActionTimes = {
  noteGenerated: "10:42",
  noteEdited: "10:45",
  noteApproved: "10:46",
  noteRegenerated: "10:44",
  followUpAssigned: "10:52",
  agendaApproved: "10:58",
  capacityReviewed: "11:03",
  capacityDismissed: "11:03",
  reportFinalised: "11:10",
  followUpDone: "11:12",
  tasksCreated: "10:47",
  taskCompleted: "11:15",
  referralRequested: "09:26",
  referralVerified: "09:31",
  formFailed: "10:19",
  formSubmitted: "10:21",
  suggestionAccepted: "11:20",
  reportDrafted: "11:24",
  reminderSent: "11:28",
  automationChanged: "11:32",
  portalMessage: "11:36",
  portalAppointment: "11:37",
  settingChanged: "11:40",
} as const;

export const auditDayLabels: Record<string, string> = {
  [dt("2026-10-20")]: dt("Tuesday 20 Oct 2026"),
  [dt("2026-10-19")]: dt("Monday 19 Oct 2026"),
  [dt("2026-10-21")]: dt("Wednesday 21 Oct 2026"),
};
