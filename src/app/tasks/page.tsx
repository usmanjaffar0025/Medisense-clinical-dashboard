import type { Metadata } from "next";
import { PageContainer, PageHeader } from "@/components/ui/page";
import { TasksWorkspace } from "@/features/tasks/tasks-workspace";

export const metadata: Metadata = { title: "Tasks & follow-ups · Medisense" };

export default function TasksPage() {
  return (
    <PageContainer>
      <PageHeader
        eyebrow="Intake & admin"
        title="Tasks & follow-ups"
        description="Every follow-up, document request and scheduling job across the team, with overdue work escalated automatically."
      />
      <TasksWorkspace />
    </PageContainer>
  );
}
