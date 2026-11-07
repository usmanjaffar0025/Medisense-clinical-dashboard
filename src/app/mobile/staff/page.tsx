import type { Metadata } from "next";
import { StaffApp } from "@/features/mobile/staff-app";

export const metadata: Metadata = { title: "Staff app · Medisense" };

export default function StaffAppPage() {
  return <StaffApp />;
}
