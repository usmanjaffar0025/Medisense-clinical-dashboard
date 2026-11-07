import { dt, wd } from "@/lib/clock";
import type { Brief, Prepared, SessionNote } from "@/lib/story/types";

/**
 * The connected story: Sarah Thompson's day and Oliver Grant's home visit. Live AI writes the
 * drafts; the prepared versions here are used only if a call fails, on the unchanged sample.
 */

export const oliverContext =
  "Oliver Grant, 6, paediatric occupational therapy (NDIS), focus on fine motor skills. Earlier approved notes: grip aid introduced in April, shape copying started in July, fatigue during table work noted since September.";

export type VisitState = "done" | "just-finished" | "next" | "later";

export type Visit = {
  id: string;
  start: string;
  end: string;
  client: string;
  service: string;
  place: string;
  kind: "Home visit" | "Telehealth";
  /** Minutes of driving from the previous visit; 0 for telehealth or the first visit. */
  driveBefore: number;
  leaveBy?: string;
  state: VisitState;
  note: string;
};

export const sarahDay: Visit[] = [
  {
    id: "henry",
    start: "8:15",
    end: "9:05 am",
    client: "Henry Ng",
    service: "Home modifications",
    place: "Wavell Heights",
    kind: "Home visit",
    driveBefore: 0,
    state: "done",
    note: "Note approved",
  },
  {
    id: "oliver",
    start: "9:30",
    end: "10:15 am",
    client: "Oliver Grant",
    service: "Paediatric OT, fine motor",
    place: "Kedron",
    kind: "Home visit",
    driveBefore: 15,
    state: "just-finished",
    note: "Finished 10:15 am. Oliver's mum was there for the whole visit.",
  },
  {
    id: "isla",
    start: "11:30",
    end: "12:20 pm",
    client: "Isla Murphy",
    service: "Paediatric OT, sensory",
    place: "Aspley",
    kind: "Home visit",
    driveBefore: 20,
    leaveBy: "11:10 am",
    state: "next",
    note: "Her parent's call-back is still open.",
  },
  {
    id: "zara",
    start: "1:00",
    end: "1:40 pm",
    client: "Zara Ahmed",
    service: "Home program review",
    place: "Video call",
    kind: "Telehealth",
    driveBefore: 0,
    state: "later",
    note: "",
  },
  {
    id: "ava",
    start: "2:30",
    end: "3:20 pm",
    client: "Ava Mitchell",
    service: "Handwriting and fine motor",
    place: "Chermside",
    kind: "Home visit",
    driveBefore: 15,
    state: "later",
    note: "",
  },
];

export const visitDetails = [
  { label: "Client", value: "Oliver Grant, 6" },
  { label: "Visit", value: "Today, 9:30 to 10:15 am" },
  { label: "Service", value: "Paediatric OT, NDIS" },
  { label: "Place", value: "Home, Kedron" },
];

export const oliverGoals = [
  "Hold a pencil with a mature grip for a full school task",
  "Copy basic shapes well enough to start letter formation",
];

export const sarahSupervisionSlot = `${dt("Thursday 22 October")}, 2:00 pm, video call with Grace Liu`;

/** What the sample dictation says, one finished phrase per line. */
export const sampleDictation = [
  "Oliver's mum says he's been using the grip aid at school and getting less frustrated.",
  `She gave me a new paediatrician report dated ${dt("14 Oct")}, which recommends further assessment.`,
  "We worked on pencil grip with the triangular grip aid and did shape copying.",
  "Circle and cross are fine now, the square is still hard.",
  "He tires after about ten minutes of table work.",
  "I think endurance is holding him back more than grip at this point.",
  "Home program is playdough and tweezer games, five minutes a day, mum will run it.",
  `I want to talk about the report with Grace in supervision on ${wd("Thursday")}.`,
];

export const preparedNote: SessionNote = {
  sections: {
    subjective: [
      {
        id: "s1",
        text: "Oliver's mother reports he is using the grip aid at school and is less frustrated.",
        line: 1,
      },
      {
        id: "s2",
        text: `She provided a new paediatrician report dated ${dt("14 October")}, which recommends further assessment.`,
        line: 2,
      },
    ],
    objective: [
      {
        id: "o1",
        text: "Practised pencil grip with a triangular grip aid and completed shape copying tasks.",
        line: 3,
      },
      { id: "o2", text: "Circle and cross copied accurately; square not yet achieved.", line: 4 },
      { id: "o3", text: "Tires after about 10 minutes of table-top work.", line: 5 },
    ],
    assessment: [
      {
        id: "a1",
        text: "Endurance appears to be limiting table-top work more than grip at this stage.",
        line: 6,
      },
    ],
    plan: [
      { id: "p1", text: "Mother to run playdough and tweezer games for 5 minutes daily.", line: 7 },
      {
        id: "p2",
        text: `Discuss the paediatrician report with Grace Liu in supervision on ${dt("Thu 22 Oct")}.`,
        line: 8,
      },
    ],
  },
  missing: [
    { id: "m1", text: "The paediatrician report isn't on Oliver's record yet." },
    { id: "m2", text: "Endurance wasn't measured with a standard tool." },
  ],
};

export const preparedOutputs: Prepared = {
  report: [
    {
      name: "Interventions delivered",
      text: "Pencil grip practice with a triangular grip aid and shape copying tasks, with a home program of playdough and tweezer games.",
      from: "This note and 5 earlier notes",
      sources: ["o1"],
    },
    {
      name: "Observed progress",
      text: "Oliver now copies circles and crosses accurately. Squares are not yet achieved. He is using his grip aid at school, and his mother reports less frustration.",
      from: "This note and 5 earlier notes",
      sources: ["s1", "o2"],
    },
    {
      name: "Barriers",
      text: "He tires after about 10 minutes of table-top work. Endurance appears to limit table-top work more than grip at this stage.",
      from: "This note",
      sources: ["o3", "a1"],
    },
  ],
  formReason: "A paediatrician's report recommends further assessment.",
  formSources: ["s2"],
  tasks: [
    {
      id: "task-1",
      title: "Upload the paediatrician report to Oliver's record",
      owner: "Admin team",
      dueInWorkingDays: 1,
      type: "Document request",
      sentenceId: "s2",
    },
    {
      id: "task-2",
      title: "Send the home program to Oliver's mum",
      owner: "Sarah Thompson",
      dueInWorkingDays: 1,
      type: "Communication",
      sentenceId: "p1",
    },
    {
      id: "task-3",
      title: "Add Oliver's report to Thursday's supervision",
      owner: "Sarah Thompson",
      dueInWorkingDays: 2,
      type: "Supervision",
      sentenceId: "p2",
    },
  ],
};

export const reportTitle = "NDIS progress report";
export const reportPeriod = `${dt("14 April")} to ${dt("20 October")}`;
export const reportFixedSections = [
  { name: "Current goals", from: "NDIS plan", filled: true },
  { name: "Recommended next steps", from: "Yours to write", filled: false },
];

export const formTitle = "Further assessment request";

/** Fields filled straight from verified records, with no AI involved in the values. */
export const formRecordFields = [
  { label: "Client name", value: "Oliver Grant", from: "Client record" },
  { label: "Date of birth", value: "12/03/2020", from: "Client record" },
  { label: "NDIS number", value: "430 118 276", from: "NDIS plan" },
  { label: "Plan dates", value: `${dt("1 Aug 2026")} to ${dt("31 Jul 2027")}`, from: "NDIS plan" },
  { label: "Parent or guardian", value: "Claire Grant", from: "Client record" },
  { label: "Contact number", value: "0400 555 014", from: "Client record" },
  { label: "Treating clinician", value: "Sarah Thompson, OT", from: "Staff record" },
  { label: "Paediatrician report date", value: dt("14 October 2026"), from: "This note" },
];

export const formPersonFields = [
  { id: "provider", label: "Assessment provider" },
  { id: "consent", label: "Parent consent" },
  { id: "attachment", label: "Paediatrician report attachment" },
];

export const notRepeatedSteps = [
  "Typing Oliver's details into the assessment form",
  "Rewriting today's session for the progress report",
  "Copying next steps into the task list",
  "Adding the report to Grace's supervision brief",
];

export const adminTeam = ["Jo Marsh", "Sam Doyle"];

/** Overdue follow-ups across the team with nobody assigned, before the story starts. */
export const unownedFollowUpsAtStart = 5;

export type BriefFacts = {
  notesToWrite: number;
  noteApproved: boolean;
  uploadOwned: boolean;
  escalated: string[];
};

/** The brief used only if a live call fails; it says the same facts in fixed words. */
export function preparedBrief(facts: BriefFacts): Brief {
  const words = ["No", "One", "Two", "Three", "Four", "Five"];
  return {
    items: [
      {
        heading: "Overdue documentation",
        text: `${words[facts.notesToWrite] ?? facts.notesToWrite} clinical notes remain incomplete.`,
        source: "Notes, today",
      },
      {
        heading: "Complex cases",
        text: facts.noteApproved
          ? `Oliver Grant has a new paediatrician report recommending further assessment.${facts.uploadOwned ? " The admin team is uploading it to his record." : ""}`
          : "Two complex clients have recent changes requiring discussion: Oliver Grant and Ruth Hallam.",
        source: facts.noteApproved ? "Approved note, Plan" : "Caseload",
      },
      {
        heading: "Pending follow-ups",
        text: facts.escalated.length
          ? `${facts.escalated.join(" and ")} escalated to you for being more than 3 days late.`
          : "Five client follow-ups are due, three of them overdue.",
        source: "Tasks",
      },
      {
        heading: "Workload changes",
        text: "Caseload increased 18% over six weeks. Admin hours exceeded the target for three consecutive weeks.",
        source: "Caseload, last 6 weeks",
      },
    ],
    points: [
      "What would make Oliver's further assessment easier to organise?",
      "Which of Sarah's remaining notes needs clinical input rather than time?",
      "Would moving some clients help more than clearing the backlog?",
    ],
  };
}

export const preparedBriefing = {
  start:
    "Sarah Thompson is the one to look at today. She's at 108% of capacity with 6 high-complexity clients, and her notes to write are the part that can change this week.",
  changed:
    "Sarah has approved Oliver Grant's note, so she has one fewer note to write. She's still At Risk because her caseload hasn't changed.",
};

export const preparedDaySummary = {
  start:
    "Five visits today, about 50 minutes of driving. Oliver's note is the one to do now, while it's fresh.",
  done: "Oliver's note is done. You have about 20 minutes before you leave for Isla's visit in Aspley.",
};

export const aiQuestions = [
  "Why is Sarah At Risk?",
  "Who has room for more clients?",
  "What should I look at first?",
];

export const roadmap = [
  {
    phase: "In the field",
    why: "Therapists work from cars and client homes, so this comes first.",
    modules: [
      {
        name: "Staff mobile app",
        href: "/mobile/staff",
        does: "My day, AI dictation and note approval, with visits available offline.",
      },
      {
        name: "Patient mobile app",
        href: "/mobile/family",
        does: "Visit times, home programs, approved documents and messages for families.",
      },
      {
        name: "Telehealth",
        href: "/telehealth",
        does: "Video visits started from the schedule, with an AI note draft ready afterwards.",
      },
    ],
  },
  {
    phase: "Getting paid",
    why: "Approved notes already hold most of what a claim needs.",
    modules: [
      {
        name: "Billing and claims",
        href: "/billing",
        does: "AI prepares NDIS and aged care claims from delivered sessions, and a person approves them.",
      },
    ],
  },
  {
    phase: "Larger organisations",
    why: "Relevant only if the platform grows beyond allied health providers.",
    modules: [
      {
        name: "Hospital operations",
        href: "/hospital",
        does: "Inpatient, ward and theatre workflows, using the same review and approval model.",
      },
      {
        name: "ERP",
        href: "/erp",
        does: "Finance, HR, payroll and purchasing connected to clinical activity.",
      },
    ],
  },
];
