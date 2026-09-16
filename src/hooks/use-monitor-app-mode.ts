"use client";

import { useEffect, useState } from "react";
import { isMonitorStandaloneApp } from "@/lib/monitor-app-mode";

export function useMonitorAppMode() {
  const [isMonitorApp, setIsMonitorApp] = useState(false);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    function sync() {
      setIsMonitorApp(isMonitorStandaloneApp());
      setReady(true);
    }

    sync();

    const mq = window.matchMedia("(display-mode: standalone)");
    mq.addEventListener("change", sync);
    return () => mq.removeEventListener("change", sync);
  }, []);

  return { isMonitorApp, ready };
}
