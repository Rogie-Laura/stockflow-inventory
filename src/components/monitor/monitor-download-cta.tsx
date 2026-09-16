"use client";

import { Smartphone, Share, PlusSquare } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export function MonitorDownloadCta() {
  return (
    <Card className="mt-6 overflow-hidden border-indigo-500/25 bg-gradient-to-br from-indigo-500/10 via-background to-violet-500/10">
      <CardHeader className="pb-2 text-center sm:text-left">
        <div className="mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-indigo-500 to-violet-600 text-white shadow-lg shadow-indigo-500/30 sm:mx-0">
          <Smartphone className="h-7 w-7" />
        </div>
        <CardTitle className="text-xl font-bold tracking-tight">
          Download Monitoring Center on your phone
        </CardTitle>
        <p className="text-sm font-normal text-muted-foreground">
          Sa desktop, summary lang ang makikita. I-install ang Monitoring Center sa
          cellphone para sa kumpletong analytics, live feed, at stock alerts — may
          sponsored content sa app para suportahan ang serbisyo.
        </p>
      </CardHeader>
      <CardContent className="space-y-4">
        <ol className="space-y-3 text-sm">
          <li className="flex gap-3 rounded-lg border border-border/50 bg-card/80 p-3">
            <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-indigo-500/15 text-xs font-bold text-indigo-600 dark:text-indigo-400">
              1
            </span>
            <span>
              Buksan sa phone ang{" "}
              <strong className="text-foreground">Monitor</strong> page ng PinoyStock
              (same account).
            </span>
          </li>
          <li className="flex gap-3 rounded-lg border border-border/50 bg-card/80 p-3">
            <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-indigo-500/15 text-xs font-bold text-indigo-600 dark:text-indigo-400">
              2
            </span>
            <span className="flex items-start gap-2">
              <Share className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" />
              <span>
                Sa <strong>Safari</strong> (iPhone): Share →{" "}
                <strong>Add to Home Screen</strong>. Sa <strong>Chrome</strong>{" "}
                (Android): menu → <strong>Install app</strong> o{" "}
                <strong>Add to Home screen</strong>.
              </span>
            </span>
          </li>
          <li className="flex gap-3 rounded-lg border border-border/50 bg-card/80 p-3">
            <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-indigo-500/15 text-xs font-bold text-indigo-600 dark:text-indigo-400">
              3
            </span>
            <span className="flex items-start gap-2">
              <PlusSquare className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" />
              <span>
                Buksan mula sa home screen — doon lalabas ang buong monitoring
                dashboard.
              </span>
            </span>
          </li>
        </ol>
        <p className="text-center text-xs text-muted-foreground sm:text-left">
          Tip: I-bookmark ang link na ito sa phone para mabilis ma-install.
        </p>
      </CardContent>
    </Card>
  );
}
