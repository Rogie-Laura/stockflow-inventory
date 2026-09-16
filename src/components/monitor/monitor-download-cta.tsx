"use client";

import { Download, Smartphone, Store } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const playStoreUrl = process.env.NEXT_PUBLIC_MONITOR_PLAY_STORE_URL?.trim();
const apkUrl = process.env.NEXT_PUBLIC_MONITOR_APK_URL?.trim();

export function MonitorDownloadCta() {
  const installUrl = playStoreUrl || apkUrl;

  return (
    <Card className="mt-6 overflow-hidden border-indigo-500/25 bg-gradient-to-br from-indigo-500/10 via-background to-violet-500/10">
      <CardHeader className="pb-2 text-center sm:text-left">
        <div className="mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-indigo-500 to-violet-600 text-white shadow-lg shadow-indigo-500/30 sm:mx-0">
          <Smartphone className="h-7 w-7" />
        </div>
        <CardTitle className="text-xl font-bold tracking-tight">
          I-install ang PinoyStock Monitor app sa phone
        </CardTitle>
        <p className="text-sm font-normal text-muted-foreground">
          Walang PWA — dedicated <strong>Flutter</strong> app ang full Monitoring
          Center: charts, live sales, stock alerts, at activity. May{" "}
          <strong>Unity Ads</strong> sa app (tulad ng Scalper) para suportahan ang
          serbisyo. Same login sa web.
        </p>
      </CardHeader>
      <CardContent className="space-y-4">
        {installUrl ? (
          <Button className="w-full sm:w-auto" asChild>
            <a href={installUrl} target="_blank" rel="noopener noreferrer">
              {playStoreUrl ? (
                <>
                  <Store className="mr-2 h-4 w-4" />
                  Download sa Play Store
                </>
              ) : (
                <>
                  <Download className="mr-2 h-4 w-4" />
                  Download Android APK
                </>
              )}
            </a>
          </Button>
        ) : (
          <p className="rounded-lg border border-dashed border-border/60 bg-muted/30 px-3 py-2 text-sm text-muted-foreground">
            Play Store / APK link — set{" "}
            <code className="text-xs">NEXT_PUBLIC_MONITOR_PLAY_STORE_URL</code> o{" "}
            <code className="text-xs">NEXT_PUBLIC_MONITOR_APK_URL</code> sa Vercel
            pag live na ang app.
          </p>
        )}

        <ol className="space-y-3 text-sm">
          <li className="flex gap-3 rounded-lg border border-border/50 bg-card/80 p-3">
            <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-indigo-500/15 text-xs font-bold text-indigo-600 dark:text-indigo-400">
              1
            </span>
            <span>
              I-install ang <strong>PinoyStock Monitor</strong> mula sa Play Store
              o APK (dev build mula sa <code className="text-xs">mobile/</code>{" "}
              folder — tingnan <code className="text-xs">mobile/README.md</code>).
            </span>
          </li>
          <li className="flex gap-3 rounded-lg border border-border/50 bg-card/80 p-3">
            <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-indigo-500/15 text-xs font-bold text-indigo-600 dark:text-indigo-400">
              2
            </span>
            <span>
              Sign in gamit ang <strong>same email/password</strong> ng PinoyStock
              web (admin o supervisor account).
            </span>
          </li>
          <li className="flex gap-3 rounded-lg border border-border/50 bg-card/80 p-3">
            <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-indigo-500/15 text-xs font-bold text-indigo-600 dark:text-indigo-400">
              3
            </span>
            <span>
              Buksan ang app — lalabas ang buong dashboard; sponsored messages via
              Unity Ads on open.
            </span>
          </li>
        </ol>
      </CardContent>
    </Card>
  );
}
