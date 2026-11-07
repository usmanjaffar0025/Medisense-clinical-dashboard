import type { Metadata } from "next";
import { Suspense } from "react";
import { PreparedView } from "./view";

export const metadata: Metadata = { title: "What AI prepared · Design preview · Medisense" };

export default function Page() {
  return (
    <Suspense>
      <PreparedView />
    </Suspense>
  );
}
