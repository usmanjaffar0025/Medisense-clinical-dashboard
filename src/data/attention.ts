import type { AttentionClient, Priority, ReasonType } from "./types";
import { dt } from "@/lib/clock";

export const attentionClients: AttentionClient[] = [
  {
    id: "james-thompson",
    name: "James Thompson",
    clinician: "Sarah Thompson",
    funding: "NDIS",
    priority: "High",
    reason: "No appointment for 21 days; follow-up overdue; therapist caseload high.",
    daysSinceContact: 21,
    reasonTypes: ["no-recent-appointment", "follow-up"],
  },
  {
    id: "kai-robertson",
    name: "Kai Robertson",
    clinician: "Jessica Nguyen",
    funding: "NDIS",
    priority: "High",
    reason: "Follow-up overdue 9 days; NDIS plan review in 12 days.",
    daysSinceContact: 16,
    reasonTypes: ["follow-up", "review"],
  },
  {
    id: "sophie-williams",
    name: "Sophie Williams",
    clinician: "Jessica Nguyen",
    funding: "NDIS",
    priority: "Medium",
    reason: "Two cancelled appointments; goal review due in 7 days.",
    daysSinceContact: 19,
    reasonTypes: ["cancellations", "review"],
  },
  {
    id: "daniel-lee",
    name: "Daniel Lee",
    clinician: "Sarah Thompson",
    funding: "NDIS",
    priority: "Medium",
    reason: "NDIS plan review approaching; progress report incomplete.",
    daysSinceContact: 12,
    reasonTypes: ["review", "documentation"],
  },
  {
    id: "ruth-hallam",
    name: "Ruth Hallam",
    clinician: "Sarah Thompson",
    funding: "Aged care",
    priority: "Medium",
    reason: "Appointments paused; no next appointment booked; note overdue 14 days.",
    daysSinceContact: 14,
    reasonTypes: ["no-recent-appointment", "documentation"],
  },
  {
    id: "amelia-scott",
    name: "Amelia Scott",
    clinician: "Marcus Bell",
    funding: "NDIS",
    priority: "Medium",
    reason: "Three sessions not rebooked; last contact 18 days ago.",
    daysSinceContact: 18,
    reasonTypes: ["no-recent-appointment"],
  },
  {
    id: "joshua-kelly",
    name: "Joshua Kelly",
    clinician: "Marcus Bell",
    funding: "NDIS",
    priority: "Medium",
    reason: "Referral letter to paediatrician pending 10 days.",
    daysSinceContact: 7,
    reasonTypes: ["documentation"],
  },
  {
    id: "mason-wood",
    name: "Mason Wood",
    clinician: "Daniel Okafor",
    funding: "Aged care",
    priority: "Medium",
    reason: "Discharge plan agreed; no review appointment booked.",
    daysSinceContact: 15,
    reasonTypes: ["no-recent-appointment"],
  },
  {
    id: "patrick-doyle",
    name: "Patrick Doyle",
    clinician: "Tom Fitzgerald",
    funding: "Aged care",
    priority: "Medium",
    reason: "Follow-up overdue 6 days; swallowing review requested by family.",
    daysSinceContact: 13,
    reasonTypes: ["follow-up"],
  },
  {
    id: "ava-mitchell",
    name: "Ava Mitchell",
    clinician: "Sarah Thompson",
    funding: "NDIS",
    priority: "Review",
    reason: "Session note overdue 9 days.",
    daysSinceContact: 9,
    reasonTypes: ["documentation"],
  },
  {
    id: "harper-lewis",
    name: "Harper Lewis",
    clinician: "Jessica Nguyen",
    funding: "NDIS",
    priority: "Review",
    reason: "Session note overdue 4 days.",
    daysSinceContact: 6,
    reasonTypes: ["documentation"],
  },
  {
    id: "olivia-hughes",
    name: "Olivia Hughes",
    clinician: "Daniel Okafor",
    funding: "Aged care",
    priority: "Review",
    reason: "Outcome measure not recorded at 6-week point.",
    daysSinceContact: 8,
    reasonTypes: ["documentation"],
  },
  {
    id: "ella-morgan",
    name: "Ella Morgan",
    clinician: "Priya Raman",
    funding: "NDIS",
    priority: "Review",
    reason: "Goal review due in 5 days.",
    daysSinceContact: 10,
    reasonTypes: ["review"],
  },
  {
    id: "margaret-quinn",
    name: "Margaret Quinn",
    clinician: "Liam Patel",
    funding: "Aged care",
    priority: "Review",
    reason: "Communication aid trial outcome not recorded.",
    daysSinceContact: 11,
    reasonTypes: ["documentation"],
  },
];

export const priorities: Priority[] = ["High", "Medium", "Review"];

export const reasonTypeLabels: Record<ReasonType, string> = {
  "no-recent-appointment": "No recent appointment",
  "follow-up": "Follow-up overdue",
  documentation: "Documentation",
  review: "Funding / goal review",
  cancellations: "Cancellations",
};

export const reasonTypes = Object.keys(reasonTypeLabels) as ReasonType[];

export function countByPriority(list: AttentionClient[], priority: Priority) {
  return list.filter((c) => c.priority === priority).length;
}

export function countByReason(list: AttentionClient[]) {
  return reasonTypes.map((type) => ({
    type,
    label: reasonTypeLabels[type],
    count: list.filter((c) => c.reasonTypes.includes(type)).length,
  }));
}

export function mostCommonReason(list: AttentionClient[]) {
  return countByReason(list).reduce((top, next) => (next.count > top.count ? next : top));
}

/** Days since last contact, grouped into the buckets the attention queue charts. */
export const contactBuckets = [
  { id: "0-7", label: "0–7 days", min: 0, max: 7 },
  { id: "8-14", label: "8–14 days", min: 8, max: 14 },
  { id: "15-21", label: "15–21 days", min: 15, max: 21 },
] as const;

export type ContactBucket = (typeof contactBuckets)[number]["id"];

export function inBucket(days: number, bucket: ContactBucket) {
  const b = contactBuckets.find((x) => x.id === bucket);
  return b ? days >= b.min && days <= b.max : false;
}

export const attentionClinicians = [...new Set(attentionClients.map((c) => c.clinician))];

export const followUpReasons = [
  "Rebook appointment",
  "Contact family or carer",
  "Complete overdue documentation",
  "Prepare funding or goal review",
  "Discuss in supervision",
];

export const followUpDueOptions = [
  dt("Wed 21 Oct"),
  dt("Thu 22 Oct"),
  dt("Fri 23 Oct"),
  dt("Mon 26 Oct"),
];

export const followUpDefaults = {
  supervisor: "Grace Liu",
  due: dt("Thu 22 Oct"),
  note: "Contact client to confirm next steps",
  notes: {
    "james-thompson": "Contact family to rebook; review appointment frequency",
  } as Record<string, string>,
  reasons: {
    "no-recent-appointment": "Rebook appointment",
    "follow-up": "Contact family or carer",
    documentation: "Complete overdue documentation",
    review: "Prepare funding or goal review",
    cancellations: "Rebook appointment",
  } as Record<ReasonType, string>,
};
