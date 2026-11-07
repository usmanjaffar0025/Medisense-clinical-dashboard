# Medisense — Master Demo Dataset (synthetic)

> All people, clients and figures below are **fictional demo data**. Every screen must use these exact values so numbers agree everywhere.
> Revision 2 (after the second meeting with Neil): 12 clinicians (OT and Speech Pathology only), 184 clients across NDIS and aged care, and the status scale **Healthy / Monitor / At Risk**.
> The code in `src/data` is the source of truth. Derived figures (utilisation, weighted units, totals, trends) are computed there, never typed into components.

## 0. Context

- **Product:** Medisense Clinical Operations & Supervision Intelligence Platform. An AI-assisted operational layer that reduces admin friction, protects caseload sustainability and helps supervisors support clinicians. "Systems supporting therapists", never "AI replacing therapists".
- **Organisation:** Medisense. Community-based allied health provider in Brisbane, QLD, delivering therapy through home visits and telehealth (no clinics). Clinicians are grouped into two service regions: Brisbane North and Brisbane South.
- **Demo "today":** **Tuesday 20 October 2026**. Trends cover the 12 weeks starting 3 Aug to 19 Oct.
- **Logged-in user:** **Neil Hensley**, Director of Clinical Services (Leadership role).
- **Clinical supervisor:** Grace Liu, Senior OT and Clinical Supervisor.
- **Clinician persona for "My Day":** Hannah Wright, Occupational Therapist.

---

## 1. Organisation KPIs (Leadership Dashboard, all sites)

These match the table agreed in the second meeting exactly.

| KPI                      | Value    | Caption                                       |
| ------------------------ | -------- | --------------------------------------------- |
| Active clinicians        | **12**   | 9.0 FTE · 7 OT · 5 Speech Pathology           |
| Active clients           | **184**  | 128 NDIS · 56 aged care                       |
| Average caseload         | **15.3** | Utilisation 88% of configured capacity (208)  |
| Clinicians near capacity | **3**    | At or above 95% of configured capacity        |
| Notes due                | **17**   | 12 overdue · 5 AI drafts awaiting approval    |
| Follow-ups overdue       | **11**   | +6 over 12 weeks                              |
| Supervision due          | **4**    | Next 14 days (Sarah, Hannah, Jessica, Marcus) |
| Clients requiring review | **14**   | 2 high · 7 medium · 5 review                  |

All KPIs, trend cards and charts on the overview respond to the **Site**, **Discipline** and **Trend period** filters.

### Trend cards (12 weeks, org)

| Card                   | Measure                                    | Now | Direction        |
| ---------------------- | ------------------------------------------ | --- | ---------------- |
| Admin backlog          | Notes due (overdue + AI drafts)            | 17  | Rising           |
| Caseload pressure      | Active clients ÷ configured capacity       | 88% | Rising           |
| Follow-up risk         | Client follow-ups overdue                  | 11  | Rising           |
| Supervision completion | Sessions held on schedule, rolling 4 weeks | 72% | Falling from 92% |

Supervision completion: 26 of 36 sessions held on schedule over the last three 4-weekly cycles.

---

## 2. Clinicians (Team Capacity & Caseload Health)

Utilisation = active ÷ configured capacity. Weighted units use **Low 1.0 · Medium 1.5 · High 2.5**. Weighted capacity = capacity × 1.5. "Available" = at least 6 free weighted units.

| Clinician      | Discipline | Site        | FTE | Active  | Capacity | Util.    | H/M/L    | Weighted units | Notes overdue + drafts | Follow-ups overdue | NDIS / aged  | Next supervision    | Score  | Status                            |
| -------------- | ---------- | ----------- | --- | ------- | -------- | -------- | -------- | -------------- | ---------------------- | ------------------ | ------------ | ------------------- | ------ | --------------------------------- |
| Sarah Thompson | OT         | Bris. North | 1.0 | 27      | 25       | **108%** | 6/12/9   | 42.0 / 37.5    | 4 + 1                  | 3                  | 23 / 4       | Thu 22 Oct          | **83** | **At Risk**                       |
| Jessica Nguyen | OT         | Bris. North | 1.0 | 24      | 24       | **100%** | 5/11/8   | 37.0 / 36.0    | 3 + 1                  | 2                  | 18 / 6       | Mon 26 Oct          | **72** | **Monitor**                       |
| Marcus Bell    | SP         | Bris. South | 1.0 | 23      | 24       | 96%      | 3/12/8   | 33.5 / 36.0    | 2 + 0                  | 2                  | 17 / 6       | Thu 29 Oct          | **66** | **Monitor**                       |
| Daniel Okafor  | OT         | Bris. South | 1.0 | 22      | 25       | 88%      | 3/11/8   | 32.0 / 37.5    | 1 + 0                  | 1                  | 14 / 8       | Thu 12 Nov          | 49     | Healthy                           |
| Hannah Wright  | OT         | Bris. North | 0.8 | 15      | 18       | 83%      | 2/8/5    | 22.0 / 27.0    | 0 + 2                  | 0                  | 11 / 4       | Thu 22 Oct          | 44     | Healthy                           |
| Priya Raman    | SP         | Bris. South | 0.6 | 12      | 14       | 86%      | 2/6/4    | 18.0 / 21.0    | 1 + 0                  | 1                  | 8 / 4        | Thu 5 Nov           | 42     | Healthy                           |
| Grace Liu      | Senior OT  | Bris. North | 0.5 | 10      | 12       | 83%      | 3/5/2    | 17.0 / 18.0    | 0 + 1                  | 0                  | 7 / 3        | Wed 18 Nov          | 40     | Healthy                           |
| Tom Fitzgerald | SP         | Bris. South | 0.5 | 9       | 11       | 82%      | 1/4/4    | 12.5 / 16.5    | 1 + 0                  | 1                  | 5 / 4        | Wed 11 Nov          | 38     | Healthy                           |
| Liam Patel     | SP         | Bris. North | 0.6 | 11      | 14       | 79%      | 1/6/4    | 15.5 / 21.0    | 0 + 0                  | 1                  | 7 / 4        | Thu 19 Nov          | 36     | Healthy                           |
| Ben Holloway   | OT         | Bris. South | 0.6 | 7       | 9        | 78%      | 1/3/3    | 10.0 / 13.5    | 0 + 0                  | 0                  | 3 / 4        | Mon 16 Nov          | 33     | Healthy                           |
| Emma Clarke    | OT         | Bris. North | 1.0 | 18      | 24       | **75%**  | 3/14/1   | 29.5 / 36.0    | 0 + 0                  | 0                  | 11 / 7       | Wed 4 Nov           | 31     | Healthy · **Available**           |
| Aisha Karim    | SP         | Bris. South | 0.4 | 6       | 8        | 75%      | 0/3/3    | 7.5 / 12.0     | 0 + 0                  | 0                  | 4 / 2        | Tue 10 Nov          | 27     | Healthy                           |
| **Totals**     |            |             | 9.0 | **184** | **208**  | **88%**  | 30/95/59 |                | **12 + 5 = 17**        | **11**             | **128 / 56** | **4 due ≤ 14 days** |        | 1 At Risk · 2 Monitor · 9 Healthy |

The four clinicians named in the proposal keep their figures: Sarah 27/25 108% High **At Risk** · Emma 18/24 75% Medium **Available** · Daniel 22/25 88% Medium **Healthy** · Jessica 24/24 100% High **Monitor**.

Emma is an **OT in Brisbane North**, the same discipline and service region as Sarah, so any rebalancing keeps clients' discipline and location.

**Team capacity AI recommendation (exact copy):**

> Sarah is above configured capacity and has six complex cases. Emma currently has capacity for approximately four additional clients of comparable complexity. Leadership must review any redistribution. The system will not reassign clients automatically.

Why "four" not six: Emma has 6 open places but 6.5 free weighted units ≈ 4 medium-complexity clients.

**Continuity of care.** Established and high-complexity clients stay with Sarah. The clients a supervisor could review for transfer are Sarah's clients seen for under 3 months, not high complexity, with no open flags: **Ruby Cooper, Hugo Martin, Sienna Park, Max Gibson** (5.0 weighted units). Scenario preview only: Sarah 27 → 23 (92%), Emma 18 → 22 (92%). Nothing is applied.

---

## 3. Caseload Health score — model

Score 0–100 from configured operational indicators. **Healthy < 60 · Monitor 60–79 · At Risk ≥ 80.**

| Factor                             | Max     | Sarah                             |
| ---------------------------------- | ------- | --------------------------------- |
| Utilisation vs configured capacity | 40      | 34 (108%)                         |
| Client complexity mix (weighted)   | 20      | 17 (6 high)                       |
| Overdue documentation              | 15      | 12 (4 notes)                      |
| Pending / overdue follow-ups       | 10      | 8 (5 due, 3 overdue)              |
| Supervision status                 | 10      | 7 (due in 2 days, 2 actions open) |
| Admin hours vs target (7h/wk)      | 5       | 5 (9h)                            |
| **Total**                          | **100** | **83**                            |

Footnote on screen: _"Score reflects configured operational indicators only. It is not a clinical assessment."_ Each clinician also has a 12-week score history (Sarah 61 → 83).

---

## 4. Sarah Thompson — Caseload Detail

| Metric                  | Value                                                    |
| ----------------------- | -------------------------------------------------------- |
| Clinician               | Sarah Thompson — Occupational Therapist (Brisbane North) |
| Active clients          | **27** (23 NDIS · 4 aged care)                           |
| Recommended capacity    | **25**                                                   |
| High-complexity clients | **6**                                                    |
| Notes overdue           | **4** (plus 1 AI draft: Mia Robinson)                    |
| Follow-ups due          | **5** (3 overdue)                                        |
| Supervision due         | **2 days** — Thu 22 Oct, 2:00 pm with Grace Liu          |
| Weekly clinical hours   | **29**                                                   |
| Admin hours             | **9** (target 7)                                         |
| Caseload status         | **At Risk** (score 83)                                   |

### 12-week trend (the 6/12 week toggle shows the last 6 or all 12)

| Week starting             | 3 Aug | 10 Aug | 17 Aug | 24 Aug | 31 Aug | 7 Sep | 14 Sep | 21 Sep | 28 Sep | 5 Oct | 12 Oct | 19 Oct |
| ------------------------- | ----- | ------ | ------ | ------ | ------ | ----- | ------ | ------ | ------ | ----- | ------ | ------ |
| Active clients            | 20    | 20     | 21     | 21     | 22     | 22    | 23     | 24     | 24     | 25    | 26     | 27     |
| Weighted caseload (units) | 30.5  | 31.0   | 32.0   | 32.5   | 33.5   | 34.5  | 35.5   | 36.5   | 38.0   | 39.5  | 41.0   | 42.0   |
| Admin hours               | 5.8   | 6.0    | 6.1    | 6.3    | 6.2    | 6.4   | 6.5    | 7.0    | 6.8    | 8.2   | 8.7    | 9.0    |
| Clinical hours            | 26    | 26     | 27     | 27     | 27     | 27    | 27     | 28     | 28     | 28    | 29     | 29     |

"+18% over six weeks" refers to 35.5 → 42.0. Admin hours have been above target for the last three weeks.

### Client list (27)

| #   | Client             | Age | Service                                  | Funding   | With Sarah | Last session | Next appointment | Complexity | Documentation              | Attention                    |
| --- | ------------------ | --- | ---------------------------------------- | --------- | ---------- | ------------ | ---------------- | ---------- | -------------------------- | ---------------------------- |
| 1   | **James Thompson** | 9   | Paediatric OT · Sensory processing       | NDIS      | 2 yr 2 mo  | 29 Sep       | — Not booked     | High       | Complete                   | **Requires review** (High)   |
| 2   | **Daniel Lee**     | 34  | Functional capacity assessment           | NDIS      | 8 mo       | 8 Oct        | Tue 27 Oct       | Medium     | Progress report incomplete | **Requires review** (Medium) |
| 3   | Ruth Hallam        | 78  | Home modifications                       | Aged care | 1 yr 2 mo  | 6 Oct        | — Paused         | High       | Note overdue · 14 days     | **Requires review** (Medium) |
| 4   | Mia Robinson       | 7   | Paediatric OT · Daily routines           | NDIS      | 11 mo      | 13 Oct       | Today, 3:30 pm   | Medium     | AI draft awaiting review   | Follow-up due                |
| 5   | Oliver Grant       | 6   | Paediatric OT · Fine motor               | NDIS      | 1 yr 7 mo  | 15 Oct       | Thu 22 Oct       | High       | Note overdue · 5 days      | Flagged for supervision      |
| 6   | Ava Mitchell       | 11  | Handwriting & fine motor                 | NDIS      | 7 mo       | 11 Oct       | Mon 26 Oct       | Low        | Note overdue · 9 days      | **Requires review** (Review) |
| 7   | Lucas Brennan      | 45  | Psychosocial disability · Daily living   | NDIS      | 5 mo       | 17 Oct       | Fri 23 Oct       | Medium     | Note overdue · 3 days      | —                            |
| 8   | Isla Murphy        | 5   | Paediatric OT · Sensory processing       | NDIS      | 9 mo       | 16 Oct       | Fri 30 Oct       | High       | Complete                   | Follow-up overdue            |
| 9   | Noah Harris        | 8   | Paediatric OT · Emotional regulation     | NDIS      | 1 yr 10 mo | 14 Oct       | Wed 28 Oct       | High       | Complete                   | —                            |
| 10  | Zara Ahmed         | 4   | Early childhood OT                       | NDIS      | 4 mo       | 19 Oct       | Mon 26 Oct       | High       | Complete                   | Follow-up due                |
| 11  | Henry Ng           | 71  | Home modifications                       | Aged care | 6 mo       | 15 Oct       | Thu 29 Oct       | Medium     | Complete                   | Follow-up overdue            |
| 12  | Charlotte King     | 67  | Falls prevention & daily living          | Aged care | 10 mo      | 12 Oct       | Mon 2 Nov        | Medium     | Complete                   | —                            |
| 13  | William Foster     | 52  | Acquired brain injury · Community access | NDIS      | 1 yr 1 mo  | 14 Oct       | Wed 28 Oct       | Medium     | Complete                   | —                            |
| 14  | Ruby Cooper        | 6   | Paediatric OT · Sensory processing       | NDIS      | 2 mo       | 16 Oct       | Fri 23 Oct       | Medium     | Complete                   | —                            |
| 15  | Jack O’Neill       | 38  | Functional capacity assessment           | NDIS      | 3 mo       | 1 Oct        | Thu 22 Oct       | Medium     | Complete                   | —                            |
| 16  | Samuel Price       | 59  | Stroke · Daily living skills             | NDIS      | 4 mo       | 19 Oct       | Mon 26 Oct       | Medium     | Complete                   | —                            |
| 17  | Matilda Reid       | 3   | Early childhood OT                       | NDIS      | 6 mo       | 15 Oct       | Thu 29 Oct       | Medium     | Complete                   | —                            |
| 18  | Archie Lawson      | 12  | Paediatric OT · Emotional regulation     | NDIS      | 1 yr 5 mo  | 12 Oct       | Mon 26 Oct       | Medium     | Complete                   | —                            |
| 19  | Hugo Martin        | 7   | Paediatric OT · Sensory processing       | NDIS      | 1 mo       | 14 Oct       | Wed 21 Oct       | Medium     | Complete                   | —                            |
| 20  | Ethan Walsh        | 13  | Assistive technology                     | NDIS      | 1 yr       | 9 Oct        | Fri 6 Nov        | Low        | Complete                   | —                            |
| 21  | Chloe Bennett      | 10  | Fine motor skills                        | NDIS      | 1 yr 3 mo  | 7 Oct        | Wed 4 Nov        | Low        | Complete                   | —                            |
| 22  | Lily Turner        | 9   | Handwriting                              | NDIS      | 9 mo       | 13 Oct       | Tue 27 Oct       | Low        | Complete                   | —                            |
| 23  | Evelyn Shaw        | 83  | Equipment prescription                   | Aged care | 5 mo       | 5 Oct        | Tue 3 Nov        | Low        | Complete                   | —                            |
| 24  | Sienna Park        | 15  | Daily living skills                      | NDIS      | 2 mo       | 8 Oct        | Thu 5 Nov        | Low        | Complete                   | —                            |
| 25  | Leo Fraser         | 41  | Assistive technology review              | NDIS      | 8 mo       | 16 Oct       | Fri 30 Oct       | Low        | Complete                   | —                            |
| 26  | Freya Dunn         | 5   | Fine motor skills                        | NDIS      | 7 mo       | 13 Oct       | Tue 3 Nov        | Low        | Complete                   | —                            |
| 27  | Max Gibson         | 29  | Functional capacity assessment           | NDIS      | 1 mo       | 2 Oct        | Fri 30 Oct       | Low        | Complete                   | —                            |

Checks: High = 6 · Medium = 12 · Low = 9 · NDIS = 23 · aged care = 4 · notes overdue = 4 (Ruth, Oliver, Ava, Lucas) · follow-ups due = 5 (James, Isla, Henry overdue; Mia, Zara due).

---

## 5. AI Case Note Summariser — Mia Robinson, session 13 Oct 2026

**Client:** Mia Robinson, 7 · NDIS · Paediatric OT · Daily routines · Clinician: Sarah Thompson · Session 50 min, in clinic, parent present.

**Raw therapist notes (editable; the clinician can type or paste their own):**

```
Client struggling with morning routine.
Parent reports increased anxiety before school.
Visual schedule helping slightly.
Difficulty transitioning from breakfast to getting dressed.
Therapist demonstrated sensory regulation strategy.
Parent will trial strategy for seven days.
Review next session.
```

**Draft sections (four):**

- **Session Summary:** Client continues to experience difficulty with morning transitions, particularly between breakfast and dressing. Parent reports increased school-related anxiety. Visual scheduling has provided some improvement.
- **Interventions:** Reviewed visual schedule; introduced sensory regulation strategy; provided parent education.
- **Progress / Observations:** Visual schedule producing partial improvement in the morning routine; breakfast-to-dressing transition remains the main point of difficulty; parent-reported anxiety before school has increased.
- **Next Actions:** Parent to trial strategy for seven days; monitor morning anxiety; review effectiveness at next appointment.

**Live AI:** with `ANTHROPIC_API_KEY` set, the draft is generated by Claude (`claude-opus-5-5`) from whatever note is entered. Without a key, or if the call fails, the unchanged sample note gets the prepared draft above and a notice; an edited note shows an error instead of an unrelated draft.

Label: **AI Generated Draft — Clinician Review Required** · Controls: **Accept · Edit · Regenerate**. Estimated time saved: ~8 minutes.

---

## 6. Clients Requiring Attention (14)

Header copy: _"Requires review based on configured indicators."_ Priorities: **High / Medium / Review**. Action on every row: **Assign follow-up** (owner, due date, reason, note).

| Client              | Clinician      | Funding   | Priority | Operational reason                                                      | Days since last contact |
| ------------------- | -------------- | --------- | -------- | ----------------------------------------------------------------------- | ----------------------- |
| **James Thompson**  | Sarah Thompson | NDIS      | **High** | No appointment for 21 days; follow-up overdue; therapist caseload high. | 21                      |
| Kai Robertson       | Jessica Nguyen | NDIS      | **High** | Follow-up overdue 9 days; NDIS plan review in 12 days.                  | 16                      |
| **Sophie Williams** | Jessica Nguyen | NDIS      | Medium   | Two cancelled appointments; goal review due in 7 days.                  | 19                      |
| **Daniel Lee**      | Sarah Thompson | NDIS      | Medium   | NDIS plan review approaching; progress report incomplete.               | 12                      |
| Ruth Hallam         | Sarah Thompson | Aged care | Medium   | Appointments paused; no next appointment booked; note overdue 14 days.  | 14                      |
| Amelia Scott        | Marcus Bell    | NDIS      | Medium   | Three sessions not rebooked; last contact 18 days ago.                  | 18                      |
| Joshua Kelly        | Marcus Bell    | NDIS      | Medium   | Referral letter to paediatrician pending 10 days.                       | 7                       |
| Mason Wood          | Daniel Okafor  | Aged care | Medium   | Discharge plan agreed; no review appointment booked.                    | 15                      |
| Patrick Doyle       | Tom Fitzgerald | Aged care | Medium   | Follow-up overdue 6 days; swallowing review requested by family.        | 13                      |
| Ava Mitchell        | Sarah Thompson | NDIS      | Review   | Session note overdue 9 days.                                            | 9                       |
| Harper Lewis        | Jessica Nguyen | NDIS      | Review   | Session note overdue 4 days.                                            | 6                       |
| Olivia Hughes       | Daniel Okafor  | Aged care | Review   | Outcome measure not recorded at 6-week point.                           | 8                       |
| Ella Morgan         | Priya Raman    | NDIS      | Review   | Goal review due in 5 days.                                              | 10                      |
| Margaret Quinn      | Liam Patel     | Aged care | Review   | Communication aid trial outcome not recorded.                           | 11                      |

Charts on this screen (by reason, by clinician, by days since contact) are clickable and filter the queue.

---

## 7. Supervision — Sarah Thompson (supervisor: Grace Liu)

| Field                        | Value                                                             |
| ---------------------------- | ----------------------------------------------------------------- |
| Last supervision             | Thu 24 Sep 2026                                                   |
| Next supervision             | **Thu 22 Oct 2026, 2:00 pm** (in 2 days) · 60 min · Video call    |
| Frequency                    | Every 4 weeks (individual)                                        |
| Protected time               | 60 min, blocked in both calendars                                 |
| Held on schedule             | 1 of last 3 (30 Jul rescheduled · 27 Aug cancelled · 24 Sep held) |
| Cases flagged for discussion | 4 — James Thompson, Daniel Lee, Oliver Grant, Ruth Hallam         |
| Workload trend               | Weighted caseload +18% over 6 weeks (see §4)                      |

**Development goals**

1. Advanced sensory integration module — 60%, due Dec 2026.
2. Supervision CPD hours — 14 of 20 h (70%), due Jun 2027.
3. Co-facilitate parent education group — planned, Term 4.

**Previous supervision actions (from 24 Sep)**

| Action                                          | Owner | Status    |
| ----------------------------------------------- | ----- | --------- |
| Close out September session notes               | Sarah | **Open**  |
| Review appointment frequency for James Thompson | Sarah | **Open**  |
| Pause new intake while caseload > 25            | Grace | Completed |
| Book assistive technology trial for Ruth Hallam | Sarah | Completed |

**AI supervision brief (six items under five headings):**

- _Workload changes:_ 1. Caseload increased 18% over six weeks. 2. Admin hours exceeded the target for three consecutive weeks.
- _Overdue documentation:_ 3. Four clinical notes remain incomplete.
- _Complex cases:_ 4. Two complex clients have recent changes requiring discussion (Oliver Grant — new external report received 14 Oct; Ruth Hallam — appointments paused following family update).
- _Pending follow-ups:_ 5. Five client follow-ups are due, three of them overdue (James Thompson, Isla Murphy, Henry Ng).
- _Previous supervision actions:_ 6. Follow-up actions from previous supervision remain open (2 of 4).

**Team supervision, next 14 days:** Sarah Thu 22 Oct 2:00 pm · Hannah Thu 22 Oct 11:00 am · Jessica Mon 26 Oct 9:30 am · Marcus Thu 29 Oct 1:00 pm.

---

## 8. Admin Reduction & AI Opportunities (org-wide, last 4 weeks)

Total logged clinician time ≈ 342 h/week (all 12 clinicians).

| Activity                    | Share   | ≈ hours / week |
| --------------------------- | ------- | -------------- |
| Clinical sessions           | **55%** | 188            |
| Travel between visits       | **12%** | 41             |
| Documentation               | **16%** | 55             |
| Reports                     | **7%**  | 24             |
| Scheduling & internal admin | **10%** | 34             |

Medisense works in clients' homes, so travel between visits is its own category. The 12-week trend of hours outside sessions rises from 129 h to 154 h per week. Individual admin targets (7 h per 1.0 FTE, pro-rated) cover documentation; Sarah (9.0 h of 7.0), Jessica (8.5 of 7.0) and Marcus (8.1 of 7.0) are over target.

| AI opportunity           | Est. time returned / week (team)                      |
| ------------------------ | ----------------------------------------------------- |
| Case note summary        | 14 h                                                  |
| Progress report drafting | 9 h                                                   |
| Supervision preparation  | 4 h                                                   |
| Follow-up identification | 3 h                                                   |
| Weekly caseload summary  | 2 h                                                   |
| **Total**                | **≈ 32 h / week (≈ 0.8 FTE)** — labelled _"Estimate"_ |

---

## 9. AI Progress Report — Emily Carter (clinician: Hannah Wright)

- **Client:** Emily Carter, 8 · NDIS · Paediatric OT · Report period 14 Apr – 16 Oct 2026 · Due **Fri 23 Oct** · NDIS plan review Fri 6 Nov.
- **Approved inputs:** 12 approved session notes · 3 goals · Attendance 11 / 12 (92%) · Interventions log · Outcome measures (COPM) · Previous report (Apr 2026).
- **Goals:** 1. Dress independently for school within 15 minutes. 2. Produce legible handwriting for a 3-sentence task. 3. Use a self-regulation strategy during classroom transitions with ≤ 1 prompt.
- **Outcome measures (COPM, 1–10):** Performance 4.2 → 6.4 · Satisfaction 3.8 → 6.9.
- Sections: Current Goals · Interventions Delivered · Observed Progress · Barriers · Recommended Next Steps (unchanged from revision 1).

---

## 10. My Day — Hannah Wright (Clinician Home, 0.8 FTE)

| Time     | Client       | Service                      | Location        |
| -------- | ------------ | ---------------------------- | --------------- |
| 8:30 am  | Emily Carter | Paediatric OT · NDIS         | Home visit      |
| 10:00 am | Leo Banks    | Upper-limb function · NDIS   | Home visit      |
| 11:30 am | Poppy Shaw   | Early childhood OT · NDIS    | Home visit, Kew |
| 2:00 pm  | George Adams | Falls prevention · Aged care | Home visit      |
| 3:30 pm  | Nina Fischer | Community access · NDIS      | Telehealth      |

2 notes awaiting approval (AI drafts: Leo Banks, Poppy Shaw) · 1 client follow-up (Poppy Shaw) · 1 progress report due (Emily Carter, Fri 23 Oct) · Supervision Thu 22 Oct, 11:00 am with Grace Liu.

---

## 11. Projected impact panel (overview)

Labelled _"Estimate from the admin breakdown · not pilot results"_. Neil has not run a pilot, so nothing is presented as an observed outcome.

| Measure                      | Now | Projected | Note                       |
| ---------------------------- | --- | --------- | -------------------------- |
| Team hours returned / week   | 0   | ≈32       | ≈0.8 FTE of capacity       |
| Supervision prep / session   | 45m | 10m       | Brief drafted ahead        |
| Notes overdue                | 12  | ≤5        | Drafts ready same day      |
| Follow-ups overdue           | 11  | ≤4        | Surfaced before they lapse |
| Supervision held on schedule | 72% | 95%       | Protected time tracked     |

---

## 12. Audit trail (sample entries)

| Time         | Actor          | Action                                                                    | Object                        |
| ------------ | -------------- | ------------------------------------------------------------------------- | ----------------------------- |
| 20 Oct 10:42 | Medisense AI   | Generated draft summary (live · claude-opus-5-5, or prepared draft)       | Mia Robinson · session 13 Oct |
| 20 Oct 10:45 | Sarah Thompson | Edited draft (2 changes)                                                  | Mia Robinson · session 13 Oct |
| 20 Oct 10:46 | Sarah Thompson | Approved summary                                                          | Mia Robinson · session 13 Oct |
| 20 Oct 10:52 | Neil Hensley   | Assigned follow-up to Sarah Thompson: Rebook appointment (due Thu 22 Oct) | James Thompson                |
| 20 Oct 09:15 | Medisense AI   | Prepared supervision brief                                                | Sarah Thompson · 22 Oct       |
| 19 Oct 16:20 | Grace Liu      | Added discussion item                                                     | Sarah Thompson · 22 Oct       |
| 19 Oct 15:02 | Medisense AI   | Generated capacity recommendation (not applied)                           | Team capacity                 |

---

## 13. Phase 1 additions (intake, forms, tasks, assistant)

Source of truth: `src/data/referrals.ts`, `src/data/forms.ts`, `src/data/tasks.ts`, `src/data/case-note.ts`, `src/lib/assistant.ts`.

- **Referrals (7 this week):** Leila Haddad (email from support coordinator, needs verification), Arthur Bennett (GP letter, missing information), Isla Murphy (web form, possible duplicate of the existing client), Hamza Ali (web form, new), Tom Reyes (phone intake, ready to create), Doris Kemp (profile created), Oscar Lin (first visit booked). Each has the original document, AI-extracted fields with source line and confidence, missing items and an AI-drafted request email.
- **Smart forms (3 drafts):** home modification funding request for Ruth Hallam (aged care), assistive technology request for Ava Mitchell (NDIS; first sync deliberately fails to show exception handling and retry), NDIS service agreement for Leila Haddad. Every field shows its source (client profile, approved note, referral, NDIS plan, documents, Medisense policy) or is flagged as not found.
- **Tasks (15 seeded):** follow-ups, document requests, scheduling, communication and supervision tasks across the team; tasks more than 3 days overdue are escalated to Grace Liu. Approving a case note proposes follow-up tasks that are created only on confirmation.
- **Case notes (5 cases):** Mia Robinson plus Sarah's four overdue notes (Oliver Grant, Ruth Hallam, Lucas Brennan, Ava Mitchell). Each has a Structured and a SOAP view, missing-information alerts, version history from the audit trail, and suggested follow-ups. Voice dictation uses the browser's speech recognition (Chrome/Edge) or a replayed sample.
- **Ask Medisense:** answers about priorities, outstanding notes, capacity, a named client's paperwork, referrals, follow-ups and supervision, with links back to the screen to act on; it can draft an email for review.

---

## 14. Phase 2 additions (clients, schedule, reports, admin operations, automations)

Source of truth: `src/data/client-profiles.ts`, `src/data/client-directory.ts`, `src/data/schedule.ts`, `src/data/reports-library.ts`, `src/data/admin-operations.ts`, `src/data/automations.ts`. Everything is frontend demo data; actions are kept in the session store and logged to the audit trail.

- **Clients:** a 50-record sample of the 184 clients (Sarah's caseload, clients requiring attention, Hannah's day, recent referrals). Org totals: Brisbane North 105 (74 NDIS, 31 aged care), Brisbane South 79 (54 NDIS, 25 aged care). Full profiles for Emily Carter, Ruth Hallam, Mia Robinson and James Thompson: goals with six months of progress, funding burn against an even spread, attendance, timeline, documents and an AI summary.
- **Schedule (week of Mon 19 Oct):** generated from each clinician's FTE and status; Hannah's Tuesday matches My Day; Wednesday team meeting at 12:45 pm; Sarah's supervision Thu 2:00 pm. Four AI suggestions: book James Thompson into Sarah's cancelled Thu 10:00 slot (closes the rebook task), telehealth call with Ruth Hallam's daughter Fri 3:30 pm, Kai Robertson into Jessica's Wed 3:30 pm slot (closes the plan review task), reorder Marcus Bell's Thursday route (≈38 min less driving).
- **Reports:** 18 reports across seven types and five statuses; turnaround falls from 13.5 to 8.4 working days over 12 weeks; Emily Carter's report links to the full review flow and shows Approved once approved there.
- **Admin operations:** 12 client expiries (plans, agreements, consents, a missing builder quote) and six staff exceptions (Ben Holloway first aid expired; Liam Patel Blue Card in 12 days; Aisha Karim SPA certification in 25 days; Jessica Nguyen NDIS Worker Screening in 29 days; Tom Fitzgerald vehicle insurance in 40 days; Priya Raman first aid in 50 days).
- **Automations:** 11 rules (9 on), including the existing task escalation (3 days → Grace Liu) and 21-day rebook rule; a rule builder that tests against today's data and saves new rules switched off.

---

## 15. Phase 3 additions (analytics, family portal, security, My Day and supervision)

Source of truth: `src/data/analytics.ts`, `src/data/portal.ts`, `src/data/settings.ts`. Frontend only.

- **Analytics:** 12-week series: sessions 152 → 171 per week, cancellations ≈15 per week, billable hours NDIS 118 → 131 and aged care 41 → 47, notes approved within 2 days 71% → 64%, referral to first visit 16 → 19 days, goals on track OT 64% → 68% and Speech 70% → 72%. 428 active goals (62 achieved, 141 on track, 187 progressing, 38 at risk). Counts scale with the filtered team's share of active clients; the clinician table uses this week's schedule.
- **Family portal:** Emily Carter's parent Rachel. Next visit Tue 27 Oct 8:30 am; four home-program items; three goals in plain language; the progress report stays locked until Hannah approves it on the report screen. A message creates a reply task for Hannah (shown on My Day); a change request creates a scheduling task for the admin team.
- **Security & integrations:** 10 permissions × 4 roles (approving AI drafts and own caseload are locked), six AI guardrails (approval, no contact with families and no training are locked on), six generic integrations (practice management system, email & calendar, website referral form connected; SMS, NDIS claims export, accounting available). Security facts describe the proposed setup.

## Connected story additions

Fictional details added for the connected story (see `src/data/story.ts`):

- **People:** Jo Marsh and Sam Doyle (admin team), Claire Grant (Oliver's mother).
- **Oliver Grant:** a home visit today, 9:30 to 10:15 am, Kedron. Date of birth 12/03/2020, NDIS number 430 118 276. The dataset's 15 Oct overdue note is treated as this note, so Sarah's "Notes to write" goes from 4 to 3 on approval.
- **Sarah's day:** Henry Ng, Oliver Grant, Isla Murphy, Zara Ahmed and Ava Mitchell, about 50 minutes of driving.
- **Follow-ups with no owner:** 5 across the team, 2 of them Sarah's.
- **Score rule:** 3 points per overdue note on Sarah's Overdue documentation factor, so 83 to 80 on approval, still At Risk.
- **Tasks:** Isla Murphy's call-back is now due Thu 15 Oct, not a Saturday. Admin tasks added for Ruth Hallam and Leila Haddad. Henry Ng's and Sophie Williams's tasks are owned by Jo Marsh.
- **Form sync exception:** Ava Mitchell's assistive technology request starts with a failed sync.
