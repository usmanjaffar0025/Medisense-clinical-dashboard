import type { SuggestedTask } from "./tasks";
import type { Funding } from "./types";
import { dt } from "@/lib/clock";

export type CaseNoteSample = {
  id: string;
  client: string;
  age: number;
  funding: Funding;
  service: string;
  sessionDate: string;
  /** Where the note stood before the demo: an AI draft waiting, or overdue by some days. */
  backlog: { kind: "ai-draft" } | { kind: "overdue"; days: number };
  sessionDetail: string;
  clinician: string;
  enteredAt: string;
  /** Plain-language client description passed to the model as context. */
  context: string;
  rawLines: string[];
  /** 1-based raw note line paired with the first summary sentence. */
  pairedLine: number;
  minutesSaved: number;
  draft: {
    summary: string;
    subjective: string[];
    interventions: string[];
    observations: string[];
    nextActions: string[];
    missingInformation: string[];
  };
  /** Follow-ups proposed from the approved note; nothing is created until confirmed. */
  suggestedTasks: SuggestedTask[];
};

/**
 * Sarah Thompson's documentation backlog: the AI draft for Mia plus her four overdue notes
 * (Oliver, Ruth, Lucas, Ava), matching the caseload screen.
 */
export const caseNotes: CaseNoteSample[] = [
  {
    id: "mia-robinson",
    client: "Mia Robinson",
    age: 7,
    funding: "NDIS",
    service: "Paediatric OT · Daily routines",
    sessionDate: dt("13 Oct"),
    backlog: { kind: "ai-draft" },
    sessionDetail: "50 min, home visit, parent present",
    clinician: "Sarah Thompson",
    enteredAt: `${dt("13 Oct")}, 4:12 pm`,
    context: "Mia Robinson, 7, paediatric occupational therapy (NDIS), focus on daily routines",
    rawLines: [
      "Client struggling with morning routine.",
      "Parent reports increased anxiety before school.",
      "Visual schedule helping slightly.",
      "Difficulty transitioning from breakfast to getting dressed.",
      "Therapist demonstrated sensory regulation strategy.",
      "Parent will trial strategy for seven days.",
      "Review next session.",
    ],
    pairedLine: 4,
    minutesSaved: 8,
    draft: {
      summary:
        "Client continues to experience difficulty with morning transitions, particularly between breakfast and dressing. Parent reports increased school-related anxiety. Visual scheduling has provided some improvement.",
      subjective: [
        "Parent reports increased anxiety before school",
        "Morning routine described as a daily struggle",
      ],
      interventions: [
        "Reviewed visual schedule",
        "Introduced sensory regulation strategy",
        "Provided parent education",
      ],
      observations: [
        "Visual schedule producing partial improvement in the morning routine",
        "Breakfast-to-dressing transition remains the main point of difficulty",
        "Parent-reported anxiety before school has increased",
      ],
      nextActions: [
        "Parent to trial strategy for seven days",
        "Monitor morning anxiety",
        "Review effectiveness at next appointment",
      ],
      missingInformation: [
        "Note does not reference the NDIS plan goal it supports",
        "Length of morning routine before and after the visual schedule not recorded",
      ],
    },
    suggestedTasks: [
      {
        title: "Check in with parent after the 7-day strategy trial",
        owner: "Sarah Thompson",
        due: dt("Tue 27 Oct"),
        type: "Client follow-up",
        priority: "Medium",
      },
      {
        title: "Link note to NDIS goal: independent morning routine",
        owner: "Sarah Thompson",
        due: dt("Wed 21 Oct"),
        type: "Documentation",
        priority: "Low",
      },
    ],
  },
  {
    id: "oliver-grant",
    client: "Oliver Grant",
    age: 6,
    funding: "NDIS",
    service: "Paediatric OT · Fine motor",
    sessionDate: dt("15 Oct"),
    backlog: { kind: "overdue", days: 5 },
    sessionDetail: "45 min, home visit, parent present",
    clinician: "Sarah Thompson",
    enteredAt: `${dt("15 Oct")}, 5:40 pm`,
    context: "Oliver Grant, 6, paediatric occupational therapy (NDIS), focus on fine motor skills",
    rawLines: [
      "Worked on pencil grip with triangular grip aid.",
      "Copying shapes better, circle and cross ok, square still hard.",
      "Gets tired after about 10 mins of table work.",
      `Mum shared new paediatrician report from ${dt("14 Oct")}.`,
      "Report recommends further assessment.",
      "Home program: playdough and tweezers games 5 mins daily.",
      "Discuss report in supervision.",
    ],
    pairedLine: 2,
    minutesSaved: 9,
    draft: {
      summary: `Oliver's shape copying has improved, with circles and crosses now completed while squares remain difficult. He tires after about ten minutes of table-top work. His mother shared a new paediatrician report dated ${dt("14 Oct")} that recommends further assessment.`,
      subjective: [`Mother shared a new paediatrician report dated ${dt("14 Oct")}`],
      interventions: [
        "Pencil grip practice with a triangular grip aid",
        "Shape copying tasks",
        "Reviewed external paediatrician report with parent",
      ],
      observations: [
        "Circle and cross copied; square not yet achieved",
        "Reduced endurance for table-top tasks (about 10 minutes)",
        "External report recommends further assessment",
      ],
      nextActions: [
        "Parent to run playdough and tweezer games for 5 minutes daily",
        `Discuss the external report in supervision on ${dt("22 Oct")}`,
        "Review grip and endurance at the next session",
      ],
      missingInformation: [
        "External paediatrician report not yet uploaded to the client record",
        "Endurance not measured with a standard tool",
      ],
    },
    suggestedTasks: [
      {
        title: `Upload paediatrician report (${dt("14 Oct")}) to client record`,
        owner: "Admin team",
        due: dt("Wed 21 Oct"),
        type: "Document request",
        priority: "Medium",
      },
      {
        title: "Add Oliver's external report to the supervision brief",
        owner: "Sarah Thompson",
        due: dt("Thu 22 Oct"),
        type: "Supervision",
        priority: "Medium",
      },
    ],
  },
  {
    id: "ruth-hallam",
    client: "Ruth Hallam",
    age: 78,
    funding: "Aged care",
    service: "Home modifications",
    sessionDate: dt("6 Oct"),
    backlog: { kind: "overdue", days: 14 },
    sessionDetail: "60 min, home visit, daughter present",
    clinician: "Sarah Thompson",
    enteredAt: `${dt("6 Oct")}, 3:05 pm`,
    context: "Ruth Hallam, 78, aged care occupational therapy, home modifications assessment",
    rawLines: [
      "Bathroom assessment done, step into shower is 18cm.",
      "Ruth holds the towel rail for support getting in.",
      "Daughter reports 2 near falls last month.",
      "Recommend 2 grab rails and a shower chair.",
      "Builder quote needed before funding approval.",
      "Family deciding if Ruth moves in with daughter, appointments paused until then.",
      "Follow up with daughter in 2 weeks.",
    ],
    pairedLine: 1,
    minutesSaved: 11,
    draft: {
      summary:
        "Bathroom access assessment completed; the shower has an 18 cm step and Ruth currently uses the towel rail for support. Her daughter reports two near falls in the past month. Appointments are paused while the family decides whether Ruth will move in with her daughter.",
      subjective: [
        "Daughter reports two near falls in the last month",
        "Family considering Ruth moving in with her daughter",
      ],
      interventions: [
        "Bathroom access assessment",
        "Observed shower transfer",
        "Discussed equipment options with client and daughter",
      ],
      observations: [
        "18 cm step into the shower",
        "Relies on the towel rail for support during transfer",
        "Two near falls in the last month, reported by daughter",
      ],
      nextActions: [
        "Recommend two grab rails and a shower chair",
        "Obtain a builder quote before funding approval",
        "Follow up with daughter in 2 weeks about living arrangements",
      ],
      missingInformation: [
        "Grab rail positions and wall type not recorded",
        "Aged care funding level (Support at Home classification) not stated",
      ],
    },
    suggestedTasks: [
      {
        title: "Request builder quote for grab rails and shower chair",
        owner: "Admin team",
        due: dt("Fri 23 Oct"),
        type: "Document request",
        priority: "High",
      },
      {
        title: "Call Ruth's daughter about living arrangements",
        owner: "Sarah Thompson",
        due: dt("Tue 3 Nov"),
        type: "Client follow-up",
        priority: "Medium",
      },
    ],
  },
  {
    id: "lucas-brennan",
    client: "Lucas Brennan",
    age: 45,
    funding: "NDIS",
    service: "Psychosocial disability · Daily living",
    sessionDate: dt("17 Oct"),
    backlog: { kind: "overdue", days: 3 },
    sessionDetail: "50 min, home visit, support worker present",
    clinician: "Sarah Thompson",
    enteredAt: `${dt("17 Oct")}, 6:20 pm`,
    context:
      "Lucas Brennan, 45, occupational therapy (NDIS, psychosocial disability), focus on daily living routines",
    rawLines: [
      "Meal prep routine, cooked pasta with 2 prompts.",
      "Did 3 of 5 planned shopping trips this week.",
      "Says motivation is low in the mornings.",
      "Phone reminders are helping.",
      "Support worker joined second half of session.",
      "Plan: simplify shopping list, add Thursday reminder.",
      `Next session ${dt("23 Oct")}.`,
    ],
    pairedLine: 1,
    minutesSaved: 7,
    draft: {
      summary:
        "Lucas prepared a pasta meal with two verbal prompts as part of his meal preparation routine. He completed three of five planned shopping trips this week and reports low motivation in the mornings. Phone reminders are helping him keep to his routine.",
      subjective: ["Reports low motivation in the mornings", "Finds phone reminders helpful"],
      interventions: [
        "Meal preparation practice with graded prompting",
        "Reviewed weekly shopping routine",
        "Worked with support worker during the session",
      ],
      observations: [
        "Meal completed with 2 prompts",
        "3 of 5 planned shopping trips completed",
        "Phone reminders reported as helpful",
      ],
      nextActions: [
        "Simplify the shopping list with Lucas",
        "Add a Thursday shopping reminder to his phone",
        `Review the routine at the next session on ${dt("23 Oct")}`,
      ],
      missingInformation: ["Support worker's name and organisation not recorded"],
    },
    suggestedTasks: [
      {
        title: "Share simplified shopping list with support worker",
        owner: "Sarah Thompson",
        due: dt("Thu 22 Oct"),
        type: "Communication",
        priority: "Low",
      },
    ],
  },
  {
    id: "ava-mitchell",
    client: "Ava Mitchell",
    age: 11,
    funding: "NDIS",
    service: "Handwriting & fine motor",
    sessionDate: dt("11 Oct"),
    backlog: { kind: "overdue", days: 9 },
    sessionDetail: "45 min, telehealth, parent present",
    clinician: "Sarah Thompson",
    enteredAt: `${dt("11 Oct")}, 4:55 pm`,
    context: "Ava Mitchell, 11, occupational therapy (NDIS), handwriting and fine motor skills",
    rawLines: [
      "Handwriting sample, 3 sentences, legible but letter size all over the place.",
      "Spacing between words better with spacer tool.",
      "Teacher says Ava avoids writing in class.",
      "Tried slant board, Ava liked it.",
      "Typing about 10 words per minute.",
      "Home: 10 min handwriting 3x a week.",
      "Email teacher about slant board.",
    ],
    pairedLine: 2,
    minutesSaved: 8,
    draft: {
      summary:
        "Ava's word spacing has improved with a spacer tool, and her three-sentence handwriting sample was legible although letter size was inconsistent. Her teacher reports that she avoids writing tasks in class. She responded well to a slant board trial.",
      subjective: [
        "Teacher reports Ava avoids writing tasks in class",
        "Ava preferred the slant board",
      ],
      interventions: [
        "Handwriting sample and review",
        "Spacer tool for word spacing",
        "Slant board trial",
        "Keyboarding practice",
      ],
      observations: [
        "Legible three-sentence sample; letter size inconsistent",
        "Improved spacing between words",
        "Typing speed about 10 words per minute",
        "Prefers writing on the slant board",
      ],
      nextActions: [
        "Home handwriting practice 10 minutes, 3 times a week",
        "Email teacher about using the slant board in class",
        "Re-measure typing speed at the next session",
      ],
      missingInformation: [
        "Typing speed not compared with an age-based norm",
        "Teacher's contact details missing from the client record",
      ],
    },
    suggestedTasks: [
      {
        title: "Email teacher about slant board use in class",
        owner: "Sarah Thompson",
        due: dt("Wed 21 Oct"),
        type: "Communication",
        priority: "Medium",
      },
      {
        title: "Request teacher contact details from parent",
        owner: "Admin team",
        due: dt("Thu 22 Oct"),
        type: "Document request",
        priority: "Low",
      },
    ],
  },
];

export function caseNoteById(id: string) {
  return caseNotes.find((c) => c.id === id);
}

export function noteText(sample: CaseNoteSample) {
  return sample.rawLines.join("\n");
}

export const caseNoteGeneratedAt = `Generated ${dt("20 Oct 2026")}`;
