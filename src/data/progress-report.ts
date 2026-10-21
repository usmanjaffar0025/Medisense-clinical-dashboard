export const emilyReport = {
  client: "Emily Carter",
  eyebrow: "Progress report · Due Fri 23 Oct",
  meta: "8 yrs · Paediatric OT · Period 14 Apr – 16 Oct 2026 · Funding review Fri 6 Nov · Clinician: Hannah Wright",
  clinician: "Hannah Wright",
  generatedAt: "Generated 20 Oct 2026 · Source: 12 approved notes, 3 goals, COPM, attendance",
  sources: [
    { label: "Approved session notes", detail: "12 notes · 14 Apr – 16 Oct" },
    { label: "Goals", detail: "3 active goals" },
    { label: "Interventions log", detail: "Including 2 school visits" },
    { label: "Attendance", detail: "11 / 12 sessions · 92%" },
    { label: "Outcome measures (COPM)", detail: "Baseline and current" },
    { label: "Previous report", detail: "Apr 2026" },
  ],
  details: [
    { label: "Client", value: "Emily Carter" },
    { label: "Age", value: "8 years" },
    { label: "Service", value: "Paediatric Occupational Therapy" },
    { label: "Clinician", value: "Hannah Wright, OT" },
    { label: "Reporting period", value: "14 Apr – 16 Oct 2026" },
    { label: "Funding review", value: "Fri 6 Nov 2026" },
    { label: "Attendance", value: "11 of 12 sessions (92%)" },
    { label: "Previous report", value: "Apr 2026" },
  ],
  goals: [
    { text: "Dress independently for school within 15 minutes.", status: "Largely achieved" },
    { text: "Produce legible handwriting for a 3-sentence task.", status: "Progressing" },
    {
      text: "Use a self-regulation strategy during classroom transitions with ≤1 prompt.",
      status: "Progressing",
    },
  ],
  interventions: [
    "Graded dressing practice with visual sequence.",
    "Fine-motor and pencil-grip program.",
    "Sensory regulation strategies with teacher liaison (2 school visits).",
  ],
  progress: [
    "Dressing time reduced from ~30 to ~17 minutes (parent report).",
    "Handwriting legible for 2 of 3 sentences.",
    "Uses regulation strategy at transitions with 1–2 prompts (teacher report).",
  ],
  copm: [
    { measure: "Performance", before: 4.2, after: 6.4 },
    { measure: "Satisfaction", before: 3.8, after: 6.9 },
  ],
  barriers:
    "One cancelled session (illness). Limited carry-over of handwriting tasks at home during school holidays.",
  nextSteps: [
    "Continue fortnightly OT next period.",
    "Home handwriting program 3× weekly.",
    "Review regulation goal with teacher in Term 1.",
  ],
};
