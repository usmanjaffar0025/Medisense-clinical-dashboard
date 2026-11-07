import type { Metadata } from "next";
import { Suspense } from "react";
import { MyDayView } from "./view";

export const metadata: Metadata = { title: "My Day · Design preview · Medisense" };

export default function Page() {
  return (
    <Suspense>
      <MyDayView />
    </Suspense>
  );
}
