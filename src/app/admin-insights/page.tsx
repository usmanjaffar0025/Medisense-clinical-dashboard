import { Download } from "lucide-react";
import type { Metadata } from "next";
import { TimeDonut, categoryColour } from "@/components/charts/time-donut";
import { Button } from "@/components/ui/button";
import { Caption, Card } from "@/components/ui/card";
import { PageContainer, PageHeader } from "@/components/ui/page";
import { Tag } from "@/components/ui/tag";
import {
  automationOpportunities,
  automationTotal,
  guardrails,
  loggedHoursPerWeek,
  timeByCategory,
} from "@/data/admin";
import { cn } from "@/lib/cn";

export const metadata: Metadata = { title: "Admin insights · Medisense" };

export default function AdminInsightsPage() {
  const maxHours = Math.max(...automationOpportunities.map((o) => o.hours));

  return (
    <PageContainer>
      <PageHeader
        eyebrow="Admin insights"
        title="Where clinician time goes"
        description={`All clinicians · last 4 weeks · ≈${loggedHoursPerWeek} logged hours per week.`}
        actions={
          <Button>
            <Download className="size-4" strokeWidth={1.5} aria-hidden="true" />
            Export
          </Button>
        }
      />

      <div className="grid items-start gap-6 lg:grid-cols-12">
        <Card aria-labelledby="time-by-category" className="px-6 pt-5 pb-4.5 lg:col-span-5">
          <h2 id="time-by-category" className="headline text-h2">
            Time by category
          </h2>
          <Caption className="mt-1">Average logged hours per week</Caption>
          <div className="flex justify-center pt-5 pb-4">
            <TimeDonut categories={timeByCategory} />
          </div>
          <div className="border-t border-border-strong" role="table" aria-label="Time by category">
            <div
              role="row"
              className="grid grid-cols-[minmax(0,1fr)_56px_56px] gap-3 border-b border-border py-2 eyebrow"
            >
              <span>Category</span>
              <span className="text-right">Share</span>
              <span className="text-right">Hrs/wk</span>
            </div>
            {timeByCategory.map((c) => (
              <div
                key={c.label}
                role="row"
                className="grid grid-cols-[minmax(0,1fr)_56px_56px] items-center gap-3 border-b border-border py-2.5 text-small last:border-b-0"
              >
                <span className="flex items-center gap-2">
                  <span className={cn("size-2.5 rounded-xs", categoryColour[c.colour].fill)} />
                  {c.label}
                </span>
                <span className="text-right">{c.share}%</span>
                <span className="text-right">{c.hours}h</span>
              </div>
            ))}
          </div>
        </Card>

        <Card aria-labelledby="opportunities" className="overflow-hidden lg:col-span-7">
          <div className="border-b border-border px-5 pt-5 pb-4">
            <h2 id="opportunities" className="headline text-h2">
              Safe automation opportunities
            </h2>
            <Caption className="mt-1">
              Estimated team hours returned per week. Each produces a draft that a clinician
              approves.
            </Caption>
          </div>
          {automationOpportunities.map((o) => (
            <div
              key={o.label}
              className="grid grid-cols-[minmax(0,1fr)_150px_104px] items-center gap-5 border-b border-border px-5 py-3.5"
            >
              <div>
                <div className="font-semibold">{o.label}</div>
                <div className="text-small text-ink-700">{o.description}</div>
              </div>
              <div className="flex items-center gap-2.5">
                <div className="relative h-1.5 flex-1 rounded-full bg-surface-sunken">
                  <span
                    className="absolute inset-y-0 left-0 rounded-full bg-accent"
                    style={{ width: `${(o.hours / maxHours) * 100}%` }}
                  />
                </div>
                <span className="w-7.5 text-right text-small">{o.hours}h</span>
              </div>
              <Tag tone={o.live ? "live" : "neutral"}>{o.live ? "Live in demo" : "Available"}</Tag>
            </div>
          ))}
          <div className="flex flex-wrap items-baseline justify-between gap-3 bg-surface-sunken px-5 py-4">
            <span className="eyebrow">Total</span>
            <span>
              <span className="headline text-stat font-normal">{automationTotal.hours}</span>{" "}
              <span className="text-small text-ink-700">{automationTotal.fte}</span>{" "}
              <span className="ml-1.5 text-caption font-medium text-ink-500">· Estimate</span>
            </span>
          </div>
        </Card>

        <section
          aria-label="Guardrails"
          className="grid gap-px overflow-hidden rounded-card border border-border bg-border lg:col-span-12 lg:grid-cols-3"
        >
          {guardrails.map((g, i) => (
            <div key={g.title} className="flex flex-col gap-2 bg-surface px-6 py-5.5">
              <span className="eyebrow">Guardrail {i + 1}</span>
              <span className="headline text-h2 font-normal">{g.title}</span>
              <span className="text-small text-ink-700">{g.body}</span>
            </div>
          ))}
        </section>
      </div>
    </PageContainer>
  );
}
