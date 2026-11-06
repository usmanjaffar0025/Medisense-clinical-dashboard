"use client";

import { ChevronsUpDown } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { organisation } from "@/data/organisation";
import { cn } from "@/lib/cn";
import { isActive, navigationFor, roleUsers } from "@/lib/navigation";
import { useDemoStore } from "@/state/demo-store";

export function Sidebar() {
  const pathname = usePathname();
  const role = useDemoStore((s) => s.role);
  const user = roleUsers[role];

  return (
    <nav
      aria-label="Primary"
      className="sticky top-0 flex h-screen w-sidebar flex-none flex-col gap-5 overflow-y-auto border-r border-sidebar-border bg-sidebar px-3 pt-5 pb-4"
    >
      <Link
        href="/"
        className="flex flex-col px-3 pt-1 text-sidebar-ink hover:text-sidebar-ink hover:no-underline"
      >
        <span className="headline text-h2 leading-6">Medisense</span>
        <span className="mt-0.5 text-caption font-medium text-sidebar-muted">
          Clinical Operations &amp; Supervision
        </span>
      </Link>

      <button
        type="button"
        aria-label="Switch organisation"
        className="flex w-full cursor-pointer items-center justify-between gap-2 rounded-control border border-sidebar-border bg-sidebar-hover py-2 pr-2.5 pl-3 text-left text-sidebar-ink hover:border-sidebar-faint"
      >
        <span className="flex min-w-0 flex-col">
          <span className="text-small font-semibold">{organisation.name}</span>
          <span className="text-caption font-medium text-sidebar-muted">
            {organisation.location}
          </span>
        </span>
        <ChevronsUpDown
          className="size-4 flex-none text-sidebar-muted"
          strokeWidth={1.5}
          aria-hidden="true"
        />
      </button>

      {navigationFor(role).map(({ group, items }) => (
        <div key={group} className="flex flex-col gap-0.5">
          <div className="px-3 pb-1.5 eyebrow text-sidebar-faint">{group}</div>
          {items.map(({ href, label, icon: Icon, badge }) => {
            const active = isActive(pathname, href);
            return (
              <Link
                key={href}
                href={href}
                aria-current={active ? "page" : undefined}
                className={cn(
                  "flex h-9 items-center gap-2.5 rounded-r-control px-3 text-body hover:no-underline",
                  active
                    ? "bg-sidebar-hover font-semibold text-accent-fill shadow-rule-accent"
                    : "font-medium text-sidebar-muted hover:bg-sidebar-hover hover:text-sidebar-ink",
                )}
              >
                <Icon
                  className={cn(
                    "size-5 flex-none",
                    active ? "text-accent-fill" : "text-sidebar-faint",
                  )}
                  strokeWidth={1.5}
                  aria-hidden="true"
                />
                <span className="flex-1 truncate">{label}</span>
                {badge !== undefined && (
                  <span className="text-caption font-medium text-sidebar-faint">{badge}</span>
                )}
              </Link>
            );
          })}
        </div>
      ))}

      <div className="mt-auto flex flex-col gap-3 border-t border-sidebar-border px-3 pt-4">
        <div className="flex items-center gap-2.5">
          <span
            aria-hidden="true"
            className="flex size-8 flex-none items-center justify-center rounded-full bg-accent-fill text-caption font-semibold text-on-accent"
          >
            {user.initials}
          </span>
          <span className="flex min-w-0 flex-col">
            <span className="text-small font-semibold text-sidebar-ink">{user.name}</span>
            <span className="text-caption font-medium text-sidebar-muted">{user.title}</span>
          </span>
        </div>
        {/* <div className="text-eyebrow font-medium text-sidebar-faint">
          {role} view · demo environment · synthetic data
        </div> */}
      </div>
    </nav>
  );
}
