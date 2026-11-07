"use client";

import { useEffect } from "react";

/** Keeps keyboard focus out of the existing shell while the preview covers it. */
export function CoverRootShell() {
  useEffect(() => {
    const preview = document.getElementById("design-preview");
    const covered = Array.from(
      document.querySelectorAll('nav[aria-label="Primary"], header, nav[aria-label="Breadcrumb"]'),
    ).filter((el) => !preview?.contains(el));
    covered.forEach((el) => el.setAttribute("inert", ""));
    return () => covered.forEach((el) => el.removeAttribute("inert"));
  }, []);
  return null;
}
