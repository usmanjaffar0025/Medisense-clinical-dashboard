/**
 * The records were written for Tuesday 20 October 2026. Every date shown is moved forward by
 * the days between that anchor and today in Brisbane, so the platform always reads as "today":
 * "overdue 4 days" and "due Fri" stay true because relative numbers are kept and labels move.
 *
 * Set NEXT_PUBLIC_DEMO_DATE=YYYY-MM-DD to pin a day (for example the original 2026-10-20).
 */

const DAY = 86_400_000;
/** Brisbane has no daylight saving: UTC+10 all year. */
const BRISBANE = 10 * 3_600_000;

export const ANCHOR = Date.UTC(2026, 9, 20);

const WEEKDAYS = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
const MONTHS = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];
const short = (name: string) => name.slice(0, 3);

function pinned() {
  const value = process.env.NEXT_PUBLIC_DEMO_DATE?.trim();
  const match = value?.match(/^(\d{4})-(\d{2})-(\d{2})$/);
  return match ? Date.UTC(Number(match[1]), Number(match[2]) - 1, Number(match[3])) : null;
}

/** Midnight (as a UTC timestamp) of today's date in Brisbane. */
export const TODAY = pinned() ?? Math.floor((Date.now() + BRISBANE) / DAY) * DAY;

/** Days between the anchor and today; added to every authored date. */
export const OFFSET_DAYS = Math.round((TODAY - ANCHOR) / DAY);

const shiftMs = (ms: number) => ms + OFFSET_DAYS * DAY;
const parts = (ms: number) => {
  const d = new Date(ms);
  return { y: d.getUTCFullYear(), m: d.getUTCMonth(), day: d.getUTCDate(), wd: d.getUTCDay() };
};

/** A date `days` after today, as "Tue 27 Oct". */
export function dayLabel(days: number) {
  const p = parts(TODAY + days * DAY);
  return `${short(WEEKDAYS[p.wd] ?? "")} ${p.day} ${short(MONTHS[p.m] ?? "")}`;
}

/** Today as "Tuesday 20 October 2026". */
export function todayLong() {
  const p = parts(TODAY);
  return `${WEEKDAYS[p.wd]} ${p.day} ${MONTHS[p.m]} ${p.y}`;
}

/** Today as "2026-10-20". */
export const todayIso = new Date(TODAY).toISOString().slice(0, 10);

const monthIndex = (name: string) =>
  MONTHS.findIndex((m) => m.toLowerCase().startsWith(name.toLowerCase().slice(0, 3)));

/** A year for a "6 Oct" written without one: the one nearest the anchor, leaning to the past. */
function inferYear(month: number, day: number) {
  const anchorYear = parts(ANCHOR).y;
  const candidates = [anchorYear - 1, anchorYear, anchorYear + 1].map((y) =>
    Date.UTC(y, month, day),
  );
  return (
    candidates.find((ms) => ms > ANCHOR - 250 * DAY && ms <= ANCHOR + 120 * DAY) ??
    Date.UTC(anchorYear, month, day)
  );
}

const W = "Monday|Tuesday|Wednesday|Thursday|Friday|Saturday|Sunday|Mon|Tue|Wed|Thu|Fri|Sat|Sun";
const M =
  "January|February|March|April|May|June|July|August|September|October|November|December|Jan|Feb|Mar|Apr|Jun|Jul|Aug|Sep|Oct|Nov|Dec";
const DATE = new RegExp(
  `\\b(?:(${W}) )?(\\d{1,2}) (${M})\\b(?: (\\d{4})\\b)?|\\b(\\d{4})-(\\d{2})-(\\d{2})\\b|\\b(${M}) (\\d{4})\\b`,
  "g",
);

/**
 * Moves every date written in `text` by OFFSET_DAYS, keeping its style: "Fri 23 Oct",
 * "6 Oct", "20 October 2026", "Tuesday 20 Oct 2026", "2026-10-20" and "Oct 2026".
 */
export function dt(text: string) {
  if (OFFSET_DAYS === 0) return text;
  return text.replace(
    DATE,
    (
      all,
      wd?: string,
      d?: string,
      mon?: string,
      y?: string,
      iy?: string,
      im?: string,
      id?: string,
      mm?: string,
      my?: string,
    ) => {
      if (iy && im && id) {
        return new Date(shiftMs(Date.UTC(Number(iy), Number(im) - 1, Number(id))))
          .toISOString()
          .slice(0, 10);
      }
      if (mm && my) {
        // Month and year only: move the middle of the month.
        const p = parts(shiftMs(Date.UTC(Number(my), monthIndex(mm), 15)));
        const name = MONTHS[p.m] ?? "";
        return `${mm.length > 3 ? name : short(name)} ${p.y}`;
      }
      if (!d || !mon) return all;
      const month = monthIndex(mon);
      const base = y ? Date.UTC(Number(y), month, Number(d)) : inferYear(month, Number(d));
      const p = parts(shiftMs(base));
      const monthName = MONTHS[p.m] ?? "";
      const weekdayName = WEEKDAYS[p.wd] ?? "";
      return [
        wd ? (wd.length > 3 ? weekdayName : short(weekdayName)) : null,
        String(p.day),
        mon.length > 3 && mon !== "May" ? monthName : short(monthName),
        y ? String(p.y) : null,
      ]
        .filter(Boolean)
        .join(" ");
    },
  );
}

/**
 * A weekday named on its own ("Supervision Thursday", "due Fri"), read as the nearest such day
 * to the anchor Tuesday, moved like any date.
 */
export function wd(name: string) {
  const index = WEEKDAYS.findIndex((w) =>
    w.toLowerCase().startsWith(name.toLowerCase().slice(0, 3)),
  );
  if (index < 0 || OFFSET_DAYS === 0) return name;
  let fromAnchor = (index - parts(ANCHOR).wd + 7) % 7;
  if (fromAnchor > 4) fromAnchor -= 7;
  const target = WEEKDAYS[parts(TODAY + fromAnchor * DAY).wd] ?? name;
  return name.length > 3 ? target : short(target);
}

/** A month named on its own in a chart axis ("Oct"), moved by whole months. */
export function mo(name: string) {
  const index = monthIndex(name);
  if (index < 0) return name;
  const months = (parts(TODAY).y - parts(ANCHOR).y) * 12 + parts(TODAY).m - parts(ANCHOR).m;
  const target = MONTHS[(((index + months) % 12) + 12) % 12] ?? name;
  return name.length > 3 ? target : short(target);
}
