import type { Metadata } from "next";
import { Suspense } from "react";
import { PhoneView } from "./view";

export const metadata: Metadata = { title: "Phone layout · Design preview · Medisense" };

export default function Page() {
  return (
    <Suspense>
      <PhoneView />
    </Suspense>
  );
}
