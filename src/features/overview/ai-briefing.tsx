"use client";

import { preparedBriefing } from "@/data/story";
import { useDemoStore } from "@/state/demo-store";
import { figures, startFigures } from "@/state/story-selectors";
import { useStoryAi } from "@/state/use-story-ai";

/** The director's written briefing. It explains the figures and recommends; it never acts. */
export function useBriefing() {
  const caseNotes = useDemoStore((s) => s.caseNotes);
  const tasks = useDemoStore((s) => s.tasks);
  const story = useDemoStore((s) => s.story);
  const f = figures({ caseNotes, tasks, story });
  const changed = JSON.stringify(f) !== JSON.stringify(startFigures);

  const briefing = useStoryAi<string>(
    `briefing:${JSON.stringify(f)}`,
    {
      kind: "briefing",
      facts: {
        needsAttention: "Sarah Thompson",
        sarah: {
          clients: 27,
          capacity: 25,
          utilisationPercent: 108,
          highComplexityClients: 6,
          notesToWrite: f.sarahNotes,
          score: f.sarahScore,
          status:
            f.sarahStatus === "at-risk"
              ? "At Risk"
              : f.sarahStatus === "monitor"
                ? "Watch"
                : "Healthy",
        },
        nextHighest: ["Jessica Nguyen, Watch, 72", "Marcus Bell, Watch, 66"],
        team: {
          notesDue: f.teamNotes,
          followUpsOverdue: f.followUps,
          followUpsWithNoOwner: f.unowned,
          tasksEscalated: f.escalated,
        },
        changedSinceStart: changed
          ? {
              noteApproved:
                story.stage === "approved"
                  ? "Sarah Thompson, the treating clinician, approved her session note for her client Oliver Grant"
                  : null,
              daysPassed: story.dayOffset > 0,
            }
          : null,
      },
    },
    changed ? preparedBriefing.changed : preparedBriefing.start,
  );

  return { briefing, changed, lastSkip: story.lastSkip.length };
}
