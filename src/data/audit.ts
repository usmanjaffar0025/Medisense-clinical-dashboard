import type { AuditEntry } from "./types";

/** Activity recorded before the demo starts. Actions taken during the demo are appended. */
export const initialAuditEntries: AuditEntry[] = [
  {
    id: "supervision-brief",
    day: "2026-10-20",
    time: "09:15",
    actor: "Medisense AI",
    isAi: true,
    action: "Prepared supervision brief",
    object: "Sarah Thompson, 22 Oct",
  },
  {
    id: "discussion-item",
    day: "2026-10-19",
    time: "16:20",
    actor: "Grace Liu",
    isAi: false,
    action: "Added discussion item",
    object: "Supervision · Sarah Thompson",
  },
  {
    id: "capacity-recommendation",
    day: "2026-10-19",
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
} as const;

export const auditDayLabels: Record<AuditEntry["day"], string> = {
  "2026-10-20": "Tuesday 20 Oct 2026",
  "2026-10-19": "Monday 19 Oct 2026",
};
