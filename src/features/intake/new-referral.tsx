"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Field, inputClass, Sheet } from "@/components/ui/sheet";
import { findDuplicate, regionForSuburb, suggestClinician } from "@/data/records";
import {
  preparedSampleExtraction,
  referralLines,
  sampleReferralText,
  type Referral,
  type ReferralSource,
  type ReferralStatus,
} from "@/data/referrals";
import type { AiMeta, ReferralExtraction } from "@/lib/story/types";
import { useDemoStore } from "@/state/demo-store";
import { callStory } from "@/state/use-story-ai";
import { Select } from "@/components/ui/select";

const MAX_LENGTH = 8000;
const sources: ReferralSource[] = [
  "Email",
  "Web form",
  "GP letter",
  "Phone intake",
  "School letter",
];

function toReferral(
  data: ReferralExtraction,
  lines: string[],
  source: ReferralSource,
  id: string,
  duplicateOf: string | null,
): { referral: Referral; status: ReferralStatus } {
  const region = regionForSuburb(data.suburb) ?? "Brisbane North";
  const unknownFunding = data.funding === "Unknown";
  const missing = unknownFunding ? ["Funding type", ...data.missing] : data.missing;
  const status: ReferralStatus = duplicateOf
    ? "Possible duplicate"
    : missing.length
      ? "Missing information"
      : "Needs verification";
  return {
    status,
    referral: {
      id,
      client: data.client || "Name not stated",
      age: data.age,
      funding: data.funding === "Unknown" ? "NDIS" : data.funding,
      services: data.services || "Not stated",
      region,
      suburb: data.suburb || "Suburb not stated",
      source,
      sourceDetail: `${source}, added to Medisense`,
      received: "Today, 10:20 am",
      ageHours: 0,
      status,
      document: lines,
      fields: data.fields,
      missing,
      contactName: data.contactName,
      contactPhone: data.contactPhone,
      duplicate: duplicateOf
        ? { client: duplicateOf, reason: "Same name as an existing client" }
        : undefined,
      suggestedClinician: suggestClinician(data.services, region),
      requestEmail: data.requestEmail,
    },
  };
}

/** AI reads a pasted referral. Only the sample has a prepared fallback; typed text never does. */
export function NewReferralSheet({
  onClose,
  onAdded,
}: {
  onClose: () => void;
  onAdded: (id: string) => void;
}) {
  const added = useDemoStore((s) => s.addReferral);
  const addedClients = useDemoStore((s) => s.addedClients);
  const count = useDemoStore((s) => s.addedReferrals.length);
  const cacheAi = useDemoStore((s) => s.cacheAi);
  const [text, setText] = useState("");
  const [source, setSource] = useState<ReferralSource>("Email");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function read() {
    const lines = referralLines(text);
    if (lines.length === 0) {
      setError("Paste the referral first.");
      return;
    }
    setBusy(true);
    setError(null);
    const result = await callStory<ReferralExtraction>({ kind: "referral", lines });
    let data: ReferralExtraction;
    let meta: AiMeta;
    if ("error" in result) {
      if (text.trim() !== sampleReferralText) {
        setBusy(false);
        setError(
          `The referral couldn't be read: ${result.error}. Your text is still here, so try again.`,
        );
        return;
      }
      data = preparedSampleExtraction;
      meta = { source: "prepared", model: null, latencyMs: null };
    } else {
      data = result.data;
      meta = result.meta;
    }
    const id = `new-referral-${count + 1}`;
    cacheAi(`referral:${id}`, "referral", data, meta);
    const duplicate = findDuplicate(data.client, addedClients);
    const { referral, status } = toReferral(data, lines, source, id, duplicate?.name ?? null);
    added(referral, status);
    setBusy(false);
    onAdded(id);
    onClose();
  }

  return (
    <Sheet
      title="New referral"
      description="Paste the referral as you received it. AI reads it, and you check the details before anything is created."
      onClose={onClose}
      footer={
        <>
          <Button variant="primary" disabled={busy} onClick={() => void read()}>
            {busy ? "AI is reading the referral…" : "Read referral with AI"}
          </Button>
          <Button onClick={onClose}>Cancel</Button>
        </>
      }
    >
      <div className="flex flex-col gap-4">
        <Field label="Where it came from">
          <Select
            className={inputClass}
            value={source}
            onChange={(e) => setSource(e.target.value as ReferralSource)}
          >
            {sources.map((s) => (
              <option key={s}>{s}</option>
            ))}
          </Select>
        </Field>
        <Field label="Referral text" error={error ?? undefined}>
          <textarea
            rows={14}
            maxLength={MAX_LENGTH}
            value={text}
            onChange={(e) => {
              setText(e.target.value);
              setError(null);
            }}
            className="w-full resize-y rounded-control border border-border-strong bg-surface-raised px-3 py-2 text-small leading-5.5 text-ink-900 outline-none focus:border-accent focus:shadow-focus"
          />
        </Field>
        <div>
          <Button
            size="sm"
            variant="ghost"
            onClick={() => {
              setText(sampleReferralText);
              setError(null);
            }}
          >
            Use sample referral
          </Button>
        </div>
      </div>
    </Sheet>
  );
}
