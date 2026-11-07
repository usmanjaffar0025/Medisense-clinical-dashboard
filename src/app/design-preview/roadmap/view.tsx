"use client";

import { Tag } from "@/components/ui/tag";
import { PreviewBar } from "../_components/preview-bar";
import { ScreenTitle, Shell } from "../_components/shell";
import { roadmap } from "../_fixtures/story";

export function RoadmapView() {
  return (
    <>
      <PreviewBar href="/design-preview/roadmap" />
      <Shell persona="neil" active="Roadmap" section="Organisation" page="Roadmap">
        <ScreenTitle
          title="Where the platform could go next"
          description="None of this is built yet. The order is a proposal to agree with Medisense."
        />
        <ol className="max-w-280 border-b border-border-strong">
          {roadmap.map((phase, i) => (
            <li
              key={phase.phase}
              className="grid gap-x-10 gap-y-3 border-t border-border-strong py-6 lg:grid-cols-12"
            >
              <div className="lg:col-span-4">
                <p className="text-small font-semibold text-ink-700">Phase {i + 1}</p>
                <h2 className="headline text-h1">{phase.phase}</h2>
                <p className="mt-1.5 max-w-80 text-small text-ink-700">{phase.why}</p>
              </div>
              <ul className="lg:col-span-8">
                {phase.modules.map((m) => (
                  <li
                    key={m.name}
                    className="flex flex-wrap items-start justify-between gap-x-6 gap-y-1 border-t border-border py-3 first:border-t-0 first:pt-0"
                  >
                    <div className="min-w-0 flex-1">
                      <h3 className="text-h3 font-semibold">{m.name}</h3>
                      <p className="max-w-140 text-small text-ink-700">{m.does}</p>
                    </div>
                    <Tag tone="neutral">Planned</Tag>
                  </li>
                ))}
              </ul>
            </li>
          ))}
        </ol>
      </Shell>
    </>
  );
}
