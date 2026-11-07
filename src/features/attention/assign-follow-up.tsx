"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Caption } from "@/components/ui/card";
import { followUpDefaults, followUpDueOptions, followUpReasons } from "@/data/attention";
import type { AttentionClient } from "@/data/types";
import type { FollowUpAssignment } from "@/state/demo-store";
import { Select } from "@/components/ui/select";

const fieldLabel = "text-caption font-semibold text-ink-700";
const input =
  "w-full rounded-control border border-border-strong bg-surface-raised px-2.5 text-small text-ink-900 outline-none focus:border-accent focus:shadow-focus";

export function AssignFollowUpPopover({
  client,
  onAssign,
  onCancel,
}: {
  client: AttentionClient;
  onAssign: (assignment: FollowUpAssignment) => void;
  onCancel: () => void;
}) {
  const owners = [...new Set([client.clinician, followUpDefaults.supervisor, "Neil Hensley"])];
  const firstReason = client.reasonTypes[0];
  const [owner, setOwner] = useState(client.clinician);
  const [due, setDue] = useState(followUpDefaults.due);
  const [reason, setReason] = useState(
    firstReason ? followUpDefaults.reasons[firstReason] : (followUpReasons[0] ?? ""),
  );
  const [note, setNote] = useState(followUpDefaults.notes[client.id] ?? followUpDefaults.note);

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => event.key === "Escape" && onCancel();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onCancel]);

  return (
    <div
      role="dialog"
      aria-label={`Assign follow-up for ${client.name}`}
      className="absolute top-full right-4 z-5 -mt-1.5 w-96 rounded-card border border-border bg-surface-raised text-left shadow-overlay"
    >
      <div className="px-4.5 pt-4 pb-1">
        <div className="eyebrow">Assign follow-up</div>
        <div className="mt-1 headline text-figure">{client.name}</div>
        <Caption className="mt-0.5">{client.reason}</Caption>
      </div>
      <div className="grid grid-cols-2 gap-3 px-4.5 pt-3 pb-4">
        <label className="flex flex-col gap-1.5">
          <span className={fieldLabel}>Owner</span>
          <Select
            className={`${input} h-9`}
            value={owner}
            onChange={(e) => setOwner(e.target.value)}
          >
            {owners.map((a) => (
              <option key={a}>{a}</option>
            ))}
          </Select>
        </label>
        <label className="flex flex-col gap-1.5">
          <span className={fieldLabel}>Due date</span>
          <Select className={`${input} h-9`} value={due} onChange={(e) => setDue(e.target.value)}>
            {followUpDueOptions.map((d) => (
              <option key={d}>{d}</option>
            ))}
          </Select>
        </label>
        <label className="col-span-2 flex flex-col gap-1.5">
          <span className={fieldLabel}>Reason</span>
          <Select
            className={`${input} h-9`}
            value={reason}
            onChange={(e) => setReason(e.target.value)}
          >
            {followUpReasons.map((r) => (
              <option key={r}>{r}</option>
            ))}
          </Select>
        </label>
        <label className="col-span-2 flex flex-col gap-1.5">
          <span className={fieldLabel}>Note</span>
          <textarea
            rows={2}
            value={note}
            onChange={(e) => setNote(e.target.value)}
            className={`${input} resize-y py-2`}
          />
        </label>
      </div>
      <div className="flex items-center justify-between gap-2 rounded-b-card border-t border-border bg-surface px-4.5 py-3">
        <Caption>Logged to audit trail.</Caption>
        <div className="flex gap-2">
          <Button size="sm" onClick={onCancel}>
            Cancel
          </Button>
          <Button
            size="sm"
            variant="primary"
            onClick={() =>
              onAssign({
                clientId: client.id,
                client: client.name,
                assignee: owner,
                due,
                reason,
                note,
              })
            }
          >
            Assign
          </Button>
        </div>
      </div>
    </div>
  );
}
