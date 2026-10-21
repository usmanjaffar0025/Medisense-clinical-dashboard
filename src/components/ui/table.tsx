import type { ComponentProps, CSSProperties } from "react";
import { cn } from "@/lib/cn";

/**
 * Tables are CSS grids so header and rows share one column template.
 * Pass the template once per table and reuse it for every row.
 */
export function TableHeader({
  columns,
  className,
  ...props
}: { columns: string } & ComponentProps<"div">) {
  return (
    <div
      role="row"
      style={{ gridTemplateColumns: columns } as CSSProperties}
      className={cn(
        "grid min-h-9 items-center gap-x-3 border-b border-border bg-surface-sunken px-4 eyebrow whitespace-nowrap",
        className,
      )}
      {...props}
    />
  );
}

export function TableRow({
  columns,
  className,
  interactive = true,
  style,
  ...props
}: { columns: string; interactive?: boolean } & ComponentProps<"div">) {
  return (
    <div
      role="row"
      style={{ gridTemplateColumns: columns, ...style } as CSSProperties}
      className={cn(
        "relative grid min-h-12 items-center gap-x-3 border-b border-border px-4 text-small",
        interactive && "transition-colors duration-160 ease-out hover:bg-canvas",
        className,
      )}
      {...props}
    />
  );
}
