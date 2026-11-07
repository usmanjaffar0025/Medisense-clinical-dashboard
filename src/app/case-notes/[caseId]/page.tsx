import { ArrowLeft } from "lucide-react";
import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";
import { Suspense } from "react";
import { ButtonLink } from "@/components/ui/button";
import { PageContainer, PageHeader } from "@/components/ui/page";
import { caseNoteById, caseNotes } from "@/data/case-note";
import { CaseQueue } from "@/features/case-notes/case-queue";
import { NoteDraft } from "@/features/case-notes/note-draft";
import { TherapistNotes } from "@/features/case-notes/therapist-notes";

type Params = { params: Promise<{ caseId: string }> };

export function generateStaticParams() {
  return caseNotes.map((c) => ({ caseId: c.id }));
}

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const sample = caseNoteById((await params).caseId);
  return { title: `${sample?.client ?? "Case note"} · Case note · Medisense` };
}

/** Reading the URL's case id must sit inside Suspense so navigation between cases stays instant. */
export default function CaseNotePage({ params }: Params) {
  return (
    <PageContainer>
      <Suspense fallback={<p className="text-small text-ink-500">Loading case note…</p>}>
        <CaseNote params={params} />
      </Suspense>
    </PageContainer>
  );
}

async function CaseNote({ params }: Params) {
  const id = (await params).caseId;
  if (id === "oliver-grant") redirect("/sessions/oliver-grant");
  const sample = caseNoteById(id);
  if (!sample) notFound();

  return (
    <>
      <PageHeader
        eyebrow={`Case note · Session ${sample.sessionDate} 2026`}
        title={sample.client}
        description={`${sample.age} yrs · ${sample.funding} · ${sample.service} · ${sample.sessionDetail}`}
        actions={
          <div className="flex flex-wrap items-center gap-3">
            <ButtonLink href="/caseloads/sarah-thompson">
              <ArrowLeft className="size-4" strokeWidth={1.5} aria-hidden="true" />
              Sarah’s caseload
            </ButtonLink>
            <span className="text-small text-ink-700">
              Clinician: <b className="font-semibold text-ink-900">{sample.clinician}</b>
            </span>
          </div>
        }
      />

      <CaseQueue activeId={sample.id} />

      <div className="grid items-start gap-6 lg:grid-cols-12">
        <div className="lg:col-span-5">
          <TherapistNotes key={sample.id} sample={sample} />
        </div>
        <div className="lg:col-span-7">
          <NoteDraft key={sample.id} sample={sample} />
        </div>
      </div>
    </>
  );
}
