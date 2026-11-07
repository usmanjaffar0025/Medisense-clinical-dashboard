"use client";

import { X } from "lucide-react";
import { useEffect, useState } from "react";
import { cn } from "@/lib/cn";
import { PreviewBar, usePreviewState } from "../_components/preview-bar";
import { darkSurfaceFocus } from "../_components/proposed-tokens";
import { ScreenTitle, Shell } from "../_components/shell";

type State = "live" | "fallback" | "reset" | "closed";

const roles = [
  { id: "neil", name: "Neil Hensley", role: "Leadership" },
  { id: "sarah", name: "Sarah Thompson", role: "Therapist" },
  { id: "jo", name: "Jo Marsh", role: "Admin" },
  { id: "grace", name: "Grace Liu", role: "Supervisor" },
];

const control =
  "h-9 cursor-pointer rounded-control border border-dashed border-sidebar-faint px-3 text-left text-caption text-sidebar-ink hover:border-accent-fill hover:text-accent-fill";

function Group({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="border-t border-dashed border-sidebar-border px-4 py-3.5">
      <h3 className="mb-2 text-caption text-accent-fill">{title}</h3>
      {children}
    </section>
  );
}

function Panel({
  state,
  setState,
  onClose,
}: {
  state: State;
  setState: (s: State) => void;
  onClose: () => void;
}) {
  const [role, setRole] = useState("neil");
  const [day, setDay] = useState("Tue 20 Oct");
  const fallback = state === "fallback";

  return (
    <aside
      role="dialog"
      aria-modal="false"
      aria-label="Presenter panel"
      style={darkSurfaceFocus}
      className="absolute top-4 right-4 z-20 w-88 overflow-hidden rounded-sheet border border-dashed border-accent-fill bg-sidebar font-mono text-sidebar-ink shadow-overlay"
    >
      <header className="flex items-center justify-between gap-3 px-4 py-3">
        <div>
          <h2 className="text-small font-medium">Presenter panel</h2>
          <p className="text-caption text-sidebar-muted">Not part of the product.</p>
        </div>
        <button
          type="button"
          onClick={onClose}
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
              onClick={() => setRole(r.id)}
              className={cn(
                "flex h-8 cursor-pointer items-center justify-between rounded-control px-2.5 text-caption",
                role === r.id
                  ? "bg-accent-fill text-on-accent"
                  : "text-sidebar-muted hover:bg-sidebar-hover hover:text-sidebar-ink",
              )}
            >
              <span>{r.name}</span>
              <span>{r.role}</span>
            </button>
          ))}
        </div>
      </Group>

      <Group title={`Demo date: ${day}`}>
        <div className="flex flex-col gap-2">
          <button type="button" className={control} onClick={() => setDay("Wed 21 Oct")}>
            Advance 1 day
          </button>
          <button type="button" className={control} onClick={() => setDay("Wed 21 Oct")}>
            Advance to next reminder
          </button>
        </div>
        <p className="mt-2 text-caption text-sidebar-muted">
          Next reminder: Wed 21 Oct, 8:00 am, report upload.
        </p>
      </Group>

      <Group title="AI status">
        <dl className="flex flex-col gap-1 text-caption">
          {[
            ["Provider", fallback ? "None connected" : "Claude"],
            ["Model", fallback ? "Not in use" : "claude-opus-5-5"],
            ["Drafts", fallback ? "Prepared fallback" : "Live"],
            ["Last call", fallback ? "Key missing" : "Note draft, 4.2 s"],
          ].map(([k, v]) => (
            <div key={k} className="flex justify-between gap-3">
              <dt className="text-sidebar-muted">{k}</dt>
              <dd className={cn(k === "Drafts" && "text-accent-fill")}>{v}</dd>
            </div>
          ))}
        </dl>
      </Group>

      <Group title="Reset">
        {state === "reset" ? (
          <div>
            <p className="text-caption text-sidebar-ink">
              Clears every approval, task and audit entry from this session, and returns to Tue 20
              Oct.
            </p>
            <div className="mt-2 grid grid-cols-2 gap-2">
              <button type="button" className={control} onClick={() => setState("live")}>
                Keep going
              </button>
              <button
                type="button"
                onClick={() => setState("live")}
                className="h-9 cursor-pointer rounded-control bg-accent-fill px-3 text-left text-caption text-on-accent hover:bg-accent-fill-hover"
              >
                Reset demo
              </button>
            </div>
          </div>
        ) : (
          <button type="button" className={cn(control, "w-full")} onClick={() => setState("reset")}>
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

export function PresenterView() {
  const [state, setState] = usePreviewState<State>("live");
  const closed = state === "closed";

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (event.ctrlKey && event.shiftKey && (event.key === "." || event.key === ">")) {
        event.preventDefault();
        setState(closed ? "live" : "closed");
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [closed, setState]);

  return (
    <>
      <PreviewBar href="/design-preview/presenter" />
      <div className="relative flex min-h-0 flex-1">
        <Shell persona="neil" active="Overview" section="Organisation" page="Overview">
          <ScreenTitle
            display
            title="Good morning, Neil."
            description="12 clinicians and 184 active clients. One clinician is above configured capacity."
          />
          <p className="max-w-140 border border-dashed border-border-strong px-3 py-2 font-mono text-caption text-ink-700">
            For review: the product page sits here unchanged. Press Ctrl + Shift + . to open and
            close the panel. Nothing in the product hints that it exists.
          </p>
        </Shell>
        {!closed && <Panel state={state} setState={setState} onClose={() => setState("closed")} />}
      </div>
    </>
  );
}
