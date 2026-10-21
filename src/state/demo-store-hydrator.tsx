"use client";

import { useEffect } from "react";
import { useDemoStore } from "./demo-store";

export function DemoStoreHydrator() {
  useEffect(() => {
    void useDemoStore.persist.rehydrate();
  }, []);
  return null;
}
