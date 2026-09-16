"use client";

import { Copy } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useStore } from "@/context/store-context";
import { toast } from "sonner";

export function MonitorAccountLogin() {
  const { accountNumber } = useStore();

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
          Pagkatapos i-install ang APK, ilagay lang ang{" "}
          <strong>10-character Account Number</strong> (letters + numbers). Makikita
          sa avatar (D1) sa taas — walang password sa Monitor app.
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
      </CardContent>
    </Card>
  );
}
