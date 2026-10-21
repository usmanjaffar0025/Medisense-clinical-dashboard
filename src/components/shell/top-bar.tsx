"use client";

import { ChevronRight, History, Search } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { organisation } from "@/data/organisation";
import { cn } from "@/lib/cn";
import { roleHome, routeMeta, type Role } from "@/lib/navigation";
import { AuditDrawer } from "./audit-drawer";

const roles: Role[] = ["Leadership", "Supervisor", "Clinician"];

export function TopBar() {
  const pathname = usePathname();
  const { section, page, role } = routeMeta(pathname);
  const [auditOpen, setAuditOpen] = useState(false);

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

          <label className="flex h-9 w-59 cursor-text items-center gap-2 rounded-control border border-border bg-surface pr-2 pl-2.5 focus-within:shadow-focus">
            <Search
              className="size-4 flex-none text-ink-500"
              strokeWidth={1.5}
              aria-hidden="true"
            />
            <input
              type="search"
              aria-label="Search clients and clinicians"
              placeholder="Search clients, clinicians"
              className="min-w-0 flex-1 border-0 bg-transparent text-small text-ink-900 outline-none placeholder:text-ink-400 focus-visible:shadow-none"
            />
            <kbd className="rounded-tag border border-border bg-canvas px-1.25 py-px font-sans text-eyebrow font-semibold text-ink-500">
              ⌘K
            </kbd>
          </label>

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
    </>
  );
}
