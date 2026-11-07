"use client";

import { AiMark } from "@/components/ai/marks";
import { draftSurface } from "@/components/ai/provenance";
import { Button } from "@/components/ui/button";
import { Caption } from "@/components/ui/card";
import { Tag } from "@/components/ui/tag";
import { preparedBrief } from "@/data/story";
import { isEscalated } from "@/data/tasks";
import { allSentences, type Brief } from "@/lib/story/types";
import { cn } from "@/lib/cn";
import { useDemoStore } from "@/state/demo-store";
import { figures, startFigures } from "@/state/story-selectors";
import { useStoryAi } from "@/state/use-story-ai";

const SARAH = "Sarah Thompson";

/** Rewritten by AI from current facts whenever they change, and always approved by the supervisor. */
export function LiveBrief() {
  const caseNotes = useDemoStore((s) => s.caseNotes);
  const tasks = useDemoStore((s) => s.tasks);
  const story = useDemoStore((s) => s.story);
  const role = useDemoStore((s) => s.role);
  const approve = useDemoStore((s) => s.approveBrief);

  const f = figures({ caseNotes, tasks, story });
  const noteApproved = story.stage === "approved";
  const uploadOwned = f.unowned < startFigures.unowned;
  const escalated = tasks.filter((t) => isEscalated(t) && t.owner === SARAH);
  const escalatedNames = escalated.map((t) => `${t.client}'s ${t.title.toLowerCase()}`);
  const sentences = story.note ? allSentences(story.note).map((s) => s.text) : [];

  const key = `brief:${f.sarahNotes}:${noteApproved}:${uploadOwned}:${escalated.map((t) => `${t.id}${t.daysOverdue}`).join(",")}`;
  const brief = useStoryAi<Brief>(
    key,
    {
      kind: "brief",
      facts: {
        clinician: SARAH,
        supervisor: "Grace Liu",
        notesToWrite: f.sarahNotes,
        workload: {
          status:
            f.sarahStatus === "at-risk"
              ? "At Risk"
              : f.sarahStatus === "monitor"
                ? "Watch"
                : "Healthy",
          score: f.sarahScore,
          clients: 27,
          capacity: 25,
          caseloadChange: "up 18% over six weeks",
          adminHours: "9 against a target of 7, above target three weeks running",
        },
        complexCases: noteApproved
          ? { oliverGrant: sentences, reportUploadOwnedByAdminTeam: uploadOwned }
          : ["Oliver Grant: new external report", "Ruth Hallam: appointments paused"],
        followUps: {
          due: 5,
          overdue: 3,
          escalatedToSupervisor: escalated.map((t) => ({
            client: t.client,
            task: t.title,
            workingDaysLate: t.daysOverdue,
          })),
        },
        openActionsFromLastSession: "2 of 4",
      },
    },
    preparedBrief({
      notesToWrite: f.sarahNotes,
      noteApproved,
      uploadOwned,
      escalated: escalatedNames,
    }),
  );

  const approved = story.briefApprovedKey === key;
  const canApprove = role === "Supervisor";
  const changedHeadings = new Set<string>([
    ...(noteApproved ? ["Overdue documentation", "Complex cases"] : []),
    ...(escalated.length ? ["Pending follow-ups"] : []),
  ]);

  return (
    <section
      aria-labelledby="agenda-title"
      className={cn(draftSurface(approved), "flex h-full flex-col px-6 pt-5 pb-4.5")}
    >
      {approved ? (
        <AiMark state="Approved" source="Ready to share with Sarah">
          Brief approved by Grace Liu
        </AiMark>
      ) : (
        <AiMark
          source={
            changedHeadings.size
              ? `AI updated this ${changedHeadings.size === 1 ? "section" : `${changedHeadings.size} sections`} from new activity`
              : "Prepared from Sarah's caseload, notes and tasks"
          }
        />
      )}

      <h2 id="agenda-title" className="mt-3.5 mb-1 headline text-h2">
        AI supervision brief
      </h2>

      {brief.loading || !brief.data ? (
        <div aria-busy="true" className="mt-3 flex flex-col gap-3">
          <Caption>AI is rewriting the brief from the latest activity…</Caption>
          {[0, 1, 2, 3].map((i) => (
            <span
              key={i}
              className="block h-3 w-11/12 animate-pulse rounded-full bg-border motion-reduce:animate-none"
            />
          ))}
        </div>
      ) : (
        <>
          <div>
            {brief.data.items.map((item) => (
              <article key={item.heading} className="border-t border-border py-4 first:border-t-0">
                <div className="flex flex-wrap items-baseline justify-between gap-2">
                  <h3 className="font-serif text-section font-medium">{item.heading}</h3>
                  {changedHeadings.has(item.heading) && (
                    <span className="text-caption font-semibold text-brass">AI updated</span>
                  )}
                </div>
                <p
                  className={cn(
                    "mt-1 leading-5.5",
                    changedHeadings.has(item.heading) && "font-medium",
                  )}
                >
                  {item.text}
                </p>
                <Caption className="mt-1">From: {item.source}</Caption>
              </article>
            ))}
          </div>

          {brief.data.points.length > 0 && (
            <div className="border-t border-border-strong py-4">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <h3 className="font-serif text-section font-medium">
                  AI-suggested discussion points
                </h3>
                <Tag tone="neutral">Suggestions only</Tag>
              </div>
              <ul className="mt-2 flex list-disc flex-col gap-1.5 pl-4.5 text-small">
                {brief.data.points.map((p) => (
                  <li key={p}>{p}</li>
                ))}
              </ul>
            </div>
          )}
        </>
      )}

      {!approved && !brief.loading && (
        <div className="mt-auto flex flex-wrap items-center justify-between gap-3 border-t border-border pt-3.5">
          <Button variant="primary" disabled={!canApprove} onClick={() => approve(key)}>
            Approve brief
          </Button>
          <Caption>
            {canApprove
              ? "Sarah sees the brief once you approve it."
              : "Only Grace Liu can approve this brief."}
          </Caption>
        </div>
      )}
    </section>
  );
}
