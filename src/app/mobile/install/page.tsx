"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { Download, Smartphone } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  getMonitorApkUrl,
  getMonitorPlayStoreUrl,
} from "@/lib/monitor-install";

export default function MobileInstallPage() {
  const [attemptedAuto, setAttemptedAuto] = useState(false);

  const playStoreUrl = getMonitorPlayStoreUrl();
  const apkUrl = useMemo(() => {
    if (typeof window === "undefined") return getMonitorApkUrl();
    return getMonitorApkUrl(window.location.origin);
  }, []);

  const downloadUrl = playStoreUrl || apkUrl;

  useEffect(() => {
    if (attemptedAuto || !downloadUrl) return;

    const ua = navigator.userAgent || "";
    const isAndroid = /android/i.test(ua);
    const isIos = /iphone|ipad|ipod/i.test(ua);

    if (isAndroid && apkUrl) {
      setAttemptedAuto(true);
      window.location.href = apkUrl;
      return;
    }

    if (isIos && playStoreUrl) {
      setAttemptedAuto(true);
      window.location.href = playStoreUrl;
    }
  }, [attemptedAuto, apkUrl, playStoreUrl, downloadUrl]);

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background px-6 py-12">
      <div className="w-full max-w-md rounded-2xl border border-border/60 bg-card p-8 text-center shadow-lg">
        <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-indigo-500 to-violet-600 text-white">
          <Smartphone className="h-8 w-8" />
        </div>
        <h1 className="text-xl font-bold">PinoyStock Monitor</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          I-install ang app sa Android. Pagkatapos, sa web Monitor i-scan ang{" "}
          <strong>Login QR</strong> gamit ang app (hindi phone camera).
        </p>

        {downloadUrl ? (
          <Button className="mt-6 w-full" size="lg" asChild>
            <a href={downloadUrl} download={!playStoreUrl}>
              <Download className="mr-2 h-5 w-5" />
              {playStoreUrl ? "Open Play Store" : "Download APK"}
            </a>
          </Button>
        ) : (
          <p className="mt-6 rounded-lg border border-dashed border-amber-500/40 bg-amber-500/10 px-3 py-3 text-sm text-amber-900 dark:text-amber-200">
            APK hindi pa naka-host. Admin: i-upload ang release APK at i-set ang{" "}
            <code className="text-xs">NEXT_PUBLIC_MONITOR_APK_URL</code> sa
            Vercel.
          </p>
        )}

        <p className="mt-6 text-xs text-muted-foreground">
          Kung blocked ang install: Settings → allow install from this browser /
          unknown sources.
        </p>

        <Link
          href="/auth/login"
          className="mt-4 inline-block text-sm text-indigo-600 hover:underline dark:text-indigo-400"
        >
          Back to PinoyStock web
        </Link>
      </div>
    </div>
  );
}
