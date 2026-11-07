import type { Metadata } from "next";
import Link from "next/link";
import { PageContainer, ScreenTitle } from "@/components/ui/page";
import { Tag } from "@/components/ui/tag";
import { roadmap } from "@/data/story";

export const metadata: Metadata = { title: "Roadmap · Medisense" };

export default function RoadmapPage() {
  return (
    <PageContainer>
      <ScreenTitle
        title="Platform roadmap"
        description="Every module has working screens. Connecting them to live systems is the next stage."
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
                  <span className="flex items-center gap-3">
                    <Tag tone="available">Screens ready</Tag>
                    <Link href={m.href} className="text-small font-semibold">
                      Open
                    </Link>
                  </span>
                </li>
              ))}
            </ul>
          </li>
        ))}
      </ol>
    </PageContainer>
  );
}
