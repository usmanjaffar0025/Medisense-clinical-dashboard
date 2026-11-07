import type { Metadata } from "next";
import { Suspense } from "react";
import { RoadmapView } from "./view";

export const metadata: Metadata = { title: "Roadmap · Design preview · Medisense" };

export default function Page() {
  return (
    <Suspense>
      <RoadmapView />
    </Suspense>
  );
}
