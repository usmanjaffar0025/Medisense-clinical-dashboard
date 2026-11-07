import type { Metadata } from "next";
import Link from "next/link";
import { screens } from "./_components/screens";

export const metadata: Metadata = { title: "Design preview · Medisense" };

/** Review tooling: lists the mock-ups in story order. Not linked from the product. */
export default function DesignPreviewIndex() {
  return (
    <main data-scroll className="min-h-0 w-full flex-1 overflow-y-auto px-4 pt-10 pb-18 md:px-10">
      <div className="mx-auto max-w-240">
        <p className="font-mono text-caption text-ink-700">Design preview, for review only</p>
        <h1 className="mt-2 headline text-display">Medisense: the next set of screens</h1>
        <p className="mt-2 max-w-180 text-body text-ink-700">
          Static mock-ups in story order. Nothing here is connected to the live demo. Each screen
          has a dashed bar at the top for moving between its states. The written spec is in
          docs/design-spec-v2.md.
        </p>
        <ol className="mt-8 border-t border-border-strong">
          {screens.map((s, i) => (
            <li key={s.href} className="border-b border-border">
              <Link
                href={s.href}
                className="grid gap-x-4 gap-y-1 px-2 py-4 hover:bg-surface hover:no-underline md:grid-cols-12 md:items-baseline"
              >
                <span className="font-serif text-figure text-brass md:col-span-1">{i + 1}</span>
                <span className="md:col-span-4">
                  <span className="block font-semibold text-ink-900">{s.title}</span>
                  <span className="block text-caption font-medium text-ink-500">{s.story}</span>
                </span>
                <span className="text-small text-ink-700 md:col-span-5">{s.summary}</span>
                <span className="font-mono text-caption text-ink-500 md:col-span-2 md:text-right">
                  {s.states.length === 0
                    ? "1 view"
                    : `${s.states.length} ${s.states.length === 1 ? "state" : "states"}`}
                </span>
              </Link>
            </li>
          ))}
        </ol>
      </div>
    </main>
  );
}
