/** Installed PWA / Add to Home Screen (Monitoring Center on phone). */
export function isMonitorStandaloneApp(): boolean {
  if (typeof window === "undefined") return false;

  const standaloneMq = window.matchMedia("(display-mode: standalone)");
  if (standaloneMq.matches) return true;

  const nav = window.navigator as Navigator & { standalone?: boolean };
  if (nav.standalone === true) return true;

  return false;
}
