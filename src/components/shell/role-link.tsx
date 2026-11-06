"use client";

import Link from "next/link";
import type { ReactNode } from "react";
import type { Role } from "@/lib/navigation";
import { useDemoStore } from "@/state/demo-store";

/** A link that also switches the role view, so the sidebar matches the page it opens. */
export function RoleLink({
  role,
  href,
  children,
}: {
  role: Role;
  href: string;
  children: ReactNode;
}) {
  const setRole = useDemoStore((s) => s.setRole);
  return (
    <Link href={href} onClick={() => setRole(role)} className="font-semibold">
      {children}
    </Link>
  );
}
