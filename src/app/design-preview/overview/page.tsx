import type { Metadata } from "next";
import { Suspense } from "react";
import { OverviewView } from "./view";

export const metadata: Metadata = { title: "Overview · Design preview · Medisense" };

export default function Page() {
  return (
    <Suspense>
      <OverviewView />
    </Suspense>
  );
}
