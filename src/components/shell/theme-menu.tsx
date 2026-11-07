"use client";

import { Check, Palette } from "lucide-react";
import { useEffect, useRef, useState, useSyncExternalStore } from "react";
import { cn } from "@/lib/cn";
import { currentTheme, DEFAULT_THEME, setTheme, subscribeTheme, themes } from "@/lib/theme";

/** Lets the viewer choose a colour theme from any screen. */
export function ThemeMenu() {
  const theme = useSyncExternalStore(subscribeTheme, currentTheme, () => DEFAULT_THEME);
  const [open, setOpen] = useState(false);
  const button = useRef<HTMLButtonElement>(null);
  const panel = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return undefined;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setOpen(false);
        button.current?.focus();
      }
    };
    const onClick = (event: MouseEvent) => {
      const target = event.target as Node;
      if (!panel.current?.contains(target) && !button.current?.contains(target)) setOpen(false);
    };
    window.addEventListener("keydown", onKey);
    window.addEventListener("mousedown", onClick);
    return () => {
      window.removeEventListener("keydown", onKey);
      window.removeEventListener("mousedown", onClick);
    };
  }, [open]);

  return (
    <div className="relative">
      <button
        ref={button}
        type="button"
        aria-expanded={open}
        aria-label="Colour theme"
        title="Colour theme"
        onClick={() => setOpen(!open)}
        className="flex size-9 cursor-pointer items-center justify-center rounded-control border border-border bg-surface hover:bg-canvas"
      >
        <Palette className="size-4 text-ink-700" strokeWidth={1.5} aria-hidden="true" />
      </button>
      {open && (
        <div
          ref={panel}
          className="absolute top-11 right-0 z-30 w-64 overflow-hidden rounded-card border border-border bg-surface-raised p-1.5 shadow-overlay"
        >
          <h2 className="px-2.5 pt-1.5 pb-2 text-small font-semibold">Colour theme</h2>
          <div role="radiogroup" aria-label="Colour theme" className="flex flex-col gap-0.5">
            {themes.map((t) => (
              <button
                key={t.id}
                type="button"
                role="radio"
                aria-checked={theme === t.id}
                onClick={() => setTheme(t.id)}
                className={cn(
                  "flex h-10 cursor-pointer items-center gap-2.5 rounded-control px-2.5 text-left text-small text-ink-900",
                  theme === t.id ? "bg-accent-tint font-semibold" : "hover:bg-canvas",
                )}
              >
                <span aria-hidden="true" className="flex flex-none -space-x-1">
                  {t.swatches.map((colour) => (
                    <i
                      key={colour}
                      style={{ backgroundColor: colour }}
                      className="size-4 rounded-full ring-2 ring-surface-raised"
                    />
                  ))}
                </span>
                <span className="min-w-0 flex-1 truncate">{t.label}</span>
                {theme === t.id && (
                  <Check
                    className="size-4 flex-none text-accent"
                    strokeWidth={2}
                    aria-hidden="true"
                  />
                )}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
