import { dt, wd } from "@/lib/clock";
export type Appointment = {
  time: string;
  client: string;
  detail: string;
  state: "past" | "current" | "next" | "upcoming";
  note?: { label: string; href?: string };
};

export const hannahDay = {
  firstName: "Hannah",
  name: "Hannah Wright",
  summary: "5 appointments today. Two drafts are waiting for your approval.",
  nowLabel: "Now · 10:15 am",
  scheduleNote: "Brisbane North · 4 home visits · 1 telehealth · ≈1.8 h driving",
  tiles: [
    { label: "Today’s appointments", value: "5", caption: "First 8:30 am · last 3:30 pm" },
    { label: "Notes awaiting approval", value: "2", caption: `AI drafts from ${dt("19 Oct")}` },
    { label: "Client follow-ups", value: "1", caption: "Poppy Shaw" },
    { label: "Progress report due", value: "1", caption: `Emily Carter, ${wd("Fri")}` },
  ],
  supervision: "11:00 am with Grace Liu",
  appointments: [
    {
      time: "8:30 am",
      client: "Emily Carter",
      detail: "Paediatric OT · NDIS · Home visit, Kedron",
      state: "past",
      note: { label: `Report due ${wd("Fri")}`, href: "/progress-reports/emily-carter" },
    },
    {
      time: "10:00 am",
      client: "Leo Banks",
      detail: "Upper-limb function · NDIS · Home visit, Chermside",
      state: "current",
      note: { label: "In session" },
    },
    {
      time: "11:30 am",
      client: "Poppy Shaw",
      detail: "Early childhood OT · NDIS · Home visit, Aspley",
      state: "next",
      note: { label: "Next" },
    },
    {
      time: "2:00 pm",
      client: "George Adams",
      detail: "Falls prevention · Aged care · Home visit, Nundah",
      state: "upcoming",
    },
    {
      time: "3:30 pm",
      client: "Nina Fischer",
      detail: "Community access · NDIS · Telehealth",
      state: "upcoming",
    },
  ] satisfies Appointment[],
  shortcuts: [
    { label: "Summarise today’s notes" },
    { label: "Prepare my supervision" },
    { label: "Show clients needing follow-up", href: "/clients-requiring-attention" },
    { label: "Draft Emily’s progress report", href: "/progress-reports/emily-carter" },
  ] as { label: string; href?: string }[],
  drafts: [
    { client: "Leo Banks", detail: `AI draft · session note · ${dt("19 Oct")}` },
    { client: "Poppy Shaw", detail: `AI draft · session note · ${dt("19 Oct")}` },
  ],
  followUp: { task: "Call parent re: school visit", detail: "Follow-up · Poppy Shaw" },
};
