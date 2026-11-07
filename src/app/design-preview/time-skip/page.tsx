import type { Metadata } from "next";
import { Suspense } from "react";
import { TimeSkipView } from "./view";

export const metadata: Metadata = { title: "After a time skip · Design preview · Medisense" };

export default function Page() {
  return (
    <Suspense>
      <TimeSkipView />
    </Suspense>
  );
}
