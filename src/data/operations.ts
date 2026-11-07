/** Sample hospital and business records for the frontend. Nothing here comes from a live system. */

export type InpatientStage = "New" | "Accepted" | "Seen" | "Ready for discharge";

export const inpatientStages: InpatientStage[] = ["New", "Accepted", "Seen", "Ready for discharge"];

export const inpatients = [
  {
    id: "ip1",
    name: "Walter Innes",
    ward: "Ward 4A",
    bed: "12",
    need: "OT, home safety before discharge",
    stage: "New",
  },
  {
    id: "ip2",
    name: "Joan Pryor",
    ward: "Ward 4A",
    bed: "3",
    need: "OT, equipment after hip replacement",
    stage: "Accepted",
  },
  {
    id: "ip3",
    name: "Hamid Rahimi",
    ward: "Ward 2C",
    bed: "7",
    need: "Speech, swallowing review",
    stage: "New",
  },
  {
    id: "ip4",
    name: "Beth Lowry",
    ward: "Ward 2C",
    bed: "9",
    need: "Speech and OT after stroke",
    stage: "Seen",
  },
  {
    id: "ip5",
    name: "Colin Marsh",
    ward: "Ward 6B",
    bed: "21",
    need: "OT, cognition screen",
    stage: "Accepted",
  },
  {
    id: "ip6",
    name: "Rosa Mendes",
    ward: "Rehab unit",
    bed: "5",
    need: "OT, return to home tasks",
    stage: "Seen",
  },
  {
    id: "ip7",
    name: "Peter Doyle",
    ward: "Rehab unit",
    bed: "8",
    need: "Speech, communication plan",
    stage: "New",
  },
] as const satisfies readonly {
  id: string;
  name: string;
  ward: string;
  bed: string;
  need: string;
  stage: InpatientStage;
}[];

export const theatreList = [
  {
    id: "th1",
    time: "8:00 am",
    patient: "Joan Pryor",
    procedure: "Hip replacement review",
    room: "Theatre 2",
  },
  {
    id: "th2",
    time: "9:30 am",
    patient: "Graham Sole",
    procedure: "Knee replacement",
    room: "Theatre 1",
  },
  {
    id: "th3",
    time: "11:15 am",
    patient: "Lena Fisk",
    procedure: "Wrist fixation",
    room: "Theatre 3",
  },
  {
    id: "th4",
    time: "1:30 pm",
    patient: "Owen Tate",
    procedure: "Shoulder repair",
    room: "Theatre 1",
  },
];

export const revenueByService = [
  { id: "ot", label: "Occupational therapy", value: 184 },
  { id: "speech", label: "Speech pathology", value: 96 },
  { id: "aged", label: "Aged care packages", value: 62 },
  { id: "tele", label: "Telehealth", value: 28 },
];

export const costsByArea = [
  { id: "wages", label: "Clinical wages", value: 212 },
  { id: "admin", label: "Admin wages", value: 44 },
  { id: "travel", label: "Vehicles and travel", value: 23 },
  { id: "equipment", label: "Equipment", value: 11 },
  { id: "software", label: "Software", value: 8 },
];

export const leaveRequests = [
  { id: "lv1", name: "Jessica Nguyen", type: "Annual leave", dates: "14 to 18 December", days: 5 },
  { id: "lv2", name: "Ben Holloway", type: "Personal leave", dates: "Friday this week", days: 1 },
  { id: "lv3", name: "Aisha Karim", type: "Study leave", dates: "2 to 3 December", days: 2 },
];

export const purchaseOrders = [
  {
    id: "po1",
    item: "Assessment kits, 4",
    supplier: "Allied Supplies",
    amount: 1840,
    by: "Grace Liu",
  },
  {
    id: "po2",
    item: "Sensory equipment",
    supplier: "Therapy Direct",
    amount: 620,
    by: "Emma Clarke",
  },
  {
    id: "po3",
    item: "Vehicle servicing, 3 cars",
    supplier: "Northside Auto",
    amount: 1275,
    by: "Jo Marsh",
  },
  {
    id: "po4",
    item: "Tablets for field staff, 6",
    supplier: "Office Tech",
    amount: 3540,
    by: "Sam Doyle",
  },
];

/** Illustrative hourly rates for sample claims and payroll. */
export const sampleClaimRate = { NDIS: 190, "Aged care": 160 } as const;
export const samplePayRate = 52;
export const FORTNIGHT_HOURS_PER_FTE = 76;

export const wardBeds = [
  { ward: "Ward 4A", specialty: "Orthopaedics", beds: 24, occupied: 21 },
  { ward: "Ward 2C", specialty: "Stroke", beds: 18, occupied: 16 },
  { ward: "Ward 6B", specialty: "General medicine", beds: 30, occupied: 24 },
  { ward: "Rehab unit", specialty: "Rehabilitation", beds: 16, occupied: 13 },
];

export const monthlyFinance = [
  { month: "Jun", revenue: 112, costs: 94 },
  { month: "Jul", revenue: 118, costs: 96 },
  { month: "Aug", revenue: 121, costs: 97 },
  { month: "Sep", revenue: 119, costs: 99 },
  { month: "Oct", revenue: 124, costs: 99 },
  { month: "Nov", revenue: 127, costs: 100 },
];

export const receivables = [
  { id: "r1", from: "NDIS plan managers", age: "Under 30 days", amount: 18420 },
  { id: "r2", from: "Aged care package providers", age: "Under 30 days", amount: 9360 },
  { id: "r3", from: "Self-managed participants", age: "30 to 60 days", amount: 3210 },
];

export const budgets = [
  { id: "b1", label: "Equipment", spent: 11200, total: 15000 },
  { id: "b2", label: "Vehicles and travel", spent: 23100, total: 25000 },
  { id: "b3", label: "Software", spent: 8000, total: 12000 },
  { id: "b4", label: "Training", spent: 3600, total: 9000 },
];
