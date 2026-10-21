"use client";

import { cn } from "@/lib/cn";

export type ChipOption<T extends string> = { id: T; label: string; count?: number };

export function FilterChips<T extends string>({
  options,
  value,
  onChange,
  label,
  countStyle = "plain",
}: {
  options: ChipOption<T>[];
  value: T;
  onChange: (value: T) => void;
  label: string;
  countStyle?: "plain" | "brackets";
}) {
  return (
    <div role="group" aria-label={label} className="flex flex-wrap gap-2">
      {options.map((option) => {
        const active = option.id === value;
        return (
          <button
            key={option.id}
            type="button"
            aria-pressed={active}
            onClick={() => onChange(option.id)}
            className={cn(
              "inline-flex h-7.5 cursor-pointer items-center gap-1.5 rounded-control border px-3 text-small font-medium transition-colors duration-160 ease-out",
              active
                ? "border-accent bg-accent-tint text-accent"
                : "border-border bg-surface text-ink-700 hover:border-border-strong",
            )}
          >
            {option.label}
            {option.count !== undefined && (
              <span className="font-medium text-ink-500">
                {countStyle === "brackets" ? `(${option.count})` : option.count}
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
}
