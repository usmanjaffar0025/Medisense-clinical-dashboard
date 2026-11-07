"use client";

import { longDate } from "@/lib/clock";
import { useDemoStore } from "@/state/demo-store";

/** Today in the story, which moves when the presenter advances the day. */
export function TodayLabel() {
  const dayOffset = useDemoStore((s) => s.story.dayOffset);
  return <>{longDate(dayOffset)}</>;
}
