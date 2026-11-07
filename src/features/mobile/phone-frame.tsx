"use client";

import { ArrowLeft, X, type LucideIcon } from "lucide-react";
import type { ReactNode } from "react";
import { ButtonLink } from "@/components/ui/button";
import { cn } from "@/lib/cn";

/** Full-screen on a phone. On a larger screen, a device beside a short description of the app. */
export function PhoneFrame({
  name,
  description,
  features,
  tabs,
  active,
  onTab,
  overlay,
  children,
}: {
  name: string;
  description: string;
  features: string[];
  tabs: { id: string; label: string; icon: LucideIcon }[];
  active: string;
  onTab: (id: string) => void;
  overlay?: ReactNode;
  children: ReactNode;
}) {
  return (
    <div className="hero-page flex min-h-dvh items-center justify-center gap-16 bg-canvas md:py-8 lg:px-10">
      <div className="fixed top-4 left-4 z-10 hidden md:block">
        <ButtonLink href="/">
          <ArrowLeft className="size-4" strokeWidth={1.5} aria-hidden="true" />
          Back to Medisense
        </ButtonLink>
      </div>

      <div className="hidden max-w-92 lg:block">
        <h1 className="headline text-[44px] leading-13 blue:text-white">{name}</h1>
        <p className="mt-3 text-body text-ink-700 blue:text-white/85">{description}</p>
        <ul className="mt-6 flex flex-col gap-2.5 text-small text-ink-700 blue:text-white/85">
          {features.map((f) => (
            <li key={f} className="flex gap-2.5">
              <span
                aria-hidden="true"
                className="mt-2 size-1.5 flex-none rounded-full bg-accent-fill blue:bg-white"
              />
              {f}
            </li>
          ))}
        </ul>
      </div>

      <div className="relative flex h-dvh w-full flex-col overflow-hidden bg-canvas md:h-211 md:max-h-[calc(100dvh-4rem)] md:w-103 md:rounded-[44px] md:border-10 md:border-ink-900 md:shadow-overlay">
        <span
          aria-hidden="true"
          className="absolute top-2.5 left-1/2 z-20 hidden h-6 w-24 -translate-x-1/2 rounded-full bg-ink-900 md:block"
        />
        <div className="min-h-0 flex-1 overflow-y-auto pb-24">{children}</div>
        <nav
          aria-label="App sections"
          className="absolute inset-x-3 bottom-3 z-10 flex rounded-full border border-border bg-surface/95 p-1.5 shadow-overlay backdrop-blur"
        >
          {tabs.map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              type="button"
              aria-current={active === id ? "page" : undefined}
              onClick={() => onTab(id)}
              className={cn(
                "flex h-13 min-w-0 flex-1 cursor-pointer flex-col items-center justify-center gap-0.5 rounded-full text-[10.5px] font-semibold",
                active === id ? "primary-glow bg-accent-fill text-on-accent" : "text-ink-500",
              )}
            >
              <Icon className="size-5 flex-none" strokeWidth={1.75} aria-hidden="true" />
              <span className="max-w-full truncate">{label}</span>
            </button>
          ))}
        </nav>
        {overlay}
      </div>
    </div>
  );
}

/** The gradient heading at the top of a phone screen. */
export function AppHeader({
  eyebrow,
  title,
  aside,
  children,
}: {
  eyebrow?: string;
  title: string;
  aside?: ReactNode;
  children?: ReactNode;
}) {
  return (
    <header className="page-hero rounded-t-none! pt-12!">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          {eyebrow && <p className="text-caption font-medium text-ink-700">{eyebrow}</p>}
          <h2 className="mt-0.5 headline text-[28px] leading-8.5">{title}</h2>
        </div>
        {aside}
      </div>
      {children}
    </header>
  );
}

export function AppCard({
  title,
  action,
  children,
  className,
}: {
  title?: string;
  action?: ReactNode;
  children: ReactNode;
  className?: string;
}) {
  return (
    <section
      className={cn(
        "mb-3 rounded-card border border-border bg-surface p-4 surface-lift",
        className,
      )}
    >
      {(title || action) && (
        <div className="mb-2.5 flex items-center justify-between gap-2">
          {title && <h3 className="headline text-section">{title}</h3>}
          {action}
        </div>
      )}
      {children}
    </section>
  );
}

/** A panel that rises from the bottom, inside the phone. */
export function AppSheet({
  title,
  onClose,
  children,
  footer,
}: {
  title: string;
  onClose: () => void;
  children: ReactNode;
  footer?: ReactNode;
}) {
  return (
    <div className="absolute inset-0 z-30 flex flex-col justify-end">
      <button
        type="button"
        aria-label="Close"
        tabIndex={-1}
        onClick={onClose}
        className="absolute inset-0 cursor-default bg-ink-900/40"
      />
      <div
        role="dialog"
        aria-modal="true"
        aria-label={title}
        className="relative flex max-h-[88%] flex-col rounded-t-[28px] bg-surface-raised"
      >
        <header className="flex items-center justify-between gap-3 px-5 pt-5 pb-3">
          <h3 className="headline text-h2">{title}</h3>
          <button
            type="button"
            onClick={onClose}
            aria-label={`Close ${title}`}
            className="flex size-8 cursor-pointer items-center justify-center rounded-full bg-canvas text-ink-700"
          >
            <X className="size-4" strokeWidth={1.75} aria-hidden="true" />
          </button>
        </header>
        <div className="min-h-0 flex-1 overflow-y-auto px-5 pb-4">{children}</div>
        {footer && (
          <footer className="flex gap-2 border-t border-border px-5 py-3">{footer}</footer>
        )}
      </div>
    </div>
  );
}
