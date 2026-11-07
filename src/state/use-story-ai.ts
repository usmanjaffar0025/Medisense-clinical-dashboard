"use client";

import { useEffect, useRef } from "react";
import type { AiMeta, StoryRequest, StoryResponse } from "@/lib/story/types";
import { useDemoStore } from "./demo-store";

const inFlight = new Set<string>();

/** One AI step. Returns an error message rather than throwing, so screens can stay calm. */
export async function callStory<T>(
  request: StoryRequest,
): Promise<{ data: T; meta: AiMeta } | { error: string }> {
  try {
    const res = await fetch("/api/story", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(request),
    });
    const body = (await res.json()) as StoryResponse<T>;
    if (!body.ok) return { error: body.error };
    return {
      data: body.data,
      meta: { source: "live", model: body.model, latencyMs: body.latencyMs },
    };
  } catch {
    return { error: "The AI service couldn't be reached" };
  }
}

/**
 * Keeps an AI result for as long as what it was written from stays the same. `key` must change
 * when the inputs change. A failed call stores the prepared version, and the presenter panel
 * shows that it was used.
 */
export function useStoryAi<T>(key: string, request: StoryRequest, prepared: T) {
  const cached = useDemoStore((s) => s.story.ai[key]);
  const store = useDemoStore((s) => s.cacheAi);
  const latest = useRef({ request, prepared });

  useEffect(() => {
    latest.current = { request, prepared };
  });

  useEffect(() => {
    const run = () => {
      if (useDemoStore.getState().story.ai[key] || inFlight.has(key)) return;
      inFlight.add(key);
      void callStory<T>(latest.current.request).then((result) => {
        inFlight.delete(key);
        if ("error" in result) {
          store(key, latest.current.request.kind, latest.current.prepared, {
            source: "prepared",
            model: null,
            latencyMs: null,
          });
        } else {
          store(key, latest.current.request.kind, result.data, result.meta);
        }
      });
    };
    if (useDemoStore.persist.hasHydrated()) {
      run();
      return undefined;
    }
    return useDemoStore.persist.onFinishHydration(run);
  }, [key, store]);

  return {
    data: (cached?.data as T | undefined) ?? null,
    meta: cached?.meta ?? null,
    loading: !cached,
  };
}
