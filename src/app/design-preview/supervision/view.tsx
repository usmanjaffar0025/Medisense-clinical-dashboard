"use client";

import { draftSurface } from "@/components/ai/provenance";
import { Button } from "@/components/ui/button";
import { Caption, Card } from "@/components/ui/card";
import { Tag } from "@/components/ui/tag";
import { cn } from "@/lib/cn";
import { AiMark, WorkloadTag } from "../_components/marks";
import { PreviewBar, usePreviewState } from "../_components/preview-bar";
import { ScreenTitle, Shell } from "../_components/shell";
import { aiDiscussionPoints, brief, story } from "../_fixtures/story";

type State = "updated" | "approved";

const facts = [
  { label: "Session", value: "Thu 22 Oct, 2:00 pm" },
  { label: "Last held", value: "Thu 24 Sep" },
  { label: "Open actions", value: "2 of 4" },
];

export function SupervisionView() {
  const [state, setState] = usePreviewState<State>("updated");
  const approved = state === "approved";

  return (
    <>
      <PreviewBar href="/design-preview/supervision" />
      <Shell
        persona="grace"
        active="AI briefs"
        section="AI briefs"
        page="Sarah Thompson"
        date={story.tomorrow}
        bellCount={1}
      >
        <ScreenTitle
          title="AI supervision brief for Sarah Thompson"
          description="AI has updated this 3 times since it was first prepared, so you don't need to go looking for changes."
          actions={<WorkloadTag status="At Risk" />}
        />

        <div className="grid items-start gap-6 xl:grid-cols-12">
          <section
            aria-labelledby="brief"
            className={cn(draftSurface(approved), "px-6 pt-5 pb-4.5 xl:col-span-8")}
          >
            <h2 id="brief" className="sr-only">
              Brief
            </h2>
            {approved ? (
              <AiMark state="Approved" source="Ready to share with Sarah">
                Brief approved by Grace Liu, 8:31 am
              </AiMark>
            ) : (
              <AiMark state="Draft" source="AI updated Wed 8:00 am" />
            )}
            <div className="mt-2">
              {brief.map((item) => (
                <article
                  key={item.heading}
                  className="border-t border-border py-4 first:border-t-0"
                >
                  <div className="flex flex-wrap items-baseline justify-between gap-2">
                    <h3 className="font-serif text-section font-medium">{item.heading}</h3>
                    {item.updated && (
                      <span className="text-caption font-semibold text-brass">{item.updated}</span>
                    )}
                  </div>
                  <p className={cn("mt-1 leading-5.5", item.updated && "font-medium")}>
                    {item.text}
                  </p>
                  {item.previous && (
                    <p className="mt-0.5 text-small text-ink-700">{item.previous}</p>
                  )}
                  <Caption className="mt-1">From: {item.source}</Caption>
                </article>
              ))}
            </div>
            {!approved && (
              <div className="flex flex-wrap items-center justify-between gap-3 border-t border-border pt-3.5">
                <Button variant="primary" onClick={() => setState("approved")}>
                  Approve brief
                </Button>
                <Caption>Sarah sees the brief once you approve it.</Caption>
              </div>
            )}
          </section>

          <div className="flex flex-col gap-6 xl:col-span-4">
            <Card aria-labelledby="session-facts" className="px-5 pt-4.5 pb-4.5">
              <h2 id="session-facts" className="headline text-h2">
                This session
              </h2>
              <dl className="mt-2">
                {facts.map((f) => (
                  <div
                    key={f.label}
                    className="flex justify-between gap-3 border-t border-border py-2 text-small"
                  >
                    <dt className="text-ink-700">{f.label}</dt>
                    <dd className="font-semibold">{f.value}</dd>
                  </div>
                ))}
              </dl>
            </Card>
            <section
              aria-labelledby="ai-points"
              className={cn(draftSurface(false), "px-5 pt-4.5 pb-4.5")}
            >
              <h2 id="ai-points" className="headline text-h2">
                AI-suggested discussion points
              </h2>
              <ul className="mt-2 flex list-disc flex-col gap-1.5 pl-4.5 text-small">
                {aiDiscussionPoints.map((p) => (
                  <li key={p}>{p}</li>
                ))}
              </ul>
              <Caption className="mt-3">Suggestions only. You decide what to raise.</Caption>
            </section>
            <Card aria-labelledby="for-you" className="px-5 pt-4.5 pb-4.5">
              <div className="flex items-start justify-between gap-2">
                <h2 id="for-you" className="headline text-h2">
                  Escalated to you
                </h2>
                <Tag tone="over">Escalated</Tag>
              </div>
              <p className="mt-1.5 text-small font-semibold">
                Return parent call about sensory diet
              </p>
              <p className="text-small text-ink-700">
                Isla Murphy. With Sarah, 4 working days late. Isla&apos;s visit was yesterday, so
                this may be quick to close.
              </p>
            </Card>
          </div>
        </div>
      </Shell>
    </>
  );
}
