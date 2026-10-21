import type { AttentionClient, Priority, ReasonType } from "./types";

export const attentionClients: AttentionClient[] = [
  {
    id: "james-thompson",
    name: "James Thompson",
    clinician: "Sarah Thompson",
    priority: "High",
    reason: "No appointment for 21 days; follow-up overdue; therapist caseload high.",
    daysSinceContact: 21,
    reasonTypes: ["no-recent-appointment", "follow-up"],
  },
  {
    id: "kai-robertson",
    name: "Kai Robertson",
    clinician: "Jessica Nguyen",
    priority: "High",
    reason: "Follow-up overdue 9 days; funding review in 12 days.",
    daysSinceContact: 16,
    reasonTypes: ["follow-up", "review"],
  },
  {
    id: "sophie-williams",
    name: "Sophie Williams",
    clinician: "Jessica Nguyen",
    priority: "Medium",
    reason: "Two cancelled appointments; goal review due in 7 days.",
    daysSinceContact: 19,
    reasonTypes: ["cancellations", "review"],
  },
  {
    id: "daniel-lee",
    name: "Daniel Lee",
    clinician: "Sarah Thompson",
    priority: "Medium",
    reason: "Funding review approaching; progress report incomplete.",
    daysSinceContact: 12,
    reasonTypes: ["review", "documentation"],
  },
  {
    id: "ruth-hallam",
    name: "Ruth Hallam",
    clinician: "Sarah Thompson",
    priority: "Medium",
    reason: "Appointments paused; no next appointment booked; note overdue 14 days.",
    daysSinceContact: 14,
    reasonTypes: ["no-recent-appointment", "documentation"],
  },
  {
    id: "amelia-scott",
    name: "Amelia Scott",
    clinician: "Marcus Bell",
    priority: "Medium",
    reason: "Three sessions not rebooked; last contact 18 days ago.",
    daysSinceContact: 18,
    reasonTypes: ["no-recent-appointment"],
  },
  {
    id: "joshua-kelly",
    name: "Joshua Kelly",
    clinician: "Marcus Bell",
    priority: "Medium",
    reason: "Referral letter pending 10 days.",
    daysSinceContact: 7,
    reasonTypes: ["documentation"],
  },
  {
    id: "mason-wood",
    name: "Mason Wood",
    clinician: "Daniel Okafor",
    priority: "Medium",
    reason: "Discharge plan agreed; no review appointment booked.",
    daysSinceContact: 15,
    reasonTypes: ["no-recent-appointment"],
  },
  {
    id: "patrick-doyle",
    name: "Patrick Doyle",
    clinician: "Tom Fitzgerald",
    priority: "Medium",
    reason: "Follow-up overdue 6 days.",
    daysSinceContact: 13,
    reasonTypes: ["follow-up"],
  },
  {
    id: "ava-mitchell",
    name: "Ava Mitchell",
    clinician: "Sarah Thompson",
    priority: "Low",
    reason: "Session note overdue 9 days.",
    daysSinceContact: 9,
    reasonTypes: ["documentation"],
  },
  {
    id: "harper-lewis",
    name: "Harper Lewis",
    clinician: "Jessica Nguyen",
    priority: "Low",
    reason: "Session note overdue 4 days.",
    daysSinceContact: 6,
    reasonTypes: ["documentation"],
  },
  {
    id: "olivia-hughes",
    name: "Olivia Hughes",
    clinician: "Daniel Okafor",
    priority: "Low",
    reason: "Outcome measure not recorded at 6-week point.",
    daysSinceContact: 8,
    reasonTypes: ["documentation"],
  },
  {
    id: "ella-morgan",
    name: "Ella Morgan",
    clinician: "Priya Raman",
    priority: "Low",
    reason: "Goal review due in 5 days.",
    daysSinceContact: 10,
    reasonTypes: ["review"],
  },
  {
    id: "margaret-quinn",
    name: "Margaret Quinn",
    clinician: "Liam Patel",
    priority: "Low",
    reason: "Equipment trial outcome not recorded.",
    daysSinceContact: 11,
    reasonTypes: ["documentation"],
  },
];

export const reasonTypeLabels: Record<ReasonType, string> = {
  "no-recent-appointment": "No recent appointment",
  "follow-up": "Follow-up overdue",
  documentation: "Documentation",
  review: "Funding / goal review",
  cancellations: "Cancellations",
};

export function countByPriority(priority: Priority) {
  return attentionClients.filter((c) => c.priority === priority).length;
}

export function mostCommonReason() {
  const counts = (Object.keys(reasonTypeLabels) as ReasonType[]).map((type) => ({
    label: reasonTypeLabels[type],
    count: attentionClients.filter((c) => c.reasonTypes.includes(type)).length,
  }));
  return counts.reduce((top, next) => (next.count > top.count ? next : top));
}

export const attentionClinicians = [...new Set(attentionClients.map((c) => c.clinician))];

export const followUpDefaults = {
  supervisor: "Grace Liu",
  due: "Thu 22 Oct",
  note: "Contact client to confirm next steps",
  notes: {
    "james-thompson": "Contact family to rebook; review appointment frequency",
  } as Record<string, string>,
};
