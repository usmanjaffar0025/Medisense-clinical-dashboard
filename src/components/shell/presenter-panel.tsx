"use client";

import { X } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState, type ReactNode } from "react";
import type { KeyStatus } from "@/lib/ai/engine";
import { cn } from "@/lib/cn";
import { longDate, nextWorkingDayGap } from "@/lib/clock";
import { roleHome, roleUsers, type Role } from "@/lib/navigation";
import { useDemoStore } from "@/state/demo-store";
import { darkFocus } from "./sidebar";

const roles: { id: Role; label: string }[] = [
  { id: "Leadership", label: "Leadership" },
  { id: "Clinician", label: "Therapist" },
  { id: "Admin", label: "Admin" },
  { id: "Supervisor", label: "Supervisor" },
];

const control =
  "h-9 cursor-pointer rounded-control border border-dashed border-sidebar-faint px-3 text-left text-caption text-sidebar-ink hover:border-accent-fill hover:text-accent-fill";

function Group({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="border-t border-dashed border-sidebar-border px-4 py-3.5">
      <h3 className="mb-2 text-caption text-accent-fill">{title}</h3>
      {children}
    </section>
  );
}

function aiRows(status: KeyStatus | null, last: ReturnType<typeof lastAiOf>) {
  const live = status?.state === "valid";
  return [
    ["Provider", !status ? "Checking" : status.provider ? status.provider : "None connected"],
    ["Model", !status ? "Checking" : status.model ? status.model : "Not in use"],
    ["Connection", status ? (live ? "Live" : "Prepared fallback") : "Checking"],
    [
      "Last call",
      last
        ? `${last.kind}, ${last.source === "live" ? `live${last.latencyMs ? `, ${(last.latencyMs / 1000).toFixed(1)} s` : ""}` : "prepared"}`
        : "None yet",
    ],
  ] as const;
}

const lastAiOf = (last: { kind: string; source: string; latencyMs: number | null } | null) => last;

/**
 * Presenter controls, kept out of the product. Opens with Ctrl + Shift + . and looks deliberately
 * unlike product UI, so nobody mistakes it for a feature.
 */
export function PresenterPanel() {
  const router = useRouter();
  const role = useDemoStore((s) => s.role);
  const setRole = useDemoStore((s) => s.setRole);
  const dayOffset = useDemoStore((s) => s.story.dayOffset);
  const lastSkip = useDemoStore((s) => s.story.lastSkip);
  const lastAi = useDemoStore((s) => s.story.lastAi);
  const advanceDay = useDemoStore((s) => s.advanceDay);
  const advanceToReminder = useDemoStore((s) => s.advanceToReminder);
  const resetDemo = useDemoStore((s) => s.resetDemo);
  const [open, setOpen] = useState(false);
  const [confirming, setConfirming] = useState(false);
  const [status, setStatus] = useState<KeyStatus | null>(null);
  const panel = useRef<HTMLElement>(null);
  const returnTo = useRef<Element | null>(null);

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (
        (event.ctrlKey || event.metaKey) &&
        event.shiftKey &&
        (event.key === "." || event.key === ">")
      ) {
        event.preventDefault();
        setOpen((o) => !o);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  useEffect(() => {
    if (!open) return undefined;
    returnTo.current = document.activeElement;
    const node = panel.current;
    const focusable = () =>
      Array.from(node?.querySelectorAll<HTMLElement>("button") ?? []).filter((b) => !b.hidden);
    focusable()[0]?.focus();
    void fetch("/api/ai/status")
      .then((r) => r.json() as Promise<KeyStatus>)
      .then(setStatus)
      .catch(() => setStatus(null));

    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
      if (event.key !== "Tab") return;
      const items = focusable();
      const first = items[0];
      const last = items[items.length - 1];
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last?.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first?.focus();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => {
      window.removeEventListener("keydown", onKey);
      if (returnTo.current instanceof HTMLElement) returnTo.current.focus();
    };
  }, [open]);

  if (!open) return null;

  return (
    <aside
      ref={panel}
      role="dialog"
      aria-modal="true"
      aria-label="Presenter panel"
      style={darkFocus}
      className="fixed top-4 right-4 bottom-4 z-50 w-88 max-w-full overflow-y-auto rounded-sheet border border-dashed border-accent-fill bg-sidebar font-mono text-sidebar-ink shadow-overlay"
    >
      <header className="flex items-center justify-between gap-3 px-4 py-3">
        <div>
          <h2 className="text-small font-medium">Presenter panel</h2>
          <p className="text-caption text-sidebar-muted">Not part of the product.</p>
        </div>
        <button
          type="button"
          onClick={() => setOpen(false)}
          aria-label="Close presenter panel"
          className="flex size-8 cursor-pointer items-center justify-center rounded-control text-sidebar-muted hover:bg-sidebar-hover hover:text-sidebar-ink"
        >
          <X className="size-4" strokeWidth={1.5} aria-hidden="true" />
        </button>
      </header>

      <Group title="View as">
        <div role="radiogroup" aria-label="View as" className="flex flex-col gap-1">
          {roles.map((r) => (
            <button
              key={r.id}
              type="button"
              role="radio"
              aria-checked={role === r.id}
              onClick={() => {
                setRole(r.id);
                router.push(roleHome[r.id]);
              }}
              className={cn(
                "flex h-8 cursor-pointer items-center justify-between rounded-control px-2.5 text-caption",
                role === r.id
                  ? "bg-accent-fill text-on-accent"
                  : "text-sidebar-muted hover:bg-sidebar-hover hover:text-sidebar-ink",
              )}
            >
              <span>{roleUsers[r.id].name}</span>
              <span>{r.label}</span>
            </button>
          ))}
        </div>
      </Group>

      <Group title={`Demo date: ${longDate(dayOffset)}`}>
        <div className="flex flex-col gap-2">
          <button type="button" className={control} onClick={advanceDay}>
            Advance 1 day
          </button>
          <button type="button" className={control} onClick={advanceToReminder}>
            Advance to next reminder
          </button>
        </div>
        <p className="mt-2 text-caption text-sidebar-muted">
          {lastSkip.length
            ? `Last skip: ${lastSkip.length} ${lastSkip.length === 1 ? "event" : "events"}. Next working day is ${longDate(dayOffset + nextWorkingDayGap(dayOffset))}.`
            : `Next working day is ${longDate(dayOffset + nextWorkingDayGap(dayOffset))}.`}
        </p>
      </Group>

      <Group title="AI status">
        <dl className="flex flex-col gap-1 text-caption">
          {aiRows(status, lastAiOf(lastAi)).map(([k, v]) => (
            <div key={k} className="flex justify-between gap-3">
              <dt className="flex-none text-sidebar-muted">{k}</dt>
              <dd
                className={cn(
                  "min-w-0 text-right wrap-break-word",
                  k === "Connection" && "text-accent-fill",
                )}
              >
                {v}
              </dd>
            </div>
          ))}
        </dl>
      </Group>

      <Group title="Reset">
        {confirming ? (
          <div>
            <p className="text-caption text-sidebar-ink">
              Clears every approval, task and audit entry from this session, and returns to today.
            </p>
            <div className="mt-2 grid grid-cols-2 gap-2">
              <button type="button" className={control} onClick={() => setConfirming(false)}>
                Keep going
              </button>
              <button
                type="button"
                onClick={() => {
                  resetDemo();
                  setConfirming(false);
                }}
                className="h-9 cursor-pointer rounded-control bg-accent-fill px-3 text-left text-caption text-on-accent hover:bg-accent-fill-hover"
              >
                Reset demo
              </button>
            </div>
          </div>
        ) : (
          <button
            type="button"
            className={cn(control, "w-full")}
            onClick={() => setConfirming(true)}
          >
            Reset demo
          </button>
        )}
      </Group>

      <footer className="border-t border-dashed border-sidebar-border px-4 py-2.5 text-caption text-sidebar-muted">
        Ctrl + Shift + . opens and closes this panel
      </footer>
    </aside>
  );
}
