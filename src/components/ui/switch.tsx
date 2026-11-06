"use client";

import { cn } from "@/lib/cn";

export function Switch({
  on,
  label,
  onToggle,
  disabled = false,
}: {
  on: boolean;
  label: string;
  onToggle: () => void;
  disabled?: boolean;
}) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={on}
      aria-label={label}
      disabled={disabled}
      onClick={onToggle}
      className={cn(
        "relative h-5.5 w-10 flex-none cursor-pointer rounded-full transition-colors duration-160 disabled:cursor-not-allowed disabled:opacity-60",
        on ? "bg-accent-fill" : "bg-border-strong",
      )}
    >
      <span
        aria-hidden="true"
        className={cn(
          "absolute top-0.75 size-4 rounded-full bg-surface-raised shadow-hairline transition-all duration-160",
          on ? "left-5.25" : "left-0.75",
        )}
      />
    </button>
  );
}
