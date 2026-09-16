"use client";

import { useCallback, useEffect, useState } from "react";
import QRCode from "react-qr-code";
import { RefreshCw } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

type PairPayload = {
  v: 1;
  code: string;
  api: string;
};

export function MonitorPairQr() {
  const [payload, setPayload] = useState<PairPayload | null>(null);
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

      const api =
        typeof window !== "undefined"
          ? window.location.origin
          : "https://inventorysystem-lemon.vercel.app";

      setPayload({
        v: 1,
        code: row.code as string,
        api,
      });
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

  const qrValue = payload ? JSON.stringify(payload) : "";

  return (
    <Card className="mt-4 border-emerald-500/25 bg-card/80">
      <CardHeader className="pb-2">
        <CardTitle className="text-base font-semibold">
          Scan para mag-login sa phone
        </CardTitle>
        <p className="text-sm font-normal text-muted-foreground">
          Dapat naka-login ka dito sa web. Buksan ang{" "}
          <strong>PinoyStock Monitor</strong> app →{" "}
          <strong>Scan QR</strong> → same account agad. Bagong code every ~3 min.
        </p>
      </CardHeader>
      <CardContent className="flex flex-col items-center gap-4 sm:flex-row sm:items-start">
        <div className="rounded-xl bg-white p-4">
          {loading && !payload ? (
            <div className="flex h-[180px] w-[180px] items-center justify-center text-sm text-muted-foreground">
              Loading…
            </div>
          ) : payload ? (
            <QRCode value={qrValue} size={180} />
          ) : null}
        </div>
        <div className="flex-1 space-y-3 text-sm">
          {error ? (
            <p className="text-red-500">{error}</p>
          ) : payload ? (
            <>
              <p>
                Manual code:{" "}
                <span className="font-mono text-lg font-bold tracking-widest">
                  {payload.code}
                </span>
              </p>
              {expiresAt ? (
                <p className="text-muted-foreground">
                  Expires: {expiresAt.toLocaleTimeString()}
                </p>
              ) : null}
            </>
          ) : null}
          <p className="text-muted-foreground">
            <strong>Ads:</strong> Unity interstitial sa Flutter app pag naka-set ang{" "}
            <code className="text-xs">UNITY_*_GAME_ID</code> sa{" "}
            <code className="text-xs">mobile/.env</code> (tulad ng Scalper). Hindi
            pa automatic hanggang may valid Unity placements.
          </p>
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
