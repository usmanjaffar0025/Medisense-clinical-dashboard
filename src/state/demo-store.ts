import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import { demoActionTimes, initialAuditEntries } from "@/data/audit";
import { automationRules, type AutomationRule } from "@/data/automations";
import { expiryItems } from "@/data/admin-operations";
import { caseNoteById, caseNotes, noteText } from "@/data/case-note";
import { portalFamily, portalSettings, type PortalSettingId } from "@/data/portal";
import { libraryReports, type ReportStatus } from "@/data/reports-library";
import { aiGuardrails, integrations, permissions } from "@/data/settings";
import { scheduleSuggestions } from "@/data/schedule";
import { suggestedAgenda } from "@/data/supervision";
import { formDraftById, formDrafts } from "@/data/forms";
import { referralById, referrals, type ReferralStatus } from "@/data/referrals";
import { seedTasks, type SuggestedTask, type Task } from "@/data/tasks";
import type { AuditEntry } from "@/data/types";
import type { Role } from "@/lib/navigation";
import type { StructuredNote } from "@/lib/ai/case-note-contract";
import { dt } from "@/lib/clock";

export type CaseNoteMode = "empty" | "generating" | "draft" | "edit" | "approved";

export type CaseNoteDraft = {
  summary: string;
  interventions: string;
  observations: string;
  nextActions: string;
};

export type CaseNoteGeneration = {
  source: "live" | "scripted";
  model: string | null;
  latencyMs: number | null;
  /** 1-based raw note line paired with the first summary sentence. */
  pairedLine: number | null;
  notice: string | null;
  subjective: string[];
  missingInformation: string[];
};

export type CaseNoteState = {
  mode: CaseNoteMode;
  rawNotes: string;
  draft: CaseNoteDraft;
  changes: number;
  generation: CaseNoteGeneration | null;
  error: string | null;
  tasksCreated: number;
};

export type FormStatus = "draft" | "error" | "submitted";

export type FormState = {
  values: Record<string, string>;
  status: FormStatus;
  attempts: number;
};

export type PortalMessage = { from: string; at: string; text: string };

export type RecommendationState = "pending" | "reviewed" | "dismissed";

export type FollowUpAssignment = {
  clientId: string;
  client: string;
  assignee: string;
  due: string;
  reason: string;
  note: string;
};

const emptyDraft: CaseNoteDraft = {
  summary: "",
  interventions: "",
  observations: "",
  nextActions: "",
};

function toDraft(note: StructuredNote): CaseNoteDraft {
  return {
    summary: note.summary,
    interventions: note.interventions.join("\n"),
    observations: note.observations.join("\n"),
    nextActions: note.nextActions.join("\n"),
  };
}

type DemoState = {
  /** One entry per case note sample, keyed by client id. */
  caseNotes: Record<string, CaseNoteState>;
  followUps: FollowUpAssignment[];
  agenda: { included: boolean[]; approved: boolean };
  recommendation: RecommendationState;
  report: { reviewed: boolean; approved: boolean };
  myDayFollowUpDone: boolean;
  tasks: Task[];
  referrals: Record<string, ReferralStatus>;
  forms: Record<string, FormState>;
  /** Schedule suggestions the presenter accepted or dismissed. */
  suggestions: Record<string, "accepted" | "dismissed">;
  reports: Record<string, ReportStatus>;
  /** Expiry items a reminder has been sent for. */
  reminders: string[];
  automations: Record<string, boolean>;
  customRules: AutomationRule[];
  portalMessages: PortalMessage[];
  portalSettings: Record<PortalSettingId, boolean>;
  portalAppointment: "pending" | "confirmed" | "change-requested";
  /** Permission cells changed from their defaults, keyed `${permissionId}:${role}`. */
  permissionOverrides: Record<string, boolean>;
  guardrails: Record<string, boolean>;
  connected: string[];
  /** The role view the presenter picked; drives the sidebar and the assistant. */
  role: Role;
  audit: AuditEntry[];
};

type DemoActions = {
  setRawNotes: (id: string, text: string) => void;
  resetRawNotes: (id: string) => void;
  beginGeneration: (id: string) => void;
  completeGeneration: (id: string, note: StructuredNote, generation: CaseNoteGeneration) => void;
  failGeneration: (id: string, error: string) => void;
  editNote: (id: string) => void;
  saveNote: (id: string, draft: CaseNoteDraft) => void;
  cancelNoteEdit: (id: string) => void;
  approveNote: (id: string) => void;
  assignFollowUp: (assignment: FollowUpAssignment) => void;
  toggleAgendaItem: (index: number) => void;
  approveAgenda: () => void;
  regenerateAgenda: () => void;
  reviewRecommendation: () => void;
  dismissRecommendation: () => void;
  setReportReviewed: (reviewed: boolean) => void;
  approveReport: () => void;
  regenerateReport: () => void;
  completeMyDayFollowUp: () => void;
  createTasksFromNote: (id: string, tasks: SuggestedTask[]) => void;
  completeTask: (taskId: string) => void;
  requestReferralInfo: (id: string) => void;
  verifyReferral: (id: string) => void;
  mergeReferral: (id: string) => void;
  setFormValue: (formId: string, fieldId: string, value: string) => void;
  submitForm: (formId: string) => void;
  acceptSuggestion: (id: string) => void;
  dismissSuggestion: (id: string) => void;
  draftReport: (id: string) => void;
  sendReminders: (ids: string[]) => void;
  toggleAutomation: (id: string) => void;
  addAutomation: (rule: AutomationRule) => void;
  sendPortalMessage: (text: string) => void;
  togglePortalSetting: (id: PortalSettingId) => void;
  respondToAppointment: (response: "confirmed" | "change-requested") => void;
  togglePermission: (permissionId: string, role: Role) => void;
  toggleGuardrail: (id: string) => void;
  connectIntegration: (id: string) => void;
  setRole: (role: Role) => void;
  resetDemo: () => void;
};

const initialState: DemoState = {
  caseNotes: Object.fromEntries(
    caseNotes.map((c) => [
      c.id,
      {
        mode: "empty",
        rawNotes: noteText(c),
        draft: emptyDraft,
        changes: 0,
        generation: null,
        error: null,
        tasksCreated: 0,
      } satisfies CaseNoteState,
    ]),
  ),
  followUps: [],
  agenda: { included: suggestedAgenda.map(() => true), approved: false },
  recommendation: "pending",
  report: { reviewed: false, approved: false },
  myDayFollowUpDone: false,
  tasks: seedTasks,
  referrals: Object.fromEntries(referrals.map((r) => [r.id, r.status])),
  forms: Object.fromEntries(
    formDrafts.map((f) => [
      f.id,
      {
        values: Object.fromEntries(f.fields.map((field) => [field.id, field.value])),
        status: "draft",
        attempts: 0,
      } satisfies FormState,
    ]),
  ),
  suggestions: {},
  reports: Object.fromEntries(libraryReports.map((r) => [r.id, r.status])),
  reminders: [],
  automations: Object.fromEntries(automationRules.map((r) => [r.id, r.enabled])),
  customRules: [],
  portalMessages: portalFamily.messages,
  portalSettings: Object.fromEntries(portalSettings.map((s) => [s.id, true])) as Record<
    PortalSettingId,
    boolean
  >,
  portalAppointment: "pending",
  permissionOverrides: {},
  guardrails: Object.fromEntries(aiGuardrails.map((g) => [g.id, g.on])),
  connected: integrations.filter((i) => i.status === "Connected").map((i) => i.id),
  role: "Leadership",
  audit: initialAuditEntries,
};

function entry(id: string, time: string, actor: string, action: string, object: string) {
  return {
    id: `${id}-${Date.now()}`,
    day: dt("2026-10-20"),
    time,
    actor,
    isAi: actor === "Medisense AI",
    action,
    object,
  } satisfies AuditEntry;
}

function countChanges(before: CaseNoteDraft, after: CaseNoteDraft) {
  return (Object.keys(before) as (keyof CaseNoteDraft)[]).filter(
    (key) => before[key].trim() !== after[key].trim(),
  ).length;
}

function noteObject(id: string) {
  const sample = caseNoteById(id);
  return sample ? `${sample.client}, session ${sample.sessionDate}` : id;
}

/** Spaces scripted timestamps a few minutes apart per case so the audit trail reads in order. */
function at(time: string, id: string) {
  const index = Math.max(
    caseNotes.findIndex((c) => c.id === id),
    0,
  );
  const [h = 0, m = 0] = time.split(":").map(Number);
  const total = h * 60 + m + index * 7;
  return `${String(Math.floor(total / 60)).padStart(2, "0")}:${String(total % 60).padStart(2, "0")}`;
}

function patchNote(
  notes: Record<string, CaseNoteState>,
  id: string,
  change: (note: CaseNoteState) => Partial<CaseNoteState>,
) {
  const current = notes[id];
  if (!current) return notes;
  return { ...notes, [id]: { ...current, ...change(current) } };
}

/**
 * Demo progress survives a page refresh within the same tab, so a presenter can reload
 * without losing approvals. Rehydration is deferred to the client to keep SSR output stable.
 */
export const useDemoStore = create<DemoState & DemoActions>()(
  persist(
    (set, get) => ({
      ...initialState,

      setRawNotes: (id, text) =>
        set((s) => ({ caseNotes: patchNote(s.caseNotes, id, () => ({ rawNotes: text })) })),

      resetRawNotes: (id) =>
        set((s) => {
          const sample = caseNoteById(id);
          return {
            caseNotes: patchNote(s.caseNotes, id, () => ({
              rawNotes: sample ? noteText(sample) : "",
              error: null,
            })),
          };
        }),

      beginGeneration: (id) =>
        set((s) => ({
          caseNotes: patchNote(s.caseNotes, id, () => ({ mode: "generating", error: null })),
        })),

      completeGeneration: (id, note, generation) =>
        set((s) => {
          const regenerated = Boolean(s.caseNotes[id]?.generation);
          const via =
            generation.source === "live"
              ? ` (live · ${generation.model ?? "Claude"})`
              : " (prepared draft)";
          return {
            caseNotes: patchNote(s.caseNotes, id, () => ({
              mode: "draft",
              draft: toDraft(note),
              changes: 0,
              generation,
              error: null,
            })),
            audit: [
              entry(
                regenerated ? "note-regenerated" : "note-generated",
                at(
                  regenerated ? demoActionTimes.noteRegenerated : demoActionTimes.noteGenerated,
                  id,
                ),
                "Medisense AI",
                `${regenerated ? "Regenerated" : "Generated"} draft summary${via}`,
                noteObject(id),
              ),
              ...s.audit,
            ],
          };
        }),

      failGeneration: (id, error) =>
        set((s) => ({
          caseNotes: patchNote(s.caseNotes, id, (n) => ({
            mode: n.generation ? "draft" : "empty",
            error,
          })),
        })),

      editNote: (id) =>
        set((s) => ({ caseNotes: patchNote(s.caseNotes, id, () => ({ mode: "edit" })) })),

      saveNote: (id, draft) =>
        set((s) => {
          const current = s.caseNotes[id];
          if (!current) return {};
          const changes = current.changes + countChanges(current.draft, draft);
          const plural = changes === 1 ? "change" : "changes";
          return {
            caseNotes: patchNote(s.caseNotes, id, () => ({ mode: "draft", draft, changes })),
            audit: [
              entry(
                "note-edited",
                at(demoActionTimes.noteEdited, id),
                "Sarah Thompson",
                `Edited draft (${changes} ${plural})`,
                noteObject(id),
              ),
              ...s.audit,
            ],
          };
        }),

      cancelNoteEdit: (id) =>
        set((s) => ({ caseNotes: patchNote(s.caseNotes, id, () => ({ mode: "draft" })) })),

      approveNote: (id) =>
        set((s) => ({
          caseNotes: patchNote(s.caseNotes, id, () => ({ mode: "approved" })),
          audit: [
            entry(
              "note-approved",
              at(demoActionTimes.noteApproved, id),
              "Sarah Thompson",
              "Approved summary",
              noteObject(id),
            ),
            ...s.audit,
          ],
        })),

      assignFollowUp: (assignment) =>
        set((s) => ({
          followUps: [assignment, ...s.followUps.filter((f) => f.clientId !== assignment.clientId)],
          audit: [
            entry(
              "follow-up-assigned",
              demoActionTimes.followUpAssigned,
              "Neil Hensley",
              `Assigned follow-up to ${assignment.assignee}: ${assignment.reason} (due ${assignment.due})`,
              assignment.client,
            ),
            ...s.audit,
          ],
        })),

      toggleAgendaItem: (index) =>
        set((s) => ({
          agenda: {
            ...s.agenda,
            included: s.agenda.included.map((value, i) => (i === index ? !value : value)),
          },
        })),

      approveAgenda: () =>
        set((s) => ({
          agenda: { ...s.agenda, approved: true },
          audit: [
            entry(
              "agenda-approved",
              demoActionTimes.agendaApproved,
              "Grace Liu",
              `Approved supervision agenda (${s.agenda.included.filter(Boolean).length} items)`,
              `Sarah Thompson, ${dt("22 Oct")}`,
            ),
            ...s.audit,
          ],
        })),

      regenerateAgenda: () => set({ agenda: initialState.agenda }),

      reviewRecommendation: () =>
        set((s) => ({
          recommendation: "reviewed",
          audit: [
            entry(
              "recommendation-reviewed",
              demoActionTimes.capacityReviewed,
              "Neil Hensley",
              "Sent capacity recommendation to Grace Liu for review",
              "Team capacity",
            ),
            ...s.audit,
          ],
        })),

      dismissRecommendation: () =>
        set((s) => ({
          recommendation: "dismissed",
          audit: [
            entry(
              "recommendation-dismissed",
              demoActionTimes.capacityDismissed,
              "Neil Hensley",
              "Dismissed capacity recommendation (no changes made)",
              "Team capacity",
            ),
            ...s.audit,
          ],
        })),

      setReportReviewed: (reviewed) => set((s) => ({ report: { ...s.report, reviewed } })),

      approveReport: () => {
        if (!get().report.reviewed) return;
        set((s) => ({
          report: { reviewed: true, approved: true },
          audit: [
            entry(
              "report-finalised",
              demoActionTimes.reportFinalised,
              "Hannah Wright",
              "Approved and finalised progress report",
              `Emily Carter, ${dt("14 Apr")} – ${dt("16 Oct")}`,
            ),
            ...s.audit,
          ],
        }));
      },

      regenerateReport: () => set({ report: initialState.report }),

      completeMyDayFollowUp: () =>
        set((s) => ({
          myDayFollowUpDone: true,
          audit: [
            entry(
              "follow-up-done",
              demoActionTimes.followUpDone,
              "Hannah Wright",
              "Completed follow-up: call parent re: school visit",
              "Poppy Shaw",
            ),
            ...s.audit,
          ],
        })),

      createTasksFromNote: (id, suggested) =>
        set((s) => {
          const sample = caseNoteById(id);
          if (!sample || suggested.length === 0) return {};
          const created: Task[] = suggested.map((t, i) => ({
            ...t,
            id: `t-${id}-${Date.now()}-${i}`,
            client: sample.client,
            daysOverdue: 0,
            source: "AI from note",
            done: false,
            href: `/case-notes/${id}`,
          }));
          const plural = created.length === 1 ? "task" : "tasks";
          return {
            tasks: [...created, ...s.tasks],
            caseNotes: patchNote(s.caseNotes, id, (n) => ({
              tasksCreated: n.tasksCreated + created.length,
            })),
            audit: [
              entry(
                "tasks-created",
                at(demoActionTimes.tasksCreated, id),
                "Sarah Thompson",
                `Confirmed ${created.length} follow-up ${plural} suggested from the note`,
                noteObject(id),
              ),
              ...s.audit,
            ],
          };
        }),

      completeTask: (taskId) =>
        set((s) => {
          const task = s.tasks.find((t) => t.id === taskId);
          if (!task || task.done) return {};
          return {
            tasks: s.tasks.map((t) => (t.id === taskId ? { ...t, done: true } : t)),
            audit: [
              entry(
                "task-done",
                demoActionTimes.taskCompleted,
                task.owner,
                `Completed task: ${task.title}`,
                task.client,
              ),
              ...s.audit,
            ],
          };
        }),

      requestReferralInfo: (id) =>
        set((s) => ({
          referrals: { ...s.referrals, [id]: "Info requested" },
          audit: [
            entry(
              "referral-info-requested",
              demoActionTimes.referralRequested,
              "Admin team",
              "Sent request for missing referral information (AI-drafted email, reviewed)",
              `Referral · ${referralById(id)?.client ?? id}`,
            ),
            ...s.audit,
          ],
        })),

      verifyReferral: (id) =>
        set((s) => {
          const referral = referralById(id);
          if (!referral) return {};
          const firstVisit: Task = {
            id: `t-first-visit-${id}`,
            title: "Book first home visit",
            client: referral.client,
            owner: "Admin team",
            due: dt("Fri 23 Oct"),
            daysOverdue: -3,
            priority: "Medium",
            type: "Scheduling",
            source: "AI from referral",
            done: false,
            href: "/intake",
          };
          return {
            referrals: { ...s.referrals, [id]: "Profile created" },
            tasks: [firstVisit, ...s.tasks.filter((t) => t.id !== firstVisit.id)],
            audit: [
              entry(
                "referral-verified",
                demoActionTimes.referralVerified,
                "Admin team",
                "Verified AI-extracted referral details and created client profile",
                `Referral · ${referral.client}`,
              ),
              ...s.audit,
            ],
          };
        }),

      mergeReferral: (id) =>
        set((s) => ({
          referrals: { ...s.referrals, [id]: "Merged" },
          audit: [
            entry(
              "referral-merged",
              demoActionTimes.referralVerified,
              "Admin team",
              "Added requested service to the existing client profile (duplicate avoided)",
              `Referral · ${referralById(id)?.client ?? id}`,
            ),
            ...s.audit,
          ],
        })),

      setFormValue: (formId, fieldId, value) =>
        set((s) => {
          const form = s.forms[formId];
          if (!form) return {};
          return {
            forms: {
              ...s.forms,
              [formId]: { ...form, values: { ...form.values, [fieldId]: value } },
            },
          };
        }),

      submitForm: (formId) =>
        set((s) => {
          const form = s.forms[formId];
          const draft = formDraftById(formId);
          if (!form || !draft) return {};
          const fails = draft.failFirstSubmission === true && form.attempts === 0;
          return {
            forms: {
              ...s.forms,
              [formId]: {
                ...form,
                status: fails ? "error" : "submitted",
                attempts: form.attempts + 1,
              },
            },
            audit: [
              entry(
                fails ? "form-failed" : "form-submitted",
                fails ? demoActionTimes.formFailed : demoActionTimes.formSubmitted,
                fails ? "Medisense AI" : "Admin team",
                fails
                  ? `Sync to practice management system failed (timeout): ${draft.template}`
                  : `Submitted and synced: ${draft.template}`,
                draft.client,
              ),
              ...s.audit,
            ],
          };
        }),

      acceptSuggestion: (id) =>
        set((s) => {
          const suggestion = scheduleSuggestions.find((x) => x.id === id);
          if (!suggestion) return {};
          return {
            suggestions: { ...s.suggestions, [id]: "accepted" },
            tasks: suggestion.taskId
              ? s.tasks.map((t) => (t.id === suggestion.taskId ? { ...t, done: true } : t))
              : s.tasks,
            audit: [
              entry(
                "suggestion-accepted",
                demoActionTimes.suggestionAccepted,
                "Admin team",
                `Accepted AI schedule suggestion: ${suggestion.title}`,
                `Schedule · week of ${dt("19 Oct")}`,
              ),
              ...s.audit,
            ],
          };
        }),

      dismissSuggestion: (id) =>
        set((s) => ({ suggestions: { ...s.suggestions, [id]: "dismissed" } })),

      draftReport: (id) =>
        set((s) => {
          const report = libraryReports.find((r) => r.id === id);
          if (!report || s.reports[id] !== "Not started") return {};
          return {
            reports: { ...s.reports, [id]: "AI draft" },
            audit: [
              entry(
                "report-drafted",
                demoActionTimes.reportDrafted,
                "Medisense AI",
                `Drafted ${report.type.toLowerCase()} from ${report.sources[0]?.count ?? 0} approved notes`,
                report.client,
              ),
              ...s.audit,
            ],
          };
        }),

      sendReminders: (ids) =>
        set((s) => {
          const fresh = ids.filter((id) => !s.reminders.includes(id));
          if (fresh.length === 0) return {};
          const first = expiryItems.find((i) => i.id === fresh[0]);
          return {
            reminders: [...s.reminders, ...fresh],
            audit: [
              entry(
                "reminders-sent",
                demoActionTimes.reminderSent,
                "Admin team",
                fresh.length === 1 && first
                  ? `Sent reminder: ${first.category}`
                  : `Sent ${fresh.length} expiry reminders`,
                fresh.length === 1 && first ? first.subject : "Admin operations",
              ),
              ...s.audit,
            ],
          };
        }),

      toggleAutomation: (id) =>
        set((s) => {
          const rule = [...automationRules, ...s.customRules].find((r) => r.id === id);
          if (!rule) return {};
          const enabled = !s.automations[id];
          return {
            automations: { ...s.automations, [id]: enabled },
            audit: [
              entry(
                "automation-changed",
                demoActionTimes.automationChanged,
                "Neil Hensley",
                `${enabled ? "Turned on" : "Turned off"} automation: ${rule.name}`,
                "Automation rules",
              ),
              ...s.audit,
            ],
          };
        }),

      addAutomation: (rule) =>
        set((s) => ({
          customRules: [...s.customRules, rule],
          automations: { ...s.automations, [rule.id]: rule.enabled },
          audit: [
            entry(
              "automation-added",
              demoActionTimes.automationChanged,
              "Neil Hensley",
              `Created automation (off until reviewed): ${rule.name}`,
              "Automation rules",
            ),
            ...s.audit,
          ],
        })),

      sendPortalMessage: (text) =>
        set((s) => {
          const reply: Task = {
            id: `t-portal-${Date.now()}`,
            title: `Reply to ${portalFamily.viewer}'s portal message`,
            client: "Emily Carter",
            owner: portalFamily.clinician,
            due: dt("Wed 21 Oct"),
            daysOverdue: -1,
            priority: "Medium",
            type: "Communication",
            source: "Automation",
            done: false,
            href: "/portal",
          };
          return {
            portalMessages: [
              ...s.portalMessages,
              { from: portalFamily.viewer, at: "Today, 11:36 am", text },
            ],
            tasks: [reply, ...s.tasks],
            audit: [
              entry(
                "portal-message",
                demoActionTimes.portalMessage,
                portalFamily.viewer,
                "Sent a message in the family portal (reply task created)",
                "Emily Carter · family portal",
              ),
              ...s.audit,
            ],
          };
        }),

      togglePortalSetting: (id) =>
        set((s) => ({ portalSettings: { ...s.portalSettings, [id]: !s.portalSettings[id] } })),

      respondToAppointment: (response) =>
        set((s) => {
          if (s.portalAppointment !== "pending") return {};
          const change: Task = {
            id: "t-portal-change",
            title: `Family asked to change ${dt("Tue 27 Oct")} visit`,
            client: "Emily Carter",
            owner: "Admin team",
            due: dt("Wed 21 Oct"),
            daysOverdue: -1,
            priority: "Medium",
            type: "Scheduling",
            source: "Automation",
            done: false,
            href: "/schedule",
          };
          return {
            portalAppointment: response,
            tasks: response === "change-requested" ? [change, ...s.tasks] : s.tasks,
            audit: [
              entry(
                "portal-appointment",
                demoActionTimes.portalAppointment,
                portalFamily.viewer,
                response === "confirmed"
                  ? `Confirmed appointment ${dt("Tue 27 Oct")}, 8:30 am`
                  : `Requested a change to ${dt("Tue 27 Oct")} visit (task for admin team)`,
                "Emily Carter · family portal",
              ),
              ...s.audit,
            ],
          };
        }),

      togglePermission: (permissionId, role) =>
        set((s) => {
          const permission = permissions.find((p) => p.id === permissionId);
          if (!permission || permission.locked) return {};
          const key = `${permissionId}:${role}`;
          const current = s.permissionOverrides[key] ?? permission.roles[role];
          return {
            permissionOverrides: { ...s.permissionOverrides, [key]: !current },
            audit: [
              entry(
                "permission-changed",
                demoActionTimes.settingChanged,
                "Neil Hensley",
                `${current ? "Removed" : "Granted"} "${permission.label}" for ${role}`,
                "Roles & permissions",
              ),
              ...s.audit,
            ],
          };
        }),

      toggleGuardrail: (id) =>
        set((s) => {
          const guardrail = aiGuardrails.find((g) => g.id === id);
          if (!guardrail || guardrail.locked) return {};
          const on = !s.guardrails[id];
          return {
            guardrails: { ...s.guardrails, [id]: on },
            audit: [
              entry(
                "guardrail-changed",
                demoActionTimes.settingChanged,
                "Neil Hensley",
                `${on ? "Turned on" : "Turned off"} AI setting: ${guardrail.label}`,
                "AI guardrails",
              ),
              ...s.audit,
            ],
          };
        }),

      connectIntegration: (id) =>
        set((s) => {
          const integration = integrations.find((i) => i.id === id);
          if (!integration || s.connected.includes(id)) return {};
          return {
            connected: [...s.connected, id],
            audit: [
              entry(
                "integration-connected",
                demoActionTimes.settingChanged,
                "Neil Hensley",
                `Connected integration: ${integration.name} (demo)`,
                "Integrations",
              ),
              ...s.audit,
            ],
          };
        }),

      setRole: (role) => set({ role }),

      resetDemo: () => set((s) => ({ ...initialState, role: s.role })),
    }),
    {
      name: "medisense-demo",
      version: 7,
      // A session saved by an older version starts fresh; only the chosen role view carries over.
      migrate: (persisted) => {
        const role = (persisted as Partial<DemoState> | null)?.role;
        return { ...initialState, ...(role ? { role } : {}) } as DemoState & DemoActions;
      },
      storage: createJSONStorage(() => sessionStorage),
      skipHydration: true,
      partialize: ({
        caseNotes,
        followUps,
        agenda,
        recommendation,
        report,
        myDayFollowUpDone,
        tasks,
        referrals,
        forms,
        suggestions,
        reports,
        reminders,
        automations,
        customRules,
        portalMessages,
        portalSettings,
        portalAppointment,
        permissionOverrides,
        guardrails,
        connected,
        role,
        audit,
      }) => ({
        // A request in flight does not survive a reload, so never persist the generating state.
        caseNotes: Object.fromEntries(
          Object.entries(caseNotes).map(([id, n]) => [
            id,
            n.mode === "generating" ? { ...n, mode: n.generation ? "draft" : "empty" } : n,
          ]),
        ),
        followUps,
        agenda,
        recommendation,
        report,
        myDayFollowUpDone,
        tasks,
        referrals,
        forms,
        suggestions,
        reports,
        reminders,
        automations,
        customRules,
        portalMessages,
        portalSettings,
        portalAppointment,
        permissionOverrides,
        guardrails,
        connected,
        role,
        audit,
      }),
    },
  ),
);
