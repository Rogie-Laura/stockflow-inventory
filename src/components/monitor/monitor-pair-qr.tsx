"use client";

import { useCallback, useEffect, useState } from "react";
import QRCode from "react-qr-code";
import { RefreshCw } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getMonitorPairUrl } from "@/lib/monitor-install";

export function MonitorPairQr() {
  const [pairUrl, setPairUrl] = useState<string | null>(null);
  const [code, setCode] = useState<string | null>(null);
  const [expiresAt, setExpiresAt] = useState<Date | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const supabase = createClient();
      const { data, error: rpcError } = await supabase.rpc(
        "inv_create_mobile_pairing"
      );

      if (rpcError) {
        setError(rpcError.message);
        return;
      }

      const row = Array.isArray(data) ? data[0] : data;
      if (!row?.code) {
        setError("Could not create pairing code");
        return;
      }

      const origin =
        typeof window !== "undefined"
          ? window.location.origin
          : "https://inventorysystem-lemon.vercel.app";

      const pairingCode = row.code as string;
      setCode(pairingCode);
      setPairUrl(getMonitorPairUrl(origin, pairingCode));
      setExpiresAt(new Date(row.expires_at as string));
    } catch (e) {
      setError(e instanceof Error ? e.message : "Pairing failed");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refresh();
    const interval = setInterval(refresh, 150_000);
    return () => clearInterval(interval);
  }, [refresh]);

  const qrValue = pairUrl ?? "";

  return (
    <Card className="mt-6 border-emerald-500/25 bg-card/80">
      <CardHeader className="pb-2">
        <CardTitle className="text-base font-semibold">
          Login QR
        </CardTitle>
        <p className="text-sm font-normal text-muted-foreground">
          Puwedeng i-scan ng camera (bubuksan ang link) o sa app → Scan QR.
          Bagong code ~3 min.
        </p>
      </CardHeader>
      <CardContent className="flex flex-col items-center gap-4 sm:flex-row sm:items-start">
        <div className="rounded-xl bg-white p-4">
          {loading && !pairUrl ? (
            <div className="flex h-[180px] w-[180px] items-center justify-center text-sm text-muted-foreground">
              Loading…
            </div>
          ) : pairUrl ? (
            <QRCode value={qrValue} size={180} />
          ) : null}
        </div>
        <div className="flex-1 space-y-3 text-sm">
          {error ? (
            <p className="text-red-500">{error}</p>
          ) : code ? (
            <>
              <p>
                Manual code:{" "}
                <span className="font-mono text-lg font-bold tracking-widest">
                  {code}
                </span>
              </p>
              {expiresAt ? (
                <p className="text-muted-foreground">
                  Expires: {expiresAt.toLocaleTimeString()}
                </p>
              ) : null}
            </>
          ) : null}
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={refresh}
            disabled={loading}
          >
            <RefreshCw className="mr-2 h-4 w-4" />
            New QR
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
