import type { ReactNode } from "react";
import { cn } from "@/lib/cn";

export function PageContainer({ children }: { children: ReactNode }) {
  return <main className="mx-auto w-full max-w-content px-10 pt-8 pb-18">{children}</main>;
}

export function PageHeader({
  eyebrow,
  title,
  description,
  actions,
  leading,
  display = false,
  align = "end",
}: {
  eyebrow: ReactNode;
  title: ReactNode;
  description?: ReactNode;
  actions?: ReactNode;
  leading?: ReactNode;
  display?: boolean;
  align?: "end" | "center";
}) {
  return (
    <header
      className={cn(
        "mb-8 flex flex-wrap justify-between gap-4 border-b border-border pb-6",
        align === "end" ? "items-end" : "items-center",
      )}
    >
      <div className="flex items-center gap-4">
        {leading}
        <div>
          <p className="eyebrow">{eyebrow}</p>
          <h1 className={cn("headline", display ? "mt-2 text-display" : "mt-2 text-h1")}>
            {title}
          </h1>
          {description && (
            <p className={cn("mt-1 text-ink-700", display ? "mt-1.5 text-body" : "text-small")}>
              {description}
            </p>
          )}
        </div>
      </div>
      {actions && <div className="flex flex-wrap items-center gap-2">{actions}</div>}
    </header>
  );
}
