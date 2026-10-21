# Medisense — Design System

### Direction: Warm Clinical Editorial

> One-line north star: **"A calm, well-edited clinical journal that happens to be live software."**
> Quiet confidence. Paper, ink, and one evergreen accent. Data is set like typography, not decorated.

---

## 1. Principles

1. **Editorial hierarchy over decoration.** Serif headlines and large numerals carry the page. No icon blobs, no gradients, no illustration.
2. **Calm by default, colour only for meaning.** 90% of every screen is paper and ink. Colour appears only for status, the primary action, and AI provenance.
3. **Explain, don't alarm.** Pressure is shown as a reasoned breakdown ("why"), never a red siren. Clay (our "danger") is muted and used sparingly.
4. **Human in the loop is visible.** Every AI output looks like a _draft on paper_ until a clinician signs it off.
5. **Density with breathing room.** Tables are compact and precise; the page around them is generous.

### Banned (these make a UI look AI-generated)

- Gradients of any kind, glassmorphism, glow, neon, purple/indigo "AI" colour.
- Sparkle ✨ / magic-wand / robot icons. Emoji anywhere.
- KPI cards with large coloured circular icon backgrounds.
- Drop shadows on resting cards. Over-rounded corners (> 14px).
- Rainbow status colours, saturated reds/greens.
- Lorem ipsum, "John Doe", round fake numbers (e.g. 100, 50%) — use the dataset.
- Centred hero layouts, giant welcome banners, stock photos, avatars with cartoon faces.
- Chatbot-bubble UI for the AI features.

---

## 2. Colour tokens

### Neutrals (warm paper & ink)

| Token              | Hex       | Use                                  |
| ------------------ | --------- | ------------------------------------ |
| `--canvas`         | `#F5F1EA` | App background (warm paper)          |
| `--sidebar`        | `#EFEAE1` | Sidebar background                   |
| `--surface`        | `#FCFAF6` | Cards, tables                        |
| `--surface-raised` | `#FFFFFF` | Popovers, modals, drawers            |
| `--surface-sunken` | `#EEE9E0` | Table header row, wells, input fills |
| `--border`         | `#E2DBCF` | Default 1px hairlines                |
| `--border-strong`  | `#CFC6B7` | Inputs, dividers that need weight    |
| `--ink-900`        | `#1E1C19` | Primary text, headlines              |
| `--ink-700`        | `#4A453E` | Secondary text                       |
| `--ink-500`        | `#7A7368` | Tertiary text, labels, axis text     |
| `--ink-400`        | `#A39C90` | Placeholder, disabled                |

### Accent — Evergreen (the only brand colour)

| Token              | Hex                   | Use                                                  |
| ------------------ | --------------------- | ---------------------------------------------------- |
| `--accent`         | `#2E5A4C`             | Primary buttons, active nav, links, key chart series |
| `--accent-hover`   | `#244A3E`             | Hover                                                |
| `--accent-pressed` | `#1C3B31`             | Pressed                                              |
| `--accent-tint`    | `#E3ECE6`             | Selected rows, active nav background                 |
| `--focus-ring`     | `rgba(46,90,76,0.28)` | 3px focus ring                                       |

### Status semantics (muted, never saturated)

| Status                   | Text      | Background | Dot / bar |
| ------------------------ | --------- | ---------- | --------- |
| **Healthy**              | `#3D6E4F` | `#E5EFE6`  | `#5A8F6A` |
| **Monitor**              | `#8A5A12` | `#F5E9D2`  | `#C08A2E` |
| **Over Capacity**        | `#9C3B26` | `#F4E0D8`  | `#C0563C` |
| **Available** (capacity) | `#3E5670` | `#E3E9EF`  | `#6E8296` |

Priority for client attention reuses these: **High** = Over-Capacity clay, **Medium** = Monitor ochre, **Low** = neutral (`--ink-700` on `--surface-sunken`).

### AI provenance — "Draft paper"

| Token             | Hex       | Use                                          |
| ----------------- | --------- | -------------------------------------------- |
| `--draft-surface` | `#F8F3E6` | Background of any AI-generated content block |
| `--draft-rule`    | `#C9B98F` | 2px left rule on AI blocks                   |
| `--brass`         | `#9C8452` | AI provenance label text & pen-nib icon      |

AI content is never coloured like a chatbot. It looks like **a typed draft on parchment, awaiting signature.**

### Data visualisation palette (in order)

`#2E5A4C` evergreen · `#8FAE9C` sage · `#CDBF9F` sand · `#6E8296` slate · `#A39C90` stone · `#C0563C` clay (**only** for threshold breach / over-capacity).
Threshold & target lines: 1px dashed `--ink-500`. Gridlines: 1px `--border`, horizontal only.

---

## 3. Typography

| Role                              | Font                                          | Notes                                  |
| --------------------------------- | --------------------------------------------- | -------------------------------------- |
| Display / headings / big numerals | **Newsreader** (Google Fonts, optical sizing) | Editorial, warm, clinical-journal feel |
| UI / body / tables                | **Instrument Sans** (Google Fonts)            | Crisp, slightly humanist               |
| IDs, timestamps in audit trail    | **IBM Plex Mono**                             | Small sizes only                       |

All figures in tables and KPIs use `font-variant-numeric: tabular-nums`.

### Scale

| Token         | Font            | Size / line-height | Weight                           | Use                             |
| ------------- | --------------- | ------------------ | -------------------------------- | ------------------------------- |
| `display`     | Newsreader      | 34 / 40            | 500                              | Page title on Leadership & Home |
| `h1`          | Newsreader      | 28 / 34            | 500                              | Page titles                     |
| `h2`          | Newsreader      | 20 / 28            | 500                              | Card / section titles           |
| `kpi`         | Newsreader      | 36 / 40            | 400                              | KPI numerals                    |
| `h3`          | Instrument Sans | 15 / 22            | 600                              | Sub-sections, table titles      |
| `body`        | Instrument Sans | 14 / 21            | 400                              | Default                         |
| `body-strong` | Instrument Sans | 14 / 21            | 600                              | Names in tables                 |
| `small`       | Instrument Sans | 13 / 19            | 400                              | Table cells, meta               |
| `caption`     | Instrument Sans | 12 / 16            | 500                              | Helper text, axis labels        |
| `eyebrow`     | Instrument Sans | 11 / 14            | 600, uppercase, +0.08em tracking | Section labels above titles     |

Headline letter-spacing: −0.01em. Never bold the serif above 600.

---

## 4. Space, shape, elevation

- **Spacing scale (4px base):** 4, 8, 12, 16, 20, 24, 32, 40, 56, 72.
- **Radius:** tags 4 · buttons/inputs 6 · cards 10 · modals/drawers 14.
- **Borders:** 1px `--border` everywhere. Cards are defined by hairlines, not shadows.
- **Elevation:** resting = none. Popover/drawer = `0 1px 2px rgba(30,28,25,.06), 0 12px 32px rgba(30,28,25,.10)`.
- **Motion:** 160ms ease-out for hovers, 220ms for drawers. No bounces, no number count-up animations.

---

## 5. Layout & app shell

- **Target:** desktop 1440 × 900 (screen-shared demo). Light mode only.
- **Sidebar** 248px, `--sidebar` background, right hairline.
  - Top: wordmark **Medisense** (Newsreader 20, ink-900) + small caption _"Clinical Operations"_.
  - Organisation switcher below: **Kestrel Allied Health** · _Melbourne (2 sites)_.
  - Nav groups (eyebrow labels):
    - **Organisation** — Overview · Team Capacity · Clients Requiring Attention
    - **Clinical** — Caseloads · Supervision · My Day
    - **AI Workspace** — Case Notes · Progress Reports · Admin Insights
  - Active item: `--accent-tint` background, `--accent` text, 2px evergreen left rule.
  - Bottom: user card — _Neil Hensley · Director of Clinical Services_, initials avatar "NH" on sand background.
- **Top bar** 64px, transparent over canvas, bottom hairline:
  - Left: breadcrumb (e.g. _Organisation / Overview_).
  - Right: **Role view** segmented control (Leadership · Supervisor · Clinician), global search (⌘K), audit trail icon button, date _"Tuesday 20 October 2026"_.
- **Content:** max-width 1280, 40px horizontal padding, 32px top. 12-column grid, 24px gutters.
- **Page header pattern:** eyebrow → serif title → one-line description in ink-700 → actions right-aligned. Thin hairline beneath, then content.

---

## 6. Components

**Buttons**

- Primary: evergreen fill, white text, 36px height, 6 radius.
- Secondary: surface fill, `--border-strong` border, ink-900 text.
- Tertiary/ghost: text only, evergreen, underline on hover.
- Destructive is not used in this demo.

**Status tag** — 22px high, 4 radius, 8px dot + label, status colours from §2. Labels exactly: _Healthy_, _Monitor_, _Over Capacity_, _Available_.

**KPI tile** — surface card, eyebrow label, Newsreader 36 numeral, one caption line with a _quiet_ delta (e.g. "↑ 2 vs last week" in ink-500; clay only if it's a bad trend). Optional 32px sparkline in sage. **No icons.**

**Tables** — header row `--surface-sunken`, eyebrow-style column labels; rows 48px, 1px hairlines; hover `--canvas`; numbers right-aligned tabular; first column bold name + small meta line beneath (e.g. age / service).

**Capacity meter** — 6px tall bar, `--surface-sunken` track; fill evergreen to 100%, the portion beyond 100% in clay; 1px dashed marker at 100% capacity.

**Score breakdown** — horizontal stacked list: factor name · contribution bar · "17 / 20". Total in Newsreader.

**AI Draft block** (critical, used on every AI screen)

- `--draft-surface` background, 2px `--draft-rule` left rule, 10 radius.
- Header row: pen-nib icon + **"AI Generated Draft — Clinician Review Required"** in brass caption; right side: _Generated 20 Oct 2026, 10:42 · from 1 approved source_.
- Body set in Instrument Sans 14/22, section headings in Newsreader 16.
- Footer action bar: **Accept** (primary) · **Edit** (secondary) · **Regenerate** (ghost) · "View sources" link.
- After Accept: block switches to normal surface, label becomes "Approved by Sarah Thompson · 20 Oct 2026, 10:46", and an audit entry is written.

**Recommendation callout** (non-clinical AI suggestions) — surface card, brass "Suggestion" eyebrow, text, and a mandatory footnote: _"Recommendation only. Requires leadership review — no changes are made automatically."_

**Audit trail drawer** — right drawer 420px; vertical timeline; each entry: Plex Mono timestamp, actor, action, object (e.g. _"10:46 · Sarah Thompson · Approved AI summary · Mia Robinson, session 13 Oct"_).

**Empty / safe-language rule** — operational flags always carry: _"Requires review based on configured operational indicators."_ Never "at risk of harm", "deteriorating", "diagnosis".

---

## 7. Icons

Lucide, 1.5px stroke, 16px (20px in nav), `--ink-500` default. AI provenance uses a **pen-nib** icon only (no sparkles).

## 8. Charts

- Line charts: 2px evergreen line, no area fill (or 8% evergreen fill max), dots only on last point with a label.
- Bars: 4px radius top only, evergreen; comparisons in sand.
- Donut (admin breakdown): 14px thick ring, palette order from §2, labels outside with leader lines or a legend table beside it.
- Always label the last value directly; avoid legends when a direct label works.
