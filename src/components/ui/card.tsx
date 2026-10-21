import type { ComponentProps, ReactNode } from "react";
import { cn } from "@/lib/cn";

export function Card({ className, ...props }: ComponentProps<"section">) {
  return (
    <section className={cn("rounded-card border border-border bg-surface", className)} {...props} />
  );
}

export function CardTitle({
  id,
  title,
  description,
  aside,
  className,
}: {
  id: string;
  title: ReactNode;
  description?: ReactNode;
  aside?: ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("flex flex-wrap items-start justify-between gap-3", className)}>
      <div>
        <h2 id={id} className="headline text-h2">
          {title}
        </h2>
        {description && <p className="mt-1 text-caption font-medium text-ink-500">{description}</p>}
      </div>
      {aside}
    </div>
  );
}

export function Caption({ className, ...props }: ComponentProps<"p">) {
  return <p className={cn("text-caption font-medium text-ink-500", className)} {...props} />;
}
