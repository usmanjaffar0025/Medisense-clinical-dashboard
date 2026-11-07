import type { AiMeta, Prepared, SessionNote } from "@/lib/story/types";
import type { Role } from "@/lib/navigation";

/** Where Sarah's note for Oliver's visit has got to. */
export type StoryStage = "ready" | "complete" | "generating" | "draft" | "error" | "approved";

export type TaskChoice = "draft" | "confirmed" | "dismissed";

/** Something a rule did when a day passed. */
export type StoryEvent = {
  id: string;
  kind: "reminder" | "escalation" | "overdue";
  taskId: string;
  title: string;
  client: string;
  owner: string;
  daysLate: number;
};

export type Notice = { id: string; to: Role; text: string; href: string; read: boolean };

export type StoryState = {
  stage: StoryStage;
  transcript: string;
  note: SessionNote | null;
  noteMeta: AiMeta | null;
  error: string | null;
  handledPrompts: string[];
  approvedAt: string | null;
  edits: number;
  prepareStatus: "idle" | "preparing" | "ready";
  prepared: Prepared | null;
  preparedMeta: AiMeta | null;
  /** The note was reopened, so what it prepared no longer matches it. */
  outdated: boolean;
  taskChoices: Record<string, TaskChoice>;
  taskOwners: Record<string, string>;
  reportStatus: "review" | "approved";
  reportEdits: Record<string, string>;
  formStatus: "draft" | "approved";
  formValues: Record<string, string>;
  /** Calendar days the presenter has moved forward from today. */
  dayOffset: number;
  lastSkip: StoryEvent[];
  notices: Notice[];
  /** AI results keyed by what they were written from, so a call is made once per change. */
  ai: Record<string, { data: unknown; meta: AiMeta }>;
  lastAi: (AiMeta & { kind: string }) | null;
  briefApprovedKey: string | null;
};

export const initialStory: StoryState = {
  stage: "ready",
  transcript: "",
  note: null,
  noteMeta: null,
  error: null,
  handledPrompts: [],
  approvedAt: null,
  edits: 0,
  prepareStatus: "idle",
  prepared: null,
  preparedMeta: null,
  outdated: false,
  taskChoices: {},
  taskOwners: {},
  reportStatus: "review",
  reportEdits: {},
  formStatus: "draft",
  formValues: {},
  dayOffset: 0,
  lastSkip: [],
  notices: [],
  ai: {},
  lastAi: null,
  briefApprovedKey: null,
};

export const storyTaskId = (id: string) => `t-story-${id}`;
