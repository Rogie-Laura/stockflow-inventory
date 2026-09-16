"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Smartphone } from "lucide-react";
import { Suspense } from "react";
import { MonitorApkDownloadButton } from "@/components/monitor/monitor-apk-download-button";
import { getMonitorApkFileUrl } from "@/lib/monitor-install";

function InstallContent() {
  const searchParams = useSearchParams();
  const apkMissing = searchParams.get("apk") === "missing";
  const [origin, setOrigin] = useState("https://inventorysystem-lemon.vercel.app");

  useEffect(() => {
    setOrigin(window.location.origin);
  }, []);

  const apkUrl = useMemo(() => getMonitorApkFileUrl(origin), [origin]);

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background px-6 py-12">
      <div className="w-full max-w-md rounded-2xl border border-border/60 bg-card p-8 text-center shadow-lg">
        <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-indigo-500 to-violet-600 text-white">
          <Smartphone className="h-8 w-8" />
        </div>
        <h1 className="text-xl font-bold">PinoyStock Monitor</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Sideload APK (walang Play Store). Pag na-install, login gamit ang{" "}
          <strong>10-character Account Number</strong> sa web (avatar) — walang
          password.
        </p>

        {!apkMissing ? (
          <div className="mt-6">
            <MonitorApkDownloadButton apkUrl={apkUrl} />
          </div>
        ) : null}

        {apkMissing ? (
          <p className="mt-4 rounded-lg border border-dashed border-amber-500/40 bg-amber-500/10 px-3 py-3 text-left text-xs text-amber-900 dark:text-amber-200">
            <strong>APK wala pa sa server.</strong> I-upload ang{" "}
            <code className="text-[11px]">pinoystock-monitor.apk</code> sa{" "}
            <code className="text-[11px]">public/downloads/</code> at i-deploy.
          </p>
        ) : (
          <ol className="mt-5 space-y-2 rounded-lg border border-border/60 bg-muted/30 px-4 py-3 text-left text-xs text-muted-foreground">
            <li>
              <strong className="text-foreground">1.</strong> I-delete ang lumang
              pinoystock APK sa Downloads (lalo na kung parsing error).
            </li>
            <li>
              <strong className="text-foreground">2.</strong> I-tap ang download
              button — hintayin ang notification, tapos i-tap ang APK → Install.
            </li>
            <li>
              <strong className="text-foreground">3.</strong> Pag na-install, pindutin{" "}
              <strong>Buksan ang PinoyStock Monitor</strong> sa baba (launcher).
            </li>
          </ol>
        )}

        <Link
          href="/auth/login"
          className="mt-6 inline-block text-sm text-indigo-600 hover:underline dark:text-indigo-400"
        >
          Back to PinoyStock web
        </Link>
      </div>
    </div>
  );
}

export default function MobileInstallPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center">
          Loading…
        </div>
      }
    >
      <InstallContent />
    </Suspense>
  );
}
