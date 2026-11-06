import { sarahClients } from "./caseload";
import { complexityWeights, emma, sarah } from "./clinicians";
import type { CaseloadClient } from "./types";
import { dt } from "@/lib/clock";

const weightOf = {
  High: complexityWeights.high,
  Medium: complexityWeights.medium,
  Low: 1,
} as const;

/**
 * Clients a supervisor might review for transfer: seen by Sarah for under three months,
 * not high complexity and with no open attention flags, so continuity is least disrupted.
 */
export const transferCandidates: CaseloadClient[] = sarahClients.filter(
  (c) => c.tenureMonths < 3 && c.complexity !== "High" && c.attention.kind === "none",
);

const movedUnits = transferCandidates.reduce((sum, c) => sum + weightOf[c.complexity], 0);
const moved = transferCandidates.length;

/** The rebalancing scenario is a preview only. Nothing in the data changes when it is shown. */
export const rebalanceScenario = {
  moved,
  movedUnits,
  sarah: {
    before: { active: sarah.active, units: sarah.weightedUnits, utilisation: sarah.utilisation },
    after: {
      active: sarah.active - moved,
      units: sarah.weightedUnits - movedUnits,
      utilisation: Math.round(((sarah.active - moved) / sarah.capacity) * 100),
    },
  },
  emma: {
    before: { active: emma.active, units: emma.weightedUnits, utilisation: emma.utilisation },
    after: {
      active: emma.active + moved,
      units: emma.weightedUnits + movedUnits,
      utilisation: Math.round(((emma.active + moved) / emma.capacity) * 100),
    },
  },
};

export const capacityRecommendation = {
  generatedAt: `${dt("19 Oct")}, 15:02`,
  text: "Sarah is above configured capacity and has six complex cases. Emma currently has capacity for approximately four additional clients of comparable complexity. Leadership must review any redistribution. The system will not reassign clients automatically.",
  from: { name: "Sarah", load: "27 / 25", note: "+2 over · 42.0 / 37.5 units" },
  to: { name: "Emma", load: "18 / 24", note: "≈4 available · 6.5 units free" },
  continuity: [
    "Established and high-complexity clients stay with Sarah.",
    `${moved} newer clients (under 3 months, no open flags) could be reviewed for transfer.`,
    "Emma is an OT covering the same region (Brisbane North), so clients keep their discipline and travel area.",
  ],
};
