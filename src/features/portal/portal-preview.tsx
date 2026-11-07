"use client";

import { Lock } from "lucide-react";
import { Caption, Card, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { portalFamily, portalSettings } from "@/data/portal";
import { useDemoStore } from "@/state/demo-store";
import { FamilyView } from "./family-view";

export function PortalPreview() {
  const settings = useDemoStore((s) => s.portalSettings);
  const toggleSetting = useDemoStore((s) => s.togglePortalSetting);
  const messages = useDemoStore((s) => s.portalMessages);
  const appointment = useDemoStore((s) => s.portalAppointment);
  const reportApproved = useDemoStore((s) => s.report.approved);
  const done = useDemoStore((s) => s.portalHomeDone);

  const family = portalFamily;
  const sent = messages.length - family.messages.length;

  return (
    <div className="grid items-start gap-6 lg:grid-cols-12">
      <div className="flex flex-col gap-6 lg:col-span-4">
        <Card aria-labelledby="portal-controls" className="overflow-hidden">
          <div className="px-5 pt-5 pb-3">
            <CardTitle
              id="portal-controls"
              title="What families can see"
              description="Set by the clinic; changes show instantly in the preview"
            />
          </div>
          {portalSettings.map((s) => (
            <div key={s.id} className="flex items-start gap-3 border-t border-border px-5 py-3">
              <Switch
                on={settings[s.id]}
                label={`${s.label}: ${settings[s.id] ? "on" : "off"}`}
                onToggle={() => toggleSetting(s.id)}
              />
              <div>
                <div className="text-small font-semibold">{s.label}</div>
                <Caption>{s.detail}</Caption>
              </div>
            </div>
          ))}
        </Card>

        <Card aria-labelledby="portal-activity" className="px-5 py-5">
          <CardTitle id="portal-activity" title="What the clinic sees" />
          <ul className="mt-3 flex flex-col gap-2 text-small">
            <li className="flex justify-between">
              <span className="text-ink-700">Appointment</span>
              <b className="font-semibold">
                {appointment === "confirmed"
                  ? "Confirmed by family"
                  : appointment === "change-requested"
                    ? "Change requested → admin task"
                    : "Awaiting confirmation"}
              </b>
            </li>
            <li className="flex justify-between">
              <span className="text-ink-700">Home program this week</span>
              <b className="font-semibold">
                {done.length} of {family.homeProgram.length} practised
              </b>
            </li>
            <li className="flex justify-between">
              <span className="text-ink-700">New family messages</span>
              <b className="font-semibold">{sent ? `${sent} → reply task for Hannah` : "None"}</b>
            </li>
            <li className="flex justify-between">
              <span className="text-ink-700">Progress report</span>
              <b className="font-semibold">{reportApproved ? "Shared" : "Hidden until approved"}</b>
            </li>
          </ul>
          <Caption className="mt-3 border-t border-border pt-3">
            Families only ever see approved, plain-language content. AI never replies to families;
            messages become tasks for the clinician.
          </Caption>
        </Card>
      </div>

      <div className="lg:col-span-8">
        <div className="overflow-hidden rounded-sheet border border-border-strong bg-canvas shadow-overlay">
          <div className="flex items-center gap-2 border-b border-border bg-surface-sunken px-4 py-2.5">
            <span aria-hidden="true" className="flex gap-1.5">
              <i className="size-2.5 rounded-full bg-border-strong" />
              <i className="size-2.5 rounded-full bg-border-strong" />
              <i className="size-2.5 rounded-full bg-border-strong" />
            </span>
            <span className="mx-auto flex items-center gap-1.5 rounded-control bg-surface px-3 py-1 text-caption text-ink-500">
              <Lock className="size-3" strokeWidth={1.5} aria-hidden="true" />
              family.medisense.com.au
            </span>
            <span className="text-caption font-semibold text-accent">Preview</span>
          </div>

          <FamilyView />
        </div>
      </div>
    </div>
  );
}
