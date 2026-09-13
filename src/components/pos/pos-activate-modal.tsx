"use client";

import { useEffect, useState } from "react";
import { Lock, Monitor, User } from "lucide-react";
import type { PosTerminal } from "@/types/store";
import { isTerminalInUse } from "@/lib/pos-session";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

export interface PosActivatePayload {
  terminalId: string;
  operatorName: string;
  pin: string;
}

interface PosActivateModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  terminals: PosTerminal[];
  defaultOperatorName?: string;
  onActivate: (payload: PosActivatePayload) => Promise<{ ok: boolean; error?: string }>;
}

export function PosActivateModal({
  open,
  onOpenChange,
  terminals,
  defaultOperatorName = "",
  onActivate,
}: PosActivateModalProps) {
  const [terminalId, setTerminalId] = useState("");
  const [operatorName, setOperatorName] = useState(defaultOperatorName);
  const [pin, setPin] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (open) {
      setOperatorName(defaultOperatorName);
      setPin("");
      setError("");
      const firstAvailable =
        terminals.find((t) => !isTerminalInUse(t)) ?? terminals[0];
      setTerminalId(firstAvailable?.id ?? "");
    }
  }, [open, defaultOperatorName, terminals]);

  async function handleSubmit() {
    if (!terminalId) {
      setError("Pumili ng POS terminal.");
      return;
    }
    if (operatorName.trim().length < 2) {
      setError("Ilagay ang pangalan ng gagamit ng POS.");
      return;
    }
    if (pin.length < 4) {
      setError("Ilagay ang POS PIN.");
      return;
    }

    const terminal = terminals.find((t) => t.id === terminalId);
    if (terminal && isTerminalInUse(terminal)) {
      setError(`${terminal.code} ginagamit pa ni ${terminal.activeOperator}.`);
      return;
    }

    setLoading(true);
    setError("");
    const result = await onActivate({
      terminalId,
      operatorName: operatorName.trim(),
      pin,
    });
    setLoading(false);

    if (result.ok) {
      onOpenChange(false);
    } else {
      setError(result.error ?? "Hindi ma-activate ang POS.");
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Monitor className="h-5 w-5 text-emerald-500" />
            Activate POS
          </DialogTitle>
          <DialogDescription>
            Piliin ang terminal para sa device na ito, ilagay ang pangalan ng
            cashier, at ang POS PIN. Pag na-activate, POS lang ang access dito.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-2">
          <div className="space-y-2">
            <Label>Piliin ang POS Terminal</Label>
            <div className="grid gap-2">
              {terminals.map((terminal) => {
                const inUse = isTerminalInUse(terminal);
                const selected = terminalId === terminal.id;
                return (
                  <button
                    key={terminal.id}
                    type="button"
                    disabled={inUse}
                    onClick={() => setTerminalId(terminal.id)}
                    className={cn(
                      "flex items-center justify-between rounded-lg border px-3 py-2.5 text-left transition-colors",
                      selected
                        ? "border-emerald-500 bg-emerald-500/10"
                        : "border-border/50 hover:bg-muted/50",
                      inUse && "cursor-not-allowed opacity-60"
                    )}
                  >
                    <div>
                      <p className="font-medium">{terminal.code}</p>
                      <p className="text-xs text-muted-foreground">{terminal.name}</p>
                    </div>
                    {inUse ? (
                      <Badge variant="secondary" className="text-[10px]">
                        In use · {terminal.activeOperator}
                      </Badge>
                    ) : (
                      <Badge className="bg-emerald-600 text-[10px]">Available</Badge>
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="operator-name" className="flex items-center gap-1">
              <User className="h-3.5 w-3.5" />
              Pangalan ng gagamit ng POS
            </Label>
            <Input
              id="operator-name"
              placeholder="hal. Juan, Maria, Ana..."
              value={operatorName}
              onChange={(e) => setOperatorName(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="activate-pin" className="flex items-center gap-1">
              <Lock className="h-3.5 w-3.5" />
              POS PIN
            </Label>
            <Input
              id="activate-pin"
              type="password"
              inputMode="numeric"
              maxLength={8}
              placeholder="4-8 digit PIN"
              value={pin}
              onChange={(e) => setPin(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
            />
          </div>

          {error && <p className="text-sm text-destructive">{error}</p>}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button
            className="bg-gradient-to-r from-emerald-500 to-teal-600"
            onClick={handleSubmit}
            disabled={loading}
          >
            {loading ? "Activating..." : "Activate POS"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
