import { ArrowLeft } from "lucide-react";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { ButtonLink } from "@/components/ui/button";
import { PageContainer, PageHeader } from "@/components/ui/page";
import { clientProfileById, clientProfiles } from "@/data/client-profiles";
import { ClientProfileView } from "@/features/clients/client-profile";

type Params = { params: Promise<{ clientId: string }> };

export function generateStaticParams() {
  return clientProfiles.map((c) => ({ clientId: c.id }));
}

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const profile = clientProfileById((await params).clientId);
  return { title: `${profile?.name ?? "Client"} · Client profile · Medisense` };
}

/** Reading the URL's client id must sit inside Suspense so navigation stays instant. */
export default function ClientProfilePage({ params }: Params) {
  return (
    <PageContainer>
      <Suspense fallback={<p className="text-small text-ink-500">Loading client…</p>}>
        <Profile params={params} />
      </Suspense>
    </PageContainer>
  );
}

async function Profile({ params }: Params) {
  const profile = clientProfileById((await params).clientId);
  if (!profile) notFound();

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
            {profile.links.map((l, i) => (
              <ButtonLink key={l.href} href={l.href} variant={i === 0 ? "primary" : "secondary"}>
                {l.label}
              </ButtonLink>
            ))}
          </>
        }
      />
      <ClientProfileView profile={profile} />
    </>
  );
}
