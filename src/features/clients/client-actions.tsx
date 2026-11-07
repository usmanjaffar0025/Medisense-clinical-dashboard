"use client";

import { CalendarPlus, Pencil, UserPlus } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { clientRecord } from "@/data/records";
import { BookVisitSheet } from "@/features/schedule/book-visit";
import { useDemoStore } from "@/state/demo-store";
import { blankClient, ClientFormSheet } from "./client-form";

export function AddClientButton() {
  const router = useRouter();
  const addClient = useDemoStore((s) => s.addClient);
  const [open, setOpen] = useState(false);
  return (
    <>
      <Button variant="primary" onClick={() => setOpen(true)}>
        <UserPlus className="size-4" strokeWidth={1.5} aria-hidden="true" />
        Add client
      </Button>
      {open && (
        <ClientFormSheet
          title="Add client"
          initial={blankClient}
          submitLabel="Create client"
          onClose={() => setOpen(false)}
          onSubmit={(client) => {
            addClient(client);
            setOpen(false);
            router.push(`/clients/${client.id}`);
          }}
        />
      )}
    </>
  );
}

/** Edit and book, for any client, whether they came from the records or were added here. */
export function ClientActions({ id }: { id: string }) {
  const added = useDemoStore((s) => s.addedClients);
  const edits = useDemoStore((s) => s.clientEdits);
  const updateClient = useDemoStore((s) => s.updateClient);
  const [open, setOpen] = useState<"edit" | "book" | null>(null);
  const client = clientRecord(id, added, edits);
  if (!client) return null;

  return (
    <>
      <Button onClick={() => setOpen("edit")}>
        <Pencil className="size-4" strokeWidth={1.5} aria-hidden="true" />
        Edit client
      </Button>
      <Button onClick={() => setOpen("book")}>
        <CalendarPlus className="size-4" strokeWidth={1.5} aria-hidden="true" />
        Book visit
      </Button>
      {open === "edit" && (
        <ClientFormSheet
          title="Edit client"
          description={client.name}
          initial={client}
          submitLabel="Save changes"
          onClose={() => setOpen(null)}
          onSubmit={(next) => {
            updateClient(id, next);
            setOpen(null);
          }}
        />
      )}
      {open === "book" && <BookVisitSheet client={client} onClose={() => setOpen(null)} />}
    </>
  );
}
