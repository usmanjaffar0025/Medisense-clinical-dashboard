"use client";

import { ChevronsUpDown } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { currentUser, organisation } from "@/data/organisation";
import { cn } from "@/lib/cn";
import { isActive, navigation } from "@/lib/navigation";

export function Sidebar() {
  const pathname = usePathname();

  return (
    <nav
      aria-label="Primary"
      className="sticky top-0 flex h-screen w-sidebar flex-none flex-col gap-5 overflow-y-auto border-r border-border bg-sidebar px-3 pt-5 pb-4"
    >
      <Link href="/" className="flex flex-col px-3 pt-1 text-ink-900 hover:no-underline">
        <span className="headline text-h2 leading-6">Medisense</span>
        <span className="mt-0.5 text-caption font-medium text-ink-500">Clinical Operations</span>
      </Link>

      <button
        type="button"
        aria-label="Switch organisation"
        className="flex w-full cursor-pointer items-center justify-between gap-2 rounded-control border border-border bg-surface py-2 pr-2.5 pl-3 text-left"
      >
        <span className="flex min-w-0 flex-col">
          <span className="text-small font-semibold">{organisation.name}</span>
          <span className="text-caption font-medium text-ink-500">{organisation.location}</span>
        </span>
        <ChevronsUpDown
          className="size-4 flex-none text-ink-500"
          strokeWidth={1.5}
          aria-hidden="true"
        />
      </button>

      {navigation.map(({ group, items }) => (
        <div key={group} className="flex flex-col gap-0.5">
          <div className="px-3 pb-1.5 eyebrow">{group}</div>
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
                    ? "bg-accent-tint font-semibold text-accent shadow-rule-accent"
                    : "font-medium text-ink-700 hover:bg-canvas hover:text-ink-900",
                )}
              >
                <Icon
                  className={cn("size-5 flex-none", active ? "text-accent" : "text-ink-500")}
                  strokeWidth={1.5}
                  aria-hidden="true"
                />
                <span className="flex-1 truncate">{label}</span>
                {badge !== undefined && (
                  <span className="text-caption font-medium text-ink-500">{badge}</span>
                )}
              </Link>
            );
          })}
        </div>
      ))}

      <div className="mt-auto flex flex-col gap-3 border-t border-border px-3 pt-4">
        <div className="flex items-center gap-2.5">
          <span
            aria-hidden="true"
            className="flex size-8 flex-none items-center justify-center rounded-full bg-chart-sand text-caption font-semibold text-ink-900"
          >
            {currentUser.initials}
          </span>
          <span className="flex min-w-0 flex-col">
            <span className="text-small font-semibold">{currentUser.name}</span>
            <span className="text-caption font-medium text-ink-500">{currentUser.role}</span>
          </span>
        </div>
        <div className="text-eyebrow font-medium text-ink-500">
          Demo environment · synthetic data
        </div>
      </div>
    </nav>
  );
}
