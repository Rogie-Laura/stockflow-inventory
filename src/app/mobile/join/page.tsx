"use client";

import { useEffect, useMemo, useState, Suspense } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Smartphone } from "lucide-react";
import { MonitorApkDownloadButton } from "@/components/monitor/monitor-apk-download-button";
import { Button } from "@/components/ui/button";
import {
  getMonitorAccountQrValue,
  getMonitorApkFileUrl,
  normalizeJoinAccountNumber,
} from "@/lib/monitor-install";

function JoinContent() {
  const searchParams = useSearchParams();
  const rawN = searchParams.get("n") ?? "";
  const accountNumber = useMemo(
    () => normalizeJoinAccountNumber(rawN),
    [rawN]
  );
  const [origin, setOrigin] = useState("https://inventorysystem-lemon.vercel.app");
  useEffect(() => {
    setOrigin(window.location.origin);
  }, []);

  const apkUrl = useMemo(() => getMonitorApkFileUrl(origin), [origin]);

  const openAppUrl = accountNumber
    ? getMonitorAccountQrValue(accountNumber)
    : null;

  if (!accountNumber) {
    return (
      <div className="flex min-h-screen items-center justify-center px-6">
        <p className="text-center text-sm text-muted-foreground">
          Invalid o missing account link. Kunin ang QR sa web → Settings o Monitor.
        </p>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background px-6 py-12">
      <div className="w-full max-w-md rounded-2xl border border-border/60 bg-card p-8 text-center shadow-lg">
        <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-indigo-500 to-violet-600 text-white">
          <Smartphone className="h-8 w-8" />
        </div>
        <h1 className="text-xl font-bold">PinoyStock Monitor</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Naka-bind sa account{" "}
          <span className="font-mono font-semibold">{accountNumber}</span> — stats
          lang sa phone.
        </p>

        <div className="mt-6">
          <MonitorApkDownloadButton apkUrl={apkUrl} />
        </div>

        {openAppUrl ? (
          <Button className="mt-3 w-full" variant="secondary" size="lg" asChild>
            <a href={openAppUrl}>Buksan app (naka-login na)</a>
          </Button>
        ) : null}

        <p className="mt-4 text-left text-xs text-muted-foreground">
          Pag na-install na dati, ang button sa itaas ang magbubukas ng app at
          mag-login sa account na ito. Walang password.
        </p>

        <Link
          href="/auth/login"
          className="mt-6 inline-block text-sm text-indigo-600 hover:underline dark:text-indigo-400"
        >
          PinoyStock web
        </Link>
      </div>
    </div>
  );
}

export default function MobileJoinPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center">
          Loading…
        </div>
      }
    >
      <JoinContent />
    </Suspense>
  );
}
