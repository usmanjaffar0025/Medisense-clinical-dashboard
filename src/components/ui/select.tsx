"use client";

import { Check, ChevronDown } from "lucide-react";
import {
  Children,
  Fragment,
  isValidElement,
  useEffect,
  useId,
  useRef,
  useState,
  type KeyboardEvent,
  type ReactNode,
} from "react";
import { createPortal } from "react-dom";
import { cn } from "@/lib/cn";

type Option = { value: string; label: string; disabled?: boolean };

/** Shaped like a native change event, so screens can swap `<select>` for this without other edits. */
export type SelectChange = { target: { value: string } };

function textOf(node: ReactNode): string {
  if (node === null || node === undefined || typeof node === "boolean") return "";
  if (typeof node === "string" || typeof node === "number") return String(node);
  if (Array.isArray(node)) return node.map(textOf).join("");
  if (isValidElement<{ children?: ReactNode }>(node)) return textOf(node.props.children);
  return "";
}

function optionsOf(children: ReactNode): Option[] {
  const out: Option[] = [];
  Children.forEach(children, (child) => {
    if (
      !isValidElement<{ value?: string | number; children?: ReactNode; disabled?: boolean }>(child)
    )
      return;
    if (child.type === Fragment) {
      out.push(...optionsOf(child.props.children));
    } else if (child.type === "option") {
      const label = textOf(child.props.children);
      out.push({
        value: child.props.value === undefined ? label : String(child.props.value),
        label,
        disabled: child.props.disabled,
      });
    }
  });
  return out;
}

const field =
  "h-9 w-full rounded-control border border-border-strong bg-surface-raised px-3 text-small text-ink-900";

/**
 * A designed dropdown that takes the same `<option>` children as a native select. The list opens
 * over everything, so it's never cut off by a card or panel, and it works fully from the keyboard.
 */
export function Select({
  value,
  onChange,
  children,
  className,
  id,
  disabled,
  "aria-label": ariaLabel,
}: {
  value: string | number;
  onChange?: (event: SelectChange) => void;
  children: ReactNode;
  className?: string;
  id?: string;
  disabled?: boolean;
  "aria-label"?: string;
}) {
  const options = optionsOf(children);
  const current = String(value);
  const selectedIndex = Math.max(
    0,
    options.findIndex((o) => o.value === current),
  );
  const selected = options.find((o) => o.value === current);
  const listId = useId();
  const button = useRef<HTMLButtonElement>(null);
  const list = useRef<HTMLUListElement>(null);
  const typed = useRef({ text: "", at: 0 });
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState(selectedIndex);
  const [place, setPlace] = useState<{
    left: number;
    width: number;
    top?: number;
    bottom?: number;
  }>({ left: 0, width: 0 });

  function measure() {
    const rect = button.current?.getBoundingClientRect();
    if (!rect) return;
    const width = Math.max(rect.width, 200);
    const left = Math.min(Math.max(8, rect.left), window.innerWidth - width - 8);
    const below = window.innerHeight - rect.bottom;
    setPlace(
      below < 260 && rect.top > below
        ? { left, width, bottom: window.innerHeight - rect.top + 6 }
        : { left, width, top: rect.bottom + 6 },
    );
  }

  function show(index = selectedIndex) {
    if (disabled) return;
    measure();
    setActive(index);
    setOpen(true);
  }

  function choose(index: number) {
    const option = options[index];
    if (!option || option.disabled) return;
    if (option.value !== current) onChange?.({ target: { value: option.value } });
    setOpen(false);
    button.current?.focus();
  }

  function step(from: number, by: number) {
    for (let i = 1; i <= options.length; i += 1) {
      const next = (from + by * i + options.length) % options.length;
      if (!options[next]?.disabled) return next;
    }
    return from;
  }

  useEffect(() => {
    if (!open) return undefined;
    const onDown = (event: MouseEvent) => {
      const target = event.target as Node;
      if (!list.current?.contains(target) && !button.current?.contains(target)) setOpen(false);
    };
    const onMove = () => measure();
    window.addEventListener("mousedown", onDown);
    window.addEventListener("resize", onMove);
    window.addEventListener("scroll", onMove, true);
    return () => {
      window.removeEventListener("mousedown", onDown);
      window.removeEventListener("resize", onMove);
      window.removeEventListener("scroll", onMove, true);
    };
  }, [open]);

  useEffect(() => {
    if (open) document.getElementById(`${listId}-${active}`)?.scrollIntoView({ block: "nearest" });
  }, [open, active, listId]);

  function onKeyDown(event: KeyboardEvent<HTMLButtonElement>) {
    const key = event.key;
    if (!open) {
      if (["ArrowDown", "ArrowUp", "Enter", " "].includes(key)) {
        event.preventDefault();
        show();
      }
      return;
    }
    if (key === "Escape") {
      // Closes only the list, not a panel the dropdown sits in.
      event.preventDefault();
      event.stopPropagation();
      setOpen(false);
    } else if (key === "Tab") {
      setOpen(false);
    } else if (key === "ArrowDown" || key === "ArrowUp") {
      event.preventDefault();
      setActive((a) => step(a, key === "ArrowDown" ? 1 : -1));
    } else if (key === "Home" || key === "End") {
      event.preventDefault();
      setActive(key === "Home" ? step(-1, 1) : step(options.length, -1));
    } else if (key === "Enter" || key === " ") {
      event.preventDefault();
      choose(active);
    } else if (key.length === 1 && /\S/.test(key)) {
      const now = Date.now();
      typed.current = {
        text:
          now - typed.current.at < 700 ? typed.current.text + key.toLowerCase() : key.toLowerCase(),
        at: now,
      };
      const match = options.findIndex(
        (o) => !o.disabled && o.label.toLowerCase().startsWith(typed.current.text),
      );
      if (match >= 0) setActive(match);
    }
  }

  return (
    <>
      <button
        ref={button}
        id={id}
        type="button"
        role="combobox"
        aria-label={ariaLabel}
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-controls={open ? listId : undefined}
        aria-activedescendant={open ? `${listId}-${active}` : undefined}
        disabled={disabled}
        onClick={() => (open ? setOpen(false) : show())}
        onKeyDown={onKeyDown}
        className={cn(
          field,
          className,
          "flex cursor-pointer items-center justify-between gap-2 text-left transition-colors hover:border-accent disabled:cursor-not-allowed disabled:opacity-50",
          open && "border-accent shadow-focus",
        )}
      >
        <span className="min-w-0 truncate">{selected?.label ?? ""}</span>
        <ChevronDown
          className={cn(
            "size-4 flex-none text-ink-500 transition-transform duration-160",
            open && "rotate-180 text-accent",
          )}
          strokeWidth={1.75}
          aria-hidden="true"
        />
      </button>
      {open &&
        createPortal(
          <ul
            ref={list}
            id={listId}
            role="listbox"
            aria-label={ariaLabel}
            style={{ left: place.left, width: place.width, top: place.top, bottom: place.bottom }}
            className="fixed z-[60] max-h-72 overflow-y-auto rounded-card border border-border bg-surface-raised p-1.5 text-small text-ink-900 shadow-overlay"
          >
            {options.map((option, index) => {
              const isSelected = option.value === current;
              return (
                <li
                  key={`${option.value}-${index}`}
                  id={`${listId}-${index}`}
                  role="option"
                  aria-selected={isSelected}
                  aria-disabled={option.disabled || undefined}
                  onMouseDown={(event) => event.preventDefault()}
                  onMouseEnter={() => setActive(index)}
                  onClick={() => choose(index)}
                  className={cn(
                    "flex cursor-pointer items-center justify-between gap-3 rounded-control px-3 py-2",
                    index === active && "bg-accent-tint",
                    isSelected && "font-semibold text-accent",
                    option.disabled && "cursor-not-allowed opacity-45",
                  )}
                >
                  <span className="min-w-0">{option.label}</span>
                  {isSelected && (
                    <Check className="size-4 flex-none" strokeWidth={2.25} aria-hidden="true" />
                  )}
                </li>
              );
            })}
          </ul>,
          document.body,
        )}
    </>
  );
}
