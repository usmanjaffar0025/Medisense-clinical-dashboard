# Medisense — Screen Specifications (9 screens)

All screens use the shell, tokens and components in `design-system.md` and the exact data in `demo-dataset.md`. Canvas 1440 × 900, light mode. Grid: 12 columns, 24px gutters, content max 1280.

Screen order follows the demo story:
1 Leadership Overview → 2 Sarah's Caseload → 3 Case Note Summariser → 4 Clients Requiring Attention → 5 Supervision → 6 Team Capacity → 7 Admin Insights → 8 Progress Report Generator → 9 My Day (Clinician Home).

---

## Screen 1 — Leadership Overview

**Nav:** Organisation / Overview · **Role:** Leadership
**Job:** In 5 seconds, Neil sees where the pressure is, and that Sarah needs attention.

**Page header**

- Eyebrow: `TUESDAY 20 OCTOBER 2026`
- Display title (Newsreader): **"Good morning, Neil."**
- Sub: _"Kestrel Allied Health · 10 clinicians · 201 active clients. One clinician is above configured capacity."_
- Actions: `Weekly summary` (secondary), `Export` (ghost).

**Row 1: KPI strip.** 8 KPI tiles in 2 rows of 4 (cols 3/12 each). Values and captions from Dataset §1. Highlight only _Clinicians Near Capacity_ and _Clients Requiring Attention_ with a 2px top rule in ochre. No icons.

**Row 2 (8 cols): "Caseload Health" table, the hero of the page.**

- Title (h2 serif): _Caseload Health_. Sub: _"Scored from configured operational indicators: capacity, complexity, documentation, follow-ups, supervision and admin load."_
- Columns: Clinician (name + role), Active / Capacity, Capacity meter, Complexity, Notes overdue, Follow-ups, Supervision, Score, Status tag.
- Sorted by score descending, so **Sarah Thompson is row 1** with an `--accent-tint`-free but subtle clay-tinted left rule. Row click goes to Screen 2.
- Filter chips above: All (10) · Over Capacity (1) · Monitor (2) · Healthy (7).

**Row 2 (4 cols): "Needs your attention" panel.**

- 3 stacked items:
  1. **Sarah Thompson is above configured capacity.** 27 of 25 · 6 high-complexity · 4 notes overdue → link _Review caseload_.
  2. **14 clients require review.** 2 high priority → link _Open list_.
  3. **5 supervision sessions in the next 14 days.** Next: Sarah Thompson, Thu 2:00 pm → link _Prepare_.
- Footer caption: _"Operational indicators only. Not clinical risk assessments."_

**Row 3 (12 cols): "Since Medisense pilot began" impact band** (Dataset §11).

- 5 compact figures in a row, each with before → now and change. Newsreader numerals. Caption: _"Illustrative pilot outcomes · demo data"_.

---

## Screen 2 — Clinician Caseload Detail (Sarah Thompson)

**Nav:** Clinical / Caseloads / Sarah Thompson
**Job:** Explain _why_ Sarah is under pressure. It isn't just "27 clients".

**Header**

- Breadcrumb: Caseloads / Sarah Thompson.
- Left: initials avatar "ST" (sand bg) · h1 **Sarah Thompson** · _Occupational Therapist · Richmond · 1.0 FTE · Supervisor: Grace Liu_.
- Right: Status tag **Over Capacity** + score "83" in Newsreader 28 · buttons `Prepare supervision` (primary), `View in Team Capacity` (secondary).

**Row 1: Metrics strip (12 cols).** 8 compact metric cells in a single hairline-divided band (not separate cards): Active clients 27 · Recommended capacity 25 · High-complexity 6 · Notes overdue 4 · Follow-ups due 5 · Supervision due _2 days_ · Clinical hrs/wk 29 · Admin hrs/wk 9 (_target 7_, ochre).

**Row 2 left (5 cols): "Why this score"** score breakdown card (Dataset §3, Sarah column): six factor rows with contribution bars, total 83 / 100, threshold legend (Healthy < 60 · Monitor 60–79 · Over Capacity ≥ 80), footnote on operational indicators.

**Row 2 right (7 cols): "Workload, last 6 weeks"** line chart: weighted caseload (evergreen) with capacity line (dashed) at 25 clients ≈ 37.5 units, and admin hours as a small secondary bar chart below with a 7h target line. Direct label "+18%" on the last point.

**Row 3 (12 cols): Client list table.** All 27 rows (scrollable, first ~10 visible) with columns: Client (name + age), Service, Last Session, Next Appointment, Complexity (tag-less text with small dot: High clay-dot, Medium ochre-dot, Low stone-dot), Documentation Status, Attention Status.

- Filter chips: All 27 · Requires review 4 · Notes overdue 4 · Follow-ups 5 · High complexity 6.
- "Not booked" / "Paused" shown in ink-500 italic.
- Row action on hover: `Open` and, for Mia Robinson, `Summarise notes` (goes to Screen 3).

---

## Screen 3 — AI Case Note Summariser

**Nav:** AI Workspace / Case Notes · **Context:** Mia Robinson · session 13 Oct · Sarah Thompson
**Job:** Show admin reduction with the clinician staying fully responsible.

**Header:** eyebrow `CASE NOTE · SESSION 13 OCT 2026` · h1 **Mia Robinson** · meta _7 yrs · Paediatric OT · Daily routines · 50 min, in clinic, parent present_ · right: _Clinician: Sarah Thompson_.

**Body: two columns.**

- **Left (5 cols): "Therapist notes".** Monospace-feeling but in Instrument Sans: plain surface card, the 7 raw lines exactly as written, with caption _"Entered by Sarah Thompson · 13 Oct, 4:12 pm · Unstructured"_. Button below: `Generate structured summary` (primary). Above the button, a muted line: _"Uses only this note. Nothing is saved until you approve."_
- **Right (7 cols): AI Draft block** (component spec in design system):
  - Label: **AI Generated Draft — Clinician Review Required** (brass, pen-nib icon).
  - Meta: _Generated 20 Oct 2026, 10:42 · Source: 1 session note_.
  - Sections in Newsreader 16: **Session Summary**, **Interventions**, **Next Actions** (copy exactly from Dataset §5; Interventions and Next Actions as bulleted lists).
  - Hover on a sentence highlights the source line(s) on the left (show one highlighted pairing in the mock: "Difficulty transitioning from breakfast…" ↔ summary sentence).
  - Action bar: **Accept** · **Edit** · **Regenerate** · _View sources_.
  - Small caption right of actions: _"Est. 8 minutes saved"_.

**States to design (side-by-side or as variants):**

1. Before generation (right column empty-state: paper texture-free, ink-500 text _"The structured draft will appear here for your review."_).
2. Draft generated (default).
3. Edit mode: text becomes editable fields, `Save changes` / `Cancel`.
4. Approved: block turns to normal surface, label _"Approved by Sarah Thompson · 20 Oct 2026, 10:46"_ with a check, and _"Added to clinical record · Audit entry created"_.

---

## Screen 4 — Clients Requiring Attention

**Nav:** Organisation / Clients Requiring Attention
**Job:** Spot clients falling through operational gaps, and act.

**Header:** h1 **Clients requiring attention** · sub _"Requires review based on configured operational indicators."_ · right: `Configure indicators` (ghost).

**Row 1: summary band.** 14 clients · 2 High · 7 Medium · 5 Low · _Most common reason: follow-up overdue (5)_.

**Row 2: filters.** Priority, Clinician, Reason type (No recent appointment · Follow-up overdue · Documentation · Funding/goal review · Cancellations), search.

**Row 3: table (Dataset §6, 14 rows).** Columns: Client, Clinician, Priority (tag), Operational reason (full sentence, wraps to 2 lines max), Days since contact (tabular), Action.

- Action column: `Assign follow-up` secondary button on each row.
- James Thompson row shows the **Assign Follow-up popover open**: fields _Assign to_ (Sarah Thompson, pre-filled), _Due_ (Thu 22 Oct), _Note_ (prefilled: "Contact family to rebook; review appointment frequency"), buttons `Assign` / `Cancel`. Footer: _"Logged to audit trail."_

**Footer note:** _"These indicators are operational (scheduling, documentation, funding). They are not clinical risk assessments."_

---

## Screen 5 — Supervision Dashboard (Sarah Thompson)

**Nav:** Clinical / Supervision / Sarah Thompson · **Role:** Supervisor (Grace Liu)
**Job:** Supervision that's structured, evidence-informed and prepared in seconds.

**Header:** eyebrow `SUPERVISION · NEXT SESSION IN 2 DAYS` · h1 **Sarah Thompson** · sub _Thu 22 Oct 2026, 2:00 pm · 60 min · Richmond, Room 3 · with Grace Liu_. Actions: `Start session notes` (primary), `Share agenda with Sarah` (secondary).

**Row 1: facts band.** Last supervision Thu 24 Sep · Next Thu 22 Oct · Frequency Every 4 weeks · Cases flagged 4 · Open actions 2 of 4 · Development goals 2.

**Row 2 left (7 cols): "Suggested discussion items"** as an **AI Draft block** with the label variant _"AI Suggested Agenda — Supervisor Review Required"_. 5 numbered items (Dataset §7) set in Newsreader numerals; each item has a small evidence link (e.g. _"View trend"_, _"View 4 notes"_) and controls `Include` (checkbox, default on) / `Remove`. Footer: `Add item` · `Regenerate`.

**Row 2 right (5 cols):**

- **Workload trend** mini chart (weighted caseload 6 weeks, +18%) with admin-hours mini bars.
- **Cases flagged for discussion:** 4 rows (James Thompson, Daniel Lee, Oliver Grant, Ruth Hallam), each with a one-line operational reason.

**Row 3 left (7 cols): Previous supervision actions** table (Dataset §7): Action · Owner · Status (Open = ochre tag, Completed = healthy tag).
**Row 3 right (5 cols): Pending development goals** with thin progress bars.

---

## Screen 6 — Team Capacity & Caseload Balancing

**Nav:** Organisation / Team Capacity
**Job:** Show where capacity exists and where load is unsustainable. **Recommend, never reassign.**

**Header:** h1 **Team capacity** · sub _"Utilisation against configured capacity, weighted by client complexity."_ · right: segmented control `All sites · Richmond · Box Hill`.

**Row 1 (12 cols): Capacity chart.** Horizontal bar per clinician (10), sorted by utilisation; bar = utilisation %, a dashed vertical line at 100%, overflow beyond 100% in clay, values labelled at bar end ("108%"). Sarah top, Emma highlighted in slate as _Available_.

**Row 2 (8 cols): Table.** Columns exactly: Clinician · Active · Capacity · Complexity · Utilization · Status, plus a Weighted units column. Proposal rows first (Sarah, Jessica, Daniel, Emma) then remaining clinicians.

**Row 2 (4 cols): Recommendation callout** (component spec):

- Brass eyebrow `SUGGESTION`.
- Copy exactly from Dataset §2.
- Visual: two mini cards, _Sarah 27 / 25 (+2 over)_ → _Emma 18 / 24 (≈ 4 available)_, joined by a thin arrow.
- Buttons: `Review with supervisor` (primary), `Dismiss` (ghost).
- Mandatory footnote: _"Recommendation only. Requires leadership review. No clients are reassigned automatically."_

---

## Screen 7 — Admin Insights (Admin Reduction & AI Opportunities)

**Nav:** AI Workspace / Admin Insights
**Job:** Quantify where clinician time goes and where AI can safely help.

**Header:** h1 **Where clinician time goes** · sub _"All clinicians · last 4 weeks · ≈ 353 logged hours per week."_

**Row 1 left (5 cols): Donut** of the 5 categories (Dataset §8) with centre label _"61% clinical"_ in Newsreader; legend table to the right with % and hours.
**Row 1 right (7 cols): "Safe automation opportunities"** list: 5 rows (Case note summary, Progress report drafting, Supervision preparation, Follow-up identification, Weekly caseload summary), each with a one-line description, est. hours returned/week as a small horizontal bar, and a status _Live in demo_ / _Available_. Total row: _≈ 32 h / week (≈ 0.85 FTE) · Estimate_.
**Row 2 (12 cols): guardrail band**: three short statements in a row: _AI drafts, clinicians decide_ · _Every AI output is labelled and audited_ · _Operational indicators, not diagnoses_.

---

## Screen 8 — AI Progress Report Generator (Emily Carter)

**Nav:** AI Workspace / Progress Reports · **Role:** Clinician (Hannah Wright)
**Job:** Draft a report from approved information only.

**Header:** eyebrow `PROGRESS REPORT · DUE FRI 23 OCT` · h1 **Emily Carter** · meta _8 yrs · Paediatric OT · Period 14 Apr – 16 Oct 2026 · Funding review Fri 6 Nov · Clinician: Hannah Wright_.

**Left (4 cols): "Approved sources"** checklist (all checked): Approved session notes (12) · Goals (3) · Interventions log · Attendance 11/12 · Outcome measures (COPM) · Previous report (Apr 2026). Each row: checkbox, label, count, _View_. Caption: _"Only approved clinical information is used."_ Button `Generate draft report`.

**Right (8 cols): Document-style AI Draft block.** Feels like a real report page: report title, client details table at top, then sections **Current Goals** (with status per goal), **Interventions Delivered**, **Observed Progress** (incl. a small COPM before/after figure), **Barriers**, **Recommended Next Steps** (Dataset §9). Each section has its own `Edit` / `Regenerate section` affordance on hover. Top label _AI Generated Draft — Clinician Review Required_. Bottom bar: `Approve & finalise` (primary, disabled until "I have reviewed all sections" checkbox is ticked) · `Save draft` · `Export PDF`.

---

## Screen 9 — My Day (Individual Clinician Home: Hannah Wright)

**Nav:** Clinical / My Day · **Role:** Clinician
**Job:** Prove the system helps clinicians, not just managers.

**Header:** eyebrow `TUESDAY 20 OCTOBER 2026` · display **"Good morning, Hannah."** · sub _"5 appointments today. Two drafts are waiting for your approval."_

**Row 1: four summary tiles:** Today's appointments 5 · Notes awaiting approval 2 · Client follow-ups 1 · Progress report due 1 (Emily Carter, Fri). Plus a slim band: **Supervision Thursday 11:00 am with Grace Liu** → `Prepare my supervision`.

**Row 2 left (7 cols): Today timeline.** 5 appointments (Dataset §10) as a vertical schedule with time in Newsreader, client, service, location; current/next appointment highlighted with evergreen left rule; "Now" marker at 10:15 am.

**Row 2 right (5 cols):**

- **AI Assistant** card (not a chat window): 4 shortcut rows with pen-nib icon and chevron: _Summarise today's notes_ · _Prepare my supervision_ · _Show clients needing follow-up_ · _Draft Emily's progress report_. Caption: _"Drafts always need your approval."_
- **Waiting for you:** 2 AI drafts (Leo Banks, Poppy Shaw, 19 Oct) with `Review` buttons; 1 follow-up (Call parent re: school visit, Poppy Shaw).

---

## Global overlays (design once)

- **Audit trail drawer** (Dataset §12), opened from the top-bar icon.
- **Role switcher states:** Leadership sees all; Supervisor sees supervisees; Clinician sees own caseload only (show as a subtle banner: _"Viewing as Clinician · Hannah Wright"_).
- **Synthetic data badge**: tiny caption in sidebar footer, _"Demo environment · synthetic data"_.
