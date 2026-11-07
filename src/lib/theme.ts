/** The colour palettes a viewer can choose. The choice stays in this browser and survives a reset. */
export const themes = [
  { id: "blue", label: "Blue", swatches: ["#1570ef", "#0e9f8e", "#dbe8fe"] },
  { id: "green", label: "Green", swatches: ["#08844a", "#12b76a", "#e1f5e9"] },
] as const;

export type ThemeId = (typeof themes)[number]["id"];

const STORAGE_KEY = "medisense-theme";
export const DEFAULT_THEME: ThemeId = "blue";

/** Runs before first paint, so a saved palette never flashes the default one. */
export const themeInitScript = `try{if(localStorage.getItem("${STORAGE_KEY}")==="green")document.documentElement.dataset.palette="green"}catch(e){}`;

const listeners = new Set<() => void>();

export function currentTheme(): ThemeId {
  return document.documentElement.dataset.palette === "green" ? "green" : "blue";
}

export function setTheme(theme: ThemeId) {
  if (theme === "green") document.documentElement.dataset.palette = "green";
  else delete document.documentElement.dataset.palette;
  try {
    localStorage.setItem(STORAGE_KEY, theme);
  } catch {
    // Private windows can block storage; the palette still applies until the page reloads.
  }
  listeners.forEach((listener) => listener());
}

export function subscribeTheme(listener: () => void) {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}
