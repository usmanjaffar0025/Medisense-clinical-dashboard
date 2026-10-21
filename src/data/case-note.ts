export const miaCaseNote = {
  client: "Mia Robinson",
  sessionLabel: "Case note · Session 13 Oct 2026",
  meta: "7 yrs · Paediatric OT · Daily routines · 50 min, in clinic, parent present",
  clinician: "Sarah Thompson",
  enteredBy: "Entered by Sarah Thompson · 13 Oct, 4:12 pm · Unstructured",
  rawLines: [
    "Client struggling with morning routine.",
    "Parent reports increased anxiety before school.",
    "Visual schedule helping slightly.",
    "Difficulty transitioning from breakfast to getting dressed.",
    "Therapist demonstrated sensory regulation strategy.",
    "Parent will trial strategy for seven days.",
    "Review next session.",
  ],
  /** Zero-based index of the raw line paired with the first summary sentence. */
  pairedLine: 3,
  generatedAt: "Generated 20 Oct 2026, 10:42 · Source: therapist note, 13 Oct",
  timeSaved: "Est. 8 minutes saved",
  draft: {
    summaryLead:
      "Client continues to experience difficulty with morning transitions, particularly between breakfast and dressing.",
    summaryRest:
      "Parent reports increased school-related anxiety. Visual scheduling has provided some improvement.",
    interventions: [
      "Reviewed visual schedule",
      "Introduced sensory regulation strategy",
      "Provided parent education",
    ],
    nextActions: [
      "Parent to trial strategy for seven days",
      "Monitor morning anxiety",
      "Review effectiveness at next appointment",
    ],
  },
};
