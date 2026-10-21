# Medisense — Clinical Operations & Supervision Dashboard

Product demo for allied health leadership: caseload visibility, clinical supervision preparation, AI-assisted documentation and team capacity balancing. All data is synthetic.

## Getting started

Requires Node 22 and pnpm 10 (`corepack enable` installs the pinned pnpm version).

```bash
pnpm install
pnpm dev
```

Open http://localhost:3000. The demo is designed for a 1440 × 900 desktop window.

## Screens

| Route                            | Screen                               |
| -------------------------------- | ------------------------------------ |
| `/`                              | Leadership overview                  |
| `/caseloads/sarah-thompson`      | Clinician caseload detail            |
| `/case-notes/mia-robinson`       | AI case note summariser              |
| `/clients-requiring-attention`   | Clients requiring attention          |
| `/supervision/sarah-thompson`    | Supervision dashboard                |
| `/team-capacity`                 | Team capacity and caseload balancing |
| `/admin-insights`                | Admin reduction and AI opportunities |
| `/progress-reports/emily-carter` | AI progress report generator         |
| `/my-day`                        | Clinician home                       |

## Demo walkthrough

1. **Overview** — Sarah Thompson leads the caseload health table at 108% of capacity. Open her row.
2. **Caseload** — the score breakdown explains the pressure. Use _AI draft awaiting review_ on Mia Robinson.
3. **Case note** — _Generate structured summary_, then _Edit_ or _Accept_. Continue to clients requiring attention.
4. **Clients requiring attention** — _Assign follow-up_ on James Thompson, then _Prepare Sarah’s supervision_.
5. **Supervision** — review the suggested agenda, remove an item, _Approve agenda_.
6. **Team capacity** — the suggestion to rebalance towards Emma is reviewed, never applied automatically.
7. **Overview** — finish on the pilot impact band.

Every approval, edit and assignment is written to the audit trail (clock icon in the top bar). Demo progress persists for the browser tab; use _Reset demo_ in the audit trail to start again.

## Scripts

| Command       | Purpose                           |
| ------------- | --------------------------------- |
| `pnpm dev`    | Start the development server      |
| `pnpm build`  | Production build                  |
| `pnpm start`  | Serve the production build        |
| `pnpm check`  | Lint, type-check and format check |
| `pnpm format` | Format all files                  |

## Deployment

The app is fully static and deploys to Vercel or Netlify with default Next.js settings: build command `pnpm build`, Node 22.

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
