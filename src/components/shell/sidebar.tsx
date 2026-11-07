"use client";

import { HeartPulse } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import type { CSSProperties } from "react";
import { caseNotes } from "@/data/case-note";
import { cn } from "@/lib/cn";
import { isActive, isStandalone, navigationFor, roleUsers } from "@/lib/navigation";
import { useDemoStore } from "@/state/demo-store";

export const darkFocus = { "--shadow-focus": "var(--shadow-focus-dark)" } as CSSProperties;

/** Labelled sidebar from 1280 px, an icon rail down to 768 px, and a tab bar below that. */
export function Sidebar() {
  const pathname = usePathname();
  const role = useDemoStore((s) => s.role);
  const user = roleUsers[role];
  const notes = useDemoStore((s) => s.caseNotes);
  const notesLeft = caseNotes.filter((c) => notes[c.id]?.mode !== "approved").length;

  if (isStandalone(pathname)) return null;

  return (
    <nav
      aria-label="Primary"
      style={darkFocus}
      className="sticky top-0 hidden h-screen w-16 flex-none flex-col gap-5 overflow-y-auto border-r border-sidebar-border bg-sidebar px-2 pt-5 pb-4 md:flex xl:w-sidebar xl:px-3"
    >
      <Link
        href="/"
        aria-label="Medisense home"
        className="flex flex-col px-1 pt-1 text-center text-sidebar-ink hover:text-sidebar-ink hover:no-underline xl:px-3 xl:text-left"
      >
        <span aria-hidden="true" className="headline text-h2 leading-6 xl:hidden">
          M
        </span>
        <span className="hidden items-center gap-2 headline text-h2 leading-6 xl:flex">
          <span
            aria-hidden="true"
            className="primary-glow hidden size-8 flex-none items-center justify-center rounded-control bg-accent-fill text-on-accent blue:flex"
          >
            <HeartPulse className="size-5" strokeWidth={2} />
          </span>
          Medisense
        </span>
        <span className="mt-0.5 hidden text-caption font-medium text-sidebar-muted xl:block">
          Clinical Operations &amp; Supervision
        </span>
      </Link>

      {navigationFor(role).map(({ group, items }) => (
        <div key={group} className="flex flex-col gap-0.5">
          <div className="hidden px-3 pb-1.5 text-caption font-medium text-sidebar-faint xl:block">
            {group}
          </div>
          {items.map(({ href, label, icon: Icon, badge }) => {
            const active = isActive(pathname, href);
            return (
              <Link
                key={href}
                href={href}
                title={label}
                aria-label={label}
                aria-current={active ? "page" : undefined}
                className={cn(
                  "flex h-9 items-center justify-center gap-2.5 rounded-nav px-3 text-body hover:no-underline xl:justify-start",
                  active
                    ? "bg-nav-active nav-active-rule font-semibold text-nav-active-ink"
                    : "font-medium text-sidebar-muted hover:bg-sidebar-hover hover:text-sidebar-ink",
                )}
              >
                <Icon
                  className={cn(
                    "size-5 flex-none",
                    active ? "text-nav-active-ink" : "text-sidebar-faint",
                  )}
                  strokeWidth={1.5}
                  aria-hidden="true"
                />
                <span className="hidden flex-1 truncate xl:block">{label}</span>
                {badge !== undefined && (
                  <span
                    className={cn(
                      "hidden text-caption font-medium xl:inline",
                      active ? "text-nav-active-ink" : "text-sidebar-faint",
                    )}
                  >
                    {href.startsWith("/case-notes") ? notesLeft : badge}
                  </span>
                )}
              </Link>
            );
          })}
        </div>
      ))}

      <div className="mt-auto flex items-center justify-center gap-2.5 border-t border-sidebar-border px-1 pt-4 xl:justify-start xl:px-3 md:blue:hidden">
        <span
          aria-hidden="true"
          className="flex size-8 flex-none items-center justify-center rounded-full bg-accent-fill text-caption font-semibold text-on-accent"
        >
          {user.initials}
        </span>
        <span className="hidden min-w-0 flex-col xl:flex">
          <span className="text-small font-semibold text-sidebar-ink">{user.name}</span>
          <span className="text-caption font-medium text-sidebar-muted">{user.title}</span>
        </span>
      </div>
    </nav>
  );
}
