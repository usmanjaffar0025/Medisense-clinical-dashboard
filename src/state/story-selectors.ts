import { caseNotes } from "@/data/case-note";
import { adminTeam, unownedFollowUpsAtStart } from "@/data/story";
import { isEscalated, seedTasks, type Task } from "@/data/tasks";
import type { Clinician } from "@/data/types";
import { scoreThresholds, clinicians } from "@/data/clinicians";
import type { CaseNoteState } from "./demo-store";
import type { StoryState } from "./story";

/** Points the Overdue documentation factor carries per note: 12 of 15 with 4 notes overdue. */
const POINTS_PER_NOTE = 3;

type Live = {
  caseNotes: Record<string, CaseNoteState>;
  tasks: Task[];
  story: StoryState;
};

const seedById = new Map(seedTasks.map((t) => [t.id, t]));

function statusFor(score: number): Clinician["status"] {
  if (score >= scoreThresholds.atRisk) return "at-risk";
  if (score >= scoreThresholds.monitor) return "monitor";
  return "healthy";
}

/** Rule-based: applies approved notes and moved follow-ups to a clinician's figures. */
export function adjustClinician(live: Live) {
  const approved = caseNotes.filter((c) => live.caseNotes[c.id]?.mode === "approved");
  const overdueCleared = approved.filter(
    (c) => c.clinician !== undefined && c.backlog.kind === "overdue",
  );
  const draftsCleared = approved.filter((c) => c.backlog.kind === "ai-draft");

  const followUpChange = (name: string) =>
    live.tasks.reduce((sum, t) => {
      if (t.owner !== name || t.type !== "Client follow-up") return sum;
      const seed = seedById.get(t.id);
      if (!seed) return sum;
      const wasOverdue = !seed.done && seed.daysOverdue > 0;
      const isOverdue = !t.done && t.daysOverdue > 0;
      return sum + (isOverdue ? 1 : 0) - (wasOverdue ? 1 : 0);
    }, 0);

  return (c: Clinician): Clinician => {
    const notes = overdueCleared.filter((n) => n.clinician === c.name).length;
    const drafts = draftsCleared.filter((n) => n.clinician === c.name).length;
    const follow = followUpChange(c.name);
    if (notes === 0 && drafts === 0 && follow === 0) return c;

    const score = c.score - notes * POINTS_PER_NOTE;
    const notesOverdue = c.notesOverdue - notes;
    const draftsAwaiting = c.draftsAwaiting - drafts;
    return {
      ...c,
      score,
      status: statusFor(score),
      notesOverdue,
      draftsAwaiting,
      notesDue: notesOverdue + draftsAwaiting,
      followUpsOverdue: Math.max(0, c.followUpsOverdue + follow),
      history: {
        ...c.history,
        score: [...c.history.score.slice(0, -1), score],
      },
    };
  };
}

export function unownedFollowUps(story: StoryState) {
  const owned = Object.entries(story.taskChoices).some(
    ([id, choice]) =>
      choice === "confirmed" &&
      (story.taskOwners[id] ?? story.prepared?.tasks.find((t) => t.id === id)?.owner) !==
        "Sarah Thompson",
  );
  return unownedFollowUpsAtStart - (owned ? 1 : 0);
}

export type StoryFigures = {
  sarahNotes: number;
  sarahScore: number;
  sarahStatus: Clinician["status"];
  teamNotes: number;
  unowned: number;
  followUps: number;
  escalated: number;
};

export function figures(live: Live): StoryFigures {
  const adjust = adjustClinician(live);
  const list = clinicians.map(adjust);
  const sarah = list.find((c) => c.id === "sarah-thompson");
  return {
    sarahNotes: sarah?.notesOverdue ?? 0,
    sarahScore: sarah?.score ?? 0,
    sarahStatus: sarah?.status ?? "healthy",
    teamNotes: list.reduce((s, c) => s + c.notesOverdue + c.draftsAwaiting, 0),
    unowned: unownedFollowUps(live.story),
    followUps: list.reduce((s, c) => s + c.followUpsOverdue, 0),
    escalated: live.tasks.filter(isEscalated).length,
  };
}

export const startFigures: StoryFigures = (() => {
  const sarah = clinicians.find((c) => c.id === "sarah-thompson");
  return {
    sarahNotes: sarah?.notesOverdue ?? 0,
    sarahScore: sarah?.score ?? 0,
    sarahStatus: sarah?.status ?? "healthy",
    teamNotes: clinicians.reduce((s, c) => s + c.notesOverdue + c.draftsAwaiting, 0),
    unowned: unownedFollowUpsAtStart,
    followUps: clinicians.reduce((s, c) => s + c.followUpsOverdue, 0),
    escalated: seedTasks.filter(isEscalated).length,
  };
})();

export function isAdminOwner(owner: string) {
  return owner === "Admin team" || adminTeam.includes(owner);
}
