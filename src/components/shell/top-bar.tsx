"use client";

import { ChevronRight, History } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useCallback, useState } from "react";
import { PenNib } from "@/components/ai/provenance";
import { organisation } from "@/data/organisation";
import { cn } from "@/lib/cn";
import { roleHome, routeMeta, type Role } from "@/lib/navigation";
import { useDemoStore } from "@/state/demo-store";
import { AssistantPanel } from "./assistant-panel";
import { AuditDrawer } from "./audit-drawer";

const roles: Role[] = ["Leadership", "Admin", "Supervisor", "Clinician"];

export function TopBar() {
  const pathname = usePathname();
  const { section, page } = routeMeta(pathname);
  const role = useDemoStore((s) => s.role);
  const setRole = useDemoStore((s) => s.setRole);
  const [auditOpen, setAuditOpen] = useState(false);
  const [assistant, setAssistant] = useState<{ open: boolean; question: string; key: number }>({
    open: false,
    question: "",
    key: 0,
  });
  const [draftQuestion, setDraftQuestion] = useState("");
  const closeAssistant = useCallback(() => setAssistant((a) => ({ ...a, open: false })), []);

  function openAssistant(question: string) {
    setAssistant((a) => ({ open: true, question, key: a.key + 1 }));
    setDraftQuestion("");
  }

  return (
    <>
      <header className="flex min-h-16 flex-wrap items-center justify-between gap-x-5 gap-y-3 border-b border-border bg-canvas px-10 py-3">
        <nav aria-label="Breadcrumb" className="flex items-center gap-2 text-small">
          <span className="text-ink-500">{section}</span>
          <ChevronRight className="size-3.5 text-ink-400" strokeWidth={1.5} aria-hidden="true" />
          <span className="font-semibold text-ink-900" aria-current="page">
            {page}
          </span>
        </nav>

        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-2">
            <span className="text-caption font-medium text-ink-500">Role view</span>
            <div
              role="group"
              aria-label="Role view"
              className="flex gap-0.5 rounded-control border border-border bg-surface-sunken p-0.5"
            >
              {roles.map((r) => (
                <Link
                  key={r}
                  href={roleHome[r]}
                  onClick={() => setRole(r)}
                  aria-current={r === role ? "page" : undefined}
                  className={cn(
                    "flex h-7 items-center rounded-tag px-2.5 text-small hover:no-underline",
                    r === role
                      ? "bg-surface-raised font-semibold text-ink-900 shadow-hairline"
                      : "font-medium text-ink-700 hover:text-ink-900",
                  )}
                >
                  {r}
                </Link>
              ))}
            </div>
          </div>

          <form
            onSubmit={(e) => {
              e.preventDefault();
              openAssistant(draftQuestion);
            }}
            className="flex h-9 w-72 items-center gap-2 rounded-control border border-border bg-surface pr-1 pl-2.5 focus-within:shadow-focus"
          >
            <PenNib className="text-brass" />
            <input
              type="text"
              value={draftQuestion}
              onChange={(e) => setDraftQuestion(e.target.value)}
              aria-label="Ask Medisense"
              placeholder="Ask Medisense…"
              className="min-w-0 flex-1 border-0 bg-transparent text-small text-ink-900 outline-none placeholder:text-ink-400 focus-visible:shadow-none"
            />
            <button
              type="submit"
              className="h-7 cursor-pointer rounded-tag bg-accent-fill px-2 text-caption font-semibold text-on-accent hover:bg-accent-fill-hover"
            >
              Ask
            </button>
          </form>

          <button
            type="button"
            aria-label="Open audit trail"
            onClick={() => setAuditOpen(true)}
            className="flex size-9 cursor-pointer items-center justify-center rounded-control border border-border bg-surface hover:bg-canvas"
          >
            <History className="size-4 text-ink-700" strokeWidth={1.5} aria-hidden="true" />
          </button>

          <span className="text-small whitespace-nowrap text-ink-700">{organisation.today}</span>
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
