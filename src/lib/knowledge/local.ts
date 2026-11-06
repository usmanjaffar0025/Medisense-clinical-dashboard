import { directoryClients } from "@/data/client-directory";
import { clinicians } from "@/data/clinicians";
import { referrals } from "@/data/referrals";
import { answerQuestion, roleQuestions } from "@/lib/assistant";
import type { Answer, LiveState } from "./state";
import { norm, runToolByName, type ToolResult } from "./tools";

/**
 * The question router. It spots small talk, names, filters and the topic, and plans which
 * tools to run. The browser uses the plan to answer with no model at all; the server uses it
 * to fetch the records first, so the model needs one call instead of a tool loop.
 */

export type ToolCall = { name: string; input: Record<string, unknown> };

export type Plan =
  | { kind: "small-talk"; answer: Answer }
  | { kind: "curated" }
  | { kind: "tools"; calls: ToolCall[] }
  | { kind: "unknown" };

export type LocalAnswer = { answer: Answer; toolCalls: string[] };

const has = (q: string, pattern: RegExp) => pattern.test(q);

function toAnswer(result: ToolResult): Answer {
  return {
    title: result.title,
    intro: result.summary,
    items: result.items,
    sources: [result.source],
  };
}

// ---------- small talk ----------

const greeting =
  /^(hi+|hello+|hey+|hiya|yo|salam|assalam ?o? ?alaikum|aoa|good (morning|afternoon|evening)|howdy)\b/;
const thanks = /^(thanks?|thank you|thx|cheers|shukriya|jazakallah|great|nice|ok(ay)?|cool)\b/;
const whoAreYou = /(who|what) are you|kaun ho/;
const howAreYou = /how are you|how r u|kaise ho|kya haal/;
const aboutSystem =
  /how (does|do|will|would) (this|the|medisense|it)? ?(system|platform|app|software|medisense|it)? ?(work|help)|how (this|the|medisense) ?(system|platform|app)? works?|(this|the) (system|platform|app) works?|what (is|does) (this|the) (system|platform|app)|what is medisense|what (does|can) (this|medisense|the system|the platform|you) do|what can you do|how (do|can) you help|how (do|to) (i )?use (this|it|medisense)|help me|explain (this|the) (system|platform)|kaise kaam|kese kaam|system kya|kya kar sakt|ye kya hai/;

type Guide = { label: string; detail: string; href: string };

const guide: Record<string, Guide> = {
  practice: {
    label: "See the whole practice",
    detail:
      "Caseload health, team capacity and clients at risk of slipping through gaps, updated daily.",
    href: "/",
  },
  notes: {
    label: "Less admin for clinicians",
    detail:
      "AI drafts case notes and reports from what the clinician says or types; they review and approve.",
    href: "/case-notes/mia-robinson",
  },
  myDay: {
    label: "A clear day for each clinician",
    detail: "Visits, driving, drafts to approve and follow-ups in one place.",
    href: "/my-day",
  },
  intake: {
    label: "Faster intake",
    detail:
      "Referral details read automatically, duplicates caught, forms pre-filled from records.",
    href: "/intake",
  },
  tasks: {
    label: "Nothing missed",
    detail: "Follow-ups, escalations and compliance reminders created and tracked automatically.",
    href: "/tasks",
  },
  supervision: {
    label: "Better supervision",
    detail:
      "A brief with workload, overdue work and flagged cases, prepared two days before each session.",
    href: "/supervision/sarah-thompson",
  },
  families: {
    label: "Families stay informed",
    detail: "Approved updates, home programs and messages in the family portal.",
    href: "/portal",
  },
  safety: {
    label: "Safe by design",
    detail:
      "A person approves every AI output, AI never contacts clients, and every action is logged.",
    href: "/settings",
  },
};

const guideOrder: Record<LiveState["role"], (keyof typeof guide)[]> = {
  Leadership: ["practice", "notes", "intake", "tasks", "supervision", "families", "safety"],
  Admin: ["intake", "tasks", "practice", "notes", "families", "safety"],
  Supervisor: ["supervision", "practice", "notes", "tasks", "safety"],
  Clinician: ["myDay", "notes", "tasks", "families", "safety"],
};

/** "How does this work?" gets the same plain-language overview every time, with no model call. */
function systemGuide(state: LiveState): Answer {
  return {
    title: "How Medisense works",
    intro:
      "Medisense sits on top of your practice management system. It reads your records, spots what needs attention and prepares drafts, and your team reviews and approves everything. You can also ask me anything in plain English and I'll answer from your own records.",
    items: guideOrder[state.role].map((key) => guide[key]).filter((g): g is Guide => Boolean(g)),
    sources: [],
  };
}

/** Greetings, thanks and "how does this work" are answered instantly, without a model call. */
export function smallTalk(question: string, state: LiveState): Answer | null {
  const q = norm(question);
  if (aboutSystem.test(q) && q.split(" ").length <= 12) return systemGuide(state);
  const words = q.split(" ").length;
  const isGreeting = greeting.test(q) && words <= 4;
  const isThanks = thanks.test(q) && words <= 4;
  const isWho = whoAreYou.test(q) && words <= 8;
  const isHow = howAreYou.test(q) && words <= 6;
  if (!isGreeting && !isThanks && !isWho && !isHow) return null;

  const suggestions = roleQuestions[state.role].map((label) => ({ label, detail: "" }));
  if (isThanks) {
    return {
      title: "You're welcome.",
      intro: "Ask me anything else about clients, the team, the schedule, reports or compliance.",
      items: suggestions.slice(0, 3),
      sources: [],
    };
  }
  return {
    title: isHow ? "All good, and ready to help." : "Hello! I'm Ask Medisense.",
    intro:
      "I answer questions about your clients, team capacity, schedule, reports, tasks and compliance, using Medisense's own records, and link you to the screen where you can act. Try one of these, or ask your own:",
    items: suggestions,
    sources: [],
  };
}

// ---------- names and filters ----------

type Person = { kind: "clinician" | "client"; name: string };

/** Every person named in the question. Full names win; a first name counts only when unique. */
function findPeople(q: string): Person[] {
  const people: Person[] = [
    ...clinicians.map((c) => ({ kind: "clinician" as const, name: c.name })),
    ...directoryClients.map((c) => ({ kind: "client" as const, name: c.name })),
    ...referrals.map((r) => ({ kind: "client" as const, name: r.client })),
  ];
  const found = new Map<string, Person>();
  for (const p of people) if (q.includes(norm(p.name))) found.set(p.name, p);
  const words = new Set(q.split(" "));
  const first = (name: string) => norm(name).split(" ")[0] ?? "";
  for (const word of words) {
    const matches = people.filter((p) => first(p.name) === word);
    const names = [...new Set(matches.map((m) => m.name))];
    const only = matches[0];
    if (names.length === 1 && only && ![...found.values()].some((f) => first(f.name) === word)) {
      found.set(only.name, only);
    }
  }
  return [...found.values()];
}

function filters(q: string) {
  const weeks = q.match(/(?:next|within|in) (\d+) weeks?/)?.[1];
  const days = q.match(/(?:next|within|in) (\d+) days?/)?.[1];
  const within = days
    ? Number(days)
    : weeks
      ? Number(weeks) * 7
      : has(q, /this month|next month|30 days/)
        ? 30
        : has(q, /this week|next week|7 days/)
          ? 7
          : undefined;
  const day = (["mon", "tue", "wed", "thu", "fri", "sat", "sun"] as const).find((d) =>
    has(q, new RegExp(`\\b${d}`)),
  );
  return {
    funding: has(q, /\bndis\b/)
      ? "NDIS"
      : has(q, /aged care|support at home/)
        ? "Aged care"
        : undefined,
    region: has(q, /\bnorth\b/)
      ? "Brisbane North"
      : has(q, /\bsouth\b/)
        ? "Brisbane South"
        : undefined,
    discipline: has(q, /speech/)
      ? "Speech Pathology"
      : has(q, /\bot\b|occupational/)
        ? "Occupational Therapy"
        : undefined,
    priority: has(q, /\bhigh\b/) ? "High" : has(q, /medium/) ? "Medium" : undefined,
    within,
    day: day ?? (has(q, /\btoday\b/) ? "today" : has(q, /tomorrow/) ? "tomorrow" : undefined),
  };
}

const topics = [
  // "At risk" is a caseload status, so only the plural "risks" opens the wide view.
  [
    "risks",
    /worr|concern|red flag|\bproblems?\b|\bissues?\b|anything (i|we) should|fikr|masla|ndis audit|before the audit|\brisks\b/,
  ],
  ["supervision", /supervis|agenda|brief/],
  ["audit", /audit trail|\blog\b|history|who (approved|did)|what happened|activity|recent actions/],
  ["automations", /automation|\brules?\b|workflow/],
  [
    "compliance",
    /complian|expir|blue card|screening|registration|first aid|insurance|consent|agreement|renew/,
  ],
  ["referrals", /referral|intake|enquir/],
  ["forms", /\bforms?\b|submit/],
  ["reports", /report/],
  ["notes", /\bnotes?\b|documentation|backlog/],
  ["tasks", /task|follow up|to do|todo|escalat/],
  ["schedule", /schedul|appointment|visit|calendar|slot|driv|travel|route/],
  ["clinicians", /clinician|therapist|staff|team|capacity|burnout|workload|at risk|overload/],
  ["clients", /client|patient|participant|famil/],
  ["org", /overview|summary|kpi|how (are|is) (we|medisense)|overall|doing|time|admin hours/],
] as const;

type Topic = (typeof topics)[number][0];

function topicCalls(topic: Topic, q: string, f: ReturnType<typeof filters>): ToolCall[] {
  // Open questions about risk need the wide view: three tools, still one model call.
  if (topic === "risks") {
    return [
      { name: "get_org_summary", input: {} },
      { name: "list_compliance", input: { within_days: 30 } },
      { name: "list_tasks", input: { status: "escalated" } },
    ];
  }
  return [topicCall(topic, q, f)];
}

function topicCall(
  topic: Exclude<Topic, "risks">,
  q: string,
  f: ReturnType<typeof filters>,
): ToolCall {
  switch (topic) {
    case "supervision":
      return { name: "get_supervision", input: {} };
    case "audit":
      return { name: "get_audit_trail", input: {} };
    case "automations":
      return {
        name: "list_automations",
        input: has(q, /\boff\b|disabled/)
          ? { enabled: false }
          : has(q, /\bon\b|active|enabled/)
            ? { enabled: true }
            : {},
      };
    case "compliance":
      return {
        name: "list_compliance",
        input: {
          kind: has(q, /staff|clinician|blue card|screening|registration|first aid|insurance/)
            ? "Staff"
            : has(q, /client|plan|agreement|consent/)
              ? "Client"
              : undefined,
          within_days: f.within,
        },
      };
    case "referrals":
      return { name: "list_referrals", input: {} };
    case "forms":
      return { name: "list_forms", input: {} };
    case "reports":
      return {
        name: "list_reports",
        input: {
          status: has(q, /not started/)
            ? "Not started"
            : has(q, /draft/)
              ? "AI draft"
              : has(q, /in review/)
                ? "In review"
                : has(q, /approved/)
                  ? "Approved"
                  : has(q, /\bsent\b/)
                    ? "Sent"
                    : undefined,
          due_within_days: f.within ?? (has(q, /due|overdue|soon/) ? 14 : undefined),
        },
      };
    case "notes":
      return { name: "list_case_notes", input: {} };
    case "tasks":
      return {
        name: "list_tasks",
        input: {
          status: has(q, /escalat/)
            ? "escalated"
            : has(q, /overdue|late/)
              ? "overdue"
              : has(q, /done|complet/)
                ? "done"
                : "open",
        },
      };
    case "schedule":
      return { name: "get_schedule", input: { day: f.day } };
    case "clinicians":
      return {
        name: "list_clinicians",
        input: {
          region: f.region,
          discipline: f.discipline,
          status: has(q, /at risk|burnout|overload/)
            ? "At Risk"
            : has(q, /room|availab|capacity for|new client/)
              ? "available"
              : has(q, /monitor/)
                ? "Monitor"
                : undefined,
        },
      };
    case "clients":
      return {
        name: "list_clients",
        input: {
          funding: f.funding,
          region: f.region,
          priority: has(q, /priority|review/) ? f.priority : undefined,
          state: has(q, /\bnew\b/) ? "New" : has(q, /paused/) ? "Paused" : undefined,
          plan_review_within_days: has(q, /plan review|review/) ? (f.within ?? 30) : undefined,
        },
      };
    case "org":
      return { name: "get_org_summary", input: {} };
  }
}

function personCall(person: Person, q: string, f: ReturnType<typeof filters>): ToolCall {
  if (person.kind === "client") return { name: "get_client", input: { name: person.name } };
  const name = person.name;
  if (
    has(
      q,
      /schedul|week|visit|appointment|calendar|driv|slot|\bday\b|today|tomorrow|\b(mon|tue|wed|thu|fri)/,
    )
  ) {
    return { name: "get_schedule", input: { clinician: name, day: f.day } };
  }
  if (has(q, /task|follow/)) {
    return {
      name: "list_tasks",
      input: {
        owner: name,
        status: has(q, /overdue/) ? "overdue" : has(q, /done|complet/) ? "done" : "open",
      },
    };
  }
  if (has(q, /complian|blue card|screening|registration|first aid|insurance|expir/)) {
    return { name: "list_compliance", input: { person: name, within_days: 3650 } };
  }
  if (has(q, /supervis|agenda|brief/)) return { name: "get_supervision", input: {} };
  if (has(q, /report/)) return { name: "list_reports", input: { clinician: name } };
  return { name: "get_clinician", input: { name } };
}

/**
 * Decides how to answer. Pure: it runs no tools. The server passes `curated: false` because it
 * always wants records to hand to the model, never the hand-written answers.
 */
export function plan(question: string, state: LiveState, { curated = true } = {}): Plan {
  const q = norm(question);
  const talk = smallTalk(question, state);
  if (talk) return { kind: "small-talk", answer: talk };

  if (curated) {
    const suggested = Object.values(roleQuestions).flat().map(norm);
    if (suggested.includes(q)) return { kind: "curated" };
    if (has(q, /ruth/) && has(q, /paperwork|outstanding/)) return { kind: "curated" };
  }

  const f = filters(q);
  const calls: ToolCall[] = findPeople(q)
    .slice(0, 3)
    .map((p) => personCall(p, q, f));
  const topic = topics.find(([, re]) => has(q, re))?.[0];
  if (topic && calls.length === 0) calls.push(...topicCalls(topic, q, f));
  if (calls.length > 0) return { kind: "tools", calls };
  return { kind: "unknown" };
}

/** Answers without any model: runs the planned tools, or searches every record. */
export function answerLocally(question: string, state: LiveState): LocalAnswer {
  const p = plan(question, state);
  if (p.kind === "small-talk") return { answer: p.answer, toolCalls: [] };
  if (p.kind === "curated") return { answer: answerQuestion(question, state), toolCalls: [] };

  if (p.kind === "tools") {
    const results = p.calls
      .map((c) => runToolByName(state, c.name, c.input))
      .filter((r): r is ToolResult => r !== null);
    const [first, ...rest] = results;
    if (first) {
      const answer = toAnswer(first);
      // Two people named: show both, one after the other.
      for (const r of rest) {
        answer.intro += ` ${r.title}: ${r.summary}`;
        answer.items.push(...r.items.slice(0, 8));
        answer.sources.push(r.source);
      }
      return { answer, toolCalls: p.calls.map((c) => c.name) };
    }
  }

  const curated = answerQuestion(question, state);
  if (curated.title !== "I can help with these") return { answer: curated, toolCalls: [] };
  const search = runToolByName(state, "search_records", { query: question });
  if (search && search.items.length > 0)
    return { answer: toAnswer(search), toolCalls: ["search_records"] };
  return { answer: curated, toolCalls: ["search_records"] };
}
