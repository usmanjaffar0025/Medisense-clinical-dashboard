import type { ReferralStatus } from "@/data/referrals";
import type { ReportStatus } from "@/data/reports-library";
import type { Task } from "@/data/tasks";
import type { AuditEntry } from "@/data/types";
import type { Role } from "@/lib/navigation";
import type { CaseNoteMode, FormState } from "@/state/demo-store";

/**
 * What has changed during the demo, sent with each question so answers reflect it. The static
 * demo data is read directly by the tools; this carries only the presenter's actions.
 */
export type LiveState = {
  role: Role;
  tasks: Task[];
  referralStatus: Record<string, ReferralStatus>;
  noteModes: Record<string, CaseNoteMode | undefined>;
  forms: Record<string, FormState>;
  suggestions: Record<string, "accepted" | "dismissed">;
  reminders: string[];
  reports: Record<string, ReportStatus>;
  reportApproved: boolean;
  automations: Record<string, boolean>;
  audit: AuditEntry[];
};

export type AnswerItem = { label: string; detail: string; href?: string };

export type Answer = {
  title: string;
  intro: string;
  items: AnswerItem[];
  draft?: string;
  sources: string[];
};
