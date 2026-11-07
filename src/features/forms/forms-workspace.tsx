"use client";

import { Check, CircleAlert, RefreshCw, Send } from "lucide-react";
import { useSearchParams } from "next/navigation";
import { useState } from "react";
import { PenNib } from "@/components/ai/provenance";
import { Button } from "@/components/ui/button";
import { Caption, Card, CardTitle } from "@/components/ui/card";
import { Tag } from "@/components/ui/tag";
import { formDrafts, formTemplates, type FormDraft, type FormField } from "@/data/forms";
import { cn } from "@/lib/cn";
import { useDemoStore, type FormState } from "@/state/demo-store";

const input =
  "w-full rounded-control border bg-surface-raised px-2.5 py-1.5 text-small text-ink-900 outline-none focus:border-accent focus:shadow-focus";

function completeness(draft: FormDraft, state: FormState | undefined) {
  const required = draft.fields.filter((f) => f.required);
  const filled = required.filter((f) => (state?.values[f.id] ?? f.value).trim() !== "");
  const prefilled = draft.fields.filter((f) => f.value.trim() !== "").length;
  return {
    required: required.length,
    filled: filled.length,
    missing: required.length - filled.length,
    prefilled,
    percent: Math.round((filled.length / Math.max(required.length, 1)) * 100),
  };
}

function statusLabel(state: FormState | undefined, missing: number) {
  if (state?.status === "submitted")
    return { text: "Submitted · synced", tone: "healthy" } as const;
  if (state?.status === "error") return { text: "Sync failed", tone: "over" } as const;
  if (missing > 0) return { text: `${missing} missing`, tone: "monitor" } as const;
  return { text: "Ready to submit", tone: "available" } as const;
}

export function FormsWorkspace() {
  const params = useSearchParams();
  const forms = useDemoStore((s) => s.forms);
  const initial =
    formDrafts.find((f) => f.id === params.get("form"))?.id ?? formDrafts[0]?.id ?? "";
  const [selectedId, setSelectedId] = useState(initial);
  const selected = formDrafts.find((f) => f.id === selectedId);

  const totals = formDrafts.map((d) => ({ d, c: completeness(d, forms[d.id]) }));
  const allFields = formDrafts.reduce((sum, d) => sum + d.fields.length, 0);
  const prefilled = totals.reduce((sum, t) => sum + t.c.prefilled, 0);
  const submitted = formDrafts.filter((d) => forms[d.id]?.status === "submitted").length;
  const errors = formDrafts.filter((d) => forms[d.id]?.status === "error").length;
  const missing = totals.reduce((sum, t) => sum + t.c.missing, 0);

  const metrics = [
    {
      label: "Forms in progress",
      value: String(formDrafts.length - submitted),
      caption: `${submitted} submitted`,
    },
    {
      label: "Fields pre-filled by AI",
      value: `${Math.round((prefilled / allFields) * 100)}%`,
      caption: `${prefilled} of ${allFields} from verified records`,
    },
    {
      label: "Required fields missing",
      value: String(missing),
      caption: "Highlighted for a person to complete",
    },
    { label: "Synced to PMS", value: String(submitted), caption: "Practice management system" },
    {
      label: "Sync exceptions",
      value: String(errors),
      caption: errors ? "Needs retry" : "None open",
    },
  ];

  return (
    <>
      <section
        aria-label="Forms summary"
        className="stat-band grid grid-cols-2 gap-px overflow-hidden rounded-card border border-border bg-border lg:grid-cols-5"
      >
        {metrics.map((m) => (
          <div key={m.label} className="flex flex-col gap-1.5 bg-surface px-5 py-4">
            <span className="eyebrow">{m.label}</span>
            <span className="headline text-stat font-normal">{m.value}</span>
            <Caption>{m.caption}</Caption>
          </div>
        ))}
      </section>

      <div className="mt-6 grid items-start gap-6 lg:grid-cols-12">
        <div className="flex flex-col gap-6 lg:col-span-4">
          <Card aria-labelledby="drafts" className="overflow-hidden">
            <div className="px-5 pt-5 pb-3">
              <CardTitle
                id="drafts"
                title="Form drafts"
                description="Pre-filled from verified client data"
              />
            </div>
            <ul>
              {totals.map(({ d, c }) => {
                const st = statusLabel(forms[d.id], c.missing);
                const active = d.id === selectedId;
                return (
                  <li key={d.id}>
                    <button
                      type="button"
                      aria-pressed={active}
                      onClick={() => setSelectedId(d.id)}
                      className={cn(
                        "flex w-full cursor-pointer flex-col gap-1.5 border-t border-border px-5 py-3 text-left hover:bg-canvas",
                        active && "bg-accent-tint shadow-rule-accent",
                      )}
                    >
                      <span className="flex items-center justify-between gap-2">
                        <span className="font-semibold">{d.client}</span>
                        <Tag tone={st.tone}>{st.text}</Tag>
                      </span>
                      <span className="text-caption text-ink-500">
                        {d.template} · {d.funding}
                      </span>
                      <span
                        className="h-1 overflow-hidden rounded-full bg-surface-sunken"
                        aria-hidden="true"
                      >
                        <span
                          className="block h-full rounded-full bg-accent"
                          style={{ width: `${c.percent}%` }}
                        />
                      </span>
                    </button>
                  </li>
                );
              })}
            </ul>
          </Card>

          <Card aria-labelledby="templates" className="px-5 pt-5 pb-4">
            <CardTitle
              id="templates"
              title="Template library"
              description="Reusable forms; fields map to client data"
            />
            <ul className="mt-3 flex flex-col">
              {formTemplates.map((t) => (
                <li
                  key={t}
                  className="flex items-center justify-between gap-2 border-t border-border py-2 text-small"
                >
                  {t}
                  <span className="text-caption text-ink-500">
                    {formDrafts.some((d) => d.template === t) ? "In use" : "Template"}
                  </span>
                </li>
              ))}
            </ul>
          </Card>
        </div>

        <div className="lg:col-span-8">
          {selected && <FormDetail key={selected.id} draft={selected} />}
        </div>
      </div>
    </>
  );
}

function SourceBadge({ field, empty }: { field: FormField; empty: boolean }) {
  if (!field.source) {
    return empty ? (
      <span className="text-caption font-semibold text-over">Not found in records</span>
    ) : (
      <span className="text-caption text-ink-500">Entered by staff</span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1 text-caption font-medium text-brass">
      <PenNib className="size-3 text-brass" />
      {field.sourceDetail ?? field.source}
    </span>
  );
}

function FormDetail({ draft }: { draft: FormDraft }) {
  const state = useDemoStore((s) => s.forms[draft.id]);
  const setValue = useDemoStore((s) => s.setFormValue);
  const submit = useDemoStore((s) => s.submitForm);
  const audit = useDemoStore((s) => s.audit);
  const [syncing, setSyncing] = useState(false);
  const c = completeness(draft, state);
  const submitted = state?.status === "submitted";
  const failed = state?.status === "error";
  const log = audit.filter((e) => e.object === draft.client && /sync|Submitted/i.test(e.action));

  function send() {
    setSyncing(true);
    window.setTimeout(() => {
      submit(draft.id);
      setSyncing(false);
    }, 900);
  }

  return (
    <Card aria-labelledby="form-title" className="overflow-hidden">
      <div className="flex flex-wrap items-start justify-between gap-3 px-6 pt-5 pb-4">
        <div>
          <p className="eyebrow">
            {draft.funding} · {draft.template}
          </p>
          <h2 id="form-title" className="mt-1.5 headline text-h2">
            {draft.client}
          </h2>
          <Caption className="mt-1">{draft.purpose}</Caption>
        </div>
        <div className="w-48 text-right">
          <div className="headline text-stat-sm font-normal">{c.percent}%</div>
          <Caption>
            {c.filled} of {c.required} required fields complete
          </Caption>
          <div
            className="mt-1.5 h-1.5 overflow-hidden rounded-full bg-surface-sunken"
            aria-hidden="true"
          >
            <span
              className={cn(
                "block h-full rounded-full",
                c.missing ? "bg-monitor-dot" : "bg-healthy-dot",
              )}
              style={{ width: `${c.percent}%` }}
            />
          </div>
        </div>
      </div>

      <div className="border-t border-border">
        {draft.fields.map((f) => {
          const value = state?.values[f.id] ?? f.value;
          const empty = value.trim() === "";
          return (
            <div
              key={f.id}
              className={cn(
                "grid grid-cols-1 gap-2 border-b border-border px-6 py-2.5 md:grid-cols-[180px_minmax(0,1fr)_170px] md:items-start",
                empty && f.required && "bg-monitor-bg",
              )}
            >
              <label htmlFor={`${draft.id}-${f.id}`} className="pt-1.5 text-small font-semibold">
                {f.label}
                {f.required && <span className="text-over"> *</span>}
              </label>
              <div>
                {f.multiline ? (
                  <textarea
                    id={`${draft.id}-${f.id}`}
                    rows={3}
                    value={value}
                    disabled={submitted}
                    onChange={(e) => setValue(draft.id, f.id, e.target.value)}
                    className={cn(
                      input,
                      "resize-y",
                      empty && f.required ? "border-monitor-dot" : "border-border-strong",
                    )}
                  />
                ) : (
                  <input
                    id={`${draft.id}-${f.id}`}
                    value={value}
                    disabled={submitted}
                    placeholder={empty ? "Type to complete" : undefined}
                    onChange={(e) => setValue(draft.id, f.id, e.target.value)}
                    className={cn(
                      input,
                      empty && f.required ? "border-monitor-dot" : "border-border-strong",
                    )}
                  />
                )}
                {f.check && !submitted && (
                  <p className="mt-1 flex items-center gap-1 text-caption font-medium text-monitor">
                    <CircleAlert className="size-3.5" strokeWidth={1.5} aria-hidden="true" />
                    {f.check}
                  </p>
                )}
              </div>
              <div className="pt-1.5 md:text-right">
                <SourceBadge field={f} empty={empty} />
              </div>
            </div>
          );
        })}
      </div>

      <div className="flex flex-col gap-3 px-6 py-4">
        {failed && (
          <div className="flex flex-wrap items-center justify-between gap-3 rounded-control bg-over-bg px-4 py-3">
            <span className="flex items-center gap-2 text-small text-over">
              <CircleAlert className="size-4" strokeWidth={1.5} aria-hidden="true" />
              Sync to the practice management system timed out. Nothing was lost; the form is queued
              in the exception list.
            </span>
            <Button size="sm" onClick={send} disabled={syncing}>
              <RefreshCw
                className={cn("size-3.5", syncing && "animate-spin")}
                strokeWidth={1.5}
                aria-hidden="true"
              />
              Retry sync
            </Button>
          </div>
        )}
        {submitted ? (
          <div
            role="status"
            className="flex items-center gap-2 rounded-control bg-healthy-bg px-4 py-3 text-small font-semibold text-healthy"
          >
            <Check className="size-4" strokeWidth={2} aria-hidden="true" />
            Submitted and synced to the practice management system · logged to audit trail
          </div>
        ) : (
          !failed && (
            <div className="flex flex-wrap items-center gap-3">
              <Button variant="primary" disabled={c.missing > 0 || syncing} onClick={send}>
                <Send className="size-4" strokeWidth={1.5} aria-hidden="true" />
                {syncing ? "Submitting…" : "Validate & submit"}
              </Button>
              <Caption>
                {c.missing > 0
                  ? `Complete ${c.missing} required ${c.missing === 1 ? "field" : "fields"} to submit.`
                  : "All required fields complete. Submits to your practice management system."}
              </Caption>
            </div>
          )
        )}
        {log.length > 0 && (
          <div className="border-t border-border pt-3">
            <div className="mb-1.5 eyebrow">Submission history</div>
            <ol className="flex flex-col gap-1">
              {log.map((e) => (
                <li key={e.id} className="grid grid-cols-[48px_minmax(0,1fr)] gap-2 text-small">
                  <span className="font-mono text-caption leading-5 text-ink-500">{e.time}</span>
                  <span className={/failed/i.test(e.action) ? "text-over" : "text-ink-900"}>
                    {e.action}
                  </span>
                </li>
              ))}
            </ol>
          </div>
        )}
      </div>
    </Card>
  );
}
