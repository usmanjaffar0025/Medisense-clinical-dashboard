import { timeByCategory, automationTotal } from "@/data/admin";
import { expiryItems, staffCompliance, stateFor } from "@/data/admin-operations";
import { weeklyMeasures } from "@/data/analytics";
import { attentionClients } from "@/data/attention";
import { automationRules } from "@/data/automations";
import { sarahClients } from "@/data/caseload";
import { caseNotes } from "@/data/case-note";
import { clientTotals, directoryClients } from "@/data/client-directory";
import { clientProfiles } from "@/data/client-profiles";
import { clinicians } from "@/data/clinicians";
import { formDrafts } from "@/data/forms";
import { referrals } from "@/data/referrals";
import { libraryReports, type ReportStatus } from "@/data/reports-library";
import { formatTime, scheduleDays, scheduleSuggestions, scheduleWith } from "@/data/schedule";
import {
  flaggedCases,
  previousActions,
  sarahSupervision,
  suggestedAgenda,
  upcomingSupervision,
} from "@/data/supervision";
import { isEscalated, isOverdue, type Task } from "@/data/tasks";
import type { Clinician } from "@/data/types";
import type { AiTool } from "@/lib/ai/types";
import type { AnswerItem, LiveState } from "./state";
import { dt } from "@/lib/clock";

/** What every tool returns: a short summary plus linked rows, readable by people and models. */
export type ToolResult = { title: string; summary: string; items: AnswerItem[]; source: string };

type Input = Record<string, unknown>;

const MAX_ITEMS = 25;
const AI_ITEMS = 12;

export const norm = (s: string) =>
  s
    .toLowerCase()
    .replace(/[^a-z0-9 ]+/g, " ")
    .replace(/\s+/g, " ")
    .trim();

const str = (input: Input, key: string) => {
  const v = input[key];
  return typeof v === "string" && v.trim() ? v.trim() : undefined;
};
const num = (input: Input, key: string) => {
  const v = input[key];
  return typeof v === "number" && Number.isFinite(v) ? v : undefined;
};
const matches = (value: string, query: string | undefined) =>
  !query || norm(value).includes(norm(query));

const statusLabel = { healthy: "Healthy", monitor: "Monitor", "at-risk": "At Risk" } as const;

// ---------- lookups ----------

export function findClinician(name: string): Clinician | undefined {
  const q = norm(name);
  return (
    clinicians.find((c) => norm(c.name) === q || c.id === q.replace(/ /g, "-")) ??
    clinicians.find((c) => norm(c.name).includes(q) || q.includes(norm(c.name))) ??
    clinicians.find((c) => norm(c.firstName) === q)
  );
}

const allClientNames = () => [
  ...directoryClients.map((c) => ({ id: c.id, name: c.name })),
  ...referrals.map((r) => ({ id: r.id, name: r.client })),
];

export function findClientId(name: string) {
  const q = norm(name);
  const all = allClientNames();
  return (
    all.find((c) => norm(c.name) === q || c.id === q.replace(/ /g, "-")) ??
    all.find((c) => q.includes(norm(c.name)) || norm(c.name).includes(q))
  )?.id;
}

function reportStatus(state: LiveState, id: string, fallback: ReportStatus): ReportStatus {
  return id === "emily-carter" && state.reportApproved
    ? "Approved"
    : (state.reports[id] ?? fallback);
}

function referralStatus(state: LiveState, id: string, fallback: string) {
  return state.referralStatus[id] ?? fallback;
}

function taskItem(t: Task): AnswerItem {
  const due = t.done
    ? "done"
    : t.daysOverdue > 0
      ? `${t.daysOverdue} days overdue${isEscalated(t) ? " · escalated" : ""}`
      : t.daysOverdue === 0
        ? "due today"
        : `due ${t.due}`;
  return {
    label: t.title,
    detail: `${t.client} · ${t.owner} · ${due} · ${t.priority} · ${t.source}`,
    href: t.href ?? "/tasks",
  };
}

function weekFor(state: LiveState) {
  const accepted = Object.entries(state.suggestions)
    .filter(([, v]) => v === "accepted")
    .map(([id]) => id);
  return scheduleWith(accepted);
}

function dayIndex(day: string | undefined) {
  if (!day) return undefined;
  const d = norm(day);
  if (d === "today") return 1;
  if (d === "tomorrow") return 2;
  const i = scheduleDays.findIndex((s) => d.startsWith(s.short.toLowerCase()));
  return i >= 0 ? i : undefined;
}

// ---------- tools ----------

function orgSummary(state: LiveState): ToolResult {
  const atRisk = clinicians.filter((c) => c.status === "at-risk");
  const monitor = clinicians.filter((c) => c.status === "monitor");
  const notes = clinicians.reduce((s, c) => s + c.notesOverdue, 0);
  const drafts = clinicians.reduce((s, c) => s + c.draftsAwaiting, 0);
  const followUps = clinicians.reduce((s, c) => s + c.followUpsOverdue, 0);
  const openTasks = state.tasks.filter((t) => !t.done);
  const n = weeklyMeasures;
  return {
    title: "Medisense at a glance",
    summary: `12 clinicians (OT and Speech Pathology, Brisbane North and South, home visits and telehealth) see ${clientTotals.all} clients: ${clientTotals.ndis} NDIS and ${clientTotals.agedCare} aged care. ${atRisk.length} clinician At Risk, ${monitor.length} Monitor. ${notes} notes overdue and ${drafts} AI drafts waiting; ${followUps} follow-ups overdue; ${attentionClients.length} clients need review. Notes approved on time fell from ${n.notesOnTime[0]}% to ${n.notesOnTime.at(-1)}% over 12 weeks; sessions per week rose from ${n.sessions[0]} to ${n.sessions.at(-1)}. Estimated time AI could return: ${automationTotal.hours} ${automationTotal.fte}.`,
    items: [
      ...atRisk.map((c) => ({
        label: `${c.name} · At Risk`,
        detail: `${c.active}/${c.capacity} clients · score ${c.score}`,
        href: "/team-capacity",
      })),
      {
        label: `${openTasks.length} open tasks`,
        detail: `${openTasks.filter(isOverdue).length} overdue · ${openTasks.filter(isEscalated).length} escalated`,
        href: "/tasks",
      },
      ...timeByCategory.map((t) => ({
        label: `${t.label}: ${t.share}% of logged time`,
        detail: `≈${t.hours} h per week`,
        href: "/admin-insights",
      })),
    ],
    source: "Overview, analytics and admin insights",
  };
}

function getClient(state: LiveState, input: Input): ToolResult {
  const name = str(input, "name") ?? "";
  const id = findClientId(name);
  if (!id) {
    return {
      title: "Client not found",
      summary: `No client matches "${name}". Try search_records.`,
      items: [],
      source: "Clients",
    };
  }
  const dir = directoryClients.find((c) => c.id === id);
  const profile = clientProfiles.find((c) => c.id === id);
  const caseload = sarahClients.find((c) => c.id === id);
  const attention = attentionClients.find((c) => c.id === id);
  const referral = referrals.find((r) => r.id === id);
  const clientName = dir?.name ?? referral?.client ?? name;
  const tasks = state.tasks.filter((t) => t.client === clientName);
  const reports = libraryReports.filter((r) => r.client === clientName);
  const forms = formDrafts.filter((f) => f.client === clientName);
  const note = caseNotes.find((c) => c.id === id);
  const visits = weekFor(state).filter((i) => i.title.startsWith(clientName));
  const expiries = expiryItems.filter((e) => e.subject === clientName);
  const items: AnswerItem[] = [];

  if (profile) {
    items.push(
      ...profile.goals.map((g) => ({
        label: `Goal: ${g.text} · ${g.progress}% · ${g.status}`,
        detail: `${g.baseline} → ${g.current}, target ${g.target} (${g.measure})`,
        href: `/clients/${id}`,
      })),
      ...profile.alerts.map((a) => ({
        label: `Alert: ${a.text}`,
        detail: "",
        href: `/clients/${id}`,
      })),
      {
        label: `Funding: ${Math.round((profile.budget.spent / profile.budget.total) * 100)}% used`,
        detail: `$${profile.budget.spent.toLocaleString("en-AU")} of $${profile.budget.total.toLocaleString("en-AU")} · ${profile.budget.insight}`,
        href: `/clients/${id}`,
      },
      ...profile.contacts.map((c) => ({
        label: `Contact: ${c.role}, ${c.name}`,
        detail: c.detail,
      })),
    );
  }
  if (caseload) {
    items.push({
      label: `Last session ${caseload.lastSession} · next ${"label" in caseload.nextAppointment ? caseload.nextAppointment.label : caseload.nextAppointment.kind.replace("-", " ")}`,
      detail: `${caseload.complexity} complexity · documentation ${caseload.documentation.kind.replace("-", " ")} · with Sarah ${caseload.tenureMonths} months`,
      href: "/caseloads/sarah-thompson",
    });
  }
  if (attention) {
    items.push({
      label: `Requires review (${attention.priority}): ${attention.reason}`,
      detail: `${attention.daysSinceContact} days since contact`,
      href: "/clients-requiring-attention",
    });
  }
  if (referral) {
    items.push({
      label: `Referral: ${referralStatus(state, referral.id, referral.status)}`,
      detail: `${referral.source} · ${referral.services} · ${referral.suburb}${referral.missing.length ? ` · missing: ${referral.missing.join(", ")}` : ""}`,
      href: "/intake",
    });
  }
  if (note) {
    const mode = state.noteModes[note.id] ?? "empty";
    items.push({
      label: `Session note ${note.sessionDate}: ${mode === "approved" ? "approved" : note.backlog.kind === "overdue" ? `${note.backlog.days} days overdue` : "AI draft waiting"}`,
      detail: note.service,
      href: `/case-notes/${note.id}`,
    });
  }
  items.push(...tasks.map(taskItem));
  items.push(
    ...reports.map((r) => ({
      label: `Report: ${r.type} · ${reportStatus(state, r.id, r.status)}`,
      detail: `due ${r.due} · ${r.clinician}`,
      href: r.href ?? "/reports",
    })),
  );
  items.push(
    ...forms.map((f) => ({
      label: `Form: ${f.template} · ${state.forms[f.id]?.status ?? "draft"}`,
      detail: f.purpose,
      href: `/forms?form=${f.id}`,
    })),
  );
  items.push(
    ...visits.map((v) => ({
      label: `Visit ${scheduleDays[v.day]?.label ?? ""}, ${formatTime(v.start)} · ${v.type}${v.status === "cancelled" ? " (cancelled)" : ""}`,
      detail: v.suburb ?? "Telehealth",
      href: "/schedule",
    })),
  );
  items.push(
    ...expiries.map((e) => ({
      label: `${e.category}: ${e.expires}`,
      detail: stateFor(e.daysLeft),
      href: "/admin-operations",
    })),
  );

  const facts = [
    (dir?.age ?? referral?.age) ? `${dir?.age ?? referral?.age} yrs` : null,
    dir?.funding ?? referral?.funding,
    dir?.service ?? referral?.services,
    dir
      ? `clinician ${dir.clinician}`
      : referral?.suggestedClinician
        ? `suggested clinician ${referral.suggestedClinician}`
        : null,
    dir?.region ?? referral?.region,
    dir ? `${dir.state}, plan review in ${dir.planReviewDays} days` : null,
  ].filter(Boolean);

  return {
    title: clientName,
    summary: [facts.join(" · "), profile?.summary].filter(Boolean).join(". "),
    items: items.slice(0, MAX_ITEMS),
    source: "Client records, tasks, reports, schedule",
  };
}

function listClients(_state: LiveState, input: Input): ToolResult {
  const funding = str(input, "funding");
  const region = str(input, "region");
  const clinician = str(input, "clinician");
  const priority = str(input, "priority");
  const clientState = str(input, "state");
  const within = num(input, "plan_review_within_days");
  const rows = directoryClients
    .filter((c) => !funding || norm(c.funding).startsWith(norm(funding).slice(0, 4)))
    .filter((c) => matches(c.region, region))
    .filter((c) => matches(c.clinician, clinician))
    .filter((c) => !priority || (c.priority && norm(c.priority) === norm(priority)))
    .filter((c) => !clientState || norm(c.state) === norm(clientState))
    .filter((c) => within === undefined || c.planReviewDays <= within)
    .sort((a, b) => a.planReviewDays - b.planReviewDays);
  return {
    title: "Clients",
    summary: `${rows.length} matching records in the ${directoryClients.length}-record sample (organisation total ${clientTotals.all}: ${clientTotals.ndis} NDIS, ${clientTotals.agedCare} aged care).`,
    items: rows.slice(0, MAX_ITEMS).map((c) => ({
      label: `${c.name}${c.age ? `, ${c.age}` : ""} · ${c.funding}${c.priority ? ` · ${c.priority} priority` : ""}`,
      detail: `${c.clinician} · ${c.region} · ${c.service} · ${c.state} · plan review in ${c.planReviewDays} days`,
      href: c.hasProfile ? `/clients/${c.id}` : "/clients",
    })),
    source: "Client directory",
  };
}

function clinicianLine(c: Clinician) {
  return `${c.role} · ${c.site} · ${c.fte} FTE · ${c.active}/${c.capacity} clients (${c.utilisation}%) · ${statusLabel[c.status]} (score ${c.score}) · ${c.notesOverdue} notes overdue · ${c.followUpsOverdue} follow-ups overdue · admin ${c.adminHours}h vs ${c.adminTarget}h target`;
}

function getClinician(state: LiveState, input: Input): ToolResult {
  const c = findClinician(str(input, "name") ?? "");
  if (!c)
    return {
      title: "Clinician not found",
      summary: "No clinician matches that name.",
      items: [],
      source: "Team",
    };
  const week = weekFor(state).filter((i) => i.clinicianId === c.id && i.status !== "cancelled");
  const sessions = week.filter((i) => i.type === "Home visit" || i.type === "Telehealth");
  const tasks = state.tasks.filter((t) => t.owner === c.name && !t.done);
  const compliance = staffCompliance.find((s) => s.clinician.id === c.id)?.items ?? [];
  const reports = libraryReports.filter((r) => r.clinician === c.name);
  return {
    title: c.name,
    summary: `${clinicianLine(c)}. Next supervision ${c.nextSupervision}. ${c.available ? "Has room for new clients." : "No spare capacity."} This week: ${sessions.length} sessions, ${(week.reduce((s, i) => s + i.travel, 0) / 60).toFixed(1)} h driving.`,
    items: [
      ...tasks.map(taskItem),
      ...reports.map((r) => ({
        label: `Report: ${r.client} · ${r.type} · ${reportStatus(state, r.id, r.status)}`,
        detail: `due ${r.due}`,
        href: r.href ?? "/reports",
      })),
      ...compliance.map((i) => ({
        label: `${i.label}: ${i.state}`,
        detail: i.expires,
        href: "/admin-operations",
      })),
    ].slice(0, MAX_ITEMS),
    source: "Team capacity, schedule, tasks, compliance",
  };
}

function listClinicians(_state: LiveState, input: Input): ToolResult {
  const region = str(input, "region");
  const discipline = str(input, "discipline");
  const status = str(input, "status");
  const rows = clinicians
    .filter((c) => matches(c.site, region))
    .filter((c) => matches(c.discipline, discipline))
    .filter(
      (c) =>
        !status ||
        norm(statusLabel[c.status]) === norm(status) ||
        (norm(status) === "available" && c.available),
    )
    .sort((a, b) => b.score - a.score);
  return {
    title: "Clinicians",
    summary: `${rows.length} of 12 clinicians. Status comes from the caseload score (Monitor from 60, At Risk from 80), weighted by complexity, overdue work and admin hours.`,
    items: rows.map((c) => ({
      label: `${c.name} · ${statusLabel[c.status]}${c.available ? " · has room" : ""}`,
      detail: clinicianLine(c),
      href: c.id === "sarah-thompson" ? "/caseloads/sarah-thompson" : "/team-capacity",
    })),
    source: "Team capacity",
  };
}

function listTasks(state: LiveState, input: Input): ToolResult {
  const owner = str(input, "owner");
  const client = str(input, "client");
  const type = str(input, "type");
  const status = str(input, "status") ?? "open";
  const rows = state.tasks
    .filter((t) => matches(t.owner, owner))
    .filter((t) => matches(t.client, client))
    .filter((t) => matches(t.type, type))
    .filter((t) =>
      status === "all"
        ? true
        : status === "done"
          ? t.done
          : status === "overdue"
            ? isOverdue(t)
            : status === "escalated"
              ? isEscalated(t)
              : !t.done,
    )
    .sort((a, b) => Number(a.done) - Number(b.done) || b.daysOverdue - a.daysOverdue);
  return {
    title: "Tasks",
    summary: `${rows.length} ${status} tasks${owner ? ` for ${owner}` : ""}${client ? ` about ${client}` : ""}. Tasks more than 3 days overdue escalate to Grace Liu.`,
    items: rows.slice(0, MAX_ITEMS).map(taskItem),
    source: "Tasks",
  };
}

function listReferrals(state: LiveState, input: Input): ToolResult {
  const status = str(input, "status");
  const rows = referrals
    .map((r) => ({ ...r, current: referralStatus(state, r.id, r.status) }))
    .filter((r) => matches(r.current, status));
  return {
    title: "Referrals",
    summary: `${rows.length} of ${referrals.length} referrals this week. AI extracts details, checks for duplicates and lists missing information; a person verifies.`,
    items: rows.map((r) => ({
      label: `${r.client}, ${r.age} · ${r.current}`,
      detail: `${r.source} (${r.sourceDetail}) · ${r.funding} · ${r.services} · ${r.suburb}${r.missing.length ? ` · missing: ${r.missing.join(", ")}` : ""}${r.duplicate ? ` · possible duplicate of ${r.duplicate.client}` : ""}`,
      href: "/intake",
    })),
    source: "Referrals & intake",
  };
}

function listReports(state: LiveState, input: Input): ToolResult {
  const status = str(input, "status");
  const clinician = str(input, "clinician");
  const client = str(input, "client");
  const within = num(input, "due_within_days");
  const rows = libraryReports
    .map((r) => ({ ...r, current: reportStatus(state, r.id, r.status) }))
    .filter((r) => matches(r.current, status))
    .filter((r) => matches(r.clinician, clinician))
    .filter((r) => matches(r.client, client))
    .filter((r) => within === undefined || r.dueInDays <= within)
    .sort((a, b) => a.dueInDays - b.dueInDays);
  return {
    title: "Reports",
    summary: `${rows.length} reports. AI drafts from approved notes, goals and measures; the clinician reviews and approves.`,
    items: rows.slice(0, MAX_ITEMS).map((r) => ({
      label: `${r.client} · ${r.type} · ${r.current}`,
      detail: `${r.clinician} · ${r.dueInDays < 0 ? `${-r.dueInDays} days overdue` : `due ${r.due}`} · built from ${r.sources.map((s) => `${s.count} ${s.label.toLowerCase()}`).join(", ")}`,
      href: r.href ?? "/reports",
    })),
    source: "Reports library",
  };
}

function listForms(state: LiveState): ToolResult {
  return {
    title: "Smart forms",
    summary: `${formDrafts.length} forms pre-filled by AI from records; a person completes missing fields and submits.`,
    items: formDrafts.map((f) => {
      const form = state.forms[f.id];
      const missing = f.fields.filter((x) => x.required && !(form?.values[x.id] ?? x.value).trim());
      return {
        label: `${f.template} · ${f.client} · ${form?.status ?? "draft"}`,
        detail: missing.length
          ? `missing: ${missing.map((m) => m.label).join(", ")}`
          : "all required fields filled",
        href: `/forms?form=${f.id}`,
      };
    }),
    source: "Smart forms",
  };
}

function getSchedule(state: LiveState, input: Input): ToolResult {
  const c = str(input, "clinician") ? findClinician(str(input, "clinician") ?? "") : undefined;
  const day = dayIndex(str(input, "day"));
  const items = weekFor(state)
    .filter((i) => !c || i.clinicianId === c.id)
    .filter((i) => day === undefined || i.day === day)
    .sort((a, b) => a.day - b.day || a.start - b.start);
  const sessions = items.filter((i) => i.type === "Home visit" || i.type === "Telehealth");
  const open = sessions.filter((i) => i.status === "cancelled");
  const driving = items.reduce((s, i) => s + (i.status === "cancelled" ? 0 : i.travel), 0) / 60;
  const pending = scheduleSuggestions.filter(
    (s) => !state.suggestions[s.id] && (!c || s.clinicianId === c.id),
  );
  const nameOf = (id: string) => clinicians.find((x) => x.id === id)?.name ?? id;
  return {
    title: `Schedule${c ? ` · ${c.name}` : ""}${day !== undefined ? ` · ${scheduleDays[day]?.label}` : ` · ${scheduleDays[0]?.label} to ${scheduleDays[4]?.label}`}`,
    summary: `${sessions.length - open.length} sessions booked, ${open.length} open slots from cancellations, ${driving.toFixed(1)} h driving. ${pending.length} AI schedule suggestions waiting. Today is ${dt("Tue 20 Oct")}, 10:15 am.`,
    items: [
      ...pending.map((s) => ({
        label: `Suggestion: ${s.title}`,
        detail: s.benefit,
        href: "/schedule",
      })),
      ...(c || day !== undefined ? items : open).slice(0, MAX_ITEMS).map((i) => ({
        label: `${scheduleDays[i.day]?.short} ${formatTime(i.start)} · ${i.title}${i.status === "cancelled" ? " (cancelled, open slot)" : ""}`,
        detail: `${c ? "" : `${nameOf(i.clinicianId)} · `}${i.type}${i.suburb ? ` · ${i.suburb}` : ""}${i.travel ? ` · ${i.travel} min drive` : ""}`,
        href: "/schedule",
      })),
    ].slice(0, MAX_ITEMS),
    source: "Schedule",
  };
}

function listCompliance(state: LiveState, input: Input): ToolResult {
  const kind = str(input, "kind");
  const person = str(input, "person");
  const within = num(input, "within_days") ?? 60;
  const rows = expiryItems
    .filter((e) => !kind || norm(e.kind) === norm(kind))
    .filter((e) => matches(e.subject, person))
    .filter((e) => e.daysLeft <= within);
  return {
    title: "Compliance and expiries",
    summary: `${rows.length} items due within ${within} days or expired (client plans, agreements and consents; staff registration, Blue Card, NDIS Worker Screening, first aid, vehicle insurance). ${state.reminders.length} reminders sent today.`,
    items: rows.map((e) => ({
      label: `${e.category} · ${e.subject} · ${stateFor(e.daysLeft)}`,
      detail: `${e.expires} · owner ${e.owner}${state.reminders.includes(e.id) ? " · reminder sent" : ""}`,
      href: "/admin-operations",
    })),
    source: "Admin operations",
  };
}

function listCaseNotes(state: LiveState): ToolResult {
  const teamOverdue = clinicians.reduce((s, c) => s + c.notesOverdue, 0);
  return {
    title: "Case notes",
    summary: `${teamOverdue} notes overdue across the team. Sarah Thompson's backlog below has AI drafts; the clinician reviews and approves each.`,
    items: caseNotes.map((c) => {
      const mode = state.noteModes[c.id] ?? "empty";
      return {
        label: `${c.client} · session ${c.sessionDate} · ${mode === "approved" ? "approved" : c.backlog.kind === "overdue" ? `${c.backlog.days} days overdue` : "AI draft waiting"}`,
        detail: `${c.service} · ${c.sessionDetail} · ${c.clinician}`,
        href: `/case-notes/${c.id}`,
      };
    }),
    source: "Case notes",
  };
}

function listAutomations(state: LiveState, input: Input): ToolResult {
  const only = input.enabled;
  const rows = automationRules
    .map((r) => ({ ...r, on: state.automations[r.id] ?? r.enabled }))
    .filter((r) => typeof only !== "boolean" || r.on === only);
  return {
    title: "Automation rules",
    summary: `${rows.filter((r) => r.on).length} of ${rows.length} rules on. Rules prepare drafts, tasks and reminders; people approve before anything reaches a client.`,
    items: rows.map((r) => ({
      label: `${r.name} · ${r.on ? "on" : "off"}`,
      detail: `When ${r.trigger.toLowerCase()}, if ${r.condition.toLowerCase()}, then ${r.action.toLowerCase()} · ${r.runs30d} runs and ${r.hoursSaved30d} h returned in 30 days`,
      href: "/automations",
    })),
    source: "Automations",
  };
}

function auditTrail(state: LiveState, input: Input): ToolResult {
  const actor = str(input, "actor");
  const limit = Math.min(num(input, "limit") ?? 12, MAX_ITEMS);
  const rows = state.audit.filter((e) => matches(e.actor, actor)).slice(0, limit);
  return {
    title: "Audit trail",
    summary: `Latest ${rows.length} recorded actions, newest first. Every AI output and human decision is logged.`,
    items: rows.map((e) => ({
      label: `${e.time} · ${e.actor}${e.isAi ? " (AI)" : ""}: ${e.action}`,
      detail: `${e.object} · ${e.day}`,
    })),
    source: "Audit trail",
  };
}

const screens = [
  ["Overview", "/", "organisation dashboard kpis trends caseload health impact"],
  ["Team Capacity", "/team-capacity", "capacity weighted units transfer recommendation workload"],
  ["Analytics", "/analytics", "trends outcomes sessions cancellations billable hours goals"],
  [
    "Clients Requiring Attention",
    "/clients-requiring-attention",
    "attention review gaps follow up no visit",
  ],
  ["Referrals & Intake", "/intake", "referral intake extraction duplicate missing information"],
  ["Smart Forms", "/forms", "forms pre filled funding request service agreement"],
  ["Tasks", "/tasks", "tasks follow ups escalations"],
  [
    "Admin Operations",
    "/admin-operations",
    "compliance expiries blue card screening reminders queues",
  ],
  ["Automations", "/automations", "automation rules triggers"],
  ["Clients", "/clients", "client directory profiles goals funding"],
  ["Schedule", "/schedule", "calendar appointments visits driving travel slots"],
  ["Caseloads", "/caseloads/sarah-thompson", "caseload score sarah"],
  ["Supervision", "/supervision/sarah-thompson", "supervision brief agenda grace"],
  ["My Day", "/my-day", "clinician day hannah appointments"],
  ["Case Notes", "/case-notes/mia-robinson", "case notes dictation soap draft approve"],
  ["Reports", "/reports", "reports progress plan review assessment"],
  ["Admin Insights", "/admin-insights", "time admin hours automation opportunities"],
  ["Family Portal", "/portal", "family portal parent messages home program"],
  ["Security & Integrations", "/settings", "security permissions roles guardrails integrations"],
] as const;

// ---------- search ----------

const STOP = new Set(
  "the and for with what which who whom how are is was does did show list tell about give any all have has this that from into our their there please can you me my of to in on at a an do".split(
    " ",
  ),
);

/** Words that mean the same thing in these records. */
const SYNONYMS: Record<string, string[]> = {
  appointment: ["visit", "session"],
  visit: ["appointment", "session"],
  session: ["visit", "appointment"],
  therapist: ["clinician"],
  clinician: ["therapist"],
  kid: ["child", "paediatric"],
  child: ["paediatric"],
  children: ["paediatric"],
  elderly: ["aged"],
  old: ["aged"],
  late: ["overdue"],
  overdue: ["late"],
  expiry: ["expire", "expiring"],
  expire: ["expiry", "expiring"],
  wwcc: ["blue", "card"],
  ot: ["occupational"],
  speech: ["speech"],
  funding: ["ndis", "budget"],
  money: ["budget", "funding"],
  falls: ["fall"],
};

/** A light stemmer: enough to match plural and -ing forms. */
function stem(word: string) {
  if (word.length > 4 && word.endsWith("ies")) return `${word.slice(0, -3)}y`;
  if (word.length > 5 && word.endsWith("ing")) return word.slice(0, -3);
  if (word.length > 4 && word.endsWith("ed")) return word.slice(0, -2);
  if (word.length > 3 && word.endsWith("s") && !word.endsWith("ss")) return word.slice(0, -1);
  return word;
}

export function tokens(text: string) {
  return norm(text)
    .split(" ")
    .filter((w) => w.length > 1 && !STOP.has(w))
    .map(stem);
}

/** Levenshtein distance, capped: only "one typo" matters here. */
function oneEditApart(a: string, b: string) {
  if (Math.abs(a.length - b.length) > 1) return false;
  let i = 0;
  let j = 0;
  let edits = 0;
  while (i < a.length && j < b.length) {
    if (a[i] === b[j]) {
      i++;
      j++;
      continue;
    }
    if (++edits > 1) return false;
    if (a.length > b.length) i++;
    else if (b.length > a.length) j++;
    else {
      i++;
      j++;
    }
  }
  return edits + (a.length - i) + (b.length - j) <= 1;
}

function tokenMatches(query: string, word: string) {
  if (query === word) return 1;
  if (query.length >= 4 && word.startsWith(query)) return 0.8;
  if (query.length >= 5 && word.length >= 5 && oneEditApart(query, word)) return 0.7;
  return 0;
}

type SearchDoc = AnswerItem & { name: string; text: string };

/**
 * BM25-style ranking: rare words count more than common ones, a match in the record's name
 * counts double, and close spellings and synonyms still match.
 */
export function rankDocs(query: string, docs: SearchDoc[], limit = 12) {
  const terms = [...new Set(tokens(query))];
  const expanded = terms.map((t) => [t, ...(SYNONYMS[t] ?? []).map(stem)]);
  const index = docs.map((d) => ({ doc: d, name: tokens(d.name), text: tokens(d.text) }));
  const n = index.length;
  const best = (variants: string[], words: string[]) =>
    Math.max(0, ...variants.flatMap((v) => words.map((w) => tokenMatches(v, w))));
  const idf = expanded.map((variants) => {
    const df = index.filter((d) => best(variants, [...d.name, ...d.text]) > 0).length;
    return Math.log(1 + (n - df + 0.5) / (df + 0.5));
  });
  return index
    .map((d) => {
      const score = expanded.reduce((sum, variants, k) => {
        const inName = best(variants, d.name);
        const inText = best(variants, d.text);
        return sum + (idf[k] ?? 0) * Math.max(inName * 2, inText);
      }, 0);
      return { doc: d.doc, score };
    })
    .filter((r) => r.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, limit)
    .map(({ doc }) => ({ label: doc.label, detail: doc.detail, href: doc.href }));
}

function getSupervision(): ToolResult {
  return {
    title: `Supervision · ${sarahSupervision.clinician}`,
    summary: `${sarahSupervision.session}. ${sarahSupervision.facts.map((f) => `${f.label}: ${f.value}${f.suffix ? ` ${f.suffix}` : ""}`).join("; ")}. The AI brief was prepared ${dt("20 Oct")}, 9:15 am.`,
    items: [
      ...suggestedAgenda.map((a) => ({
        label: `Agenda · ${a.section}: ${a.text}`,
        detail: a.evidence,
        href: "/supervision/sarah-thompson",
      })),
      ...flaggedCases.map((c) => ({
        label: `Flagged case: ${c.client}`,
        detail: c.reason,
        href: "/supervision/sarah-thompson",
      })),
      ...previousActions.map((a) => ({
        label: `Previous action: ${a.action}`,
        detail: `${a.owner} · ${a.open ? "open" : "completed"}`,
        href: "/supervision/sarah-thompson",
      })),
      ...upcomingSupervision.map((u) => ({
        label: `Upcoming: ${u.clinician}`,
        detail: `${u.when} · ${u.briefReady ? "brief ready" : "brief prepared 2 days before"}`,
        href: "/supervision/sarah-thompson",
      })),
    ],
    source: "Supervision",
  };
}

function searchRecords(state: LiveState, input: Input): ToolResult {
  const pool: (AnswerItem & { text: string })[] = [
    ...clientProfiles.map((c) => ({
      label: `Client profile: ${c.name}`,
      detail: c.summary,
      href: `/clients/${c.id}`,
      text: `${c.name} ${c.service} ${c.summary} ${c.goals.map((g) => g.text).join(" ")} ${c.alerts.map((x) => x.text).join(" ")}`,
    })),
    ...caseNotes.map((c) => ({
      label: `Case note: ${c.client}`,
      detail: `Session ${c.sessionDate} · ${c.service}`,
      href: `/case-notes/${c.id}`,
      text: `${c.client} ${c.service} ${c.rawLines.join(" ")} ${c.draft.summary}`,
    })),
    ...formDrafts.map((f) => ({
      label: `Form: ${f.template}`,
      detail: `${f.client} · ${f.purpose}`,
      href: `/forms?form=${f.id}`,
      text: `${f.template} ${f.client} ${f.purpose} ${f.fields.map((x) => `${x.label} ${x.value}`).join(" ")}`,
    })),
    ...directoryClients.map((c) => ({
      label: `Client: ${c.name}`,
      detail: `${c.funding} · ${c.clinician} · ${c.service}`,
      href: c.hasProfile ? `/clients/${c.id}` : "/clients",
      text: `${c.name} ${c.service} ${c.clinician} ${c.funding} ${c.region}`,
    })),
    ...clinicians.map((c) => ({
      label: `Clinician: ${c.name}`,
      detail: clinicianLine(c),
      href: "/team-capacity",
      text: `${c.name} ${c.role} ${c.discipline} ${c.site}`,
    })),
    ...state.tasks.map((t) => ({
      ...taskItem(t),
      label: `Task: ${t.title}`,
      text: `${t.title} ${t.client} ${t.owner} ${t.type}`,
    })),
    ...referrals.map((r) => ({
      label: `Referral: ${r.client}`,
      detail: `${referralStatus(state, r.id, r.status)} · ${r.services}`,
      href: "/intake",
      text: `${r.client} referral ${r.services} ${r.source} ${r.suburb}`,
    })),
    ...libraryReports.map((r) => ({
      label: `Report: ${r.client} · ${r.type}`,
      detail: `${reportStatus(state, r.id, r.status)} · due ${r.due}`,
      href: r.href ?? "/reports",
      text: `${r.client} ${r.type} ${r.clinician} report`,
    })),
    ...expiryItems.map((e) => ({
      label: `${e.category} · ${e.subject}`,
      detail: `${e.expires} · ${stateFor(e.daysLeft)}`,
      href: "/admin-operations",
      text: `${e.category} ${e.subject} expiry compliance`,
    })),
    ...automationRules.map((r) => ({
      label: `Automation: ${r.name}`,
      detail: r.action,
      href: "/automations",
      text: `${r.name} ${r.trigger} ${r.action} automation rule`,
    })),
    ...screens.map(([label, href, text]) => ({
      label: `Screen: ${label}`,
      detail: href,
      href,
      text: `${label} ${text}`,
    })),
  ];
  const hits = rankDocs(
    str(input, "query") ?? "",
    pool.map((p) => ({ ...p, name: p.label.replace(/^[A-Za-z ]+: /, "") })),
  );
  return {
    title: "Search results",
    summary: hits.length ? `${hits.length} records match.` : "Nothing in the records matches that.",
    items: hits,
    source: "All records",
  };
}

// ---------- registry ----------

type ToolDef = {
  name: string;
  description: string;
  properties: Record<string, unknown>;
  run: (state: LiveState, input: Input) => ToolResult;
};

const s = (description: string, values?: string[]) =>
  values ? { type: "string", description, enum: values } : { type: "string", description };
const n = (description: string) => ({ type: "number", description });

export const toolDefs: ToolDef[] = [
  {
    name: "get_org_summary",
    description:
      "Organisation-wide picture: clinicians, clients, overdue work, trends and where time goes. Use for overall or 'how are we doing' questions.",
    properties: {},
    run: orgSummary,
  },
  {
    name: "get_client",
    description:
      "Everything about one client: profile, goals, funding, alerts, tasks, reports, forms, visits this week, referral and expiries.",
    properties: { name: s("Client name, full or partial") },
    run: getClient,
  },
  {
    name: "list_clients",
    description: "List clients with optional filters. All filters are optional.",
    properties: {
      funding: s("Funding type", ["NDIS", "Aged care"]),
      region: s("Region", ["Brisbane North", "Brisbane South"]),
      clinician: s("Treating clinician name"),
      priority: s("Review priority", ["High", "Medium", "Review"]),
      state: s("Client state", ["Active", "New", "Paused"]),
      plan_review_within_days: n("Only clients whose plan review is within this many days"),
    },
    run: listClients,
  },
  {
    name: "get_clinician",
    description:
      "One clinician: caseload, capacity, status and score, overdue work, supervision, this week's schedule, tasks, reports and compliance.",
    properties: { name: s("Clinician name, full or first name") },
    run: getClinician,
  },
  {
    name: "list_clinicians",
    description:
      "List the 12 clinicians with capacity and status. Filter by region, discipline or status (At Risk, Monitor, Healthy, available).",
    properties: {
      region: s("Region", ["Brisbane North", "Brisbane South"]),
      discipline: s("Discipline", ["Occupational Therapy", "Speech Pathology"]),
      status: s("Status", ["At Risk", "Monitor", "Healthy", "available"]),
    },
    run: listClinicians,
  },
  {
    name: "list_tasks",
    description:
      "Tasks and follow-ups. Filter by owner, client, type and status (open, overdue, escalated, done, all). Defaults to open.",
    properties: {
      owner: s("Task owner name"),
      client: s("Client name"),
      type: s("Task type"),
      status: s("Status", ["open", "overdue", "escalated", "done", "all"]),
    },
    run: listTasks,
  },
  {
    name: "list_referrals",
    description: "This week's referrals with status, source, missing information and duplicates.",
    properties: { status: s("Referral status, e.g. New, Missing information, Profile created") },
    run: listReferrals,
  },
  {
    name: "list_reports",
    description: "Progress, plan review and assessment reports with status and due dates.",
    properties: {
      status: s("Report status", ["Not started", "AI draft", "In review", "Approved", "Sent"]),
      clinician: s("Clinician name"),
      client: s("Client name"),
      due_within_days: n("Only reports due within this many days (overdue included)"),
    },
    run: listReports,
  },
  {
    name: "list_forms",
    description: "AI pre-filled smart forms, their status and missing fields.",
    properties: {},
    run: listForms,
  },
  {
    name: "get_schedule",
    description: `This week's schedule (${dt("Mon 19 Oct")} to ${dt("Fri 23 Oct")}): sessions, open slots, driving and AI schedule suggestions, for the team or one clinician and optionally one day.`,
    properties: {
      clinician: s("Clinician name"),
      day: s("Day", [...scheduleDays.map((d) => d.short), "today", "tomorrow"]),
    },
    run: getSchedule,
  },
  {
    name: "list_compliance",
    description:
      "Expiring or expired client documents (plans, agreements, consents) and staff checks (registration, Blue Card, NDIS Worker Screening, first aid, vehicle insurance).",
    properties: {
      kind: s("Kind", ["Client", "Staff"]),
      person: s("Client or staff member name"),
      within_days: n("Due within this many days; default 60"),
    },
    run: listCompliance,
  },
  {
    name: "list_case_notes",
    description: "Session notes awaiting approval or overdue, with AI draft status.",
    properties: {},
    run: listCaseNotes,
  },
  {
    name: "list_automations",
    description:
      "Automation rules (trigger, condition, action), whether each is on, runs and hours returned.",
    properties: {
      enabled: { type: "boolean", description: "Only rules that are on (true) or off (false)" },
    },
    run: listAutomations,
  },
  {
    name: "get_audit_trail",
    description: "Recent recorded actions: AI outputs and human approvals, newest first.",
    properties: { actor: s("Person or 'Medisense AI'"), limit: n("How many entries, default 12") },
    run: auditTrail,
  },
  {
    name: "get_supervision",
    description:
      "Supervision: Sarah Thompson's next session with Grace Liu, the AI brief agenda, flagged cases, previous actions, and the team's upcoming sessions.",
    properties: {},
    run: getSupervision,
  },
  {
    name: "search_records",
    description:
      "Keyword search across clients, clinicians, tasks, referrals, reports, expiries, automations and screens. Use when unsure which tool fits.",
    properties: { query: s("Search words") },
    run: searchRecords,
  },
];

/** The tools bound to one request's live state, in the shape the AI engine expects. */
export function aiTools(state: LiveState): AiTool[] {
  return toolDefs.map((t) => ({
    name: t.name,
    description: t.description,
    parameters: { type: "object", properties: t.properties, additionalProperties: false },
    run: (input) => {
      // Models get fewer rows than people: it keeps token use inside free-tier limits.
      const result = t.run(state, input);
      const more = result.items.length - AI_ITEMS;
      return {
        summary: result.summary,
        items: result.items.slice(0, AI_ITEMS),
        ...(more > 0
          ? { note: `${more} more rows not shown; narrow the filters to see them` }
          : {}),
      };
    },
  }));
}

export function runToolByName(state: LiveState, name: string, input: Input = {}) {
  const tool = toolDefs.find((t) => t.name === name);
  return tool ? tool.run(state, input) : null;
}
