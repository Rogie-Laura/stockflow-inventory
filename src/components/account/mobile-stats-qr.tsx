"use client";

import { useEffect, useMemo, useState } from "react";
import QRCode from "react-qr-code";
import { Smartphone } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useStore } from "@/context/store-context";
import { getMobileJoinUrl } from "@/lib/monitor-install";

/** One QR: install + naka-bind sa account na ito (stats lang sa phone). */
export function MobileStatsQr() {
  const { accountNumber } = useStore();
  const [origin, setOrigin] = useState("https://inventorysystem-lemon.vercel.app");

  useEffect(() => {
    setOrigin(window.location.origin);
  }, []);

  const joinUrl = useMemo(() => {
    if (!accountNumber) return "";
    return getMobileJoinUrl(origin, accountNumber);
  }, [origin, accountNumber]);

  return (
    <Card className="border-indigo-500/25 bg-card/80">
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center gap-2 text-base font-semibold">
          <Smartphone className="h-5 w-5 text-indigo-500" />
          Mobile stats (Monitor app)
        </CardTitle>
        <p className="text-sm font-normal text-muted-foreground">
          I-scan ng <strong>camera ng phone</strong> — install ang app at naka-bind
          na sa account mo. Pang-<strong>stats / monitoring</strong> lang; ang POS at
          inventory ay sa web.
        </p>
      </CardHeader>
      <CardContent className="flex flex-col items-center gap-3 sm:flex-row sm:items-start">
        {joinUrl ? (
          <div className="rounded-xl bg-white p-4">
            <QRCode value={joinUrl} size={160} />
          </div>
        ) : null}
        <div className="flex-1 space-y-2 text-sm">
          <p>
            Account:{" "}
            <span className="font-mono text-lg font-bold tracking-widest">
              {accountNumber ?? "—"}
            </span>
          </p>
          <p className="text-xs text-muted-foreground">
            1. Scan → install page → download APK → Install
            <br />
            2. Buksan ang app — auto-login sa account na ito (stats dashboard)
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
