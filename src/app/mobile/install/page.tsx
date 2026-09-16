"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Download, Smartphone } from "lucide-react";
import { Suspense } from "react";
import { Button } from "@/components/ui/button";
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
          <strong>Account Number</strong> sa web (avatar sa taas).
        </p>

        <Button className="mt-6 w-full" size="lg" asChild>
          <a href={apkUrl} download="pinoystock-monitor.apk">
            <Download className="mr-2 h-5 w-5" />
            Download APK
          </a>
        </Button>

        {apkMissing ? (
          <p className="mt-4 rounded-lg border border-dashed border-amber-500/40 bg-amber-500/10 px-3 py-3 text-left text-xs text-amber-900 dark:text-amber-200">
            <strong>APK wala pa sa server.</strong> I-upload ang{" "}
            <code className="text-[11px]">pinoystock-monitor.apk</code> sa{" "}
            <code className="text-[11px]">public/downloads/</code> at i-deploy.
          </p>
        ) : (
          <ol className="mt-5 space-y-2 rounded-lg border border-border/60 bg-muted/30 px-4 py-3 text-left text-xs text-muted-foreground">
            <li>
              <strong className="text-foreground">1.</strong> Hintayin ang 100%
              — huwag isara ang browser agad.
            </li>
            <li>
              <strong className="text-foreground">2.</strong> I-tap ang
              notification na <strong>“Download complete”</strong> o buksan ang{" "}
              <strong>Files / Downloads</strong> →{" "}
              <code className="text-[11px]">pinoystock-monitor.apk</code>.
            </li>
            <li>
              <strong className="text-foreground">3.</strong> Pindutin{" "}
              <strong>Install</strong>. Kung blocked: payagan ang browser na
              mag-install ng unknown apps.
            </li>
            <li>
              <strong className="text-foreground">4.</strong> Hanapin sa app
              drawer ang <strong>PinoyStock Monitor</strong> (launcher icon).
            </li>
          </ol>
        )}

        <p className="mt-4 break-all text-[10px] text-muted-foreground">
          {apkUrl}
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
