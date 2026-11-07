import type { CSSProperties } from "react";

/**
 * Accessibility values proposed in docs/design-spec-v2.md. They apply only inside the preview,
 * so the mock-ups can be judged with them; globals.css is unchanged until they are approved.
 */
export const proposedTokens = {
  "--color-ink-500": "#6b6860",
  "--color-ink-400": "#716e66",
  "--color-healthy": "#22704e",
  "--color-monitor": "#875208",
  "--color-over": "#ad3724",
  "--color-available": "#28609f",
  "--color-sidebar-faint": "rgb(245 243 238 / 0.55)",
  "--shadow-focus": "0 0 0 2px var(--color-surface), 0 0 0 4px var(--color-accent-hover)",
} as CSSProperties;

/** The same ring needs the light accent on the obsidian rail and presenter panel. */
export const darkSurfaceFocus = {
  "--shadow-focus": "0 0 0 2px var(--color-sidebar), 0 0 0 4px var(--color-accent-fill)",
} as CSSProperties;
