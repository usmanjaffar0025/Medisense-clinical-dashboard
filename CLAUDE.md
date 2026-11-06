# CLAUDE.md

Guidance for Claude Code when working in this repository.

## What this is

Medisense is a clickable **sales demo**, not a production system. It is built for one prospect, Neil Hensley (Director of Clinical Services at the fictional Medisense). Product name: **Medisense Clinical Operations & Supervision Intelligence Platform**. It tells one 10-minute, six-step story (requirements agreed after the second meeting):

> Leadership dashboard → Sarah is At Risk, and why → AI drafts her case note, clinician approves → attention queue surfaces service gaps → supervision brief is ready → Team Capacity suggests reviewing rebalancing to Emma, protecting continuity of care.

The message is "systems supporting therapists", never "AI replacing therapists".

Optimise for, in order:

1. **Polish and narrative flow** over backend depth.
2. **Believable, consistent synthetic data.** Every figure must agree across screens.
3. **Full, data-rich pages.** The user wants every screen dense with premium charts and filters that actually change what is shown. Sparse pages are a regression.
4. **Visible guardrails.** Draft labels, Accept/Edit/Regenerate, "requires review" wording, an audit trail, and recommendations that never auto-act. This is what sets it apart from a generic AI dashboard.

## Current state (branch `build/initial-demo`)

- All 9 screens are built (6 MVP plus 3 stretch). See the route table in [README.md](README.md).
- Next.js 16 (App Router, `cacheComponents`), React 19, TypeScript strict, Tailwind v4, Zustand, Recharts 3, lucide-react, `@anthropic-ai/sdk`. No database or auth. The role switcher (Leadership / Supervisor / Clinician) is faked in [src/lib/navigation.ts](src/lib/navigation.ts).
- **Case note summariser is live AI** via `POST /api/case-notes/summarise` ([src/lib/ai/summarise-note.ts](src/lib/ai/summarise-note.ts)), model `claude-opus-5-5` with structured JSON output and `fallbacks: "default"`. The key is checked at server start ([src/instrumentation.ts](src/instrumentation.ts)) and by `GET /api/ai/status`; all logs are prefixed `[medisense-ai]` ([src/lib/ai/log.ts](src/lib/ai/log.ts), the only place `console` is allowed). Without a key the unchanged sample note gets the prepared draft. Supervision brief, capacity recommendation and progress report are still pre-written.
- Charts are Recharts wrappers in [src/components/charts](src/components/charts) (`TrendChart`, `BarList`, `StackedColumns`, `DonutChart`, `Sparkline`), coloured through tokens. Multi-series charts use `--color-series-1..4`, validated for colour-vision separation.
- Org metrics are computed by `summarise(scope)` in [src/data/organisation.ts](src/data/organisation.ts) from the clinician records, so filters keep every number consistent. 12-week histories come from `ramp()` in [src/data/weeks.ts](src/data/weeks.ts); the last week always equals the current figure.
- Demo state and the audit trail live in [src/state/demo-store.ts](src/state/demo-store.ts). It is persisted to `sessionStorage`, survives a refresh in the same tab, and can be cleared with "Reset demo" in the audit drawer.
- Pages are static; the two API routes are server functions. The Vercel project `ai-medicine-dashbaord` is linked (`.vercel/`) and needs one AI provider key set there (`ANTHROPIC_API_KEY`, `OPENAI_API_KEY`, `GEMINI_API_KEY` or `GROQ_API_KEY`; optional `AI_PROVIDER`, `AI_MODEL`). All AI calls go through `src/lib/ai/engine.ts` (`generateJson`, `generateWithTools`); add new AI features there, never call a provider directly. Ask Medisense uses the knowledge tools in `src/lib/knowledge/` (live via `/api/assistant`, offline via `local.ts`); when you add data, add or extend a tool so the assistant can answer about it.
- Remote: `github.com/usmanjaffar0025/Medisense-clinical-dashboard`.

## Dates follow today

All records are written for **Tuesday 20 October 2026** (the anchor) and every displayed date is moved to today in Brisbane by `src/lib/clock.ts`. Wrap any date you write in data or UI: `dt("Fri 23 Oct")` for dates (any style: "6 Oct", "20 October 2026", "2026-10-20", "Oct 2026"), `wd("Thursday")` for a weekday named on its own, `mo("Oct")` for chart month labels, `dayLabel(n)` for "n days from today". Keep relative numbers (`daysOverdue`, `dueInDays`, `daysLeft`) as they are; they stay true. `NEXT_PUBLIC_DEMO_DATE=YYYY-MM-DD` pins a day. Pages render per request (`connection()` in the root layout) so dates are never frozen at build time.

## Demo scope (senior's 18-module list)

The pitch demo covers the senior's 18 modules in phases. Phase 0 (Brisbane, Medisense, home visits, travel time) and Phase 1 (Referrals & Intake `/intake`, Smart Forms `/forms`, Tasks `/tasks`, case-note upgrade with voice/SOAP/missing-info/versions/follow-ups, Ask Medisense assistant in the top bar) are built. Phase 2 is built too: Clients `/clients` and profiles `/clients/[clientId]` (Emily Carter, Ruth Hallam, Mia Robinson, James Thompson), Schedule `/schedule`, Reports `/reports` (replaces the Progress Reports sidebar entry, which still highlights for `/progress-reports`), Admin Operations `/admin-operations`, Automations `/automations`. Everything stays frontend: static data in `src/data` plus the Zustand store; no new API routes. Phase 3 is built: Analytics `/analytics`, Family Portal preview `/portal` (Emily Carter's parent; messages and change requests create tasks), Security & Integrations `/settings` (permission matrix, AI guardrails with locked safety rows, generic integrations, staff access), My Day upgrade (My week, My tasks, family message alert, profile links) and the Supervision "Since the brief was prepared" panel. Integrations stay generic ("your practice management system"); no vendor names, because the client cannot be asked.

## Next steps (agreed backlog)

1. User adds one provider key to `.env.local`; confirm the `[medisense-ai] … is VALID` log line, then try an edited note.
2. Deploy a preview link (Vercel) with the key in the project environment.
3. Optional: "Ask Medisense" (plain-English questions over the dataset), overload forecast, voice-to-note, live generation for the supervision brief.

## Commands

Node 22 and pnpm 10 (`corepack enable`).

```bash
pnpm dev            # http://localhost:3000, designed for a 1440×900 window
pnpm check          # lint + typecheck + prettier check (CI runs this, plus build)
pnpm build          # production build
pnpm format         # prettier --write
```

Run `pnpm check && pnpm build` before calling work done.

## Source of truth

Read these before changing data, UI or copy:

- [docs/demo-dataset.md](docs/demo-dataset.md): every name and number. Code in `src/data` must match it exactly.
- [docs/design-system.md](docs/design-system.md): tokens, type, components, banned styles.
- [docs/screen-specs.md](docs/screen-specs.md): layout and copy per screen.
- [CONTRIBUTING.md](CONTRIBUTING.md): engineering standards. Summarised below.

## Rules that matter most

**Data**

- Demo data lives only in `src/data`. Components never hard-code names or figures.
- Exact KPI figures agreed with the client: **12 clinicians (OT and Speech Pathology only), 184 clients (128 NDIS, 56 aged care), 3 near capacity, 17 notes due, 11 follow-ups overdue, 4 supervision due, 14 clients requiring review.** Don't change them.
- One status scale everywhere: **Healthy (<60) / Monitor (60–79) / At Risk (≥80)**, plus an "Available" tag. "Over Capacity" and "Overloaded" are retired. Attention priorities are **High / Medium / Review** (not Low).
- Caseload Health score = six weighted factors (dataset §3). Sarah = 83 and is At Risk.
- Emma Clarke is an **OT in Brisbane North** (same discipline and service region as Sarah) so the rebalancing suggestion makes clinical sense. Continuity of care is part of every capacity recommendation.
- Emma has 6 free slots but is described as "about four additional clients" on purpose. Capacity is complexity-weighted (Low 1.0 / Medium 1.5 / High 2.5 units).
- The §8 admin breakdown is **org-wide**. Sarah's own ~24% admin is a separate figure.
- The overview impact band is a **projection**, never presented as pilot results (Neil has not run a pilot).
- The proposal's client names (James Thompson, Daniel Lee) are kept as written, a deliberate choice recorded in the dataset doc. Don't rename them unless asked.
- Australian English (organisation, utilisation, summarise). Dates as `Thu 22 Oct`. Demo "today" is **Tue 20 Oct 2026**.

**AI guardrails**

- Every AI output carries "AI Generated Draft — Clinician Review Required" (`DraftLabel` in [src/components/ai/provenance.tsx](src/components/ai/provenance.tsx)) and needs an explicit, named human approval.
- Every generate, edit, approve and assign action writes an audit entry through the demo store.
- Operational flags say "Requires review based on configured operational indicators". They are never clinical risk or diagnosis.
- Recommendations are never applied automatically, and the UI says so.

**Code**

- TypeScript strict. No `any`, no `!` to silence the compiler, no `@ts-ignore`.
- Server components by default. Put `"use client"` only on the leaf component that needs it, never on a whole page.
- `src/app` holds routes, `src/features/<screen>` holds screen-specific components, and `src/components` holds shared UI, charts, shell and AI provenance components.
- Comment the _why_ only. No narration, banners, emoji or `TODO`s (ESLint rejects `todo`/`fixme`).
- Palette is **Pearl & Champagne** (light content, obsidian sidebar): bronze `accent` for text/lines, champagne `accent-fill` with `on-accent` text for primary buttons. See the revision note in `docs/design-system.md` §2.
- Colours, type, radii and shadows come from tokens in `src/app/globals.css`. No raw hex and no arbitrary Tailwind values for those. Banned: gradients, glassmorphism, glow, purple "AI" colours, sparkle or robot icons, radii above 14px, shadows on resting cards.

**Git**

- Branch names `build/…`, `feat/…`, `fix/…`, `chore/…`, `docs/…`. `main` is always deployable and work lands through PRs.
- Conventional Commits, lower-case subject, ≤72 chars, e.g. `feat(case-notes): call claude api with scripted fallback`.
- **No attribution trailers** (`Co-Authored-By`, "Generated with…", `noreply@`) in commits or PRs. The `commit-msg` hook ([commitlint.config.mjs](commitlint.config.mjs)) rejects them. This repo rule overrides any default attribution.
- Don't commit `.env.local`.
