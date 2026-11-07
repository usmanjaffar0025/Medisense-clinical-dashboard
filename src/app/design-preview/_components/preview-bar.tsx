"use client";

import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useCallback } from "react";
import { cn } from "@/lib/cn";
import { screens } from "./screens";

/** The screen's current state, kept in the URL so every state can be linked and reviewed. */
export function usePreviewState<T extends string>(fallback: T) {
  const params = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();
  const state = (params.get("state") ?? fallback) as T;
  const setState = useCallback(
    (next: T) => router.replace(`${pathname}?state=${next}`, { scroll: false }),
    [pathname, router],
  );
  return [state, setState] as const;
}

/** Review tooling, not product UI: monospace, dashed and separate from the product frame. */
export function PreviewBar({ href }: { href: string }) {
  const params = useSearchParams();
  const index = screens.findIndex((s) => s.href === href);
  const screen = screens[index];
  const previous = screens[index - 1];
  const next = screens[index + 1];
  if (!screen) return null;
  const current = params.get("state") ?? screen.states[0]?.id;

  return (
    <div className="z-30 flex-none border-b border-dashed border-border-strong bg-surface-raised px-4 py-2 font-mono text-caption">
      <div className="flex flex-wrap items-center justify-between gap-x-4 gap-y-1">
        <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
          <Link href="/design-preview" className="font-medium text-accent hover:underline">
            All screens
          </Link>
          <span className="text-ink-700">
            {screen.story}: {screen.title}
          </span>
        </div>
        <div className="flex items-center gap-3">
          {previous && (
            <Link href={previous.href} className="font-medium text-accent hover:underline">
              Previous
            </Link>
          )}
          {next && (
            <Link href={next.href} className="font-medium text-accent hover:underline">
              Next
            </Link>
          )}
        </div>
      </div>
      {screen.states.length > 0 && (
        <nav aria-label="Preview states" className="mt-1.5 flex flex-wrap gap-1">
          {screen.states.map((s) => (
            <Link
              key={s.id}
              href={`${href}?state=${s.id}`}
              scroll={false}
              replace
              aria-current={current === s.id ? "true" : undefined}
              className={cn(
                "rounded-tag border border-dashed px-2 py-0.5 hover:no-underline",
                current === s.id
                  ? "border-ink-900 bg-ink-900 text-surface-raised"
                  : "border-border-strong text-ink-700 hover:border-ink-700",
              )}
            >
              {s.label}
            </Link>
          ))}
        </nav>
      )}
    </div>
  );
}
