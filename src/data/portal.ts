import { dt } from "@/lib/clock";
/** What Emily Carter's parent sees in the family portal. Plain language, approved content only. */
export const portalFamily = {
  clientId: "emily-carter",
  client: "Emily",
  viewer: "Rachel Carter",
  viewerRole: "Parent",
  clinician: "Hannah Wright",
  clinicianRole: "Occupational Therapist",
  nextAppointment: {
    when: `${dt("Tuesday 27 October")}, 8:30 am`,
    where: "Home visit · Kedron",
    with: "Hannah Wright",
  },
  upcoming: [
    { when: `${dt("Tue 27 Oct")}, 8:30 am`, what: "Home visit · Kedron" },
    { when: `${dt("Thu 5 Nov")}, 9:00 am`, what: "School visit · Kedron State School" },
    { when: dt("Fri 6 Nov"), what: "NDIS plan review (with your support coordinator)" },
  ],
  homeProgram: [
    {
      id: "hp1",
      task: "Get dressed with the picture checklist",
      detail: "School mornings · time it if Emily wants to",
    },
    {
      id: "hp2",
      task: "Five minutes of tracing or letter games",
      detail: "After school, 4 days a week",
    },
    {
      id: "hp3",
      task: "Practise the 'stop, breathe, choose' card",
      detail: "Before leaving for school",
    },
    {
      id: "hp4",
      task: "Heavy-work job before homework",
      detail: "Carry the washing basket or push a trolley",
    },
  ],
  goals: [
    {
      text: "Getting dressed for school on her own in 15 minutes",
      plain: "Almost there: about 17 minutes now, down from 30.",
      progress: 87,
    },
    {
      text: "Neat handwriting for three sentences",
      plain: "Two out of three sentences are easy to read.",
      progress: 67,
    },
    {
      text: "Calming strategy at school with one reminder or less",
      plain: "Needs about two reminders now, down from four.",
      progress: 58,
    },
  ],
  documents: [
    { name: "Service agreement", date: dt("12 Nov 2025"), gated: false },
    { name: "Home program (October)", date: dt("16 Oct 2026"), gated: false },
    { name: "Progress report for plan review", date: dt("Oct 2026"), gated: true },
  ],
  messages: [
    {
      from: "Hannah Wright",
      at: `${dt("Fri 16 Oct")}, 4:10 pm`,
      text: "Hi Rachel, great session today. Emily dressed in 17 minutes! I've added the new tracing games to her home program.",
    },
    {
      from: "Rachel Carter",
      at: `${dt("Fri 16 Oct")}, 7:32 pm`,
      text: "Thank you! She was so proud. Will the report be ready before the plan review?",
    },
    {
      from: "Hannah Wright",
      at: `${dt("Mon 19 Oct")}, 9:05 am`,
      text: "Yes, I'm finishing it this week and you'll see it here once it's approved.",
    },
  ],
};

/** The fictional family's demo sign-in. This is a demo gate, not real authentication. */
export const portalLogin = { email: "rachel.carter@example.com", code: "482913" };

/** What the clinic controls about the portal. */
export const portalSettings = [
  {
    id: "goals",
    label: "Show goals and progress",
    detail: "Plain-language summary written from approved notes",
  },
  { id: "program", label: "Show home program", detail: "Families can tick off practice at home" },
  {
    id: "reports",
    label: "Share reports after approval",
    detail: "Nothing appears until the clinician approves it",
  },
  {
    id: "messages",
    label: "Allow messages",
    detail: "Messages create a task for the clinician to reply",
  },
  {
    id: "rebook",
    label: "Allow change requests",
    detail: "Requests go to the admin team; nothing changes automatically",
  },
] as const;

export type PortalSettingId = (typeof portalSettings)[number]["id"];
