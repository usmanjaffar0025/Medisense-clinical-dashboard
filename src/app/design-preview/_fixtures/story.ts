/**
 * Fictional content for the design preview. Dates sit on the repo's anchor day, Tuesday
 * 20 October 2026, and are written out in full so the mock-ups can be reviewed as a fixed story.
 */

export const story = {
  today: "Tuesday 20 October 2026",
  tomorrow: "Wednesday 21 October 2026",
};

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

export const sarahNotesDue = [
  { client: "Oliver Grant", detail: "Today's visit", status: "Due today" },
  { client: "Ruth Hallam", detail: "Session 6 Oct, 14 days late", status: "Overdue" },
  { client: "Ava Mitchell", detail: "Session 11 Oct, 9 days late", status: "Overdue" },
  { client: "Lucas Brennan", detail: "Session 17 Oct, 3 days late", status: "Overdue" },
] as const;

export const sarahTasks = [
  { title: "Return parent call about sensory diet", client: "Isla Murphy", due: "3 days late" },
  { title: "Rebook appointment", client: "James Thompson", due: "2 days late" },
];

/** What Sarah says, one line per finished phrase. */
export const dictation = [
  "Oliver's mum says he's been using the grip aid at school and getting less frustrated.",
  "She gave me a new paediatrician report dated the 14th, which recommends further assessment.",
  "We worked on pencil grip with the triangular grip aid and did shape copying.",
  "Circle and cross are fine now, the square is still hard.",
  "He tires after about ten minutes of table work.",
  "I think endurance is holding him back more than grip at this point.",
  "Home program is playdough and tweezer games, five minutes a day, mum will run it.",
  "I want to talk about the report with Grace in supervision on Thursday.",
];

export type NoteSentence = { id: string; text: string; line: number; edited?: string };
export type NoteSection = { id: string; title: string; sentences: NoteSentence[] };

export const noteSections: NoteSection[] = [
  {
    id: "subjective",
    title: "Subjective",
    sentences: [
      {
        id: "s1",
        text: "Oliver's mother reports he is using the grip aid at school and is less frustrated.",
        line: 1,
      },
      {
        id: "s2",
        text: "She provided a new paediatrician report dated 14 October, which recommends further assessment.",
        line: 2,
      },
    ],
  },
  {
    id: "objective",
    title: "Objective",
    sentences: [
      {
        id: "o1",
        text: "Practised pencil grip with a triangular grip aid and completed shape copying tasks.",
        line: 3,
      },
      { id: "o2", text: "Circle and cross copied accurately; square not yet achieved.", line: 4 },
      {
        id: "o3",
        text: "Tires after about 10 minutes of table-top work.",
        line: 5,
        edited:
          "Tires after about 10 minutes of table-top work, then settles after a movement break.",
      },
    ],
  },
  {
    id: "assessment",
    title: "Assessment",
    sentences: [
      {
        id: "a1",
        text: "Endurance appears to be limiting table-top work more than grip at this stage.",
        line: 6,
      },
    ],
  },
  {
    id: "plan",
    title: "Plan",
    sentences: [
      { id: "p1", text: "Mother to run playdough and tweezer games for 5 minutes daily.", line: 7 },
      {
        id: "p2",
        text: "Discuss the paediatrician report with Grace Liu in supervision on Thu 22 Oct.",
        line: 8,
      },
    ],
  },
];

export const missingPrompts = [
  { id: "report", text: "The paediatrician report isn't on Oliver's record yet." },
  { id: "measure", text: "Endurance wasn't measured with a standard tool." },
];

export const visitDetails = [
  { label: "Client", value: "Oliver Grant, 6" },
  { label: "Visit", value: "Today, 9:30 to 10:15 am" },
  { label: "Service", value: "Paediatric OT, NDIS" },
  { label: "Place", value: "Home, Kedron" },
];

export const prepared = {
  report: {
    title: "NDIS progress report",
    period: "14 April to 20 October",
    sources: ["s1", "o1", "o2", "o3", "a1"],
    sections: [
      { name: "Current goals", from: "NDIS plan", filled: true },
      { name: "Interventions delivered", from: "This note and 5 earlier notes", filled: true },
      { name: "Observed progress", from: "This note and 5 earlier notes", filled: true },
      { name: "Barriers", from: "This note", filled: true },
      { name: "Recommended next steps", from: "Yours to write", filled: false },
    ],
  },
  form: {
    title: "Further assessment request",
    filled: 9,
    total: 12,
    sources: ["s2"],
    needsPerson: ["Assessment provider", "Parent consent", "Paediatrician report attachment"],
  },
  tasks: [
    {
      id: "upload",
      title: "Upload the paediatrician report to Oliver's record",
      owner: "Admin team",
      due: "Wed 21 Oct",
      source: "s2",
    },
    {
      id: "program",
      title: "Send the home program to Oliver's mum",
      owner: "Sarah Thompson",
      due: "Wed 21 Oct",
      source: "p1",
    },
    {
      id: "supervision",
      title: "Add Oliver's report to Thursday's supervision",
      owner: "Sarah Thompson",
      due: "Thu 22 Oct",
      source: "p2",
    },
  ],
  notRepeated: [
    "Typing Oliver's details into the assessment form",
    "Rewriting today's session for the progress report",
    "Copying next steps into the task list",
    "Adding the report to Grace's supervision brief",
  ],
};

export type OverviewStage = "start" | "approved" | "skipped";

type Figure = Record<OverviewStage, number>;

export const orgFigures: {
  id: string;
  label: string;
  caption: Record<OverviewStage, string>;
  figure: Figure;
}[] = [
  {
    id: "clinicians",
    label: "Active clinicians",
    figure: { start: 12, approved: 12, skipped: 12 },
    caption: {
      start: "7 OT, 5 Speech Pathology",
      approved: "7 OT, 5 Speech Pathology",
      skipped: "7 OT, 5 Speech Pathology",
    },
  },
  {
    id: "clients",
    label: "Active clients",
    figure: { start: 184, approved: 184, skipped: 184 },
    caption: {
      start: "128 NDIS, 56 aged care",
      approved: "128 NDIS, 56 aged care",
      skipped: "128 NDIS, 56 aged care",
    },
  },
  {
    id: "near",
    label: "Clinicians near capacity",
    figure: { start: 3, approved: 3, skipped: 3 },
    caption: {
      start: "At or above 95% of capacity",
      approved: "At or above 95% of capacity",
      skipped: "At or above 95% of capacity",
    },
  },
  {
    id: "review",
    label: "Clients requiring review",
    figure: { start: 14, approved: 14, skipped: 14 },
    caption: {
      start: "2 high, 7 medium, 5 review",
      approved: "2 high, 7 medium, 5 review",
      skipped: "2 high, 7 medium, 5 review",
    },
  },
  {
    id: "notes",
    label: "Notes due",
    figure: { start: 17, approved: 16, skipped: 16 },
    caption: {
      start: "12 overdue, 5 drafts to approve",
      approved: "11 overdue, 5 drafts to approve",
      skipped: "11 overdue, 5 drafts to approve",
    },
  },
  {
    id: "followups",
    label: "Follow-ups overdue",
    figure: { start: 11, approved: 11, skipped: 12 },
    caption: {
      start: "5 have no owner",
      approved: "4 have no owner",
      skipped: "4 have no owner",
    },
  },
  {
    id: "supervision",
    label: "Supervision due",
    figure: { start: 4, approved: 4, skipped: 4 },
    caption: {
      start: "Next 14 days",
      approved: "Next 14 days",
      skipped: "Next 14 days",
    },
  },
  {
    id: "escalated",
    label: "Tasks escalated",
    figure: { start: 7, approved: 7, skipped: 8 },
    caption: {
      start: "More than 3 days late",
      approved: "More than 3 days late",
      skipped: "More than 3 days late",
    },
  },
];

export type WorkloadStatus = "At Risk" | "Watch" | "Healthy";

export const caseloadRows: {
  id: string;
  name: string;
  meta: string;
  active: number;
  capacity: number;
  notes: Figure;
  followUps: Figure;
  score: Figure;
  status: WorkloadStatus;
  history: number[];
}[] = [
  {
    id: "sarah",
    name: "Sarah Thompson",
    meta: "OT, Brisbane North",
    active: 27,
    capacity: 25,
    notes: { start: 4, approved: 3, skipped: 3 },
    followUps: { start: 3, approved: 3, skipped: 3 },
    score: { start: 83, approved: 80, skipped: 80 },
    status: "At Risk",
    history: [61, 62, 64, 65, 67, 69, 71, 73, 75, 78, 81, 83],
  },
  {
    id: "jessica",
    name: "Jessica Nguyen",
    meta: "OT, Brisbane North",
    active: 24,
    capacity: 24,
    notes: { start: 3, approved: 3, skipped: 3 },
    followUps: { start: 2, approved: 2, skipped: 2 },
    score: { start: 72, approved: 72, skipped: 72 },
    status: "Watch",
    history: [52, 53, 54, 56, 57, 59, 60, 62, 64, 66, 69, 72],
  },
  {
    id: "marcus",
    name: "Marcus Bell",
    meta: "Speech Pathology, Brisbane South",
    active: 23,
    capacity: 24,
    notes: { start: 2, approved: 2, skipped: 2 },
    followUps: { start: 2, approved: 2, skipped: 2 },
    score: { start: 66, approved: 66, skipped: 66 },
    status: "Watch",
    history: [50, 51, 52, 54, 55, 56, 58, 59, 60, 62, 64, 66],
  },
  {
    id: "daniel",
    name: "Daniel Okafor",
    meta: "OT, Brisbane South",
    active: 22,
    capacity: 25,
    notes: { start: 1, approved: 1, skipped: 1 },
    followUps: { start: 1, approved: 1, skipped: 1 },
    score: { start: 49, approved: 49, skipped: 49 },
    status: "Healthy",
    history: [42, 43, 43, 44, 44, 45, 46, 46, 47, 48, 48, 49],
  },
  {
    id: "hannah",
    name: "Hannah Wright",
    meta: "OT, Brisbane North",
    active: 15,
    capacity: 18,
    notes: { start: 2, approved: 2, skipped: 2 },
    followUps: { start: 0, approved: 0, skipped: 1 },
    score: { start: 44, approved: 44, skipped: 44 },
    status: "Healthy",
    history: [38, 38, 39, 40, 40, 41, 42, 42, 43, 43, 44, 44],
  },
];

export const weekLabels = [
  "3 Aug",
  "10 Aug",
  "17 Aug",
  "24 Aug",
  "31 Aug",
  "7 Sep",
  "14 Sep",
  "21 Sep",
  "28 Sep",
  "5 Oct",
  "12 Oct",
  "19 Oct",
];

export const beforeAfter = {
  fromNote: [
    {
      measure: "Sarah's overdue notes",
      before: "4",
      after: "3",
      why: "Oliver Grant's note was approved.",
      audit: "Tue 10:46",
    },
    {
      measure: "Notes due across the team",
      before: "17",
      after: "16",
      why: "The same note, counted once for the team.",
      audit: "Tue 10:46",
    },
    {
      measure: "Follow-ups with no owner",
      before: "5",
      after: "4",
      why: "Sarah confirmed the report upload for the admin team.",
      audit: "Tue 10:49",
    },
    {
      measure: "Sarah's workload score",
      before: "83",
      after: "80",
      why: "Overdue documentation now carries 3 fewer points. She stays At Risk, which starts at 80.",
      audit: "Tue 10:46",
    },
  ],
  fromDay: [
    {
      measure: "Tasks escalated",
      before: "7",
      after: "8",
      why: "Isla Murphy's call-back passed 3 days late and went to Grace Liu.",
      audit: "Wed 08:00",
    },
    {
      measure: "Follow-ups overdue",
      before: "11",
      after: "12",
      why: "Poppy Shaw's call was due on Tuesday and is still open.",
      audit: "Wed 08:00",
    },
  ],
  unchanged:
    "Sarah still has 27 active clients against a capacity of 25, including 6 high-complexity clients. That needs a caseload decision, not a tidier backlog.",
};

export type QueueStatus = "Scheduled" | "Due today" | "Overdue" | "Escalated" | "Done";

export type QueueRow = {
  id: string;
  title: string;
  client: string;
  source: string;
  fromAi: boolean;
  owner: string;
  mine: boolean;
  due: string;
  priority: "High" | "Medium" | "Low";
  status: QueueStatus;
  isNew?: boolean;
};

export const queueRows: QueueRow[] = [
  {
    id: "henry",
    title: "Chase equipment quote",
    client: "Henry Ng",
    source: "AI found in a note, 8 Oct",
    fromAi: true,
    owner: "Jo Marsh",
    mine: true,
    due: "Wed 14 Oct, 4 days late",
    priority: "Medium",
    status: "Escalated",
  },
  {
    id: "ruth",
    title: "Get a builder quote for the home modification",
    client: "Ruth Hallam",
    source: "Funding form, 19 Oct",
    fromAi: false,
    owner: "Jo Marsh",
    mine: true,
    due: "Today",
    priority: "High",
    status: "Due today",
  },
  {
    id: "upload",
    title: "Upload the paediatrician report to Oliver's record",
    client: "Oliver Grant",
    source: "AI found in Sarah's note, today",
    fromAi: true,
    owner: "Admin team",
    mine: false,
    due: "Wed 21 Oct",
    priority: "Medium",
    status: "Scheduled",
    isNew: true,
  },
  {
    id: "sophie",
    title: "Request signed telehealth consent",
    client: "Sophie Williams",
    source: "Compliance rule",
    fromAi: false,
    owner: "Jo Marsh",
    mine: true,
    due: "Wed 21 Oct",
    priority: "Medium",
    status: "Scheduled",
  },
  {
    id: "leila",
    title: "Book first home visit",
    client: "Leila Haddad",
    source: "AI read a referral, 19 Oct",
    fromAi: true,
    owner: "Admin team",
    mine: false,
    due: "Fri 23 Oct",
    priority: "Medium",
    status: "Scheduled",
  },
];

export const skipAudit = [
  {
    time: "08:00",
    actor: "Automation",
    role: "Reminder rule",
    action: "Sent a due-today reminder to the admin team",
    object: "Oliver Grant, upload paediatrician report",
  },
  {
    time: "08:00",
    actor: "Automation",
    role: "Escalation rule",
    action: "Escalated to Grace Liu, more than 3 days overdue",
    object: "Isla Murphy, return parent call",
  },
  {
    time: "08:00",
    actor: "Automation",
    role: "Due-date check",
    action: "Marked overdue, was due Tue 20 Oct",
    object: "Poppy Shaw, call parent about school visit",
  },
  {
    time: "08:00",
    actor: "Medisense AI",
    role: "AI brief update",
    action: "Added the escalation to the brief",
    object: "Sarah Thompson, session Thu 22 Oct",
  },
  {
    time: "08:12",
    actor: "Neil Hensley",
    role: "Leadership",
    action: "Opened the escalation",
    object: "Isla Murphy, return parent call",
  },
];

export const brief = [
  {
    heading: "Overdue documentation",
    updated: "AI updated Tue 10:46",
    text: "Three clinical notes remain incomplete.",
    previous: "This said four until Sarah approved Oliver Grant's note.",
    source: "Approved note, 20 Oct",
  },
  {
    heading: "Complex cases",
    updated: "AI updated Tue 10:49",
    text: "Oliver Grant has a new paediatrician report recommending further assessment. The admin team is uploading it to his record.",
    previous: "",
    source: "Approved note, Plan",
  },
  {
    heading: "Pending follow-ups",
    updated: "AI updated Wed 08:00",
    text: "Isla Murphy's parent call-back is 4 days overdue and has been escalated to you.",
    previous: "",
    source: "Tasks, escalation rule",
  },
  {
    heading: "Workload changes",
    updated: "",
    text: "Caseload increased 18% over six weeks. Admin hours exceeded the target for three consecutive weeks.",
    previous: "",
    source: "Caseload, last 6 weeks",
  },
];

export const roadmap = [
  {
    phase: "In the field",
    why: "Therapists work from cars and client homes, so this comes first.",
    modules: [
      {
        name: "Staff mobile app",
        does: "My day, AI dictation and note approval, with visits available offline.",
      },
      {
        name: "Patient mobile app",
        does: "Visit times, home programs, approved documents and messages for families.",
      },
      {
        name: "Telehealth",
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
        does: "Inpatient, ward and theatre workflows, using the same review and approval model.",
      },
      {
        name: "ERP",
        does: "Finance, HR, payroll and purchasing connected to clinical activity.",
      },
    ],
  },
];

export const aiBriefing = {
  start:
    "Sarah Thompson is the one to look at today. She's at 108% of capacity with 6 high-complexity clients, and her overdue documentation is the part that can change this week. Jessica Nguyen and Marcus Bell are next.",
  approved:
    "Sarah approved Oliver Grant's note at 10:46 am. Her overdue notes are down by one, and a follow-up that had no owner is now with the admin team. She's still At Risk because her caseload hasn't changed.",
  skipped:
    "One note was approved yesterday and a day has passed. Sarah's numbers have held. One task escalated overnight and one became overdue, so Grace Liu has something new to raise on Thursday.",
};

export const aiQuestions = [
  {
    q: "Why is Sarah At Risk?",
    a: "Her score combines 27 clients against a capacity of 25, 6 high-complexity clients, overdue notes, follow-ups and 9 admin hours against a target of 7. Capacity carries the most weight.",
    source: "From: score breakdown, caseload",
  },
  {
    q: "Who has room for more clients?",
    a: "Emma Clarke is an OT in Brisbane North with 18 clients against a capacity of 24. Allowing for complexity, that's about four additional clients.",
    source: "From: team capacity",
  },
  {
    q: "What should I look at first?",
    a: "Start with Sarah's caseload, then the 5 follow-ups with no owner. Both affect clients this week.",
    source: "From: caseloads, tasks",
  },
];

export const aiDiscussionPoints = [
  "What would make Oliver's further assessment easier to organise?",
  "Which of Sarah's three remaining notes needs clinical input rather than time?",
  "Would moving some clients help more than clearing the backlog?",
];
