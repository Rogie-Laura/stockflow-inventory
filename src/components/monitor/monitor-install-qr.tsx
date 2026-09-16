"use client";

import { useMemo } from "react";
import QRCode from "react-qr-code";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getMonitorInstallQrUrl } from "@/lib/monitor-install";

export function MonitorInstallQr() {
  const installUrl = useMemo(() => {
    if (typeof window === "undefined") {
      return getMonitorInstallQrUrl("https://inventorysystem-lemon.vercel.app");
    }
    return getMonitorInstallQrUrl(window.location.origin);
  }, []);

  return (
    <Card className="mt-6 border-indigo-500/25 bg-card/80">
      <CardHeader className="pb-2">
        <CardTitle className="text-base font-semibold">
          I-scan para i-install ang app
        </CardTitle>
        <p className="text-sm font-normal text-muted-foreground">
          I-scan ng <strong>camera</strong> → direktang{" "}
          <strong>download ng APK</strong>. Pagkatapos, buksan ang file at i-install;
          login gamit ang account number sa avatar.
        </p>
      </CardHeader>
      <CardContent className="flex flex-col items-center gap-3 sm:items-start">
        <div className="rounded-xl bg-white p-4">
          <QRCode value={installUrl} size={180} />
        </div>
        <p className="break-all text-xs text-muted-foreground">{installUrl}</p>
      </CardContent>
    </Card>
  );
}
