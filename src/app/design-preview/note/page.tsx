import type { Metadata } from "next";
import { Suspense } from "react";
import { NoteView } from "./view";

export const metadata: Metadata = { title: "AI session note · Design preview · Medisense" };

export default function Page() {
  return (
    <Suspense>
      <NoteView />
    </Suspense>
  );
}
