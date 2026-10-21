# Engineering standards

Medisense is a client-facing product demo. It must read as deliberately designed and carefully engineered software. These standards apply to every change.

## Workflow

- `main` is always deployable. All work happens on a branch and lands through a pull request.
- Branch names: `build/…`, `feat/…`, `fix/…`, `chore/…`, `docs/…`.
- Run `pnpm check` and `pnpm build` before opening a pull request. CI runs the same steps.

## Commits

- [Conventional Commits](https://www.conventionalcommits.org/): `type(scope): summary`, lower case, imperative, at most 72 characters.
  - `feat(capacity): add utilisation chart`
  - `fix(caseload): correct follow-up filter count`
- One logical change per commit. Do not mix formatting with behaviour changes.
- No attribution trailers, co-author lines or tool-generated footers in commits or pull requests. The `commit-msg` hook rejects them.

## Code

- TypeScript strict mode. No `any`, no non-null assertions to silence the compiler, no `@ts-ignore`.
- Components are small and named for what they show (`CapacityMeter`, `ScoreBreakdown`), not how they look (`GreenBar`).
- Server components by default. Add `"use client"` only to the component that needs state or events, never to a whole page.
- Demo data lives only in `src/data`. Components never hard-code names or figures.
- No dead code, commented-out code or placeholder `TODO`s in committed work.

## Comments

- Comment the _why_, never the _what_. Most code needs no comment.
- No narration ("Now we render the table"), no decorative banners, no emoji.
- Write comments as a teammate would: plain, specific, short.

## Design fidelity

The design system in `docs/design-system.md` is the source of truth.

- Colours, type sizes, radii and shadows come from tokens in `src/app/globals.css`. No raw hex values or arbitrary Tailwind values in components.
- Newsreader for headings and key numerals, Instrument Sans for interface text, IBM Plex Mono for audit timestamps. Tabular figures for all numbers.
- Banned: gradients, glassmorphism, glow, purple "AI" colours, sparkle or robot icons, emoji, shadows on resting cards, radii above 14px.
- Every AI output is shown as a draft with the label "AI Generated Draft — Clinician Review Required" and an explicit human approval action.
- Operational flags say "Requires review based on configured operational indicators". Never present them as clinical risk or diagnosis.
- Recommendations are never applied automatically and say so.

## Data

- All data is synthetic and must match `docs/demo-dataset.md` exactly, so figures agree across every screen.
- Australian English (organisation, utilisation, summarise). Dates as `Thu 22 Oct`.
