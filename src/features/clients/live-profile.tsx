"use client";

import { ArrowLeft } from "lucide-react";
import { ButtonLink } from "@/components/ui/button";
import { PageHeader } from "@/components/ui/page";
import type { ClientProfile } from "@/data/client-profiles";
import { useDemoStore } from "@/state/demo-store";
import { ClientActions } from "./client-actions";
import { ClientProfileView } from "./client-profile";
import { ClientVisits } from "./client-record";

/** A full profile with any edits made in this session applied over the record. */
export function LiveProfile({ profile: seed }: { profile: ClientProfile }) {
  const edit = useDemoStore((s) => s.clientEdits[seed.id]);
  const profile: ClientProfile = {
    ...seed,
    name: edit?.name ?? seed.name,
    age: edit?.age ?? seed.age,
    funding: edit?.funding ?? seed.funding,
    service: edit?.service ?? seed.service,
    clinician: edit?.clinician ?? seed.clinician,
    region: edit?.region ?? seed.region,
    suburb: edit?.suburb ?? seed.suburb,
    contacts: edit
      ? seed.contacts.map((c, i) =>
          i === 0
            ? {
                ...c,
                name: edit.contactName ?? c.name,
                detail: edit.contactPhone ?? c.detail,
              }
            : c,
        )
      : seed.contacts,
  };

  return (
    <>
      <PageHeader
        eyebrow={`Client profile · ${profile.funding} · client since ${profile.clientSince}`}
        title={profile.name}
        description={`${profile.age} yrs · ${profile.service} · ${profile.clinician} · ${profile.suburb}, ${profile.region} · ${profile.visitType}`}
        leading={
          <span className="flex size-14 flex-none items-center justify-center rounded-full bg-accent-tint font-serif text-h2 text-accent">
            {profile.initials}
          </span>
        }
        actions={
          <>
            <ButtonLink href="/clients">
              <ArrowLeft className="size-4" strokeWidth={1.5} aria-hidden="true" />
              All clients
            </ButtonLink>
            <ClientActions id={seed.id} />
            {profile.links.map((l, i) => (
              <ButtonLink key={l.href} href={l.href} variant={i === 0 ? "primary" : "secondary"}>
                {l.label}
              </ButtonLink>
            ))}
          </>
        }
      />
      <div className="mb-6">
        <ClientVisits name={seed.name} />
      </div>
      <ClientProfileView profile={profile} />
    </>
  );
}
