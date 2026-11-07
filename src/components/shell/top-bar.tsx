"use client";

import { Bell, ChevronRight, History } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";
import { PenNib } from "@/components/ai/provenance";
import { cn } from "@/lib/cn";
import { longDate } from "@/lib/clock";
import { isStandalone, routeMeta } from "@/lib/navigation";
import { useDemoStore } from "@/state/demo-store";
import { AssistantPanel } from "./assistant-panel";
import { AuditDrawer } from "./audit-drawer";
import { QuickAdd } from "./quick-add";
import { ThemeMenu } from "./theme-menu";
import { WorkspaceMenu } from "./workspace-menu";

function Notifications() {
  const role = useDemoStore((s) => s.role);
  const all = useDemoStore((s) => s.story.notices);
  const markRead = useDemoStore((s) => s.markNoticesRead);
  const notices = all.filter((n) => n.to === role);
  const unread = notices.filter((n) => !n.read).length;
  const [open, setOpen] = useState(false);
  const button = useRef<HTMLButtonElement>(null);
  const panel = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return undefined;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setOpen(false);
        button.current?.focus();
      }
    };
    const onClick = (event: MouseEvent) => {
      const target = event.target as Node;
      if (!panel.current?.contains(target) && !button.current?.contains(target)) setOpen(false);
    };
    window.addEventListener("keydown", onKey);
    window.addEventListener("mousedown", onClick);
    return () => {
      window.removeEventListener("keydown", onKey);
      window.removeEventListener("mousedown", onClick);
    };
  }, [open]);

  return (
    <div className="relative">
      <button
        ref={button}
        type="button"
        aria-expanded={open}
        aria-label={unread ? `${unread} new notifications` : "Notifications"}
        onClick={() => {
          if (!open) markRead(role);
          setOpen(!open);
        }}
        className="relative flex size-9 cursor-pointer items-center justify-center rounded-control border border-border bg-surface hover:bg-canvas"
      >
        <Bell className="size-4 text-ink-700" strokeWidth={1.5} aria-hidden="true" />
        {unread > 0 && (
          <span
            aria-hidden="true"
            className="absolute -top-1.5 -right-1.5 flex size-4.5 items-center justify-center rounded-full bg-over-dot text-eyebrow font-semibold text-surface-raised"
          >
            {unread}
          </span>
        )}
      </button>
      {open && (
        <div
          ref={panel}
          className="absolute top-11 right-0 z-30 w-80 overflow-hidden rounded-card border border-border bg-surface-raised shadow-overlay"
        >
          <h2 className="px-4 pt-3 pb-2 text-small font-semibold">Notifications</h2>
          {notices.length === 0 ? (
            <p className="border-t border-border px-4 py-4 text-small text-ink-700">
              Nothing new. Reminders and escalations will appear here.
            </p>
          ) : (
            <ul>
              {notices.map((n) => (
                <li key={n.id} className="border-t border-border">
                  <Link
                    href={n.href}
                    onClick={() => setOpen(false)}
                    className="block px-4 py-2.5 text-small text-ink-900 hover:bg-canvas hover:no-underline"
                  >
                    {n.text}
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  );
}

export function TopBar() {
  const pathname = usePathname();
  const { section, page } = routeMeta(pathname);
  const isOverview = pathname === "/";
  const dayOffset = useDemoStore((s) => s.story.dayOffset);
  const auditOpen = useDemoStore((s) => s.auditOpen);
  const setAuditOpen = useDemoStore((s) => s.setAuditOpen);
  const [assistant, setAssistant] = useState<{ open: boolean; question: string; key: number }>({
    open: false,
    question: "",
    key: 0,
  });
  const [draftQuestion, setDraftQuestion] = useState("");
  const closeAssistant = useCallback(() => setAssistant((a) => ({ ...a, open: false })), []);

  if (isStandalone(pathname)) return null;

  function openAssistant(question: string) {
    setAssistant((a) => ({ open: true, question, key: a.key + 1 }));
    setDraftQuestion("");
  }

  return (
    <>
      <header className="flex min-h-16 flex-wrap items-center justify-between gap-x-5 gap-y-3 border-b border-border bg-topbar px-4 py-3 md:px-6 xl:px-10 blue:sticky blue:top-0 blue:z-20">
        <nav
          aria-label="Breadcrumb"
          className={cn("flex min-w-0 items-center gap-2 text-small", isOverview && "blue:hidden")}
        >
          <span className="truncate text-ink-500">{section}</span>
          <ChevronRight
            className="size-3.5 flex-none text-ink-500"
            strokeWidth={1.5}
            aria-hidden="true"
          />
          <span className="truncate font-semibold text-ink-900" aria-current="page">
            {page}
          </span>
        </nav>

        <div className={cn("flex flex-wrap items-center gap-3", isOverview && "blue:flex-1")}>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              openAssistant(draftQuestion);
            }}
            className={cn(
              "hidden h-9 w-72 items-center gap-2 rounded-control border border-border bg-surface pr-1 pl-2.5 focus-within:shadow-focus lg:flex",
              isOverview && "blue:mr-auto blue:w-[420px]",
            )}
          >
            <PenNib className="text-brass" />
            <input
              type="text"
              value={draftQuestion}
              onChange={(e) => setDraftQuestion(e.target.value)}
              aria-label="Ask Medisense AI"
              placeholder="Ask Medisense AI…"
              className="min-w-0 flex-1 border-0 bg-transparent text-small text-ink-900 outline-none placeholder:text-ink-500 focus-visible:shadow-none"
            />
            <button
              type="submit"
              className="h-7 cursor-pointer rounded-tag bg-accent-fill px-2 text-caption font-semibold text-on-accent hover:bg-accent-fill-hover"
            >
              Ask
            </button>
          </form>

          <QuickAdd />

          <Notifications />

          <button
            type="button"
            aria-label="Open audit trail"
            onClick={() => setAuditOpen(true)}
            className="flex size-9 cursor-pointer items-center justify-center rounded-control border border-border bg-surface hover:bg-canvas"
          >
            <History className="size-4 text-ink-700" strokeWidth={1.5} aria-hidden="true" />
          </button>

          <ThemeMenu />

          <span className="hidden text-small whitespace-nowrap text-ink-700 lg:inline blue:hidden!">
            {longDate(dayOffset)}
          </span>

          <WorkspaceMenu />
        </div>
      </header>

      <AuditDrawer open={auditOpen} onClose={() => setAuditOpen(false)} />
      {assistant.open && (
        <AssistantPanel
          key={assistant.key}
          initialQuestion={assistant.question}
          onClose={closeAssistant}
        />
      )}
    </>
  );
}
