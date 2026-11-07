# Medisense — Clinical Operations & Supervision Dashboard

**Medisense Clinical Operations & Supervision Intelligence Platform.** A product demo for allied health leadership: reduce clinician admin, protect sustainable caseloads, strengthen supervision and surface clients or clinicians needing attention, without replacing clinical judgement. All data is synthetic (12 clinicians, 184 NDIS and aged care clients).

## Getting started

Requires Node 22 and pnpm 10 (`corepack enable` installs the pinned pnpm version).

```bash
pnpm install
pnpm dev
```

Open http://localhost:3000. The demo is designed for a 1440 × 900 desktop window.

## Screens

| Route                             | Screen                               |
| --------------------------------- | ------------------------------------ |
| `/`                               | Leadership overview                  |
| `/caseloads/sarah-thompson`       | Clinician caseload detail            |
| `/case-notes/[caseId]`            | AI case notes: 5 cases, voice, SOAP  |
| `/clients-requiring-attention`    | Clients requiring attention          |
| `/supervision/sarah-thompson`     | Supervision dashboard                |
| `/team-capacity`                  | Team capacity and caseload balancing |
| `/admin-insights`                 | Admin reduction and AI opportunities |
| `/progress-reports/emily-carter`  | AI progress report generator         |
| `/my-day`                         | Sarah's day, in visit order          |
| `/sessions/oliver-grant`          | AI session note: dictate and approve |
| `/sessions/oliver-grant/prepared` | What AI prepared from the note       |
| `/admin-queue`                    | Admin work queue and exceptions      |
| `/since-yesterday`                | What rules did overnight             |
| `/before-after`                   | What changed, why, and audit links   |
| `/roadmap`                        | Future modules, all planned          |
| `/intake`                         | Referrals and AI intake extraction   |
| `/forms`                          | Smart forms pre-filled from records  |
| `/tasks`                          | Tasks, follow-ups and escalations    |
| `/clients`                        | Client directory with filters        |
| `/clients/[clientId]`             | Client profile, goals and funding    |
| `/schedule`                       | Team week, team day, AI suggestions  |
| `/reports`                        | Reports library and AI drafts        |
| `/admin-operations`               | Admin queues, expiries, compliance   |
| `/automations`                    | Automation rules and rule builder    |
| `/analytics`                      | Outcomes, sessions and access trends |
| `/portal`                         | Family portal preview (Emily Carter) |
| `/settings`                       | Roles, AI guardrails, integrations   |

## Demo walkthrough (10 minutes, six steps)

1. **Leadership dashboard** — KPIs, trend cards and caseload health show who needs attention. Try the Site, Discipline and Trend period filters; every number and chart follows them. Open Sarah Thompson (At Risk, 83).
2. **Sarah’s caseload** — the score breakdown explains why: complexity, admin backlog and follow-ups, not just client count. Open _AI draft awaiting review_ on Mia Robinson.
3. **Case note** — paste or edit the note, _Generate structured summary_, then _Edit_ or _Accept_. Clinician approval is always required.
4. **Clients requiring attention** — click a chart bar to filter the queue; _Assign follow-up_ on James Thompson (owner, due date, reason), then _Prepare Sarah’s supervision_.
5. **Supervision** — review the five-heading brief, remove an item, _Approve brief_. Protected time and development goals sit beside it.
6. **Team capacity** — the suggestion to review rebalancing towards Emma, with continuity of care. _Preview scenario_ shows the effect; nothing is ever reassigned automatically.

Every approval, edit and assignment is written to the audit trail (clock icon in the top bar). Demo progress persists for the browser tab; use _Reset demo_ in the audit trail to start again.

## The connected story

Press **Ctrl + Shift + .** for the presenter panel, which switches roles, advances the day, shows AI status and resets the demo.

1. **Neil:** the Overview flags Sarah as At Risk. Open her caseload to see why.
2. **Sarah:** in My Day, choose **Write note with AI**, dictate or use the sample, then **Write note with AI**. Edit a line and **Approve note**.
3. **What AI prepared:** review the report and form, and **Confirm task** for the admin team.
4. **Jo:** the task is in the work queue, along with a failed form sync to retry.
5. **Presenter:** **Advance 1 day**. A reminder fires and Isla Murphy's call-back escalates to Grace.
6. **Grace:** the AI supervision brief has updated. **Approve brief**.
7. **Neil:** the numbers have changed. Open **See before and after**.

## Client intake to first visit

Anyone can add a client from **+ New** in the top bar, from **Clients**, or from the **Clients** tab in the Staff app.

1. **AI referrals:** click **New referral**, then **Use sample referral** and **Read referral with AI**. Check the extracted details against the source lines.
2. Click **Verify & create client**, correct anything in the form, then create the client.
3. Click **Book first visit**. Double-booking is blocked, and the next free time is offered.
4. On **Schedule** or the client's page, open the visit and click **Mark session complete**. A note task goes to the clinician.

## Family portal

Open **Family Portal**, then **Open family sign-in** (or go to `/family`), and use **Use demo family details**. This is a demo gate, not real authentication.

## Moving around

Use the sidebar for screens, and the name in the top bar to switch between the Director, Therapist, Admin and Supervisor workspaces. On a phone, **More** lists every screen.

## Roadmap screens

These work in the browser on sample data; nothing connects to a live outside system yet.

- **Staff app** (`/mobile/staff`): today, schedule, clients (add, edit, book), tasks and AI notes with dictation. Offline mode is simulated.
- **Family app** (`/mobile/family`): visits, change requests, home practice, progress, messages and documents.
- **Telehealth** (`/telehealth`): the visit room with client details, chat, a real local camera preview and an AI note. There's no video link to the client yet.
- **Billing and claims** (`/billing`): claim lines from completed sessions, held back until the note is approved. Rates are sample values, and nothing is sent.
- **Hospital operations** (`/hospital`) and **ERP** (`/erp`): sample records with working decisions.

## Live AI (any of four providers)

AI runs through server routes, so keys never reach the browser. Set **one** key in `.env.local` (copy `.env.example`):

| Provider                  | Variable                               | Default model         |
| ------------------------- | -------------------------------------- | --------------------- |
| Claude (Anthropic)        | `ANTHROPIC_API_KEY`                    | `claude-opus-5-5`     |
| OpenAI                    | `OPENAI_API_KEY`                       | `gpt-5`               |
| Google AI Studio (Gemini) | `GEMINI_API_KEY` (or `GOOGLE_API_KEY`) | `gemini-2.5-pro`      |
| Groq                      | `GROQ_API_KEY`                         | `openai/gpt-oss-120b` |

With several keys set, the first in this order is used; set `AI_PROVIDER` (`anthropic`, `openai`, `google`, `groq`) to choose, and `AI_MODEL` to override the model. Claude uses the official SDK; OpenAI, Gemini and Groq share one OpenAI-compatible client (`src/lib/ai/openai-compatible.ts`), so no extra packages are needed.

1. Restart `pnpm dev`. The server log reports the key on start-up, e.g. `[medisense-ai] OpenAI key sk-proj-…abcd is VALID (…ms). Live AI is on with gpt-5.`, or `… is INVALID: Key rejected (401)`, or `No AI key found…`.
2. The case note screen shows the provider and model (the refresh icon re-checks). `GET /api/ai/status?recheck=1` returns it as JSON.

Without a working key, the unchanged sample note returns the prepared draft with a notice, so the demo never stalls. An edited note shows an error instead of an unrelated draft. Errors name the cause (key rejected, no credits or quota, model not found, rate limited); note content and full keys are never logged.

## Ask Medisense (assistant)

The top-bar assistant answers free-form questions about the demo records, MCP-style: 15 read-only tools in `src/lib/knowledge/tools.ts` (`get_client`, `get_clinician`, `list_clients`, `list_tasks`, `get_schedule`, `list_reports`, `list_compliance`, `get_audit_trail`, `search_records` and more) read the static data in `src/data` plus the presenter's actions from the browser store.

- **Fewest calls first.** Greetings and thanks answer instantly (no call); a repeated question is served from a per-tab cache until any demo action changes the records. Otherwise the router in `src/lib/knowledge/local.ts` plans which tools fit (names, filters, topic, or three tools for open "what should I worry about" questions).
- **With a provider key**, `POST /api/assistant` runs the planned tools on the server and sends the model **one** request with the records ("records-first"). Only questions the router cannot place fall back to a tool loop where the model picks tools itself. Answers use a fixed JSON shape with links to the screen to act on; the drawer shows a neutral "From Medisense records" label; hovering it reveals the provider, model, number of calls and tools used, for the presenter only.
- **Search** (`search_records`) ranks every record BM25-style: rare words weigh more, matches in a name count double, and synonyms and one-letter typos still match.
- **Without a key, or when the provider fails** (for example a free-tier rate limit), `src/lib/knowledge/local.ts` spots names, filters and the topic in the question and runs the same tools in the browser.
- Answers come only from Medisense's own records; nothing is fetched from the web. In production the tools would read the practice management system instead of `src/data`.

## Scripts

| Command       | Purpose                           |
| ------------- | --------------------------------- |
| `pnpm dev`    | Start the development server      |
| `pnpm build`  | Production build                  |
| `pnpm start`  | Serve the production build        |
| `pnpm check`  | Lint, type-check and format check |
| `pnpm format` | Format all files                  |

## Deployment

Pages are static; two API routes (`/api/ai/status`, `/api/case-notes/summarise`) run as server functions. Deploy to Vercel with default Next.js settings (build command `pnpm build`, Node 22) and add one provider key (see Live AI) to the project’s environment variables.

## Project structure

```
src/
  app/          routes, one folder per screen
  components/   shared UI, charts, app shell and AI provenance components
  features/     screen-specific components
  data/         typed synthetic dataset (single source of truth)
  state/        demo session state and audit trail
  lib/          navigation and helpers
docs/           design system, dataset and screen specifications
```

## Documentation

- [Design system](docs/design-system.md): tokens, typography, components and rules
- [Demo dataset](docs/demo-dataset.md): the synthetic data every screen uses
- [Screen specifications](docs/screen-specs.md): layout and content for each screen
- [Engineering standards](CONTRIBUTING.md)
