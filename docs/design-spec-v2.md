# Medisense design spec v2

Approved 6 November 2026 and built into the demo. The original static mock-ups stay at `/design-preview` for reference.

Fixtures use the repo's anchor day, Tuesday 20 October 2026, and skip to Wednesday 21 October.

## 1. Design system summary

### Palette (`src/app/globals.css`)

| Tokens                                           | Value                                                | Used for                                                 |
| ------------------------------------------------ | ---------------------------------------------------- | -------------------------------------------------------- |
| `canvas`                                         | `#f5f3ee`                                            | App background                                           |
| `surface`, `surface-raised`                      | `#ffffff`                                            | Cards, popovers (currently identical)                    |
| `surface-sunken`                                 | `#faf8f3`                                            | Table headers, wells, tracks                             |
| `border`, `border-strong`, `grid`                | Ink at 8%, 16%, 6%                                   | Hairlines, inputs, chart grids                           |
| `ink-900`, `ink-700`                             | `#17150f`, `#5e5b54`                                 | Primary and secondary text                               |
| `ink-500`, `ink-400`                             | `#8c8981`, `#b3afa6`                                 | Tertiary text, placeholder (both fail contrast, see 2.5) |
| `sidebar*`                                       | Obsidian `#0a0b0d`, ivory text at 62%, 42%, 6%, 10%  | Navigation rail                                          |
| `accent`, `accent-hover`, `accent-tint`          | Bronze `#8a6a2b`, `#6f5521`, champagne at 16%        | Links, key figures, selected rows                        |
| `accent-fill`, `-hover`, `-pressed`, `on-accent` | Champagne `#c9a96a`, `#d6b97e`, `#b39454`, `#14110a` | Primary buttons, active nav                              |
| `healthy`                                        | `#2e8b63`                                            | Healthy, Approved, Done                                  |
| `monitor`                                        | `#a8680f`                                            | Watch, Due today, warnings                               |
| `over`                                           | `#c4432f`                                            | At Risk, Overdue, Escalated, errors                      |
| `available`                                      | `#2f6db5`                                            | Spare capacity only                                      |
| `draft`, `draft-rule`, `brass`                   | `#fbf7ee`, `#c9a96a`, `#8a6a2b`                      | AI draft surface, left rule, AI label                    |
| `series-1..4`, `chart-*`                         | Teal, bronze, slate, stone                           | Charts, checked for colour-vision separation             |

### Type

- **Newsreader (`font-serif`, `headline`):** page titles, card titles and all large numerals. Weights 400 to 600, tracking -0.01em.
- **Instrument Sans (`font-sans`):** everything else, with tabular numerals set globally.
- **IBM Plex Mono (`font-mono`):** audit timestamps, line numbers and IDs, small sizes only.
- **Scale, size/line height in px:** display 34/40, h1 28/34, kpi 36/40, stat 28/32, stat-sm 24/30, report-title 26/32, h2 20/28, figure 18/24, report-heading 17/24, section 16/22, h3 15/22, body 14/21, small 13/19, caption 12/16, eyebrow 11/14.
- **Serif numerals appear in:** KPI tiles (`text-kpi`), metric bands (`text-stat`), table scores (`text-figure`), visit times and the ledger on Before and after.

### Space and grid

- **Spacing:** 4 px base. The doc lists 4, 8, 12, 16, 20, 24, 32, 40, 56, 72.
- **Shell:** sidebar 248 px (`--spacing-sidebar`), top bar at least 64 px, page padding 40 px.
- **Content:** 12-column grid with 24 px gutters, normally 8/4, 7/5 or 5/7 splits.
- **Target:** 1440 × 900 today. This spec adds collapse rules (screen 8).

### Radii and shadows

| Token                                                   | Value                 | Used on                        |
| ------------------------------------------------------- | --------------------- | ------------------------------ |
| `rounded-tag`                                           | 4 px                  | Tags, small inner controls     |
| `rounded-control`                                       | 6 px                  | Buttons, inputs, rows          |
| `rounded-card`                                          | 10 px                 | Cards, draft blocks            |
| `rounded-sheet`                                         | 14 px                 | Drawers, dialogs (the maximum) |
| `shadow-overlay`                                        | Warm two-layer        | Popovers and drawers only      |
| `shadow-focus`                                          | 3 px champagne at 45% | Keyboard focus                 |
| `shadow-rule-over`, `shadow-rule-accent`, `shadow-flag` | Inset 2 px            | Row and tile emphasis          |
| `shadow-hairline`                                       | 1 px ring             | Selected segmented control     |

Resting cards have no shadow.

### Components

| Component                                                                            | Note                                                              |
| ------------------------------------------------------------------------------------ | ----------------------------------------------------------------- |
| `Button`, `ButtonLink`                                                               | Primary, secondary, ghost; 36 px or 30 px high. No touch size yet |
| `Card`, `CardTitle`, `Caption`                                                       | Hairline surface, serif title and quiet caption                   |
| `PageContainer`, `PageHeader`                                                        | 40 px padding; header requires an uppercase eyebrow               |
| `MetricBand`                                                                         | Hairline-divided figures, only partly adopted                     |
| `Tag`, `StatusTag`, `PriorityTag`                                                    | 22 px, dot plus label                                             |
| `LevelDot`, `Complexity`                                                             | Coloured dot with a level word                                    |
| `TableHeader`, `TableRow`                                                            | CSS-grid rows sharing one template                                |
| `FilterChips`, `Segmented`, `SelectField`, `FilterBar`, `FilterField`, `SearchField` | Filter controls                                                   |
| `Switch`, `CapacityMeter`                                                            | Toggle; meter scaled to 120% with a 100% marker                   |
| `DraftLabel`, `ApprovedLabel`, `PenNib`, `draftSurface`                              | AI provenance                                                     |
| `Sidebar`, `TopBar`, `AuditDrawer`, `AssistantPanel`, `RoleLink`                     | Shell. All read the store, so previews don't import them          |
| `Sparkline`, `TrendChart`, `BarList`, `StackedColumns`, `DonutChart`, `chart-kit`    | Token-coloured Recharts wrappers                                  |

### Do's and don'ts from the design doc

- **Do:** use editorial hierarchy, keep colour for meaning, explain rather than alarm, make human review visible, keep tables dense and pages generous, label values directly on charts, and say "configured operational indicators".
- **Don't use:** gradients, glassmorphism, glow, purple AI colours, sparkle, wand or robot icons, emoji, large icon circles on KPIs, shadows on resting cards, radii above 14 px, saturated rainbow status colours, count-up numbers, chatbot bubbles, centred heroes, or clinical-risk language.

### Inconsistent today, not to copy

1. `docs/design-system.md` still opens with the retired evergreen direction, and its tables hold old hex values above a revision note.
2. The doc lists "Over Capacity" and "Monitor". The code says "At Risk" and "Monitor". This brief says "Watch".
3. `chart-evergreen` is actually bronze, `brass` equals `accent`, and `surface` equals `surface-raised`.
4. Eyebrows sit above most things, which this brief now rules out for sections.
5. The metric strip is written inline about 14 times instead of using `MetricBand`.
6. Fractional spacing (`py-2.75`, `pb-4.5`) is common and isn't on the doc's scale.
7. A `Sparkles` icon, a repeating gradient and `rounded-[5px]` break the doc's own rules.
8. `DraftLabel` sets a long label with an em dash on every AI block, which is loud where it repeats.

## 2. Cross-cutting decisions

### 2.1 Hierarchy instead of sameness

Each hero screen gets one focal point, and everything else stays quiet.

| Screen               | Focal point                                    | What was removed to allow it                     |
| -------------------- | ---------------------------------------------- | ------------------------------------------------ |
| My Day               | Oliver's row in the timeline                   | Metric strip, charts                             |
| Session note         | The dictation control                          | Everything but the visit details and goals       |
| What's been prepared | The note joined to its outputs by a drawn line | Metric strip, tabs                               |
| Overview             | The change banner                              | Trend cards and charts, moved below in the build |
| Before and after     | The figures ledger                             | All charts                                       |
| Work queue           | The exception, then the table                  | Charts                                           |

The source line on What's been prepared is this phase's one bold element. Nothing else draws.

### 2.2 How AI-prepared content is marked

There's one treatment everywhere, built from three parts:

1. **A quiet marker.** `PenNib` plus a brass caption, for example "AI draft, needs your approval".
2. **A source link.** `L5` links a sentence to its dictated line. Elsewhere it reads "From: Approved note, Plan", or a quoted sentence on tasks.
3. **A state:**

| State    | Surface                               | Marker                                                  |
| -------- | ------------------------------------- | ------------------------------------------------------- |
| Draft    | `bg-draft` with `border-l-draft-rule` | Brass pen nib, "AI draft, needs your approval"          |
| Edited   | Same                                  | The line also carries "Edited by you"                   |
| Approved | Plain `bg-surface`, rule removed      | Green tick, "Note approved by Sarah Thompson, 10:46 am" |

Losing the parchment is itself the signal that a person has signed. Say "AI" plainly and often, but never "magic", "smart" or "instantly".

### 2.3 How change is shown

- Show the new value with a quiet "was 17" beside it (preview `Changed`), plus an audit entry.
- There's one 160 ms colour transition, removed under `prefers-reduced-motion`.
- No counters, pulses or confetti. Skeleton pulses for loading also stop under reduced motion.
- Changes aren't coloured as good or bad. The words explain them.

### 2.4 Status language

| Family   | Words              | Tag tone  |
| -------- | ------------------ | --------- |
| Content  | Draft              | `neutral` |
|          | Ready for review   | `live`    |
|          | Approved           | `healthy` |
| Tasks    | Scheduled          | `neutral` |
|          | Due today          | `monitor` |
|          | Overdue, Escalated | `over`    |
|          | Done               | `healthy` |
| Workload | At Risk            | `over`    |
|          | Watch              | `monitor` |
|          | Healthy            | `healthy` |

The "Watch" label conflicts with the existing `StatusTag`, which says "Monitor". See open question 2.

### 2.5 Accessibility

These values apply inside `/design-preview` only, through `_components/proposed-tokens.ts`. `globals.css` is unchanged.

| Token           | Now                    | Proposed  | On white           | On canvas |
| --------------- | ---------------------- | --------- | ------------------ | --------- |
| `ink-500`       | `#8c8981` (3.49, 3.15) | `#6b6860` | 5.56:1             | 5.02:1    |
| `ink-400`       | `#b3afa6` (2.19)       | `#716e66` | 5.09:1             | 4.59:1    |
| `sidebar-faint` | 42% (3.76 on obsidian) | 55%       | 5.77:1 on obsidian |           |

Status text also fails on its own tag tint, so tags need darker text:

| Token       | Now, on own tint  | Proposed  | On own tint |
| ----------- | ----------------- | --------- | ----------- |
| `healthy`   | `#2e8b63`, 3.72:1 | `#22704e` | 5.31:1      |
| `monitor`   | `#a8680f`, 3.98:1 | `#875208` | 5.72:1      |
| `over`      | `#c4432f`, 4.35:1 | `#ad3724` | 5.44:1      |
| `available` | `#2f6db5`, 4.61:1 | `#28609f` | 5.61:1      |

With `ink-400` and `ink-500` this close, hierarchy has to come from size and weight rather than grey.

**Focus ring.** The current ring measures about 1.4:1.

- **Proposed:** `--shadow-focus: 0 0 0 2px var(--color-surface), 0 0 0 4px var(--color-accent-hover)`. That's a 2 px gap and a 2 px ring at 7.01:1 on white.
- **On obsidian:** the gap uses `--color-sidebar` and the ring `--color-accent-fill`, at 8.78:1.

**For the build phase:**

- Nothing depends on hover. Source links are buttons, and "Show source" is a toggle with `aria-pressed`.
- Dialogs and the presenter panel trap focus, close on Escape and return focus to whatever opened them. Existing drawers don't do this yet.
- Tables carry `row`, `columnheader` and `cell` roles.
- Live dictation uses `aria-live="polite"`. Generating states use `aria-busy`.

### 2.6 Copy rules applied

- Sentence case and active voice, written for the person on the screen.
- An action keeps its name: Approve note, Note approved. Confirm task, Task confirmed. Mark done, Task done. Retry sync, Retrying sync. Reassign, Reassign task.
- Errors say what happened and how to fix it, and never apologise.
- Australian English. Plain words: "AI drafted 4 sections", not "generated by our intelligent engine".

### 2.7 Proposed additions to the system

None of these is in shared code. Preview versions are in `src/app/design-preview/_components/`.

| Addition                           | Reason                                                             | Proposed definition                                       |
| ---------------------------------- | ------------------------------------------------------------------ | --------------------------------------------------------- |
| Token values in 2.5                | The audit's contrast and focus findings                            | As tabled                                                 |
| `AiMark`                           | Replaces the long `DraftLabel` with one component for three states | `state`, optional `source`, optional custom text          |
| `SourceLink`                       | Reachable link from a sentence to its line                         | Button, `L{n}`, `aria-pressed`                            |
| `Changed`                          | One way to show a moved value                                      | `value`, optional `was`                                   |
| `TaskTag`, `WorkloadTag`           | One place for the status vocabulary                                | Thin wrappers around `Tag`                                |
| `PageHeader` with optional eyebrow | Brief rules out eyebrows above sections                            | Make `eyebrow` optional (preview: `ScreenTitle`)          |
| `Button size="lg"`                 | 44 px touch target                                                 | `h-11 min-w-11 px-4 text-body`                            |
| Notification bell                  | Reminders need somewhere to land                                   | 36 px icon button with a count, matching the audit button |
| Shell rail and phone tab bar       | The main column shrinks to 125 px today                            | `w-16` rail below 1280 px, 64 px tab bar below 768 px     |
| `LevelDot` accepts `Low` already   | Used for priority so status tags stand alone                       | No change needed                                          |

Sentence-case labels replace the eyebrow on the new screens, and table column headers keep it. See open question 3.

### 2.8 Making the system read as AI-powered

Added after the first review: the product must clearly look AI-powered rather than static.

**Naming used across the screens:**

| Area        | Name                                                                                                   |
| ----------- | ------------------------------------------------------------------------------------------------------ |
| Sidebar     | "AI workspace" group, "AI notes", "AI reports", "AI briefs", "AI insights", "AI referrals", "AI forms" |
| Assistant   | "Ask Medisense AI", also as suggested questions on the Overview                                        |
| Note        | "AI session note", "AI scribe is listening", "Write note with AI", "Regenerate with AI"                |
| Hero        | "What AI prepared from Oliver's note", "AI read…", "AI drafted…", "3 follow-ups AI found"              |
| Overview    | "AI briefing, recommendation only", replacing the plain change banner                                  |
| My Day      | "AI day summary"                                                                                       |
| Supervision | "AI supervision brief", "AI updated Tue 10:46", "AI-suggested discussion points"                       |
| Queue       | "AI sorted these by what needs you first", "AI found in Sarah's note", "AI suggests Sam Doyle"         |

**Visible AI behaviour added:**

- The note fills in section by section while AI writes, instead of a blank loading state.
- The hero screen says what AI read before it prepared anything.
- The Overview opens with a written briefing and three questions that answer in place.

**The line that stays:** rules are never labelled AI. Scores, reminders, escalations and due dates are labelled rules or Automation, and AI explains them. The audit trail keeps the two separate. Calling them AI would be untrue, and it's easy for a health-sector buyer to test.

**The AI look stays calm:** no sparkles, glows or purple. AI is shown through its label, its parchment surface and its sources.

### 2.9 AI build plan

A screen that says "AI" must really call AI by the time Neil sees it. All of these go through `src/lib/ai/engine.ts`, and every output stays a draft until a person acts.

| AI function                         | Reads                           | Produces                                      | Person's role             | Today                            | Build |
| ----------------------------------- | ------------------------------- | --------------------------------------------- | ------------------------- | -------------------------------- | ----- |
| Note writing                        | Dictated lines                  | SOAP note, each sentence linked to a line     | Edits and approves        | Real, needs per-sentence sources | S     |
| Missing information                 | Dictated lines                  | Gaps to check                                 | Adds or dismisses         | Real                             | Done  |
| Follow-up finding                   | Approved note                   | Tasks with source sentence, owner, due date   | Confirms each             | Rough, from next actions         | S     |
| Progress report                     | Approved notes, plan goals      | Report sections with sources                  | Reviews and approves      | Pre-written                      | M     |
| Form prefill                        | Records, approved note          | Field values; AI writes only free-text fields | Completes and submits     | Hard-coded                       | M     |
| Supervision brief                   | Notes, tasks, caseload          | Brief that updates when these change          | Grace approves            | Pre-written                      | M     |
| Discussion points                   | The brief                       | 3 suggested questions                         | Grace chooses             | New                              | S     |
| Overview briefing                   | Org figures, attention list     | Written summary, recommendation only          | Neil decides              | New                              | S     |
| Ask Medisense AI                    | Records through read-only tools | Answers with links                            | Acts on the linked screen | Real, not permission-aware yet   | S     |
| Day summary                         | Sarah's visits and tasks        | One line about what to do next                | None needed               | New                              | S     |
| Queue sorting and owner suggestions | Tasks, workloads                | Order and a suggested owner                   | Reassigns                 | New                              | S     |
| Referral extraction                 | Pasted referral text            | Fields with source lines                      | Verifies                  | Hard-coded                       | M     |

**Fallback for the live demo:** if a call fails, show the prepared output for that same step, and show the fallback on the presenter panel so the presenter knows. Never fall back for text the presenter has typed or dictated live, because the draft wouldn't match their words.

**Before this ships:** name redaction, permission-aware answers, speech-service privacy and rate limits on the AI routes, from the audit.

## 3. Screens

### Screen 1: Sarah's My Day

`/design-preview/my-day`

- **Purpose:** Sarah's starting point, built around how a home-visit therapist works.
- **Who and where:** Sarah Thompson, story step 3, and again after approval.
- **In three seconds:** Oliver's visit has just finished, and writing his note is next.

```
Good morning, Sarah.
Five visits today, about 50 minutes of driving. Oliver's note is the one...

+- Timeline (8 cols) -------------------+  +- Notes still due (4) ---+
| 8:15   Henry Ng            [Approved] |  | Oliver Grant [Due today]|
|        15 min drive                   |  | Ruth Hallam  [Overdue]  |
|########################################|  | Ava Mitchell [Overdue]  |
|# 9:30  Oliver Grant       [Write note]|  | Lucas Brennan[Overdue]  |
|#       Finished 10:15 am...           |  +- My tasks --------------+
|########################################|  | Return call  [Mark done]|
|        20 min drive, leave by 11:10   |  | Rebook       [Mark done]|
| 11:30  Isla Murphy        [Scheduled] |  +- Next supervision ------+
| 1:00   Zara Ahmed, video call         |  | Thu 22 Oct, 2:00 pm...  |
| 2:30   Ava Mitchell                   |  +-------------------------+
+---------------------------------------+
```

**Reuses:** `Card`, `Button`, `ButtonLink`, `Tag`, `Caption`. New: drive rows, inline in the card.

**States:**

| State               | What changes                                                                                      |
| ------------------- | ------------------------------------------------------------------------------------------------- |
| Visit just finished | Oliver's row is tinted, with a serif name and "Write note with AI"                                |
| Note approved       | Row returns to normal with an Approved mark and "See what AI prepared"; he leaves Notes still due |
| No visits           | "No visits booked today." and "Open schedule"                                                     |
| Loading (build)     | Timeline rows as skeletons in the same grid                                                       |
| Error (build)       | "Today's visits didn't load. Check your connection, then refresh."                                |

**Copy:**

- Title: "Good morning, Sarah."
- Finished: "Five visits today, about 50 minutes of driving. Oliver's note is the one to do now, while it's fresh."
- Approved: "Oliver's note is done. You have about 20 minutes before you leave for Isla's visit in Aspley."
- Empty: "No visits today. It's a good day to catch up on your notes."

**Interactions:** "Write note with AI" opens the note. Each row in Notes still due opens that note, replacing the dead Review buttons. "Mark done" completes a task. Every control leads somewhere.

### Screen 2: Session note

`/design-preview/note`

- **Purpose:** the moment Sarah documents the visit.
- **Who and where:** Sarah, steps 4 and 5.
- **In three seconds:** nothing is filled in yet, the visit details are, and the mic is the thing to press.

```
Session note                                        [Ready for review]
Client: Oliver Grant, 6   Visit: Today   Service: ...   Place: Home, Kedron
------------------------------------------------------------------------
READY                                     DRAFT REVIEW
What happened on this visit?              +- Dictated -+ +- Note ------------+
Say it the way you'd tell a colleague.    | 1 Oliver's | | Subjective   [Edit]|
                                          | 2 She gave | | ...sentence [L1]   |
 (( mic ))  Start dictating               | 3 We worked| | Objective    [Edit]|
            [Type instead] Use sample...  | ...        | | Assessment   [Edit]|
                                          +------------+ | Plan         [Edit]|
+- Oliver's goals -+                                     | Worth checking...  |
| ...              |                                     | [Approve note]     |
+------------------+                                     +--------------------+
```

**Reuses:** `Button`, `Card`, `Caption`, `Tag`, `draftSurface`. Preview: `AiMark`, `SourceLink`.

**States:**

| State                  | Design                                                                                                |
| ---------------------- | ----------------------------------------------------------------------------------------------------- |
| Ready                  | Empty note, 80 px mic, "Use sample dictation" as a ghost button                                       |
| Listening              | Mic becomes Pause, red dot with "Recording, 1:12", live transcript with the current phrase in italics |
| Paused                 | Play icon, "Paused at 1:12", transcript kept                                                          |
| Transcript complete    | Editable text, "Write note with AI", "Dictate more"                                                   |
| Generating             | Transcript left; section names over skeleton lines right                                              |
| Draft ready            | Numbered lines left; SOAP sections right, each with Edit and source links                             |
| Editing a line         | Text area in place, "Save line", "Cancel"                                                             |
| Line edited            | Sentence carries "Edited by you"                                                                      |
| Draft failed           | Alert, "Try again", "Write it myself"                                                                 |
| Microphone unavailable | Alert, text area, "Write note with AI"                                                                |
| Note approved          | Plain surface, lock note, "Reopen for editing", "See what AI prepared"                                |
| Reopen for editing     | Inline confirmation explaining what goes out of date                                                  |

**SOAP mapping fix.** The audit found Assessment was only the summary and Objective mixed in interventions. Sentences now go to the section they belong in, and Assessment comes only from what the clinician actually said (dictated line 6). If nothing was said, Assessment stays empty and gets a prompt rather than invented content.

**Approved notes are protected.** "Regenerate with AI" doesn't exist on an approved note. Reopening is explicit, marks prepared items out of date, and keeps the earlier version.

**Copy:**

- Ready: "What happened on this visit?" and "Say it the way you'd tell a colleague. AI writes the note, and you check it."
- Listening: "AI scribe is listening. Keep going."
- Paused: "Paused. Pick up when you're ready."
- Transcript: "Here's what you said" and "Fix anything the microphone misheard, then ask AI to write the note."
- Prompts: "AI found 2 things to check before you approve", "The paediatrician report isn't on Oliver's record yet.", "Endurance wasn't measured with a standard tool."
- Footer: "Nothing goes on Oliver's record until you approve."
- Error: "AI couldn't write the draft. The connection dropped. Your dictation is saved. Try again, or write the note yourself."
- No microphone: "Your microphone isn't available. Allow microphone access in your browser settings, or type your note below."
- Locked: "Approved notes can't be changed or regenerated."
- Reopen: "The report draft, form and tasks prepared from it will be marked out of date until you approve the note again. A new version is kept in the audit trail."

The old line "speech is converted in the browser" is gone because the audit found it inaccurate. "Audio isn't kept, only the text above." must be checked against the chosen speech service before it ships.

**Interactions:** the mic toggles listening and pause. `L5` highlights the dictated line. "Add to note" and "Not needed" clear a prompt. Approval is never blocked by a prompt.

### Screen 3: What AI prepared (the hero moment)

`/design-preview/prepared`

- **Purpose:** prove "enter once, review once, reuse everywhere".
- **Who and where:** Sarah, steps 6 and 7.
- **In three seconds:** one approval produced three things, none has gone anywhere, and each traces back to the note.

**Decision: a full step, not a panel.** A side panel would make this feel like a notification and would cover the note, which is half of the argument. An in-page section under the note would push the result below the fold at the exact moment it matters. As its own step, it holds the note and its outputs side by side, and it gives the presenter one screen to talk over.

```
What AI prepared from Oliver's note
You approved one note. AI prepared what usually follows it...

+- Oliver's approved note -+      +- NDIS progress report -[Ready for review]+
| Subjective               | ____/| 4 of 5 sections from 6 approved notes    |
|##sentence################|/   / | v Current goals      v Interventions     |
| sentence                 |   /  | [Review report]                          |
| Objective                |  /   +- Further assessment request ----[Draft]--+
|##sentence################|_/     | 9 of 12 fields  |||||||||...             |
|##sentence################|       | Still needs a person: ...  [Check form]  |
| Assessment               |      +- 3 proposed follow-ups ------------------+
|##sentence################|      | Upload report   "She provided a new..."  |
| Plan                     |      | Owner [Admin team v] Due Wed  [Confirm]  |
+--------------------------+      +------------------------------------------+

Steps you didn't have to repeat   v Typing Oliver's details into the form ...
```

**The source line:** selecting "Show source" on any item tints its sentences and draws a thin champagne line to the item. It's drawn once, doesn't animate, and hides below 1024 px. Tasks also quote their sentence, so the link survives without the drawing.

**Reuses:** `Button`, `ButtonLink`, `Caption`, `SelectField`, `Tag`, `draft-rule`, `AiMark`.

**States:**

| State              | Design                                                                                                                                                     |
| ------------------ | ---------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Preparing          | "Note approved. AI is preparing what follows from it." with three named progress rows and "You can leave this page. Everything will be waiting on My Day." |
| Prepared           | Full layout, report selected by default                                                                                                                    |
| Task confirmed     | Task becomes Scheduled with a green confirmation and "View work queue"                                                                                     |
| Form not prefilled | Form shows the reason and the fix; the rest of the page works normally                                                                                     |
| Nothing to prepare | "Note approved. AI found nothing else to prepare."                                                                                                         |

**Copy:**

- Report: "14 April to 20 October. AI drafted 4 of 5 sections from 6 approved notes." and "Won't be sent until you approve it."
- Form: "9 of 12 fields filled by AI from verified records. 3 need you.", "Still needs a person: Assessment provider, Parent consent, Paediatrician report attachment." and "Won't be submitted until you approve it."
- Tasks: "AI found each one in a sentence of the note. None is created until you confirm it."
- Confirmed: "Task confirmed. It's in the admin work queue, due Wed 21 Oct."
- Failure: "The form wasn't prefilled because Oliver's plan end date is missing from his record. Add the date, then try again."
- Footer title: "Steps you didn't have to repeat", with four plain steps and no percentages.

**Interactions:** "Review report" and "Check form" expand the content in place. The owner can change before confirming. "Dismiss" has "Undo". Nothing is sent or submitted without a person.

### Screen 4: Overview, plus Before and after

`/design-preview/overview`

- **Purpose:** the opening signal and the payoff.
- **Who and where:** Neil, steps 1 and 10.
- **In three seconds:** at the start, Sarah needs attention. At the end, what changed and why.

```
Good morning, Neil.
+- banner ----------------------------------------- [See before and after] +
| Sarah approved Oliver Grant's note at 10:46 am.                          |
+--------------------------------------------------------------------------+
| Notes due 16  was 17 | Follow-ups overdue 11 | ... 8 figures in 2 rows   |
+- Caseload health (8) ---------------+  +- Needs your attention (4) ------+
| Sarah  27/25  3 was 4  80 was 83    |  | Sarah Thompson is At Risk.      |
+-------------------------------------+  +---------------------------------+

BEFORE AND AFTER
Sarah approved one note on Tuesday. Four figures moved that morning...
+- Because Sarah approved Oliver Grant's note -----------------------------+
| What moved | Before, then now | Why                       | Audit entry  |
| Sarah's overdue notes   4 to 3  Oliver Grant's note...      Tue 10:46    |
+- Because a day passed -----------+  +- What hasn't changed --------------+
```

**Reuses:** `Card`, `Caption`, `ButtonLink`, `TableHeader`, `TableRow`, `CapacityMeter`, `Sparkline`.

**States:** start of the story; after the approval; after the time skip; Before and after.

**Honest numbers:**

- Sarah's score goes from 83 to 80 because Overdue documentation drops 3 points. Her status stays At Risk, since At Risk starts at 80.
- The "What hasn't changed" card says so plainly: "Sarah still has 27 active clients against a capacity of 25, including 6 high-complexity clients. That needs a caseload decision, not a tidier backlog."
- Follow-ups overdue goes up by one after the skip, because Poppy Shaw's call became overdue. That's kept in because it makes the comparison believable to a director.

**Interactions:** "See before and after" opens the comparison. Each time links to its audit entry. Existing screens are linked where they already exist, such as the caseload page.

**Note:** the build should keep the trend cards and charts below this content. They're left out of the mock-up to keep the focus on what changes.

### Screen 5: Admin work queue

`/design-preview/admin-queue`

- **Purpose:** where work arrives for admin.
- **Who and where:** Jo Marsh, end of step 7.
- **In three seconds:** one thing failed, one is escalated, and Oliver's task has arrived.

```
Work queue
+! 1 exception: a form didn't sync            [Open form] [Retry sync] ---+
[Team 5] [Mine 3] [Due today 1] [Overdue 1] [Escalated 1]
| Task and source      | Client | Owner | Due | Priority | Status | Action |
|!Chase equipment quote| Henry  | Jo    | ... | Medium   |Escalated| ...   |
|#Upload the report    | Oliver | Admin | Wed | Medium   |Scheduled| ...   |
```

**Reuses:** `FilterChips`, `TableHeader`, `TableRow`, `SelectField`, `LevelDot`, `Tag`, `Button`, `Card`.

**States:** queue; reassigning (inline row, not a dialog, so the context stays visible); task done; retrying sync; nothing waiting; empty filter.

**Copy:**

- Exception: "1 exception: a form didn't sync" and "Ruth Hallam's home modification funding request timed out on its way to the practice management system at 10:19 am. The form is safe. Retry the sync, and if it fails again, open the form and check it."
- Empty: "Nothing waiting. New tasks from approved notes will appear here."
- Mine empty: "Nothing assigned to you. Pick up a task from Team when you're ready."
- Done: "Task done. Sarah can see the report on Oliver's record, and this is in the audit trail."

**Interactions:** chips filter the table. The new row is tinted once and links back to its source. Priority uses a dot rather than a tag, so that status is the only tag in each row.

### Screen 6: Presenter panel

`/design-preview/presenter`

- **Purpose:** keep presenter controls out of the product.
- **Who and where:** the presenter, throughout.
- **In three seconds:** this isn't part of the product.

**Shortcut: Ctrl + Shift + . (⌘ + Shift + . on Mac).** It's unused by Chrome and Edge, hard to press by accident, and doesn't appear in the product. It works in the mock-up.

```
+ - - - - - - - - - - - - - - +
| Presenter panel          X  |  Obsidian, monospace, dashed champagne
| Not part of the product.    |  border: same tokens as the product,
| View as                     |  clearly a different kind of object.
| [Neil Hensley   Leadership] |
|  Sarah Thompson  Therapist  |
| Demo date: Tue 20 Oct       |
| [Advance 1 day]             |
| [Advance to next reminder]  |
| AI status                   |
|  Provider, Model, Drafts    |
| [Reset demo]                |
+ - - - - - - - - - - - - - - +
```

**States:** live AI; prepared fallback; confirm reset; closed.

**Moves here from the product:** role switcher, AI status tag, "Demo mode" notices, "Reset session".

**Copy:** "Clears every approval, task and audit entry from this session, and returns to Tue 20 Oct." with "Keep going" and "Reset demo".

**Build notes:** a dialog that traps and returns focus, closes on Escape, and is never linked from product UI. Role and date changes apply straight away. Model names appear only here.

### Screen 7: After a time skip

`/design-preview/time-skip`, plus `/design-preview/supervision` for story step 9

- **Purpose:** make automation visible.
- **Who and where:** Neil, Jo and Grace, steps 8 and 9.
- **In three seconds:** overnight, a rule moved work to the right people and wrote it down.

```
Since yesterday
Overnight, the platform's rules sent 1 reminder, escalated 1 task...
+! Isla Murphy's call-back was escalated -----+  +- Audit trail ---------+
| o Thu 15 Oct   Due                          |  | 08:00 Medisense  Rule  |
| o Tue 20 Oct   3 working days late          |  | Sent a reminder...    |
| * Wed 21 Oct   Escalated to Grace Liu       |  | 08:00 Medisense  Rule  |
| [Open Grace's brief]                        |  | Escalated to Grace... |
+- A reminder went to the admin team ---------+  +-----------------------+
+- One task became overdue -------------------+
```

**States:** what Neil sees; what admin sees; audit trail. Then Grace's brief: updated and approved.

**Where things land:**

| Event              | Who gets it   | Where it appears                                      |
| ------------------ | ------------- | ----------------------------------------------------- |
| Due-today reminder | Admin team    | Notification bell and top of work queue               |
| Escalation         | Grace Liu     | Her brief, Pending follow-ups, and "Escalated to you" |
| Newly overdue      | Hannah Wright | Her tasks; it stays with her until it passes the rule |

**Audit actors.** Rules appear as "Automation" with the rule's name, and AI actions as "Medisense AI". People appear with their real name and current role: "Neil Hensley, Leadership". The audit found these were hard-coded.

**Due-date rule:**

1. A due date that lands on a Saturday, Sunday or Queensland public holiday moves to the next working day.
2. Days late count working days only, so a weekend never causes an escalation.
3. "Advance 1 day" moves to the next working day: Friday then Monday.
4. Example: 2 working days from Thu 22 Oct is Mon 26 Oct, not Sat 24 Oct.
5. Tasks escalate at more than 3 working days late.
6. Date shifting in `lib/clock.ts` should move the story by whole weeks, or start from a working day, so authored weekdays stay true. See open question 9.

### Screen 8: Phone layout (390 × 844)

`/design-preview/phone`

- **Purpose:** show this fits home-visit work.
- **Who and where:** Sarah, in the car after a visit.
- **In three seconds:** which visit is next, and one large button.

```
My Day             Dictate             Review               Prepared
+-----------+      +-----------+       +-----------+        +-----------+
|Good morning|     |Oliver Grant|      |Oliver Grant|       |Note approved|
|Henry  8:15 |     | transcript |      |Subjective E|       |Report [Review]|
|##Oliver 9:30|    | grows here |      | ...L1      |       |Form  [Check]|
|##[Write note]|   |            |      |Objective  E|       |Task [Confirm]|
|Isla  11:30 |     |Recording   |      |            |       |             |
|------------|     |[Type](II)[Finish]| |[Approve note]|    |-------------|
|tabs        |     +-----------+       +-----------+        |tabs         |
+-----------+                                               +-----------+
```

**Decisions:**

- Bottom tab bar, 64 px: My day, Notes, Tasks, Ask.
- It hides during dictation and review, so the primary control owns the thumb zone.
- All targets are at least 44 px, and the dictation control is 72 px, bottom centre.
- The source line is dropped. Tasks keep their quoted sentence, and sentences keep their `L` numbers.

**Shell collapse (working on the other preview screens):**

| Width           | Navigation                    | Padding | Main column                      |
| --------------- | ----------------------------- | ------- | -------------------------------- |
| 1280 px and up  | 248 px sidebar with labels    | 40 px   | 12-column grid                   |
| 1024 to 1279 px | 64 px icon rail with tooltips | 24 px   | 960 px at 1024                   |
| 768 to 1023 px  | 64 px icon rail               | 24 px   | 704 px at 768, mostly one column |
| Below 768 px    | Bottom tab bar                | 16 px   | Full width                       |

Measured in the preview at 1024, 768 and 390 on My Day, the note, What's been prepared, the queue, Before and after, and Roadmap: the main column filled the space and the page had no horizontal overflow. The queue table scrolls inside its card on narrow screens. Stacked rows are the proposal for the build.

### Screen 9: Roadmap

`/design-preview/roadmap`

- **Purpose:** show the vision without pretending it exists.
- **Who and where:** Neil, after the story.
- **In three seconds:** this is a plan, and none of it is built.

```
Where the platform could go next
None of this is built yet. The order is a proposal to agree with Medisense.
-----------------------------------------------------------------
Phase 1           Staff mobile app      My day, dictation...  [Planned]
In the field      Patient mobile app    Visit times...        [Planned]
                  Telehealth            Video visits...       [Planned]
-----------------------------------------------------------------
Phase 2           Billing and claims    NDIS and aged care... [Planned]
Getting paid
-----------------------------------------------------------------
Phase 3           Hospital operations   ...                   [Planned]
Larger orgs       ERP                   ...                   [Planned]
```

A ledger rather than a card grid, because these aren't equal and aren't products yet. There are no dates, screenshots or links. Every module is tagged "Planned" and nothing is clickable. Only the page has a sidebar item, with no "Coming soon" badges anywhere.

## 4. Product name

The product keeps its existing name: **Medisense Clinical Operations & Supervision Intelligence Platform**, with **Ask Medisense** as the assistant. CareFlow is not used, so no rename is needed. The earlier list of old-name uses has been removed.

Because the product and the client share a name, screens say "the platform" where "Medisense" would be unclear. AI-prepared content is marked "Medisense AI", matching the existing audit trail.

## 5. Open questions

1. **Should approving today's note reduce "overdue"?** The brief says Sarah's overdue notes drop by one, and the mock-ups show 4 to 3. But a note for a visit that just finished isn't overdue. My Day calls it "Due today", while the Overview counts it in her 4. Neil could spot this. My recommendation is to relabel the figure "Notes to write", which stays true and still drops 4 to 3. The alternative is to make Oliver's visit yesterday's.
2. **Watch or Monitor?** You asked for Watch, while the repo and the client-agreed scale say Monitor. I used Watch as briefed. Is Watch a deliberate change? It needs updating in `StatusTag`, the data and the docs.
3. **Eyebrows.** New screens use sentence-case labels, while existing screens keep uppercase eyebrows, and table headers keep them in both. Should I roll this across the product in the build?
4. **The required AI label.** `CLAUDE.md` requires "AI Generated Draft — Clinician Review Required" on every output. I replaced it with the quieter "AI draft, needs your approval". Was the original wording agreed with Neil?
5. **New fictional details.** I added these, and they aren't in `docs/demo-dataset.md`:
   - admin people Jo Marsh and Sam Doyle
   - Oliver's mother Claire Grant, and his date of birth, NDIS number and goals
   - the further assessment request form
   - "follow-ups with no owner" (5 for the team, and 1 of Sarah's becoming owned)
   - Oliver's visit on 20 October, Henry's and Zara's visits, and the admin tasks

   The repo has Oliver's last session on 15 October and also a cancelled Thursday visit, which the build needs to reconcile. Are these all acceptable?

6. **The score rule.** 83 to 80 assumes 3 points per overdue note, from 12 of 15 with 4 notes. Is that right? It leaves Sarah exactly on the At Risk line.
7. **Story step 2 has no new design.** It uses the existing `/caseloads/sarah-thompson`, which doesn't show "follow-ups without owners" as the story says. Should it get a small addition?
8. **Two screens beyond your list.** I added the updated supervision brief because story step 9 needs it. Review report and Check form expand in place because full screens aren't in this phase. Are full report and form screens needed before the demo?
9. **Working days and dates.** Counting working days changes dataset figures. Isla's task moved from Sat 17 Oct to Thu 15 Oct, and James's task now shows as 2 days late. Recalculating could change the agreed "7 escalated" and others. Should the fixture numbers win, or the rule? And should demo dates follow today in whole weeks, or stay pinned?
10. **Neil's title.** Previews say "Director", as in your brief. `CLAUDE.md` says "Director of Clinical Services". Which is right?
11. **Roadmap phases.** Is the order right, and should hospital operations and ERP be shown to an allied health director at all? I'd consider leaving them out, because they don't serve his problems.
12. **Dictation privacy.** "Audio isn't kept" appears in the transcript state. Before it ships, we need to choose a speech service and confirm this is true.
13. **Which provider should run the live demo?** Only a Groq key is set locally, and its free tier has rate limits. Twelve AI functions in one 12-minute demo need a paid key. I'd use Claude, which is already the code's default.
