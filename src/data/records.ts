import { directoryClients, type DirectoryClient } from "./client-directory";
import { clientProfileById } from "./client-profiles";
import { clinicians } from "./clinicians";
import { suburbs } from "./schedule";
import type { Funding, Site } from "./types";
import { seedFrom } from "./weeks";

/** The details a person can type or correct. Clients added in the demo live only in this session. */
export type ClientRecord = {
  id: string;
  name: string;
  age: number | null;
  funding: Funding;
  clinician: string;
  region: Site;
  suburb: string;
  service: string;
  contactName: string;
  contactPhone: string;
  state: DirectoryClient["state"];
};

export type ClientEdits = Record<string, Partial<ClientRecord>>;

const slug = (name: string) =>
  name
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");

/** A readable id that never collides with an existing client. */
export function newClientId(name: string, added: ClientRecord[]) {
  const base = slug(name) || "client";
  const taken = new Set([...directoryClients, ...added].map((c) => c.id));
  if (!taken.has(base)) return base;
  let n = 2;
  while (taken.has(`${base}-${n}`)) n += 1;
  return `${base}-${n}`;
}

function seededRecord(c: DirectoryClient): ClientRecord {
  const profile = clientProfileById(c.id);
  const contact = profile?.contacts[0];
  return {
    id: c.id,
    name: c.name,
    age: c.age,
    funding: c.funding,
    clinician: c.clinician,
    region: c.region,
    suburb: profile?.suburb ?? "",
    service: c.service,
    contactName: contact?.name ?? "",
    contactPhone: contact?.detail ?? "",
    state: c.state,
  };
}

/** One client's current details, whether they came from the records or were added in the demo. */
export function clientRecord(id: string, added: ClientRecord[], edits: ClientEdits) {
  const seeded = directoryClients.find((c) => c.id === id);
  const base = seeded ? seededRecord(seeded) : added.find((c) => c.id === id);
  return base ? { ...base, ...edits[id] } : null;
}

/** Every client for the directory table, newest additions first. */
export function liveDirectory(added: ClientRecord[], edits: ClientEdits): DirectoryClient[] {
  const fresh: DirectoryClient[] = added.map((c) => ({
    ...c,
    planReviewDays: (seedFrom(c.id) % 170) + 6,
    priority: null,
    hasProfile: false,
  }));
  return [
    ...fresh.map((c) => ({ ...c, ...edits[c.id] })),
    ...directoryClients.map((c) => ({ ...c, ...edits[c.id] })),
  ];
}

const normalise = (name: string) => name.trim().toLowerCase().replace(/\s+/g, " ");

/** A rule, not AI: an exact name match is enough to stop and ask a person. */
export function findDuplicate(name: string, added: ClientRecord[]) {
  const wanted = normalise(name);
  if (!wanted) return null;
  return [...added, ...directoryClients].find((c) => normalise(c.name) === wanted) ?? null;
}

export function regionForSuburb(suburb: string): Site | null {
  const wanted = suburb.trim().toLowerCase();
  const sites = Object.keys(suburbs) as Site[];
  return sites.find((s) => suburbs[s].some((x) => x.toLowerCase() === wanted)) ?? null;
}

/** A rule, not AI: the matching discipline in the client's region with the most room. */
export function suggestClinician(services: string, region: Site) {
  const discipline = /speech/i.test(services) ? "Speech Pathology" : "Occupational Therapy";
  const matching = clinicians.filter((c) => c.discipline === discipline);
  const local = matching.filter((c) => c.site === region);
  const pool = local.length ? local : matching;
  return [...pool].sort((a, b) => a.utilisation - b.utilisation)[0]?.name ?? "";
}
