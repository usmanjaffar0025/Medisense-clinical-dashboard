"use client";

import { X } from "lucide-react";
import { useEffect, useRef, type ReactNode } from "react";
import { createPortal } from "react-dom";

const FOCUSABLE = "button, input, select, textarea, a[href]";

/** A panel over the right of the screen for one focused task. Escape or the backdrop closes it. */
export function Sheet({
  title,
  description,
  onClose,
  children,
  footer,
}: {
  title: string;
  description?: ReactNode;
  onClose: () => void;
  children: ReactNode;
  footer?: ReactNode;
}) {
  const panel = useRef<HTMLDivElement>(null);
  const close = useRef(onClose);

  useEffect(() => {
    close.current = onClose;
  });

  useEffect(() => {
    const opener = document.activeElement;
    const node = panel.current;
    const items = () => Array.from(node?.querySelectorAll<HTMLElement>(FOCUSABLE) ?? []);
    (items().find((el) => el.matches("input, select, textarea")) ?? items()[0])?.focus();

    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") close.current();
      if (event.key !== "Tab") return;
      const list = items();
      const first = list[0];
      const last = list[list.length - 1];
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last?.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first?.focus();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => {
      window.removeEventListener("keydown", onKey);
      if (opener instanceof HTMLElement) opener.focus();
    };
  }, []);

  return createPortal(
    <div className="fixed inset-0 z-40 flex justify-end">
      <button
        type="button"
        aria-label="Close"
        tabIndex={-1}
        onClick={onClose}
        className="absolute inset-0 cursor-default bg-ink-900/25"
      />
      <div
        ref={panel}
        role="dialog"
        aria-modal="true"
        aria-label={title}
        className="relative flex h-full w-120 max-w-full flex-col bg-surface-raised shadow-overlay"
      >
        <header className="flex items-start justify-between gap-3 border-b border-border px-5 py-4">
          <div className="min-w-0">
            <h2 className="headline text-h2">{title}</h2>
            {description && <div className="mt-1 text-small text-ink-700">{description}</div>}
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label={`Close ${title}`}
            className="flex size-8 flex-none cursor-pointer items-center justify-center rounded-control text-ink-700 hover:bg-canvas"
          >
            <X className="size-4" strokeWidth={1.5} aria-hidden="true" />
          </button>
        </header>
        <div className="min-h-0 flex-1 overflow-y-auto px-5 py-4">{children}</div>
        {footer && (
          <footer className="flex flex-wrap items-center gap-2 border-t border-border px-5 py-3">
            {footer}
          </footer>
        )}
      </div>
    </div>,
    document.body,
  );
}

export const inputClass =
  "h-9 w-full rounded-control border border-border-strong bg-surface-raised px-3 text-small text-ink-900 outline-none focus:border-accent focus:shadow-focus";

export function Field({
  label,
  hint,
  error,
  children,
}: {
  label: string;
  hint?: string;
  error?: string;
  children: ReactNode;
}) {
  return (
    <label className="flex min-w-0 flex-col gap-1">
      <span className="text-caption font-semibold text-ink-700">{label}</span>
      {children}
      {error ? (
        <span className="text-caption font-medium text-over">{error}</span>
      ) : (
        hint && <span className="text-caption text-ink-500">{hint}</span>
      )}
    </label>
  );
}
