"use client";

import { dt } from "@/lib/clock";
import { Play, Plus, Zap } from "lucide-react";
import { useState } from "react";
import { BarList } from "@/components/charts/bar-list";
import { colour } from "@/components/charts/chart-kit";
import { StackedColumns } from "@/components/charts/stacked-columns";
import { Button } from "@/components/ui/button";
import { Caption, Card, CardTitle } from "@/components/ui/card";
import { FilterChips } from "@/components/ui/filter-chips";
import { Switch } from "@/components/ui/switch";
import { Tag, type TagTone } from "@/components/ui/tag";
import {
  automationCategories,
  automationRules,
  builderActions,
  builderConditions,
  builderTriggers,
  recentRuns,
  type AutomationCategory,
  type AutomationOutput,
  type AutomationRule,
} from "@/data/automations";
import { weeks } from "@/data/weeks";
import { cn } from "@/lib/cn";
import { useDemoStore } from "@/state/demo-store";

const categoryColour: Record<AutomationCategory, string> = {
  Documentation: colour.series1,
  "Follow-ups": colour.series2,
  Intake: colour.series3,
  Reports: colour.series4,
  Compliance: colour.sand,
  Scheduling: colour.sage,
};

const outputTone: Record<AutomationOutput, TagTone> = {
  "Draft for review": "live",
  "Creates a task": "available",
  "Notifies a person": "neutral",
};

const selectClass =
  "h-9 w-full cursor-pointer rounded-control border border-border-strong bg-surface-raised px-2.5 text-small text-ink-900";

export function AutomationsWorkspace() {
  const enabled = useDemoStore((s) => s.automations);
  const customRules = useDemoStore((s) => s.customRules);
  const toggle = useDemoStore((s) => s.toggleAutomation);
  const addAutomation = useDemoStore((s) => s.addAutomation);
  const [category, setCategory] = useState<"all" | AutomationCategory>("all");
  const [triggerId, setTriggerId] = useState<string>(builderTriggers[0].id);
  const [condition, setCondition] = useState(builderConditions[0] ?? "");
  const [actionIndex, setActionIndex] = useState(0);
  const [tested, setTested] = useState(false);

  const rules = [...automationRules, ...customRules];
  const on = (r: AutomationRule) => enabled[r.id] ?? r.enabled;
  const active = rules.filter(on);
  const runs = active.reduce((s, r) => s + r.runs30d, 0);
  const hours = active.reduce((s, r) => s + r.hoursSaved30d, 0);

  const trigger = builderTriggers.find((t) => t.id === triggerId) ?? builderTriggers[0];
  const action = builderActions[actionIndex] ?? builderActions[0];

  const metrics = [
    {
      label: "Active rules",
      value: `${active.length} of ${rules.length}`,
      caption: "Turn on or off any time",
    },
    { label: "Runs, last 30 days", value: runs, caption: "Across all active rules" },
    { label: "Hours returned", value: `${hours} h`, caption: "Last 30 days · estimate" },
    { label: "Waiting for a person", value: 9, caption: "Drafts and tasks to confirm" },
    { label: "Failures", value: 1, caption: "Form sync retrying", over: true },
  ];

  const weekly = weeks.map((w, i) => ({
    week: w,
    ...Object.fromEntries(
      automationCategories.map((c) => [
        c,
        active.filter((r) => r.category === c).reduce((s, r) => s + (r.weekly[i] ?? 0), 0),
      ]),
    ),
  }));
  const usedCategories = automationCategories.filter((c) => active.some((r) => r.category === c));

  const hoursByRule = active
    .filter((r) => r.hoursSaved30d > 0)
    .map((r) => ({
      id: r.id,
      label: r.name,
      value: r.hoursSaved30d,
      colour: categoryColour[r.category],
    }))
    .sort((a, b) => b.value - a.value);

  const visible = rules.filter((r) => category === "all" || r.category === category);

  function saveRule() {
    if (!trigger || !action) return;
    addAutomation({
      id: `custom-${Date.now()}`,
      name: `${trigger.label} ${condition}`.replace(/^A /, "When a "),
      category: trigger.category,
      trigger: trigger.label,
      condition,
      action: action.label,
      output: action.output,
      enabled: false,
      runs30d: 0,
      hoursSaved30d: 0,
      lastRun: "Not yet run",
      weekly: Array(12).fill(0) as number[],
      custom: true,
    });
    setTested(false);
  }

  return (
    <>
      <section
        aria-label="Automation summary"
        className="grid grid-cols-2 gap-px overflow-hidden rounded-card border border-border bg-border lg:grid-cols-5"
      >
        {metrics.map((m) => (
          <div key={m.label} className="flex flex-col gap-1.5 bg-surface px-5 py-4">
            <span className="eyebrow">{m.label}</span>
            <span className={cn("headline text-stat font-normal", m.over && "text-over")}>
              {m.value}
            </span>
            <Caption>{m.caption}</Caption>
          </div>
        ))}
      </section>

      <div className="mt-6 grid items-stretch gap-6 lg:grid-cols-12">
        <Card aria-labelledby="runs-week" className="flex flex-col px-6 pt-5 pb-4 lg:col-span-7">
          <CardTitle
            id="runs-week"
            title="Runs per week"
            description="Active rules by category · last 12 weeks"
          />
          <div className="mt-3 flex flex-1 flex-col">
            <StackedColumns
              label="Automation runs per week by category"
              height="fill"
              data={weekly}
              xKey="week"
              series={usedCategories.map((c) => ({ key: c, label: c, colour: categoryColour[c] }))}
            />
          </div>
        </Card>
        <Card aria-labelledby="hours-rule" className="flex flex-col px-6 pt-5 pb-4 lg:col-span-5">
          <CardTitle
            id="hours-rule"
            title="Hours returned by rule"
            description="Last 30 days · estimate"
          />
          <div className="mt-3">
            <BarList
              label="Hours returned by rule"
              data={hoursByRule}
              labelWidth={200}
              format={(v) => `${v} h`}
              unit="hours"
            />
          </div>
        </Card>
      </div>

      <div className="mt-6 grid items-start gap-6 lg:grid-cols-12">
        <Card aria-labelledby="rules" className="overflow-hidden lg:col-span-8">
          <div className="flex flex-wrap items-end justify-between gap-3 px-5 pt-5 pb-3">
            <CardTitle
              id="rules"
              title="Rules"
              description="When something happens, Medisense prepares the next step"
            />
            <FilterChips
              label="Filter by category"
              value={category}
              onChange={setCategory}
              options={[
                { id: "all" as const, label: "All" },
                ...automationCategories.map((c) => ({
                  id: c,
                  label: c,
                  count: rules.filter((r) => r.category === c).length,
                })),
              ]}
            />
          </div>
          {visible.map((r) => {
            const isOn = on(r);
            return (
              <div
                key={r.id}
                className={cn(
                  "grid items-start gap-x-4 gap-y-2 border-t border-border px-5 py-3.5 md:grid-cols-[40px_minmax(0,1fr)_150px]",
                  !isOn && "bg-surface-sunken/60",
                )}
              >
                <Switch
                  on={isOn}
                  label={`${r.name}: ${isOn ? "on" : "off"}`}
                  onToggle={() => toggle(r.id)}
                />
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className={cn("font-semibold", !isOn && "text-ink-500")}>{r.name}</span>
                    <span className="inline-flex items-center gap-1 text-caption font-semibold text-ink-500">
                      <span
                        aria-hidden="true"
                        className="size-2 rounded-xs"
                        style={{ backgroundColor: categoryColour[r.category] }}
                      />
                      {r.category}
                    </span>
                    {r.custom && <Tag tone="live">New · off until reviewed</Tag>}
                  </div>
                  <p className="mt-1 text-small text-ink-700">
                    <b className="font-semibold text-ink-900">When</b> {r.trigger.toLowerCase()} ·{" "}
                    <b className="font-semibold text-ink-900">if</b> {r.condition.toLowerCase()} ·{" "}
                    <b className="font-semibold text-ink-900">then</b> {r.action.toLowerCase()}
                  </p>
                  <div className="mt-1.5">
                    <Tag tone={outputTone[r.output]}>{r.output}</Tag>
                  </div>
                </div>
                <div className="text-small md:text-right">
                  <div>
                    <b className="font-semibold">{r.runs30d}</b>{" "}
                    <span className="text-ink-500">runs · 30d</span>
                  </div>
                  <div>
                    <b className="font-semibold">{r.hoursSaved30d} h</b>{" "}
                    <span className="text-ink-500">returned</span>
                  </div>
                  <Caption>{r.lastRun}</Caption>
                </div>
              </div>
            );
          })}
        </Card>

        <div className="flex flex-col gap-6 lg:col-span-4">
          <Card aria-labelledby="builder" className="flex flex-col gap-3 px-5 py-5">
            <CardTitle
              id="builder"
              title="New rule"
              description="Built from plain-language steps"
            />
            <label className="flex flex-col gap-1">
              <span className="eyebrow">When</span>
              <select
                className={selectClass}
                value={triggerId}
                onChange={(e) => {
                  setTriggerId(e.target.value);
                  setTested(false);
                }}
              >
                {builderTriggers.map((t) => (
                  <option key={t.id} value={t.id}>
                    {t.label}
                  </option>
                ))}
              </select>
            </label>
            <label className="flex flex-col gap-1">
              <span className="eyebrow">If</span>
              <select
                className={selectClass}
                value={condition}
                onChange={(e) => {
                  setCondition(e.target.value);
                  setTested(false);
                }}
              >
                {builderConditions.map((c) => (
                  <option key={c}>{c}</option>
                ))}
              </select>
            </label>
            <label className="flex flex-col gap-1">
              <span className="eyebrow">Then</span>
              <select
                className={selectClass}
                value={actionIndex}
                onChange={(e) => {
                  setActionIndex(Number(e.target.value));
                  setTested(false);
                }}
              >
                {builderActions.map((a, i) => (
                  <option key={a.label} value={i}>
                    {a.label}
                  </option>
                ))}
              </select>
            </label>
            <p className="rounded-control bg-surface-sunken px-3 py-2.5 text-small text-ink-700">
              <Zap
                className="mr-1 inline size-3.5 text-accent"
                strokeWidth={1.5}
                aria-hidden="true"
              />
              {trigger?.label} {condition}, {action?.label.toLowerCase()}.
            </p>
            {tested && trigger && (
              <p className="text-small text-ink-700">
                Would match <b className="font-semibold text-ink-900">{trigger.matches} records</b>{" "}
                today. Nothing is sent or changed by a test.
              </p>
            )}
            <div className="flex flex-wrap gap-2">
              <Button onClick={() => setTested(true)}>
                <Play className="size-4" strokeWidth={1.5} aria-hidden="true" />
                Test on today&apos;s data
              </Button>
              <Button variant="primary" onClick={saveRule}>
                <Plus className="size-4" strokeWidth={1.5} aria-hidden="true" />
                Save rule
              </Button>
            </div>
            <Caption>New rules are saved switched off until a manager turns them on.</Caption>
          </Card>

          <Card aria-labelledby="recent-runs" className="overflow-hidden">
            <div className="px-5 pt-5 pb-3">
              <CardTitle
                id="recent-runs"
                title="Recent runs"
                description={`Today, ${dt("Tue 20 Oct")}`}
              />
            </div>
            {recentRuns.map((r) => (
              <div
                key={`${r.time}-${r.rule}`}
                className="flex gap-3 border-t border-border px-5 py-2.5"
              >
                <span className="w-10 flex-none text-caption font-semibold text-ink-500">
                  {r.time}
                </span>
                <span className="min-w-0">
                  <span className="block truncate text-small font-semibold">{r.rule}</span>
                  <Caption>
                    {r.object} · {r.outcome}
                  </Caption>
                </span>
              </div>
            ))}
          </Card>
        </div>
      </div>

      <section
        aria-label="Guardrails"
        className="mt-6 grid gap-px overflow-hidden rounded-card border border-border bg-border lg:grid-cols-3"
      >
        {[
          {
            title: "People approve",
            body: "Rules prepare drafts, tasks and reminders. Nothing reaches a client or the clinical record until a person approves it.",
          },
          {
            title: "Every run is logged",
            body: "Each run, retry and change to a rule is written to the audit trail with who or what made it.",
          },
          {
            title: "Off until reviewed",
            body: "New rules start switched off and can be tested on today's data without sending or changing anything.",
          },
        ].map((g, i) => (
          <div key={g.title} className="flex flex-col gap-2 bg-surface px-6 py-5.5">
            <span className="eyebrow">Guardrail {i + 1}</span>
            <span className="headline text-h2 font-normal">{g.title}</span>
            <span className="text-small text-ink-700">{g.body}</span>
          </div>
        ))}
      </section>
    </>
  );
}
