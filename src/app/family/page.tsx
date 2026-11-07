import type { Metadata } from "next";
import { FamilyPortal } from "@/features/portal/family-portal";

export const metadata: Metadata = { title: "Family portal · Medisense" };

export default function FamilyPage() {
  return <FamilyPortal />;
}
