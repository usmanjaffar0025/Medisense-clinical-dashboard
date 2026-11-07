"use client";

import { CalendarPlus, FileInput, Plus, UserPlus } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { blankClient, ClientFormSheet } from "@/features/clients/client-form";
import { NewReferralSheet } from "@/features/intake/new-referral";
import { BookVisitSheet } from "@/features/schedule/book-visit";
import { useDemoStore } from "@/state/demo-store";

const actions = [
  { id: "client", label: "Add client", detail: "Create a new client record", icon: UserPlus },
  {
    id: "referral",
    label: "New referral",
    detail: "AI reads it for you to check",
    icon: FileInput,
  },
  { id: "visit", label: "Book visit", detail: "Home visit or telehealth", icon: CalendarPlus },
] as const;

/** The way to create something from any screen, for every workspace. */
export function QuickAdd() {
  const router = useRouter();
  const addClient = useDemoStore((s) => s.addClient);
  const [open, setOpen] = useState(false);
  const [sheet, setSheet] = useState<(typeof actions)[number]["id"] | null>(null);
  const panel = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return undefined;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
    };
    const onClick = (event: MouseEvent) => {
      if (!panel.current?.contains(event.target as Node)) setOpen(false);
    };
    window.addEventListener("keydown", onKey);
    window.addEventListener("mousedown", onClick);
    return () => {
      window.removeEventListener("keydown", onKey);
      window.removeEventListener("mousedown", onClick);
    };
  }, [open]);

  return (
    <div ref={panel} className="relative">
      <Button variant="primary" aria-expanded={open} onClick={() => setOpen(!open)}>
        <Plus className="size-4" strokeWidth={2} aria-hidden="true" />
        New
      </Button>
      {open && (
        <div className="absolute top-11 right-0 z-30 w-72 max-w-[calc(100vw-2rem)] rounded-card border border-border bg-surface-raised p-1.5 shadow-overlay">
          {actions.map(({ id, label, detail, icon: Icon }) => (
            <button
              key={id}
              type="button"
              onClick={() => {
                setOpen(false);
                setSheet(id);
              }}
              className="flex w-full cursor-pointer items-center gap-3 rounded-control px-2.5 py-2 text-left hover:bg-canvas"
            >
              <span className="flex size-9 flex-none items-center justify-center rounded-full bg-accent-tint text-accent">
                <Icon className="size-4.5" strokeWidth={1.75} aria-hidden="true" />
              </span>
              <span className="min-w-0">
                <span className="block text-small font-semibold">{label}</span>
                <span className="block truncate text-caption text-ink-500">{detail}</span>
              </span>
            </button>
          ))}
        </div>
      )}
      {sheet === "client" && (
        <ClientFormSheet
          title="Add client"
          initial={blankClient}
          submitLabel="Create client"
          onClose={() => setSheet(null)}
          onSubmit={(client) => {
            addClient(client);
            setSheet(null);
            router.push(`/clients/${client.id}`);
          }}
        />
      )}
      {sheet === "referral" && (
        <NewReferralSheet onClose={() => setSheet(null)} onAdded={() => router.push("/intake")} />
      )}
      {sheet === "visit" && (
        <BookVisitSheet onClose={() => setSheet(null)} onBooked={() => router.push("/schedule")} />
      )}
    </div>
  );
}
