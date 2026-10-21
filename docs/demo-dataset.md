# Medisense — Master Demo Dataset (synthetic)

> All people, clients and figures below are **fictional demo data**. Every screen must use these exact values so numbers agree everywhere.
> The names from the proposal (Sarah Thompson, Emma, Daniel, Jessica, James Thompson, Sophie Williams, Daniel Lee, Emily) are used as written.

## 0. Context

- **Organisation:** Kestrel Allied Health — multidisciplinary allied health provider, Melbourne (Richmond & Box Hill sites).
- **Demo "today":** **Tuesday 20 October 2026**.
- **Logged-in user:** **Neil Hensley**, Director of Clinical Services (Leadership role).
- **Clinical supervisor:** Grace Liu, Senior Occupational Therapist & Clinical Supervisor.
- **Clinician persona for "My Day":** Hannah Wright, Occupational Therapist.

---

## 1. Organisation KPIs (Leadership Dashboard)

| KPI                         | Value    | Caption                                    |
| --------------------------- | -------- | ------------------------------------------ |
| Active Clinicians           | **10**   | 9.3 FTE across 2 sites                     |
| Total Active Clients        | **201**  | ↑ 9 in the last 6 weeks                    |
| Average Caseload            | **20.1** | Org utilisation 90% of configured capacity |
| Clinicians Near Capacity    | **3**    | ≥ 95% of configured capacity               |
| Clients Requiring Attention | **14**   | 2 high · 7 medium · 5 low                  |
| Notes Awaiting Completion   | **23**   | 15 overdue · 8 drafts awaiting approval    |
| Supervision Sessions Due    | **5**    | Next 14 days                               |
| Client Follow-ups Overdue   | **9**    | ↓ 3 vs last week                           |

---

## 2. Clinicians (Team Capacity & Caseload Health)

Utilisation = active ÷ configured capacity. Health score = Caseload Health (0–100, see §3).

| Clinician      | Role                            | FTE          | Active  | Capacity | Utilisation | Complexity | High-complexity | Notes overdue/awaiting | Follow-ups overdue | Next supervision    | Health score | Status                         |
| -------------- | ------------------------------- | ------------ | ------- | -------- | ----------- | ---------- | --------------- | ---------------------- | ------------------ | ------------------- | ------------ | ------------------------------ |
| Sarah Thompson | Occupational Therapist          | 1.0          | 27      | 25       | **108%**    | High       | 6               | 4                      | 3                  | Thu 22 Oct (2 days) | **83**       | **Over Capacity**              |
| Jessica Nguyen | Occupational Therapist          | 1.0          | 24      | 24       | **100%**    | High       | 5               | 3                      | 2                  | Mon 26 Oct          | **72**       | **Monitor**                    |
| Marcus Bell    | Clinical Psychologist           | 1.0          | 23      | 24       | 96%         | Medium     | 3               | 3                      | 2                  | Thu 29 Oct          | **66**       | **Monitor**                    |
| Daniel Okafor  | Psychologist                    | 1.0          | 22      | 25       | **88%**     | Medium     | 3               | 2                      | 1                  | Thu 12 Nov          | 49           | **Healthy**                    |
| Priya Raman    | Speech Pathologist              | 1.0          | 21      | 24       | 88%         | Medium     | 2               | 2                      | 0                  | Thu 5 Nov           | 46           | Healthy                        |
| Liam Patel     | Physiotherapist                 | 1.0          | 20      | 24       | 83%         | Low        | 1               | 1                      | 0                  | Thu 19 Nov          | 37           | Healthy                        |
| Hannah Wright  | Occupational Therapist          | 0.9          | 19      | 22       | 86%         | Medium     | 2               | 2                      | 0                  | **Thu 22 Oct**      | 44           | Healthy                        |
| Emma Clarke    | Speech Pathologist              | 1.0          | 18      | 24       | **75%**     | Medium     | 2               | 1                      | 0                  | Wed 4 Nov           | 31           | Healthy · **Available**        |
| Tom Fitzgerald | Physiotherapist                 | 0.8          | 16      | 20       | 80%         | Low        | 1               | 2                      | 1                  | Fri 30 Oct          | 41           | Healthy                        |
| Grace Liu      | Senior OT & Clinical Supervisor | 0.5 clinical | 11      | 12       | 92%         | High       | 3               | 3                      | 0                  | Wed 18 Nov          | 45           | Healthy                        |
| **Totals**     |                                 | **9.3**      | **201** | **224**  | **90%**     |            | **28**          | **23**                 | **9**              | **5 due ≤ 14 days** |              | 1 over · 2 monitor · 7 healthy |

Proposal table (§8) is a subset of the above: Sarah 27/25 108% High Overloaded→**Over Capacity** · Emma 18/24 75% Medium **Available** · Daniel 22/25 88% Medium **Healthy** · Jessica 24/24 100% High **Monitor**.

**Team capacity AI recommendation (exact copy):**

> Sarah is above configured capacity and has six complex cases. Emma currently has capacity for approximately four additional clients of comparable complexity. Leadership must review any redistribution — the system will not reassign clients automatically.

Why "four" not six: Emma has 6 open slots, but capacity is complexity-weighted (Low 1.0 · Medium 1.5 · High 2.5 units). Emma has ~6.5 free units ≈ 4 medium-complexity clients.

---

## 3. Caseload Health score — model

Score 0–100 from configured operational indicators. **Healthy < 60 · Monitor 60–79 · Over Capacity ≥ 80.**

| Factor                             | Max     | Sarah                             | Jessica     | Emma     |
| ---------------------------------- | ------- | --------------------------------- | ----------- | -------- |
| Utilisation vs configured capacity | 40      | 34 (108%)                         | 30 (100%)   | 14 (75%) |
| Client complexity mix (weighted)   | 20      | 17 (6 high)                       | 15 (5 high) | 8        |
| Overdue documentation              | 15      | 12 (4 notes)                      | 9 (3)       | 3 (1)    |
| Pending / overdue follow-ups       | 10      | 8 (5 due, 3 overdue)              | 7           | 0        |
| Supervision status                 | 10      | 7 (due in 2 days, 2 actions open) | 6           | 3        |
| Admin hours vs target (7h/wk)      | 5       | 5 (9h)                            | 5 (8.5h)    | 3 (7h)   |
| **Total**                          | **100** | **83**                            | **72**      | **31**   |

Footnote on screen: _"Score reflects configured operational indicators only. It is not a clinical assessment."_

---

## 4. Sarah Thompson — Caseload Detail

| Metric                  | Value                                              |
| ----------------------- | -------------------------------------------------- |
| Clinician               | Sarah Thompson — Occupational Therapist (Richmond) |
| Active clients          | **27**                                             |
| Recommended capacity    | **25**                                             |
| High-complexity clients | **6**                                              |
| Notes overdue           | **4**                                              |
| Follow-ups due          | **5** (3 overdue)                                  |
| Supervision due         | **2 days** — Thu 22 Oct, 2:00 pm with Grace Liu    |
| Weekly clinical hours   | **29**                                             |
| Admin hours             | **9** (target 7)                                   |
| Caseload status         | **Over Capacity** (score 83)                       |

### 6-week trend

| Week starting             | 14 Sep | 21 Sep | 28 Sep | 5 Oct | 12 Oct | 19 Oct                     |
| ------------------------- | ------ | ------ | ------ | ----- | ------ | -------------------------- |
| Active clients            | 23     | 24     | 24     | 25    | 26     | 27                         |
| Weighted caseload (units) | 35.5   | 36.5   | 38.0   | 39.5  | 41.0   | 42.0 (**+18%**)            |
| Admin hours               | 6.5    | 7.0    | 6.8    | 8.2   | 8.7    | 9.0 (3 weeks above target) |
| Clinical hours            | 27     | 28     | 28     | 28    | 29     | 29                         |

### Client list (27)

| #   | Client             | Age | Service                              | Last session | Next appointment | Complexity | Documentation              | Attention                    |
| --- | ------------------ | --- | ------------------------------------ | ------------ | ---------------- | ---------- | -------------------------- | ---------------------------- |
| 1   | **James Thompson** | 9   | Paediatric OT · Sensory processing   | 29 Sep       | — Not booked     | High       | Complete                   | **Requires review** (High)   |
| 2   | **Daniel Lee**     | 34  | Functional capacity assessment       | 8 Oct        | Tue 27 Oct       | Medium     | Progress report incomplete | **Requires review** (Medium) |
| 3   | Ruth Hallam        | 78  | Home modifications                   | 6 Oct        | — Paused         | High       | Note overdue · 14 days     | **Requires review** (Medium) |
| 4   | Mia Robinson       | 7   | Paediatric OT · Daily routines       | 13 Oct       | Today, 3:30 pm   | Medium     | AI draft awaiting review   | Follow-up due                |
| 5   | Oliver Grant       | 6   | Paediatric OT · Fine motor           | 15 Oct       | Thu 22 Oct       | High       | Note overdue · 5 days      | Flagged for supervision      |
| 6   | Ava Mitchell       | 11  | Handwriting & fine motor             | 11 Oct       | Mon 26 Oct       | Low        | Note overdue · 9 days      | **Requires review** (Low)    |
| 7   | Lucas Brennan      | 45  | Hand therapy · post-surgical         | 17 Oct       | Fri 23 Oct       | Medium     | Note overdue · 3 days      | —                            |
| 8   | Isla Murphy        | 5   | Paediatric OT · Sensory processing   | 16 Oct       | Fri 30 Oct       | High       | Complete                   | Follow-up overdue            |
| 9   | Noah Harris        | 8   | Paediatric OT · Emotional regulation | 14 Oct       | Wed 28 Oct       | High       | Complete                   | —                            |
| 10  | Zara Ahmed         | 4   | Early intervention OT                | 19 Oct       | Mon 26 Oct       | High       | Complete                   | Follow-up due                |
| 11  | Henry Ng           | 71  | Home modifications                   | 15 Oct       | Thu 29 Oct       | Medium     | Complete                   | Follow-up overdue            |
| 12  | Charlotte King     | 67  | Falls prevention & daily living      | 12 Oct       | Mon 2 Nov        | Medium     | Complete                   | —                            |
| 13  | William Foster     | 52  | Return-to-work program               | 14 Oct       | Wed 28 Oct       | Medium     | Complete                   | —                            |
| 14  | Ruby Cooper        | 6   | Paediatric OT · Sensory processing   | 16 Oct       | Fri 23 Oct       | Medium     | Complete                   | —                            |
| 15  | Jack O'Neill       | 38  | Functional capacity assessment       | 1 Oct        | Thu 22 Oct       | Medium     | Complete                   | —                            |
| 16  | Samuel Price       | 59  | Stroke rehabilitation · daily living | 19 Oct       | Mon 26 Oct       | Medium     | Complete                   | —                            |
| 17  | Matilda Reid       | 3   | Early intervention OT                | 15 Oct       | Thu 29 Oct       | Medium     | Complete                   | —                            |
| 18  | Archie Lawson      | 12  | Paediatric OT · Emotional regulation | 12 Oct       | Mon 26 Oct       | Medium     | Complete                   | —                            |
| 19  | Hugo Martin        | 7   | Paediatric OT · Sensory processing   | 14 Oct       | Wed 21 Oct       | Medium     | Complete                   | —                            |
| 20  | Ethan Walsh        | 13  | Assistive technology                 | 9 Oct        | Fri 6 Nov        | Low        | Complete                   | —                            |
| 21  | Chloe Bennett      | 10  | Fine motor skills                    | 7 Oct        | Wed 4 Nov        | Low        | Complete                   | —                            |
| 22  | Lily Turner        | 9   | Handwriting                          | 13 Oct       | Tue 27 Oct       | Low        | Complete                   | —                            |
| 23  | Evelyn Shaw        | 83  | Equipment prescription               | 5 Oct        | Tue 3 Nov        | Low        | Complete                   | —                            |
| 24  | Sienna Park        | 15  | Daily living skills                  | 8 Oct        | Thu 5 Nov        | Low        | Complete                   | —                            |
| 25  | Leo Fraser         | 41  | Hand therapy                         | 16 Oct       | Fri 30 Oct       | Low        | Complete                   | —                            |
| 26  | Freya Dunn         | 5   | Fine motor skills                    | 13 Oct       | Tue 3 Nov        | Low        | Complete                   | —                            |
| 27  | Max Gibson         | 29  | Functional capacity assessment       | 2 Oct        | Fri 30 Oct       | Low        | Complete                   | —                            |

Checks: High = 6 · Medium = 12 · Low = 9 · notes overdue = 4 (Ruth, Oliver, Ava, Lucas) · follow-ups due = 5 (James, Isla, Henry overdue; Mia, Zara due).

---

## 5. AI Case Note Summariser — Mia Robinson, session 13 Oct 2026

**Client:** Mia Robinson, 7 · Paediatric OT · Daily routines · Clinician: Sarah Thompson · Session 50 min, in clinic, parent present.

**Raw therapist notes (as typed):**

```
Client struggling with morning routine.
Parent reports increased anxiety before school.
Visual schedule helping slightly.
Difficulty transitioning from breakfast to getting dressed.
Therapist demonstrated sensory regulation strategy.
Parent will trial strategy for seven days.
Review next session.
```

**AI-generated draft:**

- **Session Summary:** Client continues to experience difficulty with morning transitions, particularly between breakfast and dressing. Parent reports increased school-related anxiety. Visual scheduling has provided some improvement.
- **Interventions:** Reviewed visual schedule; introduced sensory regulation strategy; provided parent education.
- **Next Actions:** Parent to trial strategy for seven days; monitor morning anxiety; review effectiveness at next appointment.

Label: **AI Generated Draft — Clinician Review Required** · Generated 20 Oct 2026, 10:42 · Source: 1 session note (13 Oct).
Controls: **Accept · Edit · Regenerate**. Estimated time saved: ~8 minutes.

---

## 6. Clients Requiring Attention (14)

Header copy: _"Requires review based on configured operational indicators."_ Action on every row: **Assign Follow-up**.

| Client              | Clinician      | Priority | Operational reason                                                      | Days since last contact |
| ------------------- | -------------- | -------- | ----------------------------------------------------------------------- | ----------------------- |
| **James Thompson**  | Sarah Thompson | **High** | No appointment for 21 days; follow-up overdue; therapist caseload high. | 21                      |
| Kai Robertson       | Jessica Nguyen | **High** | Follow-up overdue 9 days; funding review in 12 days.                    | 16                      |
| **Sophie Williams** | Jessica Nguyen | Medium   | Two cancelled appointments; goal review due in 7 days.                  | 19                      |
| **Daniel Lee**      | Sarah Thompson | Medium   | Funding review approaching; progress report incomplete.                 | 12                      |
| Ruth Hallam         | Sarah Thompson | Medium   | Appointments paused; no next appointment booked; note overdue 14 days.  | 14                      |
| Amelia Scott        | Marcus Bell    | Medium   | Three sessions not rebooked; last contact 18 days ago.                  | 18                      |
| Joshua Kelly        | Marcus Bell    | Medium   | Referral letter pending 10 days.                                        | 7                       |
| Mason Wood          | Daniel Okafor  | Medium   | Discharge plan agreed; no review appointment booked.                    | 15                      |
| Patrick Doyle       | Tom Fitzgerald | Medium   | Follow-up overdue 6 days.                                               | 13                      |
| Ava Mitchell        | Sarah Thompson | Low      | Session note overdue 9 days.                                            | 9                       |
| Harper Lewis        | Jessica Nguyen | Low      | Session note overdue 4 days.                                            | 6                       |
| Olivia Hughes       | Daniel Okafor  | Low      | Outcome measure not recorded at 6-week point.                           | 8                       |
| Ella Morgan         | Priya Raman    | Low      | Goal review due in 5 days.                                              | 10                      |
| Margaret Quinn      | Liam Patel     | Low      | Equipment trial outcome not recorded.                                   | 11                      |

---

## 7. Supervision — Sarah Thompson (supervisor: Grace Liu)

| Field                        | Value                                                                |
| ---------------------------- | -------------------------------------------------------------------- |
| Last supervision             | Thu 24 Sep 2026                                                      |
| Next supervision             | **Thu 22 Oct 2026, 2:00 pm** (in 2 days) · 60 min · Richmond, Room 3 |
| Frequency                    | Every 4 weeks (individual)                                           |
| Cases flagged for discussion | 4 — James Thompson, Daniel Lee, Oliver Grant, Ruth Hallam            |
| Workload trend               | Weighted caseload +18% over 6 weeks (see §4)                         |

**Pending development goals**

1. Advanced sensory integration module — 60% complete, due Dec 2026.
2. Co-facilitate parent education group — planned Term 4.

**Previous supervision actions (from 24 Sep)**

| Action                                          | Owner | Status    |
| ----------------------------------------------- | ----- | --------- |
| Close out September session notes               | Sarah | **Open**  |
| Review appointment frequency for James Thompson | Sarah | **Open**  |
| Pause new intake while caseload > 25            | Grace | Completed |
| Book assistive technology trial for Ruth Hallam | Sarah | Completed |

**AI suggested discussion items (exact):**

1. Caseload increased 18% over six weeks.
2. Four clinical notes remain incomplete.
3. Two complex clients have recent changes requiring discussion. _(Oliver Grant — new external report received 14 Oct; Ruth Hallam — appointments paused following family update.)_
4. Follow-up actions from previous supervision remain open. _(2 of 4.)_
5. Admin hours exceeded the target for three consecutive weeks.

---

## 8. Admin Reduction & AI Opportunities (org-wide, last 4 weeks)

Total logged clinician time ≈ 353 h/week.

| Activity                | Share   | ≈ hours / week |
| ----------------------- | ------- | -------------- |
| Clinical sessions       | **61%** | 215            |
| Documentation           | **18%** | 64             |
| Reports                 | **8%**  | 28             |
| Scheduling & follow-ups | **6%**  | 21             |
| Internal admin          | **7%**  | 25             |

| AI opportunity           | Est. time returned / week (team)                       |
| ------------------------ | ------------------------------------------------------ |
| Case note summary        | 14 h                                                   |
| Progress report drafting | 9 h                                                    |
| Supervision preparation  | 4 h                                                    |
| Follow-up identification | 3 h                                                    |
| Weekly caseload summary  | 2 h                                                    |
| **Total**                | **≈ 32 h / week (≈ 0.85 FTE)** — labelled _"Estimate"_ |

---

## 9. AI Progress Report — Emily Carter (clinician: Hannah Wright)

- **Client:** Emily Carter, 8 · Paediatric OT · Report period 14 Apr – 16 Oct 2026 · Due **Fri 23 Oct** · Funding review Fri 6 Nov.
- **Approved inputs:** 12 approved session notes · 3 goals · Attendance 11 / 12 (92%) · Interventions log · Outcome measures (COPM) · Previous report (Apr 2026).
- **Goals:**
  1. Dress independently for school within 15 minutes.
  2. Produce legible handwriting for a 3-sentence task.
  3. Use a self-regulation strategy during classroom transitions with ≤ 1 prompt.
- **Outcome measures (COPM, 1–10):** Performance 4.2 → 6.4 · Satisfaction 3.8 → 6.9.

**Generated sections (draft):**

- **Current Goals** — as above, with status: Goal 1 _largely achieved_ · Goal 2 _progressing_ · Goal 3 _progressing_.
- **Interventions Delivered** — Graded dressing practice with visual sequence; fine-motor and pencil-grip program; sensory regulation strategies with teacher liaison (2 school visits).
- **Observed Progress** — Dressing time reduced from ~30 to ~17 minutes (parent report). Handwriting legible for 2 of 3 sentences. Uses regulation strategy at transitions with 1–2 prompts (teacher report). COPM performance +2.2, satisfaction +3.1.
- **Barriers** — One cancelled session (illness); limited carry-over of handwriting tasks at home during school holidays.
- **Recommended Next Steps** — Continue fortnightly OT for next period; home handwriting program 3× weekly; review regulation goal with teacher in Term 1. _Final recommendations subject to clinician review._

---

## 10. My Day — Hannah Wright (Clinician Home)

- Today's appointments: **5**
  | Time     | Client       | Service                | Location         |
  | -------- | ------------ | ---------------------- | ---------------- |
  | 8:30 am  | Emily Carter | Paediatric OT          | Richmond, Room 2 |
  | 10:00 am | Leo Banks    | Hand therapy           | Richmond, Room 2 |
  | 11:30 am | Poppy Shaw   | Early intervention OT  | Home visit, Kew  |
  | 2:00 pm  | George Adams | Falls prevention       | Richmond, Room 2 |
  | 3:30 pm  | Nina Fischer | Return-to-work program | Telehealth       |
- **2 notes awaiting approval** (AI drafts: Leo Banks 19 Oct, Poppy Shaw 19 Oct)
- **1 client follow-up** — Call parent re: school visit (Poppy Shaw)
- **1 progress report due** — Emily Carter, Fri 23 Oct
- **Supervision Thursday** — Thu 22 Oct, 11:00 am with Grace Liu
- AI Assistant shortcuts: _Summarise today's notes_ · _Prepare my supervision_ · _Show clients needing follow-up_ · _Draft Emily's progress report_

---

## 11. Impact panel (story step 7) — "Since Medisense pilot began (8 weeks)"

Label clearly: _Illustrative pilot outcomes · demo data_.

| Measure                               | Before | Now  | Change                                            |
| ------------------------------------- | ------ | ---- | ------------------------------------------------- |
| Overdue notes (org)                   | 41     | 15   | −63%                                              |
| Missed / overdue follow-ups           | 17     | 9    | −47%                                              |
| Clinicians over capacity              | 3      | 1    | −2                                                |
| Supervision sessions held on schedule | 70%    | 100% | +30 pts                                           |
| Admin hours per clinician / week      | 10.4   | 8.1  | −2.3 h (≈ 21 h team-wide returned to client care) |

---

## 12. Audit trail (sample entries)

| Time         | Actor          | Action                                          | Object                        |
| ------------ | -------------- | ----------------------------------------------- | ----------------------------- |
| 20 Oct 10:42 | Medisense AI   | Generated draft summary                         | Mia Robinson · session 13 Oct |
| 20 Oct 10:45 | Sarah Thompson | Edited draft (2 changes)                        | Mia Robinson · session 13 Oct |
| 20 Oct 10:46 | Sarah Thompson | Approved summary                                | Mia Robinson · session 13 Oct |
| 20 Oct 09:58 | Neil Hensley   | Assigned follow-up to Sarah Thompson            | James Thompson                |
| 20 Oct 09:15 | Medisense AI   | Prepared supervision brief                      | Sarah Thompson · 22 Oct       |
| 19 Oct 16:20 | Grace Liu      | Added discussion item                           | Sarah Thompson · 22 Oct       |
| 19 Oct 15:02 | Medisense AI   | Generated capacity recommendation (not applied) | Team capacity                 |
