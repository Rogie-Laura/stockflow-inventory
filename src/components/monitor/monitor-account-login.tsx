"use client";

import { useMemo } from "react";
import QRCode from "react-qr-code";
import { Copy } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useStore } from "@/context/store-context";
import { getMonitorAccountQrValue } from "@/lib/monitor-install";
import { toast } from "sonner";

export function MonitorAccountLogin() {
  const { accountNumber } = useStore();

  const accountQr = useMemo(
    () => (accountNumber ? getMonitorAccountQrValue(accountNumber) : ""),
    [accountNumber]
  );

  async function copyNumber() {
    if (!accountNumber) return;
    await navigator.clipboard.writeText(accountNumber);
    toast.success("Na-copy ang account number");
  }

  return (
    <Card className="mt-6 border-emerald-500/25 bg-card/80">
      <CardHeader className="pb-2">
        <CardTitle className="text-base font-semibold">
          Login sa Monitor app
        </CardTitle>
        <p className="text-sm font-normal text-muted-foreground">
          Pagka-install: <strong>account number lang</strong> sa app (OK), o{" "}
          <strong>i-scan</strong> ang QR sa baba / Login QR — walang password.
        </p>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="rounded-lg border border-border/60 bg-muted/40 px-4 py-3">
          <p className="text-xs text-muted-foreground">Iyong account number</p>
          <p className="font-mono text-2xl font-bold tracking-widest">
            {accountNumber ?? "—"}
          </p>
        </div>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={copyNumber}
          disabled={!accountNumber}
        >
          <Copy className="mr-2 h-4 w-4" />
          Copy account number
        </Button>
        {accountQr ? (
          <div className="flex flex-col items-center gap-2 pt-2">
            <p className="text-xs text-muted-foreground">Scan sa app → instant login</p>
            <div className="rounded-xl bg-white p-3">
              <QRCode value={accountQr} size={140} />
            </div>
          </div>
        ) : null}
      </CardContent>
    </Card>
  );
}
