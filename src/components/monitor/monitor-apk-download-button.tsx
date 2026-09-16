"use client";

import { Download, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  APK_FILENAME,
  MONITOR_APK_BYTES,
  MONITOR_APP_OPEN_URL,
  MONITOR_APK_VERSION,
} from "@/lib/monitor-install";

type Props = {
  apkUrl: string;
};

/**
 * Direct CDN download (Chrome download manager). Blob save often causes
 * "problem parsing package" / missing file on Android.
 */
export function MonitorApkDownloadButton({ apkUrl }: Props) {
  const sizeMb = (MONITOR_APK_BYTES / 1024 / 1024).toFixed(1);

  return (
    <div className="w-full space-y-3">
      <Button className="w-full" size="lg" asChild>
        <a
          href={apkUrl}
          download={APK_FILENAME}
          rel="noopener noreferrer"
        >
          <Download className="mr-2 h-5 w-5" />
          I-download ang APK ({sizeMb} MB)
        </a>
      </Button>

      <p className="text-left text-xs text-muted-foreground">
        <strong className="text-foreground">v{MONITOR_APK_VERSION}</strong> — direktang
        download mula sa server (hindi blob). Pagkatapos: buksan ang notification{" "}
        <strong>Download complete</strong> o <strong>Files → Downloads</strong> →
        i-tap <code className="text-[11px]">{APK_FILENAME}</code> → Install.
      </p>

      <p className="text-left text-xs text-amber-800 dark:text-amber-200">
        Kung <strong>“problem parsing the package”</strong>: i-delete lahat ng lumang
        pinoystock APK sa Downloads, download ulit dito. Dapat{" "}
        <strong>{sizeMb} MB</strong> ang file — kung maliit, incomplete pa.
      </p>

      <Button variant="outline" className="w-full" size="lg" asChild>
        <a href={MONITOR_APP_OPEN_URL}>
          <ExternalLink className="mr-2 h-5 w-5" />
          Buksan ang PinoyStock Monitor (pag na-install na)
        </a>
      </Button>
    </div>
  );
}
