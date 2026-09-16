"use client";

import { useEffect, useMemo, Suspense } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Smartphone } from "lucide-react";
import { Button } from "@/components/ui/button";
import { getMonitorPairDeepLink } from "@/lib/monitor-install";

function PairContent() {
  const params = useSearchParams();
  const code = params.get("c")?.trim().toUpperCase() ?? "";
  const origin =
    typeof window !== "undefined"
      ? window.location.origin
      : "https://inventorysystem-lemon.vercel.app";

  const deepLink = useMemo(() => {
    if (!code) return "";
    return getMonitorPairDeepLink(code, origin);
  }, [code, origin]);

  useEffect(() => {
    if (!deepLink) return;
    const t = window.setTimeout(() => {
      window.location.href = deepLink;
    }, 400);
    return () => window.clearTimeout(t);
  }, [deepLink]);

  if (!code) {
    return (
      <p className="text-sm text-muted-foreground">
        Invalid link. Bumalik sa web Monitor at i-scan ang tamang Login QR.
      </p>
    );
  }

  return (
    <>
      <p className="mt-2 text-sm text-muted-foreground">
        Binubuksan ang PinoyStock Monitor app para mag-login bilang same account
        sa web.
      </p>
      <p className="mt-4 font-mono text-2xl font-bold tracking-widest">{code}</p>
      <Button className="mt-6 w-full" size="lg" asChild>
        <a href={deepLink}>Buksan sa app</a>
      </Button>
      <p className="mt-4 text-xs text-muted-foreground">
        Kung hindi bumukas: i-install muna ang APK mula sa Install QR, tapos
        subukan ulit o sa app pindutin Scan QR.
      </p>
      <Link
        href="/mobile/install"
        className="mt-4 inline-block text-sm text-indigo-600 hover:underline dark:text-indigo-400"
      >
        Download APK
      </Link>
    </>
  );
}

export default function MobilePairPage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background px-6 py-12">
      <div className="w-full max-w-md rounded-2xl border border-border/60 bg-card p-8 text-center shadow-lg">
        <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-600 text-white">
          <Smartphone className="h-8 w-8" />
        </div>
        <h1 className="text-xl font-bold">Login sa Monitor app</h1>
        <Suspense fallback={<p className="mt-4 text-sm">Loading…</p>}>
          <PairContent />
        </Suspense>
      </div>
    </div>
  );
}
