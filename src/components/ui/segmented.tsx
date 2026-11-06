"use client";

import type { ReactNode } from "react";
import { cn } from "@/lib/cn";

export type SegmentOption<T extends string> = { id: T; label: string };

export function Segmented<T extends string>({
  options,
  value,
  onChange,
  label,
}: {
  options: SegmentOption<T>[];
  value: T;
  onChange: (value: T) => void;
  label: string;
}) {
  return (
    <div
      role="group"
      aria-label={label}
      className="flex gap-0.5 rounded-control border border-border bg-surface-sunken p-0.5"
    >
      {options.map((o) => (
        <button
          key={o.id}
          type="button"
          aria-pressed={value === o.id}
          onClick={() => onChange(o.id)}
          className={cn(
            "h-7 cursor-pointer rounded-tag px-2.5 text-small whitespace-nowrap",
            value === o.id
              ? "bg-surface-raised font-semibold text-ink-900 shadow-hairline"
              : "font-medium text-ink-700 hover:text-ink-900",
          )}
        >
          {o.label}
        </button>
      ))}
    </div>
  );
}

export function SelectField({
  label,
  value,
  onChange,
  children,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  children: ReactNode;
}) {
  return (
    <label className="flex items-center gap-2">
      <span className="text-caption font-medium text-ink-500">{label}</span>
      <select
        aria-label={label}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="h-8 cursor-pointer rounded-control border border-border bg-surface pr-7 pl-2.5 text-small text-ink-700"
      >
        {children}
      </select>
    </label>
  );
}

/** One row of filters above the content they scope. */
export function FilterBar({ children, aside }: { children: ReactNode; aside?: ReactNode }) {
  return (
    <div className="mb-6 flex flex-wrap items-center justify-between gap-3 rounded-card border border-border bg-surface px-4 py-2.5">
      <div className="flex flex-wrap items-center gap-x-5 gap-y-2">{children}</div>
      {aside && <div className="text-caption font-medium text-ink-500">{aside}</div>}
    </div>
  );
}

export function FilterField({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="flex items-center gap-2">
      <span className="text-caption font-medium text-ink-500">{label}</span>
      {children}
    </div>
  );
}
