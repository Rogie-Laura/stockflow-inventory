"use client";

import { useEffect, useState } from "react";

/** Bumps when the monitoring app becomes visible (open / return to app). */
export function useMonitorAdPulse(enabled: boolean) {
  const [pulse, setPulse] = useState(0);

  useEffect(() => {
    if (!enabled) return;

    function bump() {
      if (document.visibilityState === "visible") {
        setPulse((n) => n + 1);
      }
    }

    bump();
    document.addEventListener("visibilitychange", bump);
    window.addEventListener("focus", bump);

    return () => {
      document.removeEventListener("visibilitychange", bump);
      window.removeEventListener("focus", bump);
    };
  }, [enabled]);

  return pulse;
}
