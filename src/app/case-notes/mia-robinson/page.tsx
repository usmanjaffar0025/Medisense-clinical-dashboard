import { ArrowLeft } from "lucide-react";
import type { Metadata } from "next";
import { ButtonLink } from "@/components/ui/button";
import { PageContainer, PageHeader } from "@/components/ui/page";
import { miaCaseNote } from "@/data/case-note";
import { NoteDraft } from "@/features/case-notes/note-draft";
import { TherapistNotes } from "@/features/case-notes/therapist-notes";

export const metadata: Metadata = { title: "Mia Robinson · Case note · Medisense" };

export default function MiaCaseNotePage() {
  return (
    <PageContainer>
      <PageHeader
        eyebrow={miaCaseNote.sessionLabel}
        title={miaCaseNote.client}
        description={miaCaseNote.meta}
        actions={
          <div className="flex items-center gap-3">
            <ButtonLink href="/caseloads/sarah-thompson">
              <ArrowLeft className="size-4" strokeWidth={1.5} aria-hidden="true" />
              Sarah’s caseload
            </ButtonLink>
            <span className="text-small text-ink-700">
              Clinician: <b className="font-semibold text-ink-900">{miaCaseNote.clinician}</b>
            </span>
          </div>
        }
      />

      <div className="grid items-start gap-6 lg:grid-cols-12">
        <div className="lg:col-span-5">
          <TherapistNotes />
        </div>
        <div className="lg:col-span-7">
          <NoteDraft />
        </div>
      </div>
    </PageContainer>
  );
}
