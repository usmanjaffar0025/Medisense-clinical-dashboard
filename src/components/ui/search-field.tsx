import { Search } from "lucide-react";
import type { ComponentProps } from "react";
import { cn } from "@/lib/cn";

export function SearchField({
  label,
  className,
  ...props
}: { label: string } & Omit<ComponentProps<"input">, "type">) {
  return (
    <label
      className={cn(
        "flex h-8 w-60 items-center gap-2 rounded-control border border-border bg-surface px-2.5 focus-within:shadow-focus",
        className,
      )}
    >
      <Search className="size-4 flex-none text-ink-500" strokeWidth={1.5} aria-hidden="true" />
      <input
        type="search"
        aria-label={label}
        className="min-w-0 flex-1 border-0 bg-transparent text-small text-ink-900 outline-none placeholder:text-ink-400 focus-visible:shadow-none"
        {...props}
      />
    </label>
  );
}
