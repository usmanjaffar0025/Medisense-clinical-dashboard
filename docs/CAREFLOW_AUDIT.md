# CareFlow AI: Codebase Audit

Audited 6 November 2026, working tree of branch `build/initial-demo`. Read-only: this file is the only change to the repository. All paths are relative to `Medisense-clinical-dashboard/`.

**How findings were verified**

- **Code reading:** shell, state store, AI layer, case notes, tasks, supervision, intake, forms, reports, portal, settings and automations were read in full. Schedule, clients, analytics, admin operations and capacity were checked through targeted searches and partial reads.
- **Checks run in the repo:** lint, typecheck, format check and `pnpm audit --prod`.
- **Runtime:** a temporary copy outside the repo, with **no AI key**, was opened in a browser at about 1707 px wide. Narrow widths were measured with same-origin iframes. Findings marked _(observed)_ come from this run. The copy has been deleted.
- **Not exercised:**
  - Live AI calls, to avoid using your key or credits.
  - A real microphone.
  - `pnpm build`, because it can corrupt a running dev server's cache.
- **Font swap in the copy:** `next/font/google` failed in the copy, so the same fonts were loaded with a `<link>` tag there. See Code finding 10.

## 1. Summary

- **What exists:** a polished Next.js 16 sales demo with 21 screen routes and 3 API routes. It runs on typed synthetic data and a browser-session store. It has no backend, database, login or persistence.
- **Maturity:** a strong clickable demo, not a product. Measured against "works end to end", **no scope item is fully Built**: all 19 core items are Partial, and only the case-note summariser and Ask assistant can call a real model.
- **Strongest areas:** the design system, explainable caseload scoring, the note review flow, working filters, visible AI guardrails and consistent data.
- **Biggest gap, the hero flow doesn't close:** approving a note only offers follow-up tasks. It prepares no report or form, escalation can't happen to a new task, the supervision brief is pre-written, and the dashboard never changes.
- **Other gaps:**
  - There is no Client role, Sarah therapist view or Oliver James.
  - Permissions are decorative: a Clinician view can read other clinicians' data through the assistant.
  - The layout is desktop-only, although therapists work in the field.
- **Most urgent risks:**
  - Almost all work since 21 October is uncommitted.
  - There are no tests.
  - At least 20 visible controls do nothing.
  - Some UI claims are untrue or unbacked: dictation privacy, name redaction, Sydney hosting, MFA.

## 2. Tech stack and how to run

| Area           | What is used                                                                                          | Evidence                                            |
| -------------- | ----------------------------------------------------------------------------------------------------- | --------------------------------------------------- |
| Framework      | Next.js 16.4.2 App Router with Turbopack, `cacheComponents`, partial prefetching                      | `package.json`, `next.config.ts`                    |
| Language       | TypeScript strict, including `noUncheckedIndexedAccess`                                               | `tsconfig.json`                                     |
| UI             | React 19.3 with custom components; no component library. lucide-react icons                           | `src/components/ui/`                                |
| Styling        | Tailwind v4 with tokens in `@theme`; default palette cleared                                          | `src/app/globals.css`                               |
| Charts         | Recharts 3 wrappers                                                                                   | `src/components/charts/`                            |
| State          | Zustand 5, persisted to `sessionStorage`                                                              | `src/state/demo-store.ts`                           |
| Routing        | File-based. Role is a store value that filters the sidebar only                                       | `src/lib/navigation.ts`                             |
| Backend        | 3 route handlers only: `/api/case-notes/summarise`, `/api/assistant`, `/api/ai/status`                | `src/app/api/`                                      |
| Database       | None                                                                                                  |                                                     |
| Auth           | None: no login, middleware or session                                                                 | No middleware or proxy file exists                  |
| AI/LLM         | Provider-agnostic engine: Anthropic SDK, plus an OpenAI-compatible client for OpenAI, Gemini and Groq | `src/lib/ai/engine.ts`, `providers.ts`              |
| Speech-to-text | Browser Web Speech API (Chrome and Edge), plus a scripted "Sample dictation"                          | `src/features/case-notes/use-dictation.ts`          |
| Hosting config | Vercel and Netlify output folders are both present and git-ignored. CI is GitHub Actions              | `.vercel/`, `.netlify/`, `.github/workflows/ci.yml` |
| Tooling        | ESLint, Prettier, commitlint, simple-git-hooks, lint-staged. **No test framework**                    | `package.json`                                      |

**Architecture:** `src/app` holds routes, `src/features/<screen>` screen components, `src/components` shared UI, `src/data` the synthetic dataset, `src/state` the session store, and `src/lib` the AI layer, assistant tools and date shifting.

**Data:** mock data in `src/data` plus `sessionStorage`. Refreshing keeps state. A new tab or "Reset session" loses it. Only a sample of clients exists as rows, while 184 is a constant (`clientTotals`, `src/data/client-directory.ts`).

**Run** (Node 22, pnpm 10):

```bash
pnpm install
pnpm dev      # http://localhost:3000, designed for 1440 x 900
pnpm check    # lint + typecheck + format check
```

Other scripts: `build`, `start`, `lint`, `typecheck`, `format`, `format:check`. Do not run `build` while `dev` is running.

**Environment variables (names only):**

- `ANTHROPIC_API_KEY`, `OPENAI_API_KEY`, `GEMINI_API_KEY` or `GOOGLE_API_KEY`, `GROQ_API_KEY` (one is enough)
- `AI_PROVIDER`, `AI_MODEL`, `NEXT_PUBLIC_DEMO_DATE` (optional)
- `VERCEL_OIDC_TOKEN` (present in `.env.local`, added by Vercel tooling)

The only provider key populated locally is `GROQ_API_KEY`, so live AI runs on Groq rather than the Claude default the docs describe.

**Check results:**

| Check               | Result                               |
| ------------------- | ------------------------------------ |
| `pnpm lint`         | Pass                                 |
| `tsc --noEmit`      | Pass                                 |
| `pnpm format:check` | Pass                                 |
| `pnpm audit --prod` | No known vulnerabilities             |
| Tests               | None exist; no test script           |
| `pnpm build`        | **Unverified**, deliberately not run |

## 3. Feature inventory

**Status key:** **Built** means it works end to end. **Partial** means UI only, mocked or incomplete; the Notes say how far it goes. **Missing** means absent. Because there is no persistence or auth, a working demo flow is still Partial.

### Core

| #   | Feature                                             | Status                  | Evidence (files)                                                                                               | Notes                                                                                                                                                                                                                                                                                |
| --- | --------------------------------------------------- | ----------------------- | -------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| 1   | Role login / switching                              | Partial                 | `src/components/shell/top-bar.tsx`, `src/lib/navigation.ts`                                                    | Switcher only, no login. Roles are Leadership, Admin, Supervisor, Clinician. **No Client role.** Every page is reachable from any role.                                                                                                                                              |
| 2   | Director dashboard with alerts                      | Partial (strong UI)     | `src/app/page.tsx`, `src/features/overview/`                                                                   | Filters recompute correctly and alerts link to the right screens. Reads no session state, so it never updates. Weekly summary and Export do nothing.                                                                                                                                 |
| 3   | Client management                                   | Partial                 | `src/features/clients/`, `src/data/client-profiles.ts`                                                         | Directory filters work. Only **4 full profiles** (Emily Carter, Ruth Hallam, Mia Robinson, James Thompson). Funding, goals, attendance, timeline and documents are shown read-only. No create, edit or upload.                                                                       |
| 4   | Referral intake + AI extraction                     | Partial (scripted)      | `src/features/intake/intake-workspace.tsx`, `src/data/referrals.ts`                                            | Good source-line UI, confidence flags, duplicate and missing-info handling. **No upload and no AI call:** extraction is hard-coded. "Create profile" adds a task but no client. "Send request" sends nothing.                                                                        |
| 5   | Appointments / home visits                          | Partial                 | `src/features/schedule/schedule-workspace.tsx`, `src/data/schedule.ts`                                         | Team week and day views, travel time, accept/dismiss suggestions. Statuses are completed, booked and cancelled. **No no-show status, booking, rescheduling or appointment reminders.**                                                                                               |
| 6   | Therapist workspace                                 | Partial                 | `src/app/my-day/page.tsx`, `src/features/my-day/`                                                              | Hard-coded to **Hannah Wright**, not Sarah. Several actions do nothing, including draft Review buttons.                                                                                                                                                                              |
| 7   | Voice dictation                                     | Partial (works in code) | `src/features/case-notes/use-dictation.ts`, `therapist-notes.tsx`                                              | Real browser speech-to-text, Chrome and Edge only. Button hides on unsupported browsers. Scripted sample available. Live mic **Unverified**: not tested.                                                                                                                             |
| 8   | AI notes: SOAP, edit, regenerate, approve, versions | Partial (best feature)  | `src/features/case-notes/`, `src/lib/ai/summarise-note.ts`                                                     | Real model call with fallback. Edit, regenerate, approve and missing-info all work. Gaps: "version history" is audit lines with no content or restore; SOAP is a re-labelled view; only the first summary sentence links to a source line. Live call **Unverified**: code read only. |
| 9   | AI reports + export                                 | Partial (scripted)      | `src/features/progress-report/report-draft.tsx`, `src/features/reports/reports-library.tsx`                    | One pre-written report (Emily Carter). "Generate AI draft" only flips a status. Section Edit, Regenerate, **Export PDF** and Save draft do nothing. No Word export. Not built from notes approved in the session.                                                                    |
| 10  | Smart forms / prefill                               | Partial                 | `src/features/forms/forms-workspace.tsx`, `src/data/forms.ts`                                                  | Good field-level source badges and required-field validation. Prefill values are hard-coded. "Sync" is a timer, with one scripted failure.                                                                                                                                           |
| 11  | Follow-up / task automation                         | Partial                 | `src/features/case-notes/note-extras.tsx`, `src/features/tasks/`, `src/data/tasks.ts`                          | Tasks from notes work after confirmation. No reassigning. Escalation is a static filter on `daysOverdue`, and no reminder fires.                                                                                                                                                     |
| 12  | Admin queue / exceptions                            | Partial                 | `src/features/admin-operations/admin-operations.tsx`, `src/features/tasks/`                                    | Queue counts are live from the store. Expiries and reminders work in the demo. No dedicated admin work queue. **The "exception list" named on a failed form sync doesn't exist.**                                                                                                    |
| 13  | Caseload monitoring, explainable rules              | Partial (strong)        | `src/features/caseload/score-breakdown.tsx`, `src/features/capacity/`, `src/data/clinicians.ts`                | Six-factor explanation is clear and org metrics are computed. Factor scores are authored values, not derived from live state. Drill-down exists **for Sarah only**.                                                                                                                  |
| 14  | Supervision + AI briefs                             | Partial                 | `src/app/supervision/sarah-thompson/page.tsx`, `src/features/supervision/`                                     | Brief is pre-written, **no AI**, Sarah only. Include, remove and approve work. Regenerate only resets. Add item, Share and Start session notes do nothing. "Since the brief" panel is live.                                                                                          |
| 15  | Client portal                                       | Partial (preview)       | `src/features/portal/portal-preview.tsx`                                                                       | Rendered inside a mock browser frame in the staff app. Confirm, change request, messages and report gating work. **No login, uploads, forms or AI FAQ assistant.**                                                                                                                   |
| 16  | Notifications & automation centre                   | Partial (façade)        | `src/features/automations/automations-workspace.tsx`, `src/data/automations.ts`                                | Rule builder and toggles change charts and audit only: **no rule executes anything**. Runs are static, "Failures 1" and "Waiting 9" are hard-coded. No notification centre.                                                                                                          |
| 17  | Ask assistant, permission-aware                     | Partial                 | `src/components/shell/assistant-panel.tsx`, `src/app/api/assistant/route.ts`, `src/lib/knowledge/`             | 15 read-only tools, offline fallback, links to screens. **Not permission-aware** _(observed)_. Named "Ask Medisense".                                                                                                                                                                |
| 18  | Audit, traceability, permissions                    | Partial                 | `src/components/shell/audit-drawer.tsx`, `src/features/settings/security-settings.tsx`, `src/data/settings.ts` | Audit trail is visible and actions write to it, but it is session-only, resettable and uses scripted times and names. Traceability is partial. **Permission matrix enforces nothing.**                                                                                               |
| 19  | Analytics & reporting                               | Partial (strong UI)     | `src/features/analytics/analytics-dashboard.tsx`, `src/features/reports/`, `src/app/admin-insights/page.tsx`   | Rich charts with period, site, discipline and sort controls. Static data, Export does nothing, no report builder.                                                                                                                                                                    |

### Expansion

| #   | Feature                                                    | Status           | Evidence (files)                                                      | Notes                                                                                                                                   |
| --- | ---------------------------------------------------------- | ---------------- | --------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------- |
| 20  | EHR, nursing, lab, radiology, pharmacy, wards, ED, theatre | Missing          |                                                                       | No screens. Searches for nursing, radiology and pharmacy find nothing.                                                                  |
| 21  | Billing, claims, accounting, HR/payroll, inventory, assets | Missing          | `src/data/settings.ts`                                                | Only "Available" integration cards and a billable-hours chart. Staff compliance tracking in Admin Operations is the nearest HR feature. |
| 22  | Patient and staff mobile                                   | Missing          | `src/components/shell/sidebar.tsx`                                    | No apps and no working mobile layout: at 390 px the main column is 125 px wide _(observed)_.                                            |
| 23  | Telehealth                                                 | Missing          | `src/data/schedule.ts`                                                | An appointment type and label only. No video or join flow.                                                                              |
| 24  | Integration hub                                            | Partial (façade) | `src/features/settings/security-settings.tsx`, `src/data/settings.ts` | Cards show "Connected" and "Synced 4 min ago", but nothing connects.                                                                    |

### In the code but not on your list

- Team Capacity with a complexity-weighted rebalancing suggestion and scenario preview (`src/features/capacity/`)
- Clients Requiring Attention queue with assign-follow-up (`src/features/attention/`)
- Admin Insights: time breakdown and automation opportunities (`src/app/admin-insights/page.tsx`)
- Staff and client compliance expiries such as Blue Card and screening (`src/data/admin-operations.ts`)
- Projected Impact band on the Overview (`src/features/overview/impact-band.tsx`)
- AI guardrail settings and staff access table (`src/data/settings.ts`)
- Report and form template libraries
- Four-provider AI engine with key health checks (`src/lib/ai/`)
- Date engine that moves all records to today (`src/lib/clock.ts`)
- Offline ranked record search for the assistant (`src/lib/knowledge/tools.ts`)
- "Reset session" in the audit drawer

## 4. Hero flow walkthrough

Tested with the prepared-draft path, using Oliver Grant as the closest match.

| #   | Step                                   | Works?         | Where                                                                               | What breaks                                                                                                                                                                                                                                                                      |
| --- | -------------------------------------- | -------------- | ----------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 1   | Dashboard alert about overloaded Sarah | **Yes**        | `src/features/overview/attention-panel.tsx`                                         | Good. Worded "above configured capacity"; the agreed scale says "At Risk", and "overloaded" was retired on purpose.                                                                                                                                                              |
| 2   | Workload breakdown                     | **Yes**        | `src/app/caseloads/sarah-thompson/page.tsx`                                         | The best-explained step.                                                                                                                                                                                                                                                         |
| 3   | Session for Oliver James               | **No**         | `src/data/case-note.ts`, `src/data/caseload.ts`                                     | **Oliver James doesn't exist.** Oliver Grant does, but has no session screen, and `/clients/oliver-grant` has no profile. Sarah has no therapist view: the Clinician role is Hannah.                                                                                             |
| 4   | Voice dictation                        | **Partly**     | `src/features/case-notes/therapist-notes.tsx`                                       | The note screen opens filled, so the presenter must clear it or use Sample dictation.                                                                                                                                                                                            |
| 5   | AI-structured SOAP note                | **Partly**     | `src/features/case-notes/note-draft.tsx`                                            | Defaults to "Structured"; SOAP is a toggle. **A** is the summary and **O** merges interventions with observations, which a clinician may challenge.                                                                                                                              |
| 6   | Edit and approve                       | **Partly**     | `src/features/case-notes/note-draft.tsx`, `src/state/demo-store.ts`                 | Works, but Subjective can't be edited. Approval is unguarded: **from the Leadership view it recorded "Approved by Sarah Thompson"** _(observed)_. "Generate again" silently returns an approved note to draft.                                                                   |
| 7   | Report draft, forms, follow-up task    | **Tasks only** | `src/features/case-notes/note-extras.tsx`                                           | **Break 1:** approval prepares no report or form. Oliver has no report and no form draft in the store _(observed)_. Tasks are offered, not prepared.                                                                                                                             |
| 8   | Task lands in Admin queue              | **Partly**     | `src/features/tasks/tasks-workspace.tsx`                                            | Prepared path: a task reaches Admin team and shows in `/tasks` _(observed)_. **Break 2:** there is no role-filtered queue. **Break 3:** on the live AI path every task goes to the clinician, so none reaches Admin (`suggestionsFor`, `note-extras.tsx`).                       |
| 9   | Reminder / escalation                  | **No**         | `src/data/tasks.ts`, `src/state/demo-store.ts`                                      | **Break 4:** new tasks get `daysOverdue: 0` and time never advances, so they can't escalate. Task reminders don't exist. A task labelled "due Sat 7 Nov" also shows as due **Today**, and Due Today went from 1 to 3 _(observed)_.                                               |
| 10  | AI supervision brief                   | **Partly**     | `src/features/supervision/agenda.tsx`, `since-brief.tsx`, `src/data/supervision.ts` | Looks good but is pre-written. The "Since the brief" tile moved to 1 of 5 approved while the brief still said "Four clinical notes remain incomplete" _(observed)_. **Break 5:** a confirmed "Add to brief" task doesn't change the brief.                                       |
| 11  | Dashboard updates, before/after        | **No**         | `src/features/overview/`                                                            | **Break 6, the biggest:** after approval and tasks, Overview still showed 17 notes due, 12 overdue and Sarah with 4 overdue _(observed)_. Overview doesn't read the store, and sidebar badges are constants. The impact band is a fixed projection. No before/after view exists. |

**Other disconnect:** "Assign follow-up" on the attention screen writes an audit entry but creates no task (`assignFollowUp`, `src/state/demo-store.ts`). "AI drafts awaiting" on My Day has dead Review buttons.

**The existing demo tells a different story:** the docs define a six-step flow ending at Team Capacity (`CLAUDE.md`). That older flow does work; this audit's hero flow is new and only partly supported.

## 5. Design & UX findings (most severe first)

**Overall:** the visual system is good and doesn't look generic. Obsidian rail, serif numerals, restrained bronze and consistent status tags read as considered. No raw hex values appear in TS or TSX. The main problems are behaviour, accessibility and page sameness rather than styling.

1. **Desktop-only layout, for a field workforce.** The 248 px sidebar never collapses and there is no mobile navigation (`src/components/shell/sidebar.tsx`). Main column widths _(observed)_: 125 px at 390, 503 px at 768, 759 px at 1024. Page padding is fixed at `px-10` (`src/components/ui/page.tsx`). Therapists dictating after a home visit would be on a phone.
2. **Controls that do nothing erode trust in a live demo.** Confirmed no-handler or display-only controls:
   - Overview: Weekly summary, Export (`src/app/page.tsx`)
   - Sidebar: Switch organisation (`sidebar.tsx`)
   - Admin Insights: Export (`src/app/admin-insights/page.tsx`)
   - Audit: Export log (`audit-drawer.tsx`)
   - My Day: Prepare my supervision, shortcut rows without links, Review (`src/app/my-day/page.tsx`, `waiting-for-you.tsx`)
   - Supervision: Share brief, Start session notes, Add item (`src/app/supervision/sarah-thompson/page.tsx`, `agenda.tsx`)
   - Report: section Edit, Regenerate section, Export PDF, Save draft, and source tick-boxes and "View" labels with no effect (`report-draft.tsx`)
   - Portal: document "View" labels (`portal-preview.tsx`)
3. **Developer details on client-facing screens**, against your stated rule:
   - Provider and model tag, plus a recheck icon (`src/features/case-notes/ai-status.tsx`)
   - "Generated live by…" (`note-draft.tsx`)
   - `[medisense-ai]` log advice inside an error (`note-draft.tsx`)
   - "Demo mode…" notices and "(live · model)" in the audit trail (`demo-store.ts`)
   - "Reset session" next to the audit log
   - Role switcher, which is a presenter control shown as product UI
4. **Low contrast across secondary text** (ratios calculated from the tokens in `globals.css`; AA for small text is 4.5:1):
   - `ink-500`: 3.49:1 on white, 3.15:1 on canvas, about 120 uses, often at 11–12 px
   - `ink-400`: 2.19:1, about 26 uses, including line numbers and "before" values
   - Sidebar faint text: 3.76:1
   - `healthy` as small text: 4.21:1
5. **Weak focus ring.** The keyboard focus ring is 1.35–1.41:1 against its background, so it is nearly invisible (`--shadow-focus`, `globals.css`). Inputs that set `outline-none` and re-add this same shadow inherit the problem.
6. **Role state contradicts itself.** Opening `/my-day` directly showed a "Viewing as Clinician" banner while the switcher highlighted Leadership with Leadership's sidebar _(observed)_. Role doesn't follow the route.
7. **Dates can land on weekends.** Without a pinned date, every record moves by a day offset. On Friday 6 November _(observed)_: Sarah's supervision on **Sunday 8 Nov**, Hannah's week showing Saturday and Sunday sessions, tasks due on a weekend. `.env.local` pins a Tuesday, which hides this locally. Any deployment without the variable, or pinned to a non-Tuesday, will show it (`src/lib/clock.ts`).
8. **Same page template everywhere.** Most modules repeat five-cell metric strip → chart row → filter bar → table. It looks consistent, but the screens blur together and nothing signals where the demo's main story is. Density was requested, so the fix is hierarchy rather than less data.
9. **Keyboard and screen-reader gaps:**
   - Dialogs set `aria-modal` and handle Escape but don't trap or return focus (`audit-drawer.tsx`, `assistant-panel.tsx`, `assign-follow-up.tsx`)
   - Tables use `role="table"` on CSS grids, mostly without row and cell roles
   - Referral source highlighting needs a mouse hover (`intake-workspace.tsx`)
   - The caseload "Summarise notes" action appears on hover (`client-table.tsx`)
   - No `prefers-reduced-motion` handling anywhere
10. **Uneven states.** Filter empty states are good throughout, and note generation has a proper skeleton. There are no route `loading` or `error` files, so an unexpected render error has no designed fallback. A bad case URL shows a tidy not-found page but keeps the "Case Notes" breadcrumb and returns HTTP 200 _(observed)_.
11. **Small polish issues:**
    - "Clients Requiring Attention" truncates in the sidebar _(observed)_.
    - Blank space sits under the Caseload health table when stretched beside the taller alerts panel _(observed)_.
    - Rules broken against your own design doc: a `Sparkles` icon (`reports-library.tsx`), a repeating gradient for cancelled visits (`schedule-workspace.tsx`), arbitrary values such as `rounded-[5px]`.
    - `docs/design-system.md` still opens with the retired evergreen direction above its revision note.

## 6. Code quality findings (ranked)

**Overall:** the code is disciplined for a demo: strict types, clean lint, no `any`, clear folders and centralised tokens. The risks are process and coupling.

1. **Almost all work is uncommitted.** The last commit is dated 21 October, but the tree has 71 modified, 4 deleted and 64 untracked paths, including Phases 0–3 and the whole AI engine. `origin/main` has one commit. A disk failure or a bad `git clean` could lose it, and CI has never seen it.
2. **No tests.** The hero flow has no regression protection, and the store has many interdependent actions.
3. **Single 927-line store with hard-coded actors.** `src/state/demo-store.ts` holds every domain. Actors and times are constants ("Sarah Thompson", "Neil Hensley", scripted times), which is why audit entries don't reflect the current role.
4. **Screens read static data directly, so nothing derives from state.** This is the technical root of hero Break 6. KPIs would need selectors combining `src/data` with store state.
5. **Hard-coded entities and routes.** `/caseloads/sarah-thompson`, `/supervision/sarah-thompson` and `/progress-reports/emily-carter` are single-record pages, with `/caseloads/hannah-wright` returning 404 _(observed)_. Slugs are built by string replacement (`src/app/my-day/page.tsx`, the supervision page). Component-level names break the repo's own rule.
6. **Overlapping assistant engines.** `src/lib/assistant.ts` (500 lines), `src/lib/knowledge/local.ts` (426) and `tools.ts` (991) answer overlapping questions by different paths, so answers can differ.
7. **String-matched relationships.** Version history filters audit entries by an object label string (`note-extras.tsx`), and form history uses a regex on action text (`forms-workspace.tsx`). Rewording copy would break them quietly.
8. **Duplication.** The metric strip is written inline about 14 times although `MetricBand` exists, and `toLines` or `lines` is defined 3 times.
9. **Large components.** `schedule-workspace.tsx` (600), `assistant-panel.tsx` (463), `analytics-dashboard.tsx` (426), `team-capacity.tsx` (421), `attention-table.tsx` (410).
10. **Font-loader risk needs checking.** The error "next/font/google queries have exactly one entry" appeared on a fresh cache in the temporary copy. Your notes blame this error on a concurrent build. The copy's custom Turbopack root may be the cause, so this isn't proven, but test it on the demo machine. A clean `pnpm build` is also still unverified.
11. **Weak input handling.** In `src/app/api/assistant/route.ts`, `readState` casts unchecked client data, and `aiTools` and `plan` run outside the `try` block, so malformed state could cause an unhandled 500. `use-generate-note.ts` parses JSON without checking the response.
12. **Stale docs and dead code.** `CLAUDE.md` still says "all 9 screens" and lists Ask Medisense and voice as optional. `README.md` lists two API routes where three exist. A demo-environment label is commented out in `sidebar.tsx`.

## 7. AI, security & privacy findings

### AI implementation

| Feature                           | Real or simulated       | Detail                                                                                                                                            |
| --------------------------------- | ----------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------- |
| Case note summariser              | **Real**, with fallback | `src/lib/ai/summarise-note.ts`. An unchanged sample falls back to a prepared draft; an edited note shows an error rather than an unrelated draft. |
| Ask assistant                     | **Real**, with fallback | `src/app/api/assistant/route.ts`. Without a key it answers from local tools, but still shows a "Medisense AI" label _(observed)_.                 |
| Referral extraction               | Simulated               | Hard-coded values                                                                                                                                 |
| Report generation                 | Simulated               | Status change only                                                                                                                                |
| Supervision brief                 | Simulated               | Pre-written                                                                                                                                       |
| Smart form prefill                | Simulated               | Hard-coded values                                                                                                                                 |
| Schedule suggestions, automations | Simulated               | Static data                                                                                                                                       |

- **Prompts:** system prompts are constants, with structured JSON schemas enforced by provider output settings and parsed before use. Provider logic is cleanly separated.
- **Guardrails that work:**
  - The prompt forbids added facts, scores, diagnoses and risk ratings.
  - Empty sections stay empty.
  - Missing information is flagged rather than filled.
  - Draft labels and human Accept are in the UI.
  - Tasks need confirmation.
- **Guardrail gaps:**
  - No check that output is actually supported by the note; the prompt is the only control.
  - Only the first summary sentence is source-linked, although the empty state says each section is "traceable to a line".
  - Missing-info warnings don't block approval (by design, per the code comment).
  - Note text isn't isolated from instructions, so text inside a note could try to steer the model.
- **API keys:** read server-side only from `process.env` (`src/lib/ai/providers.ts`). None reach the browser, and logs mask them.

### Security & privacy

**Most serious: statements in the UI that the code contradicts or can't support.** These matter most because they could be taken as commitments to a health provider.

1. **Dictation privacy.** The UI says "speech is converted in the browser and audio is not stored" (`therapist-notes.tsx`). The Web Speech API in Chrome normally sends audio to the browser vendor's speech service. The code's own error message mentions reaching that service.
2. **Name redaction.** "Remove names and contact details before AI processing" shows **on** (`src/data/settings.ts`), but no redaction code exists. The client name goes straight to the provider in `sample.context` (`src/data/case-note.ts`), and assistant requests send named records.
3. **Unbacked security facts.** "Hosted in Sydney", "MFA required", SSO, AES-256, 7-year retention, 30-minute timeout and "Client data is never used to train AI models" appear as facts (`src/data/settings.ts`). None is implemented in this repo. The demo-environment label is commented out, so nothing tells the viewer they are illustrative. The training claim also depends on each provider's terms, which were not verified.
4. **Fake integration status.** "Connected", "Synced 4 min ago" and "Submitted and synced" have nothing behind them. The portal mock also shows a `family.medisense.com.au` address, which is on what your notes treat as the client's real domain.

**Technical findings:**

5. **No authentication or authorisation** on any page or API route. All three API routes are public with no rate limit, so a public deployment lets anyone spend your AI credits.
6. **Permissions are not enforced.** The matrix only changes display. As Clinician (Hannah, "own caseload only"), the assistant returned Sarah Thompson's workload and client tasks _(observed)_. Leadership is shown as unable to read clinical notes, yet the Overview links Leadership straight to them (`attention-panel.tsx`). The server accepts `role` and all state from the client.
7. **Key status endpoint is public.** `/api/ai/status` returns provider, model and the first 8 and last 4 key characters to any caller, and `?recheck=1` lets anyone trigger provider checks (`src/lib/ai/engine.ts`).
8. **Audit trail isn't an audit trail.** It lives in editable `sessionStorage`, can be reset by a button, and uses scripted times and names. Fine for a demo, but don't describe it as tamper-evident.
9. **Session storage.** Typed or dictated notes sit in plain `sessionStorage`. Acceptable with fictional data only. **No real client data should enter this build**, including through a live AI provider.

**Clean results:**

- No hard-coded secrets found by pattern search in `src`, `docs`, `README.md`, `CLAUDE.md` or `.env.example`.
- `.env*` files are git-ignored apart from `.env.example`.
- Git history search found no `sk-ant` string and no commits of `.env` or `.env.local`.
- The actual key values from `.env.local` were not found in `.next` or `.netlify`. Those folders do contain the string pattern `sk-ant-`; since no real value matched, these appear to be SDK strings.
- All names and details appear synthetic.

## 8. Recommended next build list (by demo impact for Neil)

Effort: **S** up to about a day, **M** 2–4 days, **L** a week or more. Rough estimates for one developer.

| Order | Item                                                                                                                             | Why it matters for Neil                                  | Effort |
| ----- | -------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------- | ------ |
| 0     | Commit and push current work; run `pnpm build` safely                                                                            | Protects everything else                                 | S      |
| 1     | Settle names, then build the Sarah → Oliver session path: a therapist view, session entry and blank note ready to dictate        | Makes the story start correctly                          | M      |
| 2     | One approval event: approve creates a report draft, a prefilled form and proposed tasks, shown as a "what's been prepared" panel | The product's core promise: enter once, reuse everywhere | M      |
| 3     | Live dashboard: derive KPIs and badges from the store, add a before/after view                                                   | The payoff of the whole demo                             | M      |
| 4     | Admin queue view, correct owner routing on the live path, fix due dates, add an "advance time" control for reminder → escalation | Makes automation visible rather than claimed             | M      |
| 5     | Supervision brief reacts to approved notes and tasks; optionally generated live                                                  | Removes a visible contradiction and adds real AI         | M      |
| 6     | Remove or correct false claims: dictation, redaction, security facts, integrations; add a discreet illustrative label            | Protects credibility with a health-sector buyer          | S      |
| 7     | Wire or remove dead controls, starting with hero-path ones and Export PDF                                                        | Avoids dead clicks live                                  | S–M    |
| 8     | Hide developer details behind a presenter mode                                                                                   | Your stated enterprise-UI rule                           | S      |
| 9     | Protect approved notes from regeneration; make Subjective editable; review the SOAP mapping with a clinician                     | Clinically credible, safer                               | S      |
| 10    | Role consistency: role follows route, assistant filters by role, approvals respect role, simple demo sign-in with a Client role  | Makes "permissions" demonstrable                         | M      |
| 11    | Real referral extraction from pasted or uploaded text, using the existing engine                                                 | A strong second "wow" moment                             | M      |
| 12    | Live report generation from approved notes, with PDF/Word export                                                                 | Directly reduces the pain Neil cares about               | M–L    |
| 13    | Accessibility pass: text colours, focus ring, dialogs                                                                            | Quick token fixes with broad effect                      | S–M    |
| 14    | Responsive shell and a phone-first therapist flow (My Day, dictation, approve)                                                   | Fits home-visit work; strong if shown on a phone         | L      |
| 15    | Portal: Client role, forms, uploads, admin FAQ assistant                                                                         | Completes scope item 15                                  | M      |
| 16    | Hero-flow browser test; pin dates to working days                                                                                | Stops demo-day regressions                               | S–M    |
| 17    | Expansion modules as a light "roadmap" screen rather than built features                                                         | Shows vision without diluting the pitch                  | S      |

A real backend, auth and database would be **L+** and aren't needed for the pitch unless you decide otherwise (question 4).

## 9. Open questions for me

1. **Product name:** your brief says CareFlow AI and "Ask CareFlow". The code contains no "CareFlow" at all, and earlier project notes say the name stays "Medisense Clinical Operations & Supervision Intelligence Platform" and CareFlow is not used. Which is right now?
2. **Client names:** should the hero client be renamed Oliver James, or is the existing Oliver Grant fine? Renaming touches the dataset and its docs.
3. **Agreed facts vs this brief:** the repo treats these as fixed and agreed with the client: 12 clinicians in OT and Speech Pathology only, NDIS and aged care only, and the "At Risk" wording. The brief adds physio, psychology, exercise physiology and rehab, and says "overloaded". Does the brief replace those decisions?
4. **Frontend or real backend:** earlier direction was frontend-only with minimal API routes. Does this audit change that?
5. **Roles:** should Leadership become "Supervisor/Director" and Clinician become "Therapist"? Should the Therapist demo user be Sarah rather than Hannah?
6. **Demo device:** will Neil see this on a laptop only, or do you want to show a phone? This decides whether item 14 comes early.
7. **Live AI provider:** only a Groq key is set locally, while docs assume Claude. Which provider should the demo use, and do you want live AI on the hero path or prepared drafts for safety?
8. **Security claims:** which statements on the Security screen are real commitments? Anything that isn't should be reworded as proposed.
9. **Neil and Medisense:** `CLAUDE.md` calls Neil "Director of Clinical Services" at a "fictional" Medisense; your brief calls him Director of a real Brisbane provider. Which should the docs use, and is a `family.medisense.com.au` mock acceptable?
10. **Expansion scope:** should items 20–24 stay as a roadmap, or do you want demo screens for them?
11. **Older six-step story:** does the Team Capacity rebalancing ending stay as part of the demo, or does the new hero flow replace it?
