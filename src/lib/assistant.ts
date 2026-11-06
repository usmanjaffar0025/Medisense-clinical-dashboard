import { automationOpportunities, automationTotal } from "@/data/admin";
import { expiryItems } from "@/data/admin-operations";
import { weeklyMeasures } from "@/data/analytics";
import { attentionClients } from "@/data/attention";
import { caseNotes } from "@/data/case-note";
import { clientProfiles } from "@/data/client-profiles";
import { clinicians } from "@/data/clinicians";
import { formDrafts } from "@/data/forms";
import { hannahDay } from "@/data/my-day";
import { referrals } from "@/data/referrals";
import { libraryReports, type ReportStatus } from "@/data/reports-library";
import { scheduleSuggestions } from "@/data/schedule";
import { suggestedAgenda, upcomingSupervision } from "@/data/supervision";
import { escalationOwner, isEscalated, isOverdue } from "@/data/tasks";
import type { Role } from "@/lib/navigation";
import type { Answer, LiveState } from "@/lib/knowledge/state";
import { dt, wd } from "@/lib/clock";

export type { Answer, AnswerItem } from "@/lib/knowledge/state";

export type AssistantContext = LiveState;

/** The questions each role is most likely to ask, best first. */
export const roleQuestions: Record<Role, string[]> = {
  Leadership: [
    "How does Medisense work?",
    "How is Medisense doing this week?",
    "Which clinicians are at risk of burnout?",
    "Which clients might slip through the gaps?",
    "How much time could AI give back to our clinicians?",
    "Who has capacity for a new client?",
    "What compliance is expiring soon?",
    "Which reports are due in the next two weeks?",
  ],
  Admin: [
    "How does Medisense work?",
    "Which referrals need action?",
    "What forms are waiting to be submitted?",
    "What paperwork is outstanding for Ruth Hallam?",
    "Are there gaps in this week's schedule?",
    "What compliance is expiring soon?",
    "Draft an email to Ruth's daughter about the builder quote",
  ],
  Supervisor: [
    "How does Medisense work?",
    "Prepare me for Sarah's supervision",
    "Which tasks have been escalated to me?",
    "Which notes are still outstanding?",
    "Which clinicians are at risk of burnout?",
    "Which clients might slip through the gaps?",
    "Which reports are due in the next two weeks?",
  ],
  Clinician: [
    "How does Medisense work?",
    "What should I prioritise today?",
    "Summarise Emily Carter before my visit",
    "How is Mia Robinson progressing on her goals?",
    "Which reports are due in the next two weeks?",
    "Which notes are still outstanding?",
    "Draft an email to Ruth's daughter about the builder quote",
  ],
};

type Intent = { match: RegExp; answer: (ctx: AssistantContext, question: string) => Answer };

const intents: Intent[] = [
  {
    match: /\bemail\b|write to|message to/i,
    answer: () => ({
      title: "Draft email to Ruth Hallam's daughter",
      intro: `Drafted from the approved ${dt("6 Oct")} note and the open builder-quote task. Review before sending.`,
      items: [],
      draft: `Hi Karen,\n\nThank you for meeting with Sarah during Ruth's home visit on ${dt("6 October")}. To apply for funding for the two grab rails and shower chair, we need a quote from a builder. We are arranging this and will share it with you once it arrives.\n\nSarah will also call you in the next two weeks to talk about Ruth's living arrangements, so we can plan the right next steps together.\n\nKind regards,\nMedisense`,
      sources: [`Approved note · Ruth Hallam, ${dt("6 Oct")}`, "Task · Request builder quote"],
    }),
  },
  {
    match: /escalat/i,
    answer: (ctx) => {
      const escalated = ctx.tasks.filter(isEscalated).sort((a, b) => b.daysOverdue - a.daysOverdue);
      return {
        title: `Tasks escalated to ${escalationOwner}`,
        intro: `${escalated.length} tasks are more than 3 days overdue. Each one names who owns it, so you can follow up directly.`,
        items: escalated.map((t) => ({
          label: t.title,
          detail: `${t.client} · ${t.owner} · ${t.daysOverdue} days late`,
          href: t.href ?? "/tasks",
        })),
        sources: ["Tasks", "Automation · Escalate overdue tasks"],
      };
    },
  },
  {
    match: /how is medisense|how are we|doing this week|overall|big picture/i,
    answer: (ctx) => {
      const nearCapacity = clinicians.filter((c) => c.utilisation >= 95);
      const atRisk = clinicians.filter((c) => c.status === "at-risk");
      const notesOverdue = clinicians.reduce((s, c) => s + c.notesOverdue, 0);
      const followUps = clinicians.reduce((s, c) => s + c.followUpsOverdue, 0);
      const openReferrals = referrals.filter(
        (r) =>
          !["Profile created", "Merged", "First visit booked"].includes(
            ctx.referralStatus[r.id] ?? r.status,
          ),
      ).length;
      const notesOnTime = weeklyMeasures.notesOnTime;
      return {
        title: "Medisense this week",
        intro: `12 clinicians are seeing 184 clients (128 NDIS, 56 aged care). Demand is rising faster than capacity: ${nearCapacity.length} clinicians are near or over capacity, and notes approved on time fell from ${notesOnTime[0]}% to ${notesOnTime.at(-1)}% over 12 weeks.`,
        items: [
          ...atRisk.map((c) => ({
            label: `${c.name} is At Risk`,
            detail: `${c.active} clients for a capacity of ${c.capacity} · score ${c.score}`,
            href: c.id === "sarah-thompson" ? "/caseloads/sarah-thompson" : "/team-capacity",
          })),
          {
            label: `${notesOverdue} notes overdue across the team`,
            detail: "AI drafts are ready for the oldest ones",
            href: "/case-notes/mia-robinson",
          },
          {
            label: `${followUps} follow-ups overdue · ${attentionClients.length} clients need review`,
            detail: "No visit, cancellations or plan reviews approaching",
            href: "/clients-requiring-attention",
          },
          {
            label: `${openReferrals} referrals waiting to become clients`,
            detail: "Details already extracted by AI",
            href: "/intake",
          },
          {
            label: "Full trends",
            detail: "Sessions, outcomes and access over 12 weeks",
            href: "/analytics",
          },
        ],
        sources: ["Caseload health", "Tasks", "Referrals", "Analytics"],
      };
    },
  },
  {
    match: /time could|give back|save|saving|hours back|time back|admin burden/i,
    answer: () => ({
      title: "Time AI could give back",
      intro: `Clinicians spend about 45% of logged time outside sessions: documentation, reports, travel and admin. These drafts could return ${automationTotal.hours} ${automationTotal.fte}. This is an estimate; every draft is still approved by a clinician.`,
      items: automationOpportunities.map((o) => ({
        label: `${o.label} · ${o.hours} h / week`,
        detail: o.description,
        href: "/admin-insights",
      })),
      sources: ["Admin insights", "Logged time, last 4 weeks"],
    }),
  },
  {
    match: /ruth/i,
    answer: (ctx) => {
      const form = formDrafts.find((f) => f.id === "home-mod-ruth");
      const formState = form ? ctx.forms[form.id] : undefined;
      const missing = form
        ? form.fields.filter((f) => f.required && !(formState?.values[f.id] ?? f.value).trim())
        : [];
      const tasks = ctx.tasks.filter((t) => t.client === "Ruth Hallam" && !t.done);
      const noteMode = ctx.noteModes["ruth-hallam"];
      return {
        title: "Outstanding paperwork for Ruth Hallam",
        intro: "Aged care · home modifications · clinician Sarah Thompson.",
        items: [
          {
            label:
              noteMode === "approved"
                ? "Session note approved"
                : `Session note from ${dt("6 Oct")} is overdue`,
            detail:
              noteMode === "approved"
                ? "Added to the clinical record"
                : "14 days overdue · AI draft available",
            href: "/case-notes/ruth-hallam",
          },
          {
            label:
              formState?.status === "submitted"
                ? "Home modification funding request submitted"
                : `Home modification funding request · ${missing.length} required fields missing`,
            detail: missing.map((f) => f.label).join(", ") || "Ready to submit",
            href: "/forms?form=home-mod-ruth",
          },
          ...tasks.map((t) => ({
            label: t.title,
            detail: `${t.owner} · due ${t.due}`,
            href: "/tasks",
          })),
          {
            label: "Open Ruth's profile",
            detail: "Goals, alerts and timeline",
            href: "/clients/ruth-hallam",
          },
        ],
        sources: ["Case notes", "Smart forms", "Tasks"],
      };
    },
  },
  {
    match: /emily|mia|james/i,
    answer: (_ctx, question) => {
      const asked = question.toLowerCase();
      const profile =
        clientProfiles.find((p) => asked.includes(p.name.split(" ")[0]?.toLowerCase() ?? "")) ??
        clientProfiles[0];
      if (!profile) return answerFallback(_ctx);
      return {
        title: `${profile.name} · ${profile.age} yrs · ${profile.funding}`,
        intro: profile.summary,
        items: [
          ...profile.goals.map((g) => ({
            label: `${g.text} · ${g.progress}%`,
            detail: `${g.status} · ${g.baseline} → ${g.current} (target ${g.target})`,
            href: `/clients/${profile.id}`,
          })),
          ...profile.alerts.map((a) => ({
            label: a.text,
            detail: "Alert",
            href: `/clients/${profile.id}`,
          })),
          {
            label: `Next: ${profile.nextAppointment}`,
            detail: `${profile.clinician} · ${profile.suburb}`,
            href: "/schedule",
          },
        ],
        sources: ["Approved notes", "Goals", "Plan", "Schedule"],
      };
    },
  },
  {
    match: /supervis|prepare me/i,
    answer: () => ({
      title: `Sarah Thompson's supervision · ${dt("Thu 22 Oct")}, 2:00 pm`,
      intro:
        "Caseload is At Risk (score 83, 27 clients for a capacity of 25). The AI brief groups the session into these points; you can add, remove and approve them.",
      items: [
        ...suggestedAgenda.slice(0, 5).map((a) => ({
          label: a.text,
          detail: a.section,
          href: "/supervision/sarah-thompson",
        })),
        ...upcomingSupervision
          .filter((u) => u.clinician !== "Sarah Thompson")
          .map((u) => ({
            label: `Also due: ${u.clinician}`,
            detail: `${u.when} · brief prepared 2 days before`,
            href: "/supervision/sarah-thompson",
          })),
      ],
      sources: ["Supervision brief", "Caseload", "Tasks"],
    }),
  },
  {
    match: /report/i,
    answer: (ctx) => {
      const statusOf = (id: string, fallback: ReportStatus): ReportStatus =>
        id === "emily-carter" && ctx.reportApproved ? "Approved" : (ctx.reports[id] ?? fallback);
      const due = libraryReports
        .map((r) => ({ ...r, current: statusOf(r.id, r.status) }))
        .filter((r) => r.current !== "Sent" && r.current !== "Approved" && r.dueInDays <= 14)
        .filter((r) => ctx.role !== "Clinician" || r.clinician === "Hannah Wright")
        .sort((a, b) => a.dueInDays - b.dueInDays);
      return {
        title:
          ctx.role === "Clinician" ? "Your reports due soon" : "Reports due in the next two weeks",
        intro: `${due.length} ${due.length === 1 ? "report is" : "reports are"} due or overdue and not yet approved. Reports not started can be drafted by AI from approved notes in one click.`,
        items: due.map((r) => ({
          label: `${r.client} · ${r.type}`,
          detail: `${r.current} · ${r.dueInDays < 0 ? `${-r.dueInDays} days overdue` : `due ${r.due}`} · ${r.clinician}`,
          href: r.href ?? "/reports",
        })),
        sources: ["Reports library"],
      };
    },
  },
  {
    match: /priorit|today|my day|first|focus/i,
    answer: (ctx) => {
      if (ctx.role === "Clinician") {
        const mine = ctx.tasks.filter((t) => t.owner === "Hannah Wright" && !t.done);
        return {
          title: "Your day, Hannah",
          intro: `${hannahDay.appointments.length} visits today: ${hannahDay.scheduleNote}. Two AI note drafts are waiting and Emily's report is due ${wd("Friday")}.`,
          items: [
            ...hannahDay.appointments
              .filter((a) => a.state !== "past")
              .map((a) => ({
                label: `${a.time} · ${a.client}`,
                detail: a.detail,
                href: a.client === "Emily Carter" ? "/clients/emily-carter" : "/my-day",
              })),
            ...hannahDay.drafts.map((d) => ({
              label: `Approve note: ${d.client}`,
              detail: d.detail,
              href: "/my-day",
            })),
            ...mine.map((t) => ({
              label: t.title,
              detail: `${t.client} · due ${t.due}`,
              href: "/tasks",
            })),
          ],
          sources: ["My Day", "Schedule", "Tasks"],
        };
      }
      const today = ctx.tasks.filter((t) => !t.done && t.daysOverdue === 0);
      const escalated = ctx.tasks.filter(isEscalated);
      return {
        title: `Priorities for ${dt("Tuesday 20 October")}`,
        intro: `${escalated.length} escalated tasks, ${today.length} due today, and Sarah's supervision on ${wd("Thursday")}.`,
        items: [
          ...escalated.slice(0, 3).map((t) => ({
            label: `Escalated: ${t.title}`,
            detail: `${t.client} · ${t.owner} · ${t.daysOverdue} days late`,
            href: "/tasks",
          })),
          ...today.map((t) => ({
            label: `Due today: ${t.title}`,
            detail: `${t.client} · ${t.owner}`,
            href: "/tasks",
          })),
          {
            label: "Approve Sarah's supervision brief",
            detail: `Session ${dt("Thu 22 Oct")}, 2:00 pm`,
            href: "/supervision/sarah-thompson",
          },
          {
            label: "Emily Carter's progress report",
            detail: `Due ${dt("Fri 23 Oct")} · Hannah Wright`,
            href: "/progress-reports/emily-carter",
          },
        ],
        sources: ["Tasks", "Supervision schedule", "Reports"],
      };
    },
  },
  {
    match: /note|documentation|overdue|backlog/i,
    answer: (ctx) => {
      const pending = caseNotes.filter((c) => ctx.noteModes[c.id] !== "approved");
      const teamOverdue = clinicians.reduce((sum, c) => sum + c.notesOverdue, 0);
      return {
        title: "Outstanding notes",
        intro: `${pending.length} of Sarah's ${caseNotes.length} backlog notes still need approval. ${teamOverdue} notes are overdue across the team.`,
        items: pending.map((c) => ({
          label: c.client,
          detail:
            c.backlog.kind === "overdue"
              ? `Session ${c.sessionDate} · ${c.backlog.days} days overdue`
              : `Session ${c.sessionDate} · AI draft waiting`,
          href: `/case-notes/${c.id}`,
        })),
        sources: ["Case notes", "Caseload health"],
      };
    },
  },
  {
    match: /capacity|burnout|room|availab|new client|overload|at risk|allocate/i,
    answer: () => {
      const atRisk = clinicians.filter((c) => c.status !== "healthy");
      const available = clinicians.filter((c) => c.available);
      return {
        title: "Capacity and burnout risk",
        intro:
          "Capacity is weighted by client complexity, overdue work and admin hours. Suggestions need leadership review.",
        items: [
          ...atRisk.map((c) => ({
            label: `${c.name} · ${c.status === "at-risk" ? "At Risk" : "Monitor"}`,
            detail: `${c.utilisation}% of capacity · ${c.notesOverdue} notes overdue · score ${c.score}`,
            href: c.id === "sarah-thompson" ? "/caseloads/sarah-thompson" : "/team-capacity",
          })),
          ...available.map((c) => ({
            label: `${c.name} has room`,
            detail: `${c.active}/${c.capacity} · ${(c.weightedCapacity - c.weightedUnits).toFixed(1)} weighted units free · ${c.site}`,
            href: "/team-capacity",
          })),
        ],
        sources: ["Team capacity", "Caseload health"],
      };
    },
  },
  {
    match: /referral|intake|enquir/i,
    answer: (ctx) => {
      const open = referrals.filter(
        (r) =>
          !["Profile created", "Merged", "First visit booked"].includes(
            ctx.referralStatus[r.id] ?? r.status,
          ),
      );
      return {
        title: "Referrals needing action",
        intro: `${open.length} of ${referrals.length} referrals this week are not yet a client profile.`,
        items: open.map((r) => ({
          label: `${r.client}, ${r.age} · ${ctx.referralStatus[r.id] ?? r.status}`,
          detail: `${r.source} · ${r.services} · ${r.suburb}`,
          href: "/intake",
        })),
        sources: ["Referrals & intake"],
      };
    },
  },
  {
    match: /\bforms?\b|submit/i,
    answer: (ctx) => {
      const waiting = formDrafts.filter((f) => ctx.forms[f.id]?.status !== "submitted");
      return {
        title: "Forms waiting to be submitted",
        intro: `${waiting.length} of ${formDrafts.length} AI pre-filled forms still need a person to finish and submit them.`,
        items: waiting.map((f) => {
          const state = ctx.forms[f.id];
          const missing = f.fields.filter(
            (field) => field.required && !(state?.values[field.id] ?? field.value).trim(),
          );
          return {
            label: `${f.template} · ${f.client}`,
            detail:
              state?.status === "error"
                ? "Sync failed · retry needed"
                : missing.length
                  ? `${missing.length} required fields missing`
                  : "Ready to submit",
            href: `/forms?form=${f.id}`,
          };
        }),
        sources: ["Smart forms"],
      };
    },
  },
  {
    match: /schedul|slot|calendar|route|driv|travel|book/i,
    answer: (ctx) => {
      const pending = scheduleSuggestions.filter((s) => !ctx.suggestions[s.id]);
      return {
        title: "Schedule this week",
        intro: `${pending.length} of ${scheduleSuggestions.length} AI suggestions are waiting for a decision. They fill cancelled slots and shorten routes.`,
        items: pending.map((s) => ({ label: s.title, detail: s.benefit, href: "/schedule" })),
        sources: ["Schedule", "Tasks", "Clients requiring attention"],
      };
    },
  },
  {
    match: /complian|expir|blue card|screening|renew|agreement|consent/i,
    answer: (ctx) => {
      const due = expiryItems.filter((i) => i.daysLeft <= 30);
      return {
        title: "Expiring in the next 30 days",
        intro: `${due.length} items: client plans, agreements and consents, plus staff checks. ${ctx.reminders.length} reminders sent today.`,
        items: due.slice(0, 7).map((i) => ({
          label: `${i.category} · ${i.subject}`,
          detail:
            i.daysLeft < 0
              ? `Expired ${-i.daysLeft} days ago · ${i.owner}`
              : `${i.expires} · ${i.owner}${ctx.reminders.includes(i.id) ? " · reminder sent" : ""}`,
          href: "/admin-operations",
        })),
        sources: ["Admin operations"],
      };
    },
  },
  {
    match: /follow|attention|gap|missed|slip/i,
    answer: (ctx) => ({
      title: "Clients at risk of slipping through gaps",
      intro: `${attentionClients.length} clients meet a configured review indicator; ${ctx.tasks.filter(isOverdue).length} tasks are overdue.`,
      items: attentionClients
        .filter((c) => c.priority !== "Review")
        .slice(0, 6)
        .map((c) => ({
          label: `${c.name} · ${c.priority}`,
          detail: c.reason,
          href: "/clients-requiring-attention",
        })),
      sources: ["Clients requiring attention", "Tasks"],
    }),
  },
];

function answerFallback(ctx: AssistantContext): Answer {
  return {
    title: "I can help with these",
    intro:
      "I answer from Medisense records: notes, tasks, referrals, forms, schedule, reports, capacity and compliance. Try one of these:",
    items: roleQuestions[ctx.role].map((q) => ({ label: q, detail: "" })),
    sources: [],
  };
}

/**
 * Answers questions from the demo's own records. It reads approved data only and never acts;
 * every answer links back to the screen where a person can act.
 */
export function answerQuestion(question: string, ctx: AssistantContext): Answer {
  const intent = intents.find((i) => i.match.test(question));
  return intent ? intent.answer(ctx, question) : answerFallback(ctx);
}
