"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  APK_FILENAME,
  MONITOR_APK_BYTES,
} from "@/lib/monitor-install";

type Props = {
  apkUrl: string;
  autoStart?: boolean;
};

/** Avoid Chrome Android stuck at 100% (pause ring) on direct navigation downloads. */
export function MonitorApkDownloadButton({ apkUrl, autoStart }: Props) {
  const [progress, setProgress] = useState<number | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const started = useRef(false);

  const download = useCallback(async () => {
    if (busy) return;
    setBusy(true);
    setError(null);
    setProgress(0);

    try {
      const res = await fetch(apkUrl, { cache: "no-store" });
      if (!res.ok) {
        throw new Error(`Download failed (${res.status})`);
      }

      const total =
        Number(res.headers.get("content-length")) || MONITOR_APK_BYTES;
      const reader = res.body?.getReader();
      if (!reader) {
        const blob = await res.blob();
        triggerSave(blob);
        setProgress(100);
        return;
      }

      const chunks: Uint8Array[] = [];
      let loaded = 0;

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        if (value) {
          chunks.push(value);
          loaded += value.length;
          setProgress(Math.min(100, Math.round((loaded / total) * 100)));
        }
      }

      const blob = new Blob(chunks as BlobPart[], {
        type: "application/vnd.android.package-archive",
      });

      if (blob.size < MONITOR_APK_BYTES * 0.95) {
        throw new Error(
          `Incomplete file (${(blob.size / 1024 / 1024).toFixed(1)} MB). Try Wi‑Fi.`
        );
      }

      triggerSave(blob);
      setProgress(100);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Download failed");
      setProgress(null);
    } finally {
      setBusy(false);
    }
  }, [apkUrl, busy]);

  useEffect(() => {
    if (!autoStart || started.current) return;
    const ua = navigator.userAgent || "";
    if (!/android/i.test(ua)) return;
    started.current = true;
    void download();
  }, [autoStart, download]);

  return (
    <div className="w-full space-y-3">
      <Button
        type="button"
        className="w-full"
        size="lg"
        disabled={busy}
        onClick={() => void download()}
      >
        <Download className="mr-2 h-5 w-5" />
        {busy
          ? progress != null
            ? `Downloading… ${progress}%`
            : "Preparing…"
          : "Download APK (recommended)"}
      </Button>

      {progress != null && busy ? (
        <div className="h-2 overflow-hidden rounded-full bg-muted">
          <div
            className="h-full bg-indigo-500 transition-all duration-300"
            style={{ width: `${progress}%` }}
          />
        </div>
      ) : null}

      {error ? (
        <p className="text-left text-xs text-red-500">{error}</p>
      ) : null}

      <p className="text-left text-[10px] text-muted-foreground">
        Kung may <strong>pause icon ⏸</strong> sa Downloads: i-tap ang{" "}
        <strong>X</strong> para i-cancel, tapos gamitin ang button sa itaas
        (hindi direktang link). File:{" "}
        <code className="text-[10px]">{APK_FILENAME}</code>
      </p>
    </div>
  );
}

function triggerSave(blob: Blob) {
  const stamp = new Date().toISOString().slice(0, 10).replace(/-/g, "");
  const name = `pinoystock-monitor-${stamp}.apk`;
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = name;
  a.rel = "noopener";
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 60_000);
}
