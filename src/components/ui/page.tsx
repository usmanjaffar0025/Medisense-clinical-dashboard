import type { ReactNode } from "react";
import { cn } from "@/lib/cn";

export function PageContainer({ children }: { children: ReactNode }) {
  return <main className="w-full px-4 pt-6 pb-18 md:px-6 md:pt-8 xl:px-10">{children}</main>;
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
        "page-hero mb-8 flex flex-wrap justify-between gap-4 border-b border-border pb-6",
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

/** A page title without an eyebrow, for screens built around one clear focal point. */
export function ScreenTitle({
  title,
  description,
  actions,
  display = false,
}: {
  title: ReactNode;
  description?: ReactNode;
  actions?: ReactNode;
  display?: boolean;
}) {
  return (
    <header className="page-hero mb-8 flex flex-wrap items-end justify-between gap-4">
      <div className="max-w-180">
        <h1 className={cn("headline", display ? "text-display" : "text-h1")}>{title}</h1>
        {description && <div className="mt-1.5 text-body text-ink-700">{description}</div>}
      </div>
      {actions && <div className="flex flex-wrap items-center gap-2">{actions}</div>}
    </header>
  );
}
