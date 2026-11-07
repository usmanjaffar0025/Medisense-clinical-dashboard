"use client";

import { Menu } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { Sheet } from "@/components/ui/sheet";
import { cn } from "@/lib/cn";
import { isActive, isStandalone, navigationFor } from "@/lib/navigation";
import { useDemoStore } from "@/state/demo-store";
import { darkFocus } from "./sidebar";

/** Replaces the sidebar below 768 px. More opens every screen, so nothing is out of reach. */
export function TabBar() {
  const pathname = usePathname();
  const role = useDemoStore((s) => s.role);
  const [more, setMore] = useState(false);
  const groups = navigationFor(role);
  const items = groups.flatMap((g) => g.items).slice(0, 4);

  if (isStandalone(pathname)) return null;

  return (
    <>
      <nav
        aria-label="Primary, phone"
        style={darkFocus}
        className="sticky bottom-0 z-20 grid h-16 flex-none grid-cols-5 border-t border-sidebar-border bg-sidebar md:hidden"
      >
        {items.map(({ href, label, icon: Icon }) => {
          const active = isActive(pathname, href);
          return (
            <Link
              key={href}
              href={href}
              aria-current={active ? "page" : undefined}
              className={cn(
                "flex min-w-0 flex-col items-center justify-center gap-1 px-1 text-caption font-medium hover:no-underline",
                active ? "text-accent" : "text-sidebar-muted",
              )}
            >
              <Icon className="size-5 flex-none" strokeWidth={1.5} aria-hidden="true" />
              <span className="max-w-full truncate">{label}</span>
            </Link>
          );
        })}
        <button
          type="button"
          onClick={() => setMore(true)}
          className="flex min-w-0 cursor-pointer flex-col items-center justify-center gap-1 px-1 text-caption font-medium text-sidebar-muted"
        >
          <Menu className="size-5 flex-none" strokeWidth={1.5} aria-hidden="true" />
          More
        </button>
      </nav>
      {more && (
        <Sheet title="All screens" onClose={() => setMore(false)}>
          <nav aria-label="All screens" className="flex flex-col gap-4">
            {groups.map(({ group, items: links }) => (
              <div key={group}>
                <h3 className="mb-1 text-caption font-semibold text-ink-500">{group}</h3>
                {links.map(({ href, label, icon: Icon }) => (
                  <Link
                    key={href}
                    href={href}
                    onClick={() => setMore(false)}
                    aria-current={isActive(pathname, href) ? "page" : undefined}
                    className="flex h-11 items-center gap-3 rounded-control px-2 text-body font-medium text-ink-900 hover:bg-canvas hover:no-underline aria-[current=page]:bg-accent-tint aria-[current=page]:text-accent"
                  >
                    <Icon className="size-5 flex-none" strokeWidth={1.5} aria-hidden="true" />
                    {label}
                  </Link>
                ))}
              </div>
            ))}
          </nav>
        </Sheet>
      )}
    </>
  );
}
