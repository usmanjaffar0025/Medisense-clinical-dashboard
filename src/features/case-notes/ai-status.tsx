"use client";

import { RefreshCw } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { Tag } from "@/components/ui/tag";
import type { KeyStatus } from "@/lib/ai/engine";

function label(status: KeyStatus) {
  switch (status.state) {
    case "valid":
      return `Live AI · ${status.provider} · ${status.model}`;
    case "missing":
      return "Prepared drafts · live AI not configured";
    case "invalid":
      return `Prepared drafts · ${status.provider} key invalid`;
    default:
      return `Prepared drafts · ${status.provider} unreachable`;
  }
}

async function fetchStatus(recheck: boolean): Promise<KeyStatus> {
  try {
    const res = await fetch(`/api/ai/status${recheck ? "?recheck=1" : ""}`);
    return (await res.json()) as KeyStatus;
  } catch {
    return {
      state: "unreachable",
      provider: "AI",
      model: "",
      key: "",
      reason: "Server",
      checkedAt: "",
    };
  }
}

/** Shows whether drafts come from Claude or the prepared fallback, so the presenter knows. */
export function AiStatus() {
  const [status, setStatus] = useState<KeyStatus | null>(null);
  const [checking, setChecking] = useState(false);

  const recheck = useCallback(async () => {
    setChecking(true);
    setStatus(await fetchStatus(true));
    setChecking(false);
  }, []);

  useEffect(() => {
    let cancelled = false;
    void fetchStatus(false).then((s) => {
      if (!cancelled) setStatus(s);
    });
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <span className="inline-flex items-center gap-2">
      {status ? (
        <span title={"reason" in status ? status.reason : undefined}>
          <Tag
            tone={
              status.state === "valid" ? "live" : status.state === "missing" ? "neutral" : "over"
            }
          >
            {label(status)}
          </Tag>
        </span>
      ) : (
        <Tag tone="neutral">Checking AI…</Tag>
      )}
      <button
        type="button"
        onClick={() => void recheck()}
        disabled={checking}
        aria-label="Check the AI connection again"
        className="flex size-6 cursor-pointer items-center justify-center rounded-tag text-ink-500 hover:bg-canvas hover:text-ink-900 disabled:cursor-wait"
      >
        <RefreshCw
          className={checking ? "size-3.5 animate-spin" : "size-3.5"}
          strokeWidth={1.5}
          aria-hidden="true"
        />
      </button>
    </span>
  );
}
