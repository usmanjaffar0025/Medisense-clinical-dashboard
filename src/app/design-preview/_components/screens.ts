export type PreviewScreen = {
  href: string;
  title: string;
  story: string;
  summary: string;
  states: { id: string; label: string }[];
};

/** In story order, which is also the order the review should follow. */
export const screens: PreviewScreen[] = [
  {
    href: "/design-preview/my-day",
    title: "Sarah's My Day",
    story: "Step 3",
    summary: "Her visits in order, with Oliver's note as the obvious next step.",
    states: [
      { id: "finished", label: "Visit just finished" },
      { id: "approved", label: "Note approved" },
      { id: "empty", label: "No visits" },
    ],
  },
  {
    href: "/design-preview/note",
    title: "AI session note",
    story: "Steps 4 and 5",
    summary: "A blank note, dictation, then a draft to edit and approve.",
    states: [
      { id: "ready", label: "Ready" },
      { id: "listening", label: "Listening" },
      { id: "paused", label: "Paused" },
      { id: "complete", label: "Transcript complete" },
      { id: "generating", label: "Generating" },
      { id: "draft", label: "Draft ready" },
      { id: "editing", label: "Editing a line" },
      { id: "edited", label: "Line edited" },
      { id: "error", label: "Draft failed" },
      { id: "no-mic", label: "Microphone unavailable" },
      { id: "approved", label: "Note approved" },
      { id: "reopen", label: "Reopen for editing" },
    ],
  },
  {
    href: "/design-preview/prepared",
    title: "What AI prepared",
    story: "Steps 6 and 7",
    summary: "The hero moment: what one approval prepared, traced to the note.",
    states: [
      { id: "preparing", label: "Preparing" },
      { id: "prepared", label: "Prepared" },
      { id: "confirmed", label: "Task confirmed" },
      { id: "partial", label: "Form not prefilled" },
      { id: "nothing", label: "Nothing to prepare" },
    ],
  },
  {
    href: "/design-preview/admin-queue",
    title: "Admin work queue",
    story: "Step 7",
    summary: "Where the confirmed task arrives, with exceptions kept apart.",
    states: [
      { id: "queue", label: "Queue" },
      { id: "reassign", label: "Reassigning" },
      { id: "completed", label: "Task done" },
      { id: "retrying", label: "Retrying sync" },
      { id: "empty", label: "Nothing waiting" },
    ],
  },
  {
    href: "/design-preview/time-skip",
    title: "After a time skip",
    story: "Step 8",
    summary: "The reminder, the escalation and the audit entries they wrote.",
    states: [
      { id: "neil", label: "What Neil sees" },
      { id: "admin", label: "What admin sees" },
      { id: "audit", label: "Audit trail" },
    ],
  },
  {
    href: "/design-preview/supervision",
    title: "AI supervision brief",
    story: "Step 9",
    summary: "Grace's brief, already reflecting the note and the escalation.",
    states: [
      { id: "updated", label: "Updated brief" },
      { id: "approved", label: "Brief approved" },
    ],
  },
  {
    href: "/design-preview/overview",
    title: "Overview, then Before and after",
    story: "Steps 1 and 10",
    summary: "The director's view at the start and the end of the story.",
    states: [
      { id: "start", label: "Start of the story" },
      { id: "approved", label: "After the approval" },
      { id: "skipped", label: "After the time skip" },
      { id: "compare", label: "Before and after" },
    ],
  },
  {
    href: "/design-preview/presenter",
    title: "Presenter panel",
    story: "Throughout",
    summary: "Presenter controls, kept out of the product.",
    states: [
      { id: "live", label: "Live AI" },
      { id: "fallback", label: "Prepared fallback" },
      { id: "reset", label: "Confirm reset" },
      { id: "closed", label: "Closed" },
    ],
  },
  {
    href: "/design-preview/phone",
    title: "Phone layout",
    story: "Steps 3 to 5",
    summary: "My Day, dictate, review and approve at 390 by 844.",
    states: [],
  },
  {
    href: "/design-preview/roadmap",
    title: "Roadmap",
    story: "After the story",
    summary: "Future modules, clearly planned and not clickable.",
    states: [],
  },
];
