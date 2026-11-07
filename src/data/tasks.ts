import { dt } from "@/lib/clock";
export type TaskType =
  | "Client follow-up"
  | "Documentation"
  | "Document request"
  | "Communication"
  | "Scheduling"
  | "Supervision";

export type TaskSource = "AI from note" | "AI from referral" | "Automation" | "Manual";

export type TaskPriority = "High" | "Medium" | "Low";

export type Task = {
  id: string;
  title: string;
  client: string;
  owner: string;
  due: string;
  /** Days past due at demo "today" (Tue 20 Oct); 0 or below means not overdue. */
  daysOverdue: number;
  priority: TaskPriority;
  type: TaskType;
  source: TaskSource;
  done: boolean;
  href?: string;
  /** The sentence in an approved note that this task came from. */
  sentence?: string;
};

/** A follow-up the AI proposes from an approved note; it becomes a task only after confirmation. */
export type SuggestedTask = Pick<Task, "title" | "owner" | "due" | "type" | "priority">;

export const taskTypes: TaskType[] = [
  "Client follow-up",
  "Documentation",
  "Document request",
  "Communication",
  "Scheduling",
  "Supervision",
];

/** Overdue tasks are escalated to the clinical supervisor after this many days. */
export const ESCALATE_AFTER_DAYS = 3;

export const escalationOwner = "Grace Liu";

export const seedTasks: Task[] = [
  {
    id: "t-james-rebook",
    title: "Rebook appointment: no visit for 21 days",
    client: "James Thompson",
    owner: "Sarah Thompson",
    due: dt("Fri 16 Oct"),
    daysOverdue: 4,
    priority: "High",
    type: "Scheduling",
    source: "Automation",
    done: false,
    href: "/clients-requiring-attention",
  },
  {
    id: "t-kai-plan-review",
    title: "Collect documents for NDIS plan review",
    client: "Kai Robertson",
    owner: "Jessica Nguyen",
    due: dt("Sun 11 Oct"),
    daysOverdue: 9,
    priority: "High",
    type: "Document request",
    source: "Automation",
    done: false,
  },
  {
    id: "t-emily-report",
    title: "Complete progress report for plan review",
    client: "Emily Carter",
    owner: "Hannah Wright",
    due: dt("Fri 23 Oct"),
    daysOverdue: -3,
    priority: "High",
    type: "Documentation",
    source: "Automation",
    done: false,
    href: "/progress-reports/emily-carter",
  },
  {
    id: "t-poppy-call",
    title: "Call parent about school visit",
    client: "Poppy Shaw",
    owner: "Hannah Wright",
    due: dt("Tue 20 Oct"),
    daysOverdue: 0,
    priority: "Medium",
    type: "Client follow-up",
    source: "AI from note",
    done: false,
    href: "/my-day",
  },
  {
    id: "t-mason-review",
    title: "Book discharge review appointment",
    client: "Mason Wood",
    owner: "Daniel Okafor",
    due: dt("Wed 14 Oct"),
    daysOverdue: 6,
    priority: "Medium",
    type: "Scheduling",
    source: "Automation",
    done: false,
  },
  {
    id: "t-joshua-letter",
    title: "Send referral letter to paediatrician",
    client: "Joshua Kelly",
    owner: "Marcus Bell",
    due: dt("Sat 10 Oct"),
    daysOverdue: 10,
    priority: "Medium",
    type: "Communication",
    source: "AI from note",
    done: false,
  },
  {
    id: "t-patrick-swallow",
    title: "Respond to family request for swallowing review",
    client: "Patrick Doyle",
    owner: "Tom Fitzgerald",
    due: dt("Wed 14 Oct"),
    daysOverdue: 6,
    priority: "Medium",
    type: "Client follow-up",
    source: "Manual",
    done: false,
  },
  {
    id: "t-olivia-outcome",
    title: "Record 6-week outcome measure",
    client: "Olivia Hughes",
    owner: "Daniel Okafor",
    due: dt("Mon 19 Oct"),
    daysOverdue: 1,
    priority: "Low",
    type: "Documentation",
    source: "Automation",
    done: false,
  },
  {
    id: "t-ella-goal",
    title: "Prepare goal review",
    client: "Ella Morgan",
    owner: "Priya Raman",
    due: dt("Sun 25 Oct"),
    daysOverdue: -5,
    priority: "Low",
    type: "Documentation",
    source: "Automation",
    done: false,
  },
  {
    id: "t-margaret-trial",
    title: "Record communication aid trial outcome",
    client: "Margaret Quinn",
    owner: "Liam Patel",
    due: dt("Fri 16 Oct"),
    daysOverdue: 4,
    priority: "Low",
    type: "Documentation",
    source: "AI from note",
    done: false,
  },
  {
    id: "t-sophie-consent",
    title: "Request signed telehealth consent",
    client: "Sophie Williams",
    owner: "Jo Marsh",
    due: dt("Wed 21 Oct"),
    daysOverdue: -1,
    priority: "Medium",
    type: "Document request",
    source: "Automation",
    done: false,
  },
  {
    id: "t-sarah-supervision",
    title: "Approve supervision brief",
    client: "Sarah Thompson (staff)",
    owner: "Grace Liu",
    due: dt("Wed 21 Oct"),
    daysOverdue: -1,
    priority: "Medium",
    type: "Supervision",
    source: "Automation",
    done: false,
    href: "/supervision/sarah-thompson",
  },
  {
    id: "t-henry-quote",
    title: "Chase equipment quote",
    client: "Henry Ng",
    owner: "Jo Marsh",
    due: dt("Thu 15 Oct"),
    daysOverdue: 5,
    priority: "Medium",
    type: "Document request",
    source: "AI from note",
    done: false,
  },
  {
    id: "t-isla-callback",
    title: "Return parent call about sensory diet",
    client: "Isla Murphy",
    owner: "Sarah Thompson",
    due: dt("Thu 15 Oct"),
    daysOverdue: 3,
    priority: "Medium",
    type: "Client follow-up",
    source: "Manual",
    done: false,
  },
  {
    id: "t-ruth-quote",
    title: "Get a builder quote for the home modification",
    client: "Ruth Hallam",
    owner: "Jo Marsh",
    due: dt("Tue 20 Oct"),
    daysOverdue: 0,
    priority: "High",
    type: "Document request",
    source: "Manual",
    done: false,
    href: "/forms?form=home-mod-ruth",
  },
  {
    id: "t-leila-visit",
    title: "Book first home visit",
    client: "Leila Haddad",
    owner: "Admin team",
    due: dt("Fri 23 Oct"),
    daysOverdue: -3,
    priority: "Medium",
    type: "Scheduling",
    source: "AI from referral",
    done: false,
    href: "/intake",
  },
  {
    id: "t-zara-goals",
    title: "Send updated home program",
    client: "Zara Ahmed",
    owner: "Sarah Thompson",
    due: dt("Mon 12 Oct"),
    daysOverdue: 0,
    priority: "Low",
    type: "Communication",
    source: "AI from note",
    done: true,
  },
];

export function isOverdue(t: Task) {
  return !t.done && t.daysOverdue > 0;
}

export function isEscalated(t: Task) {
  return !t.done && t.daysOverdue > ESCALATE_AFTER_DAYS;
}
