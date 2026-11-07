import type { Metadata } from "next";
import { Suspense } from "react";
import { SupervisionView } from "./view";

export const metadata: Metadata = { title: "Supervision brief · Design preview · Medisense" };

export default function Page() {
  return (
    <Suspense>
      <SupervisionView />
    </Suspense>
  );
}
