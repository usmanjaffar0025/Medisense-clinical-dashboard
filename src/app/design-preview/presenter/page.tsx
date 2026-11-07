import type { Metadata } from "next";
import { Suspense } from "react";
import { PresenterView } from "./view";

export const metadata: Metadata = { title: "Presenter panel · Design preview · Medisense" };

export default function Page() {
  return (
    <Suspense>
      <PresenterView />
    </Suspense>
  );
}
