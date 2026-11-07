import type { Metadata } from "next";
import { FamilyApp } from "@/features/mobile/family-app";

export const metadata: Metadata = { title: "Family app · Medisense" };

export default function FamilyAppPage() {
  return <FamilyApp />;
}
