import type { Metadata } from "next";
import { Suspense } from "react";
import { PageContainer } from "@/components/ui/page";
import { clientProfileById, clientProfiles } from "@/data/client-profiles";
import { ClientRecordView } from "@/features/clients/client-record";
import { LiveProfile } from "@/features/clients/live-profile";

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
  const { clientId } = await params;
  const profile = clientProfileById(clientId);
  // Clients added in a demo session exist only in the browser, so the page looks them up there.
  return profile ? <LiveProfile profile={profile} /> : <ClientRecordView id={clientId} />;
}
