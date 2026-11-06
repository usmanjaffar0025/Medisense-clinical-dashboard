import { ButtonLink } from "@/components/ui/button";
import { PageContainer, PageHeader } from "@/components/ui/page";

export default function NotFound() {
  return (
    <PageContainer>
      <PageHeader
        eyebrow="Page not found"
        title="We couldn’t find that page."
        description="Use the navigation to return to a Medisense screen."
        actions={
          <ButtonLink href="/" variant="primary">
            Back to overview
          </ButtonLink>
        }
      />
    </PageContainer>
  );
}
