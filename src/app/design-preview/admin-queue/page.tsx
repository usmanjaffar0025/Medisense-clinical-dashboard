import type { Metadata } from "next";
import { Suspense } from "react";
import { AdminQueueView } from "./view";

export const metadata: Metadata = { title: "Admin work queue · Design preview · Medisense" };

export default function Page() {
  return (
    <Suspense>
      <AdminQueueView />
    </Suspense>
  );
}
