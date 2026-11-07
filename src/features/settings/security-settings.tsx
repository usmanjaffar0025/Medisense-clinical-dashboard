"use client";

import { Check, Lock, Minus, Plug, Server } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Caption, Card, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Tag } from "@/components/ui/tag";
import {
  aiGuardrails,
  integrations,
  permissionRoles,
  permissions,
  securityFacts,
  staffAccess,
} from "@/data/settings";
import { cn } from "@/lib/cn";
import { useDemoStore } from "@/state/demo-store";

export function SecuritySettings() {
  const overrides = useDemoStore((s) => s.permissionOverrides);
  const togglePermission = useDemoStore((s) => s.togglePermission);
  const guardrails = useDemoStore((s) => s.guardrails);
  const toggleGuardrail = useDemoStore((s) => s.toggleGuardrail);
  const connected = useDemoStore((s) => s.connected);
  const connect = useDemoStore((s) => s.connectIntegration);

  return (
    <>
      <section
        aria-label="Security setup"
        className="stat-band grid grid-cols-2 gap-px overflow-hidden rounded-card border border-border bg-border lg:grid-cols-5"
      >
        {securityFacts.map((f) => (
          <div key={f.label} className="flex flex-col gap-1.5 bg-surface px-5 py-4">
            <span className="eyebrow">{f.label}</span>
            <span className="headline text-h2 font-normal">{f.value}</span>
            <Caption>{f.detail}</Caption>
          </div>
        ))}
      </section>

      <div className="mt-6 grid items-start gap-6 lg:grid-cols-12">
        <Card aria-labelledby="permissions" className="overflow-hidden lg:col-span-7">
          <div className="px-5 pt-5 pb-3">
            <CardTitle
              id="permissions"
              title="Roles & permissions"
              description="Click a cell to change access. Locked rows protect clinical safety."
            />
          </div>
          <div className="overflow-x-auto">
            <div className="min-w-160">
              <div className="grid grid-cols-[minmax(0,1fr)_repeat(4,96px)] border-y border-border bg-surface-sunken px-5 py-2 eyebrow">
                <span>Permission</span>
                {permissionRoles.map((r) => (
                  <span key={r} className="text-center">
                    {r}
                  </span>
                ))}
              </div>
              {permissions.map((p) => (
                <div
                  key={p.id}
                  className="grid grid-cols-[minmax(0,1fr)_repeat(4,96px)] items-center border-b border-border px-5 py-2"
                >
                  <span>
                    <span className="flex items-center gap-1.5 text-small font-semibold">
                      {p.label}
                      {p.locked && (
                        <Lock
                          className="size-3 text-ink-400"
                          strokeWidth={1.5}
                          aria-label="Locked"
                        />
                      )}
                    </span>
                    <Caption>{p.detail}</Caption>
                  </span>
                  {permissionRoles.map((role) => {
                    const key = `${p.id}:${role}`;
                    const allowed = overrides[key] ?? p.roles[role];
                    const changed = key in overrides;
                    return (
                      <span key={role} className="flex justify-center">
                        <button
                          type="button"
                          disabled={p.locked}
                          aria-pressed={allowed}
                          aria-label={`${p.label} for ${role}: ${allowed ? "allowed" : "not allowed"}`}
                          onClick={() => togglePermission(p.id, role)}
                          className={cn(
                            "flex size-7 cursor-pointer items-center justify-center rounded-control border transition-colors disabled:cursor-not-allowed",
                            allowed
                              ? "border-accent-fill bg-accent-tint text-accent"
                              : "border-border bg-surface text-ink-400 hover:border-border-strong",
                            changed && "ring-2 ring-accent-fill ring-offset-1",
                          )}
                        >
                          {allowed ? (
                            <Check className="size-3.5" strokeWidth={2.25} aria-hidden="true" />
                          ) : (
                            <Minus className="size-3.5" strokeWidth={1.5} aria-hidden="true" />
                          )}
                        </button>
                      </span>
                    );
                  })}
                </div>
              ))}
            </div>
          </div>
          <Caption className="px-5 py-3">
            Clinicians see only their own clients. Leadership sees workload and status, not clinical
            note content. Every change is written to the audit trail.
          </Caption>
        </Card>

        <Card aria-labelledby="guardrails" className="overflow-hidden lg:col-span-5">
          <div className="px-5 pt-5 pb-3">
            <CardTitle
              id="guardrails"
              title="AI guardrails"
              description="How AI is allowed to work with client data"
            />
          </div>
          {aiGuardrails.map((g) => (
            <div key={g.id} className="flex items-start gap-3 border-t border-border px-5 py-3">
              <Switch
                on={guardrails[g.id] ?? g.on}
                disabled={g.locked}
                label={`${g.label}: ${(guardrails[g.id] ?? g.on) ? "on" : "off"}`}
                onToggle={() => toggleGuardrail(g.id)}
              />
              <div className="min-w-0">
                <div className="flex items-center gap-1.5 text-small font-semibold">
                  {g.label}
                  {g.locked && (
                    <Lock
                      className="size-3 text-ink-400"
                      strokeWidth={1.5}
                      aria-label="Always on"
                    />
                  )}
                </div>
                <Caption>{g.detail}</Caption>
              </div>
            </div>
          ))}
        </Card>
      </div>

      <Card aria-labelledby="integrations" className="mt-6 overflow-hidden">
        <div className="px-5 pt-5 pb-3">
          <CardTitle
            id="integrations"
            title="Integrations"
            description="Medisense works alongside your current systems; it does not replace your practice management system"
          />
        </div>
        <div className="grid gap-px border-t border-border bg-border sm:grid-cols-2 lg:grid-cols-3">
          {integrations.map((i) => {
            const isOn = connected.includes(i.id);
            return (
              <div key={i.id} className="flex flex-col gap-2 bg-surface px-5 py-4">
                <div className="flex items-start justify-between gap-3">
                  <span className="flex items-center gap-2 font-semibold">
                    {i.id === "pms" ? (
                      <Server className="size-4 text-accent" strokeWidth={1.5} aria-hidden="true" />
                    ) : (
                      <Plug className="size-4 text-accent" strokeWidth={1.5} aria-hidden="true" />
                    )}
                    {i.name}
                  </span>
                  <Tag tone={isOn ? "healthy" : "neutral"}>{isOn ? "Connected" : "Available"}</Tag>
                </div>
                <Caption>{i.detail}</Caption>
                <span className="text-small text-ink-700">{i.direction}</span>
                <div className="mt-auto flex items-center justify-between gap-2 pt-1">
                  <Caption>{isOn ? (i.lastSync ?? "Connected just now") : "Not connected"}</Caption>
                  {!isOn && (
                    <Button size="sm" onClick={() => connect(i.id)}>
                      Connect
                    </Button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </Card>

      <Card aria-labelledby="staff-access" className="mt-6 overflow-hidden">
        <div className="px-5 pt-5 pb-3">
          <CardTitle
            id="staff-access"
            title="Staff access"
            description="Who can sign in, and how"
          />
        </div>
        <div className="grid grid-cols-[minmax(0,1.4fr)_minmax(0,1fr)_minmax(0,1fr)_120px] border-y border-border bg-surface-sunken px-5 py-2 eyebrow">
          <span>Person</span>
          <span>Role</span>
          <span>Last active</span>
          <span>Sign-in</span>
        </div>
        {staffAccess.map((p) => (
          <div
            key={p.name}
            className="grid grid-cols-[minmax(0,1.4fr)_minmax(0,1fr)_minmax(0,1fr)_120px] items-center border-b border-border px-5 py-2.5 text-small"
          >
            <span className="font-semibold">{p.name}</span>
            <span className="text-ink-700">{p.role}</span>
            <span className="text-ink-700">{p.lastActive}</span>
            <span>
              <Tag tone={p.mfa ? "healthy" : "monitor"}>{p.mfa ? "MFA on" : "MFA pending"}</Tag>
            </span>
          </div>
        ))}
        <Caption className="px-5 py-3">
          Recommended setup for your team. Roles, guardrails and integrations can be adjusted at any
          time.
        </Caption>
      </Card>
    </>
  );
}
