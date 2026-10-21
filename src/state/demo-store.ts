import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import { demoActionTimes, initialAuditEntries } from "@/data/audit";
import { miaCaseNote } from "@/data/case-note";
import { suggestedAgenda } from "@/data/supervision";
import type { AuditEntry } from "@/data/types";

export type CaseNoteMode = "empty" | "draft" | "edit" | "approved";

export type CaseNoteDraft = {
  summary: string;
  interventions: string;
  nextActions: string;
};

export type RecommendationState = "pending" | "reviewed" | "dismissed";

export type FollowUpAssignment = {
  clientId: string;
  client: string;
  assignee: string;
  due: string;
  note: string;
};

const originalDraft: CaseNoteDraft = {
  summary: `${miaCaseNote.draft.summaryLead} ${miaCaseNote.draft.summaryRest}`,
  interventions: miaCaseNote.draft.interventions.join("\n"),
  nextActions: miaCaseNote.draft.nextActions.join("\n"),
};

type DemoState = {
  caseNote: { mode: CaseNoteMode; draft: CaseNoteDraft; changes: number };
  followUps: FollowUpAssignment[];
  agenda: { included: boolean[]; approved: boolean };
  recommendation: RecommendationState;
  report: { reviewed: boolean; approved: boolean };
  myDayFollowUpDone: boolean;
  audit: AuditEntry[];
};

type DemoActions = {
  generateNote: () => void;
  editNote: () => void;
  saveNote: (draft: CaseNoteDraft) => void;
  cancelNoteEdit: () => void;
  regenerateNote: () => void;
  approveNote: () => void;
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
  resetDemo: () => void;
};

const initialState: DemoState = {
  caseNote: { mode: "empty", draft: originalDraft, changes: 0 },
  followUps: [],
  agenda: { included: suggestedAgenda.map(() => true), approved: false },
  recommendation: "pending",
  report: { reviewed: false, approved: false },
  myDayFollowUpDone: false,
  audit: initialAuditEntries,
};

function entry(id: string, time: string, actor: string, action: string, object: string) {
  return {
    id: `${id}-${Date.now()}`,
    day: "2026-10-20",
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

const noteObject = "Mia Robinson, session 13 Oct";

/**
 * Demo progress survives a page refresh within the same tab, so a presenter can reload
 * without losing approvals. Rehydration is deferred to the client to keep SSR output stable.
 */
export const useDemoStore = create<DemoState & DemoActions>()(
  persist(
    (set, get) => ({
      ...initialState,

      generateNote: () => {
        if (get().caseNote.mode !== "empty") return get().regenerateNote();
        set((s) => ({
          caseNote: { mode: "draft", draft: originalDraft, changes: 0 },
          audit: [
            entry(
              "note-generated",
              demoActionTimes.noteGenerated,
              "Medisense AI",
              "Generated draft summary",
              noteObject,
            ),
            ...s.audit,
          ],
        }));
      },

      editNote: () => set((s) => ({ caseNote: { ...s.caseNote, mode: "edit" } })),

      saveNote: (draft) =>
        set((s) => {
          const changes = s.caseNote.changes + countChanges(s.caseNote.draft, draft);
          const plural = changes === 1 ? "change" : "changes";
          return {
            caseNote: { mode: "draft", draft, changes },
            audit: [
              entry(
                "note-edited",
                demoActionTimes.noteEdited,
                "Sarah Thompson",
                `Edited draft (${changes} ${plural})`,
                noteObject,
              ),
              ...s.audit,
            ],
          };
        }),

      cancelNoteEdit: () => set((s) => ({ caseNote: { ...s.caseNote, mode: "draft" } })),

      regenerateNote: () =>
        set((s) => ({
          caseNote: { mode: "draft", draft: originalDraft, changes: 0 },
          audit: [
            entry(
              "note-regenerated",
              demoActionTimes.noteRegenerated,
              "Medisense AI",
              "Regenerated draft summary",
              noteObject,
            ),
            ...s.audit,
          ],
        })),

      approveNote: () =>
        set((s) => ({
          caseNote: { ...s.caseNote, mode: "approved" },
          audit: [
            entry(
              "note-approved",
              demoActionTimes.noteApproved,
              "Sarah Thompson",
              "Approved summary",
              noteObject,
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
              `Assigned follow-up to ${assignment.assignee}`,
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
              "Sarah Thompson, 22 Oct",
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
              "Emily Carter, 14 Apr – 16 Oct",
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

      resetDemo: () => set(initialState),
    }),
    {
      name: "medisense-demo",
      version: 1,
      storage: createJSONStorage(() => sessionStorage),
      skipHydration: true,
      partialize: ({
        caseNote,
        followUps,
        agenda,
        recommendation,
        report,
        myDayFollowUpDone,
        audit,
      }) => ({
        caseNote,
        followUps,
        agenda,
        recommendation,
        report,
        myDayFollowUpDone,
        audit,
      }),
    },
  ),
);
